import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Progress } from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import PlayIcon from "@hugeicons/core-free-icons/PlayIcon";

import {
  episodeById,
  formatTime,
  newestEpisodes,
  showById,
} from "../data";
import { useCast } from "../state";
import {
  accentColor,
  Artwork,
  EpisodeRow,
  Figure,
  ListCard,
  Screen,
  SectionTitle,
  T,
} from "../ui";

/**
 * Home: the listening day, led by what you're already in the middle
 * of. The top in-progress episode gets a hero card — large artwork,
 * progress and a play affordance — instead of another identical
 * episode list; the rest of the queue, your shows and the newest
 * episodes follow in their own shapes.
 */
export default function HomeScreen() {
  const cast = useCast();
  const router = useRouter();
  const { darkMode } = cast;

  const inProgress = cast.inProgressIds.slice(0, 4).map(episodeById);
  const topEpisode = inProgress[0] ?? null;
  const rest = inProgress.slice(1);
  const topShow = topEpisode ? showById(topEpisode.showId) : null;
  const topProgressSec = topEpisode ? cast.progressOf(topEpisode.id) : 0;
  const topProgressPct =
    topEpisode && topEpisode.duration > 0
      ? (topProgressSec / topEpisode.duration) * 100
      : 0;
  const fresh = newestEpisodes(5);
  const yourShows = cast.followedShowIds.map(showById);

  return (
    <Screen belowTabBar
      title="Airwave"
      subtitle="Your shows and new episodes"
    >
      {/* Continue listening — the episode you're furthest into leads
          as a hero; the rest stay as compact rows below it. */}
      {topEpisode && topShow ? (
        <View>
          <SectionTitle>Continue listening</SectionTitle>
          <View style={styles.continueBody}>
            <Card
              isDark={darkMode}
              padding={16}
              onPress={() => {
                cast.playEpisode(topEpisode.id);
                router.push("/templates/cast/player");
              }}
              accessibilityLabel={`Resume ${topEpisode.title} from ${topShow.title}`}
            >
              <View style={styles.heroRow}>
                <Artwork title={topShow.title} colors={topShow.colors} size={104} image={topShow.image} />
                <View style={styles.heroText}>
                  <T variant="body" numberOfLines={2}>
                    {topEpisode.title}
                  </T>
                  <T variant="caption" muted numberOfLines={1}>
                    {topShow.title}
                  </T>
                  <View style={styles.heroProgress}>
                    <Progress
                      value={topProgressPct}
                      isDark={darkMode}
                      accessibilityLabel={`Progress in ${topEpisode.title}`}
                      style={styles.heroProgressBar}
                    />
                    <Figure variant="caption" muted>
                      {formatTime(topEpisode.duration - topProgressSec)} left
                    </Figure>
                  </View>
                </View>
                <View
                  style={[
                    styles.heroPlay,
                    { backgroundColor: accentColor(cast.backdrop) },
                  ]}
                >
                  <HugeiconsIcon icon={PlayIcon} size={20} color="#FFFFFF" />
                </View>
              </View>
            </Card>
            {rest.length > 0 ? (
              <ListCard>
                {rest.map((episode, i) => (
                  <View key={episode.id}>
                    {i > 0 ? <View style={styles.rowGap} /> : null}
                    <EpisodeRow episode={episode} />
                  </View>
                ))}
              </ListCard>
            ) : null}
          </View>
        </View>
      ) : null}

      {/* Your shows — the followed podcasts as a horizontal rail. */}
      <View>
        <SectionTitle>Your shows</SectionTitle>
        {yourShows.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rail}
          >
            {yourShows.map((show) => (
              <Pressable
                key={show.id}
                onPress={() => router.push(`/templates/cast/show/${show.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`Open ${show.title}`}
                style={styles.railItem}
              >
                <Artwork title={show.title} colors={show.colors} size={96} image={show.image} />
                <T variant="caption" numberOfLines={1} style={styles.railTitle}>
                  {show.title}
                </T>
                <T variant="caption" muted numberOfLines={1}>
                  {show.author}
                </T>
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          <Card isDark={darkMode} padding={16}>
            <T variant="body">You aren't following any shows yet.</T>
            <T variant="caption" muted style={styles.cardHint}>
              Follow a show and its new episodes will land here.
            </T>
            <Button
              accessibilityLabel="Browse shows in Discover"
              onPress={() => router.push("/templates/cast/discover")}
              isDark={darkMode}
              style={styles.cardButton}
            >
              Browse shows
            </Button>
          </Card>
        )}
      </View>

      {/* New episodes across the whole catalogue. */}
      <View>
        <SectionTitle>New episodes</SectionTitle>
        <ListCard>
          {fresh.map((episode, i) => (
            <View key={episode.id}>
              {i > 0 ? <View style={styles.rowGap} /> : null}
              <EpisodeRow episode={episode} />
            </View>
          ))}
        </ListCard>
      </View>

      {/* Shortcuts to the two stack utilities. */}
      <View style={styles.shortcuts}>
        <Button
          accessibilityLabel="Open your up-next queue"
          onPress={() => router.push("/templates/cast/queue")}
          isDark={darkMode}
          variant="glass"
          style={styles.shortcut}
        >{`Queue (${cast.queue.length})`}</Button>
        <Button
          accessibilityLabel="Open downloads"
          onPress={() => router.push("/templates/cast/downloads")}
          isDark={darkMode}
          variant="glass"
          style={styles.shortcut}
        >{`Downloads (${cast.downloadedIds.length})`}</Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  rowGap: {
    height: 2,
  },
  continueBody: {
    gap: 12,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  heroText: {
    flex: 1,
    gap: 4,
  },
  heroProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  heroProgressBar: {
    flex: 1,
  },
  heroPlay: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rail: {
    gap: 16,
    paddingHorizontal: 2,
  },
  railItem: {
    width: 96,
    gap: 4,
  },
  railTitle: {
    marginTop: 8,
  },
  cardHint: {
    marginTop: 4,
  },
  cardButton: {
    marginTop: 12,
    alignSelf: "flex-start",
  },
  shortcuts: {
    flexDirection: "row",
    gap: 8,
  },
  shortcut: {
    flex: 1,
  },
});
