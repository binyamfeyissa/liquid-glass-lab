import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Button, Card, Progress, Separator, Sheet } from "glacia-native";

import { useAppState } from "./state";
import {
  Figure,
  ListCard,
  NavRow,
  RowSeparator,
  Screen,
  SectionTitle,
  Serif,
  StatusDot,
  T,
  accentColor,
} from "./ui";

const STATS: { value: string; label: string }[] = [
  { value: "24", label: "Projects" },
  { value: "312", label: "Tasks done" },
  { value: "18", label: "Day streak" },
];

export default function ProfileScreen() {
  const { profile, profileImage, notifications, glaciaDark, backdrop } = useAppState();
  const [planOpen, setPlanOpen] = useState(false);

  const alertsOn = [
    notifications.mentions,
    notifications.replies,
    notifications.follows,
    notifications.productNews,
    notifications.weeklyDigest,
    notifications.securityAlerts,
  ].filter(Boolean).length;

  return (
    <>
      <Screen title="Profile" subtitle="Account, plan and settings.">
        {/* Identity */}
        <Card isDark={glaciaDark} padding={20}>
          <View style={styles.identityRow}>
            <Avatar name={profile.name} size="lg" isDark={glaciaDark} source={profileImage} />
            <View style={styles.identityText}>
              <Serif variant="heading">{profile.name}</Serif>
              <T variant="caption" muted>
                {profile.role} · @{profile.username}
              </T>
            </View>
          </View>
          <T variant="body" style={styles.bio}>
            {profile.bio}
          </T>
        </Card>

        {/* Stats */}
        <Card isDark={glaciaDark} padding={20}>
          <View style={styles.statsRow}>
            {STATS.map((stat, i) => (
              <React.Fragment key={stat.label}>
                {i > 0 ? (
                  <Separator orientation="vertical" isDark={glaciaDark} style={styles.statDivider} />
                ) : null}
                <View style={styles.stat}>
                  <Figure variant="heading">{stat.value}</Figure>
                  <T variant="caption" muted>
                    {stat.label}
                  </T>
                </View>
              </React.Fragment>
            ))}
          </View>
        </Card>

        {/* Account summary */}
        <View>
          <SectionTitle>Account</SectionTitle>
          <Card isDark={glaciaDark} padding={20}>
            <View style={styles.planRow}>
              <View style={styles.planText}>
                <T variant="body">Northwind Pro</T>
                <T variant="caption" muted>
                  Renews 1 Feb 2027 · Visa ···· 4242
                </T>
              </View>
              <View style={styles.statusRow}>
                <StatusDot color={accentColor(backdrop)} />
                <T variant="caption" muted>
                  Active
                </T>
              </View>
            </View>
            <View style={styles.storageBlock}>
              <View style={styles.storageLabels}>
                <T variant="caption" muted>
                  Storage
                </T>
                <Figure variant="caption" muted>
                  34 GB of 50 GB
                </Figure>
              </View>
              <Progress
                value={68}
                tint={accentColor(backdrop)}
                isDark={glaciaDark}
                accessibilityLabel="Storage used"
              />
            </View>
            <Button
              variant="ghost"
              size="sm"
              isDark={glaciaDark}
              accessibilityLabel="Manage plan"
              onPress={() => setPlanOpen(true)}
              style={styles.planButton}
            >
              Manage plan
            </Button>
          </Card>
        </View>

        {/* Settings menu */}
        <View>
          <SectionTitle>Settings</SectionTitle>
          <ListCard>
            <NavRow
              title="Edit profile"
              description="Name, username, bio, role"
              onPress={() => router.navigate("/templates/profile-settings/edit")}
            />
            <RowSeparator />
            <NavRow
              title="Notifications"
              description="Push, email, quiet hours"
              detail={`${alertsOn} on`}
              onPress={() => router.navigate("/templates/profile-settings/notifications")}
            />
            <RowSeparator />
            <NavRow
              title="Appearance"
              description="Theme, glass, text size"
              onPress={() => router.navigate("/templates/profile-settings/appearance")}
            />
            <RowSeparator />
            <NavRow
              title="Privacy & security"
              description="Password, two-factor, sessions"
              onPress={() => router.navigate("/templates/profile-settings/privacy")}
            />
            <RowSeparator />
            <NavRow
              title="About"
              description="Version, terms, licenses"
              onPress={() => router.navigate("/templates/profile-settings/about")}
            />
          </ListCard>
        </View>
      </Screen>

      <Sheet visible={planOpen} onDismiss={() => setPlanOpen(false)} height={300} isDark={glaciaDark}>
        <View style={styles.sheetBody}>
          <T variant="heading">Northwind Pro</T>
          <T variant="body" muted style={styles.sheetText}>
            Northwind Pro at $12 a month, renewing 1 Feb 2027 on the Visa ending in
            4242.
          </T>
          <Button
            variant="filled"
            isDark={glaciaDark}
            accessibilityLabel="Done"
            onPress={() => setPlanOpen(false)}
          >
            Done
          </Button>
        </View>
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  identityText: {
    flex: 1,
    gap: 4,
  },
  bio: {
    marginTop: 16,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statDivider: {
    marginVertical: 4,
  },
  planRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  planText: {
    flex: 1,
    gap: 4,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  storageBlock: {
    marginTop: 16,
    gap: 8,
  },
  storageLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  planButton: {
    marginTop: 16,
    alignSelf: "flex-start",
  },
  sheetBody: {
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 12,
  },
  sheetText: {
    marginBottom: 8,
  },
});
