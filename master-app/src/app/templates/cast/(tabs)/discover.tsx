import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Chip, Input } from "glacia-native";

import { CATEGORIES, EPISODES, SHOWS, showById } from "../data";
import { useCast } from "../state";
import {
  Artwork,
  EpisodeRow,
  Figure,
  ListCard,
  Screen,
  SectionTitle,
  T,
  accentColor,
} from "../ui";

/**
 * Discover: the whole catalogue. Category chips filter the show grid;
 * the search box matches shows and individual episodes. Following a
 * show from here feeds Home and the Library.
 */
export default function DiscoverScreen() {
  const cast = useCast();
  const router = useRouter();
  const { darkMode } = cast;
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();

  const shows = useMemo(
    () =>
      SHOWS.filter(
        (s) =>
          (category === "All" || s.category === category) &&
          (q === "" ||
            s.title.toLowerCase().includes(q) ||
            s.author.toLowerCase().includes(q) ||
            s.category.toLowerCase().includes(q)),
      ),
    [category, q],
  );

  const episodeMatches = useMemo(
    () =>
      q === ""
        ? []
        : EPISODES.filter(
            (e) =>
              e.title.toLowerCase().includes(q) ||
              e.description.toLowerCase().includes(q) ||
              showById(e.showId).title.toLowerCase().includes(q),
          ).slice(0, 6),
    [q],
  );

  return (
    <Screen belowTabBar
      title="Discover"
      subtitle="Six shows, new episodes weekly"
    >
      <Input
        value={query}
        onChangeText={setQuery}
        placeholder="Search shows and episodes"
        accessibilityLabel="Search shows and episodes"
        isDark={darkMode}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRail}
      >
        {CATEGORIES.map((c) => (
          <Chip
            key={c}
            label={c}
            selected={category === c}
            onSelectedChange={(selected) => {
              if (selected) setCategory(c);
            }}
            isDark={darkMode}
          />
        ))}
      </ScrollView>

      {episodeMatches.length > 0 ? (
        <View>
          <SectionTitle>Matching episodes</SectionTitle>
          <ListCard>
            {episodeMatches.map((episode, i) => (
              <View key={episode.id}>
                {i > 0 ? <View style={styles.rowGap} /> : null}
                <EpisodeRow episode={episode} />
              </View>
            ))}
          </ListCard>
        </View>
      ) : null}

      <View>
        <SectionTitle>
          {category === "All" ? "All shows" : `${category} shows`}
        </SectionTitle>
        {shows.length > 0 ? (
          <View style={styles.grid}>
            {shows.map((show) => {
              const following = cast.isFollowing(show.id);
              return (
                <Card
                  key={show.id}
                  isDark={darkMode}
                  padding={16}
                  style={styles.showCard}
                  onPress={() => router.push(`/templates/cast/show/${show.id}`)}
                  accessibilityLabel={`Open ${show.title} by ${show.author}`}
                >
                  <Artwork title={show.title} colors={show.colors} size={64} image={show.image} />
                  <T variant="body" numberOfLines={1} style={styles.cardTitle}>
                    {show.title}
                  </T>
                  <T variant="caption" muted numberOfLines={1}>
                    {show.author}
                  </T>
                  <View style={styles.metaLine}>
                    <Figure variant="caption" muted>
                      {show.rating}
                    </Figure>
                    <T variant="caption" muted>
                      · {show.cadence}
                    </T>
                  </View>
                  <View style={styles.followButton}>
                    <Button
                      accessibilityLabel={
                        following ? `Unfollow ${show.title}` : `Follow ${show.title}`
                      }
                      variant={following ? "glass" : "filled"}
                      onPress={() => cast.toggleFollow(show.id)}
                      isDark={darkMode}
                    >
                      {following ? "Following" : "Follow"}
                    </Button>
                  </View>
                </Card>
              );
            })}
          </View>
        ) : (
          <T variant="body" muted>
            No shows match that search in {category}. Try a different word.
          </T>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chipRail: {
    gap: 8,
    paddingHorizontal: 2,
  },
  rowGap: {
    height: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  showCard: {
    width: "48%",
    flexGrow: 1,
    gap: 4,
  },
  cardTitle: {
    marginTop: 8,
  },
  metaLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  followButton: {
    marginTop: 8,
    paddingVertical: 4,
  },
});
