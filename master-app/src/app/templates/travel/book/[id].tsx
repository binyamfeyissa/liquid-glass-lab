import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  colors,
  Badge, Button, Stepper
} from "glacia-native";
import { ChevronLeft } from "lucide-react-native";

import {
  dateForOffset,
  formatDate,
  serviceFeeFor,
  useTravel,
  type Booking,
} from "../state";
import {
  Figure,
  ListCard,
  Plate,
  RowSeparator,
  SectionTitle,
  T,
} from "../ui";

export default function BookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { stayById, destinationById, price, darkMode, addBooking } = useTravel();
  const stay = stayById(id ?? "");

  const [checkInOffset, setCheckInOffset] = useState(14);
  const [nights, setNights] = useState(3);
  const [guests, setGuests] = useState(2);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);

  const breakdown = useMemo(() => {
    if (!stay) return null;
    const subtotal = stay.pricePerNight * nights;
    const service = serviceFeeFor(subtotal);
    return {
      subtotal,
      service,
      total: subtotal + stay.cleaningFee + service,
    };
  }, [stay, nights]);

  if (!stay || !breakdown) {
    return (
      <View style={styles.missing}>
        <T variant="title">Stay not found</T>
        <Button isDark={darkMode} accessibilityLabel="Go back" onPress={() => router.back()}>
          Go back
        </Button>
      </View>
    );
  }

  const dest = destinationById(stay.destinationId);
  const checkIn = dateForOffset(checkInOffset);
  const checkOut = dateForOffset(checkInOffset + nights);

  /* ------------------------- success state ------------------------- */
  if (confirmed) {
    return (
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.badgeRow}>
          <Badge tone="muted" isDark={darkMode}>
            Booked
          </Badge>
        </View>
        <T variant="title" style={styles.center}>
          You're going to {dest?.city}
        </T>
        <T variant="body" muted style={styles.center}>
          Booking reference <Figure variant="body">{confirmed.ref}</Figure>
        </T>

        <ListCard>
          <View style={styles.summaryInner}>
            <Plate colors={stay.colors} label={dest?.city ?? "Wayfare"} height={110} radius={12} fontSize={26} image={stay.image} />
            <T variant="body" style={styles.summaryTitle}>
              {stay.title}
            </T>
            <Row label="Check-in" value={formatDate(dateForOffset(confirmed.checkInOffset))} />
            <Row label="Check-out" value={formatDate(dateForOffset(confirmed.checkInOffset + confirmed.nights))} />
            <Row label="Guests" value={`${confirmed.guests}`} />
            <Row label="Total" value={price(confirmed.totalUSD)} last />
          </View>
        </ListCard>

        <T variant="caption" muted style={styles.center}>
          Demo booking — no payment taken. {stay.hostName.split(" ")[0]} has been
          notified and sent you a message in the Messages tab.
        </T>

        <Button
          isDark={darkMode}
          variant="filled"
          accessibilityLabel="View my trips"
          onPress={() => router.replace("/templates/travel/(tabs)/trips")}
        >
          View my trips
        </Button>
        <Button
          isDark={darkMode}
          accessibilityLabel="Keep exploring"
          onPress={() => router.replace("/templates/travel/(tabs)")}
        >
          Keep exploring
        </Button>
      </ScrollView>
    );
  }

  /* ------------------------- booking form -------------------------- */
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
          Confirm and book
        </T>
      </View>

      <ListCard>
        <View style={styles.summaryInner}>
          <Plate colors={stay.colors} label={dest?.city ?? "Wayfare"} height={110} radius={12} fontSize={26} image={stay.image} />
          <T variant="body" style={styles.summaryTitle}>
            {stay.title}
          </T>
          <T variant="caption" muted>
            {dest?.city}, {dest?.country} · <Figure variant="caption">{stay.rating.toFixed(2)}</Figure> (
            <Figure variant="caption">{stay.reviewsCount}</Figure> reviews)
          </T>
        </View>
      </ListCard>

      <View>
        <SectionTitle>Your trip</SectionTitle>
        <ListCard>
          <View style={styles.stepperBlock}>
            <View style={styles.stepperHead}>
              <T variant="body">Check-in</T>
              <Figure variant="body">{formatDate(checkIn)}</Figure>
            </View>
            <Stepper
              isDark={darkMode}
              value={checkInOffset}
              onValueChange={setCheckInOffset}
              min={1}
              max={90}
              accessibilityLabel="Check-in day, days from today"
              formatValue={(v) => `+${v}d`}
            />
          </View>
          <RowSeparator />
          <View style={styles.stepperBlock}>
            <View style={styles.stepperHead}>
              <T variant="body">Nights</T>
              <Figure variant="body">
                {nights} · out {formatDate(checkOut)}
              </Figure>
            </View>
            <Stepper
              isDark={darkMode}
              value={nights}
              onValueChange={setNights}
              min={1}
              max={30}
              accessibilityLabel="Number of nights"
            />
          </View>
          <RowSeparator />
          <View style={styles.stepperBlock}>
            <View style={styles.stepperHead}>
              <T variant="body">Guests</T>
              <Figure variant="body">
                {guests} of {stay.guests} max
              </Figure>
            </View>
            <Stepper
              isDark={darkMode}
              value={guests}
              onValueChange={setGuests}
              min={1}
              max={stay.guests}
              accessibilityLabel="Number of guests"
            />
          </View>
        </ListCard>
      </View>

      <View>
        <SectionTitle>Price details</SectionTitle>
        <ListCard>
          <View style={styles.summaryInner}>
            <Row
              label={`${price(stay.pricePerNight)} × ${nights} night${nights === 1 ? "" : "s"}`}
              value={price(breakdown.subtotal)}
            />
            <Row label="Cleaning fee" value={price(stay.cleaningFee)} />
            <Row label="Wayfare service fee" value={price(breakdown.service)} />
            <RowSeparator />
            <Row label="Total" value={price(breakdown.total)} strong last />
          </View>
        </ListCard>
      </View>

      <Button
        isDark={darkMode}
        variant="filled"
        size="lg"
        accessibilityLabel="Confirm booking"
        onPress={() =>
          setConfirmed(
            addBooking({
              stayId: stay.id,
              checkInOffset,
              nights,
              guests,
              nightlyUSD: stay.pricePerNight,
              cleaningFeeUSD: stay.cleaningFee,
              serviceFeeUSD: breakdown.service,
              totalUSD: breakdown.total,
            }),
          )
        }
      >{`Confirm booking · ${price(breakdown.total)}`}</Button>
      <T variant="caption" muted style={styles.center}>
        Demo booking — no payment taken. Free cancellation for 48 hours, then a
        full refund until 7 days before check-in.
      </T>
    </ScrollView>
  );
}

function Row({
  label,
  value,
  strong = false,
  last = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
  last?: boolean;
}) {
  return (
    <View style={[styles.priceRow, last && styles.priceRowLast]}>
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
  headerRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  title: {},
  center: { textAlign: "center" },
  strong: { fontWeight: "600" },
  badgeRow: { alignItems: "center", marginTop: 12 },
  summaryInner: { padding: 16, gap: 8 },
  summaryTitle: { marginTop: 4 },
  stepperBlock: { paddingVertical: 12, paddingHorizontal: 16, gap: 8 },
  stepperHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  priceRowLast: { paddingBottom: 0 },
});
