import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { colors, Button, IconButton, Progress } from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import ChevronLeftIcon from "@hugeicons/core-free-icons/ChevronLeftIcon";
import { FREE_DELIVERY_THRESHOLD, productById } from "./data";
import { useBasket } from "./state";
import {
  Figure,
  ListCard,
  ProductVisual,
  RowSeparator,
  SectionTitle,
  T,
  accentColor,
  money,
} from "./ui";
import { Stepper } from "glacia-native";

export default function CartScreen() {
  const basket = useBasket();
  const remaining = Math.max(
    0,
    FREE_DELIVERY_THRESHOLD - basket.cartSubtotal,
  );
  const progress = Math.min(
    100,
    (basket.cartSubtotal / FREE_DELIVERY_THRESHOLD) * 100,
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <IconButton
          accessibilityLabel="Back"
          onPress={() => router.back()}
          isDark={basket.darkMode}
          icon={<HugeiconsIcon icon={ChevronLeftIcon} size={20} color={colors[basket.darkMode ? "dark" : "light"].foreground} />}
        />
        <View style={styles.flex}>
          <T variant="title">Your cart</T>
          <T variant="body" muted style={styles.subtitle}>
            {basket.cartCount} {basket.cartCount === 1 ? "item" : "items"}
          </T>
        </View>
        {basket.cart.length > 0 ? (
          <Button
            isDark={basket.darkMode}
            accessibilityLabel="Clear cart"
            variant="ghost"
            size="sm"
            onPress={basket.clearCart}
          >
            Clear
          </Button>
        ) : null}
      </View>

      {basket.cart.length === 0 ? (
        <View style={styles.empty}>
          <T variant="heading">Your basket is empty</T>
          <T variant="body" muted style={styles.emptyText}>
            Browse the aisles or add a whole shopping list in one tap.
          </T>
          <Button
            isDark={basket.darkMode}
            accessibilityLabel="Browse groceries"
            variant="filled"
            size="lg"
            onPress={() => router.replace("/templates/grocery/(tabs)")}
          >
            Browse groceries
          </Button>
          <Button
            isDark={basket.darkMode}
            accessibilityLabel="Open shopping lists"
            variant="ghost"
            onPress={() => router.replace("/templates/grocery/(tabs)/lists")}
          >
            Open my lists
          </Button>
        </View>
      ) : (
        <>
          <ListCard>
            {basket.cart.map((line, i) => {
              const product = productById(line.productId);
              return (
                <View key={line.productId}>
                  {i > 0 ? <RowSeparator /> : null}
                  <View style={styles.lineRow}>
                    <View style={styles.thumb}>
                      <ProductVisual
                        product={product}
                        height={56}
                        radius={12}
                        fontSize={22}
                      />
                    </View>
                    <View style={styles.flex}>
                      <T variant="body" numberOfLines={1}>
                        {product.name}
                      </T>
                      <Figure variant="caption" muted style={styles.description}>
                        {money(product.price)} / {product.unit}
                      </Figure>
                      <Figure variant="body" style={styles.lineTotal}>
                        {money(product.price * line.qty)}
                      </Figure>
                    </View>
                    <Stepper
                      accessibilityLabel={`Quantity of ${product.name}`}
                      value={line.qty}
                      min={0}
                      max={99}
                      height={34}
                      isDark={basket.darkMode}
                      onValueChange={(value) =>
                        basket.setQty(line.productId, value)
                      }
                    />
                  </View>
                </View>
              );
            })}
          </ListCard>

          {/* Free-delivery progress */}
          <View>
            <SectionTitle>Delivery</SectionTitle>
            <ListCard style={styles.pad}>
              {remaining > 0 ? (
                <T variant="body">
                  Add {money(remaining)} more for free delivery
                </T>
              ) : (
                <T variant="body">Free delivery</T>
              )}
              <Progress
                value={progress}
                tint={accentColor(basket.backdrop)}
                isDark={basket.darkMode}
                accessibilityLabel="Progress towards free delivery"
                style={styles.progress}
              />
              <View style={styles.slotRow}>
                <View style={styles.flex}>
                  <T variant="caption" muted>
                    Arriving
                  </T>
                  <T variant="body">
                    {basket.slot.dateLabel} · {basket.slot.windowLabel}
                  </T>
                </View>
                <Button
                  isDark={basket.darkMode}
                  accessibilityLabel="Change delivery slot"
                  variant="ghost"
                  size="sm"
                  onPress={() => router.push("/templates/grocery/slot")}
                >
                  Change
                </Button>
              </View>
            </ListCard>
          </View>

          {/* Totals */}
          <ListCard style={styles.pad}>
            <View style={styles.totalRow}>
              <T variant="body" muted>
                Subtotal
              </T>
              <Figure variant="body">{money(basket.cartSubtotal)}</Figure>
            </View>
            <View style={styles.totalRow}>
              <T variant="body" muted>
                Delivery
              </T>
              <Figure variant="body">
                {basket.deliveryFee === 0
                  ? "Free"
                  : money(basket.deliveryFee)}
              </Figure>
            </View>
            <RowSeparator />
            <View style={styles.totalRow}>
              <T variant="heading">Total</T>
              <Figure variant="heading">{money(basket.cartTotal)}</Figure>
            </View>
          </ListCard>

          <Button
            isDark={basket.darkMode}
            accessibilityLabel="Go to checkout"
            variant="filled"
            size="lg"
            onPress={() => router.push("/templates/grocery/checkout")}
          >{`Checkout · ${money(basket.cartTotal)}`}</Button>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 112,
    paddingBottom: 40,
    gap: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  subtitle: {
    marginTop: 4,
  },
  empty: {
    alignItems: "center",
    gap: 12,
    paddingTop: 60,
  },
  emptyText: {
    textAlign: "center",
  },
  lineRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
  },
  thumb: {
    width: 56,
    flexShrink: 0,
  },
  description: {
    marginTop: 2,
  },
  lineTotal: {
    marginTop: 4,
  },
  pad: {
    padding: 16,
  },
  progress: {
    marginTop: 12,
  },
  slotRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
});
