import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useLocalSearchParams } from "expo-router";

import { itemById, restaurantById, type MenuItem, type Restaurant } from "./data";

/**
 * One client-side store for the whole template: cart, orders, favourites,
 * addresses and the manual theme. There is no backend and no persistence —
 * state lives in memory for the session, so adding a dish on a restaurant
 * screen immediately moves the cart badge, and placing an order moves it
 * into the Orders history. Restarting the app resets the fixtures.
 */

export interface CartLine {
  item: MenuItem;
  qty: number;
}

export type OrderStatus = "Confirmed" | "Preparing" | "On the way" | "Delivered";

export const ORDER_STEPS: OrderStatus[] = [
  "Confirmed",
  "Preparing",
  "On the way",
  "Delivered",
];

export interface OrderLine {
  itemId: string;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  /** Index into ORDER_STEPS. */
  statusIndex: number;
  placedLabel: string;
  addressLabel: string;
  paymentLabel: string;
}

export interface Address {
  id: string;
  label: string;
  line: string;
}

export type BackdropMode = "dark" | "light" | "image";

interface FoodState {
  userName: string;

  /* Cart ------------------------------------------------------------ */
  cartRestaurantId: string | null;
  cartRestaurant: Restaurant | null;
  cartItems: Record<string, number>;
  cartLines: CartLine[];
  cartCount: number;
  cartSubtotal: number;
  qtyOf: (itemId: string) => number;
  addItem: (restaurantId: string, item: MenuItem) => void;
  setQty: (itemId: string, qty: number) => void;
  clearCart: () => void;
  promoCode: string | null;
  promoError: string | null;
  applyPromo: (code: string) => void;
  promoDiscount: number;

  /* Orders ------------------------------------------------------------ */
  orders: Order[];
  activeOrder: Order | null;
  placeOrder: (input: {
    addressLabel: string;
    paymentLabel: string;
    instructions: string;
  }) => Order;
  advanceActiveOrder: () => void;
  reorder: (order: Order) => void;

  /* Favourites --------------------------------------------------------- */
  favourites: string[];
  isFavourite: (restaurantId: string) => boolean;
  toggleFavourite: (restaurantId: string) => void;

  /* Addresses ------------------------------------------------------------ */
  addresses: Address[];
  addAddress: (label: string, line: string) => Address;

  /* Theme --------------------------------------------------------------- */
  /** The three backgrounds. Every Glacia `isDark` prop derives from it. */
  backdrop: BackdropMode;
  setBackdrop: (value: BackdropMode) => void;
  /** Derived: true unless the backdrop is the broken-white light mode. */
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  notifications: boolean;
  setNotifications: (value: boolean) => void;
}

const FoodContext = createContext<FoodState | null>(null);

const SEED_ADDRESSES: Address[] = [
  { id: "addr-home", label: "Home", line: "128 Maple Street, Apt 4B" },
  { id: "addr-work", label: "Work", line: "900 Pine Avenue, Floor 12" },
];

const SEED_ORDERS: Order[] = [
  {
    id: "FD-2041",
    restaurantId: "nonna",
    restaurantName: "Nonna's Slice",
    lines: [
      { itemId: "nn-2", name: "Diavola", price: 15.5, qty: 1 },
      { itemId: "nn-6", name: "Garlic Knots", price: 6.5, qty: 1 },
    ],
    subtotal: 22.0,
    discount: 0,
    deliveryFee: 0.99,
    total: 22.99,
    statusIndex: 3,
    placedLabel: "Tue, Nov 17 · 7:42 PM",
    addressLabel: "Home — 128 Maple Street, Apt 4B",
    paymentLabel: "Visa •• 4242",
  },
  {
    id: "FD-1987",
    restaurantId: "verde",
    restaurantName: "Verde Bowl",
    lines: [
      { itemId: "vb-2", name: "Poke Verde", price: 14.5, qty: 1 },
      { itemId: "vb-6", name: "Matcha Cooler", price: 6.0, qty: 2 },
    ],
    subtotal: 26.5,
    discount: 2.65,
    deliveryFee: 1.29,
    total: 25.14,
    statusIndex: 3,
    placedLabel: "Sat, Nov 14 · 12:15 PM",
    addressLabel: "Work — 900 Pine Avenue, Floor 12",
    paymentLabel: "Mastercard •• 8810",
  },
];

let counter = 2100;
const nextOrderId = () => `FD-${++counter}`;
let addressCounter = 100;
const nextAddressId = () => `addr-${++addressCounter}`;

export function FoodProvider({ children }: { children: ReactNode }) {
  const [cartRestaurantId, setCartRestaurantId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<Record<string, number>>({});
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS);
  const [favourites, setFavourites] = useState<string[]>(["sakura"]);
  const [addresses, setAddresses] = useState<Address[]>(SEED_ADDRESSES);
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

  /* Cart ------------------------------------------------------------ */

  const addItem = useCallback((restaurantId: string, item: MenuItem) => {
    setCartItems((prev) => {
      // One restaurant per order: adding from a new place starts a fresh cart.
      const base = cartRestaurantId === restaurantId ? prev : {};
      return { ...base, [item.id]: (base[item.id] ?? 0) + 1 };
    });
    setCartRestaurantId(restaurantId);
    setPromoCode(null);
    setPromoError(null);
  }, [cartRestaurantId]);

  const setQty = useCallback((itemId: string, qty: number) => {
    setCartItems((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[itemId];
      else next[itemId] = qty;
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems({});
    setCartRestaurantId(null);
    setPromoCode(null);
    setPromoError(null);
  }, []);

  const applyPromo = useCallback((code: string) => {
    const normalized = code.trim().toUpperCase();
    if (normalized === "FORK10") {
      setPromoCode("FORK10");
      setPromoError(null);
    } else {
      setPromoCode(null);
      setPromoError(
        normalized ? `“${normalized}” isn't a valid code` : "Enter a code first",
      );
    }
  }, []);

  const cartLines = useMemo<CartLine[]>(() => {
    return Object.entries(cartItems)
      .map(([itemId, qty]) => {
        const found = itemById(itemId);
        return found ? { item: found.item, qty } : null;
      })
      .filter((l): l is CartLine => l !== null);
  }, [cartItems]);

  const cartSubtotal = useMemo(
    () => cartLines.reduce((sum, l) => sum + l.item.price * l.qty, 0),
    [cartLines],
  );

  const cartCount = useMemo(
    () => cartLines.reduce((sum, l) => sum + l.qty, 0),
    [cartLines],
  );

  const promoDiscount = promoCode === "FORK10" ? cartSubtotal * 0.1 : 0;

  /* Orders ------------------------------------------------------------ */

  const placeOrder = useCallback(
    (input: { addressLabel: string; paymentLabel: string; instructions: string }) => {
      const restaurant = cartRestaurantId ? restaurantById(cartRestaurantId) : undefined;
      const deliveryFee = restaurant?.deliveryFee ?? 0;
      const order: Order = {
        id: nextOrderId(),
        restaurantId: restaurant?.id ?? "",
        restaurantName: restaurant?.name ?? "Forkful",
        lines: cartLines.map((l) => ({
          itemId: l.item.id,
          name: l.item.name,
          price: l.item.price,
          qty: l.qty,
        })),
        subtotal: cartSubtotal,
        discount: promoDiscount,
        deliveryFee,
        total: cartSubtotal - promoDiscount + deliveryFee,
        statusIndex: 0,
        placedLabel: "Just now",
        addressLabel: input.addressLabel,
        paymentLabel: input.paymentLabel,
      };
      setOrders((prev) => [order, ...prev]);
      setCartItems({});
      setCartRestaurantId(null);
      setPromoCode(null);
      setPromoError(null);
      return order;
    },
    [cartLines, cartRestaurantId, cartSubtotal, promoDiscount],
  );

  const activeOrder = useMemo(
    () => orders.find((o) => o.statusIndex < ORDER_STEPS.length - 1) ?? null,
    [orders],
  );

  const advanceActiveOrder = useCallback(() => {
    setOrders((prev) => {
      const idx = prev.findIndex((o) => o.statusIndex < ORDER_STEPS.length - 1);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        statusIndex: Math.min(next[idx].statusIndex + 1, ORDER_STEPS.length - 1),
      };
      return next;
    });
  }, []);

  const reorder = useCallback((order: Order) => {
    const items: Record<string, number> = {};
    for (const line of order.lines) {
      if (itemById(line.itemId)) items[line.itemId] = line.qty;
    }
    setCartItems(items);
    setCartRestaurantId(order.restaurantId);
    setPromoCode(null);
    setPromoError(null);
  }, []);

  /* Favourites & addresses ------------------------------------------------ */

  const toggleFavourite = useCallback((restaurantId: string) => {
    setFavourites((prev) =>
      prev.includes(restaurantId)
        ? prev.filter((id) => id !== restaurantId)
        : [...prev, restaurantId],
    );
  }, []);

  const addAddress = useCallback((label: string, line: string) => {
    const address: Address = { id: nextAddressId(), label, line };
    setAddresses((prev) => [...prev, address]);
    return address;
  }, []);

  const value = useMemo<FoodState>(() => {
    return {
      userName: "Alex Rivera",
      cartRestaurantId,
      cartRestaurant: cartRestaurantId ? restaurantById(cartRestaurantId) ?? null : null,
      cartItems,
      cartLines,
      cartCount,
      cartSubtotal,
      qtyOf: (itemId: string) => cartItems[itemId] ?? 0,
      addItem,
      setQty,
      clearCart,
      promoCode,
      promoError,
      applyPromo,
      promoDiscount,
      orders,
      activeOrder,
      placeOrder,
      advanceActiveOrder,
      reorder,
      favourites,
      isFavourite: (id: string) => favourites.includes(id),
      toggleFavourite,
      addresses,
      addAddress,
      backdrop,
      setBackdrop,
      darkMode,
      setDarkMode,
      notifications,
      setNotifications,
    };
  }, [
    cartRestaurantId,
    cartItems,
    cartLines,
    cartCount,
    cartSubtotal,
    addItem,
    setQty,
    clearCart,
    promoCode,
    promoError,
    applyPromo,
    promoDiscount,
    orders,
    activeOrder,
    placeOrder,
    advanceActiveOrder,
    reorder,
    favourites,
    toggleFavourite,
    addresses,
    addAddress,
    backdrop,
    darkMode,
    notifications,
  ]);

  return <FoodContext.Provider value={value}>{children}</FoodContext.Provider>;
}

export function useFood(): FoodState {
  const ctx = useContext(FoodContext);
  if (!ctx) throw new Error("useFood must be used inside FoodProvider");
  return ctx;
}
