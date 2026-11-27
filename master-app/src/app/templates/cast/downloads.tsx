import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, Button, IconButton, Progress } from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import ChevronLeftIcon from "@hugeicons/core-free-icons/ChevronLeftIcon";
import Tick01Icon from "@hugeicons/core-free-icons/Tick01Icon";
import { EPISODES, episodeById, showById, type Episode } from "./data";
import { useCast } from "./state";
import { Artwork, Figure, ListCard, SectionTitle, T } from "./ui";

/** Nominal offline budget the storage meter is drawn against. */
const BUDGET_MB = 2048;

/**
 * Downloads: every download is simulated in the store — tapping
 * Download fills a progress bar over about two seconds, then the
 * episode counts toward the storage total until it's removed.
 */
export default function DownloadsScreen() {
  const cast = useCast();
  const router = useRouter();
  const { darkMode } = cast;

  const downloaded = cast.downloadedIds.map(episodeById);
  const storagePct = Math.min(100, (cast.downloadedMB / BUDGET_MB) * 100);

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
        <T variant="title">Downloads</T>
      </View>

      {/* Storage meter — computed from the downloaded fixtures' sizes.
          A plain stat, not a glass card: the figure and the bar are
          the information. */}
      <View style={styles.storage}>
        <View style={styles.storageRow}>
          <Figure variant="heading">{cast.downloadedMB} MB</Figure>
          <T variant="caption" muted>
            of {BUDGET_MB} MB offline budget
          </T>
        </View>
        <Progress
          value={storagePct}
          isDark={darkMode}
          accessibilityLabel="Downloaded storage used"
          style={styles.storageBar}
        />
        <T variant="caption" muted>
          {downloaded.length} episodes saved for offline listening
        </T>
      </View>

      {downloaded.length > 0 ? (
        <View style={styles.section}>
          <SectionTitle>On this device</SectionTitle>
          <ListCard>
            {downloaded.map((episode, i) => (
              <View key={episode.id}>
                {i > 0 ? <View style={styles.rowGap} /> : null}
                <DownloadRow episode={episode} />
              </View>
            ))}
          </ListCard>
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionTitle>All episodes</SectionTitle>
        <ListCard>
          {EPISODES.map((episode, i) => (
            <View key={episode.id}>
              {i > 0 ? <View style={styles.rowGap} /> : null}
              <DownloadRow episode={episode} />
            </View>
          ))}
        </ListCard>
      </View>
    </ScrollView>
  );
}

function DownloadRow({ episode }: { episode: Episode }) {
  const cast = useCast();
  const router = useRouter();
  const { darkMode } = cast;
  const show = showById(episode.showId);
  const progress = cast.downloadProgressOf(episode.id);
  const downloading = progress !== undefined && progress < 100;
  const downloaded = cast.isDownloaded(episode.id);

  return (
    <Pressable
      onPress={() => {
        cast.playEpisode(episode.id);
        router.push("/templates/cast/player");
      }}
      accessibilityRole="button"
      accessibilityLabel={`Play ${episode.title} from ${show.title}`}
      style={({ pressed }) => [
        styles.row,
        pressed && {
          backgroundColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
        },
      ]}
    >
      <Artwork title={show.title} colors={show.colors} size={48} image={show.image} />
      <View style={styles.flex}>
        <T variant="body" numberOfLines={2}>
          {episode.title}
        </T>
        <View style={styles.metaLine}>
          <T variant="caption" muted>
            {show.title} ·
          </T>
          <Figure variant="caption" muted>
            {episode.sizeMB} MB
          </Figure>
        </View>
        {downloading ? (
          <Progress
            value={progress}
            isDark={darkMode}
            accessibilityLabel={`Download progress for ${episode.title}`}
            style={styles.rowProgress}
          />
        ) : null}
      </View>
      {downloaded ? (
        <>
          <HugeiconsIcon icon={Tick01Icon} size={16} color={colors[darkMode ? "dark" : "light"].foreground} />
          <Button
            accessibilityLabel={`Remove download of ${episode.title}`}
            onPress={() => cast.removeDownload(episode.id)}
            isDark={darkMode}
            variant="ghost"
            size="sm"
          >
            Remove
          </Button>
        </>
      ) : (
        <Button
          accessibilityLabel={
            downloading
              ? `Downloading ${episode.title}`
              : `Download ${episode.title}`
          }
          onPress={() => {
            if (!downloading) cast.startDownload(episode.id);
          }}
          isDark={darkMode}
          variant="glass"
          size="sm"
          disabled={downloading}
        >
          {downloading ? `${Math.floor(progress)}%` : "Download"}
        </Button>
      )}
    </Pressable>
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
    gap: 12,
    marginBottom: 20,
  },
  storage: {
    gap: 8,
  },
  storageRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  storageBar: {
    marginVertical: 2,
  },
  section: {
    marginTop: 24,
  },
  rowGap: {
    height: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
    borderRadius: 12,
  },
  flex: {
    flex: 1,
  },
  metaLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  rowProgress: {
    marginTop: 8,
  },
});
