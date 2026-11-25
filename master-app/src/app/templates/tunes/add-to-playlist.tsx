import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import {
  colors,
  Button, IconButton
} from "glacia-native";
import { Check, ChevronLeft, Plus } from "lucide-react-native";

import { artistOf, trackById } from "./data";
import { useTunes } from "./state";
import {
  Artwork,
  ListCard,
  Serif,
  T,
  accentColor,
  pressedColor,
} from "./ui";

/**
 * Add-to-playlist picker for the track loaded in the player. Tapping a
 * playlist toggles the track's membership — the checkmark and count
 * update in place, and the change is live in the Library immediately.
 */
export default function AddToPlaylistScreen() {
  const tunes = useTunes();
  const router = useRouter();
  const { darkMode, backdrop } = tunes;
  const accent = accentColor(backdrop);

  if (!tunes.currentTrackId) {
    return (
      <View style={styles.emptyWrap}>
        <T variant="title">No track selected</T>
        <T variant="body" muted style={styles.emptyHint}>
          Start a track in the player, then add it to a playlist
        </T>
        <Button
          accessibilityLabel="Back"
          onPress={() => router.back()}
          isDark={darkMode}
          style={styles.emptyButton}
        >
          Back
        </Button>
      </View>
    );
  }

  const track = trackById(tunes.currentTrackId);

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
      <T variant="title">Add to playlist</T>
      <T variant="body" muted style={styles.subtitle}>
        {track.title} · {artistOf(track).name}
      </T>

      <ListCard style={styles.block}>
        {tunes.playlists.map((playlist, i) => {
          const included = playlist.trackIds.includes(track.id);
          return (
            <View key={playlist.id}>
              {i > 0 ? <View style={styles.rowGap} /> : null}
              <Pressable
                onPress={() =>
                  included
                    ? tunes.removeFromPlaylist(playlist.id, track.id)
                    : tunes.addToPlaylist(playlist.id, track.id)
                }
                accessibilityRole="button"
                accessibilityLabel={
                  included
                    ? `Remove ${track.title} from ${playlist.name}`
                    : `Add ${track.title} to ${playlist.name}`
                }
                style={({ pressed }) => [
                  styles.row,
                  pressed && { backgroundColor: pressedColor(darkMode) },
                ]}
              >
                <Artwork title={playlist.name} colors={playlist.colors} size={48} />
                <View style={styles.flex}>
                  <Serif variant="body" numberOfLines={1}>
                    {playlist.name}
                  </Serif>
                  <T variant="caption" muted>
                    {playlist.trackIds.length} tracks
                  </T>
                </View>
                {included ? (
                  <Check size={18} color={accent} />
                ) : (
                  <Plus size={18} color={darkMode ? colors.dark.muted : colors.light.muted} />
                )}
              </Pressable>
            </View>
          );
        })}
      </ListCard>

      <Button
        accessibilityLabel="Done"
        onPress={() => router.back()}
        isDark={darkMode}
        style={styles.doneButton}
      >
        Done
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 32,
  },
  header: { marginBottom: 8 },
  subtitle: { marginTop: 8 },
  block: { marginTop: 24 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
    borderRadius: 12,
  },
  rowGap: { height: 2 },
  flex: { flex: 1 },
  doneButton: { marginTop: 24 },
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
