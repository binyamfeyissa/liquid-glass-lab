import React, { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import type { BottomTabBarProps } from "expo-router/build/layouts/Tabs";
import { TabBar } from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import InformationCircleIcon from "@hugeicons/core-free-icons/InformationCircleIcon";
import Notification01Icon from "@hugeicons/core-free-icons/Notification01Icon";
import PaintBoardIcon from "@hugeicons/core-free-icons/PaintBoardIcon";
import Pen01Icon from "@hugeicons/core-free-icons/Pen01Icon";
import Shield01Icon from "@hugeicons/core-free-icons/Shield01Icon";
import UserIcon from "@hugeicons/core-free-icons/UserIcon";
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
  index: ({ color, size }) => <HugeiconsIcon icon={UserIcon} color={color} size={size} />,
  edit: ({ color, size }) => <HugeiconsIcon icon={Pen01Icon} color={color} size={size} />,
  notifications: ({ color, size }) => <HugeiconsIcon icon={Notification01Icon} color={color} size={size} />,
  appearance: ({ color, size }) => <HugeiconsIcon icon={PaintBoardIcon} color={color} size={size} />,
  privacy: ({ color, size }) => <HugeiconsIcon icon={Shield01Icon} color={color} size={size} />,
  about: ({ color, size }) => <HugeiconsIcon icon={InformationCircleIcon} color={color} size={size} />,
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
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
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
