import React from "react";
import { StyleSheet, View } from "react-native";
import { Avatar, Card, Select, Switch } from "glacia-native";

import { QUALITY_OPTIONS, formatLongDuration } from "../data";
import { useTunes } from "../state";
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
  const tunes = useTunes();
  const { darkMode } = tunes;

  const minutesListened = Math.floor(tunes.totalListenedSeconds / 60);
  const tracksPlayed = new Set(tunes.history.map((h) => h.trackId)).size;

  return (
    <Screen title="Profile" subtitle="Your listening, your settings">
      {/* Listener card */}
      <Card isDark={darkMode} padding={20}>
        <View style={styles.header}>
          <Avatar name={tunes.userName} size="lg" isDark={darkMode} />
          <View style={styles.flex}>
            <T variant="heading">{tunes.userName}</T>
            <T variant="caption" muted style={styles.sub}>
              Listener since 2024
            </T>
          </View>
        </View>
      </Card>

      {/* Listening — all computed live from the play history in the store,
          read as one statement: label left, mono figure right. */}
      <View>
        <SectionTitle>Your listening</SectionTitle>
        <ListCard>
          <SettingRow title="Minutes listened">
            <Figure variant="body">{minutesListened}</Figure>
          </SettingRow>
          <RowSeparator />
          <SettingRow title="Tracks played">
            <Figure variant="body">{tracksPlayed}</Figure>
          </SettingRow>
          <RowSeparator />
          <SettingRow title="Liked songs">
            <Figure variant="body">{tunes.likedIds.length}</Figure>
          </SettingRow>
          <RowSeparator />
          <SettingRow
            title="Top genre"
            description="Weighted by the time you actually listened"
          >
            <T variant="body">{tunes.topGenre ?? "—"}</T>
          </SettingRow>
          <RowSeparator />
          <SettingRow
            title="Time in Waveform"
            description="Across every session in your history"
          >
            <Figure variant="body">
              {formatLongDuration(tunes.totalListenedSeconds)}
            </Figure>
          </SettingRow>
        </ListCard>
      </View>

      {/* Downloads */}
      <View>
        <SectionTitle>Downloads</SectionTitle>
        <ListCard>
          <View style={styles.selectBox}>
            <T variant="body">Download quality</T>
            <T variant="caption" muted style={styles.sub}>
              Applies to tracks you save for offline listening
            </T>
            <Select
              value={tunes.downloadQuality}
              onValueChange={tunes.setDownloadQuality}
              options={QUALITY_OPTIONS}
              accessibilityLabel="Download quality"
              isDark={darkMode}
              style={styles.select}
            />
          </View>
        </ListCard>
      </View>

      {/* Background */}
      <View>
        <SectionTitle>Background</SectionTitle>
        <ListCard>
          <View style={styles.backdropBody}>
            <BackdropControl />
            <T variant="caption" muted style={styles.backdropNote}>
              Dark gray, broken white, or the palm photo — the glass sits over all three
            </T>
          </View>
        </ListCard>
      </View>

      {/* Notifications */}
      <View>
        <SectionTitle>Preferences</SectionTitle>
        <ListCard>
          <SettingRow
            title="New releases"
            description="From artists in your library"
          >
            <Switch
              value={tunes.notifyNewReleases}
              onValueChange={tunes.setNotifyNewReleases}
              accessibilityLabel="New release notifications"
              isDark={darkMode}
            />
          </SettingRow>
          <RowSeparator />
          <SettingRow
            title="Playlist updates"
            description="When a playlist you follow changes"
          >
            <Switch
              value={tunes.notifyPlaylistUpdates}
              onValueChange={tunes.setNotifyPlaylistUpdates}
              accessibilityLabel="Playlist update notifications"
              isDark={darkMode}
            />
          </SettingRow>
          <RowSeparator />
          <SettingRow
            title="Weekly recap"
            description="Your listening week, every Monday"
          >
            <Switch
              value={tunes.notifyWeeklyRecap}
              onValueChange={tunes.setNotifyWeeklyRecap}
              accessibilityLabel="Weekly recap notifications"
              isDark={darkMode}
            />
          </SettingRow>
        </ListCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sub: { marginTop: 4 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  selectBox: {
    padding: 16,
    gap: 4,
  },
  select: {
    marginTop: 8,
  },
  backdropBody: {
    padding: 16,
    gap: 12,
  },
  backdropNote: {
    lineHeight: 18,
  },
});
