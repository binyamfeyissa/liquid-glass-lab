import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Tabs, useNavigation } from "expo-router";
import { GlassProvider } from "glacia-native";

import { AppStateProvider, useAppState } from "./state";
import { Backdrop } from "./ui";
import { GlaciaTabBar } from "./GlaciaTabBar";

/**
 * Reworked to the bank provider pattern for the master host: GlassProvider
 * holds exactly one direct child — the Backdrop — and the Tabs navigator is
 * its sibling, never its child. (Standalone profile-settings had this
 * backwards: Backdrop outside the provider, Tabs inside it.)
 */
function Shell() {
  const { glaciaDark, isDark } = useAppState();
  const navigation = useNavigation();

  // This template's root is a Tabs navigator, not a Stack, so there is no
  // Stack screenOptions to set the status-bar style from its own mode
  // (Tabs screenOptions does not accept statusBarStyle). The host Stack's
  // style follows the host mode (light by default), which would leave dark
  // text on this template's dark backdrop. Set the native-stack option for
  // this screen from the template mode instead.
  useEffect(() => {
    navigation.setOptions({
      statusBarStyle: isDark ? "light" : "dark",
    });
  }, [navigation, isDark]);

  return (
    <View style={styles.root}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <GlassProvider isDark={glaciaDark} style={StyleSheet.absoluteFill}>
        <Backdrop />
      </GlassProvider>
      <View style={styles.root}>
        <Tabs
          tabBar={(props) => <GlaciaTabBar {...props} />}
          screenOptions={{
            headerShown: false,
            sceneStyle: { backgroundColor: "transparent" },
          }}
        >
          <Tabs.Screen name="index" options={{ title: "Profile" }} />
          <Tabs.Screen name="edit" options={{ title: "Edit" }} />
          <Tabs.Screen name="notifications" options={{ title: "Alerts" }} />
          <Tabs.Screen name="appearance" options={{ title: "Style" }} />
          <Tabs.Screen name="privacy" options={{ title: "Privacy" }} />
          <Tabs.Screen name="about" options={{ title: "About" }} />
        </Tabs>
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <AppStateProvider>
      <Shell />
    </AppStateProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
