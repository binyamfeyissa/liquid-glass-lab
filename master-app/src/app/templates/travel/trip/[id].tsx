import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  colors,
  AlertDialog, Avatar, Button
} from "glacia-native";
import { ChevronLeft } from "lucide-react-native";

import { dateForOffset, formatDate, useTravel } from "../state";
import {
  Figure,
  ListCard,
  Plate,
  RowSeparator,
  SectionTitle,
  SERIF,
  StatusBadge,
  T,
} from "../ui";

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bookings, stayById, destinationById, price, darkMode, cancelBooking } =
    useTravel();
  const booking = bookings.find((b) => b.id === id);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  if (!booking) {
    return (
      <View style={styles.missing}>
        <T variant="title">Trip not found</T>
        <Button isDark={darkMode} accessibilityLabel="Go back" onPress={() => router.back()}>
          Go back
        </Button>
      </View>
    );
  }

  const stay = stayById(booking.stayId);
  if (!stay) return null;
  const dest = destinationById(stay.destinationId);
  const checkIn = dateForOffset(booking.checkInOffset);
  const checkOut = dateForOffset(booking.checkInOffset + booking.nights);

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Button
          isDark={darkMode}
          size="sm"
          shape="circle"
          accessibilityLabel="Back"
          onPress={() => router.back()}
        >
          <ChevronLeft size={18} color={darkMode ? colors.dark.foreground : colors.light.foreground} />
        </Button>
        <T variant="title" style={styles.title}>
          {dest?.city}
        </T>
        <StatusBadge status={booking.status} />
      </View>

      <Plate
        colors={stay.colors}
        label={dest?.city ?? "Wayfare"}
        height={180}
        radius={20}
        fontSize={36}
      />

      <View>
        <SectionTitle>Booking summary</SectionTitle>
        <ListCard>
          <View style={styles.inner}>
            <T variant="body" style={styles.stayTitle}>
              {stay.title}
            </T>
            <T variant="caption" muted>
              Booking reference <Figure variant="caption">{booking.ref}</Figure> · Demo booking — no payment taken
            </T>
          </View>
          <RowSeparator />
          <DetailRow label="Check-in" value={formatDate(checkIn)} />
          <RowSeparator />
          <DetailRow label="Check-out" value={formatDate(checkOut)} />
          <RowSeparator />
          <DetailRow label="Guests" value={`${booking.guests}`} />
          <RowSeparator />
          <DetailRow
            label={`${booking.nights} nights × nightly rate`}
            value={price(booking.nightlyUSD * booking.nights)}
          />
          <RowSeparator />
          <DetailRow label="Cleaning fee" value={price(booking.cleaningFeeUSD)} />
          <RowSeparator />
          <DetailRow label="Service fee" value={price(booking.serviceFeeUSD)} />
          <RowSeparator />
          <DetailRow label="Total" value={price(booking.totalUSD)} strong />
        </ListCard>
      </View>

      <View>
        <SectionTitle>Your host</SectionTitle>
        <ListCard>
          <View style={styles.hostRow}>
            <Avatar name={stay.hostName} size="md" isDark={darkMode} />
            <View style={styles.flex}>
              <T variant="body">{stay.hostName}</T>
              <T variant="caption" muted>
                Hosting since {stay.hostSince}
              </T>
            </View>
            <Button
              isDark={darkMode}
              size="sm"
              accessibilityLabel={`Message ${stay.hostName}`}
              onPress={() => router.push("/templates/travel/(tabs)/messages")}
            >
              Message
            </Button>
          </View>
        </ListCard>
      </View>

      <Button
        isDark={darkMode}
        accessibilityLabel="View the stay"
        onPress={() => router.push(`/templates/travel/stay/${stay.id}`)}
      >
        View the stay
      </Button>

      {booking.status === "upcoming" ? (
        <>
          <Button
            isDark={darkMode}
            accessibilityLabel="Cancel this booking"
            onPress={() => setConfirmingCancel(true)}
            textStyle={{ color: darkMode ? "#d97762" : "#b3402a" }}
          >
            Cancel booking
          </Button>
          <T variant="caption" muted style={styles.center}>
            Free cancellation in this demo, and until 7 days before check-in
            under the stay's policy.
          </T>
        </>
      ) : null}

      <AlertDialog
        isDark={darkMode}
        open={confirmingCancel}
        onOpenChange={setConfirmingCancel}
        title="Cancel this booking?"
        description={`${stay.title}, ${formatDate(checkIn)} – ${formatDate(checkOut)}. This can't be undone.`}
        confirmLabel="Cancel booking"
        cancelLabel="Keep my trip"
        destructive
        onConfirm={() => {
          cancelBooking(booking.id);
          setConfirmingCancel(false);
        }}
      />
    </ScrollView>
  );
}

function DetailRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <View style={styles.detailRow}>
      <T variant="body" muted={!strong} style={styles.flex}>
        {label}
      </T>
      <Figure variant="body" style={strong ? styles.strong : undefined}>
        {value}
      </Figure>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  missing: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  content: { paddingHorizontal: 24, paddingTop: 112, paddingBottom: 36, gap: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  title: { flex: 1, fontFamily: SERIF },
  center: { textAlign: "center" },
  strong: { fontWeight: "600" },
  inner: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, gap: 4 },
  stayTitle: { fontWeight: "600" },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  hostRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12 },
});
