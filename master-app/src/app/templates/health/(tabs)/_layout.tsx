import React from "react";
import { Tabs } from "expo-router";

import { GlaciaTabBar } from "../GlaciaTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <GlaciaTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: "transparent" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Today" }} />
      <Tabs.Screen name="trends" options={{ title: "Trends" }} />
      <Tabs.Screen name="habits" options={{ title: "Habits" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
