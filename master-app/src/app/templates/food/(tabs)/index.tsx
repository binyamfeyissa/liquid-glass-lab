import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Chip } from "glacia-native";

import { useFood } from "../state";
import { CATEGORIES, FEATURED_ID, RESTAURANTS, restaurantById } from "../data";
import { RestaurantCard } from "../cards";
import { CartButton, SectionTitle, T } from "../ui";

export default function HomeScreen() {
  const food = useFood();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");

  const featured = restaurantById(FEATURED_ID);
  const visible = useMemo(() => {
    const list =
      category === "All"
        ? RESTAURANTS
        : RESTAURANTS.filter((r) => r.category === category);
    // The featured restaurant gets its own spotlight card; don't repeat it
    // in the "All" list below.
    return category === "All" ? list.filter((r) => r.id !== FEATURED_ID) : list;
  }, [category]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Location header */}
      <View style={styles.header}>
        <View style={styles.flex1}>
          <T variant="caption" muted>
            Deliver to
          </T>
          <Pressable
            onPress={() => router.push("/templates/food/(tabs)/profile")}
            accessibilityRole="button"
            accessibilityLabel="Change delivery address"
          >
            <T variant="heading" numberOfLines={1}>
              {food.addresses[0].label} — {food.addresses[0].line} ⌄
            </T>
          </Pressable>
        </View>
        <CartButton />
      </View>

      {/* Search field — opens the dedicated search screen */}
      <Pressable
        onPress={() => router.push("/templates/food/(tabs)/search")}
        accessibilityRole="button"
        accessibilityLabel="Search restaurants and dishes"
        style={({ pressed }) => [
          styles.searchField,
          {
            backgroundColor: food.darkMode
              ? "rgba(255,255,255,0.08)"
              : "rgba(31,27,22,0.05)",
            borderColor: food.darkMode
              ? "rgba(255,255,255,0.10)"
              : "rgba(31,27,22,0.08)",
          },
          pressed && { opacity: 0.8 },
        ]}
      >
        <T variant="body" muted>
          Search restaurants and dishes
        </T>
      </Pressable>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {CATEGORIES.map((c) => (
          <Chip
            key={c}
            label={c}
            isDark={food.darkMode}
            selected={category === c}
            onSelectedChange={(selected) => {
              if (selected) setCategory(c);
            }}
          />
        ))}
      </ScrollView>

      {/* Featured restaurant */}
      {category === "All" && featured ? (
        <View>
          <SectionTitle>Featured</SectionTitle>
          <RestaurantCard restaurant={featured} featured />
        </View>
      ) : null}

      {/* Restaurant list */}
      <View>
        <SectionTitle>
          {category === "All" ? "Near you" : `${category} near you`}
        </SectionTitle>
        {visible.length === 0 ? (
          <T variant="body" muted>
            Nothing here yet — try another category
          </T>
        ) : (
          visible.map((r) => <RestaurantCard key={r.id} restaurant={r} />)
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 28,
  },
  flex1: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchField: {
    marginTop: 20,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chipRow: {
    gap: 8,
    paddingVertical: 16,
    paddingRight: 4,
  },
});
