/**
 * The Lumen catalogue. These are the same pieces the web Storefront sells —
 * same names, prices and finishes — trimmed to the twelve best suited to a
 * phone-sized shop. Every product carries one bundled royalty-free photo
 * (see ProductVisual in ui.tsx); the finish's flat toned colour field and
 * the product's initial remain as the fallback when no photo is set.
 */

import type { ImageSourcePropType } from "react-native";

export type Category = "Drinkware" | "Tableware" | "Lighting" | "Decor";

export interface Finish {
  name: string;
  /** One flat, toned colour field the composed visual is drawn from. */
  tone: string;
}

export interface Product {
  id: string;
  /** Bundled product photo (local asset); the colour plate is the fallback. */
  image: ImageSourcePropType;
  name: string;
  price: number;
  compareAt?: number;
  category: Category;
  badge?: "New" | "Sale" | "Bestseller";
  blurb: string;
  description: string;
  rating: number;
  reviews: number;
  details: { label: string; body: string }[];
  finishes: Finish[];
  featured?: boolean;
}

export const CATEGORIES: Category[] = ["Drinkware", "Tableware", "Lighting", "Decor"];

const SHIPPING: { label: string; body: string } = {
  label: "Shipping & returns",
  body: "Ships in 2–3 business days in moulded pulp packaging. Free over $120. 60-day returns, no questions asked.",
};

export const PRODUCTS: Product[] = [
  {
    id: "aurora-carafe",
    image: require("./assets/img/aurora-carafe.jpg"),
    name: "Aurora Carafe",
    price: 68,
    category: "Drinkware",
    badge: "Bestseller",
    blurb: "A 1.2-litre mouth-blown carafe with a slow aurora gradient frozen into the glass.",
    description:
      "Each Aurora carafe is mouth-blown in small batches, and the gradient is not painted on — coloured glass is folded into the gather while it is still molten, so the dawn colours run through the wall of the vessel itself. It pours cleanly, seats a tumbler as a lid, and turns a plain glass of water into the best-looking thing on the table.",
    rating: 4.9,
    reviews: 412,
    details: [
      { label: "Materials & making", body: "Mouth-blown soda-lime glass with folded colour. 1.2 L capacity, 24 cm tall. Annealed overnight for strength." },
      { label: "Care", body: "Hand wash in warm water. Not suitable for boiling liquids or the freezer." },
      SHIPPING,
    ],
    finishes: [
      { name: "Dawn", tone: "#cd9260" },
      { name: "Dusk", tone: "#606a8a" },
      { name: "Clear", tone: "#bccfd8" },
    ],
    featured: true,
  },
  {
    id: "halo-tumblers-set",
    image: require("./assets/img/halo-tumblers.jpg"),
    name: "Halo Tumblers · Set of 4",
    price: 54,
    compareAt: 68,
    category: "Drinkware",
    badge: "Sale",
    blurb: "Stackable tumblers with a frosted halo band that keeps them grippy and condensation-free.",
    description:
      "The Halo tumblers are pressed, not blown, which makes them the workhorses of the range: they stack, they survive the dishwasher, and the frosted band gives wet hands something to hold on to. The base is weighted so they feel planted, not precarious.",
    rating: 4.8,
    reviews: 356,
    details: [
      { label: "Materials & making", body: "Pressed soda-lime glass, frosted grip band. 350 ml each, set of four." },
      { label: "Care", body: "Dishwasher safe on the top rack." },
      SHIPPING,
    ],
    finishes: [
      { name: "Clear", tone: "#a9c6d8" },
      { name: "Smoke", tone: "#767c88" },
      { name: "Amber", tone: "#d3a05f" },
    ],
    featured: true,
  },
  {
    id: "ember-wine-glasses",
    image: require("./assets/img/ember-wine-glasses.jpg"),
    name: "Ember Wine Glasses · Pair",
    price: 72,
    category: "Drinkware",
    badge: "New",
    blurb: "Thin-stemmed glasses with a warm amber bowl that makes every pour look like golden hour.",
    description:
      "Ember glasses are pulled-stem — bowl and stem drawn from a single gather of glass — so there is no seam to catch the light wrong. The amber tint is in the glass itself and will never fade, chip, or wash away.",
    rating: 4.7,
    reviews: 98,
    details: [
      { label: "Materials & making", body: "Pulled-stem mouth-blown glass, colour throughout. 420 ml bowl, pair of two." },
      { label: "Care", body: "Hand wash; dry stem-down on a linen cloth." },
      SHIPPING,
    ],
    finishes: [
      { name: "Amber", tone: "#d29a58" },
      { name: "Clear", tone: "#c3d4dc" },
      { name: "Rose", tone: "#d2a0ae" },
    ],
  },
  {
    id: "fjord-whisky-set",
    image: require("./assets/img/fjord-whisky-set.jpg"),
    name: "Fjord Whisky Set",
    price: 88,
    category: "Drinkware",
    blurb: "A heavy-based decanter and two glasses, the base cut to suggest glacial ice.",
    description:
      "The Fjord set is cut and polished by hand after blowing, which gives the base its broken-ice texture. The decanter's stopper is ground to fit its own neck, so the seal is glass on glass and airtight.",
    rating: 4.9,
    reviews: 187,
    details: [
      { label: "Materials & making", body: "Hand-cut lead-free crystal glass. Decanter 750 ml, glasses 300 ml." },
      { label: "Care", body: "Hand wash only; polish with a lint-free cloth." },
      SHIPPING,
    ],
    finishes: [
      { name: "Clear", tone: "#b4cbdc" },
      { name: "Smoke", tone: "#77828f" },
    ],
  },
  {
    id: "strata-dinner-plates",
    image: require("./assets/img/strata-dinner-plates.jpg"),
    name: "Strata Dinner Plates · Set of 4",
    price: 96,
    category: "Tableware",
    badge: "New",
    blurb: "Glass dinner plates layered like rock strata — each set has its own banding pattern.",
    description:
      "Strata plates are fused from stacked sheets of coloured glass, then slumped into shape in the kiln. The banding runs through the plate, so the pattern is the material, not a print. They are heavier than ceramic and considerably harder to chip.",
    rating: 4.8,
    reviews: 64,
    details: [
      { label: "Materials & making", body: "Kiln-fused sheet glass. 27 cm diameter, set of four." },
      { label: "Care", body: "Dishwasher safe; avoid sudden temperature shocks." },
      SHIPPING,
    ],
    finishes: [
      { name: "Sand", tone: "#c8a061" },
      { name: "Slate", tone: "#8296a9" },
      { name: "Moss", tone: "#93a877" },
    ],
    featured: true,
  },
  {
    id: "ripple-serving-bowl",
    image: require("./assets/img/ripple-serving-bowl.jpg"),
    name: "Ripple Serving Bowl",
    price: 58,
    compareAt: 72,
    category: "Tableware",
    badge: "Sale",
    blurb: "A wide, low bowl with a rippled rim that throws light across the table.",
    description:
      "The Ripple bowl is spun while cooling, which sets a gentle wave into the rim. It is the piece that makes a plain green salad look like a restaurant dish, and it doubles as a fruit bowl that earns its counter space.",
    rating: 4.6,
    reviews: 143,
    details: [
      { label: "Materials & making", body: "Mouth-blown glass, spun rim. 28 cm wide, 9 cm tall." },
      { label: "Care", body: "Hand wash recommended; top-rack dishwasher safe." },
      SHIPPING,
    ],
    finishes: [
      { name: "Clear", tone: "#bcd8e4" },
      { name: "Teal", tone: "#6fae9c" },
    ],
  },
  {
    id: "dune-dessert-cups",
    image: require("./assets/img/dune-dessert-cups.jpg"),
    name: "Dune Dessert Cups · Set of 4",
    price: 46,
    category: "Tableware",
    blurb: "Small footed cups in warm sand tones, made for affogato, mousse and late-night ice cream.",
    description:
      "Dune cups are pressed in a warm gradient that deepens toward the base, like sand settling. The foot keeps cold desserts off the table and the 180 ml size is exactly a scoop and a half.",
    rating: 4.7,
    reviews: 211,
    details: [
      { label: "Materials & making", body: "Pressed glass, footed. 180 ml each, set of four." },
      { label: "Care", body: "Dishwasher safe on the top rack." },
      SHIPPING,
    ],
    finishes: [
      { name: "Sand", tone: "#d3ab77" },
      { name: "Rose", tone: "#d8a7b2" },
    ],
  },
  {
    id: "orb-table-lamp",
    image: require("./assets/img/orb-table-lamp.jpg"),
    name: "Orb Table Lamp",
    price: 148,
    category: "Lighting",
    badge: "Bestseller",
    blurb: "A glowing glass orb on a brushed steel stem — dimmable, warm, and quietly sculptural.",
    description:
      "The Orb's shade is a single blown sphere of opal glass, so the light has no seams and no hot spots. A touch dimmer in the stem runs it from reading-bright to candle-glow, and the LED is replaceable, not sealed in.",
    rating: 4.9,
    reviews: 268,
    details: [
      { label: "Materials & making", body: "Blown opal glass shade, brushed steel stem. 32 cm tall, touch dimmer, replaceable G9 LED (included)." },
      { label: "Care", body: "Wipe with a dry cloth. Shade lifts off for dusting." },
      SHIPPING,
    ],
    finishes: [
      { name: "Opal", tone: "#e3c88f" },
      { name: "Smoke", tone: "#8d99a8" },
    ],
    featured: true,
  },
  {
    id: "cascade-pendant",
    image: require("./assets/img/cascade-pendant.jpg"),
    name: "Cascade Pendant",
    price: 189,
    compareAt: 229,
    category: "Lighting",
    badge: "Sale",
    blurb: "Three staggered glass drops on braided cords, made to hang over a table or island.",
    description:
      "Each Cascade drop is blown separately and hung at a slightly different height, so the trio moves a little in the air of the room. The cords adjust from 40 to 120 cm, and the ceiling rose hides the joins.",
    rating: 4.8,
    reviews: 92,
    details: [
      { label: "Materials & making", body: "Mouth-blown glass drops, braided fabric cords adjustable 40–120 cm. Hardwired; electrician recommended." },
      { label: "Care", body: "Dust with a soft cloth; shades remove for washing." },
      SHIPPING,
    ],
    finishes: [
      { name: "Clear", tone: "#bcd2e6" },
      { name: "Amber", tone: "#d5a35f" },
    ],
  },
  {
    id: "lumen-wall-sconce",
    image: require("./assets/img/lumen-wall-sconce.jpg"),
    name: "Lumen Wall Sconce",
    price: 118,
    category: "Lighting",
    badge: "New",
    blurb: "A half-dome of opal glass that washes the wall with light instead of glaring into the room.",
    description:
      "The Sconce points all of its light at the wall and lets the room have the reflection. It is the fastest way to make a hallway feel designed, and it pairs with the Orb lamp in the same opal glass.",
    rating: 4.7,
    reviews: 41,
    details: [
      { label: "Materials & making", body: "Blown opal glass half-dome, steel backplate. Hardwired, dimmable with trailing-edge dimmers." },
      { label: "Care", body: "Wipe with a dry cloth." },
      SHIPPING,
    ],
    finishes: [
      { name: "Opal", tone: "#e6cf96" },
      { name: "Clear", tone: "#c2d2da" },
    ],
  },
  {
    id: "tide-vase-tall",
    image: require("./assets/img/tide-vase.jpg"),
    name: "Tide Vase · Tall",
    price: 78,
    category: "Decor",
    badge: "Bestseller",
    blurb: "A tall vase with a sea-glass gradient, heavy enough to hold branches without tipping.",
    description:
      "Tide is blown with the colour gathered at the base and pulled upward, so the sea tones thin out as they climb — every vase settles slightly differently. The base is thick and weighted; tall branches stay put.",
    rating: 4.9,
    reviews: 324,
    details: [
      { label: "Materials & making", body: "Mouth-blown glass, pulled gradient. 38 cm tall, weighted base." },
      { label: "Care", body: "Hand wash; a bottle brush reaches the base." },
      SHIPPING,
    ],
    finishes: [
      { name: "Sea", tone: "#7fb8ab" },
      { name: "Clear", tone: "#bfd2d8" },
      { name: "Smoke", tone: "#84919e" },
    ],
    featured: true,
  },
  {
    id: "mira-wall-mirror",
    image: require("./assets/img/mira-wall-mirror.jpg"),
    name: "Mira Wall Mirror",
    price: 132,
    category: "Decor",
    badge: "New",
    blurb: "A round mirror in a slim glass frame that catches the light at its edge.",
    description:
      "Mira's frame is a ring of clear glass fused around the mirror's edge, so the rim glows when light crosses the room. It hangs on a single keyhole bracket and sits almost flush to the wall.",
    rating: 4.8,
    reviews: 57,
    details: [
      { label: "Materials & making", body: "Mirror glass with fused clear-glass rim. 50 cm diameter, keyhole bracket included." },
      { label: "Care", body: "Clean with a microfibre cloth and water only." },
      SHIPPING,
    ],
    finishes: [
      { name: "Clear", tone: "#bfcfdd" },
      { name: "Bronze", tone: "#c49a68" },
    ],
  },
];

export function productById(id: string): Product {
  const found = PRODUCTS.find((p) => p.id === id);
  if (!found) throw new Error(`Unknown product ${id}`);
  return found;
}

/** The finish object for a product + finish name (falls back to the first). */
export function finishOf(product: Product, finishName: string): Finish {
  return product.finishes.find((f) => f.name === finishName) ?? product.finishes[0];
}
