import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { colors, Text } from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import ChevronRightIcon from "@hugeicons/core-free-icons/ChevronRightIcon";
import { AISLES, productsInAisle } from "../data";
import { useBasket } from "../state";
import {
  CartBar,
  Figure,
  ListCard,
  RowSeparator,
  Screen,
  T,
  chromeColors,
  plateColor,
} from "../ui";

/** Aisle tile visual — one flat tonal plate and the aisle's initial. */
function AisleVisual({ hue, name }: { hue: [string, string]; name: string }) {
  const { darkMode } = useBasket();
  return (
    <View
      style={{
        width: 52,
        height: 52,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: plateColor(hue, darkMode),
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        isDark={darkMode}
        variant="heading"
        style={{
          color: darkMode ? "rgba(237,237,237,0.92)" : "rgba(31,27,22,0.85)",
        }}
      >
        {name.charAt(0)}
      </Text>
    </View>
  );
}

export default function AislesScreen() {
  const basket = useBasket();
  return (
    <View style={styles.root}>
      <Screen belowTabBar title="Aisles" subtitle="All seven aisles">
        <ListCard>
          {AISLES.map((aisle, i) => (
            <View key={aisle.id}>
              {i > 0 ? <RowSeparator /> : null}
              <Pressable
                onPress={() => router.push(`/templates/grocery/aisle/${aisle.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`${aisle.name}, ${productsInAisle(aisle.id).length} products`}
                style={({ pressed }) => [
                  styles.row,
                  pressed && {
                    backgroundColor: chromeColors(basket.backdrop).pressed,
                  },
                ]}
              >
                <AisleVisual hue={aisle.hue} name={aisle.name} />
                <View style={styles.flex}>
                  <T variant="body">{aisle.name}</T>
                  <T variant="caption" muted style={styles.description}>
                    {aisle.tagline}
                  </T>
                </View>
                <Figure variant="caption" muted>
                  {productsInAisle(aisle.id).length} items
                </Figure>
                <HugeiconsIcon icon={ChevronRightIcon} size={20} color={colors[basket.darkMode ? "dark" : "light"].muted} />
              </Pressable>
            </View>
          ))}
        </ListCard>
      </Screen>
      <CartBar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
    borderRadius: 12,
  },
  description: {
    marginTop: 2,
  },
});
