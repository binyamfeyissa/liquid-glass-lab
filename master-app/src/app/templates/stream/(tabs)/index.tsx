import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Progress } from "glacia-native";

import {
  RAIL_GENRES,
  TITLES,
  formatRuntime,
  formatTime,
  ownerOf,
  playableDuration,
  playableLabel,
  visibleUnder,
  type Title,
} from "../data";
import { useStream } from "../state";
import { Artwork, Figure, Screen, SectionTitle, T, TitleCard, accentColor } from "../ui";

/** A horizontal rail of poster cards under a section heading. */
function Rail({ heading, titles }: { heading: string; titles: Title[] }) {
  if (titles.length === 0) return null;
  return (
    <View>
      <SectionTitle>{heading}</SectionTitle>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
      >
        {titles.map((title) => (
          <TitleCard key={title.id} title={title} />
        ))}
      </ScrollView>
    </View>
  );
}

export default function HomeScreen() {
  const stream = useStream();
  const router = useRouter();
  const { darkMode } = stream;

  const visible = TITLES.filter((t) => visibleUnder(t, stream.maturity));
  const featured = visible.find((t) => t.featured) ?? visible[0];
  const featuredResume = featured ? stream.resumeForTitle(featured) : null;

  const trending = visible
    .filter((t) => t.trendingRank !== undefined)
    .sort((a, b) => (a.trendingRank ?? 99) - (b.trendingRank ?? 99));

  return (
    <Screen belowTabBar
      title="Lumen Play"
      subtitle="Featured title, continue watching and genre rails"
    >
      {/* Featured hero */}
      {featured && featuredResume ? (
        <View>
          <Pressable
            onPress={() => router.push(`/templates/stream/title/${featured.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`Open ${featured.name}`}
          >
            <Artwork
              name={featured.name}
              colors={featured.colors}
              width={342}
              height={204}
              radius={20}
              image={featured.image}
            />
          </Pressable>
          <T variant="title" style={styles.heroName}>
            {featured.name}
          </T>
          <Figure variant="caption" muted>
            {featured.year} · {featured.rating} · {featured.genres.join(" · ")} ·{" "}
            {featured.kind === "movie"
              ? formatRuntime(featured.duration ?? 0)
              : `${featured.seasons?.length ?? 1} Seasons`}
          </Figure>
          <T variant="body" muted numberOfLines={3} style={styles.heroSynopsis}>
            {featured.synopsis}
          </T>
          <View style={styles.heroActions}>
            <Button
              accessibilityLabel={`${featuredResume.verb} ${featured.name}`}
              variant="filled"
              isDark={darkMode}
              onPress={() => {
                stream.playTitle(featured);
                router.push("/templates/stream/player");
              }}
            >
              {featuredResume.verb}
            </Button>
            <Button
              accessibilityLabel={
                stream.isInMyList(featured.id)
                  ? `Remove ${featured.name} from My List`
                  : `Add ${featured.name} to My List`
              }
              variant="glass"
              isDark={darkMode}
              onPress={() => stream.toggleMyList(featured.id)}
            >
              {stream.isInMyList(featured.id) ? "In My List" : "My List"}
            </Button>
          </View>
          <Figure variant="caption" muted style={styles.heroResume}>
            {featuredResume.detail}
            {featuredResume.position > 0
              ? ` · ${formatTime(featuredResume.position)} in`
              : ""}
          </Figure>
        </View>
      ) : null}

      {/* Continue watching — straight from the store's progress map */}
      {stream.continueWatching.length > 0 ? (
        <View>
          <SectionTitle>Continue watching</SectionTitle>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rail}
          >
            {stream.continueWatching.map(({ playableId, position }) => {
              const owner = ownerOf(playableId);
              const duration = playableDuration(playableId);
              const pct = Math.min(100, Math.round((position / duration) * 100));
              return (
                <Pressable
                  key={playableId}
                  onPress={() => {
                    stream.playPlayable(playableId);
                    router.push("/templates/stream/player");
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Resume ${owner.name}, ${playableLabel(playableId)}`}
                  style={({ pressed }) => [
                    styles.continueCard,
                    pressed && { opacity: 0.75 },
                  ]}
                >
                  <Artwork
                    name={owner.name}
                    colors={owner.colors}
                    width={218}
                    height={122}
                    radius={16}
                    image={owner.image}
                  />
                  <T variant="body" numberOfLines={1} style={styles.cardName}>
                    {owner.name}
                  </T>
                  <Figure variant="caption" muted numberOfLines={1}>
                    {playableLabel(playableId)} · {formatTime(duration - position)} left
                  </Figure>
                  <View style={styles.continueProgress}>
                    <Progress
                      value={pct}
                      tint={accentColor(stream.backdrop)}
                      accessibilityLabel={`Progress in ${owner.name}`}
                      isDark={darkMode}
                    />
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      <Rail heading="Trending now" titles={trending} />

      {RAIL_GENRES.map((genre) => (
        <Rail
          key={genre}
          heading={genre}
          titles={visible.filter((t) => t.genres.includes(genre))}
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  rail: {
    gap: 16,
    paddingRight: 8,
  },
  heroName: {
    marginTop: 16,
  },
  heroSynopsis: {
    marginTop: 8,
    lineHeight: 21,
  },
  heroActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  heroResume: {
    marginTop: 8,
  },
  cardName: {
    marginTop: 8,
  },
  continueCard: {
    width: 218,
  },
  continueProgress: {
    marginTop: 8,
  },
});
