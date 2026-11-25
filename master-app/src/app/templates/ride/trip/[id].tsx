import React from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Avatar, Badge, Button } from "glacia-native";

import { useRide } from "../state";
import {
  FareBreakdown,
  Figure,
  ListCard,
  MapPanel,
  RowSeparator,
  Screen,
  SectionTitle,
  Stars,
  T,
  accentColor,
  inkColor,
} from "../ui";

export default function TripDetailScreen() {
  const ride = useRide();
  const { id } = useLocalSearchParams<{ id: string }>();
  const trip = id ? ride.tripById(id) : undefined;

  if (!trip) {
    return (
      <Screen title="Trip not found" subtitle="This receipt is no longer available.">
        <Button
          accessibilityLabel="Back to activity"
          variant="filled"
          onPress={() => router.replace("/templates/ride/(tabs)/activity")}
        >
          Back to Activity
        </Button>
      </Screen>
    );
  }

  return (
    <Screen title={trip.destinationLabel} subtitle={`${trip.dateLabel} · ${trip.rideClassName}`}>
      <MapPanel height={160} progress={1} destinationLabel={trip.destinationLabel} />

      <View>
        <SectionTitle>Route</SectionTitle>
        <ListCard>
          <View style={styles.routeRow}>
            <View style={[styles.dot, { backgroundColor: inkColor(ride.backdrop) }]} />
            <View style={styles.routeText}>
              <T variant="body">{trip.pickupAddress}</T>
              <T variant="caption" muted>
                Pickup
              </T>
            </View>
          </View>
          <RowSeparator />
          <View style={styles.routeRow}>
            <View style={[styles.dot, { backgroundColor: accentColor(ride.backdrop) }]} />
            <View style={styles.routeText}>
              <T variant="body">{trip.destinationAddress}</T>
              <Figure variant="caption" muted>
                Drop-off · {trip.distanceKm.toFixed(1)} km · {trip.durationMin} min
              </Figure>
            </View>
            <Badge
              tone={trip.status === "completed" ? "muted" : "destructive"}
              isDark={ride.darkMode}
            >
              {trip.status === "completed" ? "Completed" : "Unpaid"}
            </Badge>
          </View>
        </ListCard>
      </View>

      <View>
        <SectionTitle>Driver</SectionTitle>
        <ListCard>
          <View style={styles.driverRow}>
            <Avatar name={trip.driver.name} size="md" isDark={ride.darkMode} />
            <View style={styles.routeText}>
              <T variant="body">{trip.driver.name}</T>
              <T variant="caption" muted>
                {trip.driver.car} · {trip.driver.plate}
              </T>
            </View>
            {trip.rating ? (
              <Stars value={trip.rating} size={16} />
            ) : (
              <T variant="caption" muted>
                Not rated
              </T>
            )}
          </View>
        </ListCard>
      </View>

      <View>
        <SectionTitle>Receipt</SectionTitle>
        <FareBreakdown fare={trip.fare} tip={trip.tip} />
      </View>

      {trip.status === "unpaid" ? (
        <Button
          accessibilityLabel="Pay for this trip now"
          variant="filled"
          onPress={() => router.push({ pathname: "/templates/ride/complete", params: { id: trip.id } })}
        >
          Pay now
        </Button>
      ) : null}
      <Button
        accessibilityLabel="Back to activity"
        variant="ghost"
        onPress={() => router.back()}
      >
        Back
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  routeText: { flex: 1, gap: 4 },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  driverRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});
