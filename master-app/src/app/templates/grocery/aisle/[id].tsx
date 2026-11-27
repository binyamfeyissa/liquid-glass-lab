import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { colors, IconButton } from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import ChevronLeftIcon from "@hugeicons/core-free-icons/ChevronLeftIcon";
import { aisleById, productsInAisle } from "../data";
import { useBasket } from "../state";
import {
  CartBar,
  ListCard,
  ProductRow,
  RowSeparator,
  T,
} from "../ui";

export default function AisleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const basket = useBasket();
  const aisle = aisleById(id ?? "");
  const items = productsInAisle(aisle.id);

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
            icon={<HugeiconsIcon icon={ChevronLeftIcon} size={20} color={colors[basket.darkMode ? "dark" : "light"].foreground} />}
          />
          <View style={styles.flex}>
            <T variant="title">{aisle.name}</T>
            <T variant="body" muted style={styles.subtitle}>
              {aisle.tagline} · {items.length} products
            </T>
          </View>
        </View>

        <ListCard>
          {items.map((product, i) => (
            <View key={product.id}>
              {i > 0 ? <RowSeparator /> : null}
              <ProductRow product={product} />
            </View>
          ))}
        </ListCard>
      </ScrollView>
      <CartBar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 112,
    paddingBottom: 96,
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
});
