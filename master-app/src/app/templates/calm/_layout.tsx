import React from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import { GlassProvider } from "glacia-native";

import { StillwaterProvider, useStillwater } from "./state";
import { Backdrop } from "./ui";

/**
 * Layout follows the glacia-native provider rule: `GlassProvider` holds
 * exactly one direct child — the backdrop whose pixels the glass samples —
 * and every glass surface (the whole navigator) is its sibling, drawn
 * after it, never inside it. On iOS the provider is a plain view and the
 * same tree works unchanged.
 */
function Shell() {
  const { darkMode } = useStillwater();

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
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="player/[id]" />
          <Stack.Screen name="breathing" />
        </Stack>
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <>
      <StillwaterProvider>
        <Shell />
      </StillwaterProvider>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
