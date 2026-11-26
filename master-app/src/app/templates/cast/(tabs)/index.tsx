import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card } from "glacia-native";

import {
  episodeById,
  newestEpisodes,
  showById,
} from "../data";
import { useCast } from "../state";
import {
  Artwork,
  EpisodeRow,
  ListCard,
  Screen,
  SectionTitle,
  T,
} from "../ui";

export default function HomeScreen() {
  const cast = useCast();
  const router = useRouter();
  const { darkMode } = cast;

  const inProgress = cast.inProgressIds.slice(0, 4).map(episodeById);
  const fresh = newestEpisodes(5);
  const yourShows = cast.followedShowIds.map(showById);

  return (
    <Screen
      title="Airwave"
      subtitle="Your shows and new episodes"
    >
      {/* Continue listening — live from the store's saved positions. */}
      {inProgress.length > 0 ? (
        <View>
          <SectionTitle>Continue listening</SectionTitle>
          <ListCard>
            {inProgress.map((episode, i) => (
              <View key={episode.id}>
                {i > 0 ? <View style={styles.rowGap} /> : null}
                <EpisodeRow episode={episode} />
              </View>
            ))}
          </ListCard>
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
                <Artwork title={show.title} colors={show.colors} size={96} />
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
