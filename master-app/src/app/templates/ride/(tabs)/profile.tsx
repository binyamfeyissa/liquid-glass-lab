import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Button, Field, Input, Switch } from "glacia-native";

import { useRide } from "../state";
import { USER_IMAGE } from "../data";
import {
  BackdropControl,
  Figure,
  ListCard,
  NavRow,
  RowSeparator,
  Screen,
  SectionTitle,
  SettingRow,
  Stars,
  T,
} from "../ui";

export default function ProfileScreen() {
  const ride = useRide();
  const [name, setName] = useState(ride.userName);
  const [phone, setPhone] = useState(ride.userPhone);
  const [email, setEmail] = useState(ride.userEmail);
  const [error, setError] = useState<string | undefined>();
  const [savedNote, setSavedNote] = useState<string | undefined>();

  const save = () => {
    if (name.trim().length < 2) {
      setError("Enter your full name");
      return;
    }
    if (!/^\+?[\d\s()-]{7,}$/.test(phone.trim())) {
      setError("Enter a valid phone number — drivers use it at pickup");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email for receipts");
      return;
    }
    ride.saveProfile(name, phone, email);
    setError(undefined);
    setSavedNote("Profile saved");
  };

  return (
    <Screen belowTabBar title="Profile" subtitle="Your details, places, payment and settings">
      {/* Header with rider rating */}
      <View style={styles.header}>
        <Avatar name={ride.userName} source={USER_IMAGE} size="lg" isDark={ride.darkMode} status="online" />
        <View style={styles.headerText}>
          <T variant="heading">{ride.userName}</T>
          <View style={styles.ratingRow}>
            <Stars value={5} size={14} />
            <Figure variant="caption" muted>
              {ride.userRating.toFixed(2)} rider rating · {ride.userTrips} trips
            </Figure>
          </View>
          <T variant="body" muted>
            Drift member since 2023
          </T>
        </View>
      </View>

      <View>
        <SectionTitle>Shortcuts</SectionTitle>
        <ListCard>
          <NavRow
            title="Saved places"
            description="Home, work and favourites"
            detail={`${ride.savedPlaces.length}`}
            onPress={() => router.push("/templates/ride/places")}
          />
          <RowSeparator />
          <NavRow
            title="Payment"
            description="Cards used for your trips"
            detail={
              ride.defaultCard
                ? `${ride.defaultCard.brand} ••${ride.defaultCard.last4}`
                : "None"
            }
            onPress={() => router.push("/templates/ride/payment")}
          />
        </ListCard>
      </View>

      <View>
        <SectionTitle>Your details</SectionTitle>
        <View style={styles.form}>
          <Field label="Full name" error={error} isDark={ride.darkMode}>
            <Input
              value={name}
              onChangeText={(v) => {
                setName(v);
                setSavedNote(undefined);
              }}
              placeholder="Your name"
              accessibilityLabel="Full name"
              invalid={!!error}
              isDark={ride.darkMode}
            />
          </Field>
          <Field label="Phone" isDark={ride.darkMode}>
            <Input
              value={phone}
              onChangeText={(v) => {
                setPhone(v);
                setSavedNote(undefined);
              }}
              placeholder="+1 555 000 0000"
              keyboardType="phone-pad"
              accessibilityLabel="Phone number"
              isDark={ride.darkMode}
            />
          </Field>
          <Field label="Email" isDark={ride.darkMode}>
            <Input
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setSavedNote(undefined);
              }}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              accessibilityLabel="Email address"
              isDark={ride.darkMode}
            />
          </Field>
          {savedNote ? (
            <T variant="caption" style={styles.savedNote}>
              {savedNote}
            </T>
          ) : null}
          <Button isDark={ride.darkMode} accessibilityLabel="Save profile" variant="filled" onPress={save}>
            Save profile
          </Button>
        </View>
      </View>

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

      <View>
        <SectionTitle>App</SectionTitle>
        <ListCard>
          <SettingRow
            title="Trip updates"
            description="Driver arrival and trip status alerts"
          >
            <Switch
              value={ride.tripUpdates}
              onValueChange={ride.setTripUpdates}
              accessibilityLabel="Trip update notifications"
              isDark={ride.darkMode}
            />
          </SettingRow>
          <RowSeparator />
          <SettingRow
            title="Email receipts"
            description="A receipt after every completed trip"
          >
            <Switch
              value={ride.receipts}
              onValueChange={ride.setReceipts}
              accessibilityLabel="Email receipts"
              isDark={ride.darkMode}
            />
          </SettingRow>
          <RowSeparator />
          <SettingRow title="Promotions" description="Occasional discounts and offers">
            <Switch
              value={ride.promotions}
              onValueChange={ride.setPromotions}
              accessibilityLabel="Promotion notifications"
              isDark={ride.darkMode}
            />
          </SettingRow>
        </ListCard>
      </View>

      <T variant="caption" muted style={styles.foot}>
        Drift · Template build — no real rides, drivers or payments
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
  headerText: { flex: 1, gap: 3 },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  form: { gap: 16 },
  backdropBody: { padding: 16, gap: 12 },
  backdropNote: { marginTop: 4 },
  savedNote: { marginLeft: 4 },
  foot: { textAlign: "center" },
});
