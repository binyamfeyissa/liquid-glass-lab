import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  colors,
  Badge, Button, IconButton, Progress, Select
} from "glacia-native";
import { Check, ChevronLeft, Download, Play } from "lucide-react-native";

import {
  formatRuntime,
  formatSize,
  formatTime,
  titleById,
  type Episode,
} from "../data";
import { useStream } from "../state";
import { Artwork, Figure, ListCard, RowSeparator, SectionTitle, T, accentColor } from "../ui";

/** One episode row: tap to play, with progress and its own download. */
function EpisodeRow({
  episode,
  number,
  onPlay,
}: {
  episode: Episode;
  number: number;
  onPlay: () => void;
}) {
  const stream = useStream();
  const { darkMode } = stream;
  const progress = stream.progressOf(episode.id);
  const finished = stream.isFinished(episode.id);
  const pct = Math.min(100, Math.round((progress / episode.duration) * 100));
  const download = stream.downloads[episode.id];

  return (
    <View style={styles.episodeRow}>
      <Pressable
        onPress={onPlay}
        accessibilityRole="button"
        accessibilityLabel={`Play episode ${number}: ${episode.title}`}
        style={({ pressed }) => [styles.episodeMain, pressed && { opacity: 0.7 }]}
      >
        <View style={styles.episodeNumber}>
          <Figure variant="heading" muted>
            {number}
          </Figure>
        </View>
        <View style={styles.flex}>
          <T variant="body" numberOfLines={1}>
            {episode.title}
          </T>
          <T variant="caption" muted style={styles.episodeMeta} numberOfLines={2}>
            {episode.synopsis}
          </T>
          <Figure variant="caption" muted style={styles.episodeMeta}>
            {formatRuntime(episode.duration)}
            {progress > 0 && !finished
              ? ` · ${formatTime(episode.duration - progress)} left`
              : ""}
            {finished ? " · Watched" : ""}
          </Figure>
          {progress > 0 && !finished ? (
            <View style={styles.episodeProgress}>
              <Progress
                value={pct}
                tint={accentColor(stream.backdrop)}
                accessibilityLabel={`Progress in ${episode.title}`}
                isDark={darkMode}
              />
            </View>
          ) : null}
        </View>
        <Play size={15} color={darkMode ? colors.dark.foreground : colors.light.foreground} />
      </Pressable>
      <IconButton
        accessibilityLabel={
          !download
            ? `Download ${episode.title}`
            : download.status === "downloading"
              ? `Cancel download of ${episode.title}`
              : `Remove download of ${episode.title}`
        }
        onPress={() =>
          download
            ? stream.removeDownload(episode.id)
            : stream.startDownload(episode.id)
        }
        isDark={darkMode}
        icon={
          !download ? (
            <Download size={18} color={darkMode ? colors.dark.foreground : colors.light.foreground} />
          ) : download.status === "downloading" ? (
            <Figure variant="caption">{download.pct}%</Figure>
          ) : (
            <Check size={18} color={darkMode ? colors.dark.foreground : colors.light.foreground} />
          )
        }
      />
    </View>
  );
}

export default function TitleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const stream = useStream();
  const { darkMode } = stream;
  const title = titleById(id ?? "");
  const [seasonNumber, setSeasonNumber] = useState(1);

  const resume = stream.resumeForTitle(title);
  const inList = stream.isInMyList(title.id);
  const movieDownload = stream.downloads[title.id];
  const season = title.seasons?.find((s) => s.number === seasonNumber) ?? title.seasons?.[0];

  const play = (playableId: string) => {
    stream.playPlayable(playableId);
    router.push("/templates/stream/player");
  };

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
        <T variant="caption" muted>
          {title.kind === "movie" ? "Film" : "Series"} · {title.genres.join(" · ")}
        </T>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.posterWrap}>
        <Artwork name={title.name} colors={title.colors} width={300} height={190} radius={20} image={title.image} />
      </View>

      <T variant="title" style={styles.name}>
        {title.name}
      </T>
      <View style={styles.metaRow}>
        <Badge tone="muted" isDark={darkMode}>
          {title.rating}
        </Badge>
        <Figure variant="caption" muted>
          {title.year} ·{" "}
          {title.kind === "movie"
            ? formatRuntime(title.duration ?? 0)
            : `${title.seasons?.length ?? 1} Season${(title.seasons?.length ?? 1) > 1 ? "s" : ""}`}
        </Figure>
      </View>
      <T variant="body" muted style={styles.synopsis}>
        {title.synopsis}
      </T>
      <T variant="caption" muted style={styles.credits}>
        {title.creator} · Starring {title.cast.join(", ")}
      </T>

      {/* Primary actions */}
      <View style={styles.actions}>
        <Button
          accessibilityLabel={`${resume.verb} ${title.name}`}
          variant="filled"
          isDark={darkMode}
          onPress={() => play(resume.playableId)}
        >
          {resume.verb}
        </Button>
        <Button
          accessibilityLabel={
            inList ? `Remove ${title.name} from My List` : `Add ${title.name} to My List`
          }
          variant="glass"
          isDark={darkMode}
          onPress={() => stream.toggleMyList(title.id)}
        >
          {inList ? "In My List" : "My List"}
        </Button>
      </View>
      <Figure variant="caption" muted>
        {resume.detail}
        {resume.position > 0 ? ` · ${formatTime(resume.position)} in` : ""}
      </Figure>

      {/* Movie download entry */}
      {title.kind === "movie" ? (
        <View style={styles.section}>
          <SectionTitle>Offline</SectionTitle>
          <ListCard>
            <View style={styles.downloadCardRow}>
              <View style={styles.flex}>
                <T variant="body">Download this film</T>
                <Figure variant="caption" muted style={styles.episodeMeta}>
                  {formatSize(title.sizeMB ?? 0)} ·{" "}
                  {!movieDownload
                    ? "Watch without a connection"
                    : movieDownload.status === "downloading"
                      ? `Downloading · ${movieDownload.pct}%`
                      : "Downloaded · ready offline"}
                </Figure>
                {movieDownload?.status === "downloading" ? (
                  <View style={styles.episodeProgress}>
                    <Progress
                      value={movieDownload.pct}
                      tint={accentColor(stream.backdrop)}
                      accessibilityLabel={`Downloading ${title.name}`}
                      isDark={darkMode}
                    />
                  </View>
                ) : null}
              </View>
              <Button
                accessibilityLabel={
                  !movieDownload
                    ? `Download ${title.name}`
                    : movieDownload.status === "downloading"
                      ? `Cancel download of ${title.name}`
                      : `Remove download of ${title.name}`
                }
                variant="glass"
                isDark={darkMode}
                onPress={() =>
                  movieDownload
                    ? stream.removeDownload(title.id)
                    : stream.startDownload(title.id)
                }
              >
                {!movieDownload
                  ? "Download"
                  : movieDownload.status === "downloading"
                    ? "Cancel"
                    : "Downloaded"}
              </Button>
            </View>
          </ListCard>
        </View>
      ) : null}

      {/* Episodes */}
      {title.kind === "series" && season ? (
        <View style={styles.section}>
          <View style={styles.episodesHead}>
            <SectionTitle>Episodes</SectionTitle>
            {(title.seasons?.length ?? 0) > 1 ? (
              <Select
                value={String(season.number)}
                onValueChange={(v) => setSeasonNumber(Number(v))}
                options={(title.seasons ?? []).map((s) => ({
                  value: String(s.number),
                  label: `Season ${s.number}`,
                }))}
                accessibilityLabel="Choose a season"
                isDark={darkMode}
              />
            ) : (
              <T variant="caption" muted>
                Season {season.number}
              </T>
            )}
          </View>
          <ListCard>
            {season.episodes.map((episode, i) => (
              <View key={episode.id}>
                {i > 0 ? <RowSeparator /> : null}
                <EpisodeRow
                  episode={episode}
                  number={i + 1}
                  onPlay={() => play(episode.id)}
                />
              </View>
            ))}
          </ListCard>
        </View>
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
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerSpacer: { width: 40 },
  posterWrap: {
    alignItems: "center",
    marginTop: 22,
  },
  name: {
    marginTop: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  synopsis: {
    marginTop: 12,
    lineHeight: 21,
  },
  credits: {
    marginTop: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    marginBottom: 8,
  },
  section: {
    marginTop: 26,
  },
  episodesHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  episodeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
  },
  episodeMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
  },
  episodeNumber: {
    width: 28,
    alignItems: "center",
  },
  episodeMeta: {
    marginTop: 4,
  },
  episodeProgress: {
    marginTop: 8,
    maxWidth: 180,
  },
  downloadCardRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
});
