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
  Badge,
  Card,
  SegmentedControl,
  Separator,
  Text,
  type TextProps,
} from "glacia-native";
import { ChevronRight, Star } from "lucide-react-native";

import type { Job } from "./data";
import { useFleet, type BackdropMode } from "./state";

/* ------------------------------------------------------------------ */
/*  Theme tokens — one graphite/warm ramp, one hi-vis amber accent.    */
/* ------------------------------------------------------------------ */

export const MONO = Platform.OS === "ios" ? "Menlo" : "monospace";

/** Hi-vis amber. Darker on light surfaces for contrast. */
export function accentColor(mode: BackdropMode): string {
  return mode === "light" ? "#9a6206" : "#eda63f";
}

/** Chrome surfaces per mode, for the pieces Glacia does not style. */
export function chromeColors(mode: BackdropMode) {
  return mode === "light"
    ? {
        fill: "rgba(0,0,0,0.05)",
        pressed: "rgba(0,0,0,0.08)",
        bar: "#efe9df",
        line: "rgba(0,0,0,0.16)",
      }
    : {
        fill: "rgba(255,255,255,0.08)",
        pressed: "rgba(255,255,255,0.12)",
        bar: "#232325",
        line: "rgba(255,255,255,0.2)",
      };
}

/* ------------------------------------------------------------------ */
/*  Money formatting. One format everywhere: $1,234.56.                */
/* ------------------------------------------------------------------ */

export function money(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  return `${sign}$${abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/* ------------------------------------------------------------------ */
/*  T — Glacia Text threaded with the template's manual theme.         */
/*  Figure — the same, in mono with tabular figures. Every payout,     */
/*  distance, time and count on screen is a Figure.                    */
/* ------------------------------------------------------------------ */

export function T({ style, ...rest }: TextProps) {
  const { darkMode } = useFleet();
  return <Text isDark={darkMode} style={style} {...rest} />;
}

export function Figure({ style, ...rest }: TextProps) {
  const { darkMode } = useFleet();
  return (
    <Text
      isDark={darkMode}
      style={{
        fontFamily: MONO,
        fontVariant: ["tabular-nums"],
        ...(style as object),
      }}
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
  const { backdrop } = useFleet();
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
  const { backdrop, setBackdrop, darkMode } = useFleet();
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

export function Screen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      <T variant="title">{title}</T>
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
/*  Shared list vocabulary                                             */
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
  const { darkMode } = useFleet();
  return (
    <Card isDark={darkMode} padding={8} style={style}>
      {children}
    </Card>
  );
}

export function RowSeparator() {
  const { darkMode } = useFleet();
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
      <View style={styles.flex}>
        <T variant="body">{title}</T>
        {description ? (
          <T variant="caption" muted style={styles.description}>
            {description}
          </T>
        ) : null}
      </View>
      <View style={styles.control}>{children}</View>
    </View>
  );
}

/** A tappable list row with a chevron. */
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
  const { darkMode, backdrop } = useFleet();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.navRow,
        pressed && { backgroundColor: chromeColors(backdrop).pressed },
      ]}
    >
      <View style={styles.flex}>
        <T variant="body">{title}</T>
        {description ? (
          <T variant="caption" muted style={styles.description}>
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
/*  Fleet-specific pieces                                              */
/* ------------------------------------------------------------------ */

function mixHex(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const mixed = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `#${mixed.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** The flat plate colour for a fixture colour pair in the current mode. */
export function plateColor(colors: [string, string], dark: boolean): string {
  const averaged = mixHex(colors[0], colors[1], 0.5);
  return mixHex(averaged, dark ? "#232325" : "#efe9df", 0.55);
}

/**
 * Composed restaurant tile: one flat tonal plate mixed from the
 * restaurant's fixture colours toward the mode neutral, initial in ink.
 */
export function RestaurantTile({
  name,
  colors,
  size = 44,
}: {
  name: string;
  colors: [string, string];
  size?: number;
}) {
  const { darkMode } = useFleet();
  return (
    <View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderRadius: 12,
          backgroundColor: plateColor(colors, darkMode),
        },
      ]}
    >
      <Text
        isDark={darkMode}
        variant="heading"
        style={{
          color: darkMode ? "rgba(237,237,237,0.92)" : "rgba(31,27,22,0.85)",
        }}
      >
        {name.charAt(0)}
      </Text>
    </View>
  );
}

/** Job status as a quiet badge — the word carries the meaning. */
export function StatusBadge({ status }: { status: Job["status"] }) {
  const { darkMode } = useFleet();
  const label =
    status === "completed"
      ? "Completed"
      : status === "active"
        ? "Active"
        : status === "declined"
          ? "Declined"
          : "Offer";
  return (
    <Badge tone="muted" isDark={darkMode}>
      {label}
    </Badge>
  );
}

/**
 * Stars are Lucide icons — glacia-native has no rating widget.
 * Set in ink, never in an accent: the number beside them is the figure.
 */
export function Stars({ count, size = 15 }: { count: number; size?: number }) {
  const { darkMode } = useFleet();
  const ink = darkMode ? "#ededed" : "#1f1b16";
  return (
    <View style={{ flexDirection: "row", gap: 2, alignItems: "center" }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          size={size}
          color={i < count ? ink : "rgba(127,127,127,0.45)"}
          fill={i < count ? ink : "none"}
        />
      ))}
    </View>
  );
}

/** One job in a list — used on the Jobs tab. */
export function JobRow({
  job,
  onPress,
}: {
  job: Job;
  onPress?: () => void;
}) {
  const { darkMode, backdrop } = useFleet();
  const body = (
    <>
      <RestaurantTile name={job.restaurant} colors={job.colors} />
      <View style={styles.flex}>
        <T variant="body" numberOfLines={1}>
          {job.restaurant}
        </T>
        <T variant="caption" muted style={styles.description}>
          {job.dropoffAddress} · {job.distanceKm.toFixed(1)} km
        </T>
        <View style={styles.badgeWrap}>
          <StatusBadge status={job.status} />
        </View>
      </View>
      <Figure variant="heading">{money(job.payout)}</Figure>
    </>
  );
  if (!onPress) return <View style={styles.jobRow}>{body}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${job.restaurant}, ${job.status}, ${money(job.payout)}`}
      style={({ pressed }) => [
        styles.jobRow,
        pressed && { backgroundColor: chromeColors(backdrop).pressed },
      ]}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1 },
  screenContent: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 32,
  },
  screenSubtitle: { marginTop: 8 },
  screenBody: { marginTop: 24, gap: 24 },
  sectionTitle: {
    marginBottom: 8,
    marginLeft: 8,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 16,
  },
  description: { marginTop: 2 },
  control: { flexShrink: 0 },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: 12,
  },
  navDetail: { flexShrink: 0 },
  tile: {
    alignItems: "center",
    justifyContent: "center",
  },
  badgeWrap: { marginTop: 4, alignSelf: "flex-start" },
  jobRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: 12,
  },
});
