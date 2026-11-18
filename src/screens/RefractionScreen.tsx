import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  PanResponder,
  Animated,
  TouchableOpacity,
} from "react-native";
import { LiquidGlassView, LiquidGlassProvider } from "expo-liquid-glass-ui";
import { useAppTheme } from "../theme/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const RefractionScreen: React.FC = () => {
  const { colors, isDark } = useAppTheme();

  // Magnification state for demo
  const [magnification, setMagnification] = useState<number>(1.8);

  // Draggable panel state using PanResponder
  const pan = useRef(new Animated.ValueXY({ x: 20, y: 140 })).current;

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

  return (
    <View style={styles.container}>
      {/* Background provider containing the busy refraction testing stage */}
      <LiquidGlassProvider style={StyleSheet.absoluteFill}>
        <View style={[styles.stage, { backgroundColor: isDark ? "#0A0A0C" : "#FFFFFF" }]}>
          {/* 1. Bold black-and-white vertical stripes */}
          <View style={styles.stripesContainer}>
            {Array.from({ length: 22 }).map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.stripe,
                  { backgroundColor: idx % 2 === 0 ? "#000000" : "#FFFFFF" },
                ]}
              />
            ))}
          </View>

          {/* 2. Large vibrant coloured circles overlapping stripes */}
          <View style={[styles.coloredCircle, { backgroundColor: "#00F5FF", top: 60, left: 20 }]} />
          <View style={[styles.coloredCircle, { backgroundColor: "#FF007F", top: 130, right: 30 }]} />
          <View style={[styles.coloredCircle, { backgroundColor: "#FFE600", top: 280, left: 100 }]} />
          <View style={[styles.coloredCircle, { backgroundColor: "#39FF14", bottom: 180, right: 20 }]} />

          {/* 3. Detailed photo card */}
          <View style={styles.photoContainer}>
            <Image
              source={require("../../assets/photo.jpg")}
              style={styles.photo}
              resizeMode="cover"
            />
            <View style={styles.photoCaptionBar}>
              <Text style={styles.photoCaption}>Detailed High-Frequency Texture Target</Text>
            </View>
          </View>
        </View>
      </LiquidGlassProvider>

      {/* Foreground Glass Controls Layer */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {/* Top Controls Overlay: Shape gallery & Magnification switch */}
        <View style={styles.topControlOverlay} pointerEvents="box-none">
          {/* Row of Fixed Glass Shapes */}
          <Text style={[styles.glassSectionTitle, { color: isDark ? "#FFF" : "#000" }]}>
            FIXED SHAPES & TINTS
          </Text>
          <View style={styles.shapesRow}>
            {/* Pill */}
            <View style={styles.shapeWrapper}>
              <LiquidGlassView
                variant="regular"
                cornerRadius={24}
                tint="#00F0FF44"
                interactive
                style={styles.pillGlass}
                containerStyle={styles.shapeInner}
              >
                <Text style={styles.shapeLabel}>Pill</Text>
              </LiquidGlassView>
            </View>

            {/* Circle */}
            <View style={styles.shapeWrapper}>
              <LiquidGlassView
                variant="regular"
                cornerRadius={32}
                tint="#FFB80044"
                interactive
                style={styles.circleGlass}
                containerStyle={styles.shapeInner}
              >
                <Text style={styles.shapeLabel}>Circle</Text>
              </LiquidGlassView>
            </View>

            {/* Rounded Rect */}
            <View style={styles.shapeWrapper}>
              <LiquidGlassView
                variant="regular"
                cornerRadius={16}
                tint="#B026FF44"
                interactive
                style={styles.roundedRectGlass}
                containerStyle={styles.shapeInner}
              >
                <Text style={styles.shapeLabel}>Squircle</Text>
              </LiquidGlassView>
            </View>
          </View>

          {/* Magnification Selector Bar */}
          <View style={styles.magSelectorCard}>
            <Text style={styles.magTitle}>LENS MAGNIFICATION</Text>
            <View style={styles.magButtonsRow}>
              {[1.0, 1.5, 1.8, 2.4].map((val) => (
                <TouchableOpacity
                  key={val}
                  onPress={() => setMagnification(val)}
                  style={[
                    styles.magBtn,
                    magnification === val && styles.magBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.magBtnText,
                      magnification === val && styles.magBtnTextActive,
                    ]}
                  >
                    {val.toFixed(1)}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Draggable LiquidGlassView Panel (cornerRadius 32) */}
        <Animated.View
          style={[
            styles.draggableWrapper,
            {
              transform: pan.getTranslateTransform(),
            },
          ]}
          {...panResponder.panHandlers}
        >
          <LiquidGlassView
            variant="regular"
            cornerRadius={32}
            cornerStyle="continuous"
            interactive
            tint="#4DA3FF22"
            metal={{
              magnification,
              refraction: {
                amount: 32,
                depth: 1.6,
              },
              dispersion: {
                amount: 1.2,
                reach: 1.0,
              },
              highlight: {
                intensity: 1.2,
                width: 1.0,
              },
            }}
            style={styles.draggablePanel}
            containerStyle={styles.draggablePanelInner}
          >
            <View style={styles.dragHandleGrip} />
            <Text style={styles.dragTitle}>DRAG ME ACROSS</Text>
            <Text style={styles.dragSubtext}>
              Watch stripes bend & photo magnify ({magnification}x)
            </Text>
            <View style={styles.dragPillIndicator}>
              <Text style={styles.dragPillText}>cornerRadius 32 • continuous</Text>
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
  stage: {
    ...StyleSheet.absoluteFill,
    overflow: "hidden",
  },
  stripesContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 180,
    flexDirection: "row",
  },
  stripe: {
    flex: 1,
    height: "100%",
  },
  coloredCircle: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoContainer: {
    position: "absolute",
    right: 12,
    top: 140,
    width: SCREEN_WIDTH * 0.48,
    height: 280,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#FFFFFF88",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoCaptionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  photoCaption: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
    textAlign: "center",
  },
  topControlOverlay: {
    padding: 16,
    paddingTop: 8,
  },
  glassSectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 8,
  },
  shapesRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  shapeWrapper: {
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  pillGlass: {
    width: 90,
    height: 48,
  },
  circleGlass: {
    width: 64,
    height: 64,
  },
  roundedRectGlass: {
    width: 86,
    height: 52,
  },
  shapeInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  shapeLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  magSelectorCard: {
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 16,
    padding: 10,
    alignSelf: "flex-start",
  },
  magTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#AAAAAA",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  magButtonsRow: {
    flexDirection: "row",
    gap: 6,
  },
  magBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  magBtnActive: {
    backgroundColor: "#00F5FF",
  },
  magBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  magBtnTextActive: {
    color: "#000000",
    fontWeight: "800",
  },
  draggableWrapper: {
    position: "absolute",
    width: 250,
    height: 150,
  },
  draggablePanel: {
    width: 250,
    height: 150,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  draggablePanelInner: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  dragHandleGrip: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.6)",
    marginBottom: 10,
  },
  dragTitle: {
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  dragSubtext: {
    fontSize: 11,
    fontWeight: "600",
    color: "#E2E8F0",
    textAlign: "center",
    marginTop: 4,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  dragPillIndicator: {
    marginTop: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  dragPillText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#A7F3D0",
  },
});
