import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, Card, Progress } from "glacia-native";

import { useFleet } from "./state";
import {
  Figure,
  RestaurantTile,
  RowSeparator,
  Screen,
  T,
  accentColor,
  money,
} from "./ui";

const OFFER_SECONDS = 30;

export default function OfferScreen() {
  const fleet = useFleet();
  const offer = fleet.currentOffer;
  const [secondsLeft, setSecondsLeft] = useState(OFFER_SECONDS);
  const declinedRef = useRef(false);

  // Reset the countdown whenever a fresh offer lands on this screen.
  useEffect(() => {
    setSecondsLeft(OFFER_SECONDS);
    declinedRef.current = false;
  }, [offer?.id]);

  // Tick once a second; on zero, pass on the offer like a decline.
  useEffect(() => {
    if (!offer) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          if (!declinedRef.current) {
            declinedRef.current = true;
            fleet.declineOffer();
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offer?.id]);

  if (!offer) {
    return (
      <Screen title="Job offer" subtitle="Nothing on the table">
        <Card isDark={fleet.darkMode} padding={20}>
          <T variant="body" muted>
            This offer is gone — either timed out or already handled. Head back
            to Home for the next one
          </T>
          <Button
            isDark={fleet.darkMode}
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

  return (
    <Screen title="Job offer">
      {/* The countdown — the signature figure, in big mono over its bar */}
      <View>
        <View style={styles.countRow}>
          <Figure
            variant="title"
            style={{
              fontSize: 44,
              lineHeight: 48,
              color: accentColor(fleet.backdrop),
            }}
          >
            {secondsLeft}s
          </Figure>
          <T variant="body" muted>
            to decide
          </T>
        </View>
        <Progress
          value={(secondsLeft / OFFER_SECONDS) * 100}
          accessibilityLabel="Time left to accept this offer"
          isDark={fleet.darkMode}
          tint={accentColor(fleet.backdrop)}
        />
        <T variant="caption" muted style={styles.countNote}>
          The offer passes to another rider at zero
        </T>
      </View>

      <Card isDark={fleet.darkMode} padding={20}>
        <View style={styles.head}>
          <RestaurantTile name={offer.restaurant} colors={offer.colors} size={56} />
          <View style={styles.flex}>
            <T variant="heading">{offer.restaurant}</T>
            <T variant="caption" muted>
              {offer.cuisine}
            </T>
          </View>
          <Figure variant="title">{money(offer.payout)}</Figure>
        </View>
        <RowSeparator />
        <View style={styles.facts}>
          <T variant="body">Pick up · {offer.pickupAddress}</T>
          <T variant="body">
            Drop off · {offer.dropoffAddress} ({offer.customerName})
          </T>
          <T variant="body">Order · {offer.items}</T>
          <T variant="caption" muted>
            {offer.distanceKm.toFixed(1)} km total · customer paid {money(offer.orderTotal)}
          </T>
          {offer.note ? (
            <T variant="caption" muted>
              Note: {offer.note}
            </T>
          ) : null}
        </View>
      </Card>

      <View style={styles.actions}>
        <Button
          isDark={fleet.darkMode}
          accessibilityLabel="Decline this offer"
          variant="ghost"
          onPress={() => {
            declinedRef.current = true;
            fleet.declineOffer();
          }}
          style={styles.action}
        >
          Decline
        </Button>
        <Button
          isDark={fleet.darkMode}
          accessibilityLabel="Accept this offer"
          variant="filled"
          onPress={() => {
            fleet.acceptOffer();
            router.replace("/templates/food-fleet/active");
          }}
          style={styles.action}
        >
          Accept · {money(offer.payout)}
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  countRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 12,
  },
  countNote: { marginTop: 8, marginLeft: 2 },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  facts: { gap: 8, paddingTop: 12 },
  actions: { flexDirection: "row", gap: 12 },
  action: { flex: 1 },
  backButton: { marginTop: 16 },
});
