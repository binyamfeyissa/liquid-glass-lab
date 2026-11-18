import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import {
  LiquidGlassView,
  LiquidGlassProvider,
  supportsGlass,
  supportsNativeGlass,
} from "expo-liquid-glass-ui";
import { useAppTheme } from "../theme/ThemeContext";

export const StatusScreen: React.FC = () => {
  const { colors, isDark } = useAppTheme();

  const [liveRenderer, setLiveRenderer] = useState<string>("detecting...");
  const [autoRenderer, setAutoRenderer] = useState<string>("detecting...");
  const [nativeRenderer, setNativeRenderer] = useState<string>("detecting...");
  const [metalRenderer, setMetalRenderer] = useState<string>("detecting...");

  const getExplanation = (type: "auto" | "native" | "metal", resolved: string) => {
    if (Platform.OS === "android") {
      if (type === "auto") {
        return "Default auto: Resolves to AGSL on Android 13+ (API 33+), fallback-blur on API 31-32, scrim on API 29-30.";
      }
      if (type === "native") {
        return "Forced native on Android: Android has no UIGlassEffect; resolves to AGSL shader pipeline.";
      }
      if (type === "metal") {
        return "Forced metal on Android: Resolves to AGSL shader pipeline (Android's shader counterpart).";
      }
    } else {
      // iOS
      if (type === "auto") {
        return "Default auto: Resolves to Apple UIGlassEffect on iOS 26+, custom Metal shader on iOS <26.";
      }
      if (type === "native") {
        return "Forced native: Requests UIGlassEffect (iOS 26+). Below iOS 26, automatically falls back to Metal.";
      }
      if (type === "metal") {
        return "Forced metal: Forces the custom Metal shader pipeline even on devices with UIGlassEffect.";
      }
    }
    return `Resolved to: ${resolved}`;
  };

  const getLiveBadgeColor = (r: string) => {
    switch (r) {
      case "agsl":
        return "#10B981"; // vibrant green
      case "metal":
        return "#6366F1"; // indigo
      case "native":
        return "#3B82F6"; // blue
      case "fallback-blur":
        return "#F59E0B"; // amber
      case "scrim":
        return "#EC4899"; // pink
      default:
        return "#8B5CF6";
    }
  };

  return (
    <View style={styles.container}>
      {/* Background provider for glass to refract */}
      <LiquidGlassProvider style={StyleSheet.absoluteFill}>
        <View style={[styles.backgroundPattern, { backgroundColor: colors.background }]}>
          {/* Decorative vibrant backdrop elements for glass refraction */}
          <View style={[styles.bgCircle, { backgroundColor: "#FF007A33", top: 40, left: -40 }]} />
          <View style={[styles.bgCircle, { backgroundColor: "#00F0FF33", top: 180, right: -50 }]} />
          <View style={[styles.bgCircle, { backgroundColor: "#FFE60033", bottom: 120, left: 30 }]} />
          <View style={[styles.stripeOverlay, { opacity: isDark ? 0.08 : 0.04 }]}>
            {Array.from({ length: 24 }).map((_, i) => (
              <View key={i} style={[styles.bgStripe, { backgroundColor: isDark ? "#fff" : "#000" }]} />
            ))}
          </View>
        </View>
      </LiquidGlassProvider>

      {/* Foreground glass controls layer */}
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Device & Library Header Verdict */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.subtext }]}>PLATFORM & OS VERSION</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {Platform.OS.toUpperCase()} {String(Platform.Version)}
          </Text>

          <View style={styles.divider} />

          <View style={styles.flagsRow}>
            <View style={styles.flagItem}>
              <Text style={[styles.flagLabel, { color: colors.subtext }]}>supportsGlass</Text>
              <Text
                style={[
                  styles.flagValue,
                  { color: supportsGlass ? "#10B981" : "#EF4444" },
                ]}
              >
                {String(supportsGlass)}
              </Text>
            </View>

            <View style={styles.flagItem}>
              <Text style={[styles.flagLabel, { color: colors.subtext }]}>supportsNativeGlass</Text>
              <Text
                style={[
                  styles.flagValue,
                  { color: supportsNativeGlass ? "#10B981" : "#EF4444" },
                ]}
              >
                {String(supportsNativeGlass)}
              </Text>
            </View>
          </View>
        </View>

        {/* Live Active Renderer Hero Card */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          ACTIVE VERDICT RENDERER
        </Text>
        <LiquidGlassView
          variant="regular"
          cornerRadius={28}
          interactive
          onRendererChange={(r) => setLiveRenderer(r)}
          style={styles.heroGlassView}
          containerStyle={styles.heroGlassContainer}
        >
          <Text style={styles.heroBadgeLabel}>DEVICE CHOSE</Text>
          <Text style={[styles.heroRendererText, { color: getLiveBadgeColor(liveRenderer) }]}>
            {liveRenderer.toUpperCase()}
          </Text>
          <Text style={styles.heroSubtext}>
            {liveRenderer === "agsl"
              ? "✓ AGSL Shader Active (Android 13+)"
              : liveRenderer === "metal"
              ? "✓ Metal Shader Active (iOS < 26)"
              : liveRenderer === "native"
              ? "✓ Apple UIGlassEffect Active (iOS 26+)"
              : `Status: ${liveRenderer}`}
          </Text>
        </LiquidGlassView>

        {/* Comparative Renderers Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          FORCED RENDERER COMPARISON
        </Text>

        {/* 1. Default Auto */}
        <View style={[styles.comparisonCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.comparisonHeader}>
            <Text style={[styles.comparisonTitle, { color: colors.text }]}>Auto (Default)</Text>
            <View style={[styles.pillBadge, { backgroundColor: "#3B82F622" }]}>
              <Text style={[styles.pillBadgeText, { color: "#3B82F6" }]}>{autoRenderer}</Text>
            </View>
          </View>
          <LiquidGlassView
            renderer="auto"
            variant="regular"
            cornerRadius={16}
            interactive
            onRendererChange={(r) => setAutoRenderer(r)}
            style={styles.sampleGlass}
            containerStyle={styles.sampleGlassInner}
          >
            <Text style={styles.sampleGlassLabel}>renderer="auto"</Text>
          </LiquidGlassView>
          <Text style={[styles.explanationText, { color: colors.subtext }]}>
            {getExplanation("auto", autoRenderer)}
          </Text>
        </View>

        {/* 2. Forced Native */}
        <View style={[styles.comparisonCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.comparisonHeader}>
            <Text style={[styles.comparisonTitle, { color: colors.text }]}>Forced Native</Text>
            <View style={[styles.pillBadge, { backgroundColor: "#10B98122" }]}>
              <Text style={[styles.pillBadgeText, { color: "#10B981" }]}>{nativeRenderer}</Text>
            </View>
          </View>
          <LiquidGlassView
            renderer="native"
            variant="regular"
            cornerRadius={16}
            interactive
            onRendererChange={(r) => setNativeRenderer(r)}
            style={styles.sampleGlass}
            containerStyle={styles.sampleGlassInner}
          >
            <Text style={styles.sampleGlassLabel}>renderer="native"</Text>
          </LiquidGlassView>
          <Text style={[styles.explanationText, { color: colors.subtext }]}>
            {getExplanation("native", nativeRenderer)}
          </Text>
        </View>

        {/* 3. Forced Metal */}
        <View style={[styles.comparisonCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.comparisonHeader}>
            <Text style={[styles.comparisonTitle, { color: colors.text }]}>Forced Metal</Text>
            <View style={[styles.pillBadge, { backgroundColor: "#6366F122" }]}>
              <Text style={[styles.pillBadgeText, { color: "#6366F1" }]}>{metalRenderer}</Text>
            </View>
          </View>
          <LiquidGlassView
            renderer="metal"
            variant="regular"
            cornerRadius={16}
            interactive
            onRendererChange={(r) => setMetalRenderer(r)}
            style={styles.sampleGlass}
            containerStyle={styles.sampleGlassInner}
          >
            <Text style={styles.sampleGlassLabel}>renderer="metal"</Text>
          </LiquidGlassView>
          <Text style={[styles.explanationText, { color: colors.subtext }]}>
            {getExplanation("metal", metalRenderer)}
          </Text>
        </View>

        {/* Bottom spacer for floating TabBar */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundPattern: {
    ...StyleSheet.absoluteFill,
    overflow: "hidden",
  },
  bgCircle: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  stripeOverlay: {
    ...StyleSheet.absoluteFill,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bgStripe: {
    width: 6,
    height: "100%",
  },
  contentContainer: {
    padding: 16,
    paddingTop: 12,
  },
  infoCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#99999944",
    marginVertical: 14,
  },
  flagsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  flagItem: {
    flex: 1,
  },
  flagLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  flagValue: {
    fontSize: 18,
    fontWeight: "800",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 4,
  },
  heroGlassView: {
    height: 140,
    width: "100%",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  heroGlassContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  heroBadgeLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#888888",
    marginBottom: 4,
  },
  heroRendererText: {
    fontSize: 44,
    fontWeight: "900",
    letterSpacing: 1,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroSubtext: {
    fontSize: 13,
    fontWeight: "600",
    color: "#AAAAAA",
    marginTop: 4,
  },
  comparisonCard: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  comparisonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  pillBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pillBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  sampleGlass: {
    height: 54,
    width: "100%",
    marginBottom: 10,
  },
  sampleGlassInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  sampleGlassLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  explanationText: {
    fontSize: 12,
    lineHeight: 17,
  },
});
