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
      <Tabs.Screen name="index" options={{ title: "Top" }} />
      <Tabs.Screen name="for-you" options={{ title: "For You" }} />
      <Tabs.Screen name="bookmarks" options={{ title: "Bookmarks" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
