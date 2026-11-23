import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Text } from "glacia-native";

import { useBackdropMode, type BackdropMode } from "./theme";

/**
 * The scenery the glass samples. Rendered as the single direct child of
 * GlassProvider in the root layout — the provider rule from glacia-native.
 *
 * Light/Dark reuse Bank's gradient-blob recipe; Image lays the bundled
 * photo edge to edge so every glass surface refracts a busy picture.
 */
export function Backdrop() {
  const { mode } = useBackdropMode();
  if (mode === "image") {
    return (
      <Image
        source={require("../assets/backdrop.jpg")}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
    );
  }
  const dark = mode === "dark";
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: dark ? "#081120" : "#e8eef7" },
        ]}
      />
      <View
        style={[
          styles.blob,
          {
            width: 420,
            height: 420,
            top: -150,
            left: -130,
            backgroundColor: dark ? "#1d4ed8" : "#93c5fd",
            opacity: dark ? 0.55 : 0.65,
          },
        ]}
      />
      <View
        style={[
          styles.blob,
          {
            width: 340,
            height: 340,
            top: 220,
            right: -150,
            backgroundColor: dark ? "#0e7490" : "#67e8f9",
            opacity: dark ? 0.5 : 0.55,
          },
        ]}
      />
      <View
        style={[
          styles.blob,
          {
            width: 380,
            height: 380,
            bottom: -170,
            left: -110,
            backgroundColor: dark ? "#065f46" : "#6ee7b7",
            opacity: dark ? 0.4 : 0.5,
          },
        ]}
      />
    </View>
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
  blob: {
    position: "absolute",
    borderRadius: 999,
  },
  toggle: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
