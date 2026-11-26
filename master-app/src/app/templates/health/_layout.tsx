import React from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import { GlassProvider } from "glacia-native";

import { HealthProvider, useHealth } from "./state";
import { Backdrop } from "./ui";

/**
 * Layout follows the glacia-native provider rule: `GlassProvider` holds
 * exactly one direct child — the backdrop whose pixels the glass samples —
 * and every glass surface (the whole navigator) is its sibling, drawn
 * after it, never inside it. On iOS the provider is a plain view and the
 * same tree works unchanged.
 */
function Shell() {
  const { darkMode } = useHealth();

  return (
    <View style={styles.root}>
      <StatusBar style={darkMode ? "light" : "dark"} />
      <GlassProvider isDark={darkMode} style={StyleSheet.absoluteFill}>
        <Backdrop />
      </GlassProvider>
      <View style={styles.root}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "transparent" },
            // Native-stack default statusBarStyle is 'auto' (system appearance:
            // light mode -> dark text), which overrides this layout's StatusBar
            // component on every screen focus. Set it from the template mode so the
            // time is readable on the template backdrop.
            statusBarStyle: darkMode ? "light" : "dark",
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="log" />
          <Stack.Screen name="history" />
        </Stack>
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <>
      <HealthProvider>
        <Shell />
      </HealthProvider>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
