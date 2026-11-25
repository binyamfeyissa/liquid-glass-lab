import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { PRODUCTS, productById, type Product } from "./data";

/**
 * The whole template keeps its data in this one client-side store. There is
 * no backend and no persistence: state lives in memory for the session, so
 * adding a product on the detail screen immediately moves the cart badge on
 * Home, and placing an order at checkout lands it in the Orders tab.
 * Restarting the app resets the fixtures.
 */

export interface CartLine {
  /** productId + finish — the same vase in two finishes is two lines. */
  key: string;
  productId: string;
  finish: string;
  qty: number;
}

export type OrderStatus = "Processing" | "Shipped" | "Delivered";

/** The only three backgrounds the app offers. */
export type BackdropMode = "dark" | "light" | "image";

export interface OrderItem {
  productId: string;
  name: string;
  finish: string;
  qty: number;
  /** Unit price captured at purchase time. */
  price: number;
}

export interface Order {
  id: string;
  number: string;
  dateLabel: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  addressLabel: string;
  paymentLabel: string;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  postcode: string;
}

export interface CheckoutDetails {
  name: string;
  email: string;
  address: Address;
  paymentLabel: string;
}

interface ShopState {
  userName: string;
  userEmail: string;

  products: Product[];

  cart: CartLine[];
  cartCount: number;
  cartSubtotal: number;
  addToCart: (productId: string, finish: string, qty: number) => void;
  setLineQty: (key: string, qty: number) => void;
  removeLine: (key: string) => void;
  clearCart: () => void;

  /** The one promo this template honours, shown on the Cart screen. */
  promoCode: string | null;
  promoDiscount: number;
  applyPromo: (code: string) => boolean;
  removePromo: () => void;

  shippingFor: (subtotalAfterDiscount: number) => number;

  favourites: string[];
  isFavourite: (productId: string) => boolean;
  toggleFavourite: (productId: string) => void;

  orders: Order[];
  placeOrder: (details: CheckoutDetails) => Order;

  addresses: Address[];
  addAddress: (address: Omit<Address, "id">) => Address;

  /** The three-background choice, switched on Profile. */
  backdrop: BackdropMode;
  setBackdrop: (value: BackdropMode) => void;
  /** Derived: true unless the backdrop is the broken-white light mode. */
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  notifications: boolean;
  setNotifications: (value: boolean) => void;
  orderUpdates: boolean;
  setOrderUpdates: (value: boolean) => void;
}

const ShopContext = createContext<ShopState | null>(null);

export const PROMO_CODE = "GLASS10";
export const FREE_SHIPPING_OVER = 120;
export const FLAT_SHIPPING = 8;

const SEED_ADDRESSES: Address[] = [
  {
    id: "addr-home",
    label: "Home",
    street: "418 Maple Street, Apt 7",
    city: "Portland, OR",
    postcode: "97205",
  },
  {
    id: "addr-work",
    label: "Work",
    street: "1200 SW Morrison St, Floor 4",
    city: "Portland, OR",
    postcode: "97205",
  },
];

const SEED_ORDERS: Order[] = [
  {
    id: "ord-1",
    number: "LM-1031",
    dateLabel: "Nov 18, 2026",
    status: "Delivered",
    items: [
      { productId: "halo-tumblers-set", name: "Halo Tumblers · Set of 4", finish: "Clear", qty: 1, price: 54 },
      { productId: "dune-dessert-cups", name: "Dune Dessert Cups · Set of 4", finish: "Sand", qty: 1, price: 46 },
    ],
    subtotal: 100,
    discount: 0,
    shipping: 8,
    total: 108,
    addressLabel: "Home · 418 Maple Street, Apt 7",
    paymentLabel: "Card ••4821",
  },
  {
    id: "ord-2",
    number: "LM-1040",
    dateLabel: "Nov 24, 2026",
    status: "Shipped",
    items: [
      { productId: "orb-table-lamp", name: "Orb Table Lamp", finish: "Opal", qty: 1, price: 148 },
    ],
    subtotal: 148,
    discount: 14.8,
    shipping: 0,
    total: 133.2,
    addressLabel: "Home · 418 Maple Street, Apt 7",
    paymentLabel: "Card ••4821",
  },
];

let counter = 100;
const nextId = (prefix: string) => `${prefix}${++counter}`;

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [favourites, setFavourites] = useState<string[]>(["aurora-carafe", "tide-vase-tall"]);
  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS);
  const [addresses, setAddresses] = useState<Address[]>(SEED_ADDRESSES);
  const [backdrop, setBackdrop] = useState<BackdropMode>("dark");
  const darkMode = backdrop !== "light";
  const setDarkMode = useCallback((value: boolean) => {
    setBackdrop(value ? "dark" : "light");
  }, []);
  const [notifications, setNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);

  const addToCart = useCallback((productId: string, finish: string, qty: number) => {
    const key = `${productId}::${finish}`;
    setCart((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        return prev.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l));
      }
      return [...prev, { key, productId, finish, qty }];
    });
  }, []);

  const setLineQty = useCallback((key: string, qty: number) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((l) => l.key !== key)
        : prev.map((l) => (l.key === key ? { ...l, qty } : l)),
    );
  }, []);

  const removeLine = useCallback((key: string) => {
    setCart((prev) => prev.filter((l) => l.key !== key));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setPromoCode(null);
  }, []);

  const applyPromo = useCallback((code: string) => {
    if (code.trim().toUpperCase() === PROMO_CODE) {
      setPromoCode(PROMO_CODE);
      return true;
    }
    return false;
  }, []);

  const removePromo = useCallback(() => setPromoCode(null), []);

  const shippingFor = useCallback((subtotalAfterDiscount: number) => {
    if (subtotalAfterDiscount <= 0) return 0;
    return subtotalAfterDiscount >= FREE_SHIPPING_OVER ? 0 : FLAT_SHIPPING;
  }, []);

  const isFavourite = useCallback(
    (productId: string) => favourites.includes(productId),
    [favourites],
  );

  const toggleFavourite = useCallback((productId: string) => {
    setFavourites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  }, []);

  const addAddress = useCallback((address: Omit<Address, "id">) => {
    const created: Address = { ...address, id: nextId("addr-") };
    setAddresses((prev) => [...prev, created]);
    return created;
  }, []);

  const cartSubtotal = useMemo(
    () =>
      cart.reduce((sum, line) => sum + productById(line.productId).price * line.qty, 0),
    [cart],
  );

  const promoDiscount = promoCode ? Math.round(cartSubtotal * 0.1 * 100) / 100 : 0;

  const placeOrder = useCallback(
    (details: CheckoutDetails): Order => {
      const subtotal = cart.reduce(
        (sum, line) => sum + productById(line.productId).price * line.qty,
        0,
      );
      const discount = promoCode ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
      const shipping = shippingFor(subtotal - discount);
      const order: Order = {
        id: nextId("ord-"),
        number: `LM-${1042 + orders.length + Math.floor(Math.random() * 3)}`,
        dateLabel: "Today",
        status: "Processing",
        items: cart.map((line) => {
          const product = productById(line.productId);
          return {
            productId: line.productId,
            name: product.name,
            finish: line.finish,
            qty: line.qty,
            price: product.price,
          };
        }),
        subtotal,
        discount,
        shipping,
        total: subtotal - discount + shipping,
        addressLabel: `${details.address.label} · ${details.address.street}`,
        paymentLabel: details.paymentLabel,
      };
      setOrders((prev) => [order, ...prev]);
      setCart([]);
      setPromoCode(null);
      return order;
    },
    [cart, promoCode, orders.length, shippingFor],
  );

  const value = useMemo<ShopState>(
    () => ({
      userName: "Alex Rivera",
      userEmail: "alex@rivera.mail",
      products: PRODUCTS,
      cart,
      cartCount: cart.reduce((sum, l) => sum + l.qty, 0),
      cartSubtotal,
      addToCart,
      setLineQty,
      removeLine,
      clearCart,
      promoCode,
      promoDiscount,
      applyPromo,
      removePromo,
      shippingFor,
      favourites,
      isFavourite,
      toggleFavourite,
      orders,
      placeOrder,
      addresses,
      addAddress,
      backdrop,
      setBackdrop,
      darkMode,
      setDarkMode,
      notifications,
      setNotifications,
      orderUpdates,
      setOrderUpdates,
    }),
    [
      cart,
      cartSubtotal,
      addToCart,
      setLineQty,
      removeLine,
      clearCart,
      promoCode,
      promoDiscount,
      applyPromo,
      removePromo,
      shippingFor,
      favourites,
      isFavourite,
      toggleFavourite,
      orders,
      placeOrder,
      addresses,
      addAddress,
      backdrop,
      darkMode,
      notifications,
      orderUpdates,
    ],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop(): ShopState {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}
