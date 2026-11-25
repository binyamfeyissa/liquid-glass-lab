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
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="browse" options={{ title: "Browse" }} />
      <Tabs.Screen name="my-list" options={{ title: "My List" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
