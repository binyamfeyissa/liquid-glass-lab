import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  colors,
  Button, Chip, Input, Stepper
} from "glacia-native";
import { ChevronLeft } from "lucide-react-native";

import { useTravel } from "./state";
import { ListCard, SectionTitle, StayCard, T } from "./ui";

/** Price bands are defined in USD; the chips label them in the display currency. */
const PRICE_BANDS: { id: string; label: string; test: (usd: number) => boolean }[] = [
  { id: "any", label: "Any price", test: () => true },
  { id: "lt100", label: "Under $100", test: (usd) => usd < 100 },
  { id: "100to180", label: "$100 – $180", test: (usd) => usd >= 100 && usd <= 180 },
  { id: "gt180", label: "$180+", test: (usd) => usd > 180 },
];

export default function SearchScreen() {
  const params = useLocalSearchParams<{ q?: string }>();
  const { stays, destinations, darkMode, price } = useTravel();
  const [query, setQuery] = useState(params.q ?? "");
  const [travellers, setTravellers] = useState(2);
  const [bandId, setBandId] = useState("any");

  const results = useMemo(() => {
    const band = PRICE_BANDS.find((b) => b.id === bandId) ?? PRICE_BANDS[0];
    const q = query.trim().toLowerCase();
    return stays.filter((stay) => {
      if (stay.guests < travellers) return false;
      if (!band.test(stay.pricePerNight)) return false;
      if (!q) return true;
      const dest = destinations.find((d) => d.id === stay.destinationId);
      const haystack = `${stay.title} ${stay.type} ${dest?.city ?? ""} ${dest?.country ?? ""}`.toLowerCase();
      return q.split(/\s+/).every((word) => haystack.includes(word));
    });
  }, [stays, destinations, query, travellers, bandId]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Button
          isDark={darkMode}
          size="sm"
          shape="circle"
          accessibilityLabel="Back"
          onPress={() => router.back()}
        >
          <ChevronLeft size={18} color={darkMode ? colors.dark.foreground : colors.light.foreground} />
        </Button>
        <T variant="title" style={styles.title}>
          Search
        </T>
      </View>

      <Input
        isDark={darkMode}
        value={query}
        onChangeText={setQuery}
        placeholder="City, country or stay name"
        accessibilityLabel="Search destinations and stays"
        returnKeyType="search"
      />

      <ListCard>
        <View style={styles.travellerRow}>
          <View style={styles.flex}>
            <T variant="body">Travellers</T>
            <T variant="caption" muted>
              Only stays that sleep at least this many
            </T>
          </View>
          <Stepper
            isDark={darkMode}
            value={travellers}
            onValueChange={setTravellers}
            min={1}
            max={8}
            accessibilityLabel="Number of travellers"
          />
        </View>
      </ListCard>

      <View>
        <SectionTitle>Price per night</SectionTitle>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {PRICE_BANDS.map((band) => (
            <Chip
              key={band.id}
              isDark={darkMode}
              label={
                band.id === "any"
                  ? "Any price"
                  : band.id === "lt100"
                    ? `Under ${price(100)}`
                    : band.id === "100to180"
                      ? `${price(100)} – ${price(180)}`
                      : `${price(180)}+`
              }
              selected={bandId === band.id}
              onSelectedChange={(selected) => {
                if (selected) setBandId(band.id);
              }}
            />
          ))}
        </ScrollView>
      </View>

      <View>
        <SectionTitle>
          {results.length} {results.length === 1 ? "stay" : "stays"}
          {query.trim() ? ` for ${query.trim()}` : ""}
        </SectionTitle>
        {results.length === 0 ? (
          <ListCard style={styles.empty}>
            <T variant="body" style={styles.center}>
              No stays match those filters
            </T>
            <T variant="caption" muted style={styles.center}>
              Try fewer travellers, a wider price range, or a different place name.
            </T>
            <Button
              isDark={darkMode}
              accessibilityLabel="Clear all filters"
              onPress={() => {
                setQuery("");
                setTravellers(1);
                setBandId("any");
              }}
            >
              Clear filters
            </Button>
          </ListCard>
        ) : (
          <View style={styles.results}>
            {results.map((stay) => (
              <StayCard key={stay.id} stay={stay} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 32, gap: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  title: {},
  travellerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  chipRow: { gap: 8, paddingRight: 8 },
  results: { gap: 16 },
  empty: { padding: 20, gap: 10, alignItems: "center" },
  center: { textAlign: "center" },
});
