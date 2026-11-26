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
 * no backend: screens read and write here, so an edit on one screen is
 * visible on every other screen immediately (try Edit profile -> Profile).
 */

export interface ProfileData {
  name: string;
  username: string;
  bio: string;
  role: string;
}

export interface NotificationSettings {
  mentions: boolean;
  replies: boolean;
  follows: boolean;
  productNews: boolean;
  weeklyDigest: boolean;
  securityAlerts: boolean;
  /** Index into ["Off", "Night", "Weekends"] on the Notifications screen. */
  quietHoursIndex: number;
}

export type TextSizeChoice = "small" | "default" | "large";

export interface AppearanceSettings {
  /** 0-100, drives the tint wash of the preview glass on Appearance. */
  glassIntensity: number;
  textSize: TextSizeChoice;
}

/** The three backgrounds. Every Glacia `isDark` prop derives from it. */
export type BackdropMode = "dark" | "light" | "image";

export interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export type NotificationKey = Exclude<keyof NotificationSettings, "quietHoursIndex">;

interface AppState {
  profile: ProfileData;
  /** Bundled portrait for the profile owner, shown on the Profile screen. */
  profileImage: number;
  saveProfile: (next: ProfileData) => void;

  notifications: NotificationSettings;
  setNotification: (key: NotificationKey, value: boolean) => void;
  setQuietHours: (index: number) => void;

  appearance: AppearanceSettings;
  setAppearance: (patch: Partial<AppearanceSettings>) => void;
  /** The three backgrounds. Every Glacia `isDark` prop derives from it. */
  backdrop: BackdropMode;
  setBackdrop: (value: BackdropMode) => void;
  /** Derived: true unless the backdrop is the broken-white light mode. */
  isDark: boolean;
  /**
   * Value threaded into every Glacia component's `isDark` prop.
   * Same as `isDark`: the backdrop is the single source of truth.
   */
  glaciaDark: boolean;
  /** Multiplier applied to Glacia Text sizes by the `T` component. */
  textScale: number;

  twoFactor: boolean;
  setTwoFactor: (value: boolean) => void;

  sessions: Session[];
  revokeSession: (id: string) => void;
  revokeAllOtherSessions: () => void;
}

const AppStateContext = createContext<AppState | null>(null);

const TEXT_SCALES: Record<TextSizeChoice, number> = {
  small: 0.9,
  default: 1,
  large: 1.15,
};

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileData>({
    name: "Jordan Ellis",
    username: "jordanellis",
    bio: "Designing calm software at Northwind. Previously fintech.",
    role: "Product Designer",
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    mentions: true,
    replies: true,
    follows: false,
    productNews: false,
    weeklyDigest: true,
    securityAlerts: true,
    quietHoursIndex: 1,
  });

  const [appearance, setAppearanceState] = useState<AppearanceSettings>({
    glassIntensity: 65,
    textSize: "default",
  });

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
  const isDark = backdrop !== "light";

  const [twoFactor, setTwoFactor] = useState(true);

  const [sessions, setSessions] = useState<Session[]>([
    {
      id: "s1",
      device: "iPhone 17 Pro · Northwind for iOS",
      location: "Addis Ababa, Ethiopia",
      lastActive: "Active now",
      current: true,
    },
    {
      id: "s2",
      device: "MacBook Pro 14″ · Northwind for Mac",
      location: "Addis Ababa, Ethiopia",
      lastActive: "2 hours ago",
      current: false,
    },
    {
      id: "s3",
      device: "Chrome on Windows · Northwind Web",
      location: "Nairobi, Kenya",
      lastActive: "3 days ago",
      current: false,
    },
    {
      id: "s4",
      device: "iPad Air · Northwind for iOS",
      location: "Addis Ababa, Ethiopia",
      lastActive: "Last week",
      current: false,
    },
  ]);

  const saveProfile = useCallback((next: ProfileData) => setProfile(next), []);

  const setNotification = useCallback((key: NotificationKey, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setQuietHours = useCallback((index: number) => {
    setNotifications((prev) => ({ ...prev, quietHoursIndex: index }));
  }, []);

  const setAppearance = useCallback((patch: Partial<AppearanceSettings>) => {
    setAppearanceState((prev) => ({ ...prev, ...patch }));
  }, []);

  const revokeSession = useCallback((id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const revokeAllOtherSessions = useCallback(() => {
    setSessions((prev) => prev.filter((s) => s.current));
  }, []);

  const value = useMemo<AppState>(() => {
    return {
      profile,
      profileImage: require("./assets/img/user-jordan-ellis.jpg"),
      saveProfile,
      notifications,
      setNotification,
      setQuietHours,
      appearance,
      setAppearance,
      backdrop,
      setBackdrop,
      isDark,
      glaciaDark: isDark,
      textScale: TEXT_SCALES[appearance.textSize],
      twoFactor,
      setTwoFactor,
      sessions,
      revokeSession,
      revokeAllOtherSessions,
    };
  }, [
    profile,
    saveProfile,
    notifications,
    setNotification,
    setQuietHours,
    appearance,
    setAppearance,
    backdrop,
    setBackdrop,
    isDark,
    twoFactor,
    sessions,
    revokeSession,
    revokeAllOtherSessions,
  ]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}
