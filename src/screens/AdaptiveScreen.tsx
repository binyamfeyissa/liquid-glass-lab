import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Platform,
} from "react-native";
import {
  LiquidGlassView,
  LiquidGlassProvider,
  useAdaptiveGlass,
  useGlassUITheme,
  GlassLuminanceReading,
} from "expo-liquid-glass-ui";
import { useAppTheme } from "../theme/ThemeContext";

export const AdaptiveScreen: React.FC = () => {
  const { colors, isDark } = useAppTheme();

  // Try using adaptive API with error protection
  let adaptiveHook: ReturnType<typeof useAdaptiveGlass> | null = null;
  let hookError: string | null = null;

  try {
    adaptiveHook = useAdaptiveGlass();
  } catch (err: any) {
    hookError = err?.message || String(err);
  }

  const [liveReading, setLiveReading] = useState<GlassLuminanceReading>({
    luminance: 0.5,
    dark: false,
  });

  // Draggable card position
  const pan = useRef(new Animated.ValueXY({ x: 30, y: 160 })).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          // @ts-ignore
          x: pan.x._value,
          // @ts-ignore
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;

  if (hookError) {
    return (
      <View style={[styles.container, styles.centerError, { backgroundColor: colors.background }]}>
        <View style={styles.errorBox}>
          <Text style={styles.errorHeader}>FAILED: Adaptive</Text>
          <Text style={styles.errorText}>{hookError}</Text>
        </View>
      </View>
    );
  }

  const resolvedScheme = adaptiveHook?.scheme ?? (liveReading.dark ? "light" : "dark");
  const isDarkPolarity = adaptiveHook?.dark ?? liveReading.dark;

  return (
    <View style={styles.container}>
      {/* Background provider with alternating light and dark bands */}
      <LiquidGlassProvider style={StyleSheet.absoluteFill}>
        <View style={styles.bandsContainer}>
          {Array.from({ length: 8 }).map((_, index) => {
            const isBandDark = index % 2 === 0;
            return (
              <View
                key={index}
                style={[
                  styles.band,
                  { backgroundColor: isBandDark ? "#09090B" : "#FAFAFA" },
                ]}
              >
                <Text
                  style={[
                    styles.bandLabel,
                    { color: isBandDark ? "#52525B" : "#A1A1AA" },
                  ]}
                >
                  {isBandDark ? "■ DARK BAND (Luminance ~0.0)" : "□ LIGHT BAND (Luminance ~1.0)"}
                </Text>
              </View>
            );
          })}
        </View>
      </LiquidGlassProvider>

      {/* Foreground controls & readings layer */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {/* Top Status Readout Card */}
        <View style={styles.topReadoutCard}>
          <Text style={styles.readoutHeader}>ADAPTIVE BACKDROP READINGS</Text>
          <View style={styles.readoutRow}>
            <View style={styles.readoutCol}>
              <Text style={styles.readoutLabel}>LUMINANCE</Text>
              <Text style={styles.readoutVal}>
                {(liveReading.luminance * 100).toFixed(1)}%
              </Text>
            </View>

            <View style={styles.readoutCol}>
              <Text style={styles.readoutLabel}>POLARITY</Text>
              <Text
                style={[
                  styles.readoutVal,
                  { color: isDarkPolarity ? "#38BDF8" : "#F59E0B" },
                ]}
              >
                {isDarkPolarity ? "DARK" : "LIGHT"}
              </Text>
            </View>

            <View style={styles.readoutCol}>
              <Text style={styles.readoutLabel}>CONTENT SCHEME</Text>
              <Text style={styles.readoutVal}>
                {resolvedScheme.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.hintText}>
            Drag card across white/black bands: hysteresis flips at 0.45 / 0.55
          </Text>
        </View>

        {/* Draggable Adaptive Glass Card */}
        <Animated.View
          style={[
            styles.draggableCardWrapper,
            { transform: pan.getTranslateTransform() },
          ]}
          {...panResponder.panHandlers}
        >
          <LiquidGlassView
            adaptive
            onBackdropLuminance={(r) => {
              setLiveReading(r);
              adaptiveHook?.glassProps?.onBackdropLuminance?.(r);
            }}
            cornerRadius={28}
            interactive
            style={styles.adaptiveCard}
            containerStyle={styles.cardInner}
          >
            <View style={styles.gripHandle} />
            <Text
              style={[
                styles.cardHeading,
                { color: isDarkPolarity ? "#FFFFFF" : "#000000" },
              ]}
            >
              Adaptive Card
            </Text>
            <Text
              style={[
                styles.cardSubheading,
                { color: isDarkPolarity ? "#CBD5E1" : "#475569" },
              ]}
            >
              Luminance: {liveReading.luminance.toFixed(3)}
            </Text>
            <View
              style={[
                styles.polarityBadge,
                {
                  backgroundColor: isDarkPolarity
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(0,0,0,0.15)",
                },
              ]}
            >
              <Text
                style={[
                  styles.polarityText,
                  { color: isDarkPolarity ? "#FFFFFF" : "#000000" },
                ]}
              >
                Polarity: {isDarkPolarity ? "Dark Frost" : "Light Frost"}
              </Text>
            </View>
          </LiquidGlassView>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerError: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  errorHeader: {
    color: "#B91C1C",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },
  errorText: {
    color: "#7F1D1D",
    fontSize: 13,
  },
  bandsContainer: {
    ...StyleSheet.absoluteFill,
  },
  band: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  bandLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  topReadoutCard: {
    margin: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.75)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  readoutHeader: {
    color: "#A1A1AA",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  readoutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  readoutCol: {
    flex: 1,
  },
  readoutLabel: {
    color: "#71717A",
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 2,
  },
  readoutVal: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  hintText: {
    color: "#94A3B8",
    fontSize: 10,
    marginTop: 8,
    fontStyle: "italic",
  },
  draggableCardWrapper: {
    position: "absolute",
    width: 260,
    height: 160,
  },
  adaptiveCard: {
    width: 260,
    height: 160,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  cardInner: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  gripHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(128,128,128,0.5)",
    marginBottom: 12,
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: "800",
  },
  cardSubheading: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  polarityBadge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  polarityText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
