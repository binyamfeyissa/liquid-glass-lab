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
  ShowRow,
  T,
  accentColor,
} from "../ui";

/**
 * Discover: the whole catalogue, led by one featured show. The
 * featured show gets a large editorial card — artwork, category,
 * description and a follow action — and the rest of the catalogue is
 * a single scannable list of shows, not a grid of identical cards.
 * Search matches shows and individual episodes; the category chips
 * filter the list. Following a show from here feeds Home and the
 * Library.
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

  // The editorial lead: the first show, only when browsing the whole
  // catalogue with no search. It is left out of the list below so it
  // does not appear twice.
  const featured = category === "All" && q === "" ? shows[0] : null;
  const listed = featured ? shows.slice(1) : shows;
  const featuredFollowing = featured ? cast.isFollowing(featured.id) : false;
  const listTitle =
    category === "All" ? (featured ? "More shows" : "All shows") : `${category} shows`;

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

      {featured ? (
        <View>
          <SectionTitle>Featured</SectionTitle>
          <Card isDark={darkMode} padding={16}>
            <View style={styles.featuredBody}>
              <Pressable
                onPress={() => router.push(`/templates/cast/show/${featured.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`Open ${featured.title} by ${featured.author}`}
                style={styles.featuredMain}
              >
                <Artwork title={featured.title} colors={featured.colors} size={120} image={featured.image} />
                <View style={styles.featuredText}>
                  <T variant="label" style={{ color: accentColor(cast.backdrop) }}>
                    {featured.category}
                  </T>
                  <T variant="heading" style={styles.featuredTitle}>
                    {featured.title}
                  </T>
                  <T variant="caption" muted>
                    {featured.author}
                  </T>
                  <T variant="body" muted numberOfLines={2} style={styles.featuredDescription}>
                    {featured.description}
                  </T>
                </View>
              </Pressable>
              <Button
                accessibilityLabel={
                  featuredFollowing ? `Unfollow ${featured.title}` : `Follow ${featured.title}`
                }
                variant={featuredFollowing ? "glass" : "filled"}
                onPress={() => cast.toggleFollow(featured.id)}
                isDark={darkMode}
                style={styles.featuredFollow}
              >
                {featuredFollowing ? "Following" : "Follow"}
              </Button>
            </View>
          </Card>
        </View>
      ) : null}

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
        <SectionTitle>{listTitle}</SectionTitle>
        {listed.length > 0 ? (
          <ListCard>
            {listed.map((show, i) => {
              const following = cast.isFollowing(show.id);
              return (
                <View key={show.id}>
                  {i > 0 ? <View style={styles.rowGap} /> : null}
                  <ShowRow
                    show={show}
                    onPress={() => router.push(`/templates/cast/show/${show.id}`)}
                    trailing={
                      <Button
                        accessibilityLabel={
                          following ? `Unfollow ${show.title}` : `Follow ${show.title}`
                        }
                        variant={following ? "glass" : "filled"}
                        onPress={() => cast.toggleFollow(show.id)}
                        isDark={darkMode}
                        size="sm"
                      >
                        {following ? "Following" : "Follow"}
                      </Button>
                    }
                  />
                </View>
              );
            })}
          </ListCard>
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
  featuredBody: {
    gap: 16,
  },
  featuredMain: {
    flexDirection: "row",
    gap: 16,
  },
  featuredText: {
    flex: 1,
    gap: 4,
  },
  featuredTitle: {
    marginTop: 2,
  },
  featuredDescription: {
    marginTop: 4,
    lineHeight: 20,
  },
  featuredFollow: {
    alignSelf: "flex-start",
    minWidth: 120,
  },
});
