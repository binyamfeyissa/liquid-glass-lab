import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { colors, Badge, Button, Field, Input } from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import ChevronRightIcon from "@hugeicons/core-free-icons/ChevronRightIcon";
import { useFood } from "./state";
import {
  BackButton,
  ListCard,
  MONO,
  Meta,
  QuantityStepper,
  RestaurantThumb,
  RowSeparator,
  SectionTitle,
  T,
  money,
  negativeColor,
  positiveColor,
} from "./ui";

export default function CartScreen() {
  const food = useFood();
  const [promoInput, setPromoInput] = useState("");

  const restaurant = food.cartRestaurant;
  const deliveryFee = restaurant?.deliveryFee ?? 0;
  const total = food.cartSubtotal - food.promoDiscount + deliveryFee;

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <BackButton />
          <T variant="title">Your cart</T>
        </View>

        {food.cartLines.length === 0 || !restaurant ? (
          <View style={styles.empty}>
            <T variant="heading">Your cart is empty</T>
            <T variant="body" muted style={styles.emptyText}>
              Add a dish from a restaurant and it will show up here
            </T>
            <Button
              isDark={food.darkMode}
              accessibilityLabel="Browse restaurants"
              variant="filled"
              onPress={() => router.replace("/templates/food/(tabs)")}
              style={styles.emptyButton}
            >
              Browse restaurants
            </Button>
          </View>
        ) : (
          <>
            {/* Restaurant header */}
            <Pressable
              onPress={() => router.push(`/templates/food/restaurant/${restaurant.id}`)}
              accessibilityRole="button"
              accessibilityLabel={`Back to ${restaurant.name} menu`}
            >
              <ListCard>
                <View style={styles.restaurantRow}>
                  <RestaurantThumb restaurant={restaurant} />
                  <View style={styles.flex1}>
                    <T variant="body">{restaurant.name}</T>
                    <T variant="caption" muted>
                      {restaurant.cuisine} · {restaurant.eta}
                    </T>
                  </View>
                  <HugeiconsIcon icon={ChevronRightIcon} size={20} color={colors[food.darkMode ? "dark" : "light"].muted} />
                </View>
              </ListCard>
            </Pressable>

            {/* Line items */}
            <View>
              <SectionTitle>Items</SectionTitle>
              <ListCard>
                {food.cartLines.map((line, i) => (
                  <React.Fragment key={line.item.id}>
                    {i > 0 ? <RowSeparator /> : null}
                    <View style={styles.lineRow}>
                      <View style={styles.flex1}>
                        <T variant="body" numberOfLines={1}>
                          {line.item.name}
                        </T>
                        <Meta>
                          {money(line.item.price)} each
                        </Meta>
                      </View>
                      <QuantityStepper itemId={line.item.id} small />
                      <T variant="body" style={styles.lineTotal}>
                        {money(line.item.price * line.qty)}
                      </T>
                    </View>
                  </React.Fragment>
                ))}
              </ListCard>
              <View style={styles.clearWrap}>
                <Button
                  variant="ghost"
                  accessibilityLabel="Clear cart"
                  onPress={food.clearCart}
                  isDark={food.darkMode}
                >
                  <T
                    variant="label"
                    style={{ color: negativeColor(food.darkMode) }}
                  >
                    Clear cart
                  </T>
                </Button>
              </View>
            </View>

            {/* Promo */}
            <View>
              <SectionTitle>Promo code</SectionTitle>
              {food.promoCode ? (
                <ListCard>
                  <View style={styles.promoApplied}>
                    <Badge tone="muted" isDark={food.darkMode}>{`${food.promoCode} — 10% off`}</Badge>
                    <T variant="body" muted style={styles.flex1}>
                      You save {money(food.promoDiscount)} on this order
                    </T>
                  </View>
                </ListCard>
              ) : (
                <View style={styles.promoRow}>
                  <View style={styles.flex1}>
                    <Field error={food.promoError ?? undefined} isDark={food.darkMode}>
                      <Input
                        value={promoInput}
                        onChangeText={setPromoInput}
                        placeholder="Try FORK10"
                        autoCapitalize="characters"
                        accessibilityLabel="Promo code"
                        invalid={!!food.promoError}
                        isDark={food.darkMode}
                      />
                    </Field>
                  </View>
                  <Button
                    isDark={food.darkMode}
                    accessibilityLabel="Apply promo code"
                    onPress={() => food.applyPromo(promoInput)}
                  >
                    Apply
                  </Button>
                </View>
              )}
            </View>

            {/* Totals */}
            <View>
              <SectionTitle>Summary</SectionTitle>
              <ListCard>
                <View style={styles.totalRow}>
                  <T variant="body" muted>
                    Subtotal
                  </T>
                  <T variant="body" style={styles.figure}>
                    {money(food.cartSubtotal)}
                  </T>
                </View>
                {food.promoDiscount > 0 ? (
                  <View style={styles.totalRow}>
                    <T variant="body" muted>
                      Promo (FORK10)
                    </T>
                    <T
                      variant="body"
                      style={[styles.figure, { color: positiveColor(food.darkMode) }]}
                    >
                      −{money(food.promoDiscount)}
                    </T>
                  </View>
                ) : null}
                <View style={styles.totalRow}>
                  <T variant="body" muted>
                    Delivery
                  </T>
                  <T variant="body" style={styles.figure}>
                    {deliveryFee === 0 ? "Free" : money(deliveryFee)}
                  </T>
                </View>
                <RowSeparator />
                <View style={styles.totalRow}>
                  <T variant="heading">Total</T>
                  <T variant="heading" style={styles.figure}>
                    {money(total)}
                  </T>
                </View>
              </ListCard>
            </View>
          </>
        )}
      </ScrollView>

      {food.cartLines.length > 0 ? (
        <View style={styles.footer}>
          <Button
            isDark={food.darkMode}
            accessibilityLabel="Go to checkout"
            variant="filled"
            size="lg"
            onPress={() => router.push("/templates/food/checkout")}
          >{`Checkout · ${money(total)}`}</Button>
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
    paddingTop: 112,
    paddingBottom: 28,
    gap: 24,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  flex1: { flex: 1 },
  empty: {
    alignItems: "center",
    paddingTop: 80,
    gap: 12,
    paddingHorizontal: 24,
  },
  emptyText: { textAlign: "center" },
  emptyButton: { marginTop: 12, minWidth: 200 },
  restaurantRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  lineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  lineTotal: {
    minWidth: 64,
    textAlign: "right",
    fontFamily: MONO,
    fontVariant: ["tabular-nums"],
  },
  clearWrap: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  promoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  promoApplied: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  figure: {
    fontFamily: MONO,
    fontVariant: ["tabular-nums"],
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
});
