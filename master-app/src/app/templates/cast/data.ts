/**
 * Airwave's catalogue: fictional podcast shows and episodes. Everything
 * is a fixture — playback is simulated in the store, no audio files and
 * no network. Each show carries two colours; the first composes its
 * artwork (one flat plate, the hue mixed toward the mode neutral —
 * no image assets).
 */

export interface Show {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  /** Average rating, pre-formatted for display. */
  rating: string;
  /** Update cadence, e.g. "Weekly". */
  cadence: string;
  colors: [string, string];
  /** Bundled cover photo, shown in place of the flat plate. */
  image: number;
}

export interface Episode {
  id: string;
  showId: string;
  /** Episode number within the show, 1 = oldest. */
  number: number;
  title: string;
  description: string;
  /** Length in seconds. */
  duration: number;
  /** Display date, e.g. "Nov 18". */
  dateLabel: string;
  /** File size in MB for the Downloads screen's storage maths. */
  sizeMB: number;
}

export const SHOWS: Show[] = [
  {
    id: "deep-dive",
    title: "The Deep Dive",
    author: "Marina Cole",
    category: "Technology",
    description:
      "One big idea from the world of technology, taken apart slowly. Marina interviews the engineers, founders and researchers behind the systems everyone uses but nobody sees.",
    rating: "4.9",
    cadence: "Weekly",
    colors: ["#0e7490", "#2563eb"],
    image: require("./assets/img/deep-dive.jpg"),
  },
  {
    id: "cold-open",
    title: "Cold Open",
    author: "Dana Whitfield",
    category: "True Crime",
    description:
      "Cases that went cold — and the new evidence that warmed them up again. Each season follows one investigation from the first 911 call to the latest lead.",
    rating: "4.8",
    cadence: "Weekly",
    colors: ["#7f1d1d", "#334155"],
    image: require("./assets/img/cold-open.jpg"),
  },
  {
    id: "small-talk",
    title: "Small Talk, Big Laughs",
    author: "Priya Nair & Tom Beckett",
    category: "Comedy",
    description:
      "Two friends, one ridiculous listener voicemail, and forty minutes of tangents. The least informative show on the internet, on purpose.",
    rating: "4.7",
    cadence: "Twice weekly",
    colors: ["#f59e0b", "#db2777"],
    image: require("./assets/img/small-talk.jpg"),
  },
  {
    id: "ledger",
    title: "The Ledger",
    author: "Jonas Feld",
    category: "Business",
    description:
      "How companies actually make money — the pricing tricks, quiet monopolies and near-death pivots behind the brands in your pocket. No hustle advice, just the numbers.",
    rating: "4.8",
    cadence: "Weekly",
    colors: ["#166534", "#0f766e"],
    image: require("./assets/img/ledger.jpg"),
  },
  {
    id: "field-notes",
    title: "Field Notes",
    author: "Dr. Amara Osei",
    category: "Science",
    description:
      "Short dispatches from working scientists: what they measured this week, what surprised them, and what they got wrong last year. Recorded in labs, boats and one very windy observatory.",
    rating: "4.9",
    cadence: "Fortnightly",
    colors: ["#65a30d", "#0e7490"],
    image: require("./assets/img/field-notes.jpg"),
  },
  {
    id: "slow-mornings",
    title: "Slow Mornings",
    author: "Elena Ruiz",
    category: "Wellness",
    description:
      "Gentle conversations about attention, rest and doing fewer things better. Ends every episode with a two-minute breathing exercise you can do anywhere.",
    rating: "4.8",
    cadence: "Weekly",
    colors: ["#7c3aed", "#0ea5e9"],
    image: require("./assets/img/slow-mornings.jpg"),
  },
];

export const EPISODES: Episode[] = [
  /* The Deep Dive — Technology */
  { id: "dd-1", showId: "deep-dive", number: 1, title: "The Chip Shortage Is a Story About Water", description: "Why the most advanced factories on Earth depend on ultrapure water, and what happens to chip supply when the rains fail.", duration: 2340, dateLabel: "Oct 28", sizeMB: 54 },
  { id: "dd-2", showId: "deep-dive", number: 2, title: "Inside the Undersea Cable Repair Fleet", description: "There are fewer than sixty ships that can fix the cables carrying 99% of intercontinental data. We ride along with one crew.", duration: 2580, dateLabel: "Nov 4", sizeMB: 59 },
  { id: "dd-3", showId: "deep-dive", number: 3, title: "Your Password Manager Is a Bank Vault", description: "A cryptographer walks us through zero-knowledge design — and the one setting most people leave dangerously wrong.", duration: 2160, dateLabel: "Nov 11", sizeMB: 50 },
  { id: "dd-4", showId: "deep-dive", number: 4, title: "The Quiet Return of the Mainframe", description: "Banks were supposed to migrate off mainframes a decade ago. Instead, they're buying more. A story about risk, COBOL and inertia.", duration: 2460, dateLabel: "Nov 18", sizeMB: 57 },

  /* Cold Open — True Crime */
  { id: "co-1", showId: "cold-open", number: 1, title: "The Lighthouse Keeper's Log", description: "In 1987 a keeper on Grey Rock logged a boat that officially never existed. Part one: the logbook, the storm, and the missing page.", duration: 2820, dateLabel: "Oct 21", sizeMB: 65 },
  { id: "co-2", showId: "cold-open", number: 2, title: "A Coat in the River", description: "A fisherman pulls up more than he bargained for, and a dry-cleaning tag becomes the case's first real lead in thirty years.", duration: 2700, dateLabel: "Oct 28", sizeMB: 62 },
  { id: "co-3", showId: "cold-open", number: 3, title: "The Witness Who Moved Away", description: "The only person who saw the car that night left town in 1989. Dana finds her — and she remembers more than she told police.", duration: 2940, dateLabel: "Nov 11", sizeMB: 68 },
  { id: "co-4", showId: "cold-open", number: 4, title: "New DNA, Old Questions", description: "A genealogy database match reopens everything. What the science can prove, what it can't, and why the family is split.", duration: 2880, dateLabel: "Nov 18", sizeMB: 66 },

  /* Small Talk, Big Laughs — Comedy */
  { id: "st-1", showId: "small-talk", number: 1, title: "My Neighbour Is Definitely a Spy", description: "A listener's neighbour washes his car at 3 a.m. and owns four identical jackets. Priya builds the case; Tom defends the laundry theory.", duration: 1980, dateLabel: "Nov 8", sizeMB: 46 },
  { id: "st-2", showId: "small-talk", number: 2, title: "The Group Chat Has a Constitution Now", description: "One friend group took admin rights way too seriously. We read the amendments, including the controversial snack clause.", duration: 1860, dateLabel: "Nov 12", sizeMB: 43 },
  { id: "st-3", showId: "small-talk", number: 3, title: "Airport Dads: A Taxonomy", description: "He arrives four hours early and has printed everything twice. A field guide to the seven species of airport dad.", duration: 2040, dateLabel: "Nov 15", sizeMB: 47 },
  { id: "st-4", showId: "small-talk", number: 4, title: "We Reviewed Your Fridge", description: "Listeners sent photos of their fridges. The expired sauce collection in fridge three requires a moment of silence.", duration: 1920, dateLabel: "Nov 19", sizeMB: 44 },

  /* The Ledger — Business */
  { id: "lg-1", showId: "ledger", number: 1, title: "Why Airports Are Really Malls", description: "Landing fees barely cover the lights. The real business of an airport is rent, perfume and a captive audience with two hours to kill.", duration: 2280, dateLabel: "Oct 30", sizeMB: 53 },
  { id: "lg-2", showId: "ledger", number: 2, title: "The $9 Billion Umbrella Company", description: "One firm makes most of the umbrellas sold on Earth — and almost nobody knows its name. Inside the economics of being invisible.", duration: 2400, dateLabel: "Nov 6", sizeMB: 55 },
  { id: "lg-3", showId: "ledger", number: 3, title: "Free Shipping Isn't", description: "Follow one returned jumper through the system and count every hand that touches it. The maths of 'free' returns, explained.", duration: 2220, dateLabel: "Nov 13", sizeMB: 51 },
  { id: "lg-4", showId: "ledger", number: 4, title: "The Hotel Minibar Pricing Mystery", description: "Nine dollars for water is not greed — it's a pricing model with a name, a history and a surprising amount of game theory.", duration: 2100, dateLabel: "Nov 20", sizeMB: 48 },

  /* Field Notes — Science */
  { id: "fn-1", showId: "field-notes", number: 1, title: "The Octopus Has Three Hearts and Opinions", description: "Marine biologist Dr. Ito on octopus problem-solving, the ethics of the maze test, and the one who kept escaping to visit a crab.", duration: 1740, dateLabel: "Oct 24", sizeMB: 40 },
  { id: "fn-2", showId: "field-notes", number: 2, title: "Counting Bees With Radar", description: "A team in Devon is tracking individual bees with harmonic radar. What the flight paths reveal about pesticides — and roundabouts.", duration: 1680, dateLabel: "Nov 7", sizeMB: 39 },
  { id: "fn-3", showId: "field-notes", number: 3, title: "The Volcano That Whispers First", description: "Seismologist Dr. Marek on infrasound: the sounds a volcano makes below human hearing, days before anyone sees ash.", duration: 1860, dateLabel: "Nov 14", sizeMB: 43 },
  { id: "fn-4", showId: "field-notes", number: 4, title: "A Forest Is a Network, Not a Crowd", description: "New measurements of fungal networks under a pine forest — what's genuinely traded between trees, and what's still just a good story.", duration: 1800, dateLabel: "Nov 21", sizeMB: 41 },

  /* Slow Mornings — Wellness */
  { id: "sm-1", showId: "slow-mornings", number: 1, title: "The First Hour Is Not for Feeds", description: "Elena makes the case for a boring first hour: light, movement, and one page of anything on paper. Includes the two-minute breathing close.", duration: 1560, dateLabel: "Nov 2", sizeMB: 36 },
  { id: "sm-2", showId: "slow-mornings", number: 2, title: "Rest Is a Skill, Not a Reward", description: "A sleep researcher explains why 'earning' rest backfires, and the difference between stopping and actually recovering.", duration: 1680, dateLabel: "Nov 9", sizeMB: 39 },
  { id: "sm-3", showId: "slow-mornings", number: 3, title: "Walking Meetings and Other Small Rebellions", description: "What changes when a conversation moves at three miles an hour — plus a gentle audit of your calendar's defaults.", duration: 1500, dateLabel: "Nov 16", sizeMB: 35 },
  { id: "sm-4", showId: "slow-mornings", number: 4, title: "The Art of the Unfinished List", description: "Closing the day with things undone, on purpose. Elena shares her shutdown ritual and the notebook that makes it work.", duration: 1620, dateLabel: "Nov 20", sizeMB: 37 },
];

export const CATEGORIES = [
  "All",
  "Technology",
  "True Crime",
  "Comedy",
  "Business",
  "Science",
  "Wellness",
];

export const SPEED_OPTIONS = [0.8, 1, 1.25, 1.5, 2];

export const SLEEP_TIMER_OPTIONS = [
  { label: "Off", value: "off" },
  { label: "10 minutes", value: "10" },
  { label: "20 minutes", value: "20" },
  { label: "30 minutes", value: "30" },
  { label: "End of episode", value: "episode" },
];

export function showById(id: string): Show {
  return SHOWS.find((s) => s.id === id) ?? SHOWS[0];
}

export function episodeById(id: string): Episode {
  return EPISODES.find((e) => e.id === id) ?? EPISODES[0];
}

export function episodesOfShow(showId: string): Episode[] {
  return EPISODES.filter((e) => e.showId === showId).sort(
    (a, b) => a.number - b.number,
  );
}

/** Newest episodes across the catalogue, by show order then number desc. */
export function newestEpisodes(count: number): Episode[] {
  return [...EPISODES]
    .sort((a, b) => b.number - a.number || a.showId.localeCompare(b.showId))
    .slice(0, count);
}

/** "42:30" / "1:02:15" from a second count. */
export function formatTime(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

/** "42 min" / "1 h 5 min" from a second count. */
export function formatDuration(totalSec: number): string {
  const minutes = Math.round(totalSec / 60);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

/** Initials for composed artwork, e.g. "The Deep Dive" -> "DD". */
export function initialsOfTitle(title: string): string {
  return title
    .replace(/^The\s+/i, "")
    .split(/\s+/)
    .filter((w) => /[A-Za-z0-9]/.test(w.charAt(0)))
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}
