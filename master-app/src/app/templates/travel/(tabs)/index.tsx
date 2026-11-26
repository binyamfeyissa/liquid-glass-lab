import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import {
  colors,
  Avatar, Card
} from "glacia-native";
import { Search } from "lucide-react-native";

import { useTravel } from "../state";
import { Figure, Plate, Screen, SectionTitle, StayCard, T } from "../ui";

export default function ExploreScreen() {
  const { userName, userImage, destinations, stays, price, darkMode } = useTravel();
  const trending = [...destinations].sort((a, b) => b.rating - a.rating).slice(0, 4);
  const popular = [...stays].sort((a, b) => b.reviewsCount - a.reviewsCount).slice(0, 4);

  return (
    <Screen title="Explore" subtitle="Twelve stays across six destinations">
      {/* Search header — a tappable field that opens the Search screen. */}
      <Card
        isDark={darkMode}
        padding={16}
        onPress={() => router.push("/templates/travel/search")}
        accessibilityLabel="Search destinations and stays"
      >
        <View style={styles.searchRow}>
          <Search size={18} color={darkMode ? colors.dark.foreground : colors.light.foreground} />
          <View style={styles.searchText}>
            <T variant="body">Search stays</T>
            <T variant="caption" muted>
              City, stay name or travellers
            </T>
          </View>
          <Avatar name={userName} source={userImage} size="sm" isDark={darkMode} />
        </View>
      </Card>

      {/* Destination cards */}
      <View>
        <SectionTitle>Destinations</SectionTitle>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hRow}
        >
          {destinations.map((d) => (
            <Card
              key={d.id}
              isDark={darkMode}
              padding={12}
              style={styles.destCard}
              onPress={() => router.push({ pathname: "/templates/travel/search", params: { q: d.city } })}
              accessibilityLabel={`${d.city}, ${d.country}`}
            >
              <Plate colors={d.colors} label={d.city} height={110} radius={12} fontSize={28} image={d.image} />
              <View style={styles.destMeta}>
                <T variant="caption" muted numberOfLines={1}>
                  {d.tagline}
                </T>
                <View style={styles.destPriceRow}>
                  <T variant="caption" muted>
                    Stays from{" "}
                  </T>
                  <Figure variant="caption">{price(d.priceFrom)}</Figure>
                  <T variant="caption" muted>
                    {" "}
                    / night
                  </T>
                  <View style={styles.flex} />
                  <Figure variant="caption" muted>
                    {d.rating.toFixed(2)}
                  </Figure>
                </View>
              </View>
            </Card>
          ))}
        </ScrollView>
      </View>

      {/* Trending row */}
      <View>
        <SectionTitle>Trending this week</SectionTitle>
        <View style={styles.trendingWrap}>
          {trending.map((d, i) => (
            <Pressable
              key={d.id}
              onPress={() => router.push({ pathname: "/templates/travel/search", params: { q: d.city } })}
              accessibilityRole="button"
              accessibilityLabel={`Trending: ${d.city}`}
              style={({ pressed }) => [styles.trendingChip, pressed && styles.pressed]}
            >
              <Figure variant="body" muted style={styles.trendingRank}>
                {i + 1}
              </Figure>
              <View>
                <T variant="body">
                  {d.city}, {d.country}
                </T>
                <Figure variant="caption" muted>
                  {d.rating.toFixed(2)} · from {price(d.priceFrom)}
                </Figure>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Popular stays */}
      <View>
        <SectionTitle>Popular stays</SectionTitle>
        <View style={styles.stayList}>
          {popular.map((stay) => (
            <StayCard key={stay.id} stay={stay} />
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  searchText: { flex: 1, gap: 2 },
  hRow: { gap: 16, paddingRight: 8 },
  destCard: { width: 218 },
  destMeta: { paddingHorizontal: 4, paddingTop: 12, paddingBottom: 4, gap: 4 },
  destPriceRow: { flexDirection: "row", alignItems: "baseline" },
  trendingWrap: { gap: 4 },
  trendingChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  trendingRank: {
    fontSize: 20,
    width: 28,
    textAlign: "center",
  },
  pressed: { backgroundColor: "rgba(127,127,127,0.14)" },
  stayList: { gap: 16 },
});
