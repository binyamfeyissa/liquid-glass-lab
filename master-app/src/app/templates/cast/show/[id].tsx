import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, Button, IconButton, SegmentedControl } from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import ChevronLeftIcon from "@hugeicons/core-free-icons/ChevronLeftIcon";
import { episodesOfShow, showById } from "../data";
import { useCast } from "../state";
import { Artwork, EpisodeRow, Figure, ListCard, T } from "../ui";

/**
 * A show's page: header with follow/unfollow, then its episodes with
 * live progress and Played badges. The sort toggle flips between
 * newest-first and oldest-first.
 */
export default function ShowScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const cast = useCast();
  const router = useRouter();
  const { darkMode } = cast;
  const [sortIndex, setSortIndex] = useState(0); // 0 = Newest, 1 = Oldest

  const show = showById(id ?? "");
  const following = cast.isFollowing(show.id);

  const episodes = useMemo(() => {
    const list = episodesOfShow(show.id);
    return sortIndex === 0 ? [...list].reverse() : list;
  }, [show.id, sortIndex]);

  const unplayed = episodes.filter((e) => !cast.isPlayed(e.id)).length;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <IconButton
          accessibilityLabel="Back"
          onPress={() => router.back()}
          isDark={darkMode}
          icon={<HugeiconsIcon icon={ChevronLeftIcon} size={20} color={colors[darkMode ? "dark" : "light"].foreground} />}
        />
        <T variant="label" muted>
          Podcast
        </T>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.artWrap}>
        <Artwork title={show.title} colors={show.colors} size={180} radius={20} image={show.image} />
      </View>

      <T variant="title" style={styles.centerText}>
        {show.title}
      </T>
      <T variant="body" muted style={styles.centerText}>
        {show.author}
      </T>
      <View style={styles.metaRow}>
        <T variant="caption" muted>
          {show.category} ·
        </T>
        <Figure variant="caption" muted>
          {show.rating}
        </Figure>
        <T variant="caption" muted>
          · {show.cadence} · {episodes.length} episodes
        </T>
      </View>

      <Button
        accessibilityLabel={following ? `Unfollow ${show.title}` : `Follow ${show.title}`}
        onPress={() => cast.toggleFollow(show.id)}
        isDark={darkMode}
        variant={following ? "glass" : "filled"}
        style={styles.followButton}
      >
        {following ? "Following" : "Follow"}
      </Button>
      {cast.autoDownload && !following ? (
        <T variant="caption" muted style={styles.centerText}>
          Auto-download is on — following grabs the newest episode.
        </T>
      ) : null}

      <T variant="body" style={styles.description}>
        {show.description}
      </T>

      <View style={styles.listHeader}>
        <T variant="label" muted>
          Episodes · {unplayed} unplayed
        </T>
        <SegmentedControl
          segments={["Newest", "Oldest"]}
          selectedIndex={sortIndex}
          onChange={setSortIndex}
          accessibilityLabel="Sort episodes"
          isDark={darkMode}
          style={styles.sortControl}
        />
      </View>

      <ListCard>
        {episodes.map((episode, i) => (
          <View key={episode.id}>
            {i > 0 ? <View style={styles.rowGap} /> : null}
            <EpisodeRow episode={episode} showTitle={false} />
          </View>
        ))}
      </ListCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 112,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerSpacer: { flex: 1 },
  artWrap: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  centerText: {
    textAlign: "center",
    marginTop: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 12,
  },
  followButton: {
    marginTop: 16,
    alignSelf: "center",
    minWidth: 180,
  },
  description: {
    marginTop: 20,
    lineHeight: 20,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 8,
    gap: 12,
  },
  sortControl: {
    width: 170,
  },
  rowGap: {
    height: 2,
  },
});
