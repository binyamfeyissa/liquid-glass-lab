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
  TITLES,
  allEpisodes,
  firstPlayable,
  playableDuration,
  playableSizeMB,
  titleById,
  type Maturity,
  type Title,
} from "./data";

/**
 * Lumen Play's whole state lives in this one in-memory store — no
 * backend, no persistence, no video. "Playback" is a one-second timer
 * that advances the position of the current playable (a film, or one
 * episode of a series) and writes that position straight back into the
 * progress map, which is why Resume works from every screen. Restarting
 * the app resets everything to the fixtures below.
 */

export type BackdropMode = "dark" | "light" | "image";

export interface DownloadEntry {
  status: "downloading" | "done";
  /** 0–100 while downloading. */
  pct: number;
}

export interface ResumeTarget {
  playableId: string;
  position: number;
  /** "Play", "Resume" or "Watch again". */
  verb: string;
  /** "S1 E2 · Low Water" for a series, "Film" for a movie. */
  detail: string;
}

interface StreamState {
  /* Playback */
  currentPlayableId: string | null;
  isPlaying: boolean;
  position: number;
  /** The playable that just ran out, so the player can offer Up Next. */
  endedPlayableId: string | null;
  playPlayable: (playableId: string) => void;
  playTitle: (title: Title) => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  skipBy: (deltaSeconds: number) => void;

  /* Progress */
  progressOf: (playableId: string) => number;
  isFinished: (playableId: string) => boolean;
  resumeForTitle: (title: Title) => ResumeTarget;
  /** In-progress playables, most recently played first. */
  continueWatching: { playableId: string; position: number }[];
  titlesFinished: number;
  totalWatchedSeconds: number;

  /* My List */
  myListIds: string[];
  isInMyList: (titleId: string) => boolean;
  toggleMyList: (titleId: string) => void;

  /* Downloads */
  downloads: Record<string, DownloadEntry>;
  startDownload: (playableId: string) => void;
  removeDownload: (playableId: string) => void;
  downloadedSizeMB: number;

  /* Profile + settings */
  viewerName: string;
  /** Bundled portrait of the signed-in viewer, for the profile avatar. */
  viewerImage: number;
  setViewerName: (name: string) => void;
  maturity: Maturity;
  setMaturity: (value: Maturity) => void;
  quality: string;
  setQuality: (value: string) => void;
  autoplayNext: boolean;
  setAutoplayNext: (value: boolean) => void;
  backdrop: BackdropMode;
  setBackdrop: (value: BackdropMode) => void;
  /** Derived from backdrop (dark unless Light) — threads isDark everywhere. */
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  notifyNewReleases: boolean;
  setNotifyNewReleases: (value: boolean) => void;
  notifyRecommendations: boolean;
  setNotifyRecommendations: (value: boolean) => void;
}

const StreamContext = createContext<StreamState | null>(null);

const SEED_PROGRESS: Record<string, number> = {
  "hl-s1e1": 2820, // finished
  "hl-s1e2": 1710, // ~62% through
  "orb-s1e1": 940, // ~30% through
  "last-cartographer": 3190, // ~45% through
};

const SEED_FINISHED = ["hl-s1e1"];

const SEED_RECENT = ["orb-s1e1", "hl-s1e2", "last-cartographer", "hl-s1e1"];

const SEED_MY_LIST = ["orbital", "night-kitchen", "deep-field", "cold-trail"];

const SEED_DOWNLOADS: Record<string, DownloadEntry> = {
  "hl-s1e3": { status: "done", pct: 100 },
};

export function StreamProvider({ children }: { children: ReactNode }) {
  const [currentPlayableId, setCurrentPlayableId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [endedPlayableId, setEndedPlayableId] = useState<string | null>(null);

  const [progress, setProgress] = useState<Record<string, number>>(SEED_PROGRESS);
  const [finishedIds, setFinishedIds] = useState<string[]>(SEED_FINISHED);
  const [recentIds, setRecentIds] = useState<string[]>(SEED_RECENT);
  const [myListIds, setMyListIds] = useState<string[]>(SEED_MY_LIST);
  const [downloads, setDownloads] = useState<Record<string, DownloadEntry>>(SEED_DOWNLOADS);

  const [viewerName, setViewerName] = useState("Alex Rivera");
  const [maturity, setMaturity] = useState<Maturity>("adult");
  const [quality, setQuality] = useState("auto");
  const [autoplayNext, setAutoplayNext] = useState(true);
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
  const [notifyNewReleases, setNotifyNewReleases] = useState(true);
  const [notifyRecommendations, setNotifyRecommendations] = useState(false);

  /* ---------------------------------------------------------------- */
  /*  Playback                                                         */
  /* ---------------------------------------------------------------- */

  const playPlayable = useCallback(
    (playableId: string) => {
      const startAt = finishedIds.includes(playableId)
        ? 0
        : (progress[playableId] ?? 0);
      setCurrentPlayableId(playableId);
      setPosition(startAt);
      setIsPlaying(true);
      setEndedPlayableId(null);
      setRecentIds((ids) => [playableId, ...ids.filter((id) => id !== playableId)]);
    },
    [finishedIds, progress],
  );

  const resumeForTitle = useCallback(
    (title: Title): ResumeTarget => {
      if (title.kind === "movie") {
        const pos = progress[title.id] ?? 0;
        if (finishedIds.includes(title.id)) {
          return { playableId: title.id, position: 0, verb: "Watch again", detail: "Film" };
        }
        return {
          playableId: title.id,
          position: pos,
          verb: pos > 0 ? "Resume" : "Play",
          detail: "Film",
        };
      }
      const episodes = allEpisodes(title);
      const next = episodes.find((ep) => !finishedIds.includes(ep.id));
      if (!next) {
        const first = episodes[0];
        return {
          playableId: first.id,
          position: 0,
          verb: "Watch again",
          detail: "From S1 E1",
        };
      }
      const ref = title.seasons
        ?.flatMap((s) => s.episodes.map((e) => ({ s, e })))
        .find((x) => x.e.id === next.id);
      const seasonNo = ref?.s.number ?? 1;
      const epNo = ref ? ref.s.episodes.indexOf(next) + 1 : 1;
      const pos = progress[next.id] ?? 0;
      return {
        playableId: next.id,
        position: pos,
        verb: pos > 0 ? "Resume" : "Play",
        detail: `S${seasonNo} E${epNo} · ${next.title}`,
      };
    },
    [finishedIds, progress],
  );

  const playTitle = useCallback(
    (title: Title) => {
      playPlayable(resumeForTitle(title).playableId);
    },
    [playPlayable, resumeForTitle],
  );

  const finishCurrent = useCallback((playableId: string) => {
    const duration = playableDuration(playableId);
    setProgress((p) => ({ ...p, [playableId]: duration }));
    setFinishedIds((ids) =>
      ids.includes(playableId) ? ids : [...ids, playableId],
    );
    setIsPlaying(false);
    setPosition(duration);
    setEndedPlayableId(playableId);
  }, []);

  const togglePlay = useCallback(() => {
    if (!currentPlayableId) {
      const featured = TITLES.find((t) => t.featured) ?? TITLES[0];
      playTitle(featured);
      return;
    }
    if (endedPlayableId === currentPlayableId) {
      // Pressing play on the end card restarts the same playable.
      setPosition(0);
      setProgress((p) => ({ ...p, [currentPlayableId]: 0 }));
      setEndedPlayableId(null);
      setIsPlaying(true);
      return;
    }
    setIsPlaying((p) => !p);
  }, [currentPlayableId, endedPlayableId, playTitle]);

  const seek = useCallback(
    (seconds: number) => {
      if (!currentPlayableId) return;
      const duration = playableDuration(currentPlayableId);
      const clamped = Math.min(duration, Math.max(0, Math.floor(seconds)));
      setPosition(clamped);
      setProgress((p) => ({ ...p, [currentPlayableId]: clamped }));
      if (clamped < duration) setEndedPlayableId(null);
    },
    [currentPlayableId],
  );

  const skipBy = useCallback(
    (deltaSeconds: number) => {
      seek(position + deltaSeconds);
    },
    [position, seek],
  );

  /* The one-second heartbeat: advance the position, mirror it into the
     progress map (that is what makes Resume work everywhere), and run
     the finish sequence when a playable runs out. */
  const engineRef = useRef({ currentPlayableId, position, finishCurrent });
  engineRef.current = { currentPlayableId, position, finishCurrent };

  useEffect(() => {
    if (!isPlaying || !currentPlayableId) return;
    const timer = setInterval(() => {
      const { currentPlayableId: id, position: pos, finishCurrent: finish } =
        engineRef.current;
      if (!id) return;
      const duration = playableDuration(id);
      if (pos + 1 >= duration) {
        finish(id);
        return;
      }
      setPosition(pos + 1);
      setProgress((p) => ({ ...p, [id]: pos + 1 }));
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, currentPlayableId]);

  /* ---------------------------------------------------------------- */
  /*  Downloads — simulated: a timer fills each in-flight download     */
  /*  over about two seconds, then it lands as "done".                 */
  /* ---------------------------------------------------------------- */

  const startDownload = useCallback((playableId: string) => {
    setDownloads((d) => {
      if (d[playableId]) return d;
      return { ...d, [playableId]: { status: "downloading", pct: 0 } };
    });
  }, []);

  const removeDownload = useCallback((playableId: string) => {
    setDownloads((d) => {
      const next = { ...d };
      delete next[playableId];
      return next;
    });
  }, []);

  const anyDownloading = Object.values(downloads).some(
    (d) => d.status === "downloading",
  );

  useEffect(() => {
    if (!anyDownloading) return;
    const timer = setInterval(() => {
      setDownloads((d) => {
        const next: Record<string, DownloadEntry> = {};
        for (const [id, entry] of Object.entries(d)) {
          if (entry.status === "downloading") {
            const pct = Math.min(100, entry.pct + 10);
            next[id] =
              pct >= 100 ? { status: "done", pct: 100 } : { status: "downloading", pct };
          } else {
            next[id] = entry;
          }
        }
        return next;
      });
    }, 200);
    return () => clearInterval(timer);
  }, [anyDownloading]);

  /* ---------------------------------------------------------------- */
  /*  Derived library state                                            */
  /* ---------------------------------------------------------------- */

  const progressOf = useCallback(
    (playableId: string) => progress[playableId] ?? 0,
    [progress],
  );

  const isFinished = useCallback(
    (playableId: string) => finishedIds.includes(playableId),
    [finishedIds],
  );

  const isInMyList = useCallback(
    (titleId: string) => myListIds.includes(titleId),
    [myListIds],
  );

  const toggleMyList = useCallback((titleId: string) => {
    setMyListIds((ids) =>
      ids.includes(titleId) ? ids.filter((id) => id !== titleId) : [titleId, ...ids],
    );
  }, []);

  const continueWatching = useMemo(
    () =>
      recentIds
        .filter((id) => !finishedIds.includes(id) && (progress[id] ?? 0) > 0)
        .map((id) => ({ playableId: id, position: progress[id] ?? 0 })),
    [finishedIds, progress, recentIds],
  );

  const titlesFinished = useMemo(
    () =>
      TITLES.filter((t) =>
        t.kind === "movie"
          ? finishedIds.includes(t.id)
          : allEpisodes(t).every((ep) => finishedIds.includes(ep.id)),
      ).length,
    [finishedIds],
  );

  const totalWatchedSeconds = useMemo(
    () => Object.values(progress).reduce((sum, s) => sum + s, 0),
    [progress],
  );

  const downloadedSizeMB = useMemo(
    () =>
      Object.entries(downloads)
        .filter(([, d]) => d.status === "done")
        .reduce((sum, [id]) => sum + playableSizeMB(id), 0),
    [downloads],
  );

  const value: StreamState = {
    currentPlayableId,
    isPlaying,
    position,
    endedPlayableId,
    playPlayable,
    playTitle,
    togglePlay,
    seek,
    skipBy,
    progressOf,
    isFinished,
    resumeForTitle,
    continueWatching,
    titlesFinished,
    totalWatchedSeconds,
    myListIds,
    isInMyList,
    toggleMyList,
    downloads,
    startDownload,
    removeDownload,
    downloadedSizeMB,
    viewerName,
    viewerImage: require("./assets/img/alex-rivera.jpg"),
    setViewerName,
    maturity,
    setMaturity,
    quality,
    setQuality,
    autoplayNext,
    setAutoplayNext,
    backdrop,
    setBackdrop,
    darkMode,
    setDarkMode,
    notifyNewReleases,
    setNotifyNewReleases,
    notifyRecommendations,
    setNotifyRecommendations,
  };

  return <StreamContext.Provider value={value}>{children}</StreamContext.Provider>;
}

export function useStream(): StreamState {
  const ctx = useContext(StreamContext);
  if (!ctx) throw new Error("useStream must be used inside <StreamProvider>");
  return ctx;
}

export { firstPlayable, titleById };
