import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  DRIVERS,
  SEED_SAVED_PLACES,
  classById,
  driverForClass,
  fareFor,
  type Driver,
  type Fare,
  type Place,
} from "./data";

/**
 * The whole template keeps its data in this one client-side store. There
 * is no backend and no persistence: state lives in memory for the session,
 * so a trip you finish on the booking flow immediately appears in
 * Activity, and a place you save shows up on Home. Restarting the app
 * resets the fixtures.
 */

export type TripStatus = "completed" | "unpaid" | "cancelled";

export type BackdropMode = "dark" | "light" | "image";

export interface Trip {
  id: string;
  destinationLabel: string;
  destinationAddress: string;
  pickupAddress: string;
  rideClassId: string;
  rideClassName: string;
  distanceKm: number;
  durationMin: number;
  fare: Fare;
  tip: number;
  driver: Driver;
  dateLabel: string;
  status: TripStatus;
  /** The rider's rating of the driver, once given. */
  rating?: number;
}

export interface PaymentCard {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

export interface Booking {
  destination: Place;
  rideClassId: string;
}

interface RideState {
  userName: string;
  userPhone: string;
  userEmail: string;
  userRating: number;
  userTrips: number;
  saveProfile: (name: string, phone: string, email: string) => void;

  savedPlaces: Place[];
  addPlace: (label: string, address: string) => Place;
  removePlace: (id: string) => void;

  cards: PaymentCard[];
  addCard: (number: string, expiry: string) => PaymentCard;
  setDefaultCard: (id: string) => void;
  removeCard: (id: string) => void;
  defaultCard: PaymentCard | undefined;

  trips: Trip[];
  tripById: (id: string) => Trip | undefined;

  /** The ride currently being booked / ridden, if any. */
  booking: Booking | null;
  startBooking: (destination: Place, rideClassId: string) => void;
  clearBooking: () => void;
  /** Called when the driver arrives at the destination: creates the unpaid trip. */
  finishRide: () => Trip;
  payTrip: (tripId: string, tip: number, rating: number) => void;

  backdrop: BackdropMode;
  setBackdrop: (value: BackdropMode) => void;
  /** Derived: true unless the backdrop is the broken-white light mode. */
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  tripUpdates: boolean;
  setTripUpdates: (value: boolean) => void;
  promotions: boolean;
  setPromotions: (value: boolean) => void;
  receipts: boolean;
  setReceipts: (value: boolean) => void;
}

const RideContext = createContext<RideState | null>(null);

function seedTrip(
  id: string,
  destination: Place,
  classId: string,
  driverIdx: number,
  dateLabel: string,
  rating?: number,
): Trip {
  const rc = classById(classId);
  return {
    id,
    destinationLabel: destination.label,
    destinationAddress: destination.address,
    pickupAddress: "248 Maple St",
    rideClassId: rc.id,
    rideClassName: rc.name,
    distanceKm: destination.distanceKm,
    durationMin: destination.durationMin,
    fare: fareFor(rc, destination.distanceKm, destination.durationMin),
    tip: 0,
    driver: DRIVERS[driverIdx % DRIVERS.length],
    dateLabel,
    status: "completed",
    rating,
  };
}

const SEED_TRIPS: Trip[] = [
  seedTrip("t1", { id: "s1", label: "Central Station", address: "900 Union Sq", distanceKm: 3.2, durationMin: 11 }, "economy", 0, "Today · 9:12 AM", 5),
  seedTrip("t2", { id: "s2", label: "Harbor Mall", address: "44 Harbor Blvd", distanceKm: 5.6, durationMin: 16 }, "comfort", 1, "Yesterday · 6:40 PM", 5),
  seedTrip("t3", { id: "s3", label: "Northwind Intl Airport", address: "1 Terminal Way", distanceKm: 18.4, durationMin: 32 }, "xl", 2, "Sun · 5:05 AM", 4),
  seedTrip("t4", { id: "s4", label: "Riverside Park", address: "7 Riverwalk Ave", distanceKm: 2.4, durationMin: 9 }, "economy", 1, "Sat · 11:26 AM"),
];

const SEED_CARDS: PaymentCard[] = [
  { id: "c1", brand: "Visa", last4: "4821", expiry: "08/28", isDefault: true },
  { id: "c2", brand: "Mastercard", last4: "9034", expiry: "03/27", isDefault: false },
];

let counter = 100;
const nextId = (prefix: string) => `${prefix}${++counter}`;

function brandOf(number: string): string {
  const digits = number.replace(/\D/g, "");
  if (digits.startsWith("4")) return "Visa";
  if (/^5[1-5]/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  return "Card";
}

export function RideProvider({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState("Jordan Ellis");
  const [userPhone, setUserPhone] = useState("+1 555 014 2288");
  const [userEmail, setUserEmail] = useState("jordan@example.com");
  const [savedPlaces, setSavedPlaces] = useState<Place[]>(SEED_SAVED_PLACES);
  const [cards, setCards] = useState<PaymentCard[]>(SEED_CARDS);
  const [trips, setTrips] = useState<Trip[]>(SEED_TRIPS);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [backdrop, setBackdrop] = useState<BackdropMode>("dark");
  const darkMode = backdrop !== "light";
  const setDarkMode = useCallback((value: boolean) => {
    setBackdrop(value ? "dark" : "light");
  }, []);
  const [tripUpdates, setTripUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [receipts, setReceipts] = useState(true);

  const saveProfile = useCallback((name: string, phone: string, email: string) => {
    setUserName(name.trim());
    setUserPhone(phone.trim());
    setUserEmail(email.trim());
  }, []);

  const addPlace = useCallback((label: string, address: string) => {
    const place: Place = {
      id: nextId("p"),
      label: label.trim(),
      address: address.trim(),
      // Fixture trip length for user-added places: plausible mid-range.
      distanceKm: 3.8,
      durationMin: 12,
      saved: true,
    };
    setSavedPlaces((prev) => [...prev, place]);
    return place;
  }, []);

  const removePlace = useCallback((id: string) => {
    setSavedPlaces((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addCard = useCallback((number: string, expiry: string) => {
    const digits = number.replace(/\D/g, "");
    const card: PaymentCard = {
      id: nextId("c"),
      brand: brandOf(number),
      last4: digits.slice(-4),
      expiry,
      isDefault: false,
    };
    setCards((prev) => [...prev, card]);
    return card;
  }, []);

  const setDefaultCard = useCallback((id: string) => {
    setCards((prev) => prev.map((c) => ({ ...c, isDefault: c.id === id })));
  }, []);

  const removeCard = useCallback((id: string) => {
    setCards((prev) => {
      const next = prev.filter((c) => c.id !== id);
      // Never leave the wallet without a default if cards remain.
      if (next.length > 0 && !next.some((c) => c.isDefault)) {
        next[0] = { ...next[0], isDefault: true };
      }
      return next;
    });
  }, []);

  const startBooking = useCallback((destination: Place, rideClassId: string) => {
    setBooking({ destination, rideClassId });
  }, []);

  const clearBooking = useCallback(() => setBooking(null), []);

  const finishRide = useCallback((): Trip => {
    if (!booking) throw new Error("finishRide called with no active booking");
    const rc = classById(booking.rideClassId);
    const trip: Trip = {
      id: nextId("t"),
      destinationLabel: booking.destination.label,
      destinationAddress: booking.destination.address,
      pickupAddress: "248 Maple St",
      rideClassId: rc.id,
      rideClassName: rc.name,
      distanceKm: booking.destination.distanceKm,
      durationMin: booking.destination.durationMin,
      fare: fareFor(rc, booking.destination.distanceKm, booking.destination.durationMin),
      tip: 0,
      driver: driverForClass(rc.id),
      dateLabel: "Today · Just now",
      status: "unpaid",
    };
    setTrips((prev) => [trip, ...prev]);
    setBooking(null);
    return trip;
  }, [booking]);

  const payTrip = useCallback((tripId: string, tip: number, rating: number) => {
    setTrips((prev) =>
      prev.map((t) =>
        t.id === tripId ? { ...t, tip, rating, status: "completed" as const } : t,
      ),
    );
  }, []);

  const value = useMemo<RideState>(() => {
    const tripById = (id: string) => trips.find((t) => t.id === id);
    return {
      userName,
      userPhone,
      userEmail,
      userRating: 4.92,
      userTrips: 212,
      saveProfile,
      savedPlaces,
      addPlace,
      removePlace,
      cards,
      addCard,
      setDefaultCard,
      removeCard,
      defaultCard: cards.find((c) => c.isDefault),
      trips,
      tripById,
      booking,
      startBooking,
      clearBooking,
      finishRide,
      payTrip,
      backdrop,
      setBackdrop,
      darkMode,
      setDarkMode,
      tripUpdates,
      setTripUpdates,
      promotions,
      setPromotions,
      receipts,
      setReceipts,
    };
  }, [
    userName,
    userPhone,
    userEmail,
    saveProfile,
    savedPlaces,
    addPlace,
    removePlace,
    cards,
    addCard,
    setDefaultCard,
    removeCard,
    trips,
    booking,
    startBooking,
    clearBooking,
    finishRide,
    payTrip,
    backdrop,
    darkMode,
    tripUpdates,
    promotions,
    receipts,
  ]);

  return <RideContext.Provider value={value}>{children}</RideContext.Provider>;
}

export function useRide(): RideState {
  const ctx = useContext(RideContext);
  if (!ctx) throw new Error("useRide must be used inside RideProvider");
  return ctx;
}
