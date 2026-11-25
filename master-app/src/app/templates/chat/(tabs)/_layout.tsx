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
      <Tabs.Screen name="index" options={{ title: "Chats" }} />
      <Tabs.Screen name="calls" options={{ title: "Calls" }} />
      <Tabs.Screen name="contacts" options={{ title: "Contacts" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
