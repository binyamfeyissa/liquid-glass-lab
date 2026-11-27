import React, { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import type { BottomTabBarProps } from "expo-router/build/layouts/Tabs";
import { TabBar } from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Add01Icon from "@hugeicons/core-free-icons/Add01Icon";
import CompassIcon from "@hugeicons/core-free-icons/CompassIcon";
import Home01Icon from "@hugeicons/core-free-icons/Home01Icon";
import Notification01Icon from "@hugeicons/core-free-icons/Notification01Icon";
import UserIcon from "@hugeicons/core-free-icons/UserIcon";
import { useSocial } from "./state";
import { accentColor } from "./ui";

/** Route name -> tab label for the five main tabs. */
const LABELS: Record<string, string> = {
  index: "Feed",
  explore: "Explore",
  create: "Create",
  notifications: "Activity",
  profile: "Profile",
};

/** Route name -> tab icon, as a render function: the engine tab bar
 *  calls icon({ focused, color, size }), so the colour and size it
 *  resolves (accent when focused, muted when not) flow straight in.
 *  The Activity tab wears a real unread badge — a dot over the bell —
 *  instead of the old "Activity \u2022" text badge. */
const ICONS: Record<string, (state: { color: string; size: number }) => ReactNode> = {
  index: ({ color, size }) => <HugeiconsIcon icon={Home01Icon} color={color} size={size} />,
  explore: ({ color, size }) => <HugeiconsIcon icon={CompassIcon} color={color} size={size} />,
  create: ({ color, size }) => <HugeiconsIcon icon={Add01Icon} color={color} size={size} />,
  profile: ({ color, size }) => <HugeiconsIcon icon={UserIcon} color={color} size={size} />,
};

/**
 * Glacia's own TabBar as the expo-router tab bar: the router owns the
 * navigation state, Glacia owns the glass. The wrapper pads by the larger
 * of the device bottom inset and 10pt, so the bar always floats fully
 * above the Android navigation bar / iOS home indicator and its labels
 * are never clipped.
 */
export function GlaciaTabBar({ state, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const { darkMode, backdrop, unreadNotifications } = useSocial();
  const icons: Record<string, (state: { color: string; size: number }) => ReactNode> = {
    ...ICONS,
    notifications: ({ color, size }) => (
      <View>
        <HugeiconsIcon icon={Notification01Icon} color={color} size={size} />
        {unreadNotifications > 0 ? (
          <View
            style={[styles.unreadDot, { backgroundColor: accentColor(backdrop) }]}
          />
        ) : null}
      </View>
    ),
  };
  const activeRoute = state.routes[state.index];

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <TabBar
        isDark={darkMode}
        activeId={activeRoute.key}
        items={state.routes.map((route) => ({
          id: route.key,
          label: LABELS[route.name] ?? route.name,
          icon: icons[route.name],
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
  unreadDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
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
