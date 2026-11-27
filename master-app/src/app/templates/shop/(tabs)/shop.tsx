import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, Card } from "glacia-native";

import { useShop } from "../state";
import { CATEGORIES, type Category, type Product } from "../data";
import {
  CartButton,
  HeartButton,
  ListCard,
  NavRow,
  Price,
  ProductVisual,
  RowSeparator,
  Screen,
  SectionTitle,
  T,
} from "../ui";

type Filter = Category | "All";

function ProductRow({ product }: { product: Product }) {
  const shop = useShop();
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => router.push(`/templates/shop/product/${product.id}`)}
        accessibilityRole="button"
        accessibilityLabel={`${product.name}, view details`}
        style={styles.rowMain}
      >
        <View style={styles.thumb}>
          <ProductVisual product={product} height={64} radius={12} />
        </View>
        <View style={styles.flex}>
          <T variant="body" numberOfLines={1}>
            {product.name}
          </T>
          <T variant="caption" muted>
            {product.category} · {product.rating.toFixed(1)} ({product.reviews})
          </T>
          <Price product={product} />
        </View>
      </Pressable>
      <HeartButton productId={product.id} size="sm" />
      <Button
        isDark={shop.darkMode}
        accessibilityLabel={`Add ${product.name} to cart`}
        size="sm"
        variant="filled"
        onPress={() => shop.addToCart(product.id, product.finishes[0].name, 1)}
      >
        Add
      </Button>
    </View>
  );
}

export default function ShopScreen() {
  const shop = useShop();
  const [filter, setFilter] = useState<Filter>("All");

  const counts = useMemo(() => {
    const map = new Map<Filter, number>();
    map.set("All", shop.products.length);
    for (const category of CATEGORIES) {
      map.set(category, shop.products.filter((p) => p.category === category).length);
    }
    return map;
  }, [shop.products]);

  const visible =
    filter === "All"
      ? shop.products
      : shop.products.filter((p) => p.category === filter);

  return (
    <Screen belowTabBar title="Shop" subtitle="Glassware and homeware, blown and fused in small batches">
      <View style={styles.cartRow}>
        <T variant="body" muted style={styles.flex}>
          {shop.cartCount > 0
            ? `${shop.cartCount} item${shop.cartCount === 1 ? "" : "s"} in your cart`
            : "Your cart is empty"}
        </T>
        <CartButton />
      </View>

      {/* Category list — tapping one filters the products below */}
      <View>
        <SectionTitle>Categories</SectionTitle>
        <ListCard>
          {(["All", ...CATEGORIES] as Filter[]).map((category, i) => (
            <React.Fragment key={category}>
              {i > 0 ? <RowSeparator /> : null}
              <NavRow
                title={category === "All" ? "All products" : category}
                description={
                  category === "All"
                    ? "The whole Lumen range"
                    : `${counts.get(category)} pieces`
                }
                detail={filter === category ? "Showing" : undefined}
                onPress={() => setFilter(category)}
              />
            </React.Fragment>
          ))}
        </ListCard>
      </View>

      {/* Filtered products */}
      <View>
        <SectionTitle>
          {filter === "All" ? "All products" : filter} · {visible.length}
        </SectionTitle>
        <Card isDark={shop.darkMode} padding={12}>
          <View style={styles.list}>
            {visible.map((product) => (
              <ProductRow key={product.id} product={product} />
            ))}
          </View>
        </Card>
        {visible.length === 0 ? (
          <T variant="body" muted>
            Nothing here yet — try another category
          </T>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cartRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  flex: { flex: 1 },
  list: { gap: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  thumb: { width: 84 },
});
