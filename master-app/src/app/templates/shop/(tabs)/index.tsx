import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Button, Card, Chip } from "glacia-native";

import { useShop } from "../state";
import { CATEGORIES, type Category } from "../data";
import {
  CartButton,
  Price,
  ProductCard,
  ProductVisual,
  SectionTitle,
  T,
} from "../ui";

type Filter = Category | "All";

export default function HomeScreen() {
  const shop = useShop();
  const [filter, setFilter] = useState<Filter>("All");

  const hero = shop.products.find((p) => p.id === "orb-table-lamp") ?? shop.products[0];
  const featured = shop.products.filter((p) => p.featured);
  const visible = useMemo(
    () => (filter === "All" ? shop.products : shop.products.filter((p) => p.category === filter)),
    [filter, shop.products],
  );

  // Pair the grid products into two-column rows.
  const rows: (typeof visible)[] = [];
  for (let i = 0; i < visible.length; i += 2) rows.push(visible.slice(i, i + 2));

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Brand header */}
      <View style={styles.header}>
        <Avatar name={shop.userName} source={shop.userImage} size="lg" isDark={shop.darkMode} />
        <View style={styles.headerText}>
          <T variant="heading">Lumen</T>
          <T variant="caption" muted>
            Glassware and homeware
          </T>
        </View>
        <CartButton />
      </View>

      {/* Search field — opens the dedicated Search screen */}
      <Pressable
        onPress={() => router.push("/templates/shop/search")}
        accessibilityRole="button"
        accessibilityLabel="Search products"
      >
        <Card isDark={shop.darkMode} padding={14} style={styles.searchField}>
          <T variant="body" muted>
            Search glassware, lighting, decor
          </T>
        </Card>
      </Pressable>

      {/* Featured hero */}
      <View>
        <SectionTitle>Featured</SectionTitle>
        <Card
          isDark={shop.darkMode}
          padding={12}
          onPress={() => router.push(`/templates/shop/product/${hero.id}`)}
          accessibilityLabel={`${hero.name}, view details`}
        >
          <ProductVisual product={hero} height={224} radius={16} />
          <View style={styles.heroBody}>
            <View style={styles.flex}>
              <T variant="title">{hero.name}</T>
              <T variant="body" muted numberOfLines={2} style={styles.heroBlurb}>
                {hero.blurb}
              </T>
              <Price product={hero} variant="heading" />
            </View>
          </View>
          <Button
            isDark={shop.darkMode}
            accessibilityLabel={`Shop the ${hero.name}`}
            variant="filled"
            onPress={() => router.push(`/templates/shop/product/${hero.id}`)}
            style={styles.heroButton}
          >
            Shop now
          </Button>
        </Card>
      </View>

      {/* Also featured — horizontal row */}
      <View>
        <SectionTitle>Also featured</SectionTitle>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredRow}
        >
          {featured
            .filter((p) => p.id !== hero.id)
            .map((product) => (
              <ProductCard key={product.id} product={product} width={168} />
            ))}
        </ScrollView>
      </View>

      {/* Category chips + the catalogue grid */}
      <View>
        <SectionTitle>Browse</SectionTitle>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {(["All", ...CATEGORIES] as Filter[]).map((category) => (
            <Chip
              key={category}
              label={category}
              selected={filter === category}
              onSelectedChange={(selected) => {
                if (selected) setFilter(category);
              }}
              isDark={shop.darkMode}
            />
          ))}
        </ScrollView>
        <View style={styles.grid}>
          {rows.map((pair, i) => (
            <View key={i} style={styles.gridRow}>
              {pair.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
              {pair.length === 1 ? <View style={styles.flex} /> : null}
            </View>
          ))}
        </View>
        {visible.length === 0 ? (
          <T variant="body" muted>
            Nothing in this category yet.
          </T>
        ) : null}
      </View>

      <T variant="caption" muted style={styles.foot}>
        Free shipping over $120 · 60-day returns
      </T>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 112,
    paddingBottom: 128,
    gap: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerText: { flex: 1 },
  flex: { flex: 1 },
  searchField: { borderRadius: 12 },
  heroBody: { marginTop: 12 },
  heroBlurb: { marginTop: 4, marginBottom: 8 },
  heroButton: { marginTop: 12 },
  featuredRow: { gap: 12, paddingRight: 4 },
  chipRow: { gap: 8, paddingBottom: 12, paddingRight: 4 },
  grid: { gap: 12 },
  gridRow: { flexDirection: "row", gap: 12 },
  foot: { textAlign: "center" },
});
