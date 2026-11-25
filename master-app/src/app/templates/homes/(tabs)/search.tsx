import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Card, Input, SegmentedControl, Select } from "glacia-native";

import { PROPERTIES, type Property } from "../data";
import { useHomes } from "../state";
import { PropertyCard, Screen, SectionTitle, T } from "../ui";

const PRICE_BANDS = [
  { label: "Any price", value: "any" },
  { label: "Under $250k", value: "0-250000" },
  { label: "$250k – $500k", value: "250000-500000" },
  { label: "$500k – $750k", value: "500000-750000" },
  { label: "$750k – $1M", value: "750000-1000000" },
  { label: "Over $1M", value: "1000000-" },
];

const TYPE_OPTIONS = [
  { label: "Any type", value: "any" },
  { label: "House", value: "House" },
  { label: "Flat", value: "Flat" },
  { label: "Bungalow", value: "Bungalow" },
  { label: "Terrace", value: "Terrace" },
];

const SORT_OPTIONS = [
  { label: "Newest first", value: "newest" },
  { label: "Price: low to high", value: "price-asc" },
  { label: "Price: high to low", value: "price-desc" },
];

const BED_SEGMENTS = ["Any", "1", "2", "3", "4+"];

function inBand(p: Property, band: string): boolean {
  if (band === "any") return true;
  const [lo, hi] = band.split("-");
  const min = Number(lo);
  const max = hi ? Number(hi) : Number.POSITIVE_INFINITY;
  return p.price >= min && p.price < max;
}

export default function SearchScreen() {
  const { darkMode } = useHomes();
  const [query, setQuery] = useState("");
  const [band, setBand] = useState("any");
  const [bedsIndex, setBedsIndex] = useState(0);
  const [type, setType] = useState("any");
  const [sort, setSort] = useState("newest");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const minBeds = bedsIndex === 0 ? 0 : bedsIndex === 4 ? 4 : bedsIndex;
    const filtered = PROPERTIES.filter((p) => inBand(p, band))
      .filter((p) => (type === "any" ? true : p.type === type))
      .filter((p) => p.beds >= minBeds)
      .filter(
        (p) =>
          !q ||
          `${p.title} ${p.address} ${p.area} ${p.type} ${p.features.join(" ")}`
            .toLowerCase()
            .includes(q),
      );
    switch (sort) {
      case "price-asc":
        return [...filtered].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...filtered].sort((a, b) => b.price - a.price);
      default:
        return [...filtered].sort((a, b) => a.listedDaysAgo - b.listedDaysAgo);
    }
  }, [query, band, bedsIndex, type, sort]);

  return (
    <Screen title="Search" subtitle="All homes, with filters for price, type and bedrooms">
      <View>
        <SectionTitle>Find a home</SectionTitle>
        <View style={styles.filters}>
          <Input
            value={query}
            onChangeText={setQuery}
            placeholder="Street, area or feature"
            accessibilityLabel="Search by keyword"
            isDark={darkMode}
            returnKeyType="search"
          />
          <View style={styles.filterRow}>
            <View style={styles.filterHalf}>
              <T variant="caption" muted style={styles.filterLabel}>
                Price
              </T>
              <Select
                value={band}
                onValueChange={setBand}
                options={PRICE_BANDS}
                accessibilityLabel="Price band"
                isDark={darkMode}
              />
            </View>
            <View style={styles.filterHalf}>
              <T variant="caption" muted style={styles.filterLabel}>
                Type
              </T>
              <Select
                value={type}
                onValueChange={setType}
                options={TYPE_OPTIONS}
                accessibilityLabel="Property type"
                isDark={darkMode}
              />
            </View>
          </View>
          <View>
            <T variant="caption" muted style={styles.filterLabel}>
              Bedrooms
            </T>
            <SegmentedControl
              segments={BED_SEGMENTS}
              selectedIndex={bedsIndex}
              onChange={setBedsIndex}
              accessibilityLabel="Minimum bedrooms"
              isDark={darkMode}
            />
          </View>
          <View>
            <T variant="caption" muted style={styles.filterLabel}>
              Sort by
            </T>
            <Select
              value={sort}
              onValueChange={setSort}
              options={SORT_OPTIONS}
              accessibilityLabel="Sort results"
              isDark={darkMode}
            />
          </View>
        </View>
      </View>

      <View>
        <SectionTitle>
          {results.length} {results.length === 1 ? "home" : "homes"} found
        </SectionTitle>
        <View style={styles.list}>
          {results.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
          {results.length === 0 ? (
            <Card isDark={darkMode} padding={20}>
              <T variant="body">Nothing matches those filters</T>
              <T variant="caption" muted style={styles.emptyHint}>
                Widen the price band or lower the bedroom minimum
              </T>
            </Card>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: {
    gap: 16,
  },
  filterRow: {
    flexDirection: "row",
    gap: 12,
  },
  filterHalf: {
    flex: 1,
  },
  filterLabel: {
    marginBottom: 8,
    marginLeft: 4,
  },
  list: {
    gap: 16,
  },
  emptyHint: {
    marginTop: 4,
  },
});
