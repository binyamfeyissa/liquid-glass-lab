import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { AlertDialog, Avatar, Button, Card, Progress } from "glacia-native";

import { driverForClass, fareFor, classById } from "./data";
import { useRide } from "./state";
import { Figure, ListCard, MapPanel, RowSeparator, Screen, SectionTitle, T, accentColor, money } from "./ui";

type Stage = "searching" | "arriving" | "ontrip";

const SEARCH_LINES = [
  "Contacting nearby drivers",
  "Checking traffic on your route",
  "Confirming the best match",
];

const STAGE_LABEL: Record<Stage, string> = {
  searching: "Finding your driver",
  arriving: "Driver is on the way",
  ontrip: "On trip",
};

export default function TripScreen() {
  const ride = useRide();
  const booking = ride.booking;
  const [stage, setStage] = useState<Stage>("searching");
  const [searchLine, setSearchLine] = useState(0);
  const [progress, setProgress] = useState(4);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const finished = useRef(false);

  // Searching: cycle the status lines and fill the bar, then match.
  useEffect(() => {
    if (stage !== "searching") return;
    const lineTimer = setInterval(
      () => setSearchLine((n) => (n + 1) % SEARCH_LINES.length),
      900,
    );
    const barTimer = setInterval(
      () => setProgress((p) => Math.min(92, p + 9)),
      300,
    );
    const matchTimer = setTimeout(() => setStage("arriving"), 3000);
    return () => {
      clearInterval(lineTimer);
      clearInterval(barTimer);
      clearTimeout(matchTimer);
    };
  }, [stage]);

  if (!booking) {
    return (
      <Screen title="No ride in progress" subtitle="Your booking was cancelled or already finished.">
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

  const rc = classById(booking.rideClassId);
  const driver = driverForClass(rc.id);
  const fare = fareFor(rc, booking.destination.distanceKm, booking.destination.durationMin);

  const advance = () => {
    if (stage === "arriving") {
      setStage("ontrip");
    } else if (stage === "ontrip" && !finished.current) {
      finished.current = true;
      const trip = ride.finishRide();
      router.replace({ pathname: "/templates/ride/complete", params: { id: trip.id } });
    }
  };

  const stageIndex = stage === "searching" ? 0 : stage === "arriving" ? 1 : 2;
  const routeProgress = stage === "searching" ? 0 : stage === "arriving" ? 0.25 : 0.8;

  return (
    <Screen
      title={STAGE_LABEL[stage]}
      subtitle={`${rc.name} · To ${booking.destination.label}`}
    >
      <Card isDark={ride.darkMode} padding={0} style={styles.mapCard}>
        <MapPanel height={190} progress={routeProgress} destinationLabel={booking.destination.label} />
      </Card>

      {/* Stage tracker */}
      <ListCard>
        <View style={styles.stageBody}>
          <View style={styles.stageRow}>
            {["Matched", "Driver arriving", "On trip", "Arrived"].map((label, i) => {
              const done = i < stageIndex + 1;
              const current = i === stageIndex + 1;
              return (
                <View key={label} style={styles.stageItem}>
                  <View
                    style={[
                      styles.stageDot,
                      done && {
                        backgroundColor: ride.darkMode
                          ? "rgba(255,255,255,0.45)"
                          : "rgba(0,0,0,0.4)",
                      },
                      current && {
                        backgroundColor: accentColor(ride.backdrop),
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                      },
                    ]}
                  />
                  <T
                    variant="caption"
                    muted={!done && !current}
                    style={styles.stageLabel}
                  >
                    {label}
                  </T>
                </View>
              );
            })}
          </View>
          <Progress
            value={stage === "searching" ? progress : stage === "arriving" ? 45 : 80}
            accessibilityLabel="Trip progress"
            isDark={ride.darkMode}
          />
          {stage === "searching" ? (
            <T variant="body" muted style={styles.center}>
              {SEARCH_LINES[searchLine]}
            </T>
          ) : (
            <T variant="body" muted style={styles.center}>
              {stage === "arriving"
                ? `${driver.name.split(" ")[0]} arrives in about ${rc.etaMin} min · meet at 248 Maple St`
                : `About ${booking.destination.durationMin} min to ${booking.destination.label}`}
            </T>
          )}
        </View>
      </ListCard>

      {/* Driver card — appears once matched. */}
      {stage !== "searching" ? (
        <View>
          <SectionTitle>Your driver</SectionTitle>
          <ListCard>
            <View style={styles.driverRow}>
              <Avatar name={driver.name} source={driver.image} size="lg" isDark={ride.darkMode} status="online" />
              <View style={styles.driverText}>
                <T variant="heading">{driver.name}</T>
                <Figure variant="caption" muted>
                  {driver.rating.toFixed(2)} · {driver.trips.toLocaleString()} trips
                </Figure>
                <T variant="caption" muted>
                  {driver.car}
                </T>
              </View>
              <View
                style={[
                  styles.plate,
                  { backgroundColor: ride.darkMode ? "#232325" : "#efe9df" },
                ]}
              >
                <Figure variant="body">{driver.plate}</Figure>
              </View>
            </View>
            <RowSeparator />
            <View style={styles.fareRow}>
              <T variant="body" muted>
                {booking.destination.address} · {booking.destination.distanceKm.toFixed(1)} km
              </T>
              <Figure variant="heading">{money(fare.total)}</Figure>
            </View>
          </ListCard>
        </View>
      ) : null}

      {stage !== "searching" ? (
        <Button
          isDark={ride.darkMode}
          accessibilityLabel={stage === "arriving" ? "Simulate driver arrival" : "Simulate arrival at destination"}
          variant="filled"
          size="lg"
          onPress={advance}
        >
          {stage === "arriving" ? "Simulate: driver is here" : "Simulate: arrive at destination"}
        </Button>
      ) : null}

      <Button
        isDark={ride.darkMode}
        accessibilityLabel="Cancel this ride"
        variant="ghost"
        onPress={() => setConfirmCancel(true)}
      >
        Cancel ride
      </Button>

      <AlertDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Cancel this ride?"
        description={
          stage === "searching"
            ? "We'll stop looking for a driver. No charge — the trip hasn't started."
            : `${driver.name} is already assigned. Cancelling now is free in this template, but real apps may charge a fee.`
        }
        confirmLabel="Yes, cancel"
        cancelLabel="Keep my ride"
        destructive
        isDark={ride.darkMode}
        onConfirm={() => {
          ride.clearBooking();
          router.replace("/templates/ride/(tabs)");
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  mapCard: { overflow: "hidden" },
  stageBody: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 16,
  },
  stageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stageItem: {
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  stageDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(127,127,127,0.4)",
  },
  stageLabel: {
    textAlign: "center",
  },
  center: { textAlign: "center" },
  driverRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  driverText: { flex: 1, gap: 4 },
  plate: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  fareRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
});
