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
 * adding an expense on the Add screen immediately changes the totals on
 * Home, the bars on Budgets and the month figures on Insights. Restarting
 * the app resets the fixtures.
 *
 * Amounts are stored in USD. The display currency converts at fixed demo
 * rates when formatting — see `format` below.
 */

export type Category =
  | "Groceries"
  | "Dining"
  | "Transport"
  | "Shopping"
  | "Bills"
  | "Health"
  | "Fun"
  | "Home"
  | "Income";

/** One bundled photo per spending category, for the category avatars. */
export const CATEGORY_IMAGES: Record<Category, number> = {
  Groceries: require("./assets/img/cat-groceries.jpg"),
  Dining: require("./assets/img/cat-dining.jpg"),
  Transport: require("./assets/img/cat-transport.jpg"),
  Shopping: require("./assets/img/cat-shopping.jpg"),
  Bills: require("./assets/img/cat-bills.jpg"),
  Health: require("./assets/img/cat-health.jpg"),
  Fun: require("./assets/img/cat-fun.jpg"),
  Home: require("./assets/img/cat-home.jpg"),
  Income: require("./assets/img/cat-income.jpg"),
};

export const EXPENSE_CATEGORIES: Category[] = [
  "Groceries",
  "Dining",
  "Transport",
  "Shopping",
  "Bills",
  "Health",
  "Fun",
  "Home",
];

export interface Transaction {
  id: string;
  title: string;
  category: Category;
  /** Signed: negative is money out, positive is money in. */
  amount: number;
  /** ISO calendar day, e.g. "2026-11-22". */
  date: string;
  note?: string;
}

export interface Budget {
  category: Category;
  /** Monthly limit, in USD. */
  limit: number;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
  /** Bundled photo for the goal's avatar; the initials avatar is the fallback. */
  image?: number;
}

export interface RecurringItem {
  id: string;
  name: string;
  detail: string;
  amount: number;
  nextLabel: string;
  active: boolean;
  /** Bundled photo for the item's avatar; the initials avatar is the fallback. */
  image?: number;
}

/** The three backgrounds the glass can sit over. */
export type BackdropMode = "dark" | "light" | "image";

export type Currency = "USD" | "EUR" | "GBP";

export const CURRENCIES: Currency[] = ["USD", "EUR", "GBP"];

/** Fixed demo FX rates from USD — display only, no live market data. */
const FX: Record<Currency, { rate: number; symbol: string }> = {
  USD: { rate: 1, symbol: "$" },
  EUR: { rate: 0.92, symbol: "€" },
  GBP: { rate: 0.79, symbol: "£" },
};

/** The fixture "today". Fixtures are pinned to November 2026. */
export const FIXTURE_TODAY = "2026-11-22";
export const CURRENT_MONTH = "2026-11";

export interface MonthOption {
  key: string;
  label: string;
  short: string;
}

export const MONTHS: MonthOption[] = [
  { key: "2026-09", label: "September 2026", short: "Sep" },
  { key: "2026-10", label: "October 2026", short: "Oct" },
  { key: "2026-11", label: "November 2026", short: "Nov" },
];

export const monthKeyOf = (iso: string) => iso.slice(0, 7);

/* ------------------------------------------------------------------ */
/*  Fixtures                                                           */
/* ------------------------------------------------------------------ */

const SEED_TRANSACTIONS: Transaction[] = [
  // — November 2026 (the current fixture month) —
  { id: "n1", title: "Blue Bottle Coffee", category: "Dining", amount: -6.5, date: "2026-11-22" },
  { id: "n2", title: "Whole Foods Market", category: "Groceries", amount: -86.24, date: "2026-11-22" },
  { id: "n3", title: "Uber", category: "Transport", amount: -24.9, date: "2026-11-21", note: "Ride to the airport" },
  { id: "n4", title: "Netflix", category: "Fun", amount: -15.49, date: "2026-11-21" },
  { id: "n5", title: "Trader Joe's", category: "Groceries", amount: -64.37, date: "2026-11-20" },
  { id: "n6", title: "Shell", category: "Transport", amount: -52.3, date: "2026-11-20", note: "Fuel" },
  { id: "n7", title: "Chipotle", category: "Dining", amount: -13.75, date: "2026-11-19" },
  { id: "n8", title: "CVS Pharmacy", category: "Health", amount: -18.99, date: "2026-11-19" },
  { id: "n9", title: "Zara", category: "Shopping", amount: -119.0, date: "2026-11-18" },
  { id: "n10", title: "City Electric", category: "Bills", amount: -92.41, date: "2026-11-18" },
  { id: "n11", title: "Cinema City", category: "Fun", amount: -28.0, date: "2026-11-16", note: "Two tickets" },
  { id: "n12", title: "Farmers market", category: "Groceries", amount: -42.1, date: "2026-11-16" },
  { id: "n13", title: "City Lights Books", category: "Shopping", amount: -34.5, date: "2026-11-15" },
  { id: "n14", title: "Form Studio", category: "Health", amount: -45.0, date: "2026-11-14", note: "Gym membership" },
  { id: "n15", title: "IKEA", category: "Home", amount: -156.2, date: "2026-11-12", note: "Desk lamp + shelves" },
  { id: "n16", title: "Sushi Yasuda", category: "Dining", amount: -48.6, date: "2026-11-10" },
  { id: "n17", title: "Metro card", category: "Transport", amount: -34.0, date: "2026-11-08" },
  { id: "n18", title: "Walgreens", category: "Health", amount: -23.4, date: "2026-11-05" },
  { id: "n19", title: "Bakery on 5th", category: "Groceries", amount: -12.8, date: "2026-11-03" },
  { id: "n20", title: "Rent — Maple St Apt", category: "Bills", amount: -1450.0, date: "2026-11-02" },
  { id: "n21", title: "Northwind Internet", category: "Bills", amount: -59.99, date: "2026-11-02" },
  { id: "n22", title: "Northwind Payroll", category: "Income", amount: 4850.0, date: "2026-11-01", note: "Salary · November" },
  { id: "n23", title: "Spotify", category: "Fun", amount: -11.99, date: "2026-11-01" },
  { id: "n24", title: "Interest payout", category: "Income", amount: 12.4, date: "2026-11-01" },

  // — October 2026 —
  { id: "o1", title: "Northwind Payroll", category: "Income", amount: 4850.0, date: "2026-10-01", note: "Salary · October" },
  { id: "o2", title: "Rent — Maple St Apt", category: "Bills", amount: -1450.0, date: "2026-10-02" },
  { id: "o3", title: "Northwind Internet", category: "Bills", amount: -59.99, date: "2026-10-02" },
  { id: "o4", title: "Whole Foods Market", category: "Groceries", amount: -142.3, date: "2026-10-06" },
  { id: "o5", title: "Uniqlo", category: "Shopping", amount: -402.99, date: "2026-10-09", note: "Winter jacket + layers" },
  { id: "o6", title: "Dentist — Bright Smiles", category: "Health", amount: -125.0, date: "2026-10-12" },
  { id: "o7", title: "Trader Joe's", category: "Groceries", amount: -118.45, date: "2026-10-14" },
  { id: "o8", title: "Osteria Francescana", category: "Dining", amount: -96.0, date: "2026-10-17", note: "Anniversary dinner" },
  { id: "o9", title: "Uber", category: "Transport", amount: -58.2, date: "2026-10-19" },
  { id: "o10", title: "City Electric", category: "Bills", amount: -104.18, date: "2026-10-20" },
  { id: "o11", title: "Safeway", category: "Groceries", amount: -129.65, date: "2026-10-23" },
  { id: "o12", title: "Ramen-ya", category: "Dining", amount: -114.6, date: "2026-10-25", note: "Team lunch + solo dinners" },
  { id: "o13", title: "Shell", category: "Transport", amount: -63.4, date: "2026-10-27", note: "Fuel" },
  { id: "o14", title: "The Container Store", category: "Home", amount: -88.0, date: "2026-10-28" },
  { id: "o15", title: "Cinema City", category: "Fun", amount: -142.08, date: "2026-10-30", note: "Film festival pass" },
  { id: "o16", title: "Form Studio", category: "Health", amount: -45.0, date: "2026-10-14", note: "Gym membership" },

  // — September 2026 —
  { id: "s1", title: "Northwind Payroll", category: "Income", amount: 4850.0, date: "2026-09-01", note: "Salary · September" },
  { id: "s2", title: "Rent — Maple St Apt", category: "Bills", amount: -1450.0, date: "2026-09-02" },
  { id: "s3", title: "Northwind Internet", category: "Bills", amount: -59.99, date: "2026-09-02" },
  { id: "s4", title: "Whole Foods Market", category: "Groceries", amount: -156.8, date: "2026-09-05" },
  { id: "s5", title: "City Electric", category: "Bills", amount: -88.35, date: "2026-09-09" },
  { id: "s6", title: "Trader Joe's", category: "Groceries", amount: -121.2, date: "2026-09-12" },
  { id: "s7", title: "Form Studio", category: "Health", amount: -45.0, date: "2026-09-14", note: "Gym membership" },
  { id: "s8", title: "Taqueria El Sol", category: "Dining", amount: -64.3, date: "2026-09-16" },
  { id: "s9", title: "Metro card", category: "Transport", amount: -34.0, date: "2026-09-18" },
  { id: "s10", title: "Amazon", category: "Shopping", amount: -86.45, date: "2026-09-21", note: "Keyboard + cables" },
  { id: "s11", title: "Safeway", category: "Groceries", amount: -98.55, date: "2026-09-24" },
  { id: "s12", title: "Concert tickets", category: "Fun", amount: -120.0, date: "2026-09-26" },
  { id: "s13", title: "Blue Bottle Coffee", category: "Dining", amount: -42.75, date: "2026-09-28" },
  { id: "s14", title: "Plant nursery", category: "Home", amount: -54.6, date: "2026-09-29" },
];

const SEED_BUDGETS: Budget[] = [
  { category: "Groceries", limit: 500 },
  { category: "Dining", limit: 300 },
  { category: "Transport", limit: 200 },
  { category: "Shopping", limit: 350 },
  // Bills sit just under the November fixtures on purpose: the category
  // opens over budget so the over-budget state is visible on first launch.
  { category: "Bills", limit: 1600 },
  { category: "Health", limit: 150 },
  { category: "Fun", limit: 200 },
  { category: "Home", limit: 250 },
];

const SEED_GOALS: Goal[] = [
  { id: "g1", image: require("./assets/img/goal-emergency-fund.jpg"), name: "Emergency fund", target: 5000, saved: 3250 },
  { id: "g2", image: require("./assets/img/goal-lisbon-trip.jpg"), name: "Lisbon trip", target: 1800, saved: 940 },
  { id: "g3", image: require("./assets/img/goal-new-laptop.jpg"), name: "New laptop", target: 1600, saved: 420 },
];

const SEED_RECURRING: RecurringItem[] = [
  { id: "r1", image: require("./assets/img/recur-rent.jpg"), name: "Rent — Maple St Apt", detail: "Monthly · Maple St", amount: 1450.0, nextLabel: "Dec 2", active: true },
  { id: "r2", image: require("./assets/img/recur-internet.jpg"), name: "Northwind Internet", detail: "Monthly · 500 Mbps", amount: 59.99, nextLabel: "Dec 2", active: true },
  { id: "r3", image: require("./assets/img/recur-gym.jpg"), name: "Form Studio", detail: "Monthly · gym membership", amount: 45.0, nextLabel: "Dec 14", active: true },
  { id: "r4", image: require("./assets/img/recur-netflix.jpg"), name: "Netflix", detail: "Monthly · 4K plan", amount: 15.49, nextLabel: "Dec 21", active: true },
  { id: "r5", image: require("./assets/img/recur-spotify.jpg"), name: "Spotify", detail: "Monthly · Premium", amount: 11.99, nextLabel: "Dec 1", active: true },
  { id: "r6", image: require("./assets/img/recur-icloud.jpg"), name: "iCloud+", detail: "Monthly · 200 GB", amount: 2.99, nextLabel: "Dec 5", active: true },
  { id: "r7", image: require("./assets/img/recur-hellofresh.jpg"), name: "Meal kit — HelloFresh", detail: "Weekly · paused in October", amount: 64.0, nextLabel: "Paused", active: false },
];

/* ------------------------------------------------------------------ */
/*  Store                                                              */
/* ------------------------------------------------------------------ */

interface TallyState {
  userName: string;
  /** Bundled portrait of the signed-in user, for the header avatars. */
  userImage: number;

  transactions: Transaction[];
  addTransaction: (input: {
    title: string;
    category: Category;
    amount: number;
    date: string;
    note?: string;
  }) => Transaction;

  /** Expense total (positive number) for one month key, e.g. "2026-11". */
  spentForMonth: (monthKey: string) => number;
  incomeForMonth: (monthKey: string) => number;
  spentForCategory: (monthKey: string, category: Category) => number;
  categoriesForMonth: (monthKey: string) => { category: Category; amount: number }[];

  budgets: Budget[];
  totalBudget: number;
  setBudgetLimit: (category: Category, limit: number) => void;

  goals: Goal[];
  addGoal: (name: string, target: number) => void;
  contributeToGoal: (goalId: string, amount: number) => void;

  recurring: RecurringItem[];
  recurringTotal: number;
  setRecurringActive: (id: string, active: boolean) => void;

  currency: Currency;
  setCurrency: (currency: Currency) => void;
  /** Format a USD amount in the display currency, e.g. "$1,234.56". */
  format: (usdAmount: number) => string;
  /** Format with an explicit + / − sign, e.g. "+$42.00". */
  formatSigned: (usdAmount: number) => string;

  /** Which of the three backgrounds is showing. */
  backdrop: BackdropMode;
  setBackdrop: (value: BackdropMode) => void;
  /** Derived: true unless the backdrop is the broken-white light mode.
   *  Threaded into every Glacia `isDark` prop. */
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  notifications: boolean;
  setNotifications: (value: boolean) => void;
  budgetAlerts: boolean;
  setBudgetAlerts: (value: boolean) => void;

  resetDemo: () => void;
}

const TallyContext = createContext<TallyState | null>(null);

let counter = 100;
const nextId = () => `x${++counter}`;

export function TallyProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(SEED_TRANSACTIONS);
  const [budgets, setBudgets] = useState<Budget[]>(SEED_BUDGETS);
  const [goals, setGoals] = useState<Goal[]>(SEED_GOALS);
  const [recurring, setRecurring] = useState<RecurringItem[]>(SEED_RECURRING);
  const [currency, setCurrency] = useState<Currency>("USD");
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
  const [notifications, setNotifications] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);

  const addTransaction = useCallback(
    (input: {
      title: string;
      category: Category;
      amount: number;
      date: string;
      note?: string;
    }) => {
      const tx: Transaction = { id: nextId(), ...input };
      setTransactions((prev) =>
        [tx, ...prev].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
      );
      return tx;
    },
    [],
  );

  const spentForMonth = useCallback(
    (monthKey: string) =>
      transactions
        .filter((t) => monthKeyOf(t.date) === monthKey && t.amount < 0)
        .reduce((sum, t) => sum - t.amount, 0),
    [transactions],
  );

  const incomeForMonth = useCallback(
    (monthKey: string) =>
      transactions
        .filter((t) => monthKeyOf(t.date) === monthKey && t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions],
  );

  const spentForCategory = useCallback(
    (monthKey: string, category: Category) =>
      transactions
        .filter(
          (t) => monthKeyOf(t.date) === monthKey && t.category === category && t.amount < 0,
        )
        .reduce((sum, t) => sum - t.amount, 0),
    [transactions],
  );

  const categoriesForMonth = useCallback(
    (monthKey: string) => {
      const totals = new Map<Category, number>();
      for (const t of transactions) {
        if (monthKeyOf(t.date) !== monthKey || t.amount >= 0) continue;
        totals.set(t.category, (totals.get(t.category) ?? 0) - t.amount);
      }
      return [...totals.entries()]
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);
    },
    [transactions],
  );

  const setBudgetLimit = useCallback((category: Category, limit: number) => {
    setBudgets((prev) =>
      prev.map((b) => (b.category === category ? { ...b, limit } : b)),
    );
  }, []);

  const addGoal = useCallback((name: string, target: number) => {
    setGoals((prev) => [...prev, { id: nextId(), name, target, saved: 0 }]);
  }, []);

  const contributeToGoal = useCallback((goalId: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, saved: g.saved + amount } : g)),
    );
  }, []);

  const setRecurringActive = useCallback((id: string, active: boolean) => {
    setRecurring((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active } : r)),
    );
  }, []);

  const resetDemo = useCallback(() => {
    setTransactions(SEED_TRANSACTIONS);
    setBudgets(SEED_BUDGETS);
    setGoals(SEED_GOALS);
    setRecurring(SEED_RECURRING);
  }, []);

  const format = useCallback(
    (usdAmount: number) => {
      const fx = FX[currency];
      const converted = usdAmount * fx.rate;
      const sign = converted < 0 ? "-" : "";
      const abs = Math.abs(converted);
      return `${sign}${fx.symbol}${abs.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    },
    [currency],
  );

  const formatSigned = useCallback(
    (usdAmount: number) => (usdAmount > 0 ? `+${format(usdAmount)}` : format(usdAmount)),
    [format],
  );

  const value = useMemo<TallyState>(() => {
    const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
    const recurringTotal = recurring
      .filter((r) => r.active)
      .reduce((sum, r) => sum + r.amount, 0);
    return {
      userName: "Jordan Ellis",
      userImage: require("./assets/img/jordan-ellis.jpg"),
      transactions,
      addTransaction,
      spentForMonth,
      incomeForMonth,
      spentForCategory,
      categoriesForMonth,
      budgets,
      totalBudget,
      setBudgetLimit,
      goals,
      addGoal,
      contributeToGoal,
      recurring,
      recurringTotal,
      setRecurringActive,
      currency,
      setCurrency,
      format,
      formatSigned,
      backdrop,
      setBackdrop,
      darkMode,
      setDarkMode,
      notifications,
      setNotifications,
      budgetAlerts,
      setBudgetAlerts,
      resetDemo,
    };
  }, [
    transactions,
    addTransaction,
    spentForMonth,
    incomeForMonth,
    spentForCategory,
    categoriesForMonth,
    budgets,
    setBudgetLimit,
    goals,
    addGoal,
    contributeToGoal,
    recurring,
    setRecurringActive,
    currency,
    format,
    formatSigned,
    backdrop,
    darkMode,
    notifications,
    budgetAlerts,
    resetDemo,
  ]);

  return <TallyContext.Provider value={value}>{children}</TallyContext.Provider>;
}

export function useTally(): TallyState {
  const ctx = useContext(TallyContext);
  if (!ctx) throw new Error("useTally must be used inside TallyProvider");
  return ctx;
}
