import React from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Card } from "glacia-native";

import { useFleet } from "../state";
import {
  Figure,
  ListCard,
  RestaurantTile,
  RowSeparator,
  Screen,
  SectionTitle,
  SettingRow,
  StatusBadge,
  T,
  money,
} from "../ui";

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const fleet = useFleet();
  const job = fleet.jobs.find((j) => j.id === id);

  if (!job) {
    return (
      <Screen title="Job" subtitle="Not found">
        <Card isDark={fleet.darkMode} padding={20}>
          <T variant="body" muted>
            This job is not on today's list
          </T>
          <Button
            accessibilityLabel="Back to jobs"
            variant="filled"
            onPress={() => router.replace("/templates/food-fleet/(tabs)/jobs")}
            style={styles.backButton}
          >
            Back to Jobs
          </Button>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen title={job.restaurant} subtitle={job.cuisine}>
      <ListCard>
        <View style={styles.pad}>
          <View style={styles.head}>
            <RestaurantTile name={job.restaurant} colors={job.colors} size={52} />
            <View style={styles.flex}>
              <Figure variant="heading">{money(job.payout)}</Figure>
              <T variant="caption" muted>
                payout · order {money(job.orderTotal)}
              </T>
            </View>
            <StatusBadge status={job.status} />
          </View>
        </View>
        <RowSeparator />
        <SettingRow title="Picked up" description={job.pickupAddress}>
          <Figure variant="body">{job.pickupTime ?? "—"}</Figure>
        </SettingRow>
        <RowSeparator />
        <SettingRow
          title="Delivered"
          description={`${job.dropoffAddress} (${job.customerName})`}
        >
          <Figure variant="body">{job.deliveredTime ?? "—"}</Figure>
        </SettingRow>
        <RowSeparator />
        <SettingRow title="Distance">
          <Figure variant="body">{job.distanceKm.toFixed(1)} km</Figure>
        </SettingRow>
      </ListCard>

      <View>
        <SectionTitle>Order</SectionTitle>
        <ListCard>
          <View style={styles.pad}>
            <T variant="body">{job.items}</T>
            {job.note ? (
              <T variant="caption" muted style={styles.note}>
                Note: {job.note}
              </T>
            ) : null}
          </View>
        </ListCard>
      </View>

      <Button
        accessibilityLabel="Back to jobs"
        variant="ghost"
        onPress={() => router.back()}
      >
        Back to Jobs
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pad: { padding: 16 },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  note: { marginTop: 6 },
  backButton: { marginTop: 14 },
});
