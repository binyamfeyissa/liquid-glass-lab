import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Badge, Button, Card, Switch } from "glacia-native";

import { STAGES, useFleet } from "../state";
import {
  Figure,
  ListCard,
  RestaurantTile,
  RowSeparator,
  Screen,
  SectionTitle,
  SettingRow,
  T,
  money,
} from "../ui";

export default function HomeScreen() {
  const fleet = useFleet();
  const offer = fleet.currentOffer;
  const feedDimmed = !fleet.online || !offer;

  return (
    <Screen title="Today">
      {/* Rider header + online switch */}
      <ListCard>
        <SettingRow
          title={fleet.riderName}
          description={fleet.online ? "Online" : "Offline"}
        >
          <View style={styles.headerRight}>
            <Avatar name={fleet.riderName} size="md" isDark={fleet.darkMode} />
            <Switch
              isDark={fleet.darkMode}
              value={fleet.online}
              onValueChange={fleet.setOnline}
              accessibilityLabel="Online"
            />
          </View>
        </SettingRow>
      </ListCard>

      {/* Just-delivered confirmation */}
      {fleet.lastDeliveredId ? (
        <Card isDark={fleet.darkMode} padding={16}>
          <Badge tone="muted" isDark={fleet.darkMode} style={styles.doneBadge}>
            Delivery complete
          </Badge>
          <T variant="body" muted style={styles.doneText}>
            The payout is in today's earnings below
          </T>
          <Button
            isDark={fleet.darkMode}
            accessibilityLabel="Dismiss delivery confirmation"
            variant="ghost"
            onPress={fleet.clearLastDelivered}
          >
            Dismiss
          </Button>
        </Card>
      ) : null}

      {/* Today's numbers — computed from completed jobs, as one ledger */}
      <View>
        <SectionTitle>Today so far</SectionTitle>
        <ListCard>
          <View style={styles.statRow}>
            <T variant="body" muted>
              Earned
            </T>
            <Figure variant="heading">{money(fleet.todayEarnings)}</Figure>
          </View>
          <RowSeparator />
          <View style={styles.statRow}>
            <T variant="body" muted>
              Jobs done
            </T>
            <Figure variant="heading">{fleet.todayJobsDone}</Figure>
          </View>
          <RowSeparator />
          <View style={styles.statRow}>
            <T variant="body" muted>
              Distance
            </T>
            <Figure variant="heading">
              {fleet.todayDistanceKm.toFixed(1)} km
            </Figure>
          </View>
        </ListCard>
      </View>

      {/* Active job shortcut */}
      {fleet.activeJob ? (
        <View>
          <SectionTitle>Active delivery</SectionTitle>
          <Card
            isDark={fleet.darkMode}
            padding={16}
            onPress={() => router.push("/templates/food-fleet/active")}
            accessibilityLabel="Open active delivery"
          >
            <View style={styles.offerHead}>
              <RestaurantTile
                name={fleet.activeJob.restaurant}
                colors={fleet.activeJob.colors}
              />
              <View style={styles.flex}>
                <T variant="body">{fleet.activeJob.restaurant}</T>
                <T variant="caption" muted>
                  Step {fleet.stage + 1} of {STAGES.length} · {STAGES[fleet.stage]}
                </T>
              </View>
              <Figure variant="heading">{money(fleet.activeJob.payout)}</Figure>
            </View>
          </Card>
        </View>
      ) : null}

      {/* Job feed */}
      <View style={{ opacity: fleet.online ? 1 : 0.45 }}>
        <SectionTitle>New job offer</SectionTitle>
        {offer ? (
          <Card isDark={fleet.darkMode} padding={16}>
            <View style={styles.offerHead}>
              <RestaurantTile name={offer.restaurant} colors={offer.colors} size={52} />
              <View style={styles.flex}>
                <T variant="heading">{offer.restaurant}</T>
                <T variant="caption" muted>
                  {offer.cuisine}
                </T>
              </View>
              <Figure variant="title">{money(offer.payout)}</Figure>
            </View>
            <RowSeparator />
            <View style={styles.offerFacts}>
              <T variant="body">
                Pick up · {offer.pickupAddress}
              </T>
              <T variant="body">
                Drop off · {offer.dropoffAddress}
              </T>
              <T variant="caption" muted>
                {offer.distanceKm.toFixed(1)} km total · order {money(offer.orderTotal)}
              </T>
            </View>
            <Button
              isDark={fleet.darkMode}
              accessibilityLabel="View job offer"
              variant="filled"
              disabled={!fleet.online}
              onPress={() => router.push("/templates/food-fleet/offer")}
              style={styles.offerButton}
            >
              View offer
            </Button>
          </Card>
        ) : (
          <ListCard>
            <View style={styles.emptyFeed}>
              <T variant="body" muted>
                {fleet.activeJob
                  ? "Finish the active delivery to see the next offer"
                  : "No more offers right now"}
              </T>
            </View>
          </ListCard>
        )}
        {feedDimmed && !fleet.online ? (
          <T variant="caption" muted style={styles.offlineNote}>
            Go online to accept offers
          </T>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  doneBadge: { alignSelf: "flex-start" },
  doneText: { marginTop: 8, marginBottom: 8 },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  offerHead: { flexDirection: "row", alignItems: "center", gap: 12 },
  offerFacts: { gap: 4, paddingVertical: 12 },
  offerButton: { marginTop: 8 },
  emptyFeed: { paddingVertical: 16, paddingHorizontal: 16 },
  offlineNote: { marginTop: 8, marginLeft: 8 },
});
