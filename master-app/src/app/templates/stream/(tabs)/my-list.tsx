import React from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, IconButton, Progress } from "glacia-native";

import {
  TITLES,
  formatSize,
  ownerOf,
  playableLabel,
  type Title,
} from "../data";
import { useStream } from "../state";
import {
  Figure,
  ListCard,
  RowSeparator,
  Screen,
  SectionTitle,
  T,
  TitleRow,
  accentColor,
} from "../ui";

/** Device storage the downloads section meters against (fixture). */
const STORAGE_BUDGET_MB = 16000;

/**
 * The download control for a title: downloads its resume target (the
 * film, or the episode you're up to). While downloading it shows the
 * percentage and tapping cancels; once downloaded, tapping removes it.
 */
function DownloadButton({ title }: { title: Title }) {
  const stream = useStream();
  const target = stream.resumeForTitle(title).playableId;
  const entry = stream.downloads[target];
  const label = !entry
    ? `Download ${title.name}`
    : entry.status === "downloading"
      ? `Cancel download of ${title.name}`
      : `Remove download of ${title.name}`;
  return (
    <IconButton
      accessibilityLabel={label}
      onPress={() =>
        entry ? stream.removeDownload(target) : stream.startDownload(target)
      }
      isDark={stream.darkMode}
      icon={
        !entry ? (
          <T variant="body">↓</T>
        ) : entry.status === "downloading" ? (
          <Figure variant="caption">{entry.pct}%</Figure>
        ) : (
          <T variant="body">✓</T>
        )
      }
    />
  );
}

export default function MyListScreen() {
  const stream = useStream();
  const router = useRouter();
  const { darkMode } = stream;

  const saved = stream.myListIds
    .map((id) => TITLES.find((t) => t.id === id))
    .filter((t): t is Title => Boolean(t));

  const downloadIds = Object.keys(stream.downloads);
  const storagePct = Math.min(
    100,
    Math.round((stream.downloadedSizeMB / STORAGE_BUDGET_MB) * 100),
  );

  return (
    <Screen title="My List" subtitle="Saved titles and downloads on this device">
      {/* Saved titles */}
      <View>
        <SectionTitle>Saved titles</SectionTitle>
        {saved.length > 0 ? (
          <ListCard>
            {saved.map((title, i) => (
              <View key={title.id}>
                {i > 0 ? <RowSeparator /> : null}
                <TitleRow
                  title={title}
                  trailing={
                    <View style={styles.rowActions}>
                      <DownloadButton title={title} />
                      <IconButton
                        accessibilityLabel={`Remove ${title.name} from My List`}
                        onPress={() => stream.toggleMyList(title.id)}
                        isDark={darkMode}
                        icon={<T variant="body">✕</T>}
                      />
                    </View>
                  }
                />
              </View>
            ))}
          </ListCard>
        ) : (
          <View style={styles.empty}>
            <T variant="heading">Your list is empty</T>
            <T variant="body" muted style={styles.emptyHint}>
              Add a title to My List from its title page and it will wait for
              you here.
            </T>
            <Button
              accessibilityLabel="Browse the catalogue"
              variant="glass"
              isDark={darkMode}
              onPress={() => router.push("/templates/stream/browse")}
              style={styles.emptyButton}
            >
              Browse titles
            </Button>
          </View>
        )}
      </View>

      {/* Downloads */}
      <View>
        <SectionTitle>Downloads</SectionTitle>
        <ListCard>
          <View style={styles.storageHead}>
            <Figure variant="body">
              {formatSize(stream.downloadedSizeMB)} on this device
            </Figure>
            <Figure variant="caption" muted>
              of {formatSize(STORAGE_BUDGET_MB)}
            </Figure>
          </View>
          <View style={styles.storageBar}>
            <Progress
              value={storagePct}
              tint={accentColor(stream.backdrop)}
              accessibilityLabel="Download storage used"
              isDark={darkMode}
            />
          </View>
          {downloadIds.length > 0 ? <RowSeparator /> : null}
          {downloadIds.map((playableId, i) => {
            const entry = stream.downloads[playableId];
            const owner = ownerOf(playableId);
            return (
              <View key={playableId}>
                {i > 0 ? <RowSeparator /> : null}
                <View style={styles.downloadRow}>
                  <View style={styles.flex}>
                    <T variant="body" numberOfLines={1}>
                      {owner.name}
                    </T>
                    <Figure variant="caption" muted style={styles.downloadMeta}>
                      {playableLabel(playableId)}
                    </Figure>
                    {entry.status === "downloading" ? (
                      <View style={styles.downloadProgress}>
                        <Progress
                          value={entry.pct}
                          tint={accentColor(stream.backdrop)}
                          accessibilityLabel={`Downloading ${owner.name}`}
                          isDark={darkMode}
                        />
                      </View>
                    ) : (
                      <T variant="caption" muted>
                        Downloaded · ready offline
                      </T>
                    )}
                  </View>
                  <IconButton
                    accessibilityLabel={
                      entry.status === "downloading"
                        ? `Cancel download of ${owner.name}`
                        : `Remove download of ${owner.name}`
                    }
                    onPress={() => stream.removeDownload(playableId)}
                    isDark={darkMode}
                    icon={<T variant="body">✕</T>}
                  />
                </View>
              </View>
            );
          })}
          {downloadIds.length === 0 ? (
            <T variant="body" muted style={styles.noDownloads}>
              Nothing downloaded yet. Use the download button on a saved title
              or on any episode to keep it on this device.
            </T>
          ) : null}
        </ListCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  rowActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  empty: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 26,
  },
  emptyHint: {
    textAlign: "center",
  },
  emptyButton: {
    marginTop: 8,
  },
  storageHead: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  storageBar: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    marginTop: 8,
  },
  downloadRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  downloadMeta: {
    marginTop: 4,
  },
  downloadProgress: {
    marginTop: 8,
    maxWidth: 200,
  },
  noDownloads: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
});
