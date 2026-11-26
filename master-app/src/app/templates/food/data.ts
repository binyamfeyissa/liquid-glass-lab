/**
 * Fixtures for the Forkful template. Everything is local and static — no
 * network, no images. Restaurant "photos" are composed at render time from
 * each restaurant's flat colour plus its initial (see RestaurantVisual in
 * ui.tsx), so the template ships zero image assets for content.
 */

export type Category = "Pizza" | "Sushi" | "Burgers" | "Healthy" | "Desserts";

export const CATEGORIES: ("All" | Category)[] = [
  "All",
  "Pizza",
  "Sushi",
  "Burgers",
  "Healthy",
  "Desserts",
];

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  popular?: boolean;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  category: Category;
  rating: number;
  reviews: number;
  /** e.g. "15–25 min" */
  eta: string;
  deliveryFee: number;
  /** Flat colour field for the composed visual tile (second entry: darker shade). */
  colors: [string, string];
  /** Bundled photo for the restaurant visual (assets/img). */
  image?: number;
  tagline: string;
  menu: MenuSection[];
}

export const USER_IMAGE = require("./assets/img/alex-rivera.jpg");

export const RESTAURANTS: Restaurant[] = [
  {
    id: "sakura",
    name: "Sakura House",
    cuisine: "Japanese · Sushi",
    category: "Sushi",
    rating: 4.9,
    reviews: 2314,
    eta: "25–35 min",
    deliveryFee: 2.49,
    colors: ["#b35477", "#8f4260"],
    image: require("./assets/img/sakura-house.jpg"),
    tagline: "Chef's-counter sushi, rolled to order",
    menu: [
      {
        title: "Signature rolls",
        items: [
          { id: "sk-1", name: "Dragon Roll", description: "Shrimp tempura, avocado, eel glaze, tobiko", price: 16.5, popular: true },
          { id: "sk-2", name: "Salmon Nigiri Set", description: "Eight pieces of king salmon over seasoned rice", price: 18.0 },
          { id: "sk-3", name: "Spicy Tuna Crunch", description: "Yellowfin tuna, chilli crisp, cucumber, tempura flakes", price: 14.25, popular: true },
          { id: "sk-4", name: "Hamachi Sashimi", description: "Six slices of yellowtail with yuzu kosho", price: 17.75 },
        ],
      },
      {
        title: "Kitchen",
        items: [
          { id: "sk-5", name: "Tonkotsu Ramen", description: "18-hour broth, chashu pork, ajitama egg, nori", price: 15.5, popular: true },
          { id: "sk-6", name: "Miso Black Cod", description: "48-hour miso marinade, pickled ginger, steamed rice", price: 21.0 },
          { id: "sk-7", name: "Gyoza (6 pc)", description: "Pork and chive, pan-seared, ponzu dip", price: 8.75 },
        ],
      },
      {
        title: "Sides & drinks",
        items: [
          { id: "sk-8", name: "Edamame", description: "Sea salt and smoked chilli oil", price: 5.5 },
          { id: "sk-9", name: "Miso Soup", description: "Tofu, wakame, spring onion", price: 4.0 },
          { id: "sk-10", name: "Yuzu Lemonade", description: "House-pressed, lightly sparkling", price: 4.5 },
        ],
      },
    ],
  },
  {
    id: "nonna",
    name: "Nonna's Slice",
    cuisine: "Italian · Pizza",
    category: "Pizza",
    rating: 4.7,
    reviews: 1892,
    eta: "20–30 min",
    deliveryFee: 0.99,
    colors: ["#bc4630", "#9c3826"],
    image: require("./assets/img/nonnas-slice.jpg"),
    tagline: "Wood-fired pies from a 60-year-old starter",
    menu: [
      {
        title: "Pizzas",
        items: [
          { id: "nn-1", name: "Margherita Classica", description: "San Marzano tomato, fior di latte, basil", price: 12.0, popular: true },
          { id: "nn-2", name: "Diavola", description: "Spicy salami, calabrian chilli, honey drizzle", price: 15.5, popular: true },
          { id: "nn-3", name: "Funghi e Taleggio", description: "Roasted mushrooms, taleggio, thyme oil", price: 16.0 },
          { id: "nn-4", name: "Quattro Formaggi", description: "Mozzarella, gorgonzola, taleggio, parmesan", price: 15.0 },
        ],
      },
      {
        title: "Starters",
        items: [
          { id: "nn-5", name: "Burrata & Prosciutto", description: "Creamy burrata, 18-month prosciutto, grilled bread", price: 11.5 },
          { id: "nn-6", name: "Garlic Knots", description: "Wood-fired dough, garlic butter, parmesan snow", price: 6.5, popular: true },
          { id: "nn-7", name: "Arancini (3 pc)", description: "Saffron risotto, mozzarella heart, tomato sugo", price: 8.0 },
        ],
      },
      {
        title: "Desserts & drinks",
        items: [
          { id: "nn-8", name: "Tiramisu Cup", description: "Espresso-soaked savoiardi, mascarpone cream", price: 7.5 },
          { id: "nn-9", name: "San Pellegrino Limonata", description: "Sparkling lemon, 330 ml can", price: 3.0 },
        ],
      },
    ],
  },
  {
    id: "ember",
    name: "Ember & Oak",
    cuisine: "American · Burgers",
    category: "Burgers",
    rating: 4.8,
    reviews: 3120,
    eta: "15–25 min",
    deliveryFee: 1.49,
    colors: ["#a85f27", "#8a4c1f"],
    image: require("./assets/img/ember-oak.jpg"),
    tagline: "Dry-aged patties smashed on oak-fired steel",
    menu: [
      {
        title: "Burgers",
        items: [
          { id: "eo-1", name: "Ember Smash Burger", description: "Double smashed patty, aged cheddar, pickles, house sauce", price: 13.75, popular: true },
          { id: "eo-2", name: "Truffle Shroom Burger", description: "Truffle mayo, swiss, caramelised mushrooms, rocket", price: 15.25, popular: true },
          { id: "eo-3", name: "Smoky BBQ Stack", description: "Brisket burnt ends, onion rings, bourbon BBQ glaze", price: 16.5 },
          { id: "eo-4", name: "Garden Burger", description: "Charred portobello and halloumi, pesto, brioche bun", price: 12.5 },
        ],
      },
      {
        title: "Sides",
        items: [
          { id: "eo-5", name: "Oak Fries", description: "Triple-cooked, rosemary salt, smoked aioli", price: 5.75, popular: true },
          { id: "eo-6", name: "Onion Rings", description: "Beer-battered, chipotle ranch", price: 5.25 },
          { id: "eo-7", name: "Slaw & Pickles", description: "Crunchy cabbage slaw, house pickles", price: 4.0 },
        ],
      },
      {
        title: "Shakes",
        items: [
          { id: "eo-8", name: "Vanilla Bean Shake", description: "Madagascar vanilla, whipped cream", price: 6.5 },
          { id: "eo-9", name: "Salted Caramel Shake", description: "Burnt caramel, flaked sea salt", price: 6.95 },
        ],
      },
    ],
  },
  {
    id: "verde",
    name: "Verde Bowl",
    cuisine: "Fresh · Healthy",
    category: "Healthy",
    rating: 4.6,
    reviews: 987,
    eta: "10–20 min",
    deliveryFee: 1.29,
    colors: ["#5c7a35", "#49612b"],
    image: require("./assets/img/verde-bowl.jpg"),
    tagline: "Grain bowls and salads built in the morning",
    menu: [
      {
        title: "Bowls",
        items: [
          { id: "vb-1", name: "Harvest Grain Bowl", description: "Quinoa, roast sweet potato, kale, tahini-herb dressing", price: 12.75, popular: true },
          { id: "vb-2", name: "Poke Verde", description: "Sushi rice, salmon, edamame, avocado, sesame ponzu", price: 14.5, popular: true },
          { id: "vb-3", name: "Chicken Caesar Bowl", description: "Grilled chicken, little gem, sourdough crunch, caesar yogurt", price: 12.25 },
        ],
      },
      {
        title: "Salads & wraps",
        items: [
          { id: "vb-4", name: "Green Goddess Salad", description: "Avocado, cucumber, herbs, green goddess dressing", price: 11.0 },
          { id: "vb-5", name: "Falafel Wrap", description: "Baked falafel, pickled onion, garlic tahini, warm flatbread", price: 10.5 },
        ],
      },
      {
        title: "Juices",
        items: [
          { id: "vb-6", name: "Matcha Cooler", description: "Ceremonial matcha, coconut water, mint", price: 6.0, popular: true },
          { id: "vb-7", name: "Beet & Ginger Juice", description: "Cold-pressed beetroot, apple, ginger", price: 5.5 },
        ],
      },
    ],
  },
  {
    id: "smash",
    name: "Smash District",
    cuisine: "American · Burgers",
    category: "Burgers",
    rating: 4.5,
    reviews: 1440,
    eta: "15–20 min",
    deliveryFee: 0.0,
    colors: ["#b98a2f", "#97702a"],
    image: require("./assets/img/smash-district.jpg"),
    tagline: "Free delivery, no-frills smash burgers",
    menu: [
      {
        title: "Burgers",
        items: [
          { id: "sd-1", name: "District Double", description: "Two patties, american cheese, diced onion, district sauce", price: 11.5, popular: true },
          { id: "sd-2", name: "Chilli Cheese Smash", description: "Beef chilli, jalapeños, cheese sauce", price: 12.75 },
          { id: "sd-3", name: "Breakfast Smash", description: "Fried egg, hash brown, bacon jam — served all day", price: 12.0 },
        ],
      },
      {
        title: "Sides & drinks",
        items: [
          { id: "sd-4", name: "Crinkle Fries", description: "Sea salt, ketchup and mayo dips", price: 4.5, popular: true },
          { id: "sd-5", name: "Chicken Tenders (5 pc)", description: "Buttermilk-brined, honey mustard", price: 8.25 },
          { id: "sd-6", name: "Cola (330 ml)", description: "Chilled can", price: 2.0 },
        ],
      },
    ],
  },
  {
    id: "sugar",
    name: "Sugar Cloud",
    cuisine: "Bakery · Desserts",
    category: "Desserts",
    rating: 4.8,
    reviews: 764,
    eta: "15–20 min",
    deliveryFee: 0.0,
    colors: ["#7d639e", "#644e80"],
    image: require("./assets/img/sugar-cloud.jpg"),
    tagline: "Small-batch cakes and cloud-soft pastries",
    menu: [
      {
        title: "Cakes",
        items: [
          { id: "sc-1", name: "Basque Cheesecake Slice", description: "Burnt top, molten centre, vanilla bean", price: 7.25, popular: true },
          { id: "sc-2", name: "Chocolate Cloud Cake", description: "Three layers, whipped ganache, cocoa soil", price: 8.5, popular: true },
          { id: "sc-3", name: "Lemon Olive Oil Cake", description: "Amalfi lemon, mascarpone, pistachio dust", price: 7.75 },
        ],
      },
      {
        title: "Pastries",
        items: [
          { id: "sc-4", name: "Almond Croissant", description: "Twice-baked, frangipane, flaked almonds", price: 5.5 },
          { id: "sc-5", name: "Cinnamon Cloud Roll", description: "Brioche swirl, brown-butter glaze", price: 5.25, popular: true },
        ],
      },
      {
        title: "Drinks",
        items: [
          { id: "sc-6", name: "Flat White", description: "Double shot, velvet milk", price: 4.25 },
          { id: "sc-7", name: "Iced Hibiscus Tea", description: "Hibiscus, orange peel, mint", price: 4.0 },
        ],
      },
    ],
  },
];

export function restaurantById(id: string): Restaurant | undefined {
  return RESTAURANTS.find((r) => r.id === id);
}

/** Find a menu item and the restaurant it belongs to. */
export function itemById(
  itemId: string,
): { restaurant: Restaurant; item: MenuItem } | undefined {
  for (const restaurant of RESTAURANTS) {
    for (const section of restaurant.menu) {
      const item = section.items.find((i) => i.id === itemId);
      if (item) return { restaurant, item };
    }
  }
  return undefined;
}

/** Flat list of every dish, for search. */
export const ALL_ITEMS: { restaurant: Restaurant; item: MenuItem }[] =
  RESTAURANTS.flatMap((restaurant) =>
    restaurant.menu.flatMap((section) =>
      section.items.map((item) => ({ restaurant, item })),
    ),
  );

export const FEATURED_ID = "sakura";

export const RECENT_SEARCHES = ["ramen", "truffle burger", "matcha", "cheesecake"];

export interface PaymentCard {
  id: string;
  label: string;
  detail: string;
}

export const PAYMENT_CARDS: PaymentCard[] = [
  { id: "visa", label: "Visa •• 4242", detail: "Expires 08 / 28" },
  { id: "mc", label: "Mastercard •• 8810", detail: "Expires 03 / 27" },
  { id: "cash", label: "Cash on delivery", detail: "Pay the courier" },
];
