import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, Card } from "glacia-native";

import { useTravel } from "../state";
import { Screen, StayCard, T } from "../ui";

export default function SavedScreen() {
  const { savedIds, stayById, darkMode } = useTravel();
  const saved = savedIds
    .map((id) => stayById(id))
    .filter((s): s is NonNullable<typeof s> => !!s);

  return (
    <Screen belowTabBar title="Saved">
      {saved.length === 0 ? (
        <Card isDark={darkMode} padding={24} style={styles.empty}>
          <T variant="heading" style={styles.center}>
            Nothing saved yet
          </T>
          <T variant="body" muted style={styles.center}>
            Your wishlist is empty. Browse stays and tap the heart to start a
            shortlist for your next trip.
          </T>
          <Button
            isDark={darkMode}
            variant="filled"
            accessibilityLabel="Explore stays"
            onPress={() => router.push("/templates/travel/(tabs)")}
          >
            Explore stays
          </Button>
        </Card>
      ) : (
        <View style={styles.list}>
          {saved.map((stay) => (
            <StayCard key={stay.id} stay={stay} />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: "center" },
  empty: { alignItems: "center", gap: 12 },
  list: { gap: 16 },
});
