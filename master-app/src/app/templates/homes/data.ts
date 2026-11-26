/**
 * Haven — fixture catalogue.
 *
 * Twelve properties, three agents, and the small helpers every screen
 * shares (money formatting, the mortgage formula, viewing-day generation).
 * Everything is fictional and client-side: no network, no real listings.
 */

export type PropertyType = "House" | "Flat" | "Bungalow" | "Terrace";
export type PropertyStatus = "For sale" | "New" | "Under offer" | "Reduced";

export interface Property {
  id: string;
  /** Bundled property photo (assets/img/). */
  image: number;
  title: string;
  address: string;
  area: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  type: PropertyType;
  tenure: "Freehold" | "Leasehold";
  status: PropertyStatus;
  newBuild: boolean;
  featured?: boolean;
  /** Days since the listing went live — drives the "Newest" sort. */
  listedDaysAgo: number;
  /** Two hues for the composed SVG visual — averaged, then mixed toward
   *  the mode neutral to form the property's one flat plate colour. */
  palette: [string, string];
  /** Hue for the building silhouette, mixed toward the ink in the visual. */
  silhouette: string;
  features: string[];
  description: string;
  agentId: string;
}

export interface Agent {
  id: string;
  /** Bundled portrait (assets/img/). */
  image: number;
  name: string;
  role: string;
  phone: string;
  rating: number;
  sales: number;
}

export const AGENTS: Agent[] = [
  { id: "ag-ava", image: require("./assets/img/agent-ava-lindqvist.jpg"), name: "Ava Lindqvist", role: "Senior agent · Northside", phone: "+1 (555) 014-2200", rating: 4.9, sales: 132 },
  { id: "ag-marcus", image: require("./assets/img/agent-marcus-webb.jpg"), name: "Marcus Webb", role: "Agent · Riverside", phone: "+1 (555) 014-2287", rating: 4.8, sales: 98 },
  { id: "ag-priya", image: require("./assets/img/agent-priya-nair.jpg"), name: "Priya Nair", role: "New homes specialist", phone: "+1 (555) 014-2319", rating: 5.0, sales: 76 },
];

/** Bundled portrait for the signed-in buyer (Jordan Ellis). */
export const USER_IMAGE = require("./assets/img/user-jordan-ellis.jpg");

export function agentOf(property: Property): Agent {
  return AGENTS.find((a) => a.id === property.agentId) ?? AGENTS[0];
}

export const PROPERTIES: Property[] = [
  {
    id: "maple-house",
    image: require("./assets/img/property-maple-house.jpg"),
    title: "Maple House",
    address: "14 Maple Row",
    area: "Northside",
    price: 685000,
    beds: 4,
    baths: 3,
    sqft: 2140,
    type: "House",
    tenure: "Freehold",
    status: "For sale",
    newBuild: false,
    featured: true,
    listedDaysAgo: 6,
    palette: ["#7dd3fc", "#e0f2fe"],
    silhouette: "#b45309",
    features: ["South-facing garden", "Home office", "Log burner", "EV charging point", "Utility room", "Loft storage"],
    description:
      "A generous four-bedroom family house on a quiet tree-lined row. The kitchen-diner opens straight onto the south-facing garden, and the top floor carries a proper home office with room for two desks. Sold with no onward chain.",
    agentId: "ag-ava",
  },
  {
    id: "harbour-flat",
    image: require("./assets/img/property-harbour-flat.jpg"),
    title: "Harbour View Flat",
    address: "Flat 9, Beacon Quay",
    area: "Riverside",
    price: 342000,
    beds: 2,
    baths: 2,
    sqft: 890,
    type: "Flat",
    tenure: "Leasehold",
    status: "New",
    newBuild: false,
    listedDaysAgo: 1,
    palette: ["#fda4af", "#fef3c7"],
    silhouette: "#0e7490",
    features: ["Balcony over the marina", "Concierge", "Residents' gym", "Allocated parking", "Open-plan kitchen"],
    description:
      "Ninth-floor light and a balcony that catches the evening sun over the marina. Open-plan living, two proper double bedrooms, and a concierge downstairs. A short walk to the station and the quay cafés.",
    agentId: "ag-marcus",
  },
  {
    id: "willow-bungalow",
    image: require("./assets/img/property-willow-bungalow.jpg"),
    title: "Willow Bungalow",
    address: "3 Willow Close",
    area: "Elm Park",
    price: 458000,
    beds: 3,
    baths: 2,
    sqft: 1280,
    type: "Bungalow",
    tenure: "Freehold",
    status: "For sale",
    newBuild: false,
    listedDaysAgo: 12,
    palette: ["#86efac", "#fef9c3"],
    silhouette: "#166534",
    features: ["Single-storey living", "Conservatory", "Driveway for three cars", "Village shop nearby", "New boiler 2025"],
    description:
      "All on one level at the end of a peaceful close. A bright conservatory runs along the back, the garden is flat and easy to keep, and the third bedroom works just as well as a study or snug.",
    agentId: "ag-ava",
  },
  {
    id: "foundry-loft",
    image: require("./assets/img/property-foundry-loft.jpg"),
    title: "The Foundry Loft",
    address: "Unit 4, Ironworks Yard",
    area: "Old Foundry District",
    price: 519000,
    beds: 2,
    baths: 2,
    sqft: 1215,
    type: "Flat",
    tenure: "Leasehold",
    status: "Under offer",
    newBuild: false,
    listedDaysAgo: 21,
    palette: ["#c4b5fd", "#fbcfe8"],
    silhouette: "#7c2d12",
    features: ["Double-height ceilings", "Original iron columns", "Mezzanine study", "Shared courtyard", "Bike store"],
    description:
      "A conversion with real character: double-height ceilings, exposed brick, and the foundry's original iron columns left in place. The mezzanine makes a natural study above the living space.",
    agentId: "ag-marcus",
  },
  {
    id: "skyline-penthouse",
    image: require("./assets/img/property-skyline-penthouse.jpg"),
    title: "Skyline Penthouse",
    address: "PH1, Meridian Tower",
    area: "City Centre",
    price: 1240000,
    beds: 3,
    baths: 3,
    sqft: 1980,
    type: "Flat",
    tenure: "Leasehold",
    status: "For sale",
    newBuild: true,
    featured: true,
    listedDaysAgo: 4,
    palette: ["#93c5fd", "#ddd6fe"],
    silhouette: "#1e3a8a",
    features: ["360° terrace", "Private lift lobby", "Two parking bays", "Spa bathroom", "Smart home throughout"],
    description:
      "The top floor of Meridian Tower, wrapped in a terrace that looks over the whole city. Private lift lobby, a spa-style main bathroom, and finishes chosen by the developer's flagship team.",
    agentId: "ag-priya",
  },
  {
    id: "cedar-terrace",
    image: require("./assets/img/property-cedar-terrace.jpg"),
    title: "Cedar Terrace",
    address: "27 Cedar Avenue",
    area: "Northside",
    price: 398000,
    beds: 3,
    baths: 1,
    sqft: 1040,
    type: "Terrace",
    tenure: "Freehold",
    status: "Reduced",
    newBuild: false,
    listedDaysAgo: 34,
    palette: ["#fcd34d", "#ffedd5"],
    silhouette: "#9a3412",
    features: ["Bay-fronted lounge", "Cellar", "Rear yard with shed", "Close to the park", "New roof 2024"],
    description:
      "A classic bay-fronted terrace a minute from the park gates. Three bedrooms, a useful cellar, and a sunny rear yard. Priced to reflect that the kitchen is ready for its next owner's ideas.",
    agentId: "ag-ava",
  },
  {
    id: "garden-mews",
    image: require("./assets/img/property-garden-mews.jpg"),
    title: "Garden Mews",
    address: "2 Garden Mews",
    area: "Old Town",
    price: 565000,
    beds: 3,
    baths: 2,
    sqft: 1390,
    type: "House",
    tenure: "Freehold",
    status: "For sale",
    newBuild: true,
    listedDaysAgo: 9,
    palette: ["#6ee7b7", "#ecfccb"],
    silhouette: "#065f46",
    features: ["Cobbled mews setting", "Integrated garage", "Rooftop terrace", "Underfloor heating", "A-rated efficiency"],
    description:
      "A new-build mews house behind the old town gates — cobbles outside, calm inside. Rooftop terrace, integrated garage, and underfloor heating on the ground floor. Ten-year build warranty included.",
    agentId: "ag-priya",
  },
  {
    id: "station-studio",
    image: require("./assets/img/property-station-studio.jpg"),
    title: "Station Studio",
    address: "Flat 2, Signal House",
    area: "Riverside",
    price: 189000,
    beds: 1,
    baths: 1,
    sqft: 460,
    type: "Flat",
    tenure: "Leasehold",
    status: "For sale",
    newBuild: false,
    listedDaysAgo: 15,
    palette: ["#fca5a5", "#fee2e2"],
    silhouette: "#7f1d1d",
    features: ["Two minutes to the station", "Fitted wardrobes", "Ideal first home", "Low service charge", "South-facing window wall"],
    description:
      "A compact, clever studio two minutes from the station — the classic first step onto the ladder. A wall of south-facing glass keeps it bright, and the service charge is among the lowest in the building.",
    agentId: "ag-marcus",
  },
  {
    id: "ashford-house",
    image: require("./assets/img/property-ashford-house.jpg"),
    title: "Ashford House",
    address: "88 Ashford Lane",
    area: "Elm Park",
    price: 912000,
    beds: 5,
    baths: 4,
    sqft: 3120,
    type: "House",
    tenure: "Freehold",
    status: "New",
    newBuild: false,
    listedDaysAgo: 2,
    palette: ["#7dd3fc", "#cffafe"],
    silhouette: "#854d0e",
    features: ["Annexe for guests", "Heated pool", "Double garage", "Acre of grounds", "Cinema room"],
    description:
      "A substantial five-bedroom house with a self-contained guest annexe and close to an acre of grounds. Heated pool, cinema room, and a kitchen built for feeding a crowd. Viewing by appointment.",
    agentId: "ag-ava",
  },
  {
    id: "birchwood-flat",
    image: require("./assets/img/property-birchwood-flat.jpg"),
    title: "Birchwood Court Flat",
    address: "Flat 17, Birchwood Court",
    area: "Westfield",
    price: 264000,
    beds: 2,
    baths: 1,
    sqft: 720,
    type: "Flat",
    tenure: "Leasehold",
    status: "For sale",
    newBuild: false,
    listedDaysAgo: 18,
    palette: ["#a5b4fc", "#e0e7ff"],
    silhouette: "#3730a3",
    features: ["Communal gardens", "Lift access", "Storage unit", "Bus route outside", "Chain free"],
    description:
      "A tidy two-bedroom flat in a well-kept court with communal gardens. Lift access, its own storage unit, and no onward chain — a straightforward buy for movers and investors alike.",
    agentId: "ag-marcus",
  },
  {
    id: "orchard-cottage",
    image: require("./assets/img/property-orchard-cottage.jpg"),
    title: "Orchard Cottage",
    address: "1 Orchard Lane",
    area: "Village Edge",
    price: 497000,
    beds: 3,
    baths: 2,
    sqft: 1310,
    type: "House",
    tenure: "Freehold",
    status: "For sale",
    newBuild: false,
    listedDaysAgo: 11,
    palette: ["#bef264", "#fefce8"],
    silhouette: "#3f6212",
    features: ["Inglenook fireplace", "Orchard garden", "Beamed ceilings", "Village pub nearby", "Wood store"],
    description:
      "A storybook cottage at the end of the lane, with an orchard garden and an inglenook fireplace in the sitting room. Beams throughout, but a thoroughly modern kitchen and bathroom where it counts.",
    agentId: "ag-ava",
  },
  {
    id: "meridian-duplex",
    image: require("./assets/img/property-meridian-duplex.jpg"),
    title: "Meridian Duplex",
    address: "12B Meridian Quarter",
    area: "City Centre",
    price: 735000,
    beds: 3,
    baths: 2,
    sqft: 1560,
    type: "Flat",
    tenure: "Leasehold",
    status: "New",
    newBuild: true,
    listedDaysAgo: 3,
    palette: ["#67e8f9", "#e0f2fe"],
    silhouette: "#164e63",
    features: ["Two-floor layout", "Private entrance", "Terrace off the kitchen", "Residents' roof garden", "Concierge"],
    description:
      "A duplex with its own front door in the newest quarter of the centre. Living space up, bedrooms down, a terrace off the kitchen, and the residents' roof garden one floor above.",
    agentId: "ag-priya",
  },
];

export function propertyById(id: string): Property | undefined {
  return PROPERTIES.find((p) => p.id === id);
}

/* ------------------------------------------------------------------ */
/*  Formatting + mortgage maths.                                       */
/* ------------------------------------------------------------------ */

export function money(amount: number): string {
  return `$${Math.round(amount).toLocaleString("en-US")}`;
}

export function moneyExact(amount: number): string {
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** The fixed illustrative rate used by the mortgage calculator. */
export const MORTGAGE_RATE = 4.8;

/**
 * Standard amortising-loan payment:
 *   M = P · r(1+r)^n / ((1+r)^n − 1),  r = annual rate / 12, n = months.
 */
export function monthlyPayment(price: number, depositPct: number, years: number): number {
  const principal = price * (1 - depositPct / 100);
  if (principal <= 0) return 0;
  const r = MORTGAGE_RATE / 100 / 12;
  const n = years * 12;
  const factor = Math.pow(1 + r, n);
  return (principal * r * factor) / (factor - 1);
}

/* ------------------------------------------------------------------ */
/*  Viewing days — the next seven days, generated from today.          */
/* ------------------------------------------------------------------ */

export interface ViewingDay {
  /** ISO date key, e.g. "2026-11-23". */
  key: string;
  /** Short label, e.g. "Mon 23". */
  label: string;
  /** Long label, e.g. "Monday 23 November". */
  longLabel: string;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function nextSevenDays(from = new Date()): ViewingDay[] {
  const days: ViewingDay[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;
    days.push({
      key,
      label: i === 0 ? "Today" : `${DAY_NAMES[d.getDay()].slice(0, 3)} ${d.getDate()}`,
      longLabel: `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`,
    });
  }
  return days;
}

export const TIME_SLOTS = ["10:00", "11:30", "13:00", "14:30", "16:00", "17:30"];

/** Deterministic "already taken" slots so the booking flow feels real. */
export function takenSlots(propertyId: string, dayKey: string): string[] {
  let hash = 0;
  const s = `${propertyId}|${dayKey}`;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  const taken: string[] = [];
  TIME_SLOTS.forEach((slot, i) => {
    if ((hash >> (i * 3)) % 3 === 0) taken.push(slot);
  });
  return taken;
}
