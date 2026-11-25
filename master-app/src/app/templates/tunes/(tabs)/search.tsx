import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { Chip, Input } from "glacia-native";

import { GENRES, TRACKS, artistOf } from "../data";
import { useTunes } from "../state";
import { ListCard, Screen, SectionTitle, T, TrackRow } from "../ui";
import { StyleSheet } from "react-native";

export default function SearchScreen() {
  const tunes = useTunes();
  const { darkMode } = tunes;
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TRACKS.filter((track) => {
      if (genre !== "All" && track.genre !== genre) return false;
      if (!q) return true;
      const artist = artistOf(track).name.toLowerCase();
      return (
        track.title.toLowerCase().includes(q) ||
        track.album.toLowerCase().includes(q) ||
        track.genre.toLowerCase().includes(q) ||
        artist.includes(q)
      );
    });
  }, [query, genre]);

  const resultIds = results.map((t) => t.id);
  const searching = query.trim().length > 0;

  return (
    <Screen title="Search" subtitle="Every track in the Waveform catalogue">
      <Input
        value={query}
        onChangeText={setQuery}
        placeholder="Songs, artists, albums"
        accessibilityLabel="Search the catalogue"
        returnKeyType="search"
        onSubmitEditing={() => tunes.recordSearch(query)}
        isDark={darkMode}
      />

      {/* Recent searches — recorded when a search is submitted. */}
      {!searching && tunes.recentSearches.length > 0 ? (
        <View>
          <SectionTitle>Recent searches</SectionTitle>
          <View style={styles.chipWrap}>
            {tunes.recentSearches.map((term) => (
              <Chip
                key={term}
                label={term}
                isDark={darkMode}
                onPress={() => setQuery(term)}
              />
            ))}
          </View>
        </View>
      ) : null}

      {/* Genre filter */}
      <View>
        <SectionTitle>Genre</SectionTitle>
        <View style={styles.chipWrap}>
          {GENRES.map((g) => (
            <Chip
              key={g}
              label={g}
              isDark={darkMode}
              selected={genre === g}
              onSelectedChange={(selected) => {
                if (selected) setGenre(g);
              }}
            />
          ))}
        </View>
      </View>

      <View>
        <SectionTitle>
          {searching || genre !== "All"
            ? `${results.length} result${results.length === 1 ? "" : "s"}`
            : "Browse all"}
        </SectionTitle>
        {results.length === 0 ? (
          <ListCard>
            <View style={styles.empty}>
              <T variant="body">Nothing matches that search</T>
              <T variant="caption" muted style={styles.emptyHint}>
                Try an artist like Nova Reyes, or clear the genre filter
              </T>
            </View>
          </ListCard>
        ) : (
          <ListCard>
            {results.map((track, i) => (
              <View key={track.id}>
                {i > 0 ? <View style={styles.rowGap} /> : null}
                <TrackRow track={track} contextIds={resultIds} showPlays />
              </View>
            ))}
          </ListCard>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  empty: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 4,
  },
  emptyHint: {
    marginTop: 4,
  },
  rowGap: {
    height: 2,
  },
});
