import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Avatar, Badge, Button, Card, Chip } from "glacia-native";

import { useRide } from "./state";
import { FareBreakdown, Figure, Screen, SectionTitle, Stars, T, money } from "./ui";

const TIP_OPTIONS = [0, 0.05, 0.1, 0.15];

export default function CompleteScreen() {
  const ride = useRide();
  const { id } = useLocalSearchParams<{ id: string }>();
  const trip = id ? ride.tripById(id) : undefined;
  const [tipPct, setTipPct] = useState(0.1);
  const [rating, setRating] = useState(5);

  const tip = useMemo(
    () => (trip ? Math.round(trip.fare.total * tipPct * 100) / 100 : 0),
    [trip, tipPct],
  );

  if (!trip) {
    return (
      <Screen title="Trip not found" subtitle="This receipt is no longer available.">
        <Button
          isDark={ride.darkMode}
          accessibilityLabel="Back to home"
          variant="glass"
          onPress={() => router.replace("/templates/ride/(tabs)")}
        >
          Back to home
        </Button>
      </Screen>
    );
  }

  const paid = trip.status === "completed";

  if (paid) {
    return (
      <Screen title="Payment complete" subtitle="Receipt saved to Activity">
        <Card isDark={ride.darkMode} padding={20} contentStyle={styles.doneCard}>
          <Figure variant="title">{money(trip.fare.total + trip.tip)}</Figure>
          <T variant="heading">Paid</T>
          <T variant="body" muted>
            {trip.rideClassName} to {trip.destinationLabel}
            {ride.defaultCard
              ? ` · Charged to ${ride.defaultCard.brand} ••${ride.defaultCard.last4}`
              : ""}
          </T>
          <View style={styles.doneStars}>
            <Stars value={trip.rating ?? rating} />
          </View>
          <Badge tone="muted" isDark={ride.darkMode}>
            Completed
          </Badge>
        </Card>
        <Button
          isDark={ride.darkMode}
          accessibilityLabel="Done — back to home"
          variant="filled"
          onPress={() => router.replace("/templates/ride/(tabs)")}
        >
          Done
        </Button>
        <Button
          isDark={ride.darkMode}
          accessibilityLabel="View this trip in Activity"
          variant="ghost"
          onPress={() => router.replace("/templates/ride/(tabs)/activity")}
        >
          View in Activity
        </Button>
      </Screen>
    );
  }

  return (
    <Screen title="You have arrived" subtitle={`${trip.destinationLabel} · ${trip.dateLabel}`}>
      {/* Driver + rating */}
      <Card isDark={ride.darkMode} padding={16} contentStyle={styles.driverCard}>
        <Avatar name={trip.driver.name} size="lg" isDark={ride.darkMode} />
        <T variant="heading">How was {trip.driver.name.split(" ")[0]}?</T>
        <T variant="caption" muted>
          {trip.driver.car} · {trip.driver.plate}
        </T>
        <Stars value={rating} onChange={setRating} size={32} />
      </Card>

      <View>
        <SectionTitle>Fare breakdown</SectionTitle>
        <FareBreakdown fare={trip.fare} tip={tip} />
      </View>

      <View>
        <SectionTitle>Add a tip</SectionTitle>
        <View style={styles.tipRow}>
          {TIP_OPTIONS.map((pct) => (
            <Chip
              key={pct}
              label={pct === 0 ? "No tip" : `${Math.round(pct * 100)}%`}
              selected={tipPct === pct}
              onSelectedChange={(selected) => {
                if (selected) setTipPct(pct);
              }}
              isDark={ride.darkMode}
            />
          ))}
        </View>
        <T variant="caption" muted style={styles.tipNote}>
          {tip > 0
            ? `${money(tip)} goes to ${trip.driver.name.split(" ")[0]} in full.`
            : "Tips are optional and go to the driver in full."}
        </T>
      </View>

      <Button
        isDark={ride.darkMode}
        accessibilityLabel={`Pay ${money(trip.fare.total + tip)}`}
        variant="filled"
        size="lg"
        onPress={() => ride.payTrip(trip.id, tip, rating)}
      >{`Pay ${money(trip.fare.total + tip)}${ride.defaultCard ? ` · ${ride.defaultCard.brand} ••${ride.defaultCard.last4}` : ""}`}</Button>
      <T variant="caption" muted style={styles.foot}>
        Template build — no real payment is taken
      </T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  driverCard: {
    alignItems: "center",
    gap: 8,
  },
  doneCard: { alignItems: "center", gap: 8 },
  doneStars: { marginVertical: 4 },
  tipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tipNote: { marginTop: 8, marginLeft: 6 },
  foot: { textAlign: "center" },
});
