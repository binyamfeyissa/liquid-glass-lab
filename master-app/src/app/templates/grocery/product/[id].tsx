import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { colors, Button, IconButton, Stepper, Toast } from "glacia-native";
import { ChevronLeft } from "lucide-react-native";

import { aisleById, productById, productsInAisle } from "../data";
import { useBasket } from "../state";
import {
  CartBar,
  Figure,
  HeartButton,
  ListCard,
  ProductRow,
  ProductVisual,
  RowSeparator,
  SectionTitle,
  T,
  money,
} from "../ui";

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const basket = useBasket();
  const product = productById(id ?? "");
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState(false);

  const inCart = basket.qtyOf(product.id);
  const related = productsInAisle(product.aisleId).filter(
    (p) => p.id !== product.id,
  );

  const nutritionRows: [string, string][] = [
    ["Energy", `${product.nutrition.calories} kcal`],
    ["Protein", `${product.nutrition.protein.toFixed(1)} g`],
    ["Carbohydrates", `${product.nutrition.carbs.toFixed(1)} g`],
    ["Fat", `${product.nutrition.fat.toFixed(1)} g`],
  ];

  return (
    <View style={styles.root}>
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
            icon={<ChevronLeft size={20} color={colors[basket.darkMode ? "dark" : "light"].foreground} />}
          />
          <T variant="caption" muted style={styles.flex}>
            {aisleById(product.aisleId).name}
          </T>
          <HeartButton productId={product.id} />
        </View>

        <ProductVisual product={product} height={210} radius={16} fontSize={64} />

        <View>
          <T variant="title">{product.name}</T>
          <T variant="body" muted style={styles.subtitle}>
            {product.detail} · sold {product.unit}
          </T>
          <View style={styles.priceLine}>
            {product.compareAt ? (
              <Figure variant="body" muted style={styles.strike}>
                {money(product.compareAt)}
              </Figure>
            ) : null}
            <Figure variant="title">{money(product.price)}</Figure>
            <T variant="body" muted>
              / {product.unit}
            </T>
          </View>
          {inCart > 0 ? (
            <T variant="caption" muted style={styles.inCart}>
              {inCart} already in your cart
            </T>
          ) : null}
        </View>

        {/* Quantity + add. Quantities are whole purchasable units. */}
        <View style={styles.buyRow}>
          <Stepper
            accessibilityLabel={`Quantity of ${product.name}`}
            value={qty}
            min={1}
            max={99}
            height={44}
            isDark={basket.darkMode}
            onValueChange={setQty}
          />
          <Button
            isDark={basket.darkMode}
            accessibilityLabel={`Add ${qty} of ${product.name} to cart`}
            variant="filled"
            size="lg"
            style={styles.flex}
            onPress={() => {
              basket.addToCart(product.id, qty);
              setToast(true);
            }}
          >{`Add to cart · ${money(product.price * qty)}`}</Button>
        </View>

        {/* Nutrition facts */}
        <View>
          <SectionTitle>Nutrition · per 100 g</SectionTitle>
          <ListCard>
            {nutritionRows.map(([label, value], i) => (
              <View key={label}>
                {i > 0 ? <RowSeparator /> : null}
                <View style={styles.nutritionRow}>
                  <T variant="body">{label}</T>
                  <Figure variant="body" muted>
                    {value}
                  </Figure>
                </View>
              </View>
            ))}
          </ListCard>
        </View>

        {/* Related items from the same aisle */}
        {related.length > 0 ? (
          <View>
            <SectionTitle>More from {aisleById(product.aisleId).name}</SectionTitle>
            <ListCard>
              {related.map((p, i) => (
                <View key={p.id}>
                  {i > 0 ? <RowSeparator /> : null}
                  <ProductRow product={p} />
                </View>
              ))}
            </ListCard>
          </View>
        ) : null}
      </ScrollView>
      <CartBar />
      <Toast
        visible={toast}
        message={`${product.name} added to cart`}
        isDark={basket.darkMode}
        onDismiss={() => setToast(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 96,
    gap: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  subtitle: {
    marginTop: 8,
  },
  priceLine: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginTop: 8,
  },
  strike: {
    textDecorationLine: "line-through",
  },
  inCart: {
    marginTop: 8,
  },
  buyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  nutritionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});
