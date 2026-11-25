import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, Button, Card, IconButton } from "glacia-native";
import { ChevronLeft, X } from "lucide-react-native";

import { episodeById, formatDuration, showById } from "./data";
import { useCast } from "./state";
import { Artwork, Figure, ListCard, SectionTitle, T, accentColor } from "./ui";

/**
 * The up-next queue. When the current episode finishes, the store
 * plays the head of this list automatically. Tap any row to jump
 * straight to it; the remove button takes it back out.
 */
export default function QueueScreen() {
  const cast = useCast();
  const router = useRouter();
  const { darkMode } = cast;

  const current = cast.currentEpisodeId
    ? episodeById(cast.currentEpisodeId)
    : null;
  const queued = cast.queue.map(episodeById);

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
          icon={<ChevronLeft size={20} color={colors[darkMode ? "dark" : "light"].foreground} />}
        />
        <T variant="title">Up next</T>
      </View>

      {current ? (
        <View>
          <SectionTitle>Now playing</SectionTitle>
          <Card
            isDark={darkMode}
            padding={14}
            onPress={() => router.push("/templates/cast/player")}
            accessibilityLabel={`Now playing: ${current.title}. Open the player.`}
          >
            <View style={styles.rowInner}>
              <Artwork
                title={showById(current.showId).title}
                colors={showById(current.showId).colors}
                size={52}
              />
              <View style={styles.flex}>
                <T variant="body" numberOfLines={2}>
                  {current.title}
                </T>
                <T variant="caption" muted>
                  {showById(current.showId).title}
                </T>
              </View>
              <T variant="label" style={{ color: accentColor(cast.backdrop) }}>
                {cast.isPlaying ? "Playing" : "Paused"}
              </T>
            </View>
          </Card>
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionTitle>Queue · {queued.length}</SectionTitle>
        {queued.length > 0 ? (
          <>
            <ListCard>
              {queued.map((episode, i) => {
                const show = showById(episode.showId);
                return (
                  <View key={episode.id}>
                    {i > 0 ? <View style={styles.rowGap} /> : null}
                    <Pressable
                      onPress={() => {
                        cast.removeFromQueue(episode.id);
                        cast.playEpisode(episode.id);
                        router.push("/templates/cast/player");
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Play ${episode.title} now`}
                      style={({ pressed }) => [
                        styles.queueRow,
                        pressed && {
                          backgroundColor: darkMode
                            ? "rgba(255,255,255,0.08)"
                            : "rgba(0,0,0,0.05)",
                        },
                      ]}
                    >
                      <Figure variant="caption" muted style={styles.queueIndex}>
                        {i + 1}
                      </Figure>
                      <Artwork title={show.title} colors={show.colors} size={48} />
                      <View style={styles.flex}>
                        <T variant="body" numberOfLines={2}>
                          {episode.title}
                        </T>
                        <View style={styles.metaLine}>
                          <T variant="caption" muted>
                            {show.title} ·
                          </T>
                          <Figure variant="caption" muted>
                            {formatDuration(episode.duration)}
                          </Figure>
                        </View>
                      </View>
                      <IconButton
                        accessibilityLabel={`Remove ${episode.title} from queue`}
                        onPress={() => cast.removeFromQueue(episode.id)}
                        isDark={darkMode}
                        size="sm"
                        icon={<X size={16} color={colors[darkMode ? "dark" : "light"].foreground} />}
                      />
                    </Pressable>
                  </View>
                );
              })}
            </ListCard>
            <Button
              accessibilityLabel="Clear the whole queue"
              onPress={() => {
                for (const id of [...cast.queue]) cast.removeFromQueue(id);
              }}
              isDark={darkMode}
              variant="ghost"
              style={styles.clearButton}
            >
              Clear queue
            </Button>
          </>
        ) : (
          <Card isDark={darkMode} padding={16}>
            <T variant="body">Your queue is empty.</T>
            <T variant="caption" muted style={styles.emptyHint}>
              Add an episode from any list and it will play when the
              current episode ends.
            </T>
            <Button
              accessibilityLabel="Browse shows in Discover"
              onPress={() => router.replace("/templates/cast/discover")}
              isDark={darkMode}
              style={styles.emptyButton}
            >
              Find episodes
            </Button>
          </Card>
        )}
      </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  section: {
    marginTop: 24,
  },
  rowInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  rowGap: {
    height: 2,
  },
  queueRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
    borderRadius: 12,
  },
  metaLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  queueIndex: {
    width: 16,
    textAlign: "center",
  },
  clearButton: {
    marginTop: 12,
    alignSelf: "center",
  },
  emptyHint: {
    marginTop: 4,
  },
  emptyButton: {
    marginTop: 12,
    alignSelf: "flex-start",
  },
});
