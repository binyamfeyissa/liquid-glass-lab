import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Chip, Input, SegmentedControl } from "glacia-native";

import { GENRES, TITLES, visibleUnder } from "../data";
import { useStream } from "../state";
import { ListCard, RowSeparator, Screen, T, TitleRow } from "../ui";

const KIND_SEGMENTS = ["All", "Movies", "Series"];

export default function BrowseScreen() {
  const stream = useStream();
  const { darkMode } = stream;
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All");
  const [kindIndex, setKindIndex] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TITLES.filter((t) => visibleUnder(t, stream.maturity))
      .filter((t) => (genre === "All" ? true : t.genres.includes(genre)))
      .filter((t) =>
        kindIndex === 0 ? true : kindIndex === 1 ? t.kind === "movie" : t.kind === "series",
      )
      .filter((t) =>
        q
          ? [t.name, t.synopsis, t.creator, ...t.genres, ...t.cast]
              .join(" ")
              .toLowerCase()
              .includes(q)
          : true,
      );
  }, [genre, kindIndex, query, stream.maturity]);

  return (
    <Screen belowTabBar title="Browse" subtitle="Every film and series in the catalogue">
      <Input
        value={query}
        onChangeText={setQuery}
        placeholder="Search titles, people, genres"
        accessibilityLabel="Search the catalogue"
        returnKeyType="search"
        isDark={darkMode}
      />

      <SegmentedControl
        segments={KIND_SEGMENTS}
        selectedIndex={kindIndex}
        onChange={setKindIndex}
        accessibilityLabel="Filter by movies or series"
        isDark={darkMode}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {GENRES.map((g) => (
          <Chip
            key={g}
            label={g}
            selected={genre === g}
            onSelectedChange={() => setGenre(g)}
            isDark={darkMode}
          />
        ))}
      </ScrollView>

      <T variant="caption" muted>
        {results.length} {results.length === 1 ? "title" : "titles"}
        {genre !== "All" ? ` in ${genre}` : ""}
        {query.trim() ? ` matching ${query.trim()}` : ""}
      </T>

      {results.length > 0 ? (
        <ListCard>
          {results.map((title, i) => (
            <View key={title.id}>
              {i > 0 ? <RowSeparator /> : null}
              <TitleRow title={title} />
            </View>
          ))}
        </ListCard>
      ) : (
        <View style={styles.empty}>
          <T variant="heading">Nothing matches</T>
          <T variant="body" muted style={styles.emptyHint}>
            Try a different search, or clear the genre and type filters.
          </T>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: {
    gap: 8,
    paddingRight: 8,
  },
  empty: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 30,
  },
  emptyHint: {
    textAlign: "center",
  },
});
