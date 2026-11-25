import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Chip, Input } from "glacia-native";

import { useFood } from "../state";
import { ALL_ITEMS, RECENT_SEARCHES, RESTAURANTS } from "../data";
import { MenuItemRow, RestaurantRow } from "../cards";
import { ListCard, RowSeparator, Screen, SectionTitle, T } from "../ui";

export default function SearchScreen() {
  const food = useFood();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const restaurantResults = useMemo(
    () =>
      q
        ? RESTAURANTS.filter(
            (r) =>
              r.name.toLowerCase().includes(q) ||
              r.cuisine.toLowerCase().includes(q) ||
              r.category.toLowerCase().includes(q),
          )
        : [],
    [q],
  );
  const dishResults = useMemo(
    () =>
      q
        ? ALL_ITEMS.filter(
            ({ item }) =>
              item.name.toLowerCase().includes(q) ||
              item.description.toLowerCase().includes(q),
          ).slice(0, 12)
        : [],
    [q],
  );

  return (
    <Screen title="Search" subtitle="Restaurants and dishes near you">
      <Input
        value={query}
        onChangeText={setQuery}
        placeholder="Try “ramen” or “burger”"
        accessibilityLabel="Search restaurants and dishes"
        returnKeyType="search"
        isDark={food.darkMode}
        autoCorrect={false}
      />

      {q === "" ? (
        <View>
          <SectionTitle>Recent searches</SectionTitle>
          <View style={styles.chipWrap}>
            {RECENT_SEARCHES.map((term) => (
              <Chip
                key={term}
                label={term}
                isDark={food.darkMode}
                onPress={() => setQuery(term)}
              />
            ))}
          </View>
          <T variant="body" muted style={styles.hint}>
            Popular right now: Dragon Roll at Sakura House, the Ember Smash
            Burger, and Sugar Cloud's Basque cheesecake
          </T>
        </View>
      ) : (
        <>
          {restaurantResults.length > 0 ? (
            <View>
              <SectionTitle>Restaurants</SectionTitle>
              <View style={styles.stack}>
                {restaurantResults.map((r) => (
                  <RestaurantRow key={r.id} restaurant={r} />
                ))}
              </View>
            </View>
          ) : null}

          {dishResults.length > 0 ? (
            <View>
              <SectionTitle>Dishes</SectionTitle>
              <ListCard>
                {dishResults.map(({ restaurant, item }, i) => (
                  <React.Fragment key={item.id}>
                    {i > 0 ? <RowSeparator /> : null}
                    <View>
                      <MenuItemRow restaurant={restaurant} item={item} />
                      <T variant="caption" muted style={styles.dishFrom}>
                        at {restaurant.name}
                      </T>
                    </View>
                  </React.Fragment>
                ))}
              </ListCard>
            </View>
          ) : null}

          {restaurantResults.length === 0 && dishResults.length === 0 ? (
            <View style={styles.empty}>
              <T variant="heading">No matches for “{query.trim()}”</T>
              <T variant="body" muted style={styles.emptyText}>
                Try a cuisine (“sushi”), a dish (“ramen”), or a restaurant name
              </T>
            </View>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  hint: { marginTop: 16 },
  stack: { gap: 12 },
  dishFrom: {
    paddingLeft: 16,
    paddingBottom: 12,
  },
  empty: {
    alignItems: "center",
    paddingTop: 48,
    gap: 8,
    paddingHorizontal: 24,
  },
  emptyText: { textAlign: "center" },
});
