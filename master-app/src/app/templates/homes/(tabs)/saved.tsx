import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, Card } from "glacia-native";

import { PROPERTIES, propertyById } from "../data";
import { useHomes } from "../state";
import {
  ListCard,
  NavRow,
  PropertyCard,
  RowSeparator,
  Screen,
  SectionTitle,
  Serif,
  T,
} from "../ui";

export default function SavedScreen() {
  const { darkMode, favourites, viewings, cancelViewing } = useHomes();
  const savedHomes = PROPERTIES.filter((p) => favourites.includes(p.id));

  return (
    <Screen belowTabBar
      title="Saved"
      subtitle="Your favourite homes and the viewings you have booked"
    >
      <View>
        <SectionTitle>Viewings ({viewings.length})</SectionTitle>
        {viewings.length === 0 ? (
          <Card isDark={darkMode} padding={20}>
            <T variant="body">No viewings booked yet</T>
            <T variant="caption" muted style={styles.emptyHint}>
              Book a viewing from a home's page and it will show up here
            </T>
          </Card>
        ) : (
          <ListCard>
            {viewings.map((v, i) => {
              const property = propertyById(v.propertyId);
              if (!property) return null;
              return (
                <View key={v.id}>
                  {i > 0 ? <RowSeparator /> : null}
                  <View style={styles.viewingRow}>
                    <View style={styles.viewingText}>
                      <Serif variant="body">{property.title}</Serif>
                      <T variant="caption" muted style={styles.viewingDetail}>
                        {v.dayLabel} · {v.time} · for {v.name}
                      </T>
                      <T variant="caption" muted>
                        {property.address} · {property.area}
                      </T>
                    </View>
                    <Button
                      variant="ghost"
                      size="sm"
                      accessibilityLabel={`Cancel viewing of ${property.title}`}
                      isDark={darkMode}
                      onPress={() => cancelViewing(v.id)}
                    >
                      Cancel
                    </Button>
                  </View>
                </View>
              );
            })}
          </ListCard>
        )}
      </View>

      <View>
        <SectionTitle>Favourites ({savedHomes.length})</SectionTitle>
        {savedHomes.length === 0 ? (
          <Card isDark={darkMode} padding={20}>
            <T variant="body">No favourites yet</T>
            <T variant="caption" muted style={styles.emptyHint}>
              Tap Save on any home to keep it here
            </T>
          </Card>
        ) : (
          <View style={styles.list}>
            {savedHomes.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </View>
        )}
      </View>

      <View>
        <SectionTitle>Stay in the loop</SectionTitle>
        <ListCard>
          <NavRow
            title="Search alerts"
            description="Get told when a matching home lists"
            onPress={() => router.push("/templates/homes/alerts")}
          />
        </ListCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  viewingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  viewingText: {
    flex: 1,
  },
  viewingDetail: {
    marginTop: 2,
  },
  list: {
    gap: 16,
  },
  emptyHint: {
    marginTop: 4,
  },
});
