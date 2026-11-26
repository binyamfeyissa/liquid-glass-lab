import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Avatar, Button, Input, Select, Switch } from "glacia-native";

import {
  MATURITY_OPTIONS,
  QUALITY_OPTIONS,
  formatRuntime,
  formatSize,
  type Maturity,
} from "../data";
import { useStream } from "../state";
import {
  BackdropControl,
  Figure,
  ListCard,
  RowSeparator,
  Screen,
  SectionTitle,
  SettingRow,
  T,
} from "../ui";

export default function ProfileScreen() {
  const stream = useStream();
  const { darkMode } = stream;
  const [nameDraft, setNameDraft] = useState(stream.viewerName);
  const [nameSaved, setNameSaved] = useState(false);

  const downloadCount = Object.values(stream.downloads).filter(
    (d) => d.status === "done",
  ).length;

  return (
    <Screen title="Profile" subtitle="Viewer profile, playback and app settings">
      {/* Profile header */}
      <View style={styles.header}>
        <Avatar name={stream.viewerName} source={stream.viewerImage} size="lg" isDark={darkMode} />
        <View style={styles.headerText}>
          <T variant="heading">{stream.viewerName}</T>
          <T variant="body" muted>
            Lumen Play member
          </T>
        </View>
      </View>

      {/* Viewing stats — all computed from the store */}
      <View>
        <SectionTitle>Your viewing</SectionTitle>
        <ListCard>
          <View style={styles.statRow}>
            <T variant="body" muted>
              Titles finished
            </T>
            <Figure variant="heading">{stream.titlesFinished}</Figure>
          </View>
          <RowSeparator />
          <View style={styles.statRow}>
            <T variant="body" muted>
              Time watched
            </T>
            <Figure variant="heading">
              {formatRuntime(stream.totalWatchedSeconds)}
            </Figure>
          </View>
          <RowSeparator />
          <View style={styles.statRow}>
            <T variant="body" muted>
              In My List
            </T>
            <Figure variant="heading">{stream.myListIds.length}</Figure>
          </View>
          <RowSeparator />
          <View style={styles.statsFoot}>
            <Figure variant="caption" muted>
              {downloadCount} downloaded · {formatSize(stream.downloadedSizeMB)} on this
              device · {stream.continueWatching.length} in progress
            </Figure>
          </View>
        </ListCard>
      </View>

      {/* Viewer profile form */}
      <View>
        <SectionTitle>Viewer profile</SectionTitle>
        <ListCard>
          <View style={styles.form}>
            <T variant="label" muted>
              Display name
            </T>
            <Input
              value={nameDraft}
              onChangeText={(text) => {
                setNameDraft(text);
                setNameSaved(false);
              }}
              placeholder="Your name"
              accessibilityLabel="Display name"
              isDark={darkMode}
            />
            <Button
              accessibilityLabel="Save display name"
              variant="glass"
              isDark={darkMode}
              disabled={nameDraft.trim().length === 0}
              onPress={() => {
                stream.setViewerName(nameDraft.trim());
                setNameSaved(true);
              }}
            >
              {nameSaved ? "Saved" : "Save name"}
            </Button>
          </View>
          <RowSeparator />
          <SettingRow
            title="Maturity level"
            description="Filters the catalogue on Home and Browse"
          >
            <Select
              value={stream.maturity}
              onValueChange={(v) => stream.setMaturity(v as Maturity)}
              options={MATURITY_OPTIONS}
              accessibilityLabel="Maturity level"
              isDark={darkMode}
            />
          </SettingRow>
        </ListCard>
      </View>

      {/* Playback */}
      <View>
        <SectionTitle>Playback</SectionTitle>
        <ListCard>
          <SettingRow
            title="Streaming quality"
            description="Applied to the simulated player"
          >
            <Select
              value={stream.quality}
              onValueChange={stream.setQuality}
              options={QUALITY_OPTIONS}
              accessibilityLabel="Streaming quality"
              isDark={darkMode}
            />
          </SettingRow>
          <RowSeparator />
          <SettingRow
            title="Autoplay next episode"
            description="Starts the Up Next episode after a short countdown"
          >
            <Switch
              value={stream.autoplayNext}
              onValueChange={stream.setAutoplayNext}
              accessibilityLabel="Autoplay next episode"
              isDark={darkMode}
            />
          </SettingRow>
        </ListCard>
      </View>

      {/* App */}
      <View>
        <SectionTitle>App</SectionTitle>
        <ListCard>
          <View style={styles.backdropBlock}>
            <T variant="body">Background</T>
            <T variant="caption" muted style={styles.backdropHint}>
              Graphite, broken white or the palm photo
            </T>
            <View style={styles.backdropControl}>
              <BackdropControl />
            </View>
          </View>
          <RowSeparator />
          <SettingRow
            title="New release alerts"
            description="When a followed genre gets a new title"
          >
            <Switch
              value={stream.notifyNewReleases}
              onValueChange={stream.setNotifyNewReleases}
              accessibilityLabel="New release alerts"
              isDark={darkMode}
            />
          </SettingRow>
          <RowSeparator />
          <SettingRow
            title="Recommendations"
            description="A weekly pick based on what you finish"
          >
            <Switch
              value={stream.notifyRecommendations}
              onValueChange={stream.setNotifyRecommendations}
              accessibilityLabel="Recommendation notifications"
              isDark={darkMode}
            />
          </SettingRow>
        </ListCard>
      </View>

      <T variant="caption" muted style={styles.foot}>
        Lumen Play · Template build — playback is simulated, no real video
        streams anywhere.
      </T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerText: { flex: 1, gap: 4 },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statsFoot: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  backdropBlock: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backdropHint: {
    marginTop: 4,
  },
  backdropControl: {
    marginTop: 12,
  },
  form: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  foot: { textAlign: "center" },
});
