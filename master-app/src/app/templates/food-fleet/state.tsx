import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  OFFERS,
  PAST_DAYS,
  RATINGS,
  SEED_JOBS,
  type DayEarning,
  type Job,
  type Rating,
} from "./data";

/**
 * The whole template keeps its data in this one client-side store. There is
 * no backend and no persistence: state lives in memory for the session, so
 * accepting an offer on Home immediately lights up the Active job screen,
 * and delivering it updates today's earnings everywhere. Restarting the
 * app resets the fixtures.
 */

/** The four stages of an active delivery, in order. */
export const STAGES = [
  "Go to pickup",
  "Confirm pickup",
  "Go to drop-off",
  "Confirm delivery",
] as const;

export type BackdropMode = "dark" | "light" | "image";

interface FleetState {
  /** The three backgrounds. `darkMode` is derived from this. */
  backdrop: BackdropMode;
  setBackdrop: (value: BackdropMode) => void;
  /** Derived: true unless the backdrop is the broken-white light mode. */
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;

  /** Rider identity, editable on the Profile tab. */
  riderName: string;
  setRiderName: (value: string) => void;
  riderPhone: string;
  setRiderPhone: (value: string) => void;
  vehicle: string;
  setVehicle: (value: string) => void;

  /** Online/offline — going offline greys the job feed on Home. */
  online: boolean;
  setOnline: (value: boolean) => void;

  /** Every job that is finished, declined, or was delivered this session. */
  jobs: Job[];
  /** The offer currently on the table, if any remain. */
  currentOffer: Job | null;
  acceptOffer: () => void;
  declineOffer: () => void;

  /** The job being delivered right now, and how far through it we are. */
  activeJob: Job | null;
  stage: number;
  advanceStage: () => void;

  /** Computed from completed jobs only. */
  todayEarnings: number;
  todayJobsDone: number;
  todayDistanceKm: number;
  week: DayEarning[];

  ratings: Rating[];
  averageRating: number;

  cashedOut: boolean;
  cashOut: () => void;

  notifyOffers: boolean;
  setNotifyOffers: (value: boolean) => void;
  notifyPayouts: boolean;
  setNotifyPayouts: (value: boolean) => void;
  lastDeliveredId: string | null;
  clearLastDelivered: () => void;
}

const FleetContext = createContext<FleetState | null>(null);

function nowLabel(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function FleetProvider({ children }: { children: ReactNode }) {
  const [backdrop, setBackdrop] = useState<BackdropMode>("dark");
  const darkMode = backdrop !== "light";
  const setDarkMode = useCallback((value: boolean) => {
    setBackdrop(value ? "dark" : "light");
  }, []);
  const [riderName, setRiderName] = useState("Alex Rider");
  const [riderPhone, setRiderPhone] = useState("+1 555 014 2288");
  const [vehicle, setVehicle] = useState("e-bike");
  const [online, setOnline] = useState(true);

  const [jobs, setJobs] = useState<Job[]>(SEED_JOBS);
  const [offerIndex, setOfferIndex] = useState(0);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [stage, setStage] = useState(0);
  const [lastDeliveredId, setLastDeliveredId] = useState<string | null>(null);

  const [cashedOut, setCashedOut] = useState(false);
  const [notifyOffers, setNotifyOffers] = useState(true);
  const [notifyPayouts, setNotifyPayouts] = useState(false);

  const currentOffer = useMemo<Job | null>(() => {
    if (activeJob) return null;
    return offerIndex < OFFERS.length ? OFFERS[offerIndex] : null;
  }, [activeJob, offerIndex]);

  const declineOffer = useCallback(() => {
    setOfferIndex((i) => i + 1);
  }, []);

  const acceptOffer = useCallback(() => {
    if (!currentOffer) return;
    setActiveJob({ ...currentOffer, status: "active", pickupTime: undefined });
    setStage(0);
    setOfferIndex((i) => i + 1);
  }, [currentOffer]);

  const advanceStage = useCallback(() => {
    if (!activeJob) return;
    if (stage === 1) {
      // Pickup confirmed — stamp the time on the job.
      setActiveJob({ ...activeJob, pickupTime: nowLabel() });
      setStage(2);
      return;
    }
    if (stage >= STAGES.length - 1) {
      const done: Job = {
        ...activeJob,
        status: "completed",
        deliveredTime: nowLabel(),
      };
      setJobs((prev) => [done, ...prev]);
      setLastDeliveredId(done.id);
      setActiveJob(null);
      setStage(0);
      return;
    }
    setStage(stage + 1);
  }, [activeJob, stage]);

  const completed = useMemo(
    () => jobs.filter((j) => j.status === "completed"),
    [jobs],
  );
  const todayEarnings = useMemo(
    () => completed.reduce((s, j) => s + j.payout, 0),
    [completed],
  );
  const todayDistanceKm = useMemo(
    () => completed.reduce((s, j) => s + j.distanceKm, 0),
    [completed],
  );

  const week = useMemo<DayEarning[]>(
    () => [
      ...PAST_DAYS,
      { day: "Today", amount: todayEarnings, jobs: completed.length },
    ],
    [todayEarnings, completed.length],
  );

  const averageRating = useMemo(
    () => RATINGS.reduce((s, r) => s + r.stars, 0) / RATINGS.length,
    [],
  );

  const value: FleetState = {
    backdrop,
    setBackdrop,
    darkMode,
    setDarkMode,
    riderName,
    setRiderName,
    riderPhone,
    setRiderPhone,
    vehicle,
    setVehicle,
    online,
    setOnline,
    jobs,
    currentOffer,
    acceptOffer,
    declineOffer,
    activeJob,
    stage,
    advanceStage,
    todayEarnings,
    todayJobsDone: completed.length,
    todayDistanceKm,
    week,
    ratings: RATINGS,
    averageRating,
    cashedOut,
    cashOut: () => setCashedOut(true),
    notifyOffers,
    setNotifyOffers,
    notifyPayouts,
    setNotifyPayouts,
    lastDeliveredId,
    clearLastDelivered: () => setLastDeliveredId(null),
  };

  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>;
}

export function useFleet(): FleetState {
  const ctx = useContext(FleetContext);
  if (!ctx) throw new Error("useFleet must be used inside <FleetProvider>");
  return ctx;
}
