import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  colors,
  Button, IconButton
} from "glacia-native";
import { ChevronLeft, X } from "lucide-react-native";

import { formatLongDuration, trackById } from "../data";
import { LIKED_PLAYLIST_ID, useTunes, type Playlist } from "../state";
import { Artwork, Figure, ListCard, Serif, T, TrackRow } from "../ui";

/**
 * Playlist detail. The reserved "liked" id renders the automatic Liked
 * Songs playlist, whose contents come from the store's liked set rather
 * than a stored track list — so unliking a track here removes it, via
 * the same removeFromPlaylist path as any other playlist.
 */
export default function PlaylistScreen() {
  const tunes = useTunes();
  const router = useRouter();
  const { darkMode } = tunes;
  const { id } = useLocalSearchParams<{ id: string }>();

  const isLiked = id === LIKED_PLAYLIST_ID;
  const stored = id ? tunes.playlistById(id) : undefined;

  const playlist: Playlist | null = isLiked
    ? {
        id: LIKED_PLAYLIST_ID,
        name: "Liked Songs",
        description: "Every track you liked, in one place",
        trackIds: tunes.likedIds,
        colors: ["#db2777", "#7c3aed"],
      }
    : (stored ?? null);

  if (!playlist) {
    return (
      <View style={styles.emptyWrap}>
        <T variant="title">Playlist not found</T>
        <T variant="body" muted style={styles.emptyHint}>
          It may have been part of the fixtures that ship with the template
        </T>
        <Button
          accessibilityLabel="Back to Library"
          onPress={() => router.back()}
          isDark={darkMode}
          style={styles.emptyButton}
        >
          Back
        </Button>
      </View>
    );
  }

  const tracks = playlist.trackIds.map(trackById);
  const totalSeconds = tracks.reduce((sum, t) => sum + t.duration, 0);

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
          icon={<ChevronLeft size={20} color={darkMode ? colors.dark.foreground : colors.light.foreground} />}
        />
      </View>

      <View style={styles.hero}>
        <Artwork title={playlist.name} colors={playlist.colors} size={150} radius={20} />
        <Serif variant="title" style={styles.heroTitle}>
          {playlist.name}
        </Serif>
        <T variant="body" muted style={styles.heroSub}>
          {playlist.description}
        </T>
        <Figure variant="caption" muted>
          {tracks.length} tracks · {formatLongDuration(totalSeconds)}
        </Figure>
      </View>

      {tracks.length > 0 ? (
        <Button
          accessibilityLabel={`Play all of ${playlist.name}`}
          onPress={() => tunes.playTrack(tracks[0].id, playlist.trackIds)}
          isDark={darkMode}
          variant="filled"
          style={styles.playAll}
        >
          Play all
        </Button>
      ) : null}

      {tracks.length === 0 ? (
        <ListCard style={styles.block}>
          <View style={styles.note}>
            <T variant="body">No tracks yet</T>
            <T variant="caption" muted style={styles.noteSub}>
              {isLiked
                ? "Like a track and it will land here"
                : "Add tracks from the player with Add to playlist"}
            </T>
          </View>
        </ListCard>
      ) : (
        <ListCard style={styles.block}>
          {tracks.map((track, i) => (
            <View key={track.id}>
              {i > 0 ? <View style={styles.rowGap} /> : null}
              <View style={styles.trackLine}>
                <View style={styles.flex}>
                  <TrackRow track={track} contextIds={playlist.trackIds} />
                </View>
                <IconButton
                  accessibilityLabel={`Remove ${track.title} from ${playlist.name}`}
                  onPress={() => tunes.removeFromPlaylist(playlist.id, track.id)}
                  isDark={darkMode}
                  size="sm"
                  icon={
                    <X
                      size={16}
                      color={darkMode ? colors.dark.muted : colors.light.muted}
                    />
                  }
                />
              </View>
            </View>
          ))}
        </ListCard>
      )}
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
  header: { marginBottom: 8 },
  hero: {
    alignItems: "center",
    gap: 8,
  },
  heroTitle: { marginTop: 12, textAlign: "center" },
  heroSub: { textAlign: "center" },
  playAll: { marginTop: 24 },
  block: { marginTop: 24 },
  note: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 4,
  },
  noteSub: { marginTop: 4 },
  trackLine: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 12,
  },
  flex: { flex: 1 },
  rowGap: { height: 2 },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyHint: { textAlign: "center" },
  emptyButton: { marginTop: 8 },
});
