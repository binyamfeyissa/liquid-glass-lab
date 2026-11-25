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

import {
  PLAYLIST_SEEDS,
  TRACKS,
  artistOf,
  trackById,
  type PlaylistSeed,
} from "./data";

/**
 * Waveform's whole state lives in this one in-memory store — no backend,
 * no persistence, no audio. "Playback" is a one-second timer that
 * advances the position of the current track; reaching the end moves
 * through the queue exactly the way the shuffle/repeat settings say.
 * Restarting the app resets everything to the fixtures below.
 */

export type RepeatMode = "off" | "all" | "one";

/** The three backgrounds: graphite dark, broken-white light, palm photo. */
export type BackdropMode = "dark" | "light" | "image";

export interface Playlist extends PlaylistSeed {
  userCreated?: boolean;
}

export interface HistoryEntry {
  id: string;
  trackId: string;
  /** Seconds actually listened — the tick adds one per second played. */
  seconds: number;
  whenLabel: string;
}

/** The reserved id of the automatic Liked Songs playlist. */
export const LIKED_PLAYLIST_ID = "liked";

interface TunesState {
  /* Playback */
  currentTrackId: string | null;
  isPlaying: boolean;
  position: number;
  /** The list the queue was built from (a playlist, search results…). */
  contextIds: string[];
  /** Effective play order — shuffled when shuffle is on. */
  queue: string[];
  queueIndex: number;
  shuffle: boolean;
  repeat: RepeatMode;
  playTrack: (trackId: string, contextIds?: string[]) => void;
  togglePlay: () => void;
  next: (manual?: boolean) => void;
  prev: () => void;
  seek: (seconds: number) => void;
  jumpToQueueIndex: (index: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;

  /* Library */
  likedIds: string[];
  isLiked: (trackId: string) => boolean;
  toggleLike: (trackId: string) => void;
  playlists: Playlist[];
  playlistById: (id: string) => Playlist | undefined;
  createPlaylist: (name: string) => Playlist;
  addToPlaylist: (playlistId: string, trackId: string) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;

  /* History + search */
  history: HistoryEntry[];
  /** Unique track ids, most recently played first. */
  recentTrackIds: string[];
  totalListenedSeconds: number;
  topGenre: string | null;
  recentSearches: string[];
  recordSearch: (query: string) => void;

  /* Settings */
  userName: string;
  backdrop: BackdropMode;
  setBackdrop: (value: BackdropMode) => void;
  /** Derived: true unless the backdrop is the broken-white light mode. */
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  downloadQuality: string;
  setDownloadQuality: (value: string) => void;
  notifyNewReleases: boolean;
  setNotifyNewReleases: (value: boolean) => void;
  notifyPlaylistUpdates: boolean;
  setNotifyPlaylistUpdates: (value: boolean) => void;
  notifyWeeklyRecap: boolean;
  setNotifyWeeklyRecap: (value: boolean) => void;
}

const TunesContext = createContext<TunesState | null>(null);

/** Deterministic shuffle so a session feels stable between renders. */
function shuffled(ids: string[], seed: number): string[] {
  const out = [...ids];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) % 2147483648;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Builds the effective queue for a context, honouring shuffle. */
function buildQueue(
  contextIds: string[],
  startId: string,
  shuffleOn: boolean,
  seed: number,
): { queue: string[]; index: number } {
  if (!shuffleOn) {
    return { queue: contextIds, index: Math.max(0, contextIds.indexOf(startId)) };
  }
  const rest = contextIds.filter((id) => id !== startId);
  return { queue: [startId, ...shuffled(rest, seed)], index: 0 };
}

const SEED_HISTORY: HistoryEntry[] = [
  { id: "h1", trackId: "t7", seconds: 264, whenLabel: "Yesterday" },
  { id: "h2", trackId: "t13", seconds: 287, whenLabel: "Yesterday" },
  { id: "h3", trackId: "t4", seconds: 198, whenLabel: "Yesterday" },
  { id: "h4", trackId: "t1", seconds: 214, whenLabel: "Mon" },
  { id: "h5", trackId: "t10", seconds: 176, whenLabel: "Mon" },
  { id: "h6", trackId: "t15", seconds: 243, whenLabel: "Sun" },
];

const SEED_LIKED = ["t1", "t6", "t9", "t13"];

let historyCounter = 0;

export function TunesProvider({ children }: { children: ReactNode }) {
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [contextIds, setContextIds] = useState<string[]>([]);
  const [queue, setQueue] = useState<string[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");

  const [likedIds, setLikedIds] = useState<string[]>(SEED_LIKED);
  const [playlists, setPlaylists] = useState<Playlist[]>(PLAYLIST_SEEDS);
  const [history, setHistory] = useState<HistoryEntry[]>(SEED_HISTORY);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "Nova Reyes",
    "jazz piano",
  ]);

  const [userName] = useState("Alex Morgan");
  const [backdrop, setBackdrop] = useState<BackdropMode>("dark");
  const darkMode = backdrop !== "light";
  const setDarkMode = useCallback((value: boolean) => {
    setBackdrop(value ? "dark" : "light");
  }, []);
  const [downloadQuality, setDownloadQuality] = useState("high");
  const [notifyNewReleases, setNotifyNewReleases] = useState(true);
  const [notifyPlaylistUpdates, setNotifyPlaylistUpdates] = useState(false);
  const [notifyWeeklyRecap, setNotifyWeeklyRecap] = useState(true);

  /* ---------------------------------------------------------------- */
  /*  Playback engine                                                  */
  /* ---------------------------------------------------------------- */

  const startAt = useCallback(
    (nextQueue: string[], index: number, context: string[]) => {
      const trackId = nextQueue[index];
      if (!trackId) return;
      setQueue(nextQueue);
      setQueueIndex(index);
      setContextIds(context);
      setCurrentTrackId(trackId);
      setPosition(0);
      setIsPlaying(true);
      historyCounter += 1;
      const entryId = `live-${historyCounter}`;
      setHistory((h) => [
        { id: entryId, trackId, seconds: 0, whenLabel: "Now" },
        ...h,
      ]);
    },
    [],
  );

  const playTrack = useCallback(
    (trackId: string, context?: string[]) => {
      const ctx =
        context && context.length > 0 ? context : TRACKS.map((t) => t.id);
      const { queue: q, index } = buildQueue(
        ctx,
        trackId,
        shuffle,
        Date.now() % 100000,
      );
      startAt(q, index, ctx);
    },
    [shuffle, startAt],
  );

  const advance = useCallback(
    (auto: boolean) => {
      if (!currentTrackId) return;
      if (auto && repeat === "one") {
        setPosition(0);
        setIsPlaying(true);
        return;
      }
      const nextIndex = queueIndex + 1;
      if (nextIndex < queue.length) {
        startAt(queue, nextIndex, contextIds);
      } else if (repeat === "all" || !auto) {
        // Repeat-all wraps on its own; a manual "next" on the last track
        // wraps too, so the button never feels dead.
        startAt(queue, 0, contextIds);
      } else {
        // End of the queue with repeat off: stop on the last track.
        setIsPlaying(false);
        setPosition(0);
      }
    },
    [contextIds, currentTrackId, queue, queueIndex, repeat, startAt],
  );

  const prev = useCallback(() => {
    if (!currentTrackId) return;
    if (position > 3) {
      setPosition(0);
      return;
    }
    const prevIndex = queueIndex - 1;
    if (prevIndex >= 0) startAt(queue, prevIndex, contextIds);
    else startAt(queue, queue.length - 1, contextIds);
  }, [contextIds, currentTrackId, position, queue, queueIndex, startAt]);

  const togglePlay = useCallback(() => {
    if (!currentTrackId) {
      playTrack(TRACKS[0].id);
      return;
    }
    setIsPlaying((p) => !p);
  }, [currentTrackId, playTrack]);

  const seek = useCallback((seconds: number) => {
    setPosition(Math.max(0, Math.floor(seconds)));
  }, []);

  const jumpToQueueIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < queue.length) startAt(queue, index, contextIds);
    },
    [contextIds, queue, startAt],
  );

  const toggleShuffle = useCallback(() => {
    setShuffle((on) => {
      const nextOn = !on;
      if (currentTrackId && contextIds.length > 0) {
        const { queue: q, index } = buildQueue(
          contextIds,
          currentTrackId,
          nextOn,
          Date.now() % 100000,
        );
        setQueue(q);
        setQueueIndex(index);
      }
      return nextOn;
    });
  }, [contextIds, currentTrackId]);

  const cycleRepeat = useCallback(() => {
    setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off"));
  }, []);

  /* The one-second heartbeat: advance position, credit listening time,
     and auto-advance when a track runs out. */
  const engineRef = useRef({ advance, currentTrackId, position });
  engineRef.current = { advance, currentTrackId, position };

  useEffect(() => {
    if (!isPlaying || !currentTrackId) return;
    const timer = setInterval(() => {
      const { advance: adv, currentTrackId: tid, position: pos } =
        engineRef.current;
      if (!tid) return;
      const duration = trackById(tid).duration;
      if (pos + 1 >= duration) {
        adv(true);
        return;
      }
      setPosition(pos + 1);
      setHistory((h) => {
        const head = h[0];
        if (!head || head.trackId !== tid) return h;
        return [{ ...head, seconds: head.seconds + 1 }, ...h.slice(1)];
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, currentTrackId]);

  /* ---------------------------------------------------------------- */
  /*  Library                                                          */
  /* ---------------------------------------------------------------- */

  const isLiked = useCallback(
    (trackId: string) => likedIds.includes(trackId),
    [likedIds],
  );

  const toggleLike = useCallback((trackId: string) => {
    setLikedIds((ids) =>
      ids.includes(trackId)
        ? ids.filter((id) => id !== trackId)
        : [trackId, ...ids],
    );
  }, []);

  const playlistById = useCallback(
    (id: string) => playlists.find((p) => p.id === id),
    [playlists],
  );

  const createPlaylist = useCallback((name: string): Playlist => {
    const created: Playlist = {
      id: `pl-user-${Date.now()}`,
      name: name.trim(),
      description: "Your playlist",
      trackIds: [],
      colors: ["#0ea5e9", "#7c3aed"],
      userCreated: true,
    };
    setPlaylists((ps) => [created, ...ps]);
    return created;
  }, []);

  const addToPlaylist = useCallback((playlistId: string, trackId: string) => {
    setPlaylists((ps) =>
      ps.map((p) =>
        p.id === playlistId && !p.trackIds.includes(trackId)
          ? { ...p, trackIds: [...p.trackIds, trackId] }
          : p,
      ),
    );
  }, []);

  const removeFromPlaylist = useCallback(
    (playlistId: string, trackId: string) => {
      if (playlistId === LIKED_PLAYLIST_ID) {
        setLikedIds((ids) => ids.filter((id) => id !== trackId));
        return;
      }
      setPlaylists((ps) =>
        ps.map((p) =>
          p.id === playlistId
            ? { ...p, trackIds: p.trackIds.filter((id) => id !== trackId) }
            : p,
        ),
      );
    },
    [],
  );

  /* ---------------------------------------------------------------- */
  /*  History + search                                                 */
  /* ---------------------------------------------------------------- */

  const recordSearch = useCallback((query: string) => {
    const q = query.trim();
    if (!q) return;
    setRecentSearches((rs) => [q, ...rs.filter((r) => r !== q)].slice(0, 6));
  }, []);

  const recentTrackIds = useMemo(() => {
    const seen: string[] = [];
    for (const entry of history) {
      if (!seen.includes(entry.trackId)) seen.push(entry.trackId);
    }
    return seen;
  }, [history]);

  const totalListenedSeconds = useMemo(
    () => history.reduce((sum, e) => sum + e.seconds, 0),
    [history],
  );

  const topGenre = useMemo(() => {
    const byGenre = new Map<string, number>();
    for (const entry of history) {
      const genre = trackById(entry.trackId).genre;
      byGenre.set(genre, (byGenre.get(genre) ?? 0) + entry.seconds);
    }
    let best: string | null = null;
    let bestSeconds = 0;
    for (const [genre, seconds] of byGenre) {
      if (seconds > bestSeconds) {
        best = genre;
        bestSeconds = seconds;
      }
    }
    return best;
  }, [history]);

  const value: TunesState = {
    currentTrackId,
    isPlaying,
    position,
    contextIds,
    queue,
    queueIndex,
    shuffle,
    repeat,
    playTrack,
    togglePlay,
    // Manual skips ignore repeat-one; the engine calls advance(true).
    next: (manual = true) => advance(!manual),
    prev,
    seek,
    jumpToQueueIndex,
    toggleShuffle,
    cycleRepeat,
    likedIds,
    isLiked,
    toggleLike,
    playlists,
    playlistById,
    createPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    history,
    recentTrackIds,
    totalListenedSeconds,
    topGenre,
    recentSearches,
    recordSearch,
    userName,
    backdrop,
    setBackdrop,
    darkMode,
    setDarkMode,
    downloadQuality,
    setDownloadQuality,
    notifyNewReleases,
    setNotifyNewReleases,
    notifyPlaylistUpdates,
    setNotifyPlaylistUpdates,
    notifyWeeklyRecap,
    setNotifyWeeklyRecap,
  };

  return <TunesContext.Provider value={value}>{children}</TunesContext.Provider>;
}

export function useTunes(): TunesState {
  const ctx = useContext(TunesContext);
  if (!ctx) throw new Error("useTunes must be used inside <TunesProvider>");
  return ctx;
}

export { artistOf, trackById };
