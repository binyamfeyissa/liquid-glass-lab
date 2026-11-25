import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Button, Input, Select, Switch } from "glacia-native";

import { useHomes } from "../state";
import {
  BackdropControl,
  ListCard,
  NavRow,
  RowSeparator,
  Screen,
  SectionTitle,
  SettingRow,
  T,
  accentColor,
  errorColor,
} from "../ui";

const BUDGET_OPTIONS = [
  { label: "Up to $250k", value: "250000" },
  { label: "Up to $500k", value: "500000" },
  { label: "Up to $750k", value: "750000" },
  { label: "Up to $1M", value: "1000000" },
  { label: "Over $1M", value: "1500000" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ProfileScreen() {
  const homes = useHomes();
  const [name, setName] = useState(homes.profile.name);
  const [email, setEmail] = useState(homes.profile.email);
  const [budget, setBudget] = useState(homes.profile.budget);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const save = () => {
    if (name.trim().length < 2) {
      setError("Please enter your name");
      setSaved(false);
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError("That email doesn't look right — check it and try again");
      setSaved(false);
      return;
    }
    setError(null);
    homes.setProfile({ name: name.trim(), email: email.trim(), budget });
    setSaved(true);
  };

  return (
    <Screen title="Profile" subtitle="Your buyer details and app settings">
      <View style={styles.header}>
        <Avatar name={homes.profile.name} size="lg" isDark={homes.darkMode} />
        <View style={styles.headerText}>
          <T variant="heading">{homes.profile.name}</T>
          <T variant="body" muted>
            {homes.profile.email} · Haven member
          </T>
        </View>
      </View>

      <View>
        <SectionTitle>Buyer profile</SectionTitle>
        <View style={styles.form}>
          <View>
            <T variant="caption" muted style={styles.label}>
              Full name
            </T>
            <Input
              value={name}
              onChangeText={(v) => {
                setName(v);
                setSaved(false);
              }}
              placeholder="Your name"
              accessibilityLabel="Full name"
              isDark={homes.darkMode}
              autoCapitalize="words"
            />
          </View>
          <View>
            <T variant="caption" muted style={styles.label}>
              Email
            </T>
            <Input
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setSaved(false);
              }}
              placeholder="you@example.com"
              accessibilityLabel="Email address"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              invalid={!!error && !EMAIL_RE.test(email.trim())}
              isDark={homes.darkMode}
            />
          </View>
          <View>
            <T variant="caption" muted style={styles.label}>
              Budget
            </T>
            <Select
              value={budget}
              onValueChange={(v) => {
                setBudget(v);
                setSaved(false);
              }}
              options={BUDGET_OPTIONS}
              accessibilityLabel="Buying budget"
              isDark={homes.darkMode}
            />
          </View>
          {error ? (
            <T variant="caption" style={{ color: errorColor(homes.backdrop) }}>
              {error}
            </T>
          ) : null}
          {saved ? (
            <T variant="caption" style={{ color: accentColor(homes.backdrop) }}>
              Profile saved
            </T>
          ) : null}
          <Button
            variant="filled"
            accessibilityLabel="Save profile"
            isDark={homes.darkMode}
            onPress={save}
          >
            Save profile
          </Button>
        </View>
      </View>

      <View>
        <SectionTitle>Alerts</SectionTitle>
        <ListCard>
          <NavRow
            title="Search alerts"
            description="Saved searches that watch for new homes"
            detail={`${homes.alerts.filter((a) => a.active).length} on`}
            onPress={() => router.push("/templates/homes/alerts")}
          />
        </ListCard>
      </View>

      <View>
        <SectionTitle>Notifications</SectionTitle>
        <ListCard>
          <SettingRow title="New listings" description="Homes matching your budget">
            <Switch
              value={homes.notifyNewListings}
              onValueChange={homes.setNotifyNewListings}
              accessibilityLabel="New listings notifications"
              isDark={homes.darkMode}
            />
          </SettingRow>
          <RowSeparator />
          <SettingRow title="Price drops" description="When a favourite gets cheaper">
            <Switch
              value={homes.notifyPriceDrops}
              onValueChange={homes.setNotifyPriceDrops}
              accessibilityLabel="Price drop notifications"
              isDark={homes.darkMode}
            />
          </SettingRow>
          <RowSeparator />
          <SettingRow title="Viewing reminders" description="An hour before each viewing">
            <Switch
              value={homes.notifyViewingReminders}
              onValueChange={homes.setNotifyViewingReminders}
              accessibilityLabel="Viewing reminder notifications"
              isDark={homes.darkMode}
            />
          </SettingRow>
        </ListCard>
      </View>

      <View>
        <SectionTitle>Background</SectionTitle>
        <ListCard>
          <View style={styles.backdropPad}>
            <BackdropControl />
          </View>
        </ListCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  form: {
    gap: 16,
  },
  label: {
    marginBottom: 8,
    marginLeft: 4,
  },
  backdropPad: {
    padding: 16,
  },
});
