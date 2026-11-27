import React, { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import type { BottomTabBarProps } from "expo-router/build/layouts/Tabs";
import { TabBar } from "glacia-native";
import { Home, Package, ShoppingBag, User } from "lucide-react-native";

import { useShop } from "./state";

/** Route name -> tab label for the four main tabs. */
const LABELS: Record<string, string> = {
  index: "Home",
  shop: "Shop",
  orders: "Orders",
  profile: "Profile",
};

/** Route name -> tab icon, as a render function: the engine tab bar
 *  calls icon({ focused, color, size }), so the colour and size it
 *  resolves (accent when focused, muted when not) flow straight in. */
const ICONS: Record<string, (state: { color: string; size: number }) => ReactNode> = {
  index: ({ color, size }) => <Home color={color} size={size} />,
  shop: ({ color, size }) => <ShoppingBag color={color} size={size} />,
  orders: ({ color, size }) => <Package color={color} size={size} />,
  profile: ({ color, size }) => <User color={color} size={size} />,
};

/**
 * Glacia's own TabBar as the expo-router tab bar: the router owns the
 * navigation state, Glacia owns the glass. The wrapper pads by the larger
 * of the device bottom inset and 10pt, so the bar always floats fully
 * above the Android navigation bar / iOS home indicator and its labels
 * are never clipped.
 */
export function GlaciaTabBar({ state, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const { darkMode } = useShop();
  const activeRoute = state.routes[state.index];

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <TabBar
        isDark={darkMode}
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
    // Floating, not in-flow: expo-router's BottomTabView renders the tab
    // bar as a flex child BELOW the screens container, so an in-flow bar
    // owns a strip the scene can never scroll behind (that strip is the
    // "opaque layer" hiding the content). Absolute over the scene, the
    // pill floats like Telegram's and the list scrolls visibly
    // behind/around it. box-none on the wrapper View above lets touches
    // pass through the strip around the pill to the scrolling content.
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});
