import React from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Avatar, Button, Card, Switch } from "glacia-native";

import { formatDuration } from "../data";
import { useCast } from "../state";
import {
  BackdropControl,
  Figure,
  ListCard,
  Screen,
  SectionTitle,
  SettingRow,
  T,
} from "../ui";

/**
 * Profile & settings: listening stats computed from the store's
 * history, plus every switch the template supports. The background
 * choice (dark gray, broken white, palm photo) lives in the store
 * and threads through the whole app as the derived dark mode.
 */
export default function ProfileScreen() {
  const cast = useCast();
  const router = useRouter();
  const { darkMode } = cast;

  return (
    <Screen belowTabBar title="Profile" subtitle="Listening stats and settings">
      <Card isDark={darkMode} padding={16} style={styles.profileCard}>
        <Avatar name={cast.userName} size="lg" isDark={darkMode} source={cast.userImage} />
        <View style={styles.flex}>
          <T variant="heading">{cast.userName}</T>
          <T variant="caption" muted>
            Airwave Free · Listening since 2024
          </T>
        </View>
      </Card>

      {/* Stats — all computed from the store, nothing hard-coded. */}
      <View>
        <SectionTitle>Listening stats</SectionTitle>
        <Card isDark={darkMode} padding={16}>
          <View style={styles.statStrip}>
            <View style={[styles.statCell, styles.statCellWide]}>
              <Figure variant="heading" style={styles.statValue}>
                {formatDuration(cast.totalListenedSeconds)}
              </Figure>
              <T variant="caption" muted style={styles.statLabel}>
                Time listened
              </T>
            </View>
            <View style={styles.statCell}>
              <Figure variant="heading" style={styles.statValue}>
                {cast.episodesCompleted}
              </Figure>
              <T variant="caption" muted style={styles.statLabel}>
                Episodes finished
              </T>
            </View>
            <View style={styles.statCell}>
              <Figure variant="heading" style={styles.statValue}>
                {cast.followedShowIds.length}
              </Figure>
              <T variant="caption" muted style={styles.statLabel}>
                Shows followed
              </T>
            </View>
          </View>
        </Card>
      </View>

      {/* Playback & downloads */}
      <View>
        <SectionTitle>Playback & downloads</SectionTitle>
        <ListCard>
          <SettingRow
            title="Auto-download new episodes"
            description="Following a show downloads its newest episode."
          >
            <Switch
              value={cast.autoDownload}
              onValueChange={cast.setAutoDownload}
              isDark={darkMode}
              accessibilityLabel="Auto-download new episodes"
            />
          </SettingRow>
          <SettingRow
            title="Downloads on this device"
            description={`${cast.downloadedIds.length} episodes · ${cast.downloadedMB} MB`}
          >
            <Button
              accessibilityLabel="Manage downloads"
              onPress={() => router.push("/templates/cast/downloads")}
              isDark={darkMode}
              variant="ghost"
              size="sm"
            >
              Manage
            </Button>
          </SettingRow>
          <SettingRow
            title="Up-next queue"
            description={`${cast.queue.length} episodes waiting`}
          >
            <Button
              accessibilityLabel="Open the queue"
              onPress={() => router.push("/templates/cast/queue")}
              isDark={darkMode}
              variant="ghost"
              size="sm"
            >
              View
            </Button>
          </SettingRow>
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
        <SectionTitle>Notifications</SectionTitle>
        <ListCard>
          <SettingRow
            title="New episodes"
            description="When a followed show publishes."
          >
            <Switch
              value={cast.notifyNewEpisodes}
              onValueChange={cast.setNotifyNewEpisodes}
              isDark={darkMode}
              accessibilityLabel="Notify about new episodes"
            />
          </SettingRow>
          <SettingRow
            title="Download finished"
            description="When an episode is ready offline."
          >
            <Switch
              value={cast.notifyDownloads}
              onValueChange={cast.setNotifyDownloads}
              isDark={darkMode}
              accessibilityLabel="Notify when downloads finish"
            />
          </SettingRow>
          <SettingRow
            title="Weekly recap"
            description="Your listening week, every Sunday."
          >
            <Switch
              value={cast.notifyWeeklyRecap}
              onValueChange={cast.setNotifyWeeklyRecap}
              isDark={darkMode}
              accessibilityLabel="Weekly recap notification"
            />
          </SettingRow>
        </ListCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  flex: {
    flex: 1,
  },
  statStrip: {
    flexDirection: "row",
    gap: 8,
  },
  statCell: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statCellWide: {
    flex: 1.4,
  },
  statValue: {
    textAlign: "center",
  },
  statLabel: {
    textAlign: "center",
  },
  backdropBody: {
    padding: 16,
    gap: 12,
  },
  backdropNote: {
    marginTop: 4,
  },
});
