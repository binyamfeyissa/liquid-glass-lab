/**
 * Fixtures for Basket. Everything is local and realistic: seven aisles,
 * twenty-two products with units and per-100g nutrition, saved addresses,
 * fixture payment methods and delivery windows. No network, no images —
 * product "photos" are flat tonal plates mixed in ui.tsx from each
 * product's hue pair.
 */

export interface Aisle {
  id: string;
  name: string;
  tagline: string;
  /** [light, deep] colour pair the aisle's flat plate is mixed from. */
  hue: [string, string];
}

export const AISLES: Aisle[] = [
  { id: "produce", name: "Produce", tagline: "Fruit & vegetables", hue: ["#86efac", "#15803d"] },
  { id: "bakery", name: "Bakery", tagline: "Baked this morning", hue: ["#fcd34d", "#b45309"] },
  { id: "dairy", name: "Dairy & Eggs", tagline: "Milk, cheese, yogurt", hue: ["#fde68a", "#eab308"] },
  { id: "meat", name: "Meat & Fish", tagline: "Butcher & fishmonger", hue: ["#fca5a5", "#b91c1c"] },
  { id: "pantry", name: "Pantry", tagline: "Rice, pasta, oils", hue: ["#fdba74", "#c2410c"] },
  { id: "frozen", name: "Frozen", tagline: "Peas to ice cream", hue: ["#a5f3fc", "#0369a1"] },
  { id: "drinks", name: "Drinks", tagline: "Juice, coffee, fizz", hue: ["#c4b5fd", "#6d28d9"] },
];

export interface Nutrition {
  /** Per 100 g (or 100 ml for drinks). */
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Product {
  id: string;
  name: string;
  aisleId: string;
  /** Price for one purchasable unit. Quantities are whole units. */
  price: number;
  /** How the unit is sold: "per kg", "pack of 4", "1 L bottle"… */
  unit: string;
  /** Short shelf label shown under the name. */
  detail: string;
  hue: [string, string];
  badge?: string;
  /** Original price when the product is the deal of the day. */
  compareAt?: number;
  nutrition: Nutrition;
}

export const PRODUCTS: Product[] = [
  // Produce
  { id: "avocado", name: "Hass Avocados", aisleId: "produce", price: 5.96, unit: "pack of 4", detail: "Ready to eat · Mexico", hue: ["#bbf7d0", "#166534"], badge: "Organic", nutrition: { calories: 160, protein: 2.0, carbs: 8.5, fat: 14.7 } },
  { id: "tomatoes", name: "Roma Tomatoes", aisleId: "produce", price: 2.48, unit: "per kg", detail: "On the vine", hue: ["#fecaca", "#dc2626"], nutrition: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 } },
  { id: "spinach", name: "Baby Spinach", aisleId: "produce", price: 3.29, unit: "200 g bag", detail: "Washed & ready", hue: ["#86efac", "#14532d"], nutrition: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 } },
  { id: "bananas", name: "Cavendish Bananas", aisleId: "produce", price: 1.19, unit: "per kg", detail: "Fairtrade", hue: ["#fef08a", "#ca8a04"], nutrition: { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3 } },
  // Bakery
  { id: "sourdough", name: "Sourdough Loaf", aisleId: "bakery", price: 4.75, unit: "800 g loaf", detail: "Baked 6 AM today", hue: ["#fde68a", "#92400e"], nutrition: { calories: 259, protein: 9.0, carbs: 49.0, fat: 1.8 } },
  { id: "croissants", name: "Butter Croissants", aisleId: "bakery", price: 5.49, compareAt: 6.99, unit: "pack of 4", detail: "All-butter · deal of the day", hue: ["#fcd34d", "#b45309"], badge: "Deal", nutrition: { calories: 406, protein: 8.2, carbs: 45.0, fat: 21.0 } },
  { id: "muffins", name: "Blueberry Muffins", aisleId: "bakery", price: 3.99, unit: "pack of 2", detail: "Baked in store", hue: ["#c4b5fd", "#5b21b6"], nutrition: { calories: 377, protein: 5.4, carbs: 52.0, fat: 16.0 } },
  // Dairy & Eggs
  { id: "milk", name: "Whole Milk", aisleId: "dairy", price: 1.89, unit: "1 L bottle", detail: "Organic · pasteurised", hue: ["#fef9c3", "#a16207"], nutrition: { calories: 64, protein: 3.3, carbs: 4.8, fat: 3.6 } },
  { id: "eggs", name: "Free-Range Eggs", aisleId: "dairy", price: 4.29, unit: "box of 12", detail: "Grade A · large", hue: ["#ffedd5", "#c2410c"], nutrition: { calories: 143, protein: 12.6, carbs: 0.7, fat: 9.5 } },
  { id: "yogurt", name: "Greek Yogurt", aisleId: "dairy", price: 3.79, unit: "500 g tub", detail: "10% fat · strained", hue: ["#e0f2fe", "#075985"], nutrition: { calories: 97, protein: 9.0, carbs: 4.0, fat: 5.0 } },
  { id: "cheddar", name: "Aged Cheddar", aisleId: "dairy", price: 5.25, unit: "250 g block", detail: "Matured 14 months", hue: ["#fde68a", "#b45309"], nutrition: { calories: 416, protein: 25.0, carbs: 0.1, fat: 34.9 } },
  // Meat & Fish
  { id: "chicken", name: "Chicken Breast", aisleId: "meat", price: 8.9, unit: "per kg", detail: "Skinless · corn-fed", hue: ["#fecdd3", "#9f1239"], nutrition: { calories: 165, protein: 31.0, carbs: 0.0, fat: 3.6 } },
  { id: "salmon", name: "Salmon Fillet", aisleId: "meat", price: 12.4, unit: "per kg", detail: "Faroe Islands · skin on", hue: ["#fed7aa", "#c2410c"], badge: "Fresh", nutrition: { calories: 208, protein: 20.0, carbs: 0.0, fat: 13.0 } },
  { id: "mince", name: "Beef Mince", aisleId: "meat", price: 6.85, unit: "500 g pack", detail: "10% fat", hue: ["#fca5a5", "#7f1d1d"], nutrition: { calories: 250, protein: 26.0, carbs: 0.0, fat: 15.0 } },
  // Pantry
  { id: "rice", name: "Basmati Rice", aisleId: "pantry", price: 5.6, unit: "2 kg bag", detail: "Aged 12 months", hue: ["#fef3c7", "#92400e"], nutrition: { calories: 360, protein: 7.0, carbs: 78.0, fat: 0.6 } },
  { id: "olive-oil", name: "Extra-Virgin Olive Oil", aisleId: "pantry", price: 7.95, unit: "500 ml bottle", detail: "Cold pressed · Sicily", hue: ["#d9f99d", "#3f6212"], nutrition: { calories: 884, protein: 0.0, carbs: 0.0, fat: 100.0 } },
  { id: "penne", name: "Penne Pasta", aisleId: "pantry", price: 1.65, unit: "500 g pack", detail: "Bronze-cut durum", hue: ["#fde68a", "#a16207"], nutrition: { calories: 371, protein: 13.0, carbs: 75.0, fat: 1.5 } },
  // Frozen
  { id: "peas", name: "Garden Peas", aisleId: "frozen", price: 2.35, unit: "1 kg bag", detail: "Frozen within 2 hours", hue: ["#bbf7d0", "#15803d"], nutrition: { calories: 81, protein: 5.4, carbs: 14.0, fat: 0.4 } },
  { id: "ice-cream", name: "Vanilla Ice Cream", aisleId: "frozen", price: 4.99, unit: "1 L tub", detail: "Madagascan vanilla", hue: ["#fef9c3", "#854d0e"], nutrition: { calories: 207, protein: 3.5, carbs: 24.0, fat: 11.0 } },
  // Drinks
  { id: "cold-brew", name: "Cold Brew Coffee", aisleId: "drinks", price: 5.5, unit: "750 ml bottle", detail: "18-hour steep", hue: ["#d6d3d1", "#44403c"], nutrition: { calories: 2, protein: 0.3, carbs: 0.0, fat: 0.0 } },
  { id: "orange-juice", name: "Orange Juice", aisleId: "drinks", price: 3.45, unit: "1.5 L carton", detail: "Not from concentrate", hue: ["#fed7aa", "#ea580c"], badge: "New", nutrition: { calories: 45, protein: 0.7, carbs: 10.4, fat: 0.2 } },
  { id: "sparkling", name: "Sparkling Water", aisleId: "drinks", price: 3.15, unit: "6 × 330 ml", detail: "Lightly carbonated", hue: ["#bae6fd", "#0369a1"], nutrition: { calories: 0, protein: 0.0, carbs: 0.0, fat: 0.0 } },
];

export const productById = (id: string): Product =>
  PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0];

export const aisleById = (id: string): Aisle =>
  AISLES.find((a) => a.id === id) ?? AISLES[0];

export const productsInAisle = (aisleId: string): Product[] =>
  PRODUCTS.filter((p) => p.aisleId === aisleId);

/* ------------------------------------------------------------------ */
/*  Delivery slots — days are generated from today so the picker       */
/*  always shows real upcoming dates. A few windows are fixtures       */
/*  marked full / nearly full.                                         */
/* ------------------------------------------------------------------ */

export interface SlotDay {
  id: string;
  /** "Today", "Tomorrow", or the weekday name. */
  label: string;
  /** "Sat 22 Nov". */
  dateLabel: string;
}

export interface SlotWindow {
  id: string;
  label: string;
  state: "open" | "few" | "full";
}

export const SLOT_WINDOWS: SlotWindow[] = [
  { id: "w1", label: "8 – 10 AM", state: "open" },
  { id: "w2", label: "10 AM – 12 PM", state: "open" },
  { id: "w3", label: "12 – 2 PM", state: "few" },
  { id: "w4", label: "2 – 4 PM", state: "open" },
  { id: "w5", label: "4 – 6 PM", state: "open" },
  { id: "w6", label: "6 – 8 PM", state: "few" },
];

export function slotDays(): SlotDay[] {
  const days: SlotDay[] = [];
  const now = new Date();
  for (let i = 0; i < 4; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
    const dateLabel = d.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    days.push({
      id: `d${i}`,
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : weekday,
      dateLabel,
    });
  }
  return days;
}

/** Windows for a day: today's early windows are gone/full, later days open up. */
export function windowsForDay(dayId: string): SlotWindow[] {
  if (dayId === "d0") {
    return SLOT_WINDOWS.map((w, i) =>
      i < 2 ? { ...w, state: "full" as const } : w,
    );
  }
  if (dayId === "d1") {
    return SLOT_WINDOWS.map((w, i) =>
      i === 0 ? { ...w, state: "few" as const } : { ...w, state: "open" as const },
    );
  }
  return SLOT_WINDOWS.map((w) => ({ ...w, state: "open" as const }));
}

/* ------------------------------------------------------------------ */
/*  Addresses & payment fixtures.                                      */
/* ------------------------------------------------------------------ */

export interface Address {
  id: string;
  label: string;
  line: string;
  city: string;
}

export const SEED_ADDRESSES: Address[] = [
  { id: "home", label: "Home", line: "418 Maple St, Apt 7", city: "Springfield" },
  { id: "office", label: "Office", line: "22 Northwind Plaza, Floor 3", city: "Springfield" },
];

export interface PaymentMethod {
  id: string;
  label: string;
  detail: string;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "visa", label: "Visa ••4821", detail: "Expires 08/28" },
  { id: "mc", label: "Mastercard ••9034", detail: "Expires 01/27" },
  { id: "cash", label: "Cash on delivery", detail: "Pay the courier" },
];

export const FREE_DELIVERY_THRESHOLD = 40;
export const DELIVERY_FEE = 3.99;
