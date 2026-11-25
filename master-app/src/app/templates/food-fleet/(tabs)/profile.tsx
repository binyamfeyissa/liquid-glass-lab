import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Badge, Button, Card, Field, Input, Select, Switch } from "glacia-native";

import { VEHICLES } from "../data";
import { useFleet } from "../state";
import {
  BackdropControl,
  ListCard,
  NavRow,
  RowSeparator,
  Screen,
  SectionTitle,
  SettingRow,
  T,
} from "../ui";

export default function ProfileScreen() {
  const fleet = useFleet();
  const [saved, setSaved] = useState(false);

  const save = () => setSaved(true);
  const edit = (fn: (v: string) => void) => (v: string) => {
    fn(v);
    setSaved(false);
  };

  return (
    <Screen title="Profile" subtitle="Rider details and app settings">
      {/* Header */}
      <View style={styles.header}>
        <Avatar name={fleet.riderName || "Rider"} size="lg" isDark={fleet.darkMode} />
        <View style={styles.headerText}>
          <T variant="heading">{fleet.riderName}</T>
          <T variant="caption" muted>
            Courier · {fleet.averageRating.toFixed(1)} average rating
          </T>
        </View>
        <Badge tone="muted" isDark={fleet.darkMode}>
          {fleet.online ? "Online" : "Offline"}
        </Badge>
      </View>

      {/* Editable profile form */}
      <View>
        <SectionTitle>Rider details</SectionTitle>
        <ListCard>
          <View style={styles.form}>
            <Field label="Full name" isDark={fleet.darkMode}>
              <Input
                value={fleet.riderName}
                onChangeText={edit(fleet.setRiderName)}
                placeholder="Your name"
                accessibilityLabel="Full name"
                isDark={fleet.darkMode}
              />
            </Field>
            <Field label="Phone" isDark={fleet.darkMode}>
              <Input
                value={fleet.riderPhone}
                onChangeText={edit(fleet.setRiderPhone)}
                placeholder="+1 555 000 0000"
                keyboardType="phone-pad"
                accessibilityLabel="Phone"
                isDark={fleet.darkMode}
              />
            </Field>
            <Field label="Vehicle" isDark={fleet.darkMode}>
              <Select
                value={fleet.vehicle}
                onValueChange={(v) => {
                  fleet.setVehicle(v);
                  setSaved(false);
                }}
                options={VEHICLES}
                accessibilityLabel="Vehicle"
                isDark={fleet.darkMode}
              />
            </Field>
            <Button
              accessibilityLabel="Save rider details"
              variant="filled"
              disabled={!fleet.riderName.trim() || !fleet.riderPhone.trim()}
              onPress={save}
            >
              Save details
            </Button>
            {saved ? (
              <Badge tone="muted" isDark={fleet.darkMode} style={styles.savedBadge}>
                Saved
              </Badge>
            ) : null}
          </View>
        </ListCard>
      </View>

      {/* Availability + app settings */}
      <View>
        <SectionTitle>Settings</SectionTitle>
        <ListCard>
          <SettingRow title="Available for offers">
            <Switch
              value={fleet.online}
              onValueChange={fleet.setOnline}
              accessibilityLabel="Available for offers"
            />
          </SettingRow>
          <RowSeparator />
          <SettingRow
            title="New offer alerts"
            description="A buzz when a new job arrives"
          >
            <Switch
              value={fleet.notifyOffers}
              onValueChange={fleet.setNotifyOffers}
              accessibilityLabel="New offer alerts"
            />
          </SettingRow>
          <RowSeparator />
          <SettingRow
            title="Payout alerts"
            description="When a cash out is sent"
          >
            <Switch
              value={fleet.notifyPayouts}
              onValueChange={fleet.setNotifyPayouts}
              accessibilityLabel="Payout alerts"
            />
          </SettingRow>
        </ListCard>
      </View>

      {/* The three backgrounds */}
      <View>
        <SectionTitle>Background</SectionTitle>
        <Card isDark={fleet.darkMode} padding={16}>
          <BackdropControl />
          <T variant="caption" muted style={styles.backdropNote}>
            Dark, broken white, or the Tahoe photo behind the glass
          </T>
        </Card>
      </View>

      {/* Ratings shortcut */}
      <View>
        <SectionTitle>More</SectionTitle>
        <ListCard>
          <NavRow
            title="Customer ratings"
            description="See what customers said about you"
            detail={fleet.averageRating.toFixed(1)}
            onPress={() => router.push("/templates/food-fleet/ratings")}
          />
        </ListCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 16 },
  headerText: { flex: 1 },
  form: { padding: 16, gap: 16 },
  savedBadge: { alignSelf: "flex-start" },
  backdropNote: { marginTop: 12 },
});
