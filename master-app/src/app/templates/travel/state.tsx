import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * The whole template keeps its data in this one client-side store. There is
 * no backend and no persistence: state lives in memory for the session, so
 * reserving a stay on the booking screen immediately adds a trip to Trips,
 * and hearting a stay anywhere updates Saved. Restarting the app resets
 * the fixtures. Prices and dates are demo fixtures — no payment is taken.
 */

export type Currency = "USD" | "EUR";

/** The three backgrounds the app offers; everything else is derived. */
export type BackdropMode = "dark" | "light" | "image";

/** Fixture FX rates from USD. EUR prices are USD × rate, rounded whole. */
export const FX: Record<Currency, { rate: number; symbol: string }> = {
  USD: { rate: 1, symbol: "$" },
  EUR: { rate: 0.92, symbol: "€" },
};

export interface Destination {
  id: string;
  city: string;
  country: string;
  /** Cheapest nightly rate in USD among its stays. */
  priceFrom: number;
  rating: number;
  /** Two-stop gradient for the composed tile visual. */
  colors: [string, string];
  tagline: string;
}

export interface StayReview {
  author: string;
  dateLabel: string;
  rating: number;
  text: string;
}

export interface Stay {
  id: string;
  title: string;
  destinationId: string;
  type: string;
  /** Nightly rate in USD. */
  pricePerNight: number;
  cleaningFee: number;
  rating: number;
  reviewsCount: number;
  guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  amenities: string[];
  description: string;
  hostName: string;
  hostSince: number;
  colors: [string, string];
  reviews: StayReview[];
}

export type BookingStatus = "upcoming" | "past" | "cancelled";

export interface Booking {
  id: string;
  /** Human booking reference, e.g. "WF-8K2Q". */
  ref: string;
  stayId: string;
  /** Days from today at booking time; negative = in the past. */
  checkInOffset: number;
  nights: number;
  guests: number;
  /** Total charged, in USD, captured at booking time. */
  totalUSD: number;
  nightlyUSD: number;
  cleaningFeeUSD: number;
  serviceFeeUSD: number;
  status: BookingStatus;
}

export interface ChatMsg {
  id: string;
  senderId: "me" | "host";
  text: string;
  timeLabel: string;
}

export interface Thread {
  id: string;
  stayId: string;
  hostName: string;
  messages: ChatMsg[];
  unread: number;
}

interface TravelState {
  userName: string;

  destinations: Destination[];
  stays: Stay[];
  stayById: (id: string) => Stay | undefined;
  destinationById: (id: string) => Destination | undefined;

  savedIds: string[];
  toggleSaved: (stayId: string) => void;
  isSaved: (stayId: string) => boolean;

  bookings: Booking[];
  addBooking: (booking: Omit<Booking, "id" | "ref" | "status">) => Booking;
  cancelBooking: (id: string) => void;

  threads: Thread[];
  sendMessage: (threadId: string, text: string) => void;
  markThreadRead: (threadId: string) => void;

  currency: Currency;
  setCurrency: (c: Currency) => void;
  /** Format a USD amount in the selected display currency. */
  price: (usd: number) => string;

  backdrop: BackdropMode;
  setBackdrop: (mode: BackdropMode) => void;
  /** Derived: true unless the backdrop is the broken-white light mode. */
  darkMode: boolean;
  notifications: boolean;
  setNotifications: (v: boolean) => void;
  tripReminders: boolean;
  setTripReminders: (v: boolean) => void;
}

const TravelContext = createContext<TravelState | null>(null);

export const DESTINATIONS: Destination[] = [
  { id: "lisbon", city: "Lisbon", country: "Portugal", priceFrom: 84, rating: 4.87, colors: ["#f59e0b", "#ef4444"], tagline: "Trams, tiles and Atlantic light" },
  { id: "kyoto", city: "Kyoto", country: "Japan", priceFrom: 112, rating: 4.92, colors: ["#ec4899", "#8b5cf6"], tagline: "Temples and quiet lanes" },
  { id: "marrakech", city: "Marrakech", country: "Morocco", priceFrom: 67, rating: 4.78, colors: ["#f97316", "#b45309"], tagline: "Souks, riads and mint tea" },
  { id: "reykjavik", city: "Reykjavík", country: "Iceland", priceFrom: 138, rating: 4.83, colors: ["#38bdf8", "#6366f1"], tagline: "Northern lights and hot lagoons" },
  { id: "cape-town", city: "Cape Town", country: "South Africa", priceFrom: 95, rating: 4.85, colors: ["#10b981", "#0ea5e9"], tagline: "Table Mountain to the sea" },
  { id: "cusco", city: "Cusco", country: "Peru", priceFrom: 58, rating: 4.8, colors: ["#eab308", "#dc2626"], tagline: "Gateway to Machu Picchu" },
];

export const STAYS: Stay[] = [
  {
    id: "alfama-loft",
    title: "Sunlit Alfama loft with river view",
    destinationId: "lisbon",
    type: "Entire loft",
    pricePerNight: 96,
    cleaningFee: 28,
    rating: 4.91,
    reviewsCount: 214,
    guests: 4,
    bedrooms: 2,
    beds: 3,
    baths: 1,
    amenities: ["Fast wifi", "Full kitchen", "Washer", "Air conditioning", "River-view balcony", "Self check-in"],
    description:
      "A bright top-floor loft in the heart of Alfama, two minutes from the tram 28 line. Watch the sun set over the Tagus from the balcony, then wander down to the fado bars below.",
    hostName: "Inês Duarte",
    hostSince: 2018,
    colors: ["#f59e0b", "#ef4444"],
    reviews: [
      { author: "Hannah M.", dateLabel: "October 2026", rating: 5, text: "The balcony view is even better than the photos. Inês left pastéis de nata for our arrival — perfect stay." },
      { author: "Tom R.", dateLabel: "September 2026", rating: 5, text: "Spotless, quiet despite the central location, and the tram passes right below. Would book again." },
    ],
  },
  {
    id: "bairro-studio",
    title: "Design studio in Bairro Alto",
    destinationId: "lisbon",
    type: "Entire studio",
    pricePerNight: 84,
    cleaningFee: 20,
    rating: 4.82,
    reviewsCount: 156,
    guests: 2,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    amenities: ["Fast wifi", "Workspace", "Air conditioning", "Self check-in", "Coffee machine"],
    description:
      "A compact, design-led studio on a quiet Bairro Alto side street — lively at night, calm by day. Ideal base for remote work weeks and long weekends.",
    hostName: "Inês Duarte",
    hostSince: 2018,
    colors: ["#fb923c", "#db2777"],
    reviews: [
      { author: "Priya S.", dateLabel: "October 2026", rating: 5, text: "Great desk setup and the wifi handled video calls all week. Lovely host." },
    ],
  },
  {
    id: "gion-machiya",
    title: "Restored machiya townhouse in Gion",
    destinationId: "kyoto",
    type: "Entire townhouse",
    pricePerNight: 168,
    cleaningFee: 40,
    rating: 4.96,
    reviewsCount: 189,
    guests: 5,
    bedrooms: 3,
    beds: 4,
    baths: 2,
    amenities: ["Garden", "Soaking tub", "Full kitchen", "Washer", "Bicycles included", "Air conditioning"],
    description:
      "A century-old wooden machiya on a lantern-lit lane in Gion, carefully restored with a private moss garden and a cedar soaking tub. Futons and Western beds both available.",
    hostName: "Yuki Tanaka",
    hostSince: 2016,
    colors: ["#ec4899", "#8b5cf6"],
    reviews: [
      { author: "Claire D.", dateLabel: "November 2026", rating: 5, text: "Felt like living in old Kyoto. Yuki's guide to the neighbourhood shrines was a highlight of our trip." },
      { author: "Marcus L.", dateLabel: "October 2026", rating: 5, text: "Immaculate and serene. The garden at dawn is unforgettable." },
    ],
  },
  {
    id: "arashiyama-flat",
    title: "Riverside flat near the bamboo grove",
    destinationId: "kyoto",
    type: "Entire apartment",
    pricePerNight: 112,
    cleaningFee: 24,
    rating: 4.88,
    reviewsCount: 132,
    guests: 3,
    bedrooms: 1,
    beds: 2,
    baths: 1,
    amenities: ["Fast wifi", "River view", "Washer", "Air conditioning", "Self check-in"],
    description:
      "Wake to the sound of the Katsura river in this calm Arashiyama flat, five minutes' walk from the bamboo grove — go early and have it to yourself.",
    hostName: "Yuki Tanaka",
    hostSince: 2016,
    colors: ["#a78bfa", "#2563eb"],
    reviews: [
      { author: "Sofia G.", dateLabel: "September 2026", rating: 5, text: "Peaceful, spotless, and the river view from breakfast is gorgeous." },
    ],
  },
  {
    id: "medina-riad",
    title: "Courtyard riad in the medina",
    destinationId: "marrakech",
    type: "Entire riad",
    pricePerNight: 121,
    cleaningFee: 30,
    rating: 4.9,
    reviewsCount: 243,
    guests: 6,
    bedrooms: 3,
    beds: 4,
    baths: 3,
    amenities: ["Plunge pool", "Rooftop terrace", "Breakfast included", "Air conditioning", "Airport pickup on request"],
    description:
      "Behind an unmarked cedar door: a tiled courtyard, a plunge pool, and a rooftop terrace facing the Atlas mountains. Breakfast of msemen and mint tea is served each morning.",
    hostName: "Yasmine El Fassi",
    hostSince: 2015,
    colors: ["#f97316", "#b45309"],
    reviews: [
      { author: "Jonas K.", dateLabel: "October 2026", rating: 5, text: "An oasis. The rooftop breakfasts and Yasmine's restaurant tips made the trip." },
      { author: "Amara O.", dateLabel: "August 2026", rating: 5, text: "Beautiful rooms, wonderful staff, and the pool after a hot day in the souks is bliss." },
    ],
  },
  {
    id: "kasbah-room",
    title: "Terrace room above the kasbah",
    destinationId: "marrakech",
    type: "Private room",
    pricePerNight: 67,
    cleaningFee: 12,
    rating: 4.74,
    reviewsCount: 98,
    guests: 2,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    amenities: ["Shared terrace", "Breakfast included", "Air conditioning", "Fast wifi"],
    description:
      "A serene private room in a family home above the kasbah, with a shared roof terrace for sunset tea. Your hosts are happy to help you navigate the medina.",
    hostName: "Yasmine El Fassi",
    hostSince: 2015,
    colors: ["#fbbf24", "#ea580c"],
    reviews: [
      { author: "Leo P.", dateLabel: "September 2026", rating: 4, text: "Simple, warm and welcoming. The terrace view at sunset is the best in the medina." },
    ],
  },
  {
    id: "aurora-cabin",
    title: "Aurora cabin with private hot tub",
    destinationId: "reykjavik",
    type: "Entire cabin",
    pricePerNight: 214,
    cleaningFee: 45,
    rating: 4.94,
    reviewsCount: 167,
    guests: 4,
    bedrooms: 2,
    beds: 3,
    baths: 1,
    amenities: ["Private hot tub", "Aurora alarm", "Full kitchen", "Free parking", "Heated floors", "Fast wifi"],
    description:
      "A timber cabin 25 minutes from the city, far from light pollution. Soak in the hot tub while the northern lights move overhead — the cabin's aurora alarm wakes you when activity spikes.",
    hostName: "Sigríður Jónsdóttir",
    hostSince: 2019,
    colors: ["#38bdf8", "#6366f1"],
    reviews: [
      { author: "Emma W.", dateLabel: "November 2026", rating: 5, text: "We saw the lights three nights in a row from the hot tub. Pure magic." },
      { author: "Kenji H.", dateLabel: "October 2026", rating: 5, text: "Cosy, warm and brilliantly equipped. The aurora alarm works." },
    ],
  },
  {
    id: "harbour-flat",
    title: "Harbour-view flat in Old Town",
    destinationId: "reykjavik",
    type: "Entire apartment",
    pricePerNight: 138,
    cleaningFee: 26,
    rating: 4.8,
    reviewsCount: 121,
    guests: 3,
    bedrooms: 1,
    beds: 2,
    baths: 1,
    amenities: ["Harbour view", "Fast wifi", "Washer", "Self check-in", "Workspace"],
    description:
      "Watch fishing boats come and go from this warm Old Town flat, steps from the Sun Voyager and the city's best bakeries.",
    hostName: "Sigríður Jónsdóttir",
    hostSince: 2019,
    colors: ["#22d3ee", "#818cf8"],
    reviews: [
      { author: "Nora F.", dateLabel: "September 2026", rating: 5, text: "Perfect location and the harbour view never gets old." },
    ],
  },
  {
    id: "bo-kaap-house",
    title: "Colourful Bo-Kaap house with mountain view",
    destinationId: "cape-town",
    type: "Entire house",
    pricePerNight: 132,
    cleaningFee: 32,
    rating: 4.89,
    reviewsCount: 176,
    guests: 5,
    bedrooms: 3,
    beds: 4,
    baths: 2,
    amenities: ["Mountain view", "Pool", "Full kitchen", "Free parking", "Fast wifi", "Air conditioning"],
    description:
      "A cheerful house on one of Bo-Kaap's famous colourful streets, with Table Mountain filling the back windows and a small pool for hot afternoons.",
    hostName: "Lindiwe Nkosi",
    hostSince: 2017,
    colors: ["#10b981", "#0ea5e9"],
    reviews: [
      { author: "David B.", dateLabel: "October 2026", rating: 5, text: "The mountain view from the kitchen table is unreal. Lindiwe is a superb host." },
    ],
  },
  {
    id: "sea-point-flat",
    title: "Sea Point flat on the promenade",
    destinationId: "cape-town",
    type: "Entire apartment",
    pricePerNight: 95,
    cleaningFee: 22,
    rating: 4.81,
    reviewsCount: 143,
    guests: 2,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    amenities: ["Ocean view", "Fast wifi", "Gym access", "Self check-in", "Air conditioning"],
    description:
      "Fall asleep to the Atlantic in this promenade flat — sunrise runs, sunset swims at the tidal pools, and the city's best coffee downstairs.",
    hostName: "Lindiwe Nkosi",
    hostSince: 2017,
    colors: ["#34d399", "#3b82f6"],
    reviews: [
      { author: "Mia T.", dateLabel: "August 2026", rating: 5, text: "Woke up to the ocean every day. The promenade at golden hour is unbeatable." },
    ],
  },
  {
    id: "san-blas-casa",
    title: "Colonial casa in San Blas",
    destinationId: "cusco",
    type: "Entire house",
    pricePerNight: 78,
    cleaningFee: 18,
    rating: 4.86,
    reviewsCount: 158,
    guests: 6,
    bedrooms: 3,
    beds: 5,
    baths: 2,
    amenities: ["Courtyard", "Fireplace", "Full kitchen", "Fast wifi", "Coca tea on arrival"],
    description:
      "A whitewashed colonial casa in the artists' quarter of San Blas, with a flower-filled courtyard and views over Cusco's terracotta roofs. The perfect base before the Sacred Valley.",
    hostName: "Rosa Quispe",
    hostSince: 2018,
    colors: ["#eab308", "#dc2626"],
    reviews: [
      { author: "Felix A.", dateLabel: "October 2026", rating: 5, text: "Charming house, kind host, and Rosa's Machu Picchu advice saved us hours of queuing." },
    ],
  },
  {
    id: "plaza-room",
    title: "Bright room two blocks from Plaza de Armas",
    destinationId: "cusco",
    type: "Private room",
    pricePerNight: 58,
    cleaningFee: 10,
    rating: 4.77,
    reviewsCount: 87,
    guests: 2,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    amenities: ["Shared kitchen", "Fast wifi", "Breakfast included", "Luggage storage"],
    description:
      "A sunny private room in a family home, two blocks from the Plaza de Armas. Breakfast of fresh bread, eggs and coca tea included.",
    hostName: "Rosa Quispe",
    hostSince: 2018,
    colors: ["#facc15", "#f97316"],
    reviews: [
      { author: "Ines V.", dateLabel: "September 2026", rating: 5, text: "Simple, spotless and so welcoming. Great value this close to the plaza." },
    ],
  },
];

const DAY = 24 * 60 * 60 * 1000;

export function dateForOffset(offset: number): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return new Date(d.getTime() + offset * DAY);
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShortDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const SEED_BOOKINGS: Booking[] = [
  {
    id: "bk1",
    ref: "WF-8K2Q",
    stayId: "alfama-loft",
    checkInOffset: 21,
    nights: 4,
    guests: 2,
    nightlyUSD: 96,
    cleaningFeeUSD: 28,
    serviceFeeUSD: 54,
    totalUSD: 96 * 4 + 28 + 54,
    status: "upcoming",
  },
  {
    id: "bk2",
    ref: "WF-3M7D",
    stayId: "gion-machiya",
    checkInOffset: -46,
    nights: 5,
    guests: 4,
    nightlyUSD: 168,
    cleaningFeeUSD: 40,
    serviceFeeUSD: 118,
    totalUSD: 168 * 5 + 40 + 118,
    status: "past",
  },
];

const SEED_THREADS: Thread[] = [
  {
    id: "th1",
    stayId: "alfama-loft",
    hostName: "Inês Duarte",
    unread: 1,
    messages: [
      { id: "m1", senderId: "host", text: "Olá! Thanks for booking the Alfama loft. Check-in is from 3pm — the keys will be in the lockbox by the door.", timeLabel: "Tue 09:14" },
      { id: "m2", senderId: "me", text: "Hi Inês! We land around 1pm — is early check-in possible if the flat is ready?", timeLabel: "Tue 09:31" },
      { id: "m3", senderId: "host", text: "Of course — I'll let you know on the day. You can also drop your bags at the café downstairs, they know me well.", timeLabel: "Tue 09:42" },
    ],
  },
  {
    id: "th2",
    stayId: "aurora-cabin",
    hostName: "Sigríður Jónsdóttir",
    unread: 0,
    messages: [
      { id: "m1", senderId: "me", text: "Hello! How likely are the northern lights in mid-December?", timeLabel: "Sun 18:02" },
      { id: "m2", senderId: "host", text: "December is a great month — long nights and often clear skies. The cabin alarm will wake you if the lights appear after midnight.", timeLabel: "Sun 18:40" },
    ],
  },
  {
    id: "th3",
    stayId: "medina-riad",
    hostName: "Yasmine El Fassi",
    unread: 0,
    messages: [
      { id: "m1", senderId: "host", text: "Welcome to Marrakech! Would you like me to arrange a driver from the airport? It makes the medina arrival much easier.", timeLabel: "Fri 12:15" },
    ],
  },
];

const HOST_REPLIES = [
  "Thanks for your message! I'll get back to you in detail shortly — in the meantime, everything in the listing description is up to date.",
  "Great question — yes, that's absolutely fine. Let me know if there's anything else you'd like arranged before you arrive.",
  "Of course! I'm happy to help with that. I'll confirm the details this evening.",
];

let counter = 100;
const nextId = () => `x${++counter}`;

export function serviceFeeFor(subtotal: number): number {
  return Math.round(subtotal * 0.12);
}

export function TravelProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>(["aurora-cabin", "medina-riad"]);
  const [bookings, setBookings] = useState<Booking[]>(SEED_BOOKINGS);
  const [threads, setThreads] = useState<Thread[]>(SEED_THREADS);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [backdrop, setBackdrop] = useState<BackdropMode>("dark");
  const darkMode = backdrop !== "light";
  const [notifications, setNotifications] = useState(true);
  const [tripReminders, setTripReminders] = useState(true);

  const stayById = useCallback((id: string) => STAYS.find((s) => s.id === id), []);
  const destinationById = useCallback(
    (id: string) => DESTINATIONS.find((d) => d.id === id),
    [],
  );

  const toggleSaved = useCallback((stayId: string) => {
    setSavedIds((prev) =>
      prev.includes(stayId) ? prev.filter((s) => s !== stayId) : [...prev, stayId],
    );
  }, []);

  const isSaved = useCallback(
    (stayId: string) => savedIds.includes(stayId),
    [savedIds],
  );

  const addBooking = useCallback((draft: Omit<Booking, "id" | "ref" | "status">) => {
    const booking: Booking = {
      ...draft,
      id: nextId(),
      ref: `WF-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      status: "upcoming",
    };
    setBookings((prev) => [booking, ...prev]);
    // A booking opens (or reuses) a message thread with the host.
    setThreads((prev) => {
      const stay = STAYS.find((s) => s.id === draft.stayId);
      if (!stay) return prev;
      const existing = prev.find((t) => t.stayId === draft.stayId);
      const greeting: ChatMsg = {
        id: nextId(),
        senderId: "host",
        text: `Thanks for booking ${stay.title}! I'm ${stay.hostName.split(" ")[0]}, your host. Message me here any time before your trip.`,
        timeLabel: "Now",
      };
      if (existing) {
        return prev.map((t) =>
          t.id === existing.id ? { ...t, messages: [...t.messages, greeting] } : t,
        );
      }
      return [
        { id: nextId(), stayId: draft.stayId, hostName: stay.hostName, unread: 1, messages: [greeting] },
        ...prev,
      ];
    });
    return booking;
  }, []);

  const cancelBooking = useCallback((id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)),
    );
  }, []);

  const markThreadRead = useCallback((threadId: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, unread: 0 } : t)),
    );
  }, []);

  const sendMessage = useCallback((threadId: string, text: string) => {
    const mine: ChatMsg = { id: nextId(), senderId: "me", text, timeLabel: "Now" };
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId ? { ...t, messages: [...t.messages, mine] } : t,
      ),
    );
    // Simulated host reply after a short pause.
    const reply: ChatMsg = {
      id: nextId(),
      senderId: "host",
      text: HOST_REPLIES[Math.floor(Math.random() * HOST_REPLIES.length)],
      timeLabel: "Now",
    };
    setTimeout(() => {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId ? { ...t, messages: [...t.messages, reply] } : t,
        ),
      );
    }, 1400);
  }, []);

  const price = useCallback(
    (usd: number) => {
      const { rate, symbol } = FX[currency];
      const converted = Math.round(usd * rate);
      return `${symbol}${converted.toLocaleString("en-US")}`;
    },
    [currency],
  );

  const value = useMemo<TravelState>(
    () => ({
      userName: "Jordan Ellis",
      destinations: DESTINATIONS,
      stays: STAYS,
      stayById,
      destinationById,
      savedIds,
      toggleSaved,
      isSaved,
      bookings,
      addBooking,
      cancelBooking,
      threads,
      sendMessage,
      markThreadRead,
      currency,
      setCurrency,
      price,
      backdrop,
      setBackdrop,
      darkMode,
      notifications,
      setNotifications,
      tripReminders,
      setTripReminders,
    }),
    [
      stayById,
      destinationById,
      savedIds,
      toggleSaved,
      isSaved,
      bookings,
      addBooking,
      cancelBooking,
      threads,
      sendMessage,
      markThreadRead,
      currency,
      price,
      backdrop,
      darkMode,
      notifications,
      tripReminders,
    ],
  );

  return <TravelContext.Provider value={value}>{children}</TravelContext.Provider>;
}

export function useTravel(): TravelState {
  const ctx = useContext(TravelContext);
  if (!ctx) throw new Error("useTravel must be used inside TravelProvider");
  return ctx;
}
