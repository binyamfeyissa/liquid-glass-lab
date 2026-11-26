import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  DefaultTheme,
  Stack,
  ThemeProvider,
  useRouter,
  useSegments,
} from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassProvider, Text } from "glacia-native";

import { BackdropModeProvider, useBackdropMode } from "../theme";
import { Backdrop } from "../backdrop";
import { TEMPLATES } from "../templates";

/**
 * Host root: the single root navigator. Each template is a route group
 * under app/templates/<slug>/ with its own nested _layout (provider,
 * Backdrop, GlassProvider, Stack/Tabs kept from the template).
 *
 * Back affordance: while inside a template, a small floating pill at the
 * top-left returns to this home list. Templates keep their own design
 * and navigation untouched; the pill is host chrome only.
 *
 * The pill is an overlay, so the template navigator reserves space for it
 * (see Shell): without the reserve the pill sits on top of every
 * template's title — bank "Jordan Ellis", social "Orbit", health "Today"
 * all ran underneath it in the run-4 screenshots. The reserve is
 * insets.top + the pill band (8 top gap + ~32 pill + 8 clearance), so the
 * first template row always starts below the pill.
 */
const BACK_PILL_CLEARANCE = 48;

function BackToTemplates() {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const { isDark } = useBackdropMode();
  if (segments[0] !== "templates") return null;
  return (
    <Pressable
      onPress={() => {
        if (router.canGoBack()) router.back();
        else router.replace("/");
      }}
      accessibilityRole="button"
      accessibilityLabel="Back to all templates"
      style={[styles.backPill, { top: insets.top + 8 }]}
    >
      <Text isDark={isDark} variant="body" style={styles.backText}>
        ‹ Templates
      </Text>
    </Pressable>
  );
}

/**
 * Navigation theme: transparent screen background. React Navigation
 * paints every screen opaque (DefaultTheme: rgb(242, 242, 242)) via its
 * `Background` wrapper, which sits on top of the host backdrop and every
 * template's own backdrop. `contentStyle: transparent` styles the wrong
 * (inner) layer, so the theme is the only place that reaches it.
 * This one theme covers the root Stack, all template Stacks, and home.
 * THEME ONLY — do not add transparent presentation as well.
 */
const NavigationTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: "transparent" },
};

function Shell() {
  const { isDark } = useBackdropMode();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const inTemplates = segments[0] === "templates";

  return (
    <View style={styles.root}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <GlassProvider isDark={isDark} style={StyleSheet.absoluteFill}>
        <Backdrop />
      </GlassProvider>
      <View
        style={[
          styles.root,
          // Inside a template the floating back pill overlays the top of
          // the navigator: reserve its band so no template title, avatar
          // or action can slide underneath it. Home keeps no reserve.
          inTemplates ? { paddingTop: insets.top + BACK_PILL_CLEARANCE } : null,
        ]}
      >
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "transparent" },
          }}
        >
          <Stack.Screen name="index" />
          {TEMPLATES.filter((t) => t.slug !== "onboarding-flow").map((t) => (
            <Stack.Screen key={t.slug} name={`templates/${t.slug}`} />
          ))}
          <Stack.Screen name="templates/onboarding-flow" />
        </Stack>
      </View>
      <BackToTemplates />
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <BackdropModeProvider>
          <ThemeProvider value={NavigationTheme}>
            <Shell />
          </ThemeProvider>
        </BackdropModeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backPill: {
    position: "absolute",
    left: 16,
    zIndex: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(20, 20, 21, 0.55)",
  },
  backText: { color: "#ffffff" },
});
