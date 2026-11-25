import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Button, Card, Switch } from "glacia-native";

import { useTally } from "./state";
import {
  Figure,
  ListCard,
  RowSeparator,
  Screen,
  SectionTitle,
  T,
} from "./ui";

export default function RecurringScreen() {
  const tally = useTally();
  const activeCount = tally.recurring.filter((r) => r.active).length;

  return (
    <Screen title="Recurring" subtitle="Fixed bills and subscriptions">
      <Card isDark={tally.darkMode} padding={24}>
        <T variant="label" muted>
          Monthly recurring
        </T>
        <View style={styles.totalRow}>
          <Figure variant="title">{tally.format(tally.recurringTotal)}</Figure>
          <T variant="body" muted>
            {" "}
            / month
          </T>
        </View>
        <Figure variant="caption" muted>
          {activeCount} of {tally.recurring.length} items active ·{" "}
          {tally.format(tally.recurringTotal * 12)} a year
        </Figure>
      </Card>

      <View>
        <SectionTitle>Items</SectionTitle>
        <ListCard>
          {tally.recurring.map((item, i) => (
            <React.Fragment key={item.id}>
              {i > 0 ? <RowSeparator /> : null}
              <View style={styles.row}>
                <Avatar
                  name={item.name.split(" ")[0]}
                  size="md"
                  isDark={tally.darkMode}
                />
                <View style={styles.rowText}>
                  <View style={styles.rowLine}>
                    <T variant="body" numberOfLines={1} style={styles.rowName}>
                      {item.name}
                    </T>
                    <Figure
                      variant="body"
                      style={!item.active ? styles.inactive : undefined}
                    >
                      {tally.format(item.amount)}
                    </Figure>
                  </View>
                  <View style={styles.rowLine}>
                    <T
                      variant="caption"
                      muted
                      numberOfLines={1}
                      style={styles.rowName}
                    >
                      {item.detail} · Next {item.nextLabel}
                    </T>
                    <Switch
                      value={item.active}
                      onValueChange={(value) =>
                        tally.setRecurringActive(item.id, value)
                      }
                      accessibilityLabel={`${item.name} active`}
                      isDark={tally.darkMode}
                    />
                  </View>
                </View>
              </View>
            </React.Fragment>
          ))}
        </ListCard>
      </View>

      <T variant="caption" muted style={styles.foot}>
        Pausing an item updates the tally only — it does not cancel the
        subscription with the provider
      </T>

      <Button accessibilityLabel="Back" variant="ghost" onPress={() => router.back()}>
        Back
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  totalRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  rowText: { flex: 1, gap: 4 },
  rowLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  rowName: { flex: 1 },
  inactive: { opacity: 0.45 },
  foot: { paddingHorizontal: 4 },
});
