import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Card, Chip } from "glacia-native";

import { AISLES, PRODUCTS, USER_IMAGE, productsInAisle } from "../data";
import { useBasket } from "../state";
import {
  AddControl,
  CartBar,
  CartButton,
  Figure,
  ListCard,
  ProductRow,
  ProductVisual,
  RowSeparator,
  SectionTitle,
  T,
  accentColor,
  chromeColors,
  money,
} from "../ui";

export default function HomeScreen() {
  const basket = useBasket();
  const [aisleFilter, setAisleFilter] = useState<string>("all");

  const deal = PRODUCTS.find((p) => p.compareAt) ?? PRODUCTS[0];
  const visibleAisles =
    aisleFilter === "all"
      ? AISLES
      : AISLES.filter((a) => a.id === aisleFilter);

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header — the store, then the person */}
        <View style={styles.header}>
          <Avatar name={basket.userName} size="lg" isDark={basket.darkMode} source={USER_IMAGE} />
          <View style={styles.flex}>
            <T variant="caption" muted>
              Basket
            </T>
            <T variant="heading">{basket.userName}</T>
          </View>
          <CartButton />
        </View>

        {/* Delivery slot header — tap to change the slot */}
        <Pressable
          onPress={() => router.push("/templates/grocery/slot")}
          accessibilityRole="button"
          accessibilityLabel={`Delivery slot ${basket.slotLabel}. Change slot`}
        >
          <Card isDark={basket.darkMode} padding={16}>
            <View style={styles.slotRow}>
              <View style={styles.flex}>
                <T variant="label" muted>
                  Deliver to {basket.selectedAddress.label} ·{" "}
                  {basket.selectedAddress.line}
                </T>
                <Figure variant="heading" style={styles.slotValue}>
                  {basket.slot.dateLabel} · {basket.slot.windowLabel}
                </Figure>
              </View>
              <T variant="body" style={{ color: accentColor(basket.backdrop) }}>
                Change
              </T>
            </View>
          </Card>
        </Pressable>

        {/* Search field — opens the dedicated search screen */}
        <Pressable
          onPress={() => router.push("/templates/grocery/search")}
          accessibilityRole="button"
          accessibilityLabel="Search groceries"
          style={{
            ...styles.searchField,
            backgroundColor: chromeColors(basket.backdrop).fill,
          }}
        >
          <T variant="body" muted>
            Search salmon, sourdough, eggs
          </T>
        </Pressable>

        {/* Aisle chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          <Chip
            label="All aisles"
            isDark={basket.darkMode}
            selected={aisleFilter === "all"}
            onPress={() => setAisleFilter("all")}
          />
          {AISLES.map((aisle) => (
            <Chip
              key={aisle.id}
              label={aisle.name}
              isDark={basket.darkMode}
              selected={aisleFilter === aisle.id}
              onPress={() =>
                setAisleFilter(aisleFilter === aisle.id ? "all" : aisle.id)
              }
            />
          ))}
        </ScrollView>

        {/* Deal of the day */}
        {aisleFilter === "all" || aisleFilter === deal.aisleId ? (
          <View>
            <SectionTitle>Deal of the day</SectionTitle>
            <Card isDark={basket.darkMode} padding={16}>
              <Pressable
                onPress={() => router.push(`/templates/grocery/product/${deal.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`View ${deal.name}`}
              >
                <ProductVisual product={deal} height={130} />
              </Pressable>
              <View style={styles.dealBody}>
                <View style={styles.flex}>
                  <T variant="heading">{deal.name}</T>
                  <T variant="caption" muted style={styles.description}>
                    {deal.detail} · {deal.unit}
                  </T>
                  <View style={styles.priceLine}>
                    <Figure variant="body" muted style={styles.strike}>
                      {money(deal.compareAt ?? deal.price)}
                    </Figure>
                    <Figure variant="heading">{money(deal.price)}</Figure>
                    <Figure variant="caption" muted>
                      Save {money((deal.compareAt ?? deal.price) - deal.price)}
                    </Figure>
                  </View>
                </View>
                <AddControl product={deal} />
              </View>
            </Card>
          </View>
        ) : null}

        {/* Aisle sections — ruled headers over ruled rows */}
        {visibleAisles.map((aisle) => {
          const items = productsInAisle(aisle.id).slice(0, 3);
          if (items.length === 0) return null;
          return (
            <View key={aisle.id}>
              <View style={styles.sectionHead}>
                <View style={styles.flex}>
                  <SectionTitle>
                    {aisle.name} · {aisle.tagline}
                  </SectionTitle>
                </View>
                <Pressable
                  onPress={() => router.push(`/templates/grocery/aisle/${aisle.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`See all of ${aisle.name}`}
                >
                  <T
                    variant="caption"
                    style={{
                      color: accentColor(basket.backdrop),
                      marginRight: 8,
                    }}
                  >
                    See all
                  </T>
                </Pressable>
              </View>
              <ListCard>
                {items.map((product, i) => (
                  <View key={product.id}>
                    {i > 0 ? <RowSeparator /> : null}
                    <ProductRow product={product} />
                  </View>
                ))}
              </ListCard>
            </View>
          );
        })}

        <T variant="caption" muted style={styles.footNote}>
          Prices include VAT · Free delivery over $40
        </T>
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
  slotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  slotValue: {
    marginTop: 4,
  },
  searchField: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  chips: {
    gap: 8,
    paddingRight: 8,
  },
  dealBody: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    marginTop: 12,
  },
  description: {
    marginTop: 2,
  },
  priceLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  strike: {
    textDecorationLine: "line-through",
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  footNote: {
    textAlign: "center",
  },
});
