import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, SegmentedControl, Switch } from "glacia-native";

import { useWallet, type DisplayCurrency } from "../state";
import {
  BackdropControl,
  Figure,
  ListCard,
  NavRow,
  RowSeparator,
  Screen,
  SectionTitle,
  SettingRow,
  T,
} from "../ui";

const CURRENCIES: DisplayCurrency[] = ["USD", "EUR", "GBP"];

export default function ProfileScreen() {
  const wallet = useWallet();
  const currencyIndex = CURRENCIES.indexOf(wallet.currency);

  return (
    <Screen belowTabBar title="Profile" subtitle="Display, security and settings">
      {/* Profile header */}
      <View style={styles.header}>
        <Avatar name={wallet.userName} size="lg" isDark={wallet.darkMode} source={wallet.userImage} />
        <View style={styles.headerText}>
          <T variant="heading">{wallet.userName}</T>
          <T variant="body" muted>
            {wallet.userHandle} · Orbit member since 2022
          </T>
          <Figure variant="caption" muted>
            Portfolio {wallet.fmt(wallet.totalUSD)} · {wallet.payLink}
          </Figure>
        </View>
      </View>

      <View>
        <SectionTitle>Actions</SectionTitle>
        <ListCard>
          <NavRow
            title="Add money"
            description="Top up USD cash from a card"
            onPress={() => router.push("/templates/wallet/topup")}
          />
          <RowSeparator />
          <NavRow
            title="Send money"
            description="To any Orbit user"
            onPress={() => router.push("/templates/wallet/send")}
          />
          <RowSeparator />
          <NavRow
            title="Request money"
            description="Your payment code and link"
            detail={`${wallet.requestCount} shared`}
            onPress={() => router.push("/templates/wallet/request")}
          />
        </ListCard>
      </View>

      <View>
        <SectionTitle>Display currency</SectionTitle>
        <SegmentedControl
          segments={CURRENCIES}
          selectedIndex={currencyIndex}
          onChange={(i) => wallet.setCurrency(CURRENCIES[i])}
          accessibilityLabel="Display currency"
          isDark={wallet.darkMode}
        />
        <T variant="caption" muted style={styles.fxNote}>
          Re-values the portfolio at simulated FX rates — EUR 0.92, GBP 0.79 per USD
        </T>
      </View>

      <View>
        <SectionTitle>Background</SectionTitle>
        <BackdropControl />
      </View>

      <View>
        <SectionTitle>App</SectionTitle>
        <ListCard>
          <SettingRow
            title="Hide balances"
            description="Mask amounts on Portfolio and asset pages"
          >
            <Switch
              value={wallet.hideBalances}
              onValueChange={wallet.setHideBalances}
              accessibilityLabel="Hide balances"
              isDark={wallet.darkMode}
            />
          </SettingRow>
          <RowSeparator />
          <SettingRow
            title="Price alerts"
            description="Notify on 5%+ moves in assets you hold"
          >
            <Switch
              value={wallet.priceAlerts}
              onValueChange={wallet.setPriceAlerts}
              accessibilityLabel="Price alerts"
              isDark={wallet.darkMode}
            />
          </SettingRow>
        </ListCard>
      </View>

      <View>
        <SectionTitle>Security</SectionTitle>
        <ListCard>
          <SettingRow
            title="Biometric unlock"
            description="Face ID / fingerprint to open the wallet"
          >
            <Switch
              value={wallet.biometrics}
              onValueChange={wallet.setBiometrics}
              accessibilityLabel="Biometric unlock"
              isDark={wallet.darkMode}
            />
          </SettingRow>
          <RowSeparator />
          <SettingRow
            title="Confirm large trades"
            description="Ask again before any trade above $500"
          >
            <Switch
              value={wallet.confirmAbove500}
              onValueChange={wallet.setConfirmAbove500}
              accessibilityLabel="Confirm large trades"
              isDark={wallet.darkMode}
            />
          </SettingRow>
        </ListCard>
      </View>

      <T variant="caption" muted style={styles.foot}>
        Orbit Wallet · Template build — all prices, FX rates and balances are
        simulated fixtures, and no real assets move
      </T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 16 },
  headerText: { flex: 1, gap: 4 },
  fxNote: { marginTop: 8, marginLeft: 4 },
  foot: { textAlign: "center" },
});
