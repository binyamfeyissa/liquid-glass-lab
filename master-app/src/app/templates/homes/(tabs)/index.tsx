import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Badge, Card, Chip, Input } from "glacia-native";

import { PROPERTIES, money, type Property } from "../data";
import { useHomes } from "../state";
import { Figure, PropertyCard, PropertyVisual, SaveButton, Screen, SectionTitle, Serif, T } from "../ui";

const FILTERS = ["All", "Houses", "Flats", "New builds"] as const;
type Filter = (typeof FILTERS)[number];

function matchesFilter(p: Property, filter: Filter): boolean {
  switch (filter) {
    case "Houses":
      return p.type === "House" || p.type === "Bungalow" || p.type === "Terrace";
    case "Flats":
      return p.type === "Flat";
    case "New builds":
      return p.newBuild;
    default:
      return true;
  }
}

export default function HomeScreen() {
  const { darkMode } = useHomes();
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");

  const featured = PROPERTIES.find((p) => p.featured) ?? PROPERTIES[0];
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROPERTIES.filter((p) => p.id !== featured.id)
      .filter((p) => matchesFilter(p, filter))
      .filter(
        (p) =>
          !q ||
          `${p.title} ${p.address} ${p.area} ${p.type}`.toLowerCase().includes(q),
      );
  }, [filter, query, featured.id]);

  return (
    <Screen title="Haven" subtitle="All homes currently for sale">
      <Input
        value={query}
        onChangeText={setQuery}
        placeholder="Search street, area or home name"
        accessibilityLabel="Search homes"
        isDark={darkMode}
        returnKeyType="search"
      />

      {/* Featured home */}
      <View>
        <SectionTitle>Featured</SectionTitle>
        <Card
          isDark={darkMode}
          padding={8}
          onPress={() => router.push(`/templates/homes/property/${featured.id}`)}
          accessibilityLabel={`Featured: ${featured.title}, ${money(featured.price)}`}
        >
          <View>
            <PropertyVisual property={featured} height={208} />
            <View style={styles.featuredBadge}>
              <Badge tone="muted" isDark={darkMode}>
                {featured.status}
              </Badge>
            </View>
            <View style={styles.featuredSave}>
              <SaveButton propertyId={featured.id} large />
            </View>
          </View>
          <View style={styles.featuredBody}>
            <Figure variant="title">{money(featured.price)}</Figure>
            <Serif variant="heading" numberOfLines={1}>
              {featured.title}
            </Serif>
            <T variant="body" muted numberOfLines={1}>
              {featured.address} · {featured.area}
            </T>
            <Figure variant="caption" muted style={styles.featuredFacts}>
              {featured.beds} beds · {featured.baths} baths ·{" "}
              {featured.sqft.toLocaleString()} sq ft · {featured.type}
            </Figure>
          </View>
        </Card>
      </View>

      {/* Filter chips + results */}
      <View>
        <SectionTitle>Browse homes</SectionTitle>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {FILTERS.map((f) => (
            <Chip
              key={f}
              label={f}
              selected={filter === f}
              onSelectedChange={(selected) => {
                if (selected) setFilter(f);
              }}
              isDark={darkMode}
            />
          ))}
        </ScrollView>
        <View style={styles.list}>
          {list.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
          {list.length === 0 ? (
            <Card isDark={darkMode} padding={20}>
              <T variant="body">No homes match that search</T>
              <T variant="caption" muted style={styles.emptyHint}>
                Try a different area or clear the filters above
              </T>
            </Card>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  featuredBadge: {
    position: "absolute",
    top: 8,
    left: 8,
  },
  featuredSave: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  featuredBody: {
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 4,
  },
  featuredFacts: {
    marginTop: 4,
  },
  chipRow: {
    gap: 8,
    paddingBottom: 4,
  },
  list: {
    gap: 16,
    marginTop: 12,
  },
  emptyHint: {
    marginTop: 4,
  },
});
