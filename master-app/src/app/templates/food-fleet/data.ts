/**
 * Fixtures for the Fleet courier template. Everything is local and static —
 * no network, no images, no maps. Addresses, restaurants and payouts are
 * realistic sample data; the route "map" on the active-job screen is a
 * composed panel, not a real map.
 */

export type JobStatus = "completed" | "active" | "declined" | "offer";

export interface Job {
  id: string;
  restaurant: string;
  cuisine: string;
  pickupAddress: string;
  customerName: string;
  dropoffAddress: string;
  /** What the rider earns for this job. */
  payout: number;
  /** What the customer paid for the order. */
  orderTotal: number;
  distanceKm: number;
  items: string;
  note?: string;
  status: JobStatus;
  pickupTime?: string;
  deliveredTime?: string;
  /** Two colours for the composed restaurant tile. */
  colors: [string, string];
}

/** Offers rotate in this order; declining one shows the next. */
export const OFFERS: Job[] = [
  {
    id: "offer-1",
    restaurant: "Sakura House",
    cuisine: "Japanese · Sushi",
    pickupAddress: "214 Willow Lane",
    customerName: "Maya Chen",
    dropoffAddress: "88 Harbor View Apt 4B",
    payout: 8.4,
    orderTotal: 46.2,
    distanceKm: 3.2,
    items: "2 × Salmon nigiri set, 1 × Miso soup",
    note: "Please knock twice — baby sleeping.",
    status: "offer",
    colors: ["#f472b6", "#0d9488"],
  },
  {
    id: "offer-2",
    restaurant: "Nonna's Trattoria",
    cuisine: "Italian · Pasta",
    pickupAddress: "17 Olive Grove",
    customerName: "Daniel Okafor",
    dropoffAddress: "1200 Market Street, Floor 9",
    payout: 6.9,
    orderTotal: 32.5,
    distanceKm: 2.4,
    items: "1 × Tagliatelle al ragù, 1 × Garlic bread",
    status: "offer",
    colors: ["#f59e0b", "#b91c1c"],
  },
  {
    id: "offer-3",
    restaurant: "Green Bowl",
    cuisine: "Healthy · Salads",
    pickupAddress: "5 Fern Court",
    customerName: "Sofia Marino",
    dropoffAddress: "301 Birch Avenue",
    payout: 5.6,
    orderTotal: 24.9,
    distanceKm: 1.8,
    items: "2 × Quinoa crunch bowl, 1 × Green smoothie",
    note: "Leave at the door, text when outside.",
    status: "offer",
    colors: ["#22c55e", "#0f766e"],
  },
  {
    id: "offer-4",
    restaurant: "Burger Barn",
    cuisine: "American · Burgers",
    pickupAddress: "940 Cedar Road",
    customerName: "Liam Walsh",
    dropoffAddress: "12 Juniper Close",
    payout: 7.3,
    orderTotal: 38.75,
    distanceKm: 2.9,
    items: "2 × Smoky stack burger, 1 × Loaded fries, 2 × Shake",
    status: "offer",
    colors: ["#fb923c", "#7c2d12"],
  },
];

/** Jobs already finished (or declined) earlier today. */
export const SEED_JOBS: Job[] = [
  {
    id: "job-1",
    restaurant: "Sakura House",
    cuisine: "Japanese · Sushi",
    pickupAddress: "214 Willow Lane",
    customerName: "Priya Nair",
    dropoffAddress: "45 Aspen Way",
    payout: 7.9,
    orderTotal: 41.0,
    distanceKm: 3.0,
    items: "1 × Dragon roll, 1 × Edamame",
    status: "completed",
    pickupTime: "11:42",
    deliveredTime: "12:05",
    colors: ["#f472b6", "#0d9488"],
  },
  {
    id: "job-2",
    restaurant: "Taco Mesa",
    cuisine: "Mexican · Tacos",
    pickupAddress: "77 Agave Street",
    customerName: "Tomás Rivera",
    dropoffAddress: "9 Palm Terrace",
    payout: 6.2,
    orderTotal: 28.4,
    distanceKm: 2.1,
    items: "3 × Baja fish taco, 1 × Guacamole",
    status: "completed",
    pickupTime: "12:31",
    deliveredTime: "12:52",
    colors: ["#eab308", "#15803d"],
  },
  {
    id: "job-3",
    restaurant: "Burger Barn",
    cuisine: "American · Burgers",
    pickupAddress: "940 Cedar Road",
    customerName: "Anonymous",
    dropoffAddress: "—",
    payout: 9.1,
    orderTotal: 52.3,
    distanceKm: 4.6,
    items: "Family bundle",
    status: "declined",
    colors: ["#fb923c", "#7c2d12"],
  },
  {
    id: "job-4",
    restaurant: "Green Bowl",
    cuisine: "Healthy · Salads",
    pickupAddress: "5 Fern Court",
    customerName: "Hana Kim",
    dropoffAddress: "160 Rowan Street",
    payout: 5.8,
    orderTotal: 22.6,
    distanceKm: 1.6,
    items: "1 × Miso aubergine bowl",
    status: "completed",
    pickupTime: "13:14",
    deliveredTime: "13:29",
    colors: ["#22c55e", "#0f766e"],
  },
];

export interface DayEarning {
  day: string;
  amount: number;
  jobs: number;
}

/** The six days before today; today's bar is computed live from jobs. */
export const PAST_DAYS: DayEarning[] = [
  { day: "Thu", amount: 62.4, jobs: 9 },
  { day: "Fri", amount: 84.1, jobs: 12 },
  { day: "Sat", amount: 96.7, jobs: 14 },
  { day: "Sun", amount: 41.3, jobs: 6 },
  { day: "Mon", amount: 71.9, jobs: 10 },
  { day: "Tue", amount: 58.2, jobs: 8 },
];

export interface Rating {
  id: string;
  stars: number;
  comment: string;
  when: string;
  source: string;
}

export const RATINGS: Rating[] = [
  {
    id: "r1",
    stars: 5,
    comment: "Food arrived hot and fast. Lovely rider!",
    when: "Today, 13:31",
    source: "Green Bowl order",
  },
  {
    id: "r2",
    stars: 5,
    comment: "Followed the delivery note exactly.",
    when: "Today, 12:07",
    source: "Sakura House order",
  },
  {
    id: "r3",
    stars: 4,
    comment: "Quick, but the drink had spilled a little.",
    when: "Yesterday, 19:44",
    source: "Burger Barn order",
  },
  {
    id: "r4",
    stars: 5,
    comment: "Waited patiently at the gate. Thank you!",
    when: "Yesterday, 18:12",
    source: "Nonna's Trattoria order",
  },
  {
    id: "r5",
    stars: 5,
    comment: "Polite and careful with a fragile cake box.",
    when: "Monday, 20:03",
    source: "Petit Four order",
  },
];

export const VEHICLES = [
  { value: "bicycle", label: "Bicycle" },
  { value: "e-bike", label: "E-bike" },
  { value: "scooter", label: "Scooter" },
  { value: "car", label: "Car" },
];
