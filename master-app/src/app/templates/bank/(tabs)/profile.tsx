import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Button, Switch } from "glacia-native";

import { useBank } from "../state";
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
  const bank = useBank();

  return (
    <Screen title="Profile" subtitle="Your details, security and app settings">
      {/* Profile header */}
      <View style={styles.header}>
        <Avatar name={bank.userName} size="lg" isDark={bank.darkMode} status="online" />
        <View style={styles.headerText}>
          <T variant="heading">{bank.userName}</T>
          <T variant="body" muted>
            {bank.userHandle} · Northwind member since 2021
          </T>
        </View>
      </View>

      <View>
        <SectionTitle>Money</SectionTitle>
        <ListCard>
          <NavRow
            title="Spending insights"
            description="Category breakdown by month"
            onPress={() => router.push("/templates/bank/insights")}
          />
          <RowSeparator />
          <NavRow
            title="Bills"
            description="Upcoming and paid bills"
            detail={`${bank.bills.filter((b) => !b.paid).length} due`}
            onPress={() => router.push("/templates/bank/bills")}
          />
          <RowSeparator />
          <NavRow
            title="Send money"
            description="Instant, free, to anyone"
            onPress={() => router.push("/templates/bank/send")}
          />
        </ListCard>
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
            title="Hide balances"
            description="Mask amounts on Home and Accounts"
          >
            <Switch
              value={bank.hideBalances}
              onValueChange={bank.setHideBalances}
              accessibilityLabel="Hide balances"
              isDark={bank.darkMode}
            />
          </SettingRow>
          <RowSeparator />
          <SettingRow
            title="Notifications"
            description="Payments, bills and security alerts"
          >
            <Switch
              value={bank.notifications}
              onValueChange={bank.setNotifications}
              accessibilityLabel="Notifications"
              isDark={bank.darkMode}
            />
          </SettingRow>
        </ListCard>
      </View>

      <View>
        <SectionTitle>Security</SectionTitle>
        <ListCard>
          <SettingRow
            title="Biometric sign-in"
            description="Face ID / fingerprint instead of a PIN"
          >
            <Switch
              value={bank.biometrics}
              onValueChange={bank.setBiometrics}
              accessibilityLabel="Biometric sign-in"
              isDark={bank.darkMode}
            />
          </SettingRow>
          <RowSeparator />
          <SettingRow
            title="Card frozen"
            description="Mirrors the freeze switch on the Cards tab"
          >
            <Switch
              value={bank.cardFrozen}
              onValueChange={bank.setCardFrozen}
              accessibilityLabel="Card frozen"
              isDark={bank.darkMode}
            />
          </SettingRow>
        </ListCard>
      </View>

      <Button
        isDark={bank.darkMode}
        accessibilityLabel="Log out"
        variant="glass"
        onPress={() => {
          bank.setSignedOut(true);
          router.replace("/templates/bank/signed-out");
        }}
      >
        Log out
      </Button>
      <T variant="caption" muted style={styles.foot}>
        Northwind Bank · Template build — no real money moves anywhere
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
  backdropBody: { padding: 16, gap: 12 },
  backdropNote: { marginTop: 4 },
  foot: { textAlign: "center" },
});
