import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LiquidGlassView, LiquidGlassProvider } from "expo-liquid-glass-ui";
import { useAppTheme } from "../theme/ThemeContext";

// Generate 120 high-contrast test rows
const SCROLL_ITEMS = Array.from({ length: 120 }).map((_, i) => ({
  id: String(i + 1),
  title: `Scroll Item #${i + 1} — High Frequency Edge`,
  subtitle: `Row ${i + 1} • Capturing backdrop fidelity across 120Hz frames`,
  category: i % 4 === 0 ? "SHADERS" : i % 4 === 1 ? "REFRACT" : i % 4 === 2 ? "CAPTURE" : "LATENCY",
  color: ["#00F5FF", "#FF007F", "#FFE600", "#39FF14", "#A855F7"][i % 5],
}));

export const ScrollScreen: React.FC = () => {
  const { colors, isDark } = useAppTheme();
  const [scrollOffset, setScrollOffset] = useState<number>(0);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollOffset(Math.round(e.nativeEvent.contentOffset.y));
  };

  return (
    <View style={styles.container}>
      {/* 1. Backdrop Provider wrapping the entire 120+ item ScrollView */}
      <LiquidGlassProvider style={StyleSheet.absoluteFill}>
        <View style={[styles.stage, { backgroundColor: colors.background }]}>
          <FlatList
            data={SCROLL_ITEMS}
            keyExtractor={(item) => item.id}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.listItem,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                {/* Colorful thumbnail with pattern */}
                <View style={[styles.itemThumb, { backgroundColor: item.color }]}>
                  <Text style={styles.thumbNumber}>#{item.id}</Text>
                </View>

                {/* Text metadata */}
                <View style={styles.itemMeta}>
                  <View style={styles.rowBetween}>
                    <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View style={[styles.categoryBadge, { backgroundColor: item.color + "22" }]}>
                      <Text style={[styles.categoryText, { color: item.color }]}>
                        {item.category}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.itemSubtitle, { color: colors.subtext }]} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                </View>
              </View>
            )}
          />
        </View>
      </LiquidGlassProvider>

      {/* 2. Floating Glass Header sitting over the list as a sibling */}
      <View style={styles.floatingHeaderContainer} pointerEvents="box-none">
        <LiquidGlassView
          variant="regular"
          cornerRadius={20}
          cornerStyle="continuous"
          interactive
          style={styles.floatingHeader}
          containerStyle={styles.headerInner}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerTitleCol}>
              <Text style={styles.headerTitle}>WEAK-SPOT SCROLL TEST</Text>
              <Text style={styles.headerSubtitle}>
                Flick fast to judge glass backdrop lag & staleness
              </Text>
            </View>
            <View style={styles.offsetBadge}>
              <Ionicons name="speedometer-outline" size={12} color="#00F5FF" />
              <Text style={styles.offsetText}>{scrollOffset}px</Text>
            </View>
          </View>
        </LiquidGlassView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stage: {
    ...StyleSheet.absoluteFill,
  },
  listContent: {
    paddingTop: 80, // Clearance for floating header
    paddingBottom: 130, // Clearance for floating TabBar
    paddingHorizontal: 16,
    gap: 8,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbNumber: {
    color: "#000000",
    fontWeight: "900",
    fontSize: 13,
  },
  itemMeta: {
    flex: 1,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
    marginRight: 6,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: "800",
  },
  itemSubtitle: {
    fontSize: 11,
  },
  floatingHeaderContainer: {
    position: "absolute",
    top: 10,
    left: 16,
    right: 16,
  },
  floatingHeader: {
    height: 64,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  headerInner: {
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.6,
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: "600",
    color: "#CBD5E1",
    marginTop: 2,
  },
  offsetBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  offsetText: {
    color: "#00F5FF",
    fontWeight: "800",
    fontSize: 11,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
});
