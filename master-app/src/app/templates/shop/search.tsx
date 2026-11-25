import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, Chip, Input } from "glacia-native";

import { useShop } from "./state";
import {
  HeartButton,
  ListCard,
  Price,
  ProductVisual,
  RowSeparator,
  SectionTitle,
  T,
} from "./ui";

const RECENT = ["carafe", "lamp", "tumblers", "vase"];

export default function SearchScreen() {
  const shop = useShop();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return shop.products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.blurb.toLowerCase().includes(q),
    );
  }, [query, shop.products]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
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
        <T variant="heading">Search</T>
        <View style={styles.spacer} />
      </View>

      <Input
        value={query}
        onChangeText={setQuery}
        placeholder="Search glassware, lighting, decor…"
        accessibilityLabel="Search products"
        returnKeyType="search"
        isDark={shop.darkMode}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {query.trim() === "" ? (
        <View>
          <SectionTitle>Recent searches</SectionTitle>
          <View style={styles.chipRow}>
            {RECENT.map((term) => (
              <Chip
                key={term}
                label={term}
                onPress={() => setQuery(term)}
                isDark={shop.darkMode}
              />
            ))}
          </View>
          <SectionTitle>Popular right now</SectionTitle>
          <View style={styles.chipRow}>
            {shop.products
              .filter((p) => p.badge === "Bestseller")
              .map((p) => (
                <Chip
                  key={p.id}
                  label={p.name}
                  onPress={() => router.push(`/templates/shop/product/${p.id}`)}
                  isDark={shop.darkMode}
                />
              ))}
          </View>
        </View>
      ) : results.length === 0 ? (
        <ListCard>
          <View style={styles.empty}>
            <T variant="heading">No matches for “{query.trim()}”</T>
            <T variant="body" muted>
              Try a category — Drinkware, Tableware, Lighting, Decor — or a piece
              like “carafe” or “vase”.
            </T>
          </View>
        </ListCard>
      ) : (
        <View>
          <SectionTitle>
            {results.length} result{results.length === 1 ? "" : "s"}
          </SectionTitle>
          <ListCard>
            {results.map((product, i) => (
              <React.Fragment key={product.id}>
                {i > 0 ? <RowSeparator /> : null}
                <View style={styles.row}>
                  <Pressable
                    onPress={() => router.push(`/templates/shop/product/${product.id}`)}
                    accessibilityRole="button"
                    accessibilityLabel={`${product.name}, view details`}
                    style={styles.rowMain}
                  >
                    <View style={styles.thumb}>
                      <ProductVisual product={product} height={56} radius={10} />
                    </View>
                    <View style={styles.flex}>
                      <T variant="body" numberOfLines={1}>
                        {product.name}
                      </T>
                      <T variant="caption" muted>
                        {product.category} · {product.rating.toFixed(1)}
                      </T>
                      <Price product={product} />
                    </View>
                  </Pressable>
                  <HeartButton productId={product.id} size="sm" />
                </View>
              </React.Fragment>
            ))}
          </ListCard>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 28,
    gap: 16,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  spacer: { width: 64 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 },
  empty: { padding: 16, gap: 8 },
  flex: { flex: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  thumb: { width: 74 },
});
