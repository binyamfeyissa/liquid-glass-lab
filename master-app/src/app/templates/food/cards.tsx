import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { colors, Badge, Button, Card } from "glacia-native";
import { ChevronRight } from "lucide-react-native";

import { useFood } from "./state";
import type { MenuItem, Restaurant } from "./data";
import {
  FavouriteButton,
  Meta,
  MONO,
  QuantityStepper,
  RestaurantThumb,
  RestaurantVisual,
  T,
  money,
} from "./ui";

/** The mono meta line shared by cards and rows: rating · time · fee. */
function restaurantMeta(restaurant: Restaurant): string {
  const fee =
    restaurant.deliveryFee === 0
      ? "Free delivery"
      : `${money(restaurant.deliveryFee)} delivery`;
  return `${restaurant.rating.toFixed(1)} · ${restaurant.eta} · ${fee}`;
}

/**
 * Full-width restaurant card used on Home and in Profile favourites.
 * The featured variant is the Home moment: a taller visual and the
 * restaurant's name set at title size.
 */
export function RestaurantCard({
  restaurant,
  featured = false,
}: {
  restaurant: Restaurant;
  featured?: boolean;
}) {
  const { darkMode } = useFood();
  return (
    <Card
      isDark={darkMode}
      padding={12}
      onPress={() => router.push(`/templates/food/restaurant/${restaurant.id}`)}
      accessibilityLabel={`${restaurant.name}, ${restaurant.cuisine}`}
      style={styles.card}
    >
      <View>
        <RestaurantVisual
          restaurant={restaurant}
          height={featured ? 168 : 120}
          initialSize={featured ? 72 : 52}
        />
        <View style={styles.heartOverlay}>
          <FavouriteButton restaurantId={restaurant.id} />
        </View>
      </View>
      <View style={styles.cardBody}>
        <T
          variant={featured ? "title" : "heading"}
          numberOfLines={1}
          style={styles.flex1}
        >
          {restaurant.name}
        </T>
        <T variant="caption" muted style={styles.cardMeta}>
          {restaurant.cuisine} · {restaurant.reviews.toLocaleString()} reviews
        </T>
        <Meta style={styles.cardMeta}>{restaurantMeta(restaurant)}</Meta>
      </View>
    </Card>
  );
}

/** Compact horizontal restaurant row, used in Search results. */
export function RestaurantRow({ restaurant }: { restaurant: Restaurant }) {
  const { darkMode } = useFood();
  return (
    <Card
      isDark={darkMode}
      padding={12}
      onPress={() => router.push(`/templates/food/restaurant/${restaurant.id}`)}
      accessibilityLabel={`${restaurant.name}, ${restaurant.cuisine}`}
    >
      <View style={styles.rowBody}>
        <RestaurantThumb restaurant={restaurant} />
        <View style={styles.flex1}>
          <T variant="body" numberOfLines={1}>
            {restaurant.name}
          </T>
          <T variant="caption" muted style={styles.cardMeta}>
            {restaurant.cuisine}
          </T>
          <Meta style={styles.cardMeta}>{restaurantMeta(restaurant)}</Meta>
        </View>
        <ChevronRight size={20} color={colors[darkMode ? "dark" : "light"].muted} />
      </View>
    </Card>
  );
}

/**
 * One dish on a menu: name, description, price, and either an Add button
 * or — once it is in the cart — a quantity stepper. The price is set in
 * mono with tabular figures, like a line on a receipt.
 */
export function MenuItemRow({
  restaurant,
  item,
}: {
  restaurant: Restaurant;
  item: MenuItem;
}) {
  const food = useFood();
  const qty = food.qtyOf(item.id);
  return (
    <View style={styles.menuRow}>
      <View style={styles.flex1}>
        <View style={styles.menuTitleRow}>
          <T variant="body" numberOfLines={1} style={styles.flex1}>
            {item.name}
          </T>
          {item.popular ? (
            <Badge tone="muted" isDark={food.darkMode}>
              Popular
            </Badge>
          ) : null}
        </View>
        <T variant="caption" muted style={styles.cardMeta} numberOfLines={2}>
          {item.description}
        </T>
        <T variant="body" style={styles.price}>
          {money(item.price)}
        </T>
      </View>
      <View style={styles.menuControl}>
        {qty === 0 ? (
          <Button
            isDark={food.darkMode}
            accessibilityLabel={`Add ${item.name} to cart`}
            variant="filled"
            size="sm"
            onPress={() => food.addItem(restaurant.id, item)}
          >
            Add
          </Button>
        ) : (
          <QuantityStepper itemId={item.id} small />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  card: { marginBottom: 16 },
  heartOverlay: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  cardBody: { paddingHorizontal: 8, paddingTop: 12, paddingBottom: 4 },
  cardMeta: { marginTop: 4 },
  rowBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 4,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  price: {
    marginTop: 4,
    fontFamily: MONO,
    fontVariant: ["tabular-nums"],
  },
  menuControl: { flexShrink: 0 },
});
