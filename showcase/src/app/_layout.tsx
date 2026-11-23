import React from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { GlassProvider } from "glacia-native";

import { BackdropModeProvider, useBackdropMode } from "../theme";
import { Backdrop } from "../backdrop";

/**
 * The glacia-native provider rule (same as the templates): GlassProvider
 * holds exactly one direct child — the Backdrop whose pixels the glass
 * samples — and the whole navigator is its sibling in a plain View,
 * never inside the provider.
 */
function Shell() {
  const { isDark } = useBackdropMode();

  return (
    <View style={styles.root}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <GlassProvider isDark={isDark} style={StyleSheet.absoluteFill}>
        <Backdrop />
      </GlassProvider>
      <View style={styles.root}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "transparent" },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="component/[slug]" />
        </Stack>
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <BackdropModeProvider>
        <Shell />
      </BackdropModeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
