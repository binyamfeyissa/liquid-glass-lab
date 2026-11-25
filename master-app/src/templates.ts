export interface TemplateEntry {
  slug: string;
  name: string;
  app: string;
  blurb: string;
}

export const TEMPLATES: TemplateEntry[] = [
  { slug: "bank", name: "Bank", app: "Northwind Bank", blurb: "Banking — accounts, cards, send money, insights" },
  { slug: "calm", name: "Calm", app: "Stillwater", blurb: "Meditation & sleep — library, breathing, player" },
  { slug: "cast", name: "Cast", app: "Airwave", blurb: "Podcasts — discover, library, downloads, queue" },
  { slug: "chat", name: "Chat", app: "Relay", blurb: "Messaging — chats, calls, contacts, groups" },
  { slug: "date", name: "Date", app: "Kindred", blurb: "Dating — profiles, likes, matches, chat" },
  { slug: "fit", name: "Fit", app: "Pulse", blurb: "Fitness — workouts, activity, goals, player" },
  { slug: "food-fleet", name: "Food Fleet", app: "Fleet — Courier", blurb: "Courier — jobs, earnings, active deliveries" },
  { slug: "food", name: "Food", app: "Forkful", blurb: "Food delivery — restaurants, cart, checkout, tracking" },
  { slug: "grocery", name: "Grocery", app: "Basket", blurb: "Grocery — aisles, lists, orders, delivery slots" },
  { slug: "health", name: "Health", app: "Vitalis", blurb: "Health — trends, habits, logging, history" },
  { slug: "homes", name: "Homes", app: "Haven", blurb: "Property — search, saved homes, viewings" },
  { slug: "jobs", name: "Jobs", app: "Northbound", blurb: "Jobs — search, saved, applications, apply" },
  { slug: "learn", name: "Learn", app: "Glasshouse", blurb: "Learning — courses, lessons, quizzes" },
  { slug: "news", name: "News", app: "The Signal", blurb: "News — home, for you, bookmarks, briefings" },
  { slug: "ride", name: "Ride", app: "Drift", blurb: "Ride-hailing — trips, places, payment" },
  { slug: "shop", name: "Shop", app: "Lumen", blurb: "Shopping — shop, cart, checkout, orders" },
  { slug: "social", name: "Social", app: "Orbit", blurb: "Social — explore, create, messages, threads" },
  { slug: "spend", name: "Spend", app: "Tally", blurb: "Spending — budgets, history, goals, insights" },
  { slug: "stream", name: "Stream", app: "Lumen Play", blurb: "Streaming — browse, my list, player" },
  { slug: "travel", name: "Travel", app: "Wayfare", blurb: "Travel — trips, stays, messages, booking" },
  { slug: "tunes", name: "Tunes", app: "Waveform", blurb: "Music — library, playlists, artists, queue" },
  { slug: "wallet", name: "Wallet", app: "Orbit Wallet", blurb: "Crypto wallet — swap, send, trade, activity" },
  { slug: "onboarding-flow", name: "Onboarding Flow", app: "Northwind Onboarding", blurb: "Onboarding — intro pages and finish screen (free)" },
  { slug: "profile-settings", name: "Profile & Settings", app: "Northwind — Profile & Settings", blurb: "Profile & settings — edit, alerts, appearance, privacy (free)" },
];
