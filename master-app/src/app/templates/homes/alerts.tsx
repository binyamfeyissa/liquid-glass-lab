import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Input, SegmentedControl, Select, Switch } from "glacia-native";

import { PROPERTIES, money } from "./data";
import { useHomes, type SearchAlert } from "./state";
import {
  ListCard,
  RowSeparator,
  SectionTitle,
  SettingRow,
  StackHeader,
  T,
  accentColor,
  errorColor,
} from "./ui";

const MAX_PRICE_OPTIONS = [
  { label: "No limit", value: "none" },
  { label: "Up to $250k", value: "250000" },
  { label: "Up to $400k", value: "400000" },
  { label: "Up to $550k", value: "550000" },
  { label: "Up to $750k", value: "750000" },
  { label: "Up to $1M", value: "1000000" },
];

const BED_SEGMENTS = ["Any", "1+", "2+", "3+", "4+"];

/** How many current listings an alert would match right now. */
function matchCount(alert: SearchAlert): number {
  const q = alert.query.trim().toLowerCase();
  return PROPERTIES.filter((p) => (alert.maxPrice == null ? true : p.price <= alert.maxPrice))
    .filter((p) => p.beds >= alert.minBeds)
    .filter(
      (p) =>
        !q ||
        `${p.title} ${p.address} ${p.area} ${p.type}`.toLowerCase().includes(q),
    ).length;
}

function describe(alert: SearchAlert): string {
  const parts: string[] = [];
  if (alert.query.trim()) parts.push(`"${alert.query.trim()}"`);
  if (alert.maxPrice != null) parts.push(`under ${money(alert.maxPrice)}`);
  if (alert.minBeds > 0) parts.push(`${alert.minBeds}+ beds`);
  return parts.length ? parts.join(" · ") : "Any new home";
}

export default function AlertsScreen() {
  const { darkMode, backdrop, alerts, addAlert, setAlertActive, deleteAlert } = useHomes();
  const [query, setQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState("none");
  const [bedsIndex, setBedsIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);

  const create = () => {
    if (!query.trim() && maxPrice === "none" && bedsIndex === 0) {
      setError("Give the alert something to watch for — an area, a price cap, or a bedroom count");
      setCreated(false);
      return;
    }
    setError(null);
    addAlert({
      query: query.trim(),
      maxPrice: maxPrice === "none" ? null : Number(maxPrice),
      minBeds: bedsIndex,
    });
    setQuery("");
    setMaxPrice("none");
    setBedsIndex(0);
    setCreated(true);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <StackHeader title="Search alerts" subtitle="Saved searches that watch for new homes" />

      <View>
        <SectionTitle>New alert</SectionTitle>
        <View style={styles.form}>
          <View>
            <T variant="caption" muted style={styles.label}>
              Area, street or keyword (optional)
            </T>
            <Input
              value={query}
              onChangeText={(v) => {
                setQuery(v);
                setCreated(false);
              }}
              placeholder="e.g. Northside"
              accessibilityLabel="Alert keyword"
              isDark={darkMode}
            />
          </View>
          <View>
            <T variant="caption" muted style={styles.label}>
              Max price
            </T>
            <Select
              value={maxPrice}
              onValueChange={(v) => {
                setMaxPrice(v);
                setCreated(false);
              }}
              options={MAX_PRICE_OPTIONS}
              accessibilityLabel="Alert maximum price"
              isDark={darkMode}
            />
          </View>
          <View>
            <T variant="caption" muted style={styles.label}>
              Minimum bedrooms
            </T>
            <SegmentedControl
              segments={BED_SEGMENTS}
              selectedIndex={bedsIndex}
              onChange={(i) => {
                setBedsIndex(i);
                setCreated(false);
              }}
              accessibilityLabel="Alert minimum bedrooms"
              isDark={darkMode}
            />
          </View>
          {error ? (
            <T variant="caption" style={{ color: errorColor(backdrop) }}>
              {error}
            </T>
          ) : null}
          {created ? (
            <T variant="caption" style={{ color: accentColor(backdrop) }}>
              Alert created — it is in the list below
            </T>
          ) : null}
          <Button
            variant="filled"
            accessibilityLabel="Create alert"
            isDark={darkMode}
            onPress={create}
          >
            Create alert
          </Button>
        </View>
      </View>

      <View>
        <SectionTitle>Your alerts ({alerts.length})</SectionTitle>
        {alerts.length === 0 ? (
          <Card isDark={darkMode} padding={20}>
            <T variant="body">No alerts yet</T>
            <T variant="caption" muted style={styles.hint}>
              Create one above and new matches will be flagged here
            </T>
          </Card>
        ) : (
          <ListCard>
            {alerts.map((alert, i) => (
              <View key={alert.id}>
                {i > 0 ? <RowSeparator /> : null}
                <SettingRow
                  title={describe(alert)}
                  description={`${matchCount(alert)} current ${matchCount(alert) === 1 ? "match" : "matches"}`}
                >
                  <View style={styles.alertControls}>
                    <Switch
                      value={alert.active}
                      onValueChange={(v) => setAlertActive(alert.id, v)}
                      accessibilityLabel={`Alert active: ${describe(alert)}`}
                      isDark={darkMode}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      accessibilityLabel={`Delete alert: ${describe(alert)}`}
                      isDark={darkMode}
                      onPress={() => deleteAlert(alert.id)}
                    >
                      Delete
                    </Button>
                  </View>
                </SettingRow>
              </View>
            ))}
          </ListCard>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 36,
    gap: 20,
  },
  form: {
    gap: 16,
  },
  label: {
    marginBottom: 8,
    marginLeft: 4,
  },
  hint: {
    marginTop: 4,
  },
  alertControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
