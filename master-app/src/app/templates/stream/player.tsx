import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import {
  colors,
  Button, Card, IconButton, Slider
} from "glacia-native";
import { ChevronLeft, Pause, Play } from "lucide-react-native";

import {
  QUALITY_OPTIONS,
  episodeRef,
  formatTime,
  nextEpisode,
  ownerOf,
  playableDuration,
  playableLabel,
} from "./data";
import { useStream } from "./state";
import { Artwork, Figure, T, accentColor } from "./ui";

/**
 * The simulated player. There is no video: a composed poster panel, a
 * big play/pause, and the store's one-second heartbeat advancing the
 * position. The position is written to the progress map every second,
 * so leaving mid-episode and tapping Resume anywhere picks up exactly
 * here. When a playable runs out, the store flags it ended and this
 * screen offers the next episode — autoplaying it after a countdown
 * when the viewer's autoplay setting is on.
 */
export default function PlayerScreen() {
  const stream = useStream();
  const router = useRouter();
  const { darkMode } = stream;
  const playableId = stream.currentPlayableId;

  const [autoCancelled, setAutoCancelled] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const owner = playableId ? ownerOf(playableId) : null;
  const ref = playableId ? episodeRef(playableId) : null;
  const nextEp =
    owner && playableId && owner.kind === "series"
      ? nextEpisode(owner, playableId)
      : null;
  const ended = playableId !== null && stream.endedPlayableId === playableId;
  const showUpNext = ended && nextEp !== null;

  /* A new playable resets the autoplay opt-out. */
  useEffect(() => {
    setAutoCancelled(false);
  }, [playableId]);

  /* The autoplay countdown: five seconds on the Up Next card, then the
     next episode starts. Seeking back or cancelling stops it. */
  useEffect(() => {
    if (!showUpNext || !stream.autoplayNext || autoCancelled) {
      setCountdown(null);
      return;
    }
    setCountdown(5);
    const timer = setInterval(() => {
      setCountdown((c) => (c === null || c <= 0 ? c : c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [showUpNext, stream.autoplayNext, autoCancelled, playableId]);

  const playRef = useRef(stream.playPlayable);
  playRef.current = stream.playPlayable;

  useEffect(() => {
    if (countdown === 0 && nextEp) {
      playRef.current(nextEp.id);
      setCountdown(null);
    }
  }, [countdown, nextEp]);

  if (!playableId || !owner) {
    return (
      <View style={styles.emptyWrap}>
        <T variant="title">Nothing playing</T>
        <T variant="body" muted style={styles.emptyHint}>
          Pick a film or an episode and it will start here — your place is
          kept if you leave and come back.
        </T>
        <Button
          accessibilityLabel="Go to Browse"
          onPress={() => router.replace("/templates/stream/browse")}
          isDark={darkMode}
          style={styles.emptyButton}
        >
          Find something to watch
        </Button>
      </View>
    );
  }

  const duration = playableDuration(playableId);
  const qualityLabel =
    QUALITY_OPTIONS.find((q) => q.value === stream.quality)?.label ?? "Auto";

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
          icon={<ChevronLeft size={20} color={darkMode ? colors.dark.foreground : colors.light.foreground} />}
        />
        <View style={styles.headerText}>
          <T variant="caption" muted>
            Now playing · Simulated
          </T>
          <T variant="body" numberOfLines={1}>
            {owner.name}
          </T>
        </View>
        <Figure variant="caption" muted>
          {qualityLabel}
        </Figure>
      </View>

      {/* Poster panel with the big play/pause */}
      <View style={styles.posterWrap}>
        <Artwork
          name={owner.name}
          colors={owner.colors}
          width={336}
          height={210}
          radius={20}
        />
        <View style={styles.posterButton}>
          <Button
            accessibilityLabel={stream.isPlaying ? "Pause" : ended ? "Watch again" : "Play"}
            onPress={stream.togglePlay}
            isDark={darkMode}
            shape="circle"
            size="lg"
            variant="filled"
            style={styles.bigPlay}
          >
            {stream.isPlaying ? (
              <Pause size={24} color="#ffffff" />
            ) : (
              <Play size={24} color="#ffffff" />
            )}
          </Button>
        </View>
      </View>

      {/* What's playing */}
      <T variant="title" numberOfLines={2} style={styles.titleText}>
        {ref ? ref.episode.title : owner.name}
      </T>
      <T variant="body" muted style={styles.subText}>
        {owner.name} · {playableLabel(playableId)} · {owner.rating}
      </T>
      {ref ? (
        <T variant="caption" muted style={styles.subText}>
          {ref.episode.synopsis}
        </T>
      ) : null}

      {/* Seek */}
      <Slider
        value={stream.position}
        min={0}
        max={duration}
        step={1}
        onValueChange={stream.seek}
        accessibilityLabel={`Seek in ${owner.name}`}
        isDark={darkMode}
        style={styles.slider}
      />
      <View style={styles.timeRow}>
        <Figure variant="caption" muted>
          {formatTime(stream.position)}
        </Figure>
        <Figure variant="caption" muted>
          -{formatTime(duration - stream.position)}
        </Figure>
      </View>

      {/* Transport */}
      <View style={styles.transport}>
        <Button
          accessibilityLabel="Back 10 seconds"
          variant="glass"
          isDark={darkMode}
          onPress={() => stream.skipBy(-10)}
        >
          −10s
        </Button>
        <Button
          accessibilityLabel={stream.isPlaying ? "Pause" : "Play"}
          variant="glass"
          isDark={darkMode}
          onPress={stream.togglePlay}
        >
          {stream.isPlaying ? "Pause" : "Play"}
        </Button>
        <Button
          accessibilityLabel="Forward 10 seconds"
          variant="glass"
          isDark={darkMode}
          onPress={() => stream.skipBy(10)}
        >
          +10s
        </Button>
      </View>

      {/* End state: Up Next for series, a finish card otherwise */}
      {showUpNext && nextEp ? (
        <Card isDark={darkMode} padding={20} style={styles.endCard}>
          <T variant="label" muted>
            Up next
          </T>
          <T variant="heading">
            {nextEp.title}
          </T>
          <T variant="body" muted numberOfLines={2}>
            {nextEp.synopsis}
          </T>
          {countdown !== null ? (
            <Figure variant="body" style={{ color: accentColor(stream.backdrop) }}>
              Starting in {countdown}
            </Figure>
          ) : null}
          <View style={styles.endActions}>
            <Button
              accessibilityLabel={`Play next episode: ${nextEp.title}`}
              variant="filled"
              isDark={darkMode}
              onPress={() => stream.playPlayable(nextEp.id)}
            >
              Play next
            </Button>
            {countdown !== null ? (
              <Button
                accessibilityLabel="Cancel autoplay"
                variant="ghost"
                isDark={darkMode}
                onPress={() => setAutoCancelled(true)}
              >
                Cancel
              </Button>
            ) : null}
          </View>
        </Card>
      ) : ended ? (
        <Card isDark={darkMode} padding={20} style={styles.endCard}>
          <T variant="label" muted>
            Finished
          </T>
          <T variant="heading">
            {owner.kind === "series"
              ? `You've finished ${owner.name}`
              : `You finished ${owner.name}`}
          </T>
          <T variant="body" muted>
            {owner.kind === "series"
              ? "That was the last episode. It's marked watched in your progress."
              : "It's marked watched — find it any time on the title page to watch again."}
          </T>
          <View style={styles.endActions}>
            <Button
              accessibilityLabel={`Back to ${owner.name}`}
              variant="filled"
              isDark={darkMode}
              onPress={() => router.replace(`/templates/stream/title/${owner.id}`)}
            >
              Title page
            </Button>
            <Button
              accessibilityLabel="Browse more titles"
              variant="ghost"
              isDark={darkMode}
              onPress={() => router.replace("/templates/stream/browse")}
            >
              Browse more
            </Button>
          </View>
        </Card>
      ) : null}

      {/* Jump back to the title page */}
      {!ended ? (
        <Button
          accessibilityLabel={`Open the title page for ${owner.name}`}
          variant="ghost"
          isDark={darkMode}
          onPress={() => router.push(`/templates/stream/title/${owner.id}`)}
          style={styles.titlePageButton}
        >
          About this {owner.kind === "movie" ? "film" : "series"}
        </Button>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 36,
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyHint: { textAlign: "center" },
  emptyButton: { marginTop: 10 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerText: { flex: 1, alignItems: "center" },
  posterWrap: {
    alignItems: "center",
    marginTop: 28,
  },
  posterButton: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  bigPlay: {
    width: 74,
    height: 74,
  },
  titleText: {
    marginTop: 24,
  },
  subText: {
    marginTop: 4,
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
    justifyContent: "center",
    gap: 12,
    marginTop: 18,
  },
  endCard: {
    marginTop: 24,
    gap: 8,
  },
  endActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  titlePageButton: {
    marginTop: 22,
    alignSelf: "center",
  },
});
