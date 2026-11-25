import React, { type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import {
  colors,
  IconButton
} from "glacia-native";
import { ChevronLeft } from "lucide-react-native";

import { artistOf, formatTime, trackById } from "./data";
import { useTunes } from "./state";
import {
  Artwork,
  Figure,
  ListCard,
  SectionTitle,
  Serif,
  T,
  TrackRow,
  pressedColor,
} from "./ui";

/**
 * The queue: what's playing now and what the engine will play next, in
 * the queue's real (possibly shuffled) order. Tapping an upcoming
 * track jumps straight to it; the list re-renders live when shuffle or
 * repeat changes in the player.
 */
export default function QueueScreen() {
  const tunes = useTunes();
  const router = useRouter();
  const { darkMode } = tunes;

  const shell = (children: ReactNode) => (
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
      <T variant="title">Queue</T>
      {children}
    </ScrollView>
  );

  if (!tunes.currentTrackId || tunes.queue.length === 0) {
    return shell(
      <ListCard style={styles.block}>
        <View style={styles.note}>
          <T variant="body">Nothing is queued yet</T>
          <T variant="caption" muted style={styles.noteSub}>
            Play any track and its list becomes the queue
          </T>
        </View>
      </ListCard>,
    );
  }

  const current = trackById(tunes.currentTrackId);
  const upcoming = tunes.queue
    .map((id, index) => ({ id, index }))
    .filter(({ index }) => index > tunes.queueIndex);
  const earlier = tunes.queue
    .map((id, index) => ({ id, index }))
    .filter(({ index }) => index < tunes.queueIndex);

  return shell(
    <>
      <T variant="body" muted style={styles.subtitle}>
        {tunes.queue.length} tracks · {tunes.shuffle ? "shuffled" : "in order"} ·
        repeat {tunes.repeat}
      </T>

      <View style={styles.block}>
        <SectionTitle>Now playing</SectionTitle>
        <ListCard>
          <TrackRow track={current} onPress={() => router.push("/templates/tunes/player")} />
        </ListCard>
      </View>

      {tunes.repeat === "one" ? (
        <ListCard style={styles.block}>
          <View style={styles.note}>
            <T variant="body">Repeat one is on</T>
            <T variant="caption" muted style={styles.noteSub}>
              {current.title} will start over when it ends, until you skip
              or turn repeat off in the player
            </T>
          </View>
        </ListCard>
      ) : null}

      {upcoming.length > 0 ? (
        <View style={styles.block}>
          <SectionTitle>Up next</SectionTitle>
          <ListCard>
            {upcoming.map(({ id, index }, i) => {
              const track = trackById(id);
              return (
                <View key={`${id}-${index}`}>
                  {i > 0 ? <View style={styles.rowGap} /> : null}
                  <Pressable
                    onPress={() => tunes.jumpToQueueIndex(index)}
                    accessibilityRole="button"
                    accessibilityLabel={`Play ${track.title} now`}
                    style={({ pressed }) => [
                      styles.queueRow,
                      pressed && { backgroundColor: pressedColor(darkMode) },
                    ]}
                  >
                    <Figure variant="caption" muted style={styles.position}>
                      {index + 1}
                    </Figure>
                    <Artwork title={track.title} colors={track.colors} size={44} />
                    <View style={styles.flex}>
                      <Serif variant="body" numberOfLines={1}>
                        {track.title}
                      </Serif>
                      <T variant="caption" muted>
                        {artistOf(track).name}
                      </T>
                    </View>
                    <Figure variant="caption" muted>
                      {formatTime(track.duration)}
                    </Figure>
                  </Pressable>
                </View>
              );
            })}
          </ListCard>
        </View>
      ) : (
        <ListCard style={styles.block}>
          <View style={styles.note}>
            <T variant="body">
              {tunes.repeat === "all"
                ? "This is the last track — repeat all wraps back to the top"
                : "This is the last track in the queue"}
            </T>
          </View>
        </ListCard>
      )}

      {earlier.length > 0 ? (
        <View style={styles.block}>
          <SectionTitle>Already played in this queue</SectionTitle>
          <ListCard>
            {earlier.map(({ id, index }, i) => {
              const track = trackById(id);
              return (
                <View key={`${id}-${index}`}>
                  {i > 0 ? <View style={styles.rowGap} /> : null}
                  <TrackRow
                    track={track}
                    onPress={() => tunes.jumpToQueueIndex(index)}
                  />
                </View>
              );
            })}
          </ListCard>
        </View>
      ) : null}
    </>,
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 32,
  },
  header: { marginBottom: 8 },
  subtitle: { marginTop: 8 },
  block: { marginTop: 24 },
  note: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 4,
  },
  noteSub: { marginTop: 4 },
  queueRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
    borderRadius: 12,
  },
  position: { width: 20, textAlign: "center" },
  rowGap: { height: 2 },
});
