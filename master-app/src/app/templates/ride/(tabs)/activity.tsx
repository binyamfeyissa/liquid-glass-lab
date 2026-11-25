import React from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Button } from "glacia-native";

import { useRide } from "../state";
import { ListCard, RowSeparator, Screen, SectionTitle, T, TripRow } from "../ui";

export default function ActivityScreen() {
  const ride = useRide();
  const unpaid = ride.trips.filter((t) => t.status === "unpaid");
  const past = ride.trips.filter((t) => t.status !== "unpaid");

  return (
    <Screen title="Activity" subtitle="Your trips, receipts and ratings">
      {unpaid.length > 0 ? (
        <View>
          <SectionTitle>Needs payment</SectionTitle>
          <ListCard>
            {unpaid.map((trip, i) => (
              <View key={trip.id}>
                {i > 0 ? <RowSeparator /> : null}
                <TripRow
                  trip={trip}
                  onPress={() =>
                    router.push({ pathname: "/templates/ride/complete", params: { id: trip.id } })
                  }
                />
              </View>
            ))}
          </ListCard>
        </View>
      ) : null}

      <View>
        <SectionTitle>Past trips</SectionTitle>
        {past.length > 0 ? (
          <ListCard>
            {past.map((trip, i) => (
              <View key={trip.id}>
                {i > 0 ? <RowSeparator /> : null}
                <TripRow
                  trip={trip}
                  onPress={() =>
                    router.push({ pathname: "/templates/ride/trip/[id]", params: { id: trip.id } })
                  }
                />
              </View>
            ))}
          </ListCard>
        ) : (
          <T variant="body" muted>
            No trips yet — your first ride will land here
          </T>
        )}
      </View>

      <Button
        isDark={ride.darkMode}
        accessibilityLabel="Book a new ride"
        variant="glass"
        onPress={() => router.replace("/templates/ride/(tabs)")}
      >
        Book a new ride
      </Button>
    </Screen>
  );
}
