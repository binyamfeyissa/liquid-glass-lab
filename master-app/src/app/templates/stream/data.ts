/**
 * Lumen Play's catalogue: fictional films and series. Everything is a
 * fixture — playback is simulated in the store, there are no video files
 * and no network. Each title carries two colours and one bundled
 * royalty-free photo; the artwork shows the photo, with the flat tonal
 * plate composed from the colours as the fallback.
 *
 * A "playable" is the unit playback and progress attach to: for a movie
 * it is the title itself (playable id = title id); for a series it is an
 * episode (playable id = episode id).
 */

import type { ImageSourcePropType } from "react-native";

export type Maturity = "family" | "teen" | "adult";

export interface Episode {
  id: string;
  title: string;
  synopsis: string;
  /** Length in seconds. */
  duration: number;
  /** Download size in MB. */
  sizeMB: number;
}

export interface Season {
  number: number;
  episodes: Episode[];
}

export interface Title {
  id: string;
  /** Bundled poster-style photo; the tonal plate is the fallback. */
  image: ImageSourcePropType;
  name: string;
  kind: "movie" | "series";
  year: number;
  /** Display rating label, e.g. "PG-13" or "TV-MA". */
  rating: string;
  /** Maturity band the profile setting filters on. */
  maturity: Maturity;
  genres: string[];
  synopsis: string;
  cast: string[];
  creator: string;
  colors: [string, string];
  /** Movies only: runtime in seconds. */
  duration?: number;
  /** Movies only: download size in MB. */
  sizeMB?: number;
  /** Series only. */
  seasons?: Season[];
  /** Lower sorts earlier in the Trending rail. */
  trendingRank?: number;
  featured?: boolean;
}

export const TITLES: Title[] = [
  {
    id: "harbor-lights",
    image: require("./assets/img/harbor-lights.jpg"),
    name: "Harbor Lights",
    kind: "series",
    year: 2024,
    rating: "TV-14",
    maturity: "teen",
    genres: ["Drama"],
    synopsis:
      "Three generations of the Ferro family run a struggling ferry company on a cold northern harbour. When a rival line moves in and the patriarch's old charts surface, every crossing becomes a negotiation between loyalty and survival.",
    cast: ["Maren Ellison", "Tomas Ferro", "June Okafor"],
    creator: "Created by Ada Lindqvist",
    colors: ["#1d4ed8", "#0e7490"],
    trendingRank: 2,
    featured: true,
    seasons: [
      {
        number: 1,
        episodes: [
          { id: "hl-s1e1", title: "First Crossing", synopsis: "Ana Ferro returns home to find the family ferry line one bad season from closing.", duration: 2820, sizeMB: 640 },
          { id: "hl-s1e2", title: "Low Water", synopsis: "A grounded boat and a missing ledger force Ana and her brother into an uneasy truce.", duration: 2760, sizeMB: 620 },
          { id: "hl-s1e3", title: "The Ledger", synopsis: "June finds the old charts — and a route the family was never meant to sail.", duration: 2880, sizeMB: 655 },
          { id: "hl-s1e4", title: "Storm Season", synopsis: "The rival line makes its move as the worst storm in a decade closes in.", duration: 2940, sizeMB: 670 },
        ],
      },
      {
        number: 2,
        episodes: [
          { id: "hl-s2e1", title: "After the Storm", synopsis: "The harbour counts the cost, and an inspector arrives with questions.", duration: 2700, sizeMB: 610 },
          { id: "hl-s2e2", title: "Two Captains", synopsis: "Ana takes the wheel; her father refuses to leave the bridge.", duration: 2790, sizeMB: 630 },
          { id: "hl-s2e3", title: "Night Ferry", synopsis: "A stranger books the last crossing and asks for a destination that isn't on any map.", duration: 2850, sizeMB: 645 },
          { id: "hl-s2e4", title: "Harbor Lights", synopsis: "The family votes on the company's future as the lights come on across the water.", duration: 3000, sizeMB: 690 },
        ],
      },
    ],
  },
  {
    id: "orbital",
    image: require("./assets/img/orbital.jpg"),
    name: "Orbital",
    kind: "series",
    year: 2026,
    rating: "TV-14",
    maturity: "teen",
    genres: ["Sci-fi", "Drama"],
    synopsis:
      "A salvage crew working the debris rings above Earth pulls a sealed capsule from a dead station — and every agency on the planet wants to know what's inside. Tense, quiet, human science fiction.",
    cast: ["Ruth Calloway", "Ilya Petrov", "Sam Adeyemi"],
    creator: "Created by Dana Reyes",
    colors: ["#312e81", "#0ea5e9"],
    trendingRank: 1,
    seasons: [
      {
        number: 1,
        episodes: [
          { id: "orb-s1e1", title: "Debris Field", synopsis: "The crew of the Kestrel finds something that should not exist in a decaying orbit.", duration: 3120, sizeMB: 720 },
          { id: "orb-s1e2", title: "The Capsule", synopsis: "Ground control orders the capsule sealed. Ruth opens it anyway.", duration: 3060, sizeMB: 705 },
          { id: "orb-s1e3", title: "Weightless", synopsis: "A hull breach turns a routine burn into a countdown nobody rehearsed.", duration: 3180, sizeMB: 735 },
        ],
      },
      {
        number: 2,
        episodes: [
          { id: "orb-s2e1", title: "Second Signal", synopsis: "The signal repeats — from somewhere much closer than before.", duration: 3090, sizeMB: 715 },
          { id: "orb-s2e2", title: "Ground Truth", synopsis: "Ilya returns to Earth and finds the official story has already been written.", duration: 3150, sizeMB: 725 },
          { id: "orb-s2e3", title: "The Long Way Down", synopsis: "One seat, three crew, and a capsule that was never meant to land.", duration: 3300, sizeMB: 760 },
        ],
      },
    ],
  },
  {
    id: "last-cartographer",
    image: require("./assets/img/last-cartographer.jpg"),
    name: "The Last Cartographer",
    kind: "movie",
    year: 2025,
    rating: "PG-13",
    maturity: "teen",
    genres: ["Drama"],
    synopsis:
      "The last mapmaker of a paper atlas company is sent to verify one final coastline before the presses stop. A slow, beautiful road film about the places that refuse to be measured.",
    cast: ["Elias Brandt", "Noor Haddad"],
    creator: "Directed by Petra Vallis",
    colors: ["#92400e", "#0f766e"],
    duration: 7080,
    sizeMB: 1420,
    trendingRank: 4,
  },
  {
    id: "night-kitchen",
    image: require("./assets/img/night-kitchen.jpg"),
    name: "The Night Kitchen",
    kind: "series",
    year: 2025,
    rating: "TV-PG",
    maturity: "family",
    genres: ["Comedy"],
    synopsis:
      "A 24-hour diner, three exhausted cooks and the whole city drifting through between midnight and dawn. Warm, quick-fire comedy about the people who feed everyone else.",
    cast: ["Bea Kaminski", "Omar Diallo", "Kit Yamada"],
    creator: "Created by Rosa Jimenez",
    colors: ["#ea580c", "#f59e0b"],
    trendingRank: 5,
    seasons: [
      {
        number: 1,
        episodes: [
          { id: "nk-s1e1", title: "Opening Shift", synopsis: "Bea's first night on the grill coincides with a blackout and a wedding party.", duration: 1560, sizeMB: 340 },
          { id: "nk-s1e2", title: "The Regulars", synopsis: "A food critic walks in at 3 a.m. Omar recognises her. Kit does not.", duration: 1500, sizeMB: 325 },
          { id: "nk-s1e3", title: "Soup of the Night", synopsis: "One pot of soup, nine problems, and a health inspector with insomnia.", duration: 1620, sizeMB: 350 },
          { id: "nk-s1e4", title: "Last Orders", synopsis: "The landlord visits with an offer the diner can't refuse — and Bea refuses it.", duration: 1580, sizeMB: 345 },
          { id: "nk-s1e5", title: "Sunrise Service", synopsis: "The night crew cooks one last breakfast as the morning shift walks in.", duration: 1660, sizeMB: 360 },
        ],
      },
    ],
  },
  {
    id: "static-bloom",
    image: require("./assets/img/static-bloom.jpg"),
    name: "Static Bloom",
    kind: "movie",
    year: 2026,
    rating: "PG-13",
    maturity: "teen",
    genres: ["Sci-fi"],
    synopsis:
      "A radio engineer in a desert listening post starts receiving broadcasts from a town that was abandoned forty years ago — in her own voice. A lean, eerie puzzle-box thriller.",
    cast: ["Wren Okafor", "Silas Marek"],
    creator: "Directed by June Castellan",
    colors: ["#7c3aed", "#db2777"],
    duration: 7620,
    sizeMB: 1580,
    trendingRank: 3,
  },
  {
    id: "deep-field",
    image: require("./assets/img/deep-field.jpg"),
    name: "Deep Field",
    kind: "movie",
    year: 2026,
    rating: "PG",
    maturity: "family",
    genres: ["Documentary"],
    synopsis:
      "Filmed over five years with the astronomers of a high-desert observatory, Deep Field follows the night a routine survey photographed something that rewrote the textbooks.",
    cast: ["Narrated by Ada Whitlock"],
    creator: "Directed by The Ferreira Brothers",
    colors: ["#1e3a8a", "#38bdf8"],
    duration: 5520,
    sizeMB: 980,
  },
  {
    id: "cold-trail",
    image: require("./assets/img/cold-trail.jpg"),
    name: "Cold Trail",
    kind: "series",
    year: 2024,
    rating: "TV-MA",
    maturity: "adult",
    genres: ["Drama", "Crime"],
    synopsis:
      "A retired detective in a snowbound border town is handed the one case she never solved — by the person who got away with it. A slow-burn crime story told across one long winter.",
    cast: ["Ingrid Voss", "Marc Delacroix"],
    creator: "Created by Henrik Aas",
    colors: ["#334155", "#94a3b8"],
    trendingRank: 6,
    seasons: [
      {
        number: 1,
        episodes: [
          { id: "ct-s1e1", title: "First Snow", synopsis: "A letter arrives with no stamp, no postmark, and a detail only two people alive could know.", duration: 3300, sizeMB: 780 },
          { id: "ct-s1e2", title: "The Crossing", synopsis: "Ingrid reopens the file and finds a page removed — recently.", duration: 3240, sizeMB: 765 },
          { id: "ct-s1e3", title: "What the Ice Keeps", synopsis: "The lake gives up a car. The town gives up nothing.", duration: 3360, sizeMB: 790 },
          { id: "ct-s1e4", title: "Thaw", synopsis: "Every suspect was telling the truth about the wrong night.", duration: 3420, sizeMB: 805 },
        ],
      },
    ],
  },
  {
    id: "understudy",
    image: require("./assets/img/understudy.jpg"),
    name: "The Understudy",
    kind: "movie",
    year: 2025,
    rating: "PG-13",
    maturity: "teen",
    genres: ["Comedy"],
    synopsis:
      "The understudy of a disastrous musical has waited eleven years for the lead to miss a show. Tonight, she does — and he has forgotten every single line. A backstage comedy with a big heart.",
    cast: ["Felix Grant", "Mabel Osei"],
    creator: "Directed by Rosa Jimenez",
    colors: ["#db2777", "#f59e0b"],
    duration: 5940,
    sizeMB: 1040,
  },
  {
    id: "quiet-harvest",
    image: require("./assets/img/quiet-harvest.jpg"),
    name: "A Quiet Harvest",
    kind: "movie",
    year: 2024,
    rating: "PG",
    maturity: "family",
    genres: ["Drama"],
    synopsis:
      "Two estranged sisters inherit their mother's orchard and exactly one harvest to save it. Gentle, sunlit and quietly devastating in the best way.",
    cast: ["Clara Whitfield", "June Whitfield"],
    creator: "Directed by Ana Ferreira",
    colors: ["#65a30d", "#f59e0b"],
    duration: 6360,
    sizeMB: 1180,
  },
  {
    id: "long-now",
    image: require("./assets/img/long-now.jpg"),
    name: "The Long Now",
    kind: "series",
    year: 2025,
    rating: "TV-PG",
    maturity: "family",
    genres: ["Documentary"],
    synopsis:
      "Each episode follows one craft that takes a lifetime: the clockmaker, the seed keeper, the last lighthouse keeper. Documentary filmmaking at walking pace.",
    cast: ["Narrated by Elias Brandt"],
    creator: "Created by The Ferreira Brothers",
    colors: ["#0f766e", "#2563eb"],
    seasons: [
      {
        number: 1,
        episodes: [
          { id: "ln-s1e1", title: "The Clockmaker", synopsis: "In a mountain village, one man is building a clock designed to run for ten thousand years.", duration: 2640, sizeMB: 560 },
          { id: "ln-s1e2", title: "The Seed Keeper", synopsis: "A vault of seeds in the far north, and the woman who has catalogued every one by hand.", duration: 2580, sizeMB: 545 },
          { id: "ln-s1e3", title: "The Lighthouse", synopsis: "The last staffed lighthouse on the coast, and the keeper who refuses the automation letter.", duration: 2700, sizeMB: 575 },
        ],
      },
    ],
  },
  {
    id: "starfall-academy",
    image: require("./assets/img/starfall-academy.jpg"),
    name: "Starfall Academy",
    kind: "series",
    year: 2026,
    rating: "TV-PG",
    maturity: "family",
    genres: ["Sci-fi", "Family"],
    synopsis:
      "At a boarding school for the children of deep-space crews, a first-year student finds a star chart in the library that doesn't match the sky. Adventure for the whole crew.",
    cast: ["Pip Aldana", "Coach Reyes", "Moss Okafor"],
    creator: "Created by Dana Reyes",
    colors: ["#2563eb", "#7c3aed"],
    trendingRank: 7,
    seasons: [
      {
        number: 1,
        episodes: [
          { id: "sa-s1e1", title: "Orientation", synopsis: "Pip arrives at Starfall and immediately gets lost — in a corridor that shouldn't exist.", duration: 2400, sizeMB: 505 },
          { id: "sa-s1e2", title: "The Wrong Sky", synopsis: "The star chart shows a constellation that vanished a century ago.", duration: 2460, sizeMB: 520 },
          { id: "sa-s1e3", title: "Zero-G Day", synopsis: "Sports day in low gravity goes exactly as badly as you'd hope.", duration: 2380, sizeMB: 500 },
          { id: "sa-s1e4", title: "Signal Day", synopsis: "The academy's antenna picks up a reply to a message sent fifty years ago.", duration: 2520, sizeMB: 530 },
        ],
      },
    ],
  },
  {
    id: "night-ferry",
    image: require("./assets/img/night-ferry.jpg"),
    name: "Night Ferry",
    kind: "movie",
    year: 2023,
    rating: "R",
    maturity: "adult",
    genres: ["Thriller", "Drama"],
    synopsis:
      "Seven passengers board the last ferry of the night. By the far shore, one of them will have confessed to something none of the others can unhear. A single-location thriller.",
    cast: ["Marc Delacroix", "Ingrid Voss"],
    creator: "Directed by Henrik Aas",
    colors: ["#7f1d1d", "#dc2626"],
    duration: 7260,
    sizeMB: 1490,
  },
  {
    id: "paper-moons",
    image: require("./assets/img/paper-moons.jpg"),
    name: "Paper Moons",
    kind: "movie",
    year: 2026,
    rating: "PG",
    maturity: "family",
    genres: ["Comedy", "Family"],
    synopsis:
      "A prop maker for a failing theatre builds a cardboard moon for the school play and accidentally starts a neighbourhood space race. Pure charm, start to finish.",
    cast: ["Kit Yamada", "Bea Kaminski"],
    creator: "Directed by Ana Ferreira",
    colors: ["#f59e0b", "#ef4444"],
    duration: 5700,
    sizeMB: 990,
    trendingRank: 8,
  },
  {
    id: "glass-observatory",
    image: require("./assets/img/glass-observatory.jpg"),
    name: "The Glass Observatory",
    kind: "movie",
    year: 2024,
    rating: "PG",
    maturity: "family",
    genres: ["Documentary", "Sci-fi"],
    synopsis:
      "Inside the workshop where the world's great telescope mirrors are ground by hand — a process that takes six years, one sheet of glass, and impossible patience.",
    cast: ["Narrated by Ada Whitlock"],
    creator: "Directed by Petra Vallis",
    colors: ["#0e7490", "#6366f1"],
    duration: 6120,
    sizeMB: 1105,
  },
];

export const GENRES = [
  "All",
  "Drama",
  "Comedy",
  "Documentary",
  "Sci-fi",
  "Thriller",
  "Crime",
  "Family",
];

/** The rails on Home, in display order. */
export const RAIL_GENRES = ["Drama", "Comedy", "Documentary", "Sci-fi"];

export const MATURITY_OPTIONS = [
  { label: "Family — PG and under", value: "family" },
  { label: "Teens — up to PG-13 / TV-14", value: "teen" },
  { label: "Adults — everything", value: "adult" },
];

export const QUALITY_OPTIONS = [
  { label: "Auto (recommended)", value: "auto" },
  { label: "4K Ultra HD", value: "4k" },
  { label: "HD 1080p", value: "hd" },
  { label: "Data saver · 480p", value: "saver" },
];

const MATURITY_RANK: Record<Maturity, number> = { family: 0, teen: 1, adult: 2 };

/** True when a title is visible under the viewer's maturity setting. */
export function visibleUnder(title: Title, setting: Maturity): boolean {
  return MATURITY_RANK[title.maturity] <= MATURITY_RANK[setting];
}

/* ------------------------------------------------------------------ */
/*  Lookup helpers                                                     */
/* ------------------------------------------------------------------ */

export function titleById(id: string): Title {
  return TITLES.find((t) => t.id === id) ?? TITLES[0];
}

export interface EpisodeRef {
  title: Title;
  season: Season;
  episode: Episode;
  /** 1-based position of the episode inside its season. */
  episodeNumber: number;
}

export function episodeRef(episodeId: string): EpisodeRef | null {
  for (const title of TITLES) {
    for (const season of title.seasons ?? []) {
      const idx = season.episodes.findIndex((e) => e.id === episodeId);
      if (idx >= 0) {
        return { title, season, episode: season.episodes[idx], episodeNumber: idx + 1 };
      }
    }
  }
  return null;
}

/** Duration in seconds of any playable (movie title id or episode id). */
export function playableDuration(playableId: string): number {
  const ref = episodeRef(playableId);
  if (ref) return ref.episode.duration;
  return titleById(playableId).duration ?? 0;
}

/** Download size in MB of any playable. */
export function playableSizeMB(playableId: string): number {
  const ref = episodeRef(playableId);
  if (ref) return ref.episode.sizeMB;
  return titleById(playableId).sizeMB ?? 0;
}

/** Human label for a playable: "S1 E2 · Low Water" or "Film". */
export function playableLabel(playableId: string): string {
  const ref = episodeRef(playableId);
  if (ref) return `S${ref.season.number} E${ref.episodeNumber} · ${ref.episode.title}`;
  return "Film";
}

/** The title that owns a playable. */
export function ownerOf(playableId: string): Title {
  const ref = episodeRef(playableId);
  return ref ? ref.title : titleById(playableId);
}

/** All episodes of a series, in play order. */
export function allEpisodes(title: Title): Episode[] {
  return (title.seasons ?? []).flatMap((s) => s.episodes);
}

/** The episode after the given one, across season boundaries. */
export function nextEpisode(title: Title, episodeId: string): Episode | null {
  const eps = allEpisodes(title);
  const idx = eps.findIndex((e) => e.id === episodeId);
  if (idx < 0 || idx >= eps.length - 1) return null;
  return eps[idx + 1];
}

/** The playable a title page's Play button should target. */
export function firstPlayable(title: Title): string {
  if (title.kind === "movie") return title.id;
  return allEpisodes(title)[0]?.id ?? title.id;
}

/* ------------------------------------------------------------------ */
/*  Formatting                                                         */
/* ------------------------------------------------------------------ */

/** "3:34" or "1:12:05" from a second count. */
export function formatTime(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

/** "1 h 58 min" / "45 min" from a second count. */
export function formatRuntime(totalSec: number): string {
  const minutes = Math.round(totalSec / 60);
  if (minutes < 60) return `${minutes} min`;
  const rem = minutes % 60;
  return rem === 0 ? `${Math.floor(minutes / 60)} h` : `${Math.floor(minutes / 60)} h ${rem} min`;
}

/** "1.4 GB" / "640 MB" from a megabyte count. */
export function formatSize(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${Math.round(mb)} MB`;
}

/** Initials for composed artwork, e.g. "Harbor Lights" -> "HL". */
export function initialsOfTitle(name: string): string {
  return name
    .replace(/^The /, "")
    .split(/\s+/)
    .filter((w) => /[A-Za-z0-9]/.test(w.charAt(0)))
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}
