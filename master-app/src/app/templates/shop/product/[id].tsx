import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Accordion, Button, Chip, Stepper, Toast } from "glacia-native";

import { useShop } from "../state";
import { PRODUCTS } from "../data";
import {
  CartButton,
  HeartButton,
  Price,
  ProductCard,
  ProductVisual,
  SectionTitle,
  T,
  money,
} from "../ui";

export default function ProductDetailScreen() {
  const shop = useShop();
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = PRODUCTS.find((p) => p.id === id);

  const [finish, setFinish] = useState<string | undefined>(undefined);
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState(false);

  const related = useMemo(
    () =>
      product
        ? PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id)
        : [],
    [product],
  );

  if (!product) {
    return (
      <View style={styles.missing}>
        <T variant="heading">Product not found</T>
        <Button
          isDark={shop.darkMode}
          accessibilityLabel="Back to shop"
          variant="glass"
          onPress={() => router.push("/templates/shop/(tabs)/shop")}
          style={styles.missingButton}
        >
          Back to shop
        </Button>
      </View>
    );
  }

  const activeFinish = finish ?? product.finishes[0].name;

  const addToCart = () => {
    shop.addToCart(product.id, activeFinish, qty);
    setToast(true);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <Button
          isDark={shop.darkMode}
          accessibilityLabel="Back"
          variant="ghost"
          size="sm"
          onPress={() => router.back()}
        >
          Back
        </Button>
        <View style={styles.topActions}>
          <HeartButton productId={product.id} />
          <CartButton />
        </View>
      </View>

      {/* Big composed visual — its colour follows the chosen finish */}
      <ProductVisual product={product} finish={activeFinish} height={260} radius={20} />

      <View style={styles.titleBlock}>
        <T variant="title">{product.name}</T>
        <T variant="body" muted style={styles.meta}>
          {product.category} · {product.rating.toFixed(1)} · {product.reviews} reviews
        </T>
        <Price product={product} variant="heading" />
        <T variant="body" style={styles.description}>
          {product.description}
        </T>
      </View>

      {/* Finish selector — chips re-tint the visual above */}
      <View>
        <SectionTitle>Finish · {activeFinish}</SectionTitle>
        <View style={styles.chipRow}>
          {product.finishes.map((f) => (
            <Chip
              key={f.name}
              label={f.name}
              selected={activeFinish === f.name}
              onSelectedChange={(selected) => {
                if (selected) setFinish(f.name);
              }}
              isDark={shop.darkMode}
            />
          ))}
        </View>
      </View>

      {/* Quantity + add to cart */}
      <View style={styles.buyRow}>
        <View>
          <SectionTitle>Quantity</SectionTitle>
          <Stepper
            value={qty}
            onValueChange={setQty}
            min={1}
            max={12}
            accessibilityLabel="Quantity"
            isDark={shop.darkMode}
          />
        </View>
        <Button
          isDark={shop.darkMode}
          accessibilityLabel={`Add ${qty} ${product.name} to cart`}
          variant="filled"
          size="lg"
          onPress={addToCart}
          style={styles.addButton}
        >
          Add to cart · {money(product.price * qty)}
        </Button>
      </View>

      {/* Details accordion */}
      <View>
        <SectionTitle>Details</SectionTitle>
        <Accordion
          isDark={shop.darkMode}
          multiple
          defaultOpenSections={[product.details[0].label]}
          sections={product.details.map((d) => ({
            value: d.label,
            title: d.label,
            content: (
              <T variant="body" muted>
                {d.body}
              </T>
            ),
          }))}
        />
      </View>

      {/* Related products */}
      {related.length > 0 ? (
        <View>
          <SectionTitle>More {product.category.toLowerCase()}</SectionTitle>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.relatedRow}
          >
            {related.map((p) => (
              <ProductCard key={p.id} product={p} width={168} />
            ))}
          </ScrollView>
        </View>
      ) : null}

      <Toast
        visible={toast}
        message={`Added ${qty} × ${product.name} (${activeFinish}) to your cart`}
        onDismiss={() => setToast(false)}
        isDark={shop.darkMode}
        edge="bottom"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 28,
    gap: 24,
  },
  missing: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  missingButton: { marginTop: 8 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topActions: { flexDirection: "row", alignItems: "center", gap: 4 },
  titleBlock: { gap: 8 },
  meta: { marginTop: 4 },
  description: { marginTop: 8, lineHeight: 22 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  buyRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 16,
  },
  addButton: { flex: 1 },
  relatedRow: { gap: 12, paddingRight: 4 },
});
