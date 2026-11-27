import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, SegmentedControl, Switch } from "glacia-native";

import { useAppState, type NotificationKey } from "./state";
import { ListCard, RowSeparator, Screen, SectionTitle, SettingRow, T } from "./ui";

const QUIET_SEGMENTS = ["Off", "Night", "Weekends"];
const QUIET_DESCRIPTIONS = [
  "Quiet hours are off — Northwind can reach you at any time.",
  "Push is silenced from 22:00 to 07:00. Security alerts still come through.",
  "Push is silenced from Friday 18:00 to Monday 08:00. Security alerts still come through.",
];

const PUSH_ROWS: { key: NotificationKey; title: string; description: string }[] = [
  { key: "mentions", title: "Mentions", description: "Someone @mentions you in a comment or doc" },
  { key: "replies", title: "Replies", description: "Replies to threads you are part of" },
  { key: "follows", title: "New followers", description: "Someone starts following your work" },
];

const EMAIL_ROWS: { key: NotificationKey; title: string; description: string }[] = [
  { key: "productNews", title: "Product news", description: "New features and changes to Northwind" },
  { key: "weeklyDigest", title: "Weekly digest", description: "A Monday summary of your workspace activity" },
  { key: "securityAlerts", title: "Security alerts", description: "New sign-ins and password changes" },
];

export default function NotificationsScreen() {
  const { notifications, setNotification, setQuietHours, glaciaDark } = useAppState();

  const renderRow = ({ key, title, description }: (typeof PUSH_ROWS)[number], last: boolean) => (
    <React.Fragment key={key}>
      <SettingRow title={title} description={description}>
        <Switch
          value={notifications[key]}
          onValueChange={(v) => setNotification(key, v)}
          accessibilityLabel={title}
          isDark={glaciaDark}
        />
      </SettingRow>
      {!last ? <RowSeparator /> : null}
    </React.Fragment>
  );

  return (
    <Screen belowTabBar title="Notifications" subtitle="Choose what Northwind can interrupt you for.">
      <View>
        <SectionTitle>Push notifications</SectionTitle>
        <ListCard>{PUSH_ROWS.map((row, i) => renderRow(row, i === PUSH_ROWS.length - 1))}</ListCard>
      </View>

      <View>
        <SectionTitle>Email</SectionTitle>
        <ListCard>{EMAIL_ROWS.map((row, i) => renderRow(row, i === EMAIL_ROWS.length - 1))}</ListCard>
      </View>

      <View>
        <SectionTitle>Quiet hours</SectionTitle>
        <Card isDark={glaciaDark} padding={18}>
          <SegmentedControl
            segments={QUIET_SEGMENTS}
            selectedIndex={notifications.quietHoursIndex}
            onChange={setQuietHours}
            accessibilityLabel="Quiet hours"
            isDark={glaciaDark}
          />
          <T variant="caption" muted style={styles.quietNote}>
            {QUIET_DESCRIPTIONS[notifications.quietHoursIndex]}
          </T>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  quietNote: {
    marginTop: 12,
  },
});
