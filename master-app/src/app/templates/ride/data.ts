/**
 * Fixtures + the fare engine for Drift.
 *
 * Every price in the app comes out of `fareFor`, so the quote on Home,
 * the breakdown on the completion screen and the numbers in Activity
 * always add up to the cent: each component is rounded to cents first,
 * the service fee is 12% of the subtotal (also rounded), and the total
 * is the plain sum of the four printed lines.
 */

export interface Place {
  id: string;
  label: string;
  address: string;
  /** Fixture trip length from the default pickup point. */
  distanceKm: number;
  durationMin: number;
  /** Saved places (Home / Work / favourites) vs. the popular list. */
  saved?: boolean;
}

export const PICKUP: Place = {
  id: "pickup",
  label: "Current location",
  address: "248 Maple St",
  distanceKm: 0,
  durationMin: 0,
};

/** Popular destinations anyone can pick, saved or not. */
export const POPULAR_PLACES: Place[] = [
  { id: "airport", label: "Northwind Intl Airport", address: "1 Terminal Way", distanceKm: 18.4, durationMin: 32 },
  { id: "station", label: "Central Station", address: "900 Union Sq", distanceKm: 3.2, durationMin: 11 },
  { id: "mall", label: "Harbor Mall", address: "44 Harbor Blvd", distanceKm: 5.6, durationMin: 16 },
  { id: "office", label: "Northwind HQ", address: "1200 Founders Row", distanceKm: 4.1, durationMin: 13 },
  { id: "park", label: "Riverside Park", address: "7 Riverwalk Ave", distanceKm: 2.4, durationMin: 9 },
  { id: "hospital", label: "St. Anne's Hospital", address: "310 Care Lane", distanceKm: 6.8, durationMin: 18 },
];

export const SEED_SAVED_PLACES: Place[] = [
  { id: "home", label: "Home", address: "248 Maple St, Apt 4B", distanceKm: 0.8, durationMin: 4, saved: true },
  { id: "work", label: "Work", address: "1200 Founders Row, Floor 8", distanceKm: 4.1, durationMin: 13, saved: true },
  { id: "gym", label: "Form Studio Gym", address: "18 Atlas Way", distanceKm: 1.9, durationMin: 7, saved: true },
];

export interface RideClass {
  id: string;
  name: string;
  blurb: string;
  seats: number;
  base: number;
  perKm: number;
  perMin: number;
  /** Minutes until a car of this class reaches the pickup point. */
  etaMin: number;
}

export const RIDE_CLASSES: RideClass[] = [
  { id: "economy", name: "Economy", blurb: "Everyday rides, compact cars", seats: 4, base: 2.5, perKm: 0.9, perMin: 0.22, etaMin: 4 },
  { id: "comfort", name: "Comfort", blurb: "Newer cars, extra legroom", seats: 4, base: 4.0, perKm: 1.4, perMin: 0.32, etaMin: 6 },
  { id: "xl", name: "XL", blurb: "SUVs for groups and luggage", seats: 6, base: 5.5, perKm: 1.8, perMin: 0.4, etaMin: 8 },
];

export interface Driver {
  id: string;
  name: string;
  rating: number;
  trips: number;
  car: string;
  plate: string;
}

export const DRIVERS: Driver[] = [
  { id: "d1", name: "Marcus Webb", rating: 4.94, trips: 3210, car: "Toyota Corolla · Silver", plate: "DRF-4821" },
  { id: "d2", name: "Ana Souza", rating: 4.89, trips: 1875, car: "Honda Civic · White", plate: "DRF-9034" },
  { id: "d3", name: "Ken Watanabe", rating: 4.97, trips: 5402, car: "Tesla Model 3 · Blue", plate: "DRF-6118" },
];

/** The driver a class dispatches: deterministic, so quotes are stable. */
export function driverForClass(classId: string): Driver {
  const idx = RIDE_CLASSES.findIndex((c) => c.id === classId);
  return DRIVERS[Math.max(0, idx) % DRIVERS.length];
}

export interface Fare {
  base: number;
  distanceCharge: number;
  timeCharge: number;
  serviceFee: number;
  /** base + distance + time + fee — exact to the cent. */
  total: number;
}

const cents = (n: number) => Math.round(n * 100) / 100;

export function fareFor(rideClass: RideClass, distanceKm: number, durationMin: number): Fare {
  const base = cents(rideClass.base);
  const distanceCharge = cents(rideClass.perKm * distanceKm);
  const timeCharge = cents(rideClass.perMin * durationMin);
  const subtotal = cents(base + distanceCharge + timeCharge);
  const serviceFee = cents(subtotal * 0.12);
  return { base, distanceCharge, timeCharge, serviceFee, total: cents(subtotal + serviceFee) };
}

export function classById(id: string): RideClass {
  return RIDE_CLASSES.find((c) => c.id === id) ?? RIDE_CLASSES[0];
}

export function placeById(places: Place[], id: string): Place | undefined {
  return [...places, ...POPULAR_PLACES].find((p) => p.id === id);
}
