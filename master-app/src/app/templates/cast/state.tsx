import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useLocalSearchParams } from "expo-router";

import {
  EPISODES,
  SPEED_OPTIONS,
  episodeById,
  episodesOfShow,
} from "./data";

/**
 * Airwave's whole state lives in this one in-memory store — no backend,
 * no persistence, no audio. "Playback" is a 250 ms timer that advances
 * the position of the current episode by the selected speed; reaching
 * the end marks the episode played, credits the listening time, and
 * pulls the next episode from the up-next queue. Downloads are faked
 * the same way: a fast interval fills their progress over ~2 seconds.
 * Restarting the app resets everything to the fixtures below.
 */

export type BackdropMode = "dark" | "light" | "image";

export interface HistoryEntry {
  id: string;
  episodeId: string;
  /** Content seconds actually listened — the tick credits them. */
  seconds: number;
  whenLabel: string;
}

interface CastState {
  /* Playback */
  currentEpisodeId: string | null;
  isPlaying: boolean;
  position: number;
  speed: number;
  speedIndex: number;
  setSpeedIndex: (index: number) => void;
  playEpisode: (episodeId: string) => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  skipBy: (deltaSeconds: number) => void;
  nextEpisode: () => void;
  prevEpisode: () => void;
  markPlayed: (episodeId: string) => void;
  markUnplayed: (episodeId: string) => void;

  /* Sleep timer — value is "off" | "10" | "20" | "30" | "episode" */
  sleepTimer: string;
  sleepRemainingSec: number | null;
  setSleepTimer: (value: string) => void;

  /* Per-episode progress + played */
  progressOf: (episodeId: string) => number;
  isPlayed: (episodeId: string) => boolean;
  playedIds: string[];
  /** Episodes with a saved position that aren't finished, newest first. */
  inProgressIds: string[];

  /* Follows */
  followedShowIds: string[];
  isFollowing: (showId: string) => boolean;
  toggleFollow: (showId: string) => void;

  /* Downloads — progress 0–100; >= 100 means downloaded */
  downloadProgressOf: (episodeId: string) => number | undefined;
  isDownloaded: (episodeId: string) => boolean;
  startDownload: (episodeId: string) => void;
  removeDownload: (episodeId: string) => void;
  downloadedIds: string[];
  downloadedMB: number;

  /* Up-next queue */
  queue: string[];
  addToQueue: (episodeId: string) => void;
  removeFromQueue: (episodeId: string) => void;
  isQueued: (episodeId: string) => boolean;

  /* History + stats */
  history: HistoryEntry[];
  totalListenedSeconds: number;
  episodesCompleted: number;

  /* Settings */
  userName: string;
  /** Bundled portrait of the signed-in user. */
  userImage: number;
  backdrop: BackdropMode;
  setBackdrop: (value: BackdropMode) => void;
  /** Derived: true unless the backdrop is the broken-white light mode. */
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  autoDownload: boolean;
  setAutoDownload: (value: boolean) => void;
  notifyNewEpisodes: boolean;
  setNotifyNewEpisodes: (value: boolean) => void;
  notifyDownloads: boolean;
  setNotifyDownloads: (value: boolean) => void;
  notifyWeeklyRecap: boolean;
  setNotifyWeeklyRecap: (value: boolean) => void;
}

const CastContext = createContext<CastState | null>(null);

const SEED_PROGRESS: Record<string, number> = {
  "dd-4": 620,
  "co-3": 1470,
  "sm-3": 300,
};

const SEED_PLAYED = ["dd-1", "dd-2", "co-1", "sm-1", "lg-1"];

const SEED_DOWNLOADS: Record<string, number> = {
  "dd-3": 100,
  "sm-2": 100,
};

const SEED_HISTORY: HistoryEntry[] = [
  { id: "h1", episodeId: "dd-4", seconds: 620, whenLabel: "Today" },
  { id: "h2", episodeId: "co-3", seconds: 1470, whenLabel: "Yesterday" },
  { id: "h3", episodeId: "sm-1", seconds: 1560, whenLabel: "Yesterday" },
  { id: "h4", episodeId: "dd-2", seconds: 2580, whenLabel: "Mon" },
  { id: "h5", episodeId: "lg-1", seconds: 2280, whenLabel: "Sun" },
  { id: "h6", episodeId: "sm-3", seconds: 300, whenLabel: "Sun" },
];

let historyCounter = 0;

export function CastProvider({ children }: { children: ReactNode }) {
  const [currentEpisodeId, setCurrentEpisodeId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [speedIndex, setSpeedIndexState] = useState(1); // 1×

  const [progress, setProgress] = useState<Record<string, number>>(SEED_PROGRESS);
  const [playedIds, setPlayedIds] = useState<string[]>(SEED_PLAYED);
  const [followedShowIds, setFollowedShowIds] = useState<string[]>([
    "deep-dive",
    "slow-mornings",
  ]);
  const [downloads, setDownloads] = useState<Record<string, number>>(SEED_DOWNLOADS);
  const [queue, setQueue] = useState<string[]>(["lg-4", "fn-4"]);
  const [history, setHistory] = useState<HistoryEntry[]>(SEED_HISTORY);

  const [sleepTimer, setSleepTimerState] = useState("off");
  const [sleepRemainingSec, setSleepRemainingSec] = useState<number | null>(null);

  const [userName] = useState("Alex Morgan");
  // The host (template list) passes its current backdrop mode as a route
  // param (`backdrop`) when opening a template, so the template opens on
  // the same background the owner just picked. Standalone there is no
  // param and the template keeps its dark default. Read once on mount
  // (lazy initialiser) so navigating inside the template never resets it.
  const params = useLocalSearchParams();
  const [backdrop, setBackdrop] = useState<BackdropMode>(() => {
    const p = params.backdrop;
    const v = Array.isArray(p) ? p[0] : p;
    return v === "dark" || v === "light" || v === "image" ? v : "dark";
  });
  const darkMode = backdrop !== "light";
  const setDarkMode = useCallback((value: boolean) => {
    setBackdrop(value ? "dark" : "light");
  }, []);
  const [autoDownload, setAutoDownload] = useState(false);
  const [notifyNewEpisodes, setNotifyNewEpisodes] = useState(true);
  const [notifyDownloads, setNotifyDownloads] = useState(true);
  const [notifyWeeklyRecap, setNotifyWeeklyRecap] = useState(false);

  const speed = SPEED_OPTIONS[speedIndex] ?? 1;

  /* ---------------------------------------------------------------- */
  /*  Playback engine                                                  */
  /* ---------------------------------------------------------------- */

  /** Saves the outgoing episode's resume point before switching. */
  const saveProgress = useCallback(
    (episodeId: string | null, atPosition: number) => {
      if (!episodeId) return;
      setProgress((p) => {
        if (playedIds.includes(episodeId)) return p;
        if (atPosition <= 5) {
          const next = { ...p };
          delete next[episodeId];
          return next;
        }
        return { ...p, [episodeId]: Math.floor(atPosition) };
      });
    },
    [playedIds],
  );

  const playEpisode = useCallback(
    (episodeId: string) => {
      // Re-tapping the current episode just resumes it.
      if (episodeId === currentEpisodeId) {
        setIsPlaying(true);
        return;
      }
      saveProgress(currentEpisodeId, position);
      const resume = playedIds.includes(episodeId)
        ? 0
        : (progress[episodeId] ?? 0);
      setCurrentEpisodeId(episodeId);
      setPosition(resume);
      setIsPlaying(true);
      historyCounter += 1;
      const entryId = `live-${historyCounter}`;
      setHistory((h) => [
        { id: entryId, episodeId, seconds: 0, whenLabel: "Now" },
        ...h,
      ]);
    },
    [currentEpisodeId, playedIds, position, progress, saveProgress],
  );

  const finishCurrent = useCallback(() => {
    if (!currentEpisodeId) return;
    const finishedId = currentEpisodeId;
    setPlayedIds((ids) =>
      ids.includes(finishedId) ? ids : [finishedId, ...ids],
    );
    setProgress((p) => {
      const next = { ...p };
      delete next[finishedId];
      return next;
    });
    setPosition(0);

    if (sleepTimer === "episode") {
      // "End of episode" sleep timer: stop here, don't roll on.
      setIsPlaying(false);
      setSleepTimerState("off");
      return;
    }
    if (queue.length > 0) {
      const [head, ...rest] = queue;
      setQueue(rest);
      // Load the queue head without pushing a duplicate history entry —
      // playEpisode handles that, so just call it on the next tick.
      setTimeout(() => playEpisodeRef.current(head), 0);
      setIsPlaying(false);
      return;
    }
    setIsPlaying(false);
  }, [currentEpisodeId, queue, sleepTimer]);

  const playEpisodeRef = useRef(playEpisode);
  playEpisodeRef.current = playEpisode;
  const finishRef = useRef(finishCurrent);
  finishRef.current = finishCurrent;

  const togglePlay = useCallback(() => {
    if (!currentEpisodeId) {
      playEpisode(EPISODES[0].id);
      return;
    }
    setIsPlaying((p) => !p);
  }, [currentEpisodeId, playEpisode]);

  const seek = useCallback(
    (seconds: number) => {
      if (!currentEpisodeId) return;
      const duration = episodeById(currentEpisodeId).duration;
      setPosition(Math.min(Math.max(0, Math.floor(seconds)), duration));
    },
    [currentEpisodeId],
  );

  const skipBy = useCallback(
    (deltaSeconds: number) => {
      if (!currentEpisodeId) return;
      const duration = episodeById(currentEpisodeId).duration;
      const nextPos = position + deltaSeconds;
      if (nextPos >= duration) {
        finishCurrent();
        return;
      }
      setPosition(Math.max(0, nextPos));
    },
    [currentEpisodeId, finishCurrent, position],
  );

  const nextEpisode = useCallback(() => {
    if (!currentEpisodeId) return;
    if (queue.length > 0) {
      const [head, ...rest] = queue;
      setQueue(rest);
      playEpisode(head);
      return;
    }
    const current = episodeById(currentEpisodeId);
    const siblings = episodesOfShow(current.showId);
    const idx = siblings.findIndex((e) => e.id === current.id);
    const next = siblings[idx + 1];
    if (next) playEpisode(next.id);
  }, [currentEpisodeId, playEpisode, queue]);

  const prevEpisode = useCallback(() => {
    if (!currentEpisodeId) return;
    if (position > 10) {
      setPosition(0);
      return;
    }
    const current = episodeById(currentEpisodeId);
    const siblings = episodesOfShow(current.showId);
    const idx = siblings.findIndex((e) => e.id === current.id);
    const prev = siblings[idx - 1];
    if (prev) playEpisode(prev.id);
    else setPosition(0);
  }, [currentEpisodeId, playEpisode, position]);

  const markPlayed = useCallback(
    (episodeId: string) => {
      setPlayedIds((ids) =>
        ids.includes(episodeId) ? ids : [episodeId, ...ids],
      );
      setProgress((p) => {
        const next = { ...p };
        delete next[episodeId];
        return next;
      });
      if (episodeId === currentEpisodeId) {
        setIsPlaying(false);
        setPosition(0);
      }
    },
    [currentEpisodeId],
  );

  const markUnplayed = useCallback((episodeId: string) => {
    setPlayedIds((ids) => ids.filter((id) => id !== episodeId));
  }, []);

  const setSpeedIndex = useCallback((index: number) => {
    setSpeedIndexState(Math.max(0, Math.min(index, SPEED_OPTIONS.length - 1)));
  }, []);

  /* The heartbeat: a 250 ms tick advancing the position by the speed,
     crediting listening time and running the sleep timer down. */
  const engineRef = useRef({ finishCurrent, currentEpisodeId, position });
  engineRef.current = { finishCurrent, currentEpisodeId, position };

  useEffect(() => {
    if (!isPlaying || !currentEpisodeId) return;
    const timer = setInterval(() => {
      const { finishCurrent: finish, currentEpisodeId: eid, position: pos } =
        engineRef.current;
      if (!eid) return;
      const duration = episodeById(eid).duration;
      const advanceBy = 0.25 * speed;
      if (pos + advanceBy >= duration) {
        // Credit the final stretch, then finish.
        setHistory((h) => {
          const head = h[0];
          if (!head || head.episodeId !== eid) return h;
          return [
            { ...head, seconds: head.seconds + Math.max(0, duration - pos) },
            ...h.slice(1),
          ];
        });
        finish();
        return;
      }
      setPosition(pos + advanceBy);
      setHistory((h) => {
        const head = h[0];
        if (!head || head.episodeId !== eid) return h;
        return [{ ...head, seconds: head.seconds + advanceBy }, ...h.slice(1)];
      });
      // Sleep timer counts down in real seconds while playing.
      setSleepRemainingSec((remaining) => {
        if (remaining === null) return null;
        const next = remaining - 0.25;
        if (next <= 0) {
          setIsPlaying(false);
          setSleepTimerState("off");
          return null;
        }
        return next;
      });
    }, 250);
    return () => clearInterval(timer);
  }, [isPlaying, currentEpisodeId, speed]);

  /* ---------------------------------------------------------------- */
  /*  Sleep timer                                                      */
  /* ---------------------------------------------------------------- */

  const setSleepTimer = useCallback((value: string) => {
    setSleepTimerState(value);
    if (value === "off" || value === "episode") {
      setSleepRemainingSec(null);
    } else {
      setSleepRemainingSec(Number(value) * 60);
    }
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Follows                                                          */
  /* ---------------------------------------------------------------- */

  const isFollowing = useCallback(
    (showId: string) => followedShowIds.includes(showId),
    [followedShowIds],
  );

  const startDownload = useCallback((episodeId: string) => {
    setDownloads((d) => {
      if (d[episodeId] !== undefined) return d;
      return { ...d, [episodeId]: 1 };
    });
  }, []);

  const toggleFollow = useCallback(
    (showId: string) => {
      const following = followedShowIds.includes(showId);
      setFollowedShowIds((ids) =>
        following ? ids.filter((id) => id !== showId) : [showId, ...ids],
      );
      // Auto-download: following a show grabs its newest episode.
      if (!following && autoDownload) {
        const eps = episodesOfShow(showId);
        const newest = eps[eps.length - 1];
        if (newest) startDownload(newest.id);
      }
    },
    [autoDownload, followedShowIds, startDownload],
  );

  /* ---------------------------------------------------------------- */
  /*  Downloads — a fast interval fills progress over ~2 seconds.      */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const anyInFlight = Object.values(downloads).some((v) => v > 0 && v < 100);
    if (!anyInFlight) return;
    const timer = setInterval(() => {
      setDownloads((d) => {
        const next = { ...d };
        for (const key of Object.keys(next)) {
          if (next[key] > 0 && next[key] < 100) {
            next[key] = Math.min(100, next[key] + 5);
          }
        }
        return next;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [downloads]);

  const downloadProgressOf = useCallback(
    (episodeId: string) => downloads[episodeId],
    [downloads],
  );

  const isDownloaded = useCallback(
    (episodeId: string) => (downloads[episodeId] ?? 0) >= 100,
    [downloads],
  );

  const removeDownload = useCallback((episodeId: string) => {
    setDownloads((d) => {
      const next = { ...d };
      delete next[episodeId];
      return next;
    });
  }, []);

  const downloadedIds = useMemo(
    () => Object.keys(downloads).filter((id) => downloads[id] >= 100),
    [downloads],
  );

  const downloadedMB = useMemo(
    () =>
      downloadedIds.reduce((sum, id) => sum + episodeById(id).sizeMB, 0),
    [downloadedIds],
  );

  /* ---------------------------------------------------------------- */
  /*  Queue                                                            */
  /* ---------------------------------------------------------------- */

  const addToQueue = useCallback((episodeId: string) => {
    setQueue((q) => (q.includes(episodeId) ? q : [...q, episodeId]));
  }, []);

  const removeFromQueue = useCallback((episodeId: string) => {
    setQueue((q) => q.filter((id) => id !== episodeId));
  }, []);

  const isQueued = useCallback(
    (episodeId: string) => queue.includes(episodeId),
    [queue],
  );

  /* ---------------------------------------------------------------- */
  /*  Derived progress + stats                                         */
  /* ---------------------------------------------------------------- */

  const progressOf = useCallback(
    (episodeId: string) => {
      if (episodeId === currentEpisodeId) return position;
      return progress[episodeId] ?? 0;
    },
    [currentEpisodeId, position, progress],
  );

  const isPlayed = useCallback(
    (episodeId: string) => playedIds.includes(episodeId),
    [playedIds],
  );

  const inProgressIds = useMemo(() => {
    const seen: string[] = [];
    for (const entry of history) {
      const id = entry.episodeId;
      if (seen.includes(id)) continue;
      seen.push(id);
    }
    // Anything with a saved position counts, even if it's old history.
    for (const id of Object.keys(progress)) {
      if (!seen.includes(id)) seen.push(id);
    }
    return seen.filter(
      (id) => (progress[id] ?? 0) > 0 && !playedIds.includes(id),
    );
  }, [history, playedIds, progress]);

  const totalListenedSeconds = useMemo(
    () => history.reduce((sum, e) => sum + e.seconds, 0),
    [history],
  );

  const value: CastState = {
    currentEpisodeId,
    isPlaying,
    position,
    speed,
    speedIndex,
    setSpeedIndex,
    playEpisode,
    togglePlay,
    seek,
    skipBy,
    nextEpisode,
    prevEpisode,
    markPlayed,
    markUnplayed,
    sleepTimer,
    sleepRemainingSec,
    setSleepTimer,
    progressOf,
    isPlayed,
    playedIds,
    inProgressIds,
    followedShowIds,
    isFollowing,
    toggleFollow,
    downloadProgressOf,
    isDownloaded,
    startDownload,
    removeDownload,
    downloadedIds,
    downloadedMB,
    queue,
    addToQueue,
    removeFromQueue,
    isQueued,
    history,
    totalListenedSeconds,
    episodesCompleted: playedIds.length,
    userName,
    userImage: require("./assets/img/alex-morgan.jpg"),
    backdrop,
    setBackdrop,
    darkMode,
    setDarkMode,
    autoDownload,
    setAutoDownload,
    notifyNewEpisodes,
    setNotifyNewEpisodes,
    notifyDownloads,
    setNotifyDownloads,
    notifyWeeklyRecap,
    setNotifyWeeklyRecap,
  };

  return <CastContext.Provider value={value}>{children}</CastContext.Provider>;
}

export function useCast(): CastState {
  const ctx = useContext(CastContext);
  if (!ctx) throw new Error("useCast must be used inside <CastProvider>");
  return ctx;
}

export { episodeById, showById } from "./data";
