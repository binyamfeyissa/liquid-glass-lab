import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Text } from "glacia-native";

import { useBackdropMode, type BackdropMode } from "./theme";

/**
 * The scenery the glass samples. Rendered as the single direct child of
 * GlassProvider in the root layout — the provider rule from glacia-native.
 *
 * The redesign's three backgrounds, same as every template:
 * dark graphite #141415, broken white #f7f4ee, photo (palm leaves)
 * full-bleed under a 38% black scrim. No blobs.
 */
export function Backdrop() {
  const { mode } = useBackdropMode();
  if (mode === "image") {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Image
          source={require("../assets/backdrop.jpg")}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(0,0,0,0.38)" },
          ]}
        />
      </View>
    );
  }
  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: mode === "light" ? "#f7f4ee" : "#141415" },
      ]}
    />
  );
}

/**
 * The header toggle: a half-filled circle (◐) that cycles
 * Light → Dark → Image → Light. Plain RN text in a pressable-sized
 * Glacia Text so it inherits the current theme colour.
 */
export function ModeToggle() {
  const { mode, cycleMode, isDark } = useBackdropMode();
  return (
    <Pressable
      onPress={cycleMode}
      accessibilityRole="button"
      accessibilityLabel={`Backdrop: ${mode}. Tap to change.`}
      hitSlop={8}
      style={styles.toggle}
    >
      <Text isDark={isDark} variant="title">
        ◐
      </Text>
    </Pressable>
  );
}

export const MODE_LABEL: Record<BackdropMode, string> = {
  light: "Light",
  dark: "Dark",
  image: "Image",
};

const styles = StyleSheet.create({
  toggle: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
