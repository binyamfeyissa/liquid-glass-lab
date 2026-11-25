import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Orbit Wallet keeps everything in this one client-side store. There is no
 * backend and no persistence: balances, transactions and settings live in
 * memory for the session, so a buy on the Trade screen immediately changes
 * the portfolio total on Home and adds a row to Activity. Restarting the
 * app resets the fixtures.
 *
 * ALL PRICES AND FX RATES ARE SIMULATED FIXTURES. Nothing here talks to a
 * market, an exchange or a bank.
 */

export type AssetKind = "cash" | "crypto";

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  kind: AssetKind;
  /** Fixture hue kept as asset metadata; the redesign does not paint the UI with it. */
  color: string;
  /** Simulated price of one unit, in USD. Cash assets price at their FX rate. */
  priceUSD: number;
  /** Simulated 24h move, in percent. */
  change24h: number;
  /** Simulated price history (USD), oldest → newest, for the bar display. */
  history: number[];
  /** Fractional digits used when showing a balance of this asset. */
  decimals: number;
}

export type DisplayCurrency = "USD" | "EUR" | "GBP";

/** The three backgrounds the app offers; `darkMode` is derived from it. */
export type BackdropMode = "dark" | "light" | "image";

/** Simulated FX: units of the currency per 1 USD, and its symbol. */
export const FX: Record<DisplayCurrency, { rate: number; symbol: string }> = {
  USD: { rate: 1, symbol: "$" },
  EUR: { rate: 0.92, symbol: "€" },
  GBP: { rate: 0.79, symbol: "£" },
};

export type TxType = "buy" | "sell" | "swap" | "send" | "receive" | "topup" | "payment";

export interface WalletTx {
  id: string;
  type: TxType;
  title: string;
  detail: string;
  /** Pre-formatted movement, e.g. "+0.0124 BTC" or "-$250.00". */
  amountLabel: string;
  /** Signed value in USD, for the fiat figure shown beside the movement. */
  valueUSD: number;
  dateLabel: string;
}

export interface Contact {
  id: string;
  name: string;
  handle: string;
}

export interface PayCard {
  id: string;
  brand: string;
  last4: string;
  detail: string;
}

/** Simulated network fee on trades and swaps: 0.5%. */
export const FEE_RATE = 0.005;

const ASSET_DEFS: Asset[] = [
  {
    id: "usd",
    symbol: "USD",
    name: "US Dollar",
    kind: "cash",
    color: "#34d399",
    priceUSD: 1,
    change24h: 0,
    history: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    decimals: 2,
  },
  {
    id: "eur",
    symbol: "EUR",
    name: "Euro",
    kind: "cash",
    color: "#60a5fa",
    priceUSD: 1.08,
    change24h: 0.12,
    history: [1.071, 1.073, 1.07, 1.075, 1.078, 1.074, 1.076, 1.079, 1.077, 1.08, 1.078, 1.081, 1.079, 1.08],
    decimals: 2,
  },
  {
    id: "btc",
    symbol: "BTC",
    name: "Bitcoin",
    kind: "crypto",
    color: "#f59e0b",
    priceUSD: 97412,
    change24h: 3.84,
    history: [91200, 92850, 90600, 93400, 95100, 94300, 96800, 95200, 97600, 96100, 98400, 96900, 99200, 97412],
    decimals: 4,
  },
  {
    id: "eth",
    symbol: "ETH",
    name: "Ethereum",
    kind: "crypto",
    color: "#a78bfa",
    priceUSD: 3418,
    change24h: 5.21,
    history: [3120, 3195, 3080, 3240, 3310, 3265, 3380, 3290, 3425, 3350, 3490, 3405, 3520, 3418],
    decimals: 4,
  },
  {
    id: "sol",
    symbol: "SOL",
    name: "Solana",
    kind: "crypto",
    color: "#2dd4bf",
    priceUSD: 214.5,
    change24h: -2.37,
    history: [228, 224, 231, 219, 226, 221, 232, 218, 224, 216, 222, 213, 219, 214.5],
    decimals: 3,
  },
];

const OPENING_BALANCES: Record<string, number> = {
  usd: 2840.55,
  eur: 1150.0,
  btc: 0.4284,
  eth: 6.25,
  sol: 84.6,
};

const SEED_TXS: WalletTx[] = [
  { id: "w1", type: "buy", title: "Bought Bitcoin", detail: "USD → BTC · Orbit Exchange", amountLabel: "+0.0500 BTC", valueUSD: -4870.6, dateLabel: "Today" },
  { id: "w2", type: "payment", title: "Figma", detail: "Card ••4821 · Subscription", amountLabel: "-$15.00", valueUSD: -15, dateLabel: "Today" },
  { id: "w3", type: "receive", title: "From Maya Chen", detail: "@maya · Split the cabin", amountLabel: "+$120.00", valueUSD: 120, dateLabel: "Yesterday" },
  { id: "w4", type: "swap", title: "Swapped ETH → SOL", detail: "0.5000 ETH → 7.81 SOL", amountLabel: "+7.810 SOL", valueUSD: 1709, dateLabel: "Yesterday" },
  { id: "w5", type: "topup", title: "Added money", detail: "Visa ••4821", amountLabel: "+$1,000.00", valueUSD: 1000, dateLabel: "Mon" },
  { id: "w6", type: "send", title: "To Daniel Osei", detail: "@daniel · Concert tickets", amountLabel: "-$86.50", valueUSD: -86.5, dateLabel: "Mon" },
  { id: "w7", type: "sell", title: "Sold Solana", detail: "SOL → USD · Orbit Exchange", amountLabel: "-12.000 SOL", valueUSD: 2574, dateLabel: "Sun" },
  { id: "w8", type: "payment", title: "Blue Bottle Coffee", detail: "Card ••4821", amountLabel: "-$6.50", valueUSD: -6.5, dateLabel: "Sun" },
  { id: "w9", type: "buy", title: "Bought Ethereum", detail: "USD → ETH · Orbit Exchange", amountLabel: "+1.2500 ETH", valueUSD: -4272.5, dateLabel: "Sat" },
  { id: "w10", type: "receive", title: "From Priya Nair", detail: "@priya · Freelance payout", amountLabel: "+$640.00", valueUSD: 640, dateLabel: "Fri" },
];

const CONTACTS: Contact[] = [
  { id: "c1", name: "Maya Chen", handle: "@maya" },
  { id: "c2", name: "Daniel Osei", handle: "@daniel" },
  { id: "c3", name: "Priya Nair", handle: "@priya" },
  { id: "c4", name: "Tom Alvarez", handle: "@tomas" },
  { id: "c5", name: "Sara Lindqvist", handle: "@sara" },
];

const CARDS: PayCard[] = [
  { id: "card1", brand: "Visa", last4: "4821", detail: "Debit · expires 08/28" },
  { id: "card2", brand: "Mastercard", last4: "9034", detail: "Credit · expires 03/27" },
];

export interface TradeResult {
  /** Quantity of the target asset credited, after the fee. */
  receivedQty: number;
  /** Fee taken, in USD. */
  feeUSD: number;
}

interface WalletState {
  userName: string;
  userHandle: string;
  /** Orbit payment link shown on the Request screen. */
  payLink: string;

  assets: Asset[];
  assetById: (id: string) => Asset;
  balanceOf: (assetId: string) => number;
  /** Balance converted to USD at the simulated price. */
  valueUSDOf: (assetId: string) => number;
  totalUSD: number;
  /** Portfolio 24h change in USD, weighted from the fixture moves. */
  changeUSD24h: number;
  changePct24h: number;

  currency: DisplayCurrency;
  setCurrency: (c: DisplayCurrency) => void;
  /** Format a USD value in the selected display currency. */
  fmt: (usdValue: number) => string;
  fmtSigned: (usdValue: number) => string;
  /** Format a quantity of an asset, e.g. "0.4284 BTC". */
  fmtQty: (assetId: string, qty: number) => string;

  transactions: WalletTx[];
  contacts: Contact[];
  cards: PayCard[];

  /** Buy `assetId` spending `usdAmount` of USD cash. Fee comes out of the spend. */
  buy: (assetId: string, usdAmount: number) => TradeResult;
  /** Sell `usdAmount` worth of `assetId` into USD cash. Fee comes out of the proceeds. */
  sell: (assetId: string, usdAmount: number) => TradeResult;
  /** Swap `fromQty` units of one asset into another at simulated prices, less the fee. */
  swap: (fromId: string, toId: string, fromQty: number) => TradeResult;
  send: (contact: Contact, usdAmount: number, note: string) => WalletTx;
  topUp: (card: PayCard, amount: number) => void;
  requestCount: number;
  addRequest: () => void;

  backdrop: BackdropMode;
  setBackdrop: (m: BackdropMode) => void;
  /** Derived: true unless the backdrop is the broken-white light mode. */
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  biometrics: boolean;
  setBiometrics: (v: boolean) => void;
  hideBalances: boolean;
  setHideBalances: (v: boolean) => void;
  priceAlerts: boolean;
  setPriceAlerts: (v: boolean) => void;
  confirmAbove500: boolean;
  setConfirmAbove500: (v: boolean) => void;
}

const WalletContext = createContext<WalletState | null>(null);

let counter = 100;
const nextId = () => `x${++counter}`;

export function WalletProvider({ children }: { children: ReactNode }) {
  const [balances, setBalances] = useState<Record<string, number>>(OPENING_BALANCES);
  const [transactions, setTransactions] = useState<WalletTx[]>(SEED_TXS);
  const [currency, setCurrency] = useState<DisplayCurrency>("USD");
  const [backdrop, setBackdrop] = useState<BackdropMode>("dark");
  const darkMode = backdrop !== "light";
  const setDarkMode = useCallback((v: boolean) => {
    setBackdrop(v ? "dark" : "light");
  }, []);
  const [biometrics, setBiometrics] = useState(true);
  const [hideBalances, setHideBalances] = useState(false);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [confirmAbove500, setConfirmAbove500] = useState(false);
  const [requestCount, setRequestCount] = useState(0);

  const assetById = useCallback((id: string): Asset => {
    const found = ASSET_DEFS.find((a) => a.id === id);
    if (!found) throw new Error(`Unknown asset ${id}`);
    return found;
  }, []);

  const balanceOf = useCallback((id: string) => balances[id] ?? 0, [balances]);

  const valueUSDOf = useCallback(
    (id: string) => (balances[id] ?? 0) * assetById(id).priceUSD,
    [balances, assetById],
  );

  const fmt = useCallback(
    (usdValue: number) => {
      const fx = FX[currency];
      const converted = usdValue * fx.rate;
      const sign = converted < 0 ? "-" : "";
      return `${sign}${fx.symbol}${Math.abs(converted).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    },
    [currency],
  );

  const fmtSigned = useCallback(
    (usdValue: number) => (usdValue > 0 ? `+${fmt(usdValue)}` : fmt(usdValue)),
    [fmt],
  );

  const fmtQty = useCallback(
    (assetId: string, qty: number) => {
      const asset = assetById(assetId);
      return `${qty.toLocaleString("en-US", {
        minimumFractionDigits: asset.kind === "cash" ? 2 : 0,
        maximumFractionDigits: asset.decimals,
      })} ${asset.symbol}`;
    },
    [assetById],
  );

  const pushTx = useCallback((tx: WalletTx) => {
    setTransactions((prev) => [tx, ...prev]);
  }, []);

  const buy = useCallback(
    (assetId: string, usdAmount: number): TradeResult => {
      const asset = assetById(assetId);
      const feeUSD = usdAmount * FEE_RATE;
      const receivedQty = (usdAmount - feeUSD) / asset.priceUSD;
      setBalances((prev) => ({
        ...prev,
        usd: (prev.usd ?? 0) - usdAmount,
        [assetId]: (prev[assetId] ?? 0) + receivedQty,
      }));
      pushTx({
        id: nextId(),
        type: "buy",
        title: `Bought ${asset.name}`,
        detail: `USD → ${asset.symbol} · Orbit Exchange`,
        amountLabel: `+${fmtQty(assetId, receivedQty)}`,
        valueUSD: -usdAmount,
        dateLabel: "Today",
      });
      return { receivedQty, feeUSD };
    },
    [assetById, fmtQty, pushTx],
  );

  const sell = useCallback(
    (assetId: string, usdAmount: number): TradeResult => {
      const asset = assetById(assetId);
      const feeUSD = usdAmount * FEE_RATE;
      const soldQty = usdAmount / asset.priceUSD;
      const receivedQty = usdAmount - feeUSD;
      setBalances((prev) => ({
        ...prev,
        [assetId]: (prev[assetId] ?? 0) - soldQty,
        usd: (prev.usd ?? 0) + receivedQty,
      }));
      pushTx({
        id: nextId(),
        type: "sell",
        title: `Sold ${asset.name}`,
        detail: `${asset.symbol} → USD · Orbit Exchange`,
        amountLabel: `-${fmtQty(assetId, soldQty)}`,
        valueUSD: receivedQty,
        dateLabel: "Today",
      });
      return { receivedQty, feeUSD };
    },
    [assetById, fmtQty, pushTx],
  );

  const swap = useCallback(
    (fromId: string, toId: string, fromQty: number): TradeResult => {
      const from = assetById(fromId);
      const to = assetById(toId);
      const fromUSD = fromQty * from.priceUSD;
      const feeUSD = fromUSD * FEE_RATE;
      const receivedQty = (fromUSD - feeUSD) / to.priceUSD;
      setBalances((prev) => ({
        ...prev,
        [fromId]: (prev[fromId] ?? 0) - fromQty,
        [toId]: (prev[toId] ?? 0) + receivedQty,
      }));
      pushTx({
        id: nextId(),
        type: "swap",
        title: `Swapped ${from.symbol} → ${to.symbol}`,
        detail: `${fmtQty(fromId, fromQty)} → ${fmtQty(toId, receivedQty)}`,
        amountLabel: `+${fmtQty(toId, receivedQty)}`,
        valueUSD: fromUSD - feeUSD,
        dateLabel: "Today",
      });
      return { receivedQty, feeUSD };
    },
    [assetById, fmtQty, pushTx],
  );

  const send = useCallback(
    (contact: Contact, usdAmount: number, note: string): WalletTx => {
      const tx: WalletTx = {
        id: nextId(),
        type: "send",
        title: `To ${contact.name}`,
        detail: note.trim() ? `${contact.handle} · ${note.trim()}` : `${contact.handle} · Orbit Pay`,
        amountLabel: `-$${usdAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        valueUSD: -usdAmount,
        dateLabel: "Today",
      };
      setBalances((prev) => ({ ...prev, usd: (prev.usd ?? 0) - usdAmount }));
      pushTx(tx);
      return tx;
    },
    [pushTx],
  );

  const topUp = useCallback(
    (card: PayCard, amount: number) => {
      setBalances((prev) => ({ ...prev, usd: (prev.usd ?? 0) + amount }));
      pushTx({
        id: nextId(),
        type: "topup",
        title: "Added money",
        detail: `${card.brand} ••${card.last4}`,
        amountLabel: `+$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        valueUSD: amount,
        dateLabel: "Today",
      });
    },
    [pushTx],
  );

  const addRequest = useCallback(() => setRequestCount((c) => c + 1), []);

  const value = useMemo<WalletState>(() => {
    const totalUSD = ASSET_DEFS.reduce((sum, a) => sum + (balances[a.id] ?? 0) * a.priceUSD, 0);
    const changeUSD24h = ASSET_DEFS.reduce((sum, a) => {
      const v = (balances[a.id] ?? 0) * a.priceUSD;
      // Value 24h ago = v / (1 + pct/100); the change is the difference.
      return sum + (v - v / (1 + a.change24h / 100));
    }, 0);
    const changePct24h = totalUSD > 0 ? (changeUSD24h / (totalUSD - changeUSD24h)) * 100 : 0;
    return {
      userName: "Jordan Ellis",
      userHandle: "@jordan.orbit",
      payLink: "orbit.pay/jordan.orbit",
      assets: ASSET_DEFS,
      assetById,
      balanceOf,
      valueUSDOf,
      totalUSD,
      changeUSD24h,
      changePct24h,
      currency,
      setCurrency,
      fmt,
      fmtSigned,
      fmtQty,
      transactions,
      contacts: CONTACTS,
      cards: CARDS,
      buy,
      sell,
      swap,
      send,
      topUp,
      requestCount,
      addRequest,
      backdrop,
      setBackdrop,
      darkMode,
      setDarkMode,
      biometrics,
      setBiometrics,
      hideBalances,
      setHideBalances,
      priceAlerts,
      setPriceAlerts,
      confirmAbove500,
      setConfirmAbove500,
    };
  }, [
    balances,
    assetById,
    balanceOf,
    valueUSDOf,
    currency,
    fmt,
    fmtSigned,
    fmtQty,
    transactions,
    buy,
    sell,
    swap,
    send,
    topUp,
    requestCount,
    addRequest,
    backdrop,
    darkMode,
    biometrics,
    hideBalances,
    priceAlerts,
    confirmAbove500,
  ]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
