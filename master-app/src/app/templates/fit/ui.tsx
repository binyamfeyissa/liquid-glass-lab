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
import Svg, { Circle } from "react-native-svg";
import {
  colors,
  Badge,
  Card,
  SegmentedControl,
  Separator,
  Text,
  type TextProps,
} from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import ChevronRightIcon from "@hugeicons/core-free-icons/ChevronRightIcon";
import { useFit, type BackdropMode } from "./state";
import type { Workout } from "./data";

/* ------------------------------------------------------------------ */
/*  Accent — strong orange, the colour of effort. It appears only      */
/*  where effort is measured: the ring arc, today's bar, the current   */
/*  set, the main goal bar.                                            */
/* ------------------------------------------------------------------ */

export function accentColor(dark: boolean): string {
  return dark ? "#f97316" : "#c2410c";
}

/** Neutral step of the ramp for secondary bars and tracks. */
export function neutralTint(dark: boolean): string {
  return dark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.30)";
}

const MONO = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

/* ------------------------------------------------------------------ */
/*  T — Glacia Text threaded with the template's manual theme.         */
/* ------------------------------------------------------------------ */

export function T({ style, ...rest }: TextProps) {
  const { darkMode } = useFit();
  return <Text isDark={darkMode} style={style} {...rest} />;
}

/* ------------------------------------------------------------------ */
/*  Figure — every number in Pulse is a tabular counter: mono face,    */
/*  tabular figures, so steps, calories, minutes, sets and times       */
/*  line up like a scoreboard.                                         */
/* ------------------------------------------------------------------ */

export function Figure({ style, ...rest }: TextProps) {
  const { darkMode } = useFit();
  return (
    <Text
      isDark={darkMode}
      style={[{ fontFamily: MONO, fontVariant: ["tabular-nums"] }, style]}
      {...rest}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Backdrop — the three backgrounds, and nothing else.                */
/*  Dark: graphite #141415. Light: broken white #f7f4ee.               */
/*  Photo: the palm image, full-bleed, under a neutral scrim.         */
/* ------------------------------------------------------------------ */

export function Backdrop() {
  const { backdrop } = useFit();
  if (backdrop === "image") {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Image
          source={require("./assets/tahoe-dark.jpg")}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.38)" }]}
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
  const { backdrop, setBackdrop, darkMode } = useFit();
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
  const { darkMode } = useFit();
  return (
    <Card isDark={darkMode} padding={8} style={style}>
      {children}
    </Card>
  );
}

export function RowSeparator() {
  const { darkMode } = useFit();
  return <Separator isDark={darkMode} inset={16} />;
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
      <View style={styles.flex1}>
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
  const { darkMode } = useFit();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.navRow,
        pressed && {
          backgroundColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
        },
      ]}
    >
      <View style={styles.flex1}>
        <T variant="body">{title}</T>
        {description ? (
          <T variant="caption" muted style={styles.settingDescription}>
            {description}
          </T>
        ) : null}
      </View>
      {detail ? (
        <T variant="caption" muted>
          {detail}
        </T>
      ) : null}
      <HugeiconsIcon icon={ChevronRightIcon} size={20} color={colors[darkMode ? "dark" : "light"].muted} />
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  RingProgress — an SVG ring (glacia-native ships no charts; this    */
/*  is two circles and a rotation, drawn with react-native-svg).       */
/* ------------------------------------------------------------------ */

export function RingProgress({
  value,
  size = 132,
  strokeWidth = 11,
  tint,
  children,
}: {
  /** 0–1 */
  value: number;
  size?: number;
  strokeWidth?: number;
  /** Arc colour — defaults to the accent; the track stays neutral. */
  tint?: string;
  children?: ReactNode;
}) {
  const { darkMode } = useFit();
  const clamped = Math.min(1, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={darkMode ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.10)"}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={tint ?? accentColor(darkMode)}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference * clamped} ${circumference}`}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.ringCenter]}>{children}</View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  WeekBars — seven active-minute bars built from plain Views.        */
/* ------------------------------------------------------------------ */

export function WeekBars({
  bars,
  height = 84,
}: {
  bars: { label: string; minutes: number; isToday: boolean }[];
  height?: number;
}) {
  const { darkMode } = useFit();
  const max = Math.max(30, ...bars.map((b) => b.minutes));
  return (
    <View>
      <View style={[styles.barsRow, { height }]}>
        {bars.map((bar, i) => (
          <View key={i} style={styles.barColumn}>
            <View
              style={[
                styles.bar,
                {
                  height: Math.max(5, (bar.minutes / max) * (height - 8)),
                  backgroundColor: bar.isToday
                    ? accentColor(darkMode)
                    : darkMode
                      ? "rgba(255,255,255,0.28)"
                      : "rgba(0,0,0,0.22)",
                },
              ]}
            />
          </View>
        ))}
      </View>
      <View style={styles.barsLabels}>
        {bars.map((bar, i) => (
          <View key={i} style={styles.barColumn}>
            <T
              variant="caption"
              muted={!bar.isToday}
              style={
                bar.isToday
                  ? { color: accentColor(darkMode), fontWeight: "600" }
                  : undefined
              }
            >
              {bar.label}
            </T>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  WorkoutTile — one flat, toned colour field with the workout's      */
/*  initials. No gradients, no image assets.                           */
/* ------------------------------------------------------------------ */

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

export function WorkoutTile({
  workout,
  size = 52,
}: {
  workout: Workout;
  size?: number;
}) {
  if (workout.image) {
    return (
      <Image
        source={workout.image}
        style={{ width: size, height: size, borderRadius: size * 0.3 }}
        resizeMode="cover"
      />
    );
  }
  return (
    <View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderRadius: size * 0.3,
          backgroundColor: workout.tone,
        },
      ]}
    >
      <T variant="heading" style={[styles.tileText, { fontSize: size * 0.34 }]}>
        {initialsOf(workout.name)}
      </T>
    </View>
  );
}

/** A tappable workout row: tile, name, meta, level badge, chevron. */
export function WorkoutRow({
  workout,
  onPress,
}: {
  workout: Workout;
  onPress: () => void;
}) {
  const { darkMode } = useFit();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${workout.name}, ${workout.durationMin} minutes, ${workout.level}`}
      style={({ pressed }) => [
        styles.workoutRow,
        pressed && {
          backgroundColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
        },
      ]}
    >
      <WorkoutTile workout={workout} />
      <View style={styles.flex1}>
        <T variant="body" numberOfLines={1}>
          {workout.name}
        </T>
        <T variant="caption" muted style={styles.settingDescription}>
          {workout.category} · {workout.durationMin} min · {workout.exercises.length}{" "}
          exercises
        </T>
      </View>
      <Badge tone="muted" isDark={darkMode}>
        {workout.level}
      </Badge>
      <HugeiconsIcon icon={ChevronRightIcon} size={20} color={colors[darkMode ? "dark" : "light"].muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  screenContent: {
    paddingHorizontal: 24,
    paddingTop: 112,
    paddingBottom: 28,
  },
  screenTitle: {},
  screenSubtitle: {
    marginTop: 4,
  },
  screenBody: {
    marginTop: 24,
    gap: 24,
  },
  sectionTitle: {
    marginBottom: 8,
    marginLeft: 6,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  flex1: {
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
  ringCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
  },
  bar: {
    width: "62%",
    borderRadius: 6,
  },
  barsLabels: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  tile: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  tileText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  workoutRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: 12,
  },
});
