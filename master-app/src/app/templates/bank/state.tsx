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
 * sending money on the Send screen immediately changes the balances on Home
 * and adds a row to Activity. Restarting the app resets the fixtures.
 */

export interface Account {
  id: string;
  name: string;
  kind: string;
  /** Full number, shown only after the user taps "reveal" on the detail screen. */
  number: string;
  /** Last four digits, used in masked labels like "Checking ••4821". */
  last4: string;
  openingBalance: number;
}

export type Category =
  | "Groceries"
  | "Dining"
  | "Transport"
  | "Shopping"
  | "Income"
  | "Bills"
  | "Transfer"
  | "Health"
  | "Fun";

export interface Transaction {
  id: string;
  accountId: string;
  title: string;
  detail: string;
  category: Category;
  /** Signed: negative is money out, positive is money in. */
  amount: number;
  dateLabel: string;
  disputed?: boolean;
}

export type BackdropMode = "dark" | "light" | "image";

export interface Recipient {
  id: string;
  name: string;
  handle: string;
  /** Bundled portrait, shown in the send flow and on person transfers. */
  image?: number;
}

export interface Bill {
  id: string;
  name: string;
  detail: string;
  amount: number;
  dueLabel: string;
  accountId: string;
  paid: boolean;
}

export interface MonthInsight {
  label: string;
  income: number;
  spent: number;
  categories: { category: Category; amount: number }[];
}

interface BankState {
  userName: string;
  /** Bundled portrait of the signed-in user. */
  userImage: number;
  userHandle: string;

  accounts: Account[];
  /** Live balance per account id: opening balance + its transactions. */
  balanceOf: (accountId: string) => number;
  totalBalance: number;

  transactions: Transaction[];
  transactionsFor: (accountId: string) => Transaction[];
  toggleDisputed: (id: string) => void;

  recipients: Recipient[];
  sendMoney: (recipient: Recipient, amount: number, note: string) => Transaction;
  topUp: (amount: number) => void;
  requestCount: number;
  addRequest: () => void;

  bills: Bill[];
  payBill: (billId: string) => void;

  cardFrozen: boolean;
  setCardFrozen: (value: boolean) => void;
  cardOnlinePayments: boolean;
  setCardOnlinePayments: (value: boolean) => void;
  cardInternational: boolean;
  setCardInternational: (value: boolean) => void;
  dailyLimit: number;
  spentToday: number;

  insights: MonthInsight[];

  hideBalances: boolean;
  setHideBalances: (value: boolean) => void;

  /** The three backgrounds. Every Glacia `isDark` prop derives from it. */
  backdrop: BackdropMode;
  setBackdrop: (value: BackdropMode) => void;
  /** Derived: true unless the backdrop is the broken-white light mode. */
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  biometrics: boolean;
  setBiometrics: (value: boolean) => void;
  notifications: boolean;
  setNotifications: (value: boolean) => void;

  signedOut: boolean;
  setSignedOut: (value: boolean) => void;
}

const BankContext = createContext<BankState | null>(null);

const ACCOUNTS: Account[] = [
  {
    id: "checking",
    name: "Main Checking",
    kind: "Everyday account",
    number: "4021 7784 0093 4821",
    last4: "4821",
    openingBalance: 5230.42,
  },
  {
    id: "savings",
    name: "High-Yield Savings",
    kind: "4.10% APY",
    number: "4021 7784 0017 9034",
    last4: "9034",
    openingBalance: 12750.0,
  },
  {
    id: "travel",
    name: "Travel Stash",
    kind: "Goal · Lisbon, June",
    number: "4021 7784 0052 6118",
    last4: "6118",
    openingBalance: 940.65,
  },
];

const SEED_TRANSACTIONS: Transaction[] = [
  { id: "t1", accountId: "checking", title: "Northwind Payroll", detail: "Salary · November", category: "Income", amount: 4850.0, dateLabel: "Today" },
  { id: "t2", accountId: "checking", title: "Whole Foods Market", detail: "Card ••4821", category: "Groceries", amount: -86.24, dateLabel: "Today" },
  { id: "t3", accountId: "checking", title: "Blue Bottle Coffee", detail: "Card ••4821", category: "Dining", amount: -6.5, dateLabel: "Today" },
  { id: "t4", accountId: "savings", title: "Interest payout", detail: "High-Yield Savings", category: "Income", amount: 43.18, dateLabel: "Yesterday" },
  { id: "t5", accountId: "checking", title: "Uber", detail: "Ride to the airport", category: "Transport", amount: -24.9, dateLabel: "Yesterday" },
  { id: "t6", accountId: "checking", title: "Rent — Maple St Apt", detail: "Standing order", category: "Bills", amount: -1450.0, dateLabel: "Yesterday" },
  { id: "t7", accountId: "checking", title: "Maya Chen", detail: "Sent · Dinner split", category: "Transfer", amount: -42.0, dateLabel: "Mon" },
  { id: "t8", accountId: "checking", title: "Trader Joe's", detail: "Card ••4821", category: "Groceries", amount: -64.37, dateLabel: "Mon" },
  { id: "t9", accountId: "checking", title: "CVS Pharmacy", detail: "Card ••4821", category: "Health", amount: -18.99, dateLabel: "Sun" },
  { id: "t10", accountId: "checking", title: "Netflix", detail: "Subscription", category: "Fun", amount: -15.49, dateLabel: "Sun" },
  { id: "t11", accountId: "travel", title: "Transfer from Checking", detail: "Monthly goal top-up", category: "Transfer", amount: 150.0, dateLabel: "Sat" },
  { id: "t12", accountId: "checking", title: "Transfer to Travel Stash", detail: "Monthly goal top-up", category: "Transfer", amount: -150.0, dateLabel: "Sat" },
  { id: "t13", accountId: "checking", title: "Zara", detail: "Card ••4821", category: "Shopping", amount: -119.0, dateLabel: "Fri" },
  { id: "t14", accountId: "savings", title: "Transfer from Checking", detail: "Payday sweep", category: "Transfer", amount: 600.0, dateLabel: "Fri" },
  { id: "t15", accountId: "checking", title: "Transfer to Savings", detail: "Payday sweep", category: "Transfer", amount: -600.0, dateLabel: "Fri" },
  { id: "t16", accountId: "checking", title: "Shell", detail: "Fuel", category: "Transport", amount: -52.3, dateLabel: "Thu" },
  { id: "t17", accountId: "checking", title: "Chipotle", detail: "Card ••4821", category: "Dining", amount: -13.75, dateLabel: "Thu" },
  { id: "t18", accountId: "checking", title: "City Electric", detail: "Utility bill", category: "Bills", amount: -92.41, dateLabel: "Wed" },
];

export const RECIPIENTS: Recipient[] = [
  { id: "r1", name: "Maya Chen", handle: "@maya", image: require("./assets/img/maya-chen.jpg") },
  { id: "r2", name: "Daniel Osei", handle: "@daniel", image: require("./assets/img/daniel-osei.jpg") },
  { id: "r3", name: "Priya Nair", handle: "@priya", image: require("./assets/img/priya-nair.jpg") },
  { id: "r4", name: "Tom Alvarez", handle: "@tomas", image: require("./assets/img/tom-alvarez.jpg") },
  { id: "r5", name: "Sara Lindqvist", handle: "@sara", image: require("./assets/img/sara-lindqvist.jpg") },
];

const SEED_BILLS: Bill[] = [
  { id: "b1", name: "City Electric", detail: "Utility · auto account ••771", amount: 96.2, dueLabel: "Due Fri, Nov 27", accountId: "checking", paid: false },
  { id: "b2", name: "Northwind Internet", detail: "Broadband · 500 Mbps", amount: 59.99, dueLabel: "Due Mon, Nov 30", accountId: "checking", paid: false },
  { id: "b3", name: "State Farm Insurance", detail: "Auto policy · quarterly", amount: 212.4, dueLabel: "Due Wed, Dec 2", accountId: "checking", paid: false },
  { id: "b4", name: "Gym — Form Studio", detail: "Monthly membership", amount: 45.0, dueLabel: "Paid Nov 12", accountId: "checking", paid: true },
];

const INSIGHTS: MonthInsight[] = [
  {
    label: "November 2026",
    income: 4893.18,
    spent: 2854.61,
    categories: [
      { category: "Bills", amount: 1634.41 },
      { category: "Groceries", amount: 412.88 },
      { category: "Shopping", amount: 268.5 },
      { category: "Dining", amount: 196.25 },
      { category: "Transport", amount: 154.6 },
      { category: "Fun", amount: 98.97 },
      { category: "Health", amount: 89.0 },
    ],
  },
  {
    label: "October 2026",
    income: 4850.0,
    spent: 3102.44,
    categories: [
      { category: "Bills", amount: 1691.02 },
      { category: "Groceries", amount: 388.4 },
      { category: "Shopping", amount: 402.99 },
      { category: "Dining", amount: 231.6 },
      { category: "Transport", amount: 121.35 },
      { category: "Fun", amount: 142.08 },
      { category: "Health", amount: 125.0 },
    ],
  },
];

let counter = 100;
const nextId = () => `x${++counter}`;

export function BankProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(SEED_TRANSACTIONS);
  const [bills, setBills] = useState<Bill[]>(SEED_BILLS);
  const [cardFrozen, setCardFrozen] = useState(false);
  const [cardOnlinePayments, setCardOnlinePayments] = useState(true);
  const [cardInternational, setCardInternational] = useState(false);
  const [hideBalances, setHideBalances] = useState(false);
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
  const [biometrics, setBiometrics] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [signedOut, setSignedOut] = useState(false);
  const [requestCount, setRequestCount] = useState(0);

  const balanceOf = useCallback(
    (accountId: string) => {
      const account = ACCOUNTS.find((a) => a.id === accountId);
      if (!account) return 0;
      // The seed transactions are already reflected in `openingBalance`.
      // Only transactions created during the session (ids starting with
      // "x", from Send / Top up / Pay bill) move the live balance.
      const fresh = transactions
        .filter((t) => t.accountId === accountId && t.id.startsWith("x"))
        .reduce((sum, t) => sum + t.amount, 0);
      return account.openingBalance + fresh;
    },
    [transactions],
  );

  const transactionsFor = useCallback(
    (accountId: string) => transactions.filter((t) => t.accountId === accountId),
    [transactions],
  );

  const toggleDisputed = useCallback((id: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, disputed: !t.disputed } : t)),
    );
  }, []);

  const sendMoney = useCallback((recipient: Recipient, amount: number, note: string) => {
    const tx: Transaction = {
      id: nextId(),
      accountId: "checking",
      title: recipient.name,
      detail: note.trim() ? `Sent · ${note.trim()}` : "Sent · Northwind Pay",
      category: "Transfer",
      amount: -amount,
      dateLabel: "Today",
    };
    setTransactions((prev) => [tx, ...prev]);
    return tx;
  }, []);

  const topUp = useCallback((amount: number) => {
    const tx: Transaction = {
      id: nextId(),
      accountId: "checking",
      title: "Top up — linked bank",
      detail: "Instant transfer in",
      category: "Income",
      amount,
      dateLabel: "Today",
    };
    setTransactions((prev) => [tx, ...prev]);
  }, []);

  const addRequest = useCallback(() => setRequestCount((c) => c + 1), []);

  const payBill = useCallback((billId: string) => {
    setBills((prev) => {
      const bill = prev.find((b) => b.id === billId);
      if (!bill || bill.paid) return prev;
      const tx: Transaction = {
        id: nextId(),
        accountId: bill.accountId,
        title: bill.name,
        detail: "Bill paid",
        category: "Bills",
        amount: -bill.amount,
        dateLabel: "Today",
      };
      setTransactions((txs) => [tx, ...txs]);
      return prev.map((b) => (b.id === billId ? { ...b, paid: true } : b));
    });
  }, []);

  const value = useMemo<BankState>(() => {
    const totalBalance = ACCOUNTS.reduce((sum, a) => sum + balanceOf(a.id), 0);
    const spentToday = transactions
      .filter((t) => t.dateLabel === "Today" && t.amount < 0 && t.accountId === "checking")
      .reduce((sum, t) => sum - t.amount, 0);
    return {
      userName: "Jordan Ellis",
      userImage: require("./assets/img/jordan-ellis.jpg"),
      userHandle: "@jordanellis",
      accounts: ACCOUNTS,
      balanceOf,
      totalBalance,
      transactions,
      transactionsFor,
      toggleDisputed,
      recipients: RECIPIENTS,
      sendMoney,
      topUp,
      requestCount,
      addRequest,
      bills,
      payBill,
      cardFrozen,
      setCardFrozen,
      cardOnlinePayments,
      setCardOnlinePayments,
      cardInternational,
      setCardInternational,
      dailyLimit: 1000,
      spentToday,
      insights: INSIGHTS,
      hideBalances,
      setHideBalances,
      backdrop,
      setBackdrop,
      darkMode,
      setDarkMode,
      biometrics,
      setBiometrics,
      notifications,
      setNotifications,
      signedOut,
      setSignedOut,
    };
  }, [
    balanceOf,
    transactions,
    transactionsFor,
    toggleDisputed,
    sendMoney,
    topUp,
    addRequest,
    requestCount,
    bills,
    payBill,
    cardFrozen,
    cardOnlinePayments,
    cardInternational,
    hideBalances,
    backdrop,
    darkMode,
    setDarkMode,
    biometrics,
    notifications,
    signedOut,
  ]);

  return <BankContext.Provider value={value}>{children}</BankContext.Provider>;
}

export function useBank(): BankState {
  const ctx = useContext(BankContext);
  if (!ctx) throw new Error("useBank must be used inside BankProvider");
  return ctx;
}
