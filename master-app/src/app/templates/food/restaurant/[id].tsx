import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button } from "glacia-native";

import { useFood } from "../state";
import { restaurantById } from "../data";
import { MenuItemRow } from "../cards";
import {
  BackButton,
  CartButton,
  FavouriteButton,
  ListCard,
  Meta,
  RestaurantVisual,
  RowSeparator,
  SectionTitle,
  T,
  money,
} from "../ui";

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const food = useFood();
  const restaurant = id ? restaurantById(id) : undefined;

  if (!restaurant) {
    return (
      <View style={styles.missing}>
        <T variant="heading">Restaurant not found</T>
        <Button
          isDark={food.darkMode}
          accessibilityLabel="Back to home"
          variant="filled"
          onPress={() => router.replace("/templates/food/(tabs)")}
          style={styles.missingButton}
        >
          Back to home
        </Button>
      </View>
    );
  }

  const cartHere =
    food.cartRestaurantId === restaurant.id ? food.cartCount : 0;

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header row */}
        <View style={styles.topRow}>
          <BackButton />
          <View style={styles.flex1} />
          <CartButton />
        </View>

        {/* Hero */}
        <View style={styles.heroWrap}>
          <RestaurantVisual restaurant={restaurant} height={168} initialSize={72} />
          <View style={styles.heartOverlay}>
            <FavouriteButton restaurantId={restaurant.id} size="lg" />
          </View>
        </View>

        <View style={styles.titleBlock}>
          <T variant="title">{restaurant.name}</T>
          <T variant="body" muted style={styles.meta}>
            {restaurant.cuisine}
          </T>
          <Meta style={styles.meta}>
            {restaurant.rating.toFixed(1)} ({restaurant.reviews.toLocaleString()} reviews) ·{" "}
            {restaurant.eta} ·{" "}
            {restaurant.deliveryFee === 0
              ? "Free delivery"
              : `${money(restaurant.deliveryFee)} delivery fee`}
          </Meta>
          <T variant="body" style={styles.tagline}>
            {restaurant.tagline}
          </T>
        </View>

        {/* Menu, grouped by section */}
        {restaurant.menu.map((section) => (
          <View key={section.title} style={styles.section}>
            <SectionTitle>{section.title}</SectionTitle>
            <ListCard>
              {section.items.map((item, i) => (
                <React.Fragment key={item.id}>
                  {i > 0 ? <RowSeparator /> : null}
                  <MenuItemRow restaurant={restaurant} item={item} />
                </React.Fragment>
              ))}
            </ListCard>
          </View>
        ))}
      </ScrollView>

      {/* Sticky view-cart bar, only when this restaurant fills the cart */}
      {cartHere > 0 ? (
        <View style={styles.cartBar}>
          <Button
            isDark={food.darkMode}
            accessibilityLabel={`View cart, ${cartHere} items`}
            variant="filled"
            size="lg"
            onPress={() => router.push("/templates/food/cart")}
          >{`View cart · ${cartHere} item${cartHere === 1 ? "" : "s"} ·${" "}${money(food.cartSubtotal)}`}</Button>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 32,
  },
  flex1: { flex: 1 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  heroWrap: { position: "relative" },
  heartOverlay: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  titleBlock: { marginTop: 16, marginBottom: 24 },
  meta: { marginTop: 4 },
  tagline: { marginTop: 8 },
  section: { marginBottom: 24 },
  cartBar: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  missing: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 32,
  },
  missingButton: { minWidth: 180 },
});
