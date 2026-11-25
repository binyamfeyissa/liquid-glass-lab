import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, SegmentedControl, Slider, Switch } from "glacia-native";

import { useAppState, type TextSizeChoice } from "./state";
import { BackdropControl, Figure, Screen, SectionTitle, T } from "./ui";

const SIZE_SEGMENTS = ["Small", "Default", "Large"];
const SIZE_VALUES: TextSizeChoice[] = ["small", "default", "large"];

export default function AppearanceScreen() {
  const { appearance, setAppearance, glaciaDark, isDark } = useAppState();
  const [previewSwitch, setPreviewSwitch] = React.useState(true);

  const intensity = appearance.glassIntensity;
  // The slider drives the wash of the preview card's glass: at 0 the surface
  // is nearly clear, at 100 it is at its frostiest. Light mode needs a
  // stronger white wash to read as glass at all.
  const previewTint = isDark
    ? `rgba(255, 255, 255, ${(0.02 + (intensity / 100) * 0.3).toFixed(3)})`
    : `rgba(255, 255, 255, ${(0.12 + (intensity / 100) * 0.6).toFixed(3)})`;

  return (
    <Screen title="Appearance" subtitle="Background, glass and text size.">
      <View>
        <SectionTitle>Background</SectionTitle>
        <Card isDark={glaciaDark} padding={20}>
          <BackdropControl />
          <T variant="caption" muted style={styles.note}>
            Dark, light, or the lake photo. Every surface in the app follows it.
          </T>
        </Card>
      </View>

      <View>
        <SectionTitle>Glass intensity</SectionTitle>
        <Card isDark={glaciaDark} padding={20}>
          <View style={styles.sliderLabels}>
            <T variant="body">Frost</T>
            <Figure variant="body" muted>
              {intensity}%
            </Figure>
          </View>
          <Slider
            value={intensity}
            min={0}
            max={100}
            step={1}
            onValueChange={(v) => setAppearance({ glassIntensity: Math.round(v) })}
            accessibilityLabel="Glass intensity"
            isDark={glaciaDark}
          />
          <Card
            isDark={glaciaDark}
            tint={previewTint}
            padding={16}
            style={styles.previewCard}
          >
            <T variant="label" muted>
              Preview
            </T>
            <View style={styles.previewRow}>
              <View style={styles.previewText}>
                <T variant="body">Glass over the backdrop</T>
                <T variant="caption" muted>
                  Frost at {intensity}%.
                </T>
              </View>
              <Switch
                value={previewSwitch}
                onValueChange={setPreviewSwitch}
                accessibilityLabel="Preview switch"
                isDark={glaciaDark}
              />
            </View>
            <Button
              variant="glass"
              size="sm"
              isDark={glaciaDark}
              accessibilityLabel="Preview button"
              style={styles.previewButton}
            >
              Preview button
            </Button>
          </Card>
        </Card>
      </View>

      <View>
        <SectionTitle>Text size</SectionTitle>
        <Card isDark={glaciaDark} padding={20}>
          <SegmentedControl
            segments={SIZE_SEGMENTS}
            selectedIndex={SIZE_VALUES.indexOf(appearance.textSize)}
            onChange={(i) => setAppearance({ textSize: SIZE_VALUES[i] })}
            accessibilityLabel="Text size"
            isDark={glaciaDark}
          />
          <T variant="body" style={styles.sample}>
            Notifications, sessions and your profile all use this size.
          </T>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: {
    marginTop: 12,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  previewCard: {
    marginTop: 16,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  previewText: {
    flex: 1,
    gap: 2,
  },
  previewButton: {
    marginTop: 16,
    alignSelf: "flex-start",
  },
  sample: {
    marginTop: 16,
  },
});
