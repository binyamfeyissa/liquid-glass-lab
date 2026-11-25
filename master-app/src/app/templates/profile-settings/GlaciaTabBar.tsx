import React, { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import type { BottomTabBarProps } from "expo-router/build/layouts/Tabs";
import { TabBar } from "glacia-native";
import { Bell, Info, Palette, PenLine, Shield, User } from "lucide-react-native";

import { useAppState } from "./state";

/** Route name -> tab label. The six screens of the template. */
const LABELS: Record<string, string> = {
  index: "Profile",
  edit: "Edit",
  notifications: "Alerts",
  appearance: "Style",
  privacy: "Privacy",
  about: "About",
};

/** Route name -> tab icon, as a render function: the engine tab bar
 *  calls icon({ focused, color, size }), so the colour and size it
 *  resolves (accent when focused, muted when not) flow straight in. */
const ICONS: Record<string, (state: { color: string; size: number }) => ReactNode> = {
  index: ({ color, size }) => <User color={color} size={size} />,
  edit: ({ color, size }) => <PenLine color={color} size={size} />,
  notifications: ({ color, size }) => <Bell color={color} size={size} />,
  appearance: ({ color, size }) => <Palette color={color} size={size} />,
  privacy: ({ color, size }) => <Shield color={color} size={size} />,
  about: ({ color, size }) => <Info color={color} size={size} />,
};

/**
 * Glacia's own TabBar as the expo-router tab bar: the router owns the
 * navigation state, Glacia owns the glass. Tab presses go through the
 * router's emitter so the usual tabPress behaviour (scroll-to-top,
 * preventDefault listeners) keeps working.
 */
export function GlaciaTabBar({ state, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const { glaciaDark } = useAppState();
  const activeRoute = state.routes[state.index];

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <TabBar
        isDark={glaciaDark}
        activeId={activeRoute.key}
        items={state.routes.map((route) => ({
          id: route.key,
          label: LABELS[route.name] ?? route.name,
          icon: ICONS[route.name],
        }))}
        onTabChange={(key) => {
          const route = state.routes.find((r) => r.key === key);
          if (!route || route.key === activeRoute.key) return;
          const event = emitter.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!event.defaultPrevented) navigateToTab(route.key);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});
