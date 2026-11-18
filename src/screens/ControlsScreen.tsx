import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  LiquidGlassButton,
  LiquidGlassIconButton,
  LiquidGlassChip,
  LiquidGlassSwitch,
  LiquidGlassSlider,
  LiquidGlassStepper,
  LiquidGlassSegmentedControl,
  LiquidGlassTextInput,
  LiquidGlassCard,
  LiquidGlassToolbar,
  LiquidGlassGroup,
  LiquidGlassStack,
  LiquidGlassContainer,
  LiquidGlassMorphGroup,
  LiquidGlassScrim,
  LiquidGlassView,
  LiquidGlassProvider,
} from "expo-liquid-glass-ui";
import { useAppTheme } from "../theme/ThemeContext";

interface ControlsScreenProps {
  onOpenSheet: () => void;
  onFireToast: (msg: string) => void;
}

export const ControlsScreen: React.FC<ControlsScreenProps> = ({
  onOpenSheet,
  onFireToast,
}) => {
  const { colors, isDark } = useAppTheme();

  // 1. Button state
  const [btnClicks, setBtnClicks] = useState<number>(0);
  const [btnLoading, setBtnLoading] = useState<boolean>(false);

  // 2. Icon button state
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  // 3. Chip selection state
  const [selectedChips, setSelectedChips] = useState<Set<string>>(
    new Set(["Refraction", "AGSL"])
  );
  const toggleChip = (tag: string) => {
    setSelectedChips((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  // 4. Switch state
  const [switchVal, setSwitchVal] = useState<boolean>(true);

  // 5. Slider state
  const [sliderVal, setSliderVal] = useState<number>(0.65);

  // 6. Stepper state
  const [stepperVal, setStepperVal] = useState<number>(4);

  // 7. Segmented control state
  const [segIdx, setSegIdx] = useState<number>(1);

  // 8. Text input state
  const [textInputVal, setTextInputVal] = useState<string>("Liquid Glass Input");

  // 9. Card state
  const [cardTaps, setCardTaps] = useState<number>(0);

  // 11. Group merge count
  const [groupCount, setGroupCount] = useState<number>(0);

  // 14. Morph group merge feedback
  const [morphStatus, setMorphStatus] = useState<string>("Drag Puck A toward Puck B");

  // 15. Scrim visibility
  const [showScrim, setShowScrim] = useState<boolean>(true);

  return (
    <View style={styles.container}>
      {/* Background provider for glass to refract */}
      <LiquidGlassProvider style={StyleSheet.absoluteFill}>
        <View style={[styles.backgroundCanvas, { backgroundColor: colors.background }]}>
          <View style={[styles.bgBlob, { backgroundColor: "#FF007F22", top: 80, left: -20 }]} />
          <View style={[styles.bgBlob, { backgroundColor: "#00F5FF22", top: 380, right: -40 }]} />
          <View style={[styles.bgBlob, { backgroundColor: "#FFE60022", top: 720, left: 30 }]} />
          <View style={[styles.bgBlob, { backgroundColor: "#39FF1422", top: 1100, right: 10 }]} />
        </View>
      </LiquidGlassProvider>

      {/* Foreground controls layer */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.galleryTitle, { color: colors.text }]}>
          FULL CONTROLS GALLERY (17)
        </Text>
        <Text style={[styles.gallerySubtitle, { color: colors.subtext }]}>
          Every component interactive with real state
        </Text>

        {/* 1. LiquidGlassButton */}
        <View style={styles.controlBox}>
          <Text style={[styles.controlLabel, { color: colors.subtext }]}>
            1. LiquidGlassButton
          </Text>
          <View style={styles.buttonRow}>
            <LiquidGlassButton
              size="regular"
              onPress={() => setBtnClicks((c) => c + 1)}
            >
              Taps: {btnClicks}
            </LiquidGlassButton>

            <LiquidGlassButton
              size="regular"
              tint="#0088FFCC"
              loading={btnLoading}
              onPress={() => {
                setBtnLoading(true);
                setTimeout(() => setBtnLoading(false), 1500);
              }}
              icon={({ color, size }) => (
                <Ionicons name="sparkles" color={color} size={size} />
              )}
            >
              {btnLoading ? "Saving" : "Tinted"}
            </LiquidGlassButton>

            <LiquidGlassButton size="small">Small</LiquidGlassButton>
          </View>
        </View>

        {/* 2. LiquidGlassIconButton */}
        <View style={styles.controlBox}>
          <Text style={[styles.controlLabel, { color: colors.subtext }]}>
            2. LiquidGlassIconButton
          </Text>
          <View style={styles.rowCentered}>
            <LiquidGlassIconButton
              accessibilityLabel="Bookmark Toggle"
              onPress={() => setIsBookmarked((b) => !b)}
              tint={isBookmarked ? "#FF9500CC" : undefined}
              icon={({ color, size }) => (
                <Ionicons
                  name={isBookmarked ? "bookmark" : "bookmark-outline"}
                  color={isBookmarked ? "#FFF" : color}
                  size={size}
                />
              )}
            />
            <LiquidGlassIconButton
              accessibilityLabel="Heart"
              tint="#FF2D55CC"
              icon={({ size }) => <Ionicons name="heart" color="#FFF" size={size} />}
              onPress={() => onFireToast("Liked with LiquidGlassIconButton")}
            />
            <LiquidGlassIconButton
              accessibilityLabel="Share"
              icon={({ color, size }) => (
                <Ionicons name="share-outline" color={color} size={size} />
              )}
              onPress={() => onFireToast("Shared!")}
            />
          </View>
        </View>

        {/* 3. LiquidGlassChip */}
        <View style={styles.controlBox}>
          <Text style={[styles.controlLabel, { color: colors.subtext }]}>
            3. LiquidGlassChip (Selectable Group)
          </Text>
          <View style={styles.chipRow}>
            {["Refraction", "Dispersion", "Blur", "Metal", "AGSL"].map((chip) => (
              <LiquidGlassChip
                key={chip}
                label={chip}
                selected={selectedChips.has(chip)}
                onPress={() => toggleChip(chip)}
              />
            ))}
          </View>
        </View>

        {/* 4. LiquidGlassSwitch */}
        <View style={styles.controlBox}>
          <View style={styles.rowBetween}>
            <Text style={[styles.controlLabel, { color: colors.subtext }]}>
              4. LiquidGlassSwitch
            </Text>
            <Text style={[styles.statusVal, { color: colors.text }]}>
              {switchVal ? "ON" : "OFF"}
            </Text>
          </View>
          <View style={styles.rowCentered}>
            <LiquidGlassSwitch
              value={switchVal}
              onValueChange={setSwitchVal}
              accentColor="#34C759"
            />
          </View>
        </View>

        {/* 5. LiquidGlassSlider */}
        <View style={styles.controlBox}>
          <View style={styles.rowBetween}>
            <Text style={[styles.controlLabel, { color: colors.subtext }]}>
              5. LiquidGlassSlider
            </Text>
            <Text style={[styles.statusVal, { color: colors.text }]}>
              {(sliderVal * 100).toFixed(0)}%
            </Text>
          </View>
          <LiquidGlassSlider
            value={sliderVal}
            onValueChange={setSliderVal}
            accentColor="#0A84FF"
          />
        </View>

        {/* 6. LiquidGlassStepper */}
        <View style={styles.controlBox}>
          <View style={styles.rowBetween}>
            <Text style={[styles.controlLabel, { color: colors.subtext }]}>
              6. LiquidGlassStepper
            </Text>
            <Text style={[styles.statusVal, { color: colors.text }]}>
              Value: {stepperVal}
            </Text>
          </View>
          <View style={styles.rowCentered}>
            <LiquidGlassStepper
              value={stepperVal}
              onValueChange={setStepperVal}
              minimumValue={0}
              maximumValue={20}
              step={1}
            />
          </View>
        </View>

        {/* 7. LiquidGlassSegmentedControl */}
        <View style={styles.controlBox}>
          <Text style={[styles.controlLabel, { color: colors.subtext }]}>
            7. LiquidGlassSegmentedControl
          </Text>
          <LiquidGlassSegmentedControl
            segments={["Day", "Week", "Month", "Year"]}
            selectedIndex={segIdx}
            onChange={setSegIdx}
          />
        </View>

        {/* 8. LiquidGlassTextInput */}
        <View style={styles.controlBox}>
          <Text style={[styles.controlLabel, { color: colors.subtext }]}>
            8. LiquidGlassTextInput
          </Text>
          <LiquidGlassTextInput
            value={textInputVal}
            onChangeText={setTextInputVal}
            placeholder="Type here..."
            leading={<Ionicons name="search" size={18} color="#8E8E93" style={{ marginRight: 6 }} />}
          />
        </View>

        {/* 9. LiquidGlassCard */}
        <View style={styles.controlBox}>
          <Text style={[styles.controlLabel, { color: colors.subtext }]}>
            9. LiquidGlassCard
          </Text>
          <LiquidGlassCard
            cornerRadius={20}
            onPress={() => setCardTaps((c) => c + 1)}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Interactive Glass Card
            </Text>
            <Text style={[styles.cardBody, { color: colors.subtext }]}>
              Tap to test card press feedback. Total taps: {cardTaps}.
            </Text>
          </LiquidGlassCard>
        </View>

        {/* 10. LiquidGlassToolbar */}
        <View style={styles.controlBox}>
          <Text style={[styles.controlLabel, { color: colors.subtext }]}>
            10. LiquidGlassToolbar
          </Text>
          <LiquidGlassToolbar
            title="Toolbar Demo"
            leading={
              <LiquidGlassIconButton
                icon={({ color, size }) => <Ionicons name="menu" color={color} size={size} />}
                accessibilityLabel="Menu"
                onPress={() => onFireToast("Menu tapped")}
              />
            }
            trailing={
              <LiquidGlassIconButton
                icon={({ color, size }) => <Ionicons name="search" color={color} size={size} />}
                accessibilityLabel="Search"
                onPress={() => onFireToast("Search tapped")}
              />
            }
          />
        </View>

        {/* 11. LiquidGlassGroup (Merge-into-neighbour) */}
        <View style={styles.controlBox}>
          <Text style={[styles.controlLabel, { color: colors.subtext }]}>
            11. LiquidGlassGroup (Merge-into-neighbour)
          </Text>
          <LiquidGlassGroup gap={12}>
            <LiquidGlassButton onPress={() => setGroupCount((c) => c + 1)}>
              Group 1 ({groupCount})
            </LiquidGlassButton>
            <LiquidGlassButton onPress={() => setGroupCount((c) => c + 1)} tint="#0088FFCC">
              Group 2
            </LiquidGlassButton>
          </LiquidGlassGroup>
        </View>

        {/* 12. LiquidGlassStack */}
        <View style={styles.controlBox}>
          <Text style={[styles.controlLabel, { color: colors.subtext }]}>
            12. LiquidGlassStack (Stacked Layers)
          </Text>
          <LiquidGlassStack style={styles.stackContainer}>
            <LiquidGlassStack.Layer>
              <View style={[styles.stackBase, { backgroundColor: isDark ? "#2C2C2E" : "#E5E5EA" }]}>
                <Text style={[styles.stackText, { color: colors.text }]}>
                  Base Stack Layer Content
                </Text>
              </View>
            </LiquidGlassStack.Layer>
            <LiquidGlassStack.Layer>
              <LiquidGlassView
                style={styles.stackGlassView}
                cornerRadius={16}
                interactive
              >
                <Text style={styles.stackGlassLabel}>Refracting Layer Glass</Text>
              </LiquidGlassView>
            </LiquidGlassStack.Layer>
          </LiquidGlassStack>
        </View>

        {/* 13. LiquidGlassContainer (Two glass views merging) */}
        <View style={styles.controlBox}>
          <Text style={[styles.controlLabel, { color: colors.subtext }]}>
            13. LiquidGlassContainer (Merging body)
          </Text>
          <LiquidGlassContainer spacing={24} style={styles.containerMergeRow}>
            <LiquidGlassView cornerRadius={20} style={styles.mergePill}>
              <Text style={styles.mergeText}>Body A</Text>
            </LiquidGlassView>
            <LiquidGlassView cornerRadius={20} style={styles.mergePill} tint="#34C75933">
              <Text style={styles.mergeText}>Body B</Text>
            </LiquidGlassView>
          </LiquidGlassContainer>
        </View>

        {/* 14. LiquidGlassMorphGroup (Signature Demo) */}
        <View style={styles.controlBox}>
          <View style={styles.rowBetween}>
            <Text style={[styles.controlLabel, { color: colors.subtext }]}>
              14. LiquidGlassMorphGroup (Puck Necking)
            </Text>
            <Text style={styles.morphBadge}>{morphStatus}</Text>
          </View>
          <View style={styles.morphWrapper}>
            <LiquidGlassMorphGroup
              items={[
                { key: "puckA", label: "Puck A" },
                { key: "puckB", label: "Puck B" },
              ]}
              onMerge={(from, to) => {
                setMorphStatus(`Merged: ${from} → ${to}`);
                onFireToast(`Morph Merged: ${from} with ${to}`);
              }}
            />
          </View>
        </View>

        {/* 15. LiquidGlassScrim */}
        <View style={styles.controlBox}>
          <View style={styles.rowBetween}>
            <Text style={[styles.controlLabel, { color: colors.subtext }]}>
              15. LiquidGlassScrim (Progressive Blur)
            </Text>
            <LiquidGlassButton size="small" onPress={() => setShowScrim((s) => !s)}>
              {showScrim ? "Hide" : "Show"}
            </LiquidGlassButton>
          </View>
          {showScrim && (
            <View style={styles.scrimContainer}>
              <LiquidGlassScrim edge="bottom" size={70} radius={24}>
                <View style={styles.scrimInner}>
                  <Text style={styles.scrimText}>Progressive Blur Edge Melt</Text>
                </View>
              </LiquidGlassScrim>
            </View>
          )}
        </View>

        {/* 16. LiquidGlassSheet & 17. LiquidGlassToast Triggers */}
        <View style={styles.controlBox}>
          <Text style={[styles.controlLabel, { color: colors.subtext }]}>
            16. LiquidGlassSheet & 17. LiquidGlassToast
          </Text>
          <View style={styles.buttonRow}>
            <LiquidGlassButton
              tint="#AF52DECC"
              onPress={onOpenSheet}
              icon={({ color, size }) => <Ionicons name="chevron-up" color={color} size={size} />}
            >
              Open Sheet
            </LiquidGlassButton>

            <LiquidGlassButton
              tint="#FF9500CC"
              onPress={() => onFireToast("Liquid Glass Toast Fired!")}
              icon={({ color, size }) => <Ionicons name="notifications" color={color} size={size} />}
            >
              Fire Toast
            </LiquidGlassButton>
          </View>
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
  backgroundCanvas: {
    ...StyleSheet.absoluteFill,
    overflow: "hidden",
  },
  bgBlob: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
  },
  galleryTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  gallerySubtitle: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 16,
    marginTop: 2,
  },
  controlBox: {
    marginBottom: 20,
  },
  controlLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  rowCentered: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusVal: {
    fontSize: 12,
    fontWeight: "700",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardBody: {
    fontSize: 13,
  },
  stackContainer: {
    height: 90,
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },
  stackBase: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stackText: {
    fontSize: 12,
    fontWeight: "600",
  },
  stackGlassView: {
    width: 200,
    height: 44,
    alignSelf: "center",
    marginTop: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  stackGlassLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  containerMergeRow: {
    flexDirection: "row",
    gap: 12,
  },
  mergePill: {
    width: 100,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  mergeText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
  morphBadge: {
    fontSize: 10,
    color: "#10B981",
    fontWeight: "700",
  },
  morphWrapper: {
    paddingVertical: 4,
  },
  scrimContainer: {
    height: 70,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FF007F22",
  },
  scrimInner: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 24,
  },
  scrimText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
});
