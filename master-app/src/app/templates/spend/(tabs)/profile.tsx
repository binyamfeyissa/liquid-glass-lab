import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Button, SegmentedControl, Switch } from "glacia-native";

import { CURRENCIES, CURRENT_MONTH, useTally } from "../state";
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

export default function ProfileScreen() {
  const tally = useTally();
  const currencyIndex = CURRENCIES.indexOf(tally.currency);
  const spent = tally.spentForMonth(CURRENT_MONTH);

  return (
    <Screen title="Profile" subtitle="Your details and settings">
      {/* Profile header */}
      <View style={styles.header}>
        <Avatar name={tally.userName} source={tally.userImage} size="lg" isDark={tally.darkMode} status="online" />
        <View style={styles.headerText}>
          <T variant="heading">{tally.userName}</T>
          <T variant="body" muted>
            Tracking since September 2026
          </T>
          <Figure variant="caption" muted>
            {tally.format(spent)} spent in November
          </Figure>
        </View>
      </View>

      <View>
        <SectionTitle>Money</SectionTitle>
        <ListCard>
          <NavRow
            title="Savings goals"
            description="Emergency fund, trips and big buys"
            detail={`${tally.goals.length}`}
            onPress={() => router.push("/templates/spend/goals")}
          />
          <RowSeparator />
          <NavRow
            title="Recurring"
            description="Subscriptions and fixed bills"
            detail={`${tally.format(tally.recurringTotal)}/mo`}
            onPress={() => router.push("/templates/spend/recurring")}
          />
          <RowSeparator />
          <NavRow
            title="Add expense"
            description="Log a payment"
            onPress={() => router.push("/templates/spend/add")}
          />
        </ListCard>
      </View>

      <View>
        <SectionTitle>Display currency</SectionTitle>
        <SegmentedControl
          segments={[...CURRENCIES]}
          selectedIndex={currencyIndex}
          onChange={(index) => tally.setCurrency(CURRENCIES[index])}
          isDark={tally.darkMode}
          accessibilityLabel="Display currency"
        />
        <T variant="caption" muted style={styles.currencyNote}>
          Amounts are stored in USD and shown at fixed rates — EUR 0.92,
          GBP 0.79
        </T>
      </View>

      <View>
        <SectionTitle>Background</SectionTitle>
        <BackdropControl />
        <T variant="caption" muted style={styles.currencyNote}>
          Graphite, broken white, or the palm photo behind the glass
        </T>
      </View>

      <View>
        <SectionTitle>App</SectionTitle>
        <ListCard>
          <SettingRow
            title="Notifications"
            description="Weekly summary and goal milestones"
          >
            <Switch
              value={tally.notifications}
              onValueChange={tally.setNotifications}
              accessibilityLabel="Notifications"
              isDark={tally.darkMode}
            />
          </SettingRow>
          <RowSeparator />
          <SettingRow
            title="Budget alerts"
            description="Warn when a category passes 80% of its limit"
          >
            <Switch
              value={tally.budgetAlerts}
              onValueChange={tally.setBudgetAlerts}
              accessibilityLabel="Budget alerts"
              isDark={tally.darkMode}
            />
          </SettingRow>
        </ListCard>
      </View>

      <Button
        isDark={tally.darkMode}
        accessibilityLabel="Reset demo data"
        variant="glass"
        onPress={tally.resetDemo}
      >
        Reset demo data
      </Button>

      <T variant="caption" muted style={styles.foot}>
        Sample data — all fixtures
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
  currencyNote: { marginTop: 8, paddingHorizontal: 4 },
  foot: { textAlign: "center" },
});
