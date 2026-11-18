import React, { useState } from "react";
import { StyleSheet, View, Text, StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import {
  LiquidGlassTabBar,
  LiquidGlassSheet,
  LiquidGlassToast,
  LiquidGlassGroup,
  LiquidGlassButton,
} from "expo-liquid-glass-ui";

import { ThemeProvider, useAppTheme } from "./src/theme/ThemeContext";
import { AppToolbar } from "./src/components/AppToolbar";
import { StatusScreen } from "./src/screens/StatusScreen";
import { RefractionScreen } from "./src/screens/RefractionScreen";
import { ControlsScreen } from "./src/screens/ControlsScreen";
import { ScrollScreen } from "./src/screens/ScrollScreen";
import { AdaptiveScreen } from "./src/screens/AdaptiveScreen";

const TAB_CONFIGS = [
  {
    key: "status",
    title: "Status",
    subtitle: "Verdict: Hardware & Shader Detection",
    iconName: "hardware-chip" as const,
  },
  {
    key: "refraction",
    title: "Refraction",
    subtitle: "Proof: Striped Stage & Lens Physics",
    iconName: "color-filter" as const,
  },
  {
    key: "controls",
    title: "Controls",
    subtitle: "Gallery: 17 Interactive Components",
    iconName: "grid" as const,
  },
  {
    key: "scroll",
    title: "Scroll",
    subtitle: "Weak-Spot: 120+ Item Capture Test",
    iconName: "list" as const,
  },
  {
    key: "adaptive",
    title: "Adaptive",
    subtitle: "Sensor: Mean Backdrop Luminance",
    iconName: "contrast" as const,
  },
];

const MainApp: React.FC = () => {
  const { isDark, colors } = useAppTheme();
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);

  // App-wide Sheet & Toast states triggered from ControlsScreen
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("Liquid Glass Notification");

  const currentTab = TAB_CONFIGS[selectedTabIndex] ?? TAB_CONFIGS[0];

  const handleFireToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const renderActiveScreen = () => {
    switch (selectedTabIndex) {
      case 0:
        return <StatusScreen />;
      case 1:
        return <RefractionScreen />;
      case 2:
        return (
          <ControlsScreen
            onOpenSheet={() => setSheetOpen(true)}
            onFireToast={handleFireToast}
          />
        );
      case 3:
        return <ScrollScreen />;
      case 4:
        return <AdaptiveScreen />;
      default:
        return <StatusScreen />;
    }
  };

  return (
    <View style={[styles.appWrapper, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Persistent App Header Toolbar */}
      <AppToolbar
        title={currentTab.title}
        subtitle={currentTab.subtitle}
      />

      {/* Main Screen Content */}
      <View style={styles.screenHost}>
        {renderActiveScreen()}
      </View>

      {/* Persistent App-wide LiquidGlassTabBar (Tests tab bar permanently across all screens) */}
      <LiquidGlassTabBar
        selectedIndex={selectedTabIndex}
        onTabSelected={setSelectedTabIndex}
        tabs={TAB_CONFIGS.map((tab) => ({
          key: tab.key,
          title: tab.title,
          icon: ({ color, size }) => (
            <Ionicons name={tab.iconName} color={color} size={size} />
          ),
        }))}
        style={styles.tabBar}
      />

      {/* 16. LiquidGlassSheet overlay */}
      <LiquidGlassSheet
        visible={sheetOpen}
        onDismiss={() => setSheetOpen(false)}
        height={360}
      >
        <View style={styles.sheetInner}>
          <Text style={[styles.sheetTitle, { color: colors.text }]}>
            Liquid Glass Bottom Sheet
          </Text>
          <Text style={[styles.sheetBody, { color: colors.subtext }]}>
            Drag down to dismiss, or tap outside. Fluid spring physics driven by Reanimated worklets.
          </Text>
          <View style={styles.sheetActionRow}>
            <LiquidGlassGroup gap={10}>
              <LiquidGlassButton onPress={() => setSheetOpen(false)}>
                Cancel
              </LiquidGlassButton>
              <LiquidGlassButton
                tint="#34C759CC"
                onPress={() => {
                  setSheetOpen(false);
                  handleFireToast("Action confirmed from Sheet");
                }}
              >
                Confirm
              </LiquidGlassButton>
            </LiquidGlassGroup>
          </View>
        </View>
      </LiquidGlassSheet>

      {/* 17. LiquidGlassToast overlay */}
      <LiquidGlassToast
        visible={toastVisible}
        message={toastMessage}
        edge="top"
        offset={70}
        onDismiss={() => setToastVisible(false)}
        icon={({ color, size }) => (
          <Ionicons name="checkmark-circle" color={color} size={size} />
        )}
      />
    </View>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  appWrapper: {
    flex: 1,
  },
  screenHost: {
    flex: 1,
  },
  tabBar: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  sheetInner: {
    padding: 24,
    paddingTop: 16,
    alignItems: "center",
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  sheetBody: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 24,
  },
  sheetActionRow: {
    width: "100%",
    alignItems: "center",
  },
});
