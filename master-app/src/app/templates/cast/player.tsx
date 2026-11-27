import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, Button, IconButton, SegmentedControl, Select, Slider } from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Menu01Icon from "@hugeicons/core-free-icons/Menu01Icon";
import PauseIcon from "@hugeicons/core-free-icons/PauseIcon";
import PlayIcon from "@hugeicons/core-free-icons/PlayIcon";
import SkipBackIcon from "@hugeicons/core-free-icons/SkipBackIcon";
import SkipForwardIcon from "@hugeicons/core-free-icons/SkipForwardIcon";
import {
  SLEEP_TIMER_OPTIONS,
  SPEED_OPTIONS,
  episodeById,
  formatDuration,
  formatTime,
  showById,
} from "./data";
import { useCast } from "./state";
import { Artwork, Figure, T } from "./ui";

/**
 * The full player. Playback is simulated in the store: a 250 ms timer
 * advances the position by the selected speed, the Slider seeks, the
 * skip buttons jump ±15/±30 s, and reaching the end marks the episode
 * played and pulls the next one from the queue.
 */
export default function PlayerScreen() {
  const cast = useCast();
  const router = useRouter();
  const { darkMode } = cast;

  if (!cast.currentEpisodeId) {
    return (
      <View style={styles.emptyWrap}>
        <T variant="title">Nothing playing</T>
        <T variant="body" muted style={styles.emptyHint}>
          Pick an episode from Home, Discover or your Library and it
          will start here.
        </T>
        <Button
          accessibilityLabel="Go to Discover"
          onPress={() => router.replace("/templates/cast/discover")}
          isDark={darkMode}
          style={styles.emptyButton}
        >
          Find something to hear
        </Button>
      </View>
    );
  }

  const episode = episodeById(cast.currentEpisodeId);
  const show = showById(episode.showId);
  const played = cast.isPlayed(episode.id);
  const queued = cast.isQueued(episode.id);
  const download = cast.downloadProgressOf(episode.id);
  const downloading = download !== undefined && download < 100;
  const downloaded = cast.isDownloaded(episode.id);
  const upNextId = cast.queue.find((qid) => qid !== episode.id) ?? cast.queue[0];
  const upNext = upNextId ? episodeById(upNextId) : null;

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
            Now playing
          </T>
          <T variant="body" numberOfLines={1}>
            {show.title}
          </T>
        </View>
        <IconButton
          accessibilityLabel="View queue"
          onPress={() => router.push("/templates/cast/queue")}
          isDark={darkMode}
          icon={<HugeiconsIcon icon={Menu01Icon} size={16} color={colors[darkMode ? "dark" : "light"].foreground} />}
        />
      </View>

      {/* Composed show artwork */}
      <View style={styles.artWrap}>
        <Artwork title={show.title} colors={show.colors} size={260} radius={20} image={show.image} />
      </View>

      {/* Title block */}
      <T variant="title">
        {episode.title}
      </T>
      <Pressable
        onPress={() => router.push(`/templates/cast/show/${show.id}`)}
        accessibilityRole="button"
        accessibilityLabel={`Open the show ${show.title}`}
        style={styles.metaLine}
      >
        <T variant="body" muted>
          {show.title} · {episode.dateLabel} ·
        </T>
        <Figure variant="body" muted>
          {formatDuration(episode.duration)}
        </Figure>
        {played ? (
          <T variant="body" muted>
            · Played
          </T>
        ) : null}
      </Pressable>
      <T variant="body" muted style={styles.description}>
        {episode.description}
      </T>

      {/* Seek */}
      <Slider
        value={Math.floor(cast.position)}
        min={0}
        max={episode.duration}
        step={1}
        onValueChange={cast.seek}
        accessibilityLabel={`Seek in ${episode.title}`}
        isDark={darkMode}
        style={styles.slider}
      />
      <View style={styles.timeRow}>
        <Figure variant="body" muted>
          {formatTime(cast.position)}
        </Figure>
        <Figure variant="body" muted>
          -{formatTime(episode.duration - cast.position)}
        </Figure>
      </View>

      {/* Transport: episode prev/next around the ±skip pair */}
      <View style={styles.transport}>
        <IconButton
          accessibilityLabel="Previous episode"
          onPress={cast.prevEpisode}
          isDark={darkMode}
          size="lg"
          icon={<HugeiconsIcon icon={SkipBackIcon} size={20} color={colors[darkMode ? "dark" : "light"].foreground} />}
        />
        <IconButton
          accessibilityLabel="Back 15 seconds"
          onPress={() => cast.skipBy(-15)}
          isDark={darkMode}
          size="lg"
          icon={<Figure variant="body">-15</Figure>}
        />
        <Button
          accessibilityLabel={cast.isPlaying ? "Pause" : "Play"}
          onPress={cast.togglePlay}
          isDark={darkMode}
          shape="circle"
          size="lg"
          variant="filled"
          style={styles.playButton}
        >
          {cast.isPlaying ? <HugeiconsIcon icon={PauseIcon} size={28} color="#FFFFFF" /> : <HugeiconsIcon icon={PlayIcon} size={28} color="#FFFFFF" />}
        </Button>
        <IconButton
          accessibilityLabel="Forward 30 seconds"
          onPress={() => cast.skipBy(30)}
          isDark={darkMode}
          size="lg"
          icon={<Figure variant="body">+30</Figure>}
        />
        <IconButton
          accessibilityLabel="Next episode"
          onPress={cast.nextEpisode}
          isDark={darkMode}
          size="lg"
          icon={<HugeiconsIcon icon={SkipForwardIcon} size={20} color={colors[darkMode ? "dark" : "light"].foreground} />}
        />
      </View>
      <View style={styles.skipRow}>
        <Button
          accessibilityLabel="Back 30 seconds"
          onPress={() => cast.skipBy(-30)}
          isDark={darkMode}
          variant="ghost"
          size="sm"
        >
          −30 sec
        </Button>
        <Button
          accessibilityLabel="Forward 15 seconds"
          onPress={() => cast.skipBy(15)}
          isDark={darkMode}
          variant="ghost"
          size="sm"
        >
          +15 sec
        </Button>
      </View>

      {/* Speed */}
      <T variant="label" muted style={styles.controlLabel}>
        Playback speed
      </T>
      <SegmentedControl
        segments={SPEED_OPTIONS.map((s) => `${s}×`)}
        selectedIndex={cast.speedIndex}
        onChange={cast.setSpeedIndex}
        accessibilityLabel="Playback speed"
        isDark={darkMode}
      />

      {/* Sleep timer */}
      <T variant="label" muted style={styles.controlLabel}>
        Sleep timer
      </T>
      <Select
        value={cast.sleepTimer}
        onValueChange={cast.setSleepTimer}
        options={SLEEP_TIMER_OPTIONS}
        accessibilityLabel="Sleep timer"
        isDark={darkMode}
      />
      {cast.sleepRemainingSec !== null ? (
        <View style={styles.sleepNoteRow}>
          <T variant="caption" muted>
            Playback stops in
          </T>
          <Figure variant="caption" muted>
            {formatTime(cast.sleepRemainingSec)}
          </Figure>
        </View>
      ) : cast.sleepTimer === "episode" ? (
        <T variant="caption" muted style={styles.sleepNote}>
          Playback stops at the end of this episode
        </T>
      ) : null}

      {/* Episode actions */}
      <View style={styles.actions}>
        <Button
          accessibilityLabel={
            played ? `Mark ${episode.title} as unplayed` : `Mark ${episode.title} as played`
          }
          onPress={() =>
            played ? cast.markUnplayed(episode.id) : cast.markPlayed(episode.id)
          }
          isDark={darkMode}
          variant="glass"
          style={styles.actionButton}
        >
          {played ? "Mark unplayed" : "Mark played"}
        </Button>
        <Button
          accessibilityLabel={
            queued ? `Remove ${episode.title} from queue` : `Add ${episode.title} to queue`
          }
          onPress={() =>
            queued
              ? cast.removeFromQueue(episode.id)
              : cast.addToQueue(episode.id)
          }
          isDark={darkMode}
          variant="glass"
          style={styles.actionButton}
        >
          {queued ? "In queue" : "Add to queue"}
        </Button>
        <Button
          accessibilityLabel={
            downloaded
              ? `Remove download of ${episode.title}`
              : `Download ${episode.title}`
          }
          onPress={() => {
            if (downloaded) cast.removeDownload(episode.id);
            else if (!downloading) cast.startDownload(episode.id);
          }}
          isDark={darkMode}
          variant="glass"
          style={styles.actionButton}
        >
          {downloaded
            ? "Downloaded"
            : downloading
              ? `${Math.floor(download)}%`
              : "Download"}
        </Button>
      </View>

      {upNext ? (
        <Pressable
          onPress={() => router.push("/templates/cast/queue")}
          accessibilityRole="button"
          accessibilityLabel={`Up next: ${upNext.title}. Open the queue.`}
          style={styles.upNext}
        >
          <T variant="caption" muted>
            Up next
          </T>
          <T variant="body" numberOfLines={1}>
            {upNext.title} · {showById(upNext.showId).title}
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
    paddingTop: 112,
    paddingBottom: 32,
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyHint: { textAlign: "center" },
  emptyButton: { marginTop: 12 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerText: { flex: 1, alignItems: "center" },
  artWrap: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 24,
  },
  metaLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  description: {
    marginTop: 12,
    lineHeight: 20,
  },
  slider: { marginTop: 20 },
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
    paddingHorizontal: 2,
  },
  playButton: {
    width: 72,
    height: 72,
  },
  skipRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  controlLabel: {
    marginTop: 24,
    marginBottom: 8,
  },
  sleepNote: {
    marginTop: 8,
  },
  sleepNoteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 24,
  },
  actionButton: {
    flexGrow: 1,
  },
  upNext: {
    marginTop: 24,
    alignItems: "center",
    gap: 4,
  },
});
