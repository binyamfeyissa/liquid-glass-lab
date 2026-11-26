import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useLocalSearchParams } from "expo-router";

/**
 * The whole template keeps its data in this one client-side store. There is
 * no backend and no persistence: state lives in memory for the session, so
 * favouriting a home on Home immediately shows it in Saved, and a viewing
 * booked on a property page lands in the Saved tab. Restarting the app
 * resets the fixtures.
 */

export type BackdropMode = "dark" | "light" | "image";

export interface Viewing {
  id: string;
  propertyId: string;
  dayKey: string;
  dayLabel: string;
  time: string;
  name: string;
  phone: string;
}

export interface SearchAlert {
  id: string;
  query: string;
  maxPrice: number | null;
  minBeds: number;
  active: boolean;
}

export interface BuyerProfile {
  name: string;
  email: string;
  budget: string;
}

interface HomesState {
  backdrop: BackdropMode;
  setBackdrop: (value: BackdropMode) => void;
  /** Derived: true unless the backdrop is the broken-white light mode. */
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;

  favourites: string[];
  toggleFavourite: (propertyId: string) => void;
  isFavourite: (propertyId: string) => boolean;

  viewings: Viewing[];
  addViewing: (viewing: Omit<Viewing, "id">) => void;
  cancelViewing: (id: string) => void;

  alerts: SearchAlert[];
  addAlert: (alert: Omit<SearchAlert, "id" | "active">) => void;
  setAlertActive: (id: string, active: boolean) => void;
  deleteAlert: (id: string) => void;

  profile: BuyerProfile;
  setProfile: (profile: BuyerProfile) => void;

  notifyNewListings: boolean;
  setNotifyNewListings: (value: boolean) => void;
  notifyPriceDrops: boolean;
  setNotifyPriceDrops: (value: boolean) => void;
  notifyViewingReminders: boolean;
  setNotifyViewingReminders: (value: boolean) => void;
}

const HomesContext = createContext<HomesState | null>(null);

let nextId = 1;
function uid(prefix: string): string {
  nextId += 1;
  return `${prefix}-${nextId}`;
}

export function HomesProvider({ children }: { children: ReactNode }) {
  // The host (template list) passes its current backdrop mode as a route
  // param (`backdrop`) when opening a template, so the template opens on
  // the same background the owner just picked. Standalone there is no
  // param and the template keeps its dark default. Read once on mount
  // (lazy initialiser) so navigating inside the template never resets it.
  const params = useLocalSearchParams();
  const [backdrop, setBackdrop] = useState<BackdropMode>(() => {
    const p = params.backdrop;
    const v = Array.isArray(p) ? p[0] : p;
    return v === "dark" || v === "light" || v === "image" ? v : "dark";
  });
  const darkMode = backdrop !== "light";
  const setDarkMode = useCallback((value: boolean) => {
    setBackdrop(value ? "dark" : "light");
  }, []);
  const [favourites, setFavourites] = useState<string[]>(["maple-house"]);
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [alerts, setAlerts] = useState<SearchAlert[]>([
    { id: "alert-seed", query: "Northside", maxPrice: 700000, minBeds: 3, active: true },
  ]);
  const [profile, setProfile] = useState<BuyerProfile>({
    name: "Jordan Ellis",
    email: "jordan.ellis@example.com",
    budget: "750000",
  });
  const [notifyNewListings, setNotifyNewListings] = useState(true);
  const [notifyPriceDrops, setNotifyPriceDrops] = useState(true);
  const [notifyViewingReminders, setNotifyViewingReminders] = useState(false);

  const toggleFavourite = useCallback((propertyId: string) => {
    setFavourites((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId],
    );
  }, []);

  const isFavourite = useCallback(
    (propertyId: string) => favourites.includes(propertyId),
    [favourites],
  );

  const addViewing = useCallback((viewing: Omit<Viewing, "id">) => {
    setViewings((prev) => [...prev, { ...viewing, id: uid("viewing") }]);
  }, []);

  const cancelViewing = useCallback((id: string) => {
    setViewings((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const addAlert = useCallback((alert: Omit<SearchAlert, "id" | "active">) => {
    setAlerts((prev) => [...prev, { ...alert, id: uid("alert"), active: true }]);
  }, []);

  const setAlertActive = useCallback((id: string, active: boolean) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, active } : a)));
  }, []);

  const deleteAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const value = useMemo<HomesState>(
    () => ({
      backdrop,
      setBackdrop,
      darkMode,
      setDarkMode,
      favourites,
      toggleFavourite,
      isFavourite,
      viewings,
      addViewing,
      cancelViewing,
      alerts,
      addAlert,
      setAlertActive,
      deleteAlert,
      profile,
      setProfile,
      notifyNewListings,
      setNotifyNewListings,
      notifyPriceDrops,
      setNotifyPriceDrops,
      notifyViewingReminders,
      setNotifyViewingReminders,
    }),
    [
      backdrop,
      darkMode,
      setDarkMode,
      favourites,
      toggleFavourite,
      isFavourite,
      viewings,
      addViewing,
      cancelViewing,
      alerts,
      addAlert,
      setAlertActive,
      deleteAlert,
      profile,
      notifyNewListings,
      notifyPriceDrops,
      notifyViewingReminders,
    ],
  );

  return <HomesContext.Provider value={value}>{children}</HomesContext.Provider>;
}

export function useHomes(): HomesState {
  const ctx = useContext(HomesContext);
  if (!ctx) throw new Error("useHomes must be used inside <HomesProvider>");
  return ctx;
}
