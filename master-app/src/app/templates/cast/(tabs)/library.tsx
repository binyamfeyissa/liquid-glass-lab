import React from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, Button } from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import ChevronRightIcon from "@hugeicons/core-free-icons/ChevronRightIcon";
import { episodeById, showById } from "../data";
import { useCast } from "../state";
import {
  EpisodeRow,
  ListCard,
  RowSeparator,
  Screen,
  SectionTitle,
  ShowRow,
  T,
} from "../ui";

/**
 * Library: a well-organized personal collection. Followed shows read
 * as a show list, the episodes you're mid-way through get the one
 * card on the screen, and the finished history is a plain muted list
 * — three sections, three shapes, so the screen doesn't read as three
 * identical stacks of rows.
 */
export default function LibraryScreen() {
  const cast = useCast();
  const router = useRouter();
  const { darkMode } = cast;

  const shows = cast.followedShowIds.map(showById);
  const inProgress = cast.inProgressIds.map(episodeById);
  const played = cast.playedIds.map(episodeById);

  return (
    <Screen belowTabBar title="Library" subtitle="Followed shows, progress and played episodes">
      {/* Followed shows */}
      <View>
        <SectionTitle>Followed shows</SectionTitle>
        {shows.length > 0 ? (
          <ListCard>
            {shows.map((show, i) => (
              <View key={show.id}>
                {i > 0 ? <View style={styles.rowGap} /> : null}
                <ShowRow
                  show={show}
                  onPress={() => router.push(`/templates/cast/show/${show.id}`)}
                  trailing={
                    <HugeiconsIcon icon={ChevronRightIcon} size={16} color={colors[darkMode ? "dark" : "light"].muted} />
                  }
                />
              </View>
            ))}
          </ListCard>
        ) : (
          <T variant="body" muted>
            Nothing followed yet — find a show in Discover.
          </T>
        )}
      </View>

      {/* In progress — the one card on this screen. */}
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

      {/* Played history — a plain list, no card, so it sits quieter. */}
      <View>
        <SectionTitle>Played history</SectionTitle>
        {played.length > 0 ? (
          <View>
            {played.map((episode, i) => (
              <View key={episode.id}>
                {i > 0 ? <RowSeparator /> : null}
                <EpisodeRow episode={episode} />
              </View>
            ))}
          </View>
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
      >{`Downloads · ${cast.downloadedMB} MB on this device`}</Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  rowGap: {
    height: 2,
  },
});
