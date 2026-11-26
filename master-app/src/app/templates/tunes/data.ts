/**
 * Waveform's catalogue: fictional artists, albums and tracks. Everything
 * is a fixture — playback is simulated in the store, no audio files and
 * no network. Each track carries two colours used to compose its album
 * art (overlapping glass blobs over a tinted panel — no image assets).
 */

export interface Artist {
  id: string;
  name: string;
  /** Bundled portrait, shown in the artist header avatar. */
  image?: number;
  /** Monthly listeners, pre-formatted for display. */
  listeners: string;
  bio: string;
  colors: [string, string];
}

export interface Track {
  id: string;
  title: string;
  /** Bundled album art for this track's album (same file for every track on the album). */
  image?: number;
  artistId: string;
  album: string;
  genre: string;
  /** Length in seconds. */
  duration: number;
  /** Lifetime plays, pre-formatted for display. */
  plays: string;
  /** Release year — "New releases" is the catalogue sorted by this. */
  year: number;
  colors: [string, string];
}

export interface PlaylistSeed {
  id: string;
  name: string;
  /** Bundled cover image for the playlist. */
  image?: number;
  description: string;
  trackIds: string[];
  colors: [string, string];
}

export const ARTISTS: Artist[] = [
  {
    id: "nova-reyes",
    image: require("./assets/img/artist-nova-reyes.jpg"),
    name: "Nova Reyes",
    listeners: "4.2M",
    bio: "Berlin-based producer blending synth-pop hooks with late-night club textures. Aurora Lines, her third album, was recorded in a converted lighthouse studio on the Baltic coast.",
    colors: ["#7c3aed", "#db2777"],
  },
  {
    id: "marlowe",
    image: require("./assets/img/artist-marlowe.jpg"),
    name: "Marlowe",
    listeners: "1.8M",
    bio: "Indie-folk duo from Vermont. Marlowe write songs the way people keep field journals — close, plain and quietly observant — and record them in one take whenever they can.",
    colors: ["#b45309", "#65a30d"],
  },
  {
    id: "june-castellan",
    image: require("./assets/img/artist-june-castellan.jpg"),
    name: "June Castellan",
    listeners: "960K",
    bio: "Jazz pianist and bandleader. June's trio has held a Friday residency at the Velvet Room for six years; the albums are tracked live to tape, audience and all.",
    colors: ["#1d4ed8", "#0e7490"],
  },
  {
    id: "kairo",
    image: require("./assets/img/artist-kairo.jpg"),
    name: "KAIRO",
    listeners: "2.6M",
    bio: "South London rapper and producer. KAIRO builds beats from field recordings of the city — bus brakes, market crowds, rain on awnings — and District Nine is his love letter to it.",
    colors: ["#dc2626", "#ea580c"],
  },
  {
    id: "elif-soyer",
    image: require("./assets/img/artist-elif-soyer.jpg"),
    name: "Elif Soyer",
    listeners: "1.1M",
    bio: "Composer and pianist from Istanbul working between ambient and modern classical. Her pieces are built from long, patient piano lines over tape loops and room tone.",
    colors: ["#0f766e", "#2563eb"],
  },
];

export const TRACKS: Track[] = [
  { id: "t1", title: "Glass Horizon", artistId: "nova-reyes", album: "Aurora Lines", image: require("./assets/img/album-aurora-lines.jpg"), genre: "Electronic", duration: 214, plays: "18.4M", year: 2026, colors: ["#7c3aed", "#06b6d4"] },
  { id: "t2", title: "Midnight Static", artistId: "nova-reyes", album: "Aurora Lines", image: require("./assets/img/album-aurora-lines.jpg"), genre: "Electronic", duration: 187, plays: "11.2M", year: 2026, colors: ["#4c1d95", "#db2777"] },
  { id: "t3", title: "Ultraviolet", artistId: "nova-reyes", album: "Neon Bloom", image: require("./assets/img/album-neon-bloom.jpg"), genre: "Pop", duration: 203, plays: "22.7M", year: 2025, colors: ["#db2777", "#f59e0b"] },
  { id: "t4", title: "Slow Parade", artistId: "marlowe", album: "Field Notes", image: require("./assets/img/album-field-notes.jpg"), genre: "Indie", duration: 226, plays: "6.9M", year: 2025, colors: ["#b45309", "#84cc16"] },
  { id: "t5", title: "Cedar & Smoke", artistId: "marlowe", album: "Field Notes", image: require("./assets/img/album-field-notes.jpg"), genre: "Indie", duration: 198, plays: "5.1M", year: 2025, colors: ["#92400e", "#65a30d"] },
  { id: "t6", title: "Half-Light", artistId: "marlowe", album: "Golden Hour EP", image: require("./assets/img/album-golden-hour.jpg"), genre: "Indie", duration: 176, plays: "8.3M", year: 2026, colors: ["#f59e0b", "#ef4444"] },
  { id: "t7", title: "Blue Room", artistId: "june-castellan", album: "Velvet Hour", image: require("./assets/img/album-velvet-hour.jpg"), genre: "Jazz", duration: 264, plays: "3.4M", year: 2024, colors: ["#1d4ed8", "#38bdf8"] },
  { id: "t8", title: "Smoke Signal", artistId: "june-castellan", album: "Velvet Hour", image: require("./assets/img/album-velvet-hour.jpg"), genre: "Jazz", duration: 231, plays: "2.8M", year: 2024, colors: ["#1e3a8a", "#0e7490"] },
  { id: "t9", title: "Nightcap", artistId: "june-castellan", album: "After Midnight", image: require("./assets/img/album-after-midnight.jpg"), genre: "Jazz", duration: 205, plays: "4.6M", year: 2026, colors: ["#312e81", "#7c3aed"] },
  { id: "t10", title: "Concrete Garden", artistId: "kairo", album: "District Nine", image: require("./assets/img/album-district-nine.jpg"), genre: "Hip-Hop", duration: 192, plays: "14.9M", year: 2026, colors: ["#dc2626", "#f59e0b"] },
  { id: "t11", title: "Low Orbit", artistId: "kairo", album: "District Nine", image: require("./assets/img/album-district-nine.jpg"), genre: "Hip-Hop", duration: 218, plays: "9.7M", year: 2026, colors: ["#991b1b", "#ea580c"] },
  { id: "t12", title: "Payday", artistId: "kairo", album: "Corner Shop Singles", image: require("./assets/img/album-corner-shop.jpg"), genre: "Hip-Hop", duration: 174, plays: "12.3M", year: 2025, colors: ["#ea580c", "#facc15"] },
  { id: "t13", title: "Tide Lines", artistId: "elif-soyer", album: "Still Water", image: require("./assets/img/album-still-water.jpg"), genre: "Ambient", duration: 312, plays: "5.8M", year: 2025, colors: ["#0f766e", "#38bdf8"] },
  { id: "t14", title: "Weightless", artistId: "elif-soyer", album: "Still Water", image: require("./assets/img/album-still-water.jpg"), genre: "Ambient", duration: 287, plays: "4.2M", year: 2025, colors: ["#155e75", "#2563eb"] },
  { id: "t15", title: "First Snow, Late", artistId: "elif-soyer", album: "Piano Works", image: require("./assets/img/album-piano-works.jpg"), genre: "Classical", duration: 243, plays: "3.9M", year: 2026, colors: ["#334155", "#94a3b8"] },
  { id: "t16", title: "Paper Planes", artistId: "nova-reyes", album: "Neon Bloom", image: require("./assets/img/album-neon-bloom.jpg"), genre: "Pop", duration: 189, plays: "16.1M", year: 2025, colors: ["#ec4899", "#8b5cf6"] },
  { id: "t17", title: "Ember Days", artistId: "marlowe", album: "Golden Hour EP", image: require("./assets/img/album-golden-hour.jpg"), genre: "Indie", duration: 211, plays: "4.4M", year: 2026, colors: ["#c2410c", "#f59e0b"] },
  { id: "t18", title: "Northbound", artistId: "kairo", album: "Corner Shop Singles", image: require("./assets/img/album-corner-shop.jpg"), genre: "Electronic", duration: 201, plays: "7.5M", year: 2024, colors: ["#7f1d1d", "#dc2626"] },
];

export const GENRES = [
  "All",
  "Electronic",
  "Indie",
  "Jazz",
  "Hip-Hop",
  "Pop",
  "Ambient",
  "Classical",
];

export const PLAYLIST_SEEDS: PlaylistSeed[] = [
  {
    id: "pl-drive",
    image: require("./assets/img/playlist-morning-drive.jpg"),
    name: "Morning Drive",
    description: "Sun-up songs for the road in.",
    trackIds: ["t4", "t17", "t6", "t16", "t3"],
    colors: ["#f59e0b", "#ef4444"],
  },
  {
    id: "pl-focus",
    image: require("./assets/img/playlist-deep-focus.jpg"),
    name: "Deep Focus",
    description: "Long, patient instrumentals for getting things done.",
    trackIds: ["t13", "t14", "t15", "t7"],
    colors: ["#0f766e", "#2563eb"],
  },
  {
    id: "pl-night",
    image: require("./assets/img/playlist-night-run.jpg"),
    name: "Night Run",
    description: "After-dark energy — synths, bass and city noise.",
    trackIds: ["t1", "t2", "t10", "t11", "t18"],
    colors: ["#7c3aed", "#dc2626"],
  },
  {
    id: "pl-sunday",
    image: require("./assets/img/playlist-slow-sunday.jpg"),
    name: "Slow Sunday",
    description: "Jazz and quiet corners for a day with no plans.",
    trackIds: ["t8", "t9", "t5", "t13"],
    colors: ["#1d4ed8", "#b45309"],
  },
];

/** Bundled cover for the automatic Liked Songs playlist (no seed entry). */
export const LIKED_SONGS_IMAGE: number = require("./assets/img/playlist-liked-songs.jpg");

export const QUALITY_OPTIONS = [
  { label: "Standard · 128 kbps", value: "standard" },
  { label: "High · 256 kbps", value: "high" },
  { label: "Lossless · FLAC", value: "lossless" },
];

export function trackById(id: string): Track {
  return TRACKS.find((t) => t.id === id) ?? TRACKS[0];
}

export function artistById(id: string): Artist {
  return ARTISTS.find((a) => a.id === id) ?? ARTISTS[0];
}

export function artistOf(track: Track): Artist {
  return artistById(track.artistId);
}

/** "3:34" from a second count. */
export function formatTime(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** "1 h 12 min" / "42 min" from a second count — for playlist totals. */
export function formatLongDuration(totalSec: number): string {
  const minutes = Math.round(totalSec / 60);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

/** Initials for composed artwork, e.g. "Glass Horizon" -> "GH". */
export function initialsOfTitle(title: string): string {
  return title
    .split(/\s+/)
    .filter((w) => /[A-Za-z0-9]/.test(w.charAt(0)))
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}
