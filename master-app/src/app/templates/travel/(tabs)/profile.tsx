import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Card, SegmentedControl, Switch } from "glacia-native";

import { useTravel, type Currency } from "../state";
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

const CURRENCIES: Currency[] = ["USD", "EUR"];

export default function ProfileScreen() {
  const {
    userName,
    bookings,
    savedIds,
    threads,
    currency,
    setCurrency,
    darkMode,
    notifications,
    setNotifications,
    tripReminders,
    setTripReminders,
  } = useTravel();

  const upcomingCount = bookings.filter((b) => b.status === "upcoming").length;
  const unreadTotal = threads.reduce((sum, t) => sum + t.unread, 0);

  return (
    <Screen title="Profile">
      {/* Header */}
      <Card isDark={darkMode} padding={20}>
        <View style={styles.header}>
          <Avatar name={userName} size="lg" isDark={darkMode} />
          <View style={styles.flex}>
            <T variant="heading">{userName}</T>
            <T variant="caption" muted>
              Travelling with Wayfare since 2023 · {upcomingCount} upcoming{" "}
              {upcomingCount === 1 ? "trip" : "trips"}
            </T>
          </View>
        </View>
      </Card>

      {/* Shortcuts */}
      <ListCard>
        <NavRow
          title="My trips"
          description="Bookings, dates and references"
          detail={`${bookings.length}`}
          onPress={() => router.push("/templates/travel/(tabs)/trips")}
        />
        <RowSeparator />
        <NavRow
          title="Saved stays"
          description="Your wishlist"
          detail={`${savedIds.length}`}
          onPress={() => router.push("/templates/travel/(tabs)/saved")}
        />
        <RowSeparator />
        <NavRow
          title="Messages"
          description="Chats with hosts"
          detail={unreadTotal > 0 ? `${unreadTotal} new` : `${threads.length}`}
          onPress={() => router.push("/templates/travel/(tabs)/messages")}
        />
      </ListCard>

      {/* Display currency — re-prices every stay, trip and total in the app */}
      <View>
        <SectionTitle>Display currency</SectionTitle>
        <ListCard>
          <View style={styles.currencyBlock}>
            <T variant="body">Prices shown in</T>
            <T variant="caption" muted style={styles.currencyNote}>
              Converted from USD at fixture rates (EUR = USD × 0.92)
            </T>
            <SegmentedControl
              isDark={darkMode}
              segments={CURRENCIES}
              selectedIndex={CURRENCIES.indexOf(currency)}
              onChange={(i) => setCurrency(CURRENCIES[i])}
              accessibilityLabel="Display currency"
            />
          </View>
        </ListCard>
      </View>

      {/* Background — the three backgrounds the glass sits over */}
      <View>
        <SectionTitle>Background</SectionTitle>
        <ListCard>
          <View style={styles.backdropBlock}>
            <BackdropControl />
            <T variant="caption" muted>
              Dark gray, broken white, or the Tahoe photo — the glass sits over all three
            </T>
          </View>
        </ListCard>
      </View>

      {/* Preferences */}
      <View>
        <SectionTitle>Preferences</SectionTitle>
        <ListCard>
          <SettingRow
            title="Notifications"
            description="Booking confirmations and host replies"
          >
            <Switch
              isDark={darkMode}
              value={notifications}
              onValueChange={setNotifications}
              accessibilityLabel="Notifications"
            />
          </SettingRow>
          <RowSeparator />
          <SettingRow
            title="Trip reminders"
            description="A nudge 3 days before each check-in"
          >
            <Switch
              isDark={darkMode}
              value={tripReminders}
              onValueChange={setTripReminders}
              accessibilityLabel="Trip reminders"
            />
          </SettingRow>
        </ListCard>
      </View>

      <T variant="caption" muted style={styles.demoNote}>
        Wayfare is a demo template: stays, prices, dates and exchange rates are
        fixtures, hosts' replies are simulated, and no payment is ever taken.
      </T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 16 },
  currencyBlock: { paddingVertical: 12, paddingHorizontal: 16, gap: 6 },
  currencyNote: { marginBottom: 6 },
  backdropBlock: { paddingVertical: 12, paddingHorizontal: 16, gap: 8 },
  demoNote: { textAlign: "center", paddingHorizontal: 12, lineHeight: 18 },
});
