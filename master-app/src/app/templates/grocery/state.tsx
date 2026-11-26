import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useLocalSearchParams } from "expo-router";

import {
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
  PAYMENT_METHODS,
  PRODUCTS,
  SEED_ADDRESSES,
  productById,
  slotDays,
  type Address,
  type PaymentMethod,
} from "./data";

/**
 * The whole template keeps its data in this one client-side store. There
 * is no backend and no persistence: state lives in memory for the session,
 * so adding peas on Home immediately updates the cart bar, the Lists tab
 * and Checkout. Restarting the app resets the fixtures.
 */

export interface CartLine {
  productId: string;
  qty: number;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: CartLine[];
}

export interface Slot {
  dayId: string;
  dayLabel: string;
  dateLabel: string;
  windowId: string;
  windowLabel: string;
}

export interface Order {
  id: string;
  number: string;
  lines: CartLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  slotLabel: string;
  addressLabel: string;
  paymentLabel: string;
  status: "Scheduled" | "Delivered";
  placedLabel: string;
}

export type BackdropMode = "dark" | "light" | "image";

interface BasketState {
  userName: string;

  /* Cart */
  cart: CartLine[];
  qtyOf: (productId: string) => number;
  setQty: (productId: string, qty: number) => void;
  addToCart: (productId: string, qty?: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  deliveryFee: number;
  cartTotal: number;

  /* Favourites */
  favourites: string[];
  isFavourite: (productId: string) => boolean;
  toggleFavourite: (productId: string) => void;

  /* Shopping lists */
  lists: ShoppingList[];
  createList: (name: string) => ShoppingList;
  deleteList: (listId: string) => void;
  addListToCart: (listId: string) => void;
  addListItemToCart: (listId: string, productId: string) => void;

  /* Delivery slot */
  slot: Slot;
  setSlot: (slot: Slot) => void;
  slotLabel: string;

  /* Addresses & payment */
  addresses: Address[];
  addAddress: (label: string, line: string, city: string) => Address;
  selectedAddressId: string;
  setSelectedAddressId: (id: string) => void;
  selectedAddress: Address;
  paymentMethods: PaymentMethod[];
  selectedPaymentId: string;
  setSelectedPaymentId: (id: string) => void;

  /* Orders */
  orders: Order[];
  placeOrder: () => Order;
  reorder: (orderId: string) => void;

  /* Search */
  recentSearches: string[];
  addRecentSearch: (term: string) => void;

  /* Theme & preferences */
  /** The three backgrounds. `darkMode` is derived from this. */
  backdrop: BackdropMode;
  setBackdrop: (value: BackdropMode) => void;
  /** Derived: true unless the backdrop is the broken-white light mode. */
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  notifications: boolean;
  setNotifications: (value: boolean) => void;
  offers: boolean;
  setOffers: (value: boolean) => void;
}

const BasketContext = createContext<BasketState | null>(null);

const SEED_LISTS: ShoppingList[] = [
  {
    id: "weekly",
    name: "Weekly shop",
    items: [
      { productId: "milk", qty: 2 },
      { productId: "eggs", qty: 1 },
      { productId: "sourdough", qty: 1 },
      { productId: "bananas", qty: 1 },
      { productId: "chicken", qty: 1 },
      { productId: "penne", qty: 2 },
      { productId: "spinach", qty: 1 },
    ],
  },
  {
    id: "baking",
    name: "Weekend baking",
    items: [
      { productId: "muffins", qty: 1 },
      { productId: "croissants", qty: 1 },
      { productId: "ice-cream", qty: 1 },
    ],
  },
];

const SEED_ORDERS: Order[] = [
  {
    id: "o1",
    number: "BSK-1041",
    lines: [
      { productId: "milk", qty: 2 },
      { productId: "sourdough", qty: 1 },
      { productId: "salmon", qty: 1 },
      { productId: "peas", qty: 1 },
    ],
    subtotal: 33.28,
    deliveryFee: 3.99,
    total: 37.27,
    slotLabel: "Today · 8 – 10 AM",
    addressLabel: "Home",
    paymentLabel: "Visa ••4821",
    status: "Scheduled",
    placedLabel: "Placed this morning",
  },
  {
    id: "o2",
    number: "BSK-1036",
    lines: [
      { productId: "rice", qty: 1 },
      { productId: "olive-oil", qty: 1 },
      { productId: "orange-juice", qty: 2 },
      { productId: "cheddar", qty: 1 },
    ],
    subtotal: 25.7,
    deliveryFee: 3.99,
    total: 29.69,
    slotLabel: "Yesterday · 4 – 6 PM",
    addressLabel: "Home",
    paymentLabel: "Mastercard ••9034",
    status: "Delivered",
    placedLabel: "Placed yesterday",
  },
];

let counter = 200;
const nextId = () => `x${++counter}`;

export function BasketProvider({ children }: { children: ReactNode }) {
  const [cartMap, setCartMap] = useState<Record<string, number>>({});
  const [favourites, setFavourites] = useState<string[]>(["avocado", "croissants"]);
  const [lists, setLists] = useState<ShoppingList[]>(SEED_LISTS);
  const [addresses, setAddresses] = useState<Address[]>(SEED_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState("home");
  const [selectedPaymentId, setSelectedPaymentId] = useState("visa");
  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS);
  const [recentSearches, setRecentSearches] = useState<string[]>(["salmon", "sourdough"]);
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
  const [offers, setOffers] = useState(false);

  const firstDay = slotDays()[0];
  const [slot, setSlot] = useState<Slot>({
    dayId: firstDay.id,
    dayLabel: firstDay.label,
    dateLabel: firstDay.dateLabel,
    windowId: "w5",
    windowLabel: "4 – 6 PM",
  });

  /* ------------------------------ cart ------------------------------ */

  const setQty = useCallback((productId: string, qty: number) => {
    setCartMap((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[productId];
      else next[productId] = Math.min(qty, 99);
      return next;
    });
  }, []);

  const addToCart = useCallback(
    (productId: string, qty = 1) => {
      setCartMap((prev) => ({
        ...prev,
        [productId]: Math.min((prev[productId] ?? 0) + qty, 99),
      }));
    },
    [],
  );

  const clearCart = useCallback(() => setCartMap({}), []);

  const cart = useMemo<CartLine[]>(
    () =>
      Object.entries(cartMap).map(([productId, qty]) => ({ productId, qty })),
    [cartMap],
  );

  const qtyOf = useCallback(
    (productId: string) => cartMap[productId] ?? 0,
    [cartMap],
  );

  const cartSubtotal = useMemo(
    () =>
      cart.reduce(
        (sum, line) => sum + productById(line.productId).price * line.qty,
        0,
      ),
    [cart],
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, line) => sum + line.qty, 0),
    [cart],
  );

  const deliveryFee =
    cart.length === 0 || cartSubtotal >= FREE_DELIVERY_THRESHOLD
      ? 0
      : DELIVERY_FEE;
  const cartTotal = cartSubtotal + deliveryFee;

  /* --------------------------- favourites --------------------------- */

  const toggleFavourite = useCallback((productId: string) => {
    setFavourites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  }, []);

  const isFavourite = useCallback(
    (productId: string) => favourites.includes(productId),
    [favourites],
  );

  /* ------------------------------ lists ----------------------------- */

  const createList = useCallback((name: string) => {
    const list: ShoppingList = { id: nextId(), name: name.trim(), items: [] };
    setLists((prev) => [list, ...prev]);
    return list;
  }, []);

  const deleteList = useCallback((listId: string) => {
    setLists((prev) => prev.filter((l) => l.id !== listId));
  }, []);

  const addListToCart = useCallback(
    (listId: string) => {
      const list = lists.find((l) => l.id === listId);
      if (!list) return;
      setCartMap((prev) => {
        const next = { ...prev };
        for (const item of list.items) {
          next[item.productId] = Math.min(
            (next[item.productId] ?? 0) + item.qty,
            99,
          );
        }
        return next;
      });
    },
    [lists],
  );

  const addListItemToCart = useCallback(
    (listId: string, productId: string) => {
      const list = lists.find((l) => l.id === listId);
      const item = list?.items.find((i) => i.productId === productId);
      addToCart(productId, item?.qty ?? 1);
    },
    [lists, addToCart],
  );

  /* ---------------------------- addresses --------------------------- */

  const addAddress = useCallback((label: string, line: string, city: string) => {
    const address: Address = {
      id: nextId(),
      label: label.trim(),
      line: line.trim(),
      city: city.trim(),
    };
    setAddresses((prev) => [...prev, address]);
    setSelectedAddressId(address.id);
    return address;
  }, []);

  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) ?? addresses[0];

  /* ------------------------------ orders ---------------------------- */

  const slotLabel = `${slot.dayLabel} · ${slot.windowLabel}`;

  const placeOrder = useCallback((): Order => {
    const order: Order = {
      id: nextId(),
      number: `BSK-${1042 + orders.length}`,
      lines: cart,
      subtotal: cartSubtotal,
      deliveryFee,
      total: cartTotal,
      slotLabel,
      addressLabel: selectedAddress.label,
      paymentLabel:
        PAYMENT_METHODS.find((p) => p.id === selectedPaymentId)?.label ?? "",
      status: "Scheduled",
      placedLabel: "Placed just now",
    };
    setOrders((prev) => [order, ...prev]);
    setCartMap({});
    return order;
  }, [cart, cartSubtotal, deliveryFee, cartTotal, slotLabel, selectedAddress, selectedPaymentId, orders.length]);

  const reorder = useCallback((orderId: string) => {
    setOrders((current) => {
      const order = current.find((o) => o.id === orderId);
      if (order) {
        setCartMap((prev) => {
          const next = { ...prev };
          for (const line of order.lines) {
            next[line.productId] = Math.min(
              (next[line.productId] ?? 0) + line.qty,
              99,
            );
          }
          return next;
        });
      }
      return current;
    });
  }, []);

  /* ------------------------------ search ---------------------------- */

  const addRecentSearch = useCallback((term: string) => {
    const clean = term.trim();
    if (!clean) return;
    setRecentSearches((prev) =>
      [clean, ...prev.filter((t) => t.toLowerCase() !== clean.toLowerCase())].slice(0, 6),
    );
  }, []);

  const value = useMemo<BasketState>(
    () => ({
      userName: "Jordan Ellis",
      cart,
      qtyOf,
      setQty,
      addToCart,
      clearCart,
      cartCount,
      cartSubtotal,
      deliveryFee,
      cartTotal,
      favourites,
      isFavourite,
      toggleFavourite,
      lists,
      createList,
      deleteList,
      addListToCart,
      addListItemToCart,
      slot,
      setSlot,
      slotLabel,
      addresses,
      addAddress,
      selectedAddressId,
      setSelectedAddressId,
      selectedAddress,
      paymentMethods: PAYMENT_METHODS,
      selectedPaymentId,
      setSelectedPaymentId,
      orders,
      placeOrder,
      reorder,
      recentSearches,
      addRecentSearch,
      backdrop,
      setBackdrop,
      darkMode,
      setDarkMode,
      notifications,
      setNotifications,
      offers,
      setOffers,
    }),
    [
      cart,
      qtyOf,
      setQty,
      addToCart,
      clearCart,
      cartCount,
      cartSubtotal,
      deliveryFee,
      cartTotal,
      favourites,
      isFavourite,
      toggleFavourite,
      lists,
      createList,
      deleteList,
      addListToCart,
      addListItemToCart,
      slot,
      slotLabel,
      addresses,
      addAddress,
      selectedAddressId,
      selectedAddress,
      selectedPaymentId,
      orders,
      placeOrder,
      reorder,
      recentSearches,
      addRecentSearch,
      backdrop,
      darkMode,
      notifications,
      offers,
    ],
  );

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
}

export function useBasket(): BasketState {
  const ctx = useContext(BasketContext);
  if (!ctx) throw new Error("useBasket must be used inside BasketProvider");
  return ctx;
}

export { PRODUCTS };
