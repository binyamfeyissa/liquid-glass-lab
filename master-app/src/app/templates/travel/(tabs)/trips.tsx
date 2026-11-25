import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, Card, SegmentedControl } from "glacia-native";

import {
  dateForOffset,
  formatShortDate,
  useTravel,
  type Booking,
} from "../state";
import { Figure, Plate, Screen, SERIF, StatusBadge, T } from "../ui";

const FILTERS = ["Upcoming", "Past", "Cancelled"];

export default function TripsScreen() {
  const { bookings, darkMode } = useTravel();
  const [filter, setFilter] = useState(0);

  const visible = useMemo(() => {
    const status = filter === 0 ? "upcoming" : filter === 1 ? "past" : "cancelled";
    return bookings
      .filter((b) => b.status === status)
      .sort((a, b) => a.checkInOffset - b.checkInOffset);
  }, [bookings, filter]);

  return (
    <Screen title="Trips">
      <SegmentedControl
        isDark={darkMode}
        segments={FILTERS}
        selectedIndex={filter}
        onChange={setFilter}
        accessibilityLabel="Filter trips by status"
      />

      {visible.length === 0 ? (
        <Card isDark={darkMode} padding={24} style={styles.empty}>
          <T variant="heading" style={styles.center}>
            {filter === 0
              ? "No trips coming up"
              : filter === 1
                ? "No past trips yet"
                : "No cancelled trips"}
          </T>
          <T variant="body" muted style={styles.center}>
            {filter === 0
              ? "When you book a stay, it will show up here with everything you need for the trip."
              : "Trips you finish or cancel will be filed here."}
          </T>
          {filter === 0 ? (
            <Button
              isDark={darkMode}
              variant="filled"
              accessibilityLabel="Explore stays"
              onPress={() => router.push("/templates/travel/(tabs)")}
            >
              Explore stays
            </Button>
          ) : null}
        </Card>
      ) : (
        <View style={styles.list}>
          {visible.map((booking) => (
            <TripCard key={booking.id} booking={booking} />
          ))}
        </View>
      )}
    </Screen>
  );
}

function TripCard({ booking }: { booking: Booking }) {
  const { stayById, destinationById, price, darkMode } = useTravel();
  const stay = stayById(booking.stayId);
  if (!stay) return null;
  const dest = destinationById(stay.destinationId);
  const checkIn = dateForOffset(booking.checkInOffset);
  const checkOut = dateForOffset(booking.checkInOffset + booking.nights);

  return (
    <Card
      isDark={darkMode}
      padding={12}
      onPress={() => router.push(`/templates/travel/trip/${booking.id}`)}
      accessibilityLabel={`Trip to ${dest?.city}: ${stay.title}`}
    >
      <Plate
        colors={stay.colors}
        label={dest?.city ?? "Wayfare"}
        height={130}
        radius={12}
        fontSize={28}
      />
      <View style={styles.meta}>
        <View style={styles.titleRow}>
          <T variant="body" style={[styles.flex, styles.placeName]} numberOfLines={1}>
            {dest?.city}, {dest?.country}
          </T>
          <StatusBadge status={booking.status} />
        </View>
        <T variant="caption" muted numberOfLines={1}>
          {stay.title}
        </T>
        <Figure variant="caption">
          {formatShortDate(checkIn)} – {formatShortDate(checkOut)}
        </Figure>
        <T variant="caption" muted>
          {booking.nights} nights · {booking.guests} guests ·{" "}
          <Figure variant="caption">{price(booking.totalUSD)}</Figure> · Ref{" "}
          <Figure variant="caption">{booking.ref}</Figure>
        </T>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { textAlign: "center" },
  empty: { alignItems: "center", gap: 12 },
  list: { gap: 16 },
  meta: { paddingHorizontal: 4, paddingTop: 12, paddingBottom: 4, gap: 4 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  placeName: { fontFamily: SERIF },
});
