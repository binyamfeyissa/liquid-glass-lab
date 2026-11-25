import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Button, Card } from "glacia-native";

import {
  POPULAR_PLACES,
  RIDE_CLASSES,
  fareFor,
  type Place,
} from "../data";
import { useRide } from "../state";
import {
  Figure,
  ListCard,
  MapPanel,
  RowSeparator,
  Screen,
  SectionTitle,
  T,
  accentColor,
  inkColor,
  money,
} from "../ui";

function PlaceRow({
  place,
  selected,
  onPress,
}: {
  place: Place;
  selected?: boolean;
  onPress: () => void;
}) {
  const ride = useRide();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Go to ${place.label}, ${place.address}`}
      accessibilityState={{ selected: !!selected }}
      style={({ pressed }) => [
        styles.placeRow,
        selected && {
          backgroundColor:
            ride.backdrop === "light"
              ? "rgba(161,98,7,0.08)"
              : "rgba(245,197,24,0.10)",
        },
        pressed && { opacity: 0.85 },
      ]}
    >
      <Avatar name={place.label} size="md" isDark={ride.darkMode} />
      <View style={styles.placeText}>
        <T variant="body" numberOfLines={1}>
          {place.label}
        </T>
        <T variant="caption" muted style={styles.placeSub}>
          {place.address}
        </T>
      </View>
      <Figure variant="caption" muted>
        {place.distanceKm.toFixed(1)} km · {place.durationMin} min
      </Figure>
    </Pressable>
  );
}

export default function HomeScreen() {
  const ride = useRide();
  const [destination, setDestination] = useState<Place | null>(null);
  const [classId, setClassId] = useState(RIDE_CLASSES[0].id);

  const selectedClass = useMemo(
    () => RIDE_CLASSES.find((c) => c.id === classId) ?? RIDE_CLASSES[0],
    [classId],
  );
  const quote = destination
    ? fareFor(selectedClass, destination.distanceKm, destination.durationMin)
    : null;

  return (
    <Screen title="Drift" subtitle="Where to?">
      <Card isDark={ride.darkMode} padding={0} style={styles.mapCard}>
        <MapPanel height={210} destinationLabel={destination?.label} />
      </Card>

      {/* Pickup — fixed fixture point, shown for orientation. */}
      <ListCard>
        <View style={styles.pickupRow}>
          <View
            style={[
              styles.pickupDotRing,
              {
                backgroundColor: ride.darkMode
                  ? "rgba(255,255,255,0.18)"
                  : "rgba(31,27,22,0.14)",
              },
            ]}
          >
            <View
              style={[
                styles.pickupDot,
                { backgroundColor: inkColor(ride.backdrop) },
              ]}
            />
          </View>
          <View style={styles.placeText}>
            <T variant="caption" muted>
              Pickup
            </T>
            <T variant="body">248 Maple St · Current location</T>
          </View>
        </View>
      </ListCard>

      <View>
        <SectionTitle>Saved places</SectionTitle>
        <ListCard>
          {ride.savedPlaces.map((place, i) => (
            <View key={place.id}>
              {i > 0 ? <RowSeparator /> : null}
              <PlaceRow
                place={place}
                selected={destination?.id === place.id}
                onPress={() => setDestination(place)}
              />
            </View>
          ))}
        </ListCard>
      </View>

      <View>
        <SectionTitle>Popular nearby</SectionTitle>
        <ListCard>
          {POPULAR_PLACES.map((place, i) => (
            <View key={place.id}>
              {i > 0 ? <RowSeparator /> : null}
              <PlaceRow
                place={place}
                selected={destination?.id === place.id}
                onPress={() => setDestination(place)}
              />
            </View>
          ))}
        </ListCard>
      </View>

      <View>
        <SectionTitle>Choose a ride</SectionTitle>
        <View style={styles.classList}>
          {RIDE_CLASSES.map((rc) => {
            const selected = rc.id === classId;
            const price = destination
              ? fareFor(rc, destination.distanceKm, destination.durationMin).total
              : null;
            return (
              <Pressable
                key={rc.id}
                onPress={() => setClassId(rc.id)}
                accessibilityRole="button"
                accessibilityLabel={`${rc.name}, ${rc.blurb}, ${rc.seats} seats`}
                accessibilityState={{ selected }}
                style={({ pressed }) => [pressed && { opacity: 0.85 }]}
              >
                <Card
                  isDark={ride.darkMode}
                  padding={16}
                  style={
                    selected
                      ? {
                          borderWidth: 1.5,
                          borderColor: accentColor(ride.backdrop),
                        }
                      : undefined
                  }
                  contentStyle={styles.classCard}
                >
                  <View style={styles.placeText}>
                    <T variant="heading">{rc.name}</T>
                    <T variant="caption" muted>
                      {rc.blurb} · {rc.seats} seats · {rc.etaMin} min away
                    </T>
                  </View>
                  {price !== null ? (
                    <Figure variant="heading">{money(price)}</Figure>
                  ) : (
                    <T variant="caption" muted>
                      Pick a place
                    </T>
                  )}
                </Card>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Button
        accessibilityLabel={
          destination
            ? `Request ${selectedClass.name} to ${destination.label} for ${quote ? money(quote.total) : ""}`
            : "Request ride — pick a destination first"
        }
        variant="filled"
        size="lg"
        disabled={!destination}
        onPress={() => {
          if (!destination) return;
          ride.startBooking(destination, classId);
          router.push("/templates/ride/trip");
        }}
      >
        {destination
          ? `Request ${selectedClass.name} · ${quote ? money(quote.total) : ""}`
          : "Pick a destination to ride"}
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  mapCard: {
    overflow: "hidden",
  },
  pickupRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  pickupDotRing: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 7,
  },
  pickupDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  placeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: 12,
  },
  placeText: { flex: 1 },
  placeSub: { marginTop: 4 },
  classList: { gap: 8 },
  classCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
});
