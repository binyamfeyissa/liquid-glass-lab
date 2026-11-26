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
 * The pill is an overlay, so every template screen reserves its band in
 * its OWN content padding (Screen/content styles use paddingTop 112:
 * status bar + pill + clearance). The reserve MUST live in the
 * templates, not here: padding the Stack container here (round-3 first
 * attempt) left a 107pt band of the host backdrop across the top of
 * every dark/photo template, because the container's background — not
 * the template's — paints that strip. The pill bottom sits at
 * insets.top + ~42, so 112 clears it with ~10pt to spare.
 */
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

  return (
    <View style={styles.root}>
      <HostStatusBar />
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

/**
 * Host status bar, driven ONLY by the host backdrop mode. It used to
 * live in Shell, which re-renders on every navigation (useSegments) —
 * and React Native's StatusBar stack then re-applied the host style
 * after each template's own StatusBar had mounted, so the time stayed
 * dark-on-dark inside dark templates (run-4 bank-01: "04:24" unreadable).
 * This component never sees the segments, so it only re-renders when the
 * host mode itself changes; a template's StatusBar mounts after it and
 * wins while the template is focused, and unmounting restores the host's.
 */
function HostStatusBar() {
  const { isDark } = useBackdropMode();
  return <StatusBar style={isDark ? "light" : "dark"} />;
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
