import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, Card } from "glacia-native";

import { useFleet } from "./state";
import { Figure, ListCard, RowSeparator, Screen, SectionTitle, Stars, T } from "./ui";

export default function RatingsScreen() {
  const fleet = useFleet();
  const fiveStar = fleet.ratings.filter((r) => r.stars === 5).length;

  return (
    <Screen title="Ratings" subtitle="What customers said about you">
      <Card isDark={fleet.darkMode} padding={20} style={styles.summary}>
        <Figure variant="title">{fleet.averageRating.toFixed(1)}</Figure>
        <Stars count={Math.round(fleet.averageRating)} size={20} />
        <T variant="caption" muted>
          {fleet.ratings.length} recent ratings · {fiveStar} of them five stars
        </T>
      </Card>

      <View>
        <SectionTitle>Recent ratings</SectionTitle>
        <ListCard>
          {fleet.ratings.map((r, i) => (
            <React.Fragment key={r.id}>
              {i > 0 ? <RowSeparator /> : null}
              <View style={styles.row}>
                <Stars count={r.stars} />
                <T variant="body" style={styles.comment}>
                  {r.comment}
                </T>
                <T variant="caption" muted>
                  {r.source} · {r.when}
                </T>
              </View>
            </React.Fragment>
          ))}
        </ListCard>
      </View>

      <Button
        accessibilityLabel="Back"
        variant="ghost"
        onPress={() => router.back()}
      >
        Back
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { alignItems: "center", gap: 8 },
  row: { paddingVertical: 12, paddingHorizontal: 16, gap: 4 },
  comment: { marginTop: 4 },
});
