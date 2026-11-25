import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, Button } from "glacia-native";
import { ChevronRight } from "lucide-react-native";

import { episodeById, showById } from "../data";
import { useCast } from "../state";
import {
  Artwork,
  EpisodeRow,
  ListCard,
  Screen,
  SectionTitle,
  T,
} from "../ui";

/**
 * Library: followed shows, everything in progress, and the played
 * history — all derived live from the store.
 */
export default function LibraryScreen() {
  const cast = useCast();
  const router = useRouter();
  const { darkMode } = cast;

  const shows = cast.followedShowIds.map(showById);
  const inProgress = cast.inProgressIds.map(episodeById);
  const played = cast.playedIds.map(episodeById);

  return (
    <Screen title="Library" subtitle="Followed shows, progress and played episodes">
      {/* Followed shows */}
      <View>
        <SectionTitle>Followed shows</SectionTitle>
        {shows.length > 0 ? (
          <ListCard>
            {shows.map((show, i) => (
              <View key={show.id}>
                {i > 0 ? <View style={styles.rowGap} /> : null}
                <Pressable
                  onPress={() => router.push(`/templates/cast/show/${show.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${show.title}`}
                  style={styles.showRow}
                >
                  <Artwork title={show.title} colors={show.colors} size={48} />
                  <View style={styles.flex}>
                    <T variant="body" numberOfLines={1}>
                      {show.title}
                    </T>
                    <T variant="caption" muted>
                      {show.author} · {show.cadence}
                    </T>
                  </View>
                  <ChevronRight size={16} color={colors[darkMode ? "dark" : "light"].muted} />
                </Pressable>
              </View>
            ))}
          </ListCard>
        ) : (
          <T variant="body" muted>
            Nothing followed yet — find a show in Discover.
          </T>
        )}
      </View>

      {/* In progress */}
      <View>
        <SectionTitle>In progress</SectionTitle>
        {inProgress.length > 0 ? (
          <ListCard>
            {inProgress.map((episode, i) => (
              <View key={episode.id}>
                {i > 0 ? <View style={styles.rowGap} /> : null}
                <EpisodeRow episode={episode} />
              </View>
            ))}
          </ListCard>
        ) : (
          <T variant="body" muted>
            No half-finished episodes. Start one and it will wait for you here.
          </T>
        )}
      </View>

      {/* Played history */}
      <View>
        <SectionTitle>Played history</SectionTitle>
        {played.length > 0 ? (
          <ListCard>
            {played.map((episode, i) => (
              <View key={episode.id}>
                {i > 0 ? <View style={styles.rowGap} /> : null}
                <EpisodeRow episode={episode} />
              </View>
            ))}
          </ListCard>
        ) : (
          <T variant="body" muted>
            Episodes you finish will appear here.
          </T>
        )}
      </View>

      <Button
        accessibilityLabel="Open downloads"
        onPress={() => router.push("/templates/cast/downloads")}
        isDark={darkMode}
        variant="glass"
      >
        Downloads · {cast.downloadedMB} MB on this device
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  rowGap: {
    height: 2,
  },
  showRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
  },
  flex: {
    flex: 1,
  },
});
