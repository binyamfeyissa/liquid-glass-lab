import React, { type ReactNode } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import {
  colors,
  Card,
  SegmentedControl,
  Separator,
  Text,
  type TextProps,
} from "glacia-native";
import { ChevronRight } from "lucide-react-native";

import { useHealth, type BackdropMode } from "./state";

export const MONO = Platform.OS === "ios" ? "Menlo" : "monospace";

/* ------------------------------------------------------------------ */
/*  Chrome colours — one ramp per mode, one soft-teal accent.          */
/*  The accent is chart ink: #0f766e on broken white, #4fb3a1 on       */
/*  graphite and photo. Deltas/errors use toned pairs, nothing neon.   */
/* ------------------------------------------------------------------ */

export function chromeColors(mode: BackdropMode) {
  const light = mode === "light";
  return {
    accent: light ? "#0f766e" : "#4fb3a1",
    pos: light ? "#177245" : "#3fae7c",
    neg: light ? "#b3261e" : "#e0655a",
    hairline: light ? "rgba(31,27,22,0.10)" : "rgba(237,237,237,0.10)",
    fill: light ? "rgba(31,27,22,0.05)" : "rgba(237,237,237,0.07)",
    pressed: light ? "rgba(31,27,22,0.06)" : "rgba(237,237,237,0.08)",
    barNeutral: light ? "#cdc5b4" : "#3d4240",
  };
}

export function accentColor(mode: BackdropMode): string {
  return chromeColors(mode).accent;
}

/* ------------------------------------------------------------------ */
/*  T — Glacia Text threaded with the template's manual theme.         */
/* ------------------------------------------------------------------ */

export function T({ style, ...rest }: TextProps) {
  const { darkMode } = useHealth();
  return <Text isDark={darkMode} style={style} {...rest} />;
}

/* ------------------------------------------------------------------ */
/*  Figure — every figure in the mono face: steps, glasses, hours,     */
/*  kilograms, streaks, BMI. Tabular, so columns line up.              */
/* ------------------------------------------------------------------ */

export function Figure({ style, ...rest }: TextProps) {
  const { darkMode } = useHealth();
  return <Text isDark={darkMode} style={[styles.figure, style]} {...rest} />;
}

/* ------------------------------------------------------------------ */
/*  Backdrop — the three backgrounds, and nothing else.                */
/*  Dark: graphite #141415. Light: broken white #f7f4ee.               */
/*  Photo: the palm image, full-bleed, under a neutral scrim.         */
/* ------------------------------------------------------------------ */

export function Backdrop() {
  const { backdrop } = useHealth();
  if (backdrop === "image") {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Image
          source={require("./assets/tahoe-dark.jpg")}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(0,0,0,0.38)" },
          ]}
        />
      </View>
    );
  }
  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: backdrop === "light" ? "#f7f4ee" : "#141415" },
      ]}
    />
  );
}

/** The three-background switcher, used on Profile. */
export function BackdropControl() {
  const { backdrop, setBackdrop, darkMode } = useHealth();
  const modes: BackdropMode[] = ["dark", "light", "image"];
  return (
    <SegmentedControl
      segments={["Dark", "Light", "Photo"]}
      selectedIndex={modes.indexOf(backdrop)}
      onChange={(i) => setBackdrop(modes[i])}
      isDark={darkMode}
      accessibilityLabel="Background"
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Screen — scrollable page shell with a title block.                 */
/* ------------------------------------------------------------------ */

/** Bottom clearance for tab screens: the floating TabBar is 64pt tall
 *  + 8pt top pad + the bottom safe-area inset (up to 34pt home indicator,
 *  48pt Android 3-button nav), so 128pt lets the last row scroll fully
 *  clear of the bar. Only tab screens use it (see Screen belowTabBar);
 *  stack/detail screens keep their 32pt bottom padding. */
export const TAB_BAR_CLEARANCE = 128;

export function Screen({
  title,
  subtitle,
  children,
  belowTabBar,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** True on tab screens: the floating TabBar overlays the scene, so the
   *  scroll content gets TAB_BAR_CLEARANCE of bottom padding and the last
   *  row can scroll up above the bar instead of hiding behind it. False
   *  (default) on stack/detail screens, which have no bar over them. */
  belowTabBar?: boolean;
}) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        belowTabBar
          ? [styles.screenContent, { paddingBottom: TAB_BAR_CLEARANCE }]
          : styles.screenContent
      }
      showsVerticalScrollIndicator={false}
    >
      <T variant="title" style={styles.screenTitle}>
        {title}
      </T>
      {subtitle ? (
        <T variant="body" muted style={styles.screenSubtitle}>
          {subtitle}
        </T>
      ) : null}
      <View style={styles.screenBody}>{children}</View>
    </ScrollView>
  );
}

/* ------------------------------------------------------------------ */
/*  List vocabulary shared by the screens.                             */
/* ------------------------------------------------------------------ */

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <T variant="label" muted style={styles.sectionTitle}>
      {children}
    </T>
  );
}

export function ListCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { darkMode } = useHealth();
  return (
    <Card isDark={darkMode} padding={8} style={style}>
      {children}
    </Card>
  );
}

export function RowSeparator() {
  const { darkMode } = useHealth();
  return <Separator isDark={darkMode} inset={16} />;
}

/** A label above a form control, used across Log and Profile. */
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.field}>
      <T variant="label" muted style={styles.fieldLabel}>
        {label}
      </T>
      {children}
    </View>
  );
}

/** A label + optional description on the left, a control on the right. */
export function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingText}>
        <T variant="body">{title}</T>
        {description ? (
          <T variant="caption" muted style={styles.settingDescription}>
            {description}
          </T>
        ) : null}
      </View>
      <View style={styles.settingControl}>{children}</View>
    </View>
  );
}

/** A tappable list row with a chevron, for menus and link lists. */
export function NavRow({
  title,
  description,
  detail,
  onPress,
}: {
  title: string;
  description?: string;
  detail?: string;
  onPress: () => void;
}) {
  const { backdrop, darkMode } = useHealth();
  const chrome = chromeColors(backdrop);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.navRow,
        pressed && { backgroundColor: chrome.pressed },
      ]}
    >
      <View style={styles.settingText}>
        <T variant="body">{title}</T>
        {description ? (
          <T variant="caption" muted style={styles.settingDescription}>
            {description}
          </T>
        ) : null}
      </View>
      {detail ? (
        <Figure variant="caption" muted style={styles.navDetail}>
          {detail}
        </Figure>
      ) : null}
      <ChevronRight size={20} color={colors[darkMode ? "dark" : "light"].muted} />
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  Bars — the 7-day ruled mini-chart, from plain Views (glacia-       */
/*  native has no chart components). Past days are neutral steps;      */
/*  today is the one accent bar. Mono day labels under a hairline.     */
/* ------------------------------------------------------------------ */

export function Bars({
  values,
  labels,
  height = 110,
  floor,
}: {
  values: number[];
  labels: string[];
  height?: number;
  /** Baseline the bars grow from; defaults to 0. Pass a value just under
   *  the data minimum for metrics like weight, where 0 is meaningless. */
  floor?: number;
}) {
  const { backdrop } = useHealth();
  const chrome = chromeColors(backdrop);
  const max = Math.max(...values, 1);
  const min = floor ?? Math.min(...values, 0);
  const span = Math.max(max - min, 1);
  return (
    <View>
      <View style={[styles.barsRow, { height }]}>
        {values.map((v, i) => {
          const isToday = i === values.length - 1;
          return (
            <View key={i} style={styles.barCol}>
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max(4, ((v - min) / span) * (height - 8)),
                    backgroundColor: isToday
                      ? chrome.accent
                      : chrome.barNeutral,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>
      <View
        style={[styles.baseline, { borderTopColor: chrome.hairline }]}
      />
      <View style={styles.barsRow}>
        {labels.map((l, i) => (
          <View key={i} style={styles.barCol}>
            <Figure
              variant="caption"
              muted={i !== labels.length - 1}
              style={styles.barLabel}
            >
              {l}
            </Figure>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  figure: {
    fontFamily: MONO,
    fontVariant: ["tabular-nums"],
  },
  screen: {
    flex: 1,
  },
  screenContent: {
    paddingHorizontal: 24,
    paddingTop: 112,
    paddingBottom: 32,
  },
  screenTitle: {},
  screenSubtitle: {
    marginTop: 8,
  },
  screenBody: {
    marginTop: 24,
    gap: 24,
  },
  sectionTitle: {
    marginBottom: 8,
    marginLeft: 4,
  },
  field: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fieldLabel: {
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 16,
  },
  settingText: {
    flex: 1,
  },
  settingDescription: {
    marginTop: 2,
  },
  settingControl: {
    flexShrink: 0,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: 12,
  },
  navDetail: {
    flexShrink: 0,
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bar: {
    width: "62%",
    borderRadius: 4,
  },
  baseline: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
  },
  barLabel: {
    marginTop: 8,
    fontSize: 11,
  },
});
