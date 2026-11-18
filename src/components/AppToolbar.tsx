import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../theme/ThemeContext";

interface AppToolbarProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
}

export const AppToolbar: React.FC<AppToolbarProps> = ({ title, subtitle, rightAction }) => {
  const { isDark, colors, toggleTheme } = useAppTheme();

  return (
    <View style={[styles.container, { borderBottomColor: colors.border, backgroundColor: colors.background + "EE" }]}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: colors.subtext }]}>{subtitle}</Text>}
      </View>
      <View style={styles.actions}>
        {rightAction}
        <TouchableOpacity
          onPress={toggleTheme}
          style={[styles.themeBtn, { backgroundColor: isDark ? "#2C2C2E" : "#E5E5EA" }]}
          accessibilityRole="button"
          accessibilityLabel="Toggle Theme"
        >
          <Ionicons
            name={isDark ? "sunny" : "moon"}
            size={18}
            color={isDark ? "#FFD60A" : "#5856D6"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === "ios" ? 54 : 36,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    zIndex: 10,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  themeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
