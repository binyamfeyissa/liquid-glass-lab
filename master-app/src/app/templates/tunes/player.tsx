import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, IconButton, Slider } from "glacia-native";

import { artistOf, formatTime, trackById } from "./data";
import { useTunes } from "./state";
import { Artwork, Figure, Serif, T, accentColor } from "./ui";

/**
 * The full player. Playback is simulated in the store: a one-second
 * timer advances the position, the Slider seeks, and reaching the end
 * auto-advances through the queue honouring shuffle and repeat.
 */
export default function PlayerScreen() {
  const tunes = useTunes();
  const router = useRouter();
  const { darkMode, backdrop } = tunes;
  const accent = accentColor(backdrop);

  if (!tunes.currentTrackId) {
    return (
      <View style={styles.emptyWrap}>
        <T variant="title">Nothing playing</T>
        <T variant="body" muted style={styles.emptyHint}>
          Pick a track from Home, Search or your Library and it will
          start here
        </T>
        <Button
          accessibilityLabel="Go to Search"
          onPress={() => router.replace("/templates/tunes/search")}
          isDark={darkMode}
          style={styles.emptyButton}
        >
          Find something to play
        </Button>
      </View>
    );
  }

  const track = trackById(tunes.currentTrackId);
  const artist = artistOf(track);
  const liked = tunes.isLiked(track.id);
  const upNextId = tunes.queue[tunes.queueIndex + 1] ?? tunes.queue[0];
  const upNext = upNextId ? trackById(upNextId) : null;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          accessibilityLabel="Back"
          onPress={() => router.back()}
          isDark={darkMode}
          icon={<T variant="heading">⌄</T>}
        />
        <View style={styles.headerText}>
          <T variant="caption" muted>
            Playing from
          </T>
          <T variant="body" numberOfLines={1}>
            {track.album}
          </T>
        </View>
        <IconButton
          accessibilityLabel="View queue"
          onPress={() => router.push("/templates/tunes/queue")}
          isDark={darkMode}
          icon={<T variant="body">☰</T>}
        />
      </View>

      {/* The album's flat plate, set large */}
      <View style={styles.artWrap}>
        <Artwork title={track.title} colors={track.colors} size={280} radius={20} />
      </View>

      {/* Title + artist + like */}
      <View style={styles.titleRow}>
        <View style={styles.flex}>
          <Serif variant="title" numberOfLines={1}>
            {track.title}
          </Serif>
          <Pressable
            onPress={() => router.push(`/templates/tunes/artist/${artist.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`Open artist ${artist.name}`}
          >
            <T variant="body" muted style={styles.artistLink}>
              {artist.name}
            </T>
          </Pressable>
        </View>
        <IconButton
          accessibilityLabel={liked ? `Unlike ${track.title}` : `Like ${track.title}`}
          onPress={() => tunes.toggleLike(track.id)}
          isDark={darkMode}
          size="lg"
          tint={liked ? accent : undefined}
          icon={
            <T variant="heading" style={liked ? { color: accent } : undefined}>
              {liked ? "♥" : "♡"}
            </T>
          }
        />
      </View>

      {/* Seek */}
      <Slider
        value={tunes.position}
        min={0}
        max={track.duration}
        step={1}
        onValueChange={tunes.seek}
        accessibilityLabel={`Seek in ${track.title}`}
        isDark={darkMode}
        style={styles.slider}
      />
      <View style={styles.timeRow}>
        <Figure variant="caption" muted>
          {formatTime(tunes.position)}
        </Figure>
        <Figure variant="caption" muted>
          -{formatTime(track.duration - tunes.position)}
        </Figure>
      </View>

      {/* Transport */}
      <View style={styles.transport}>
        <IconButton
          accessibilityLabel={tunes.shuffle ? "Shuffle on" : "Shuffle off"}
          onPress={tunes.toggleShuffle}
          isDark={darkMode}
          tint={tunes.shuffle ? accent : undefined}
          icon={
            <T variant="body" style={tunes.shuffle ? { color: accent } : undefined}>
              ⇄
            </T>
          }
        />
        <IconButton
          accessibilityLabel="Previous track"
          onPress={tunes.prev}
          isDark={darkMode}
          size="lg"
          icon={<T variant="heading">⏮</T>}
        />
        <Button
          accessibilityLabel={tunes.isPlaying ? "Pause" : "Play"}
          onPress={tunes.togglePlay}
          isDark={darkMode}
          shape="circle"
          size="lg"
          variant="filled"
          style={styles.playButton}
        >
          <T variant="title" style={{ color: "#ffffff" }}>
            {tunes.isPlaying ? "❚❚" : "▶"}
          </T>
        </Button>
        <IconButton
          accessibilityLabel="Next track"
          onPress={() => tunes.next(true)}
          isDark={darkMode}
          size="lg"
          icon={<T variant="heading">⏭</T>}
        />
        <IconButton
          accessibilityLabel={
            tunes.repeat === "off"
              ? "Repeat off"
              : tunes.repeat === "all"
                ? "Repeat all"
                : "Repeat this track"
          }
          onPress={tunes.cycleRepeat}
          isDark={darkMode}
          tint={tunes.repeat !== "off" ? accent : undefined}
          icon={
            <View style={styles.repeatIcon}>
              <T
                variant="body"
                style={tunes.repeat !== "off" ? { color: accent } : undefined}
              >
                ↻
              </T>
              {tunes.repeat === "one" ? (
                <Figure
                  variant="caption"
                  style={{ color: accent, marginLeft: 2 }}
                >
                  1
                </Figure>
              ) : null}
            </View>
          }
        />
      </View>
      <T variant="caption" muted style={styles.modeNote}>
        {tunes.shuffle ? "Shuffle on" : "Shuffle off"} ·{" "}
        {tunes.repeat === "off"
          ? "Repeat off"
          : tunes.repeat === "all"
            ? "Repeat all"
            : "Repeat one"}
      </T>

      {/* Add to playlist + queue */}
      <View style={styles.actions}>
        <Button
          accessibilityLabel={`Add ${track.title} to a playlist`}
          onPress={() => router.push("/templates/tunes/add-to-playlist")}
          isDark={darkMode}
          variant="glass"
        >
          Add to playlist
        </Button>
        <Button
          accessibilityLabel="Open the queue"
          onPress={() => router.push("/templates/tunes/queue")}
          isDark={darkMode}
          variant="ghost"
        >
          Queue
        </Button>
      </View>

      {upNext && tunes.queue.length > 1 ? (
        <Pressable
          onPress={() => tunes.next(true)}
          accessibilityRole="button"
          accessibilityLabel={`Play next: ${upNext.title}`}
          style={styles.upNext}
        >
          <T variant="caption" muted>
            Up next
          </T>
          <T variant="body" numberOfLines={1}>
            {upNext.title} · {artistOf(upNext).name}
          </T>
        </Pressable>
      ) : null}
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
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyHint: { textAlign: "center" },
  emptyButton: { marginTop: 8 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerText: { flex: 1, alignItems: "center" },
  artWrap: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  flex: { flex: 1 },
  artistLink: { marginTop: 4 },
  slider: { marginTop: 24 },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  transport: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingHorizontal: 4,
  },
  playButton: {
    width: 72,
    height: 72,
  },
  repeatIcon: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  modeNote: {
    textAlign: "center",
    marginTop: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
  },
  upNext: {
    marginTop: 24,
    alignItems: "center",
    gap: 4,
  },
});
