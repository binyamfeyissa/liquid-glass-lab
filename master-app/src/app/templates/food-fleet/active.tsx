import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, Card, Progress } from "glacia-native";

import { STAGES, useFleet } from "./state";
import {
  Figure,
  ListCard,
  RestaurantTile,
  RowSeparator,
  Screen,
  SectionTitle,
  T,
  accentColor,
  chromeColors,
  money,
} from "./ui";

export default function ActiveScreen() {
  const fleet = useFleet();
  const job = fleet.activeJob;

  if (!job) {
    return (
      <Screen title="Active job" subtitle="No delivery in progress">
        <Card isDark={fleet.darkMode} padding={20}>
          <T variant="body" muted>
            You have no active delivery. Accept an offer from Home and it will
            appear here
          </T>
          <Button
            accessibilityLabel="Back to home"
            variant="filled"
            onPress={() => router.replace("/templates/food-fleet/(tabs)")}
            style={styles.backButton}
          >
            Back to Home
          </Button>
        </Card>
      </Screen>
    );
  }

  const stage = fleet.stage;
  const isLast = stage === STAGES.length - 1;
  const accent = accentColor(fleet.backdrop);
  const chrome = chromeColors(fleet.backdrop);

  const finish = () => {
    fleet.advanceStage();
    router.replace("/templates/food-fleet/(tabs)");
  };

  return (
    <Screen title="Active delivery">
      {/* Step progress */}
      <View>
        <Progress
          value={((stage + 1) / STAGES.length) * 100}
          accessibilityLabel={`Step ${stage + 1} of ${STAGES.length}`}
          isDark={fleet.darkMode}
          tint={accent}
        />
        <View style={styles.stageRow}>
          {STAGES.map((label, i) => (
            <T
              key={label}
              variant="caption"
              muted={i > stage}
              style={{
                fontSize: 11,
                ...(i === stage
                  ? { color: accent, fontWeight: "600" as const }
                  : null),
              }}
            >
              {label}
            </T>
          ))}
        </View>
      </View>

      {/* Composed route panel — a stylised panel, not a real map */}
      <View>
        <SectionTitle>Route</SectionTitle>
        <View style={[styles.routePanel, { backgroundColor: chrome.bar }]}>
          <View style={styles.stopRow}>
            <View style={[styles.stopDot, { backgroundColor: accent }]} />
            <View style={styles.flex}>
              <T variant="body" style={styles.routeText}>
                Pick up · {job.restaurant}
              </T>
              <T variant="caption" muted style={styles.routeSub}>
                {job.pickupAddress}
              </T>
            </View>
            {job.pickupTime ? (
              <Figure variant="caption" muted>
                {job.pickupTime}
              </Figure>
            ) : null}
          </View>
          <View style={[styles.routeLine, { backgroundColor: chrome.line }]} />
          <View style={styles.stopRow}>
            <View
              style={[
                styles.stopDot,
                {
                  backgroundColor:
                    fleet.backdrop === "light" ? "#1f1b16" : "#ededed",
                },
              ]}
            />
            <View style={styles.flex}>
              <T variant="body" style={styles.routeText}>
                Drop off · {job.customerName}
              </T>
              <T variant="caption" muted style={styles.routeSub}>
                {job.dropoffAddress}
              </T>
            </View>
            <T variant="caption" muted>
              {job.distanceKm.toFixed(1)} km
            </T>
          </View>
        </View>
      </View>

      {/* Order details */}
      <View>
        <SectionTitle>Order</SectionTitle>
        <ListCard>
          <View style={styles.detailPad}>
            <View style={styles.head}>
              <RestaurantTile name={job.restaurant} colors={job.colors} />
              <View style={styles.flex}>
                <T variant="body">{job.items}</T>
                <T variant="caption" muted>
                  Order total {money(job.orderTotal)} · pre-paid by customer
                </T>
              </View>
            </View>
            {job.note ? (
              <>
                <RowSeparator />
                <T variant="body" style={styles.note}>
                  {job.note}
                </T>
                <T variant="caption" muted>
                  Customer note
                </T>
              </>
            ) : null}
          </View>
        </ListCard>
      </View>

      {/* The one big step button */}
      <Button
        accessibilityLabel={STAGES[stage]}
        variant="filled"
        size="lg"
        onPress={isLast ? finish : fleet.advanceStage}
      >
        {isLast ? `Confirm delivery · earn ${money(job.payout)}` : STAGES[stage]}
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backButton: { marginTop: 16 },
  stageRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  routePanel: {
    borderRadius: 20,
    padding: 20,
    gap: 4,
  },
  stopRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  stopDot: { width: 12, height: 12, borderRadius: 6 },
  routeLine: {
    width: 2,
    height: 24,
    marginLeft: 5,
  },
  routeText: { fontWeight: "600" },
  routeSub: { marginTop: 2 },
  detailPad: { padding: 16, gap: 4 },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  note: { marginTop: 4 },
});
