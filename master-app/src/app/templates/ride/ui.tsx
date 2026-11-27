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
  Avatar,
  Badge,
  Card,
  SegmentedControl,
  Separator,
  Text,
  type TextProps,
} from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import ChevronRightIcon from "@hugeicons/core-free-icons/ChevronRightIcon";
import StarIcon from "@hugeicons/core-free-icons/StarIcon";
import { useRide, type BackdropMode, type Trip } from "./state";
import type { Fare } from "./data";

/* ------------------------------------------------------------------ */
/*  Theme tokens — one graphite/warm ramp, one signal yellow.        */
/* ------------------------------------------------------------------ */

export const MONO = Platform.OS === "ios" ? "Menlo" : "monospace";

/**
 * Signal yellow — the cab sign. Bright on dark and photo surfaces;
 * darkened on broken white, where full yellow cannot carry text.
 */
export function accentColor(mode: BackdropMode): string {
  return mode === "light" ? "#a16207" : "#f5c518";
}

/** Primary ink per mode, for marks drawn outside Glacia Text. */
export function inkColor(mode: BackdropMode): string {
  return mode === "light" ? "#1f1b16" : "#ededed";
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
/* ------------------------------------------------------------------ */

export function T({ style, ...rest }: TextProps) {
  const { darkMode } = useRide();
  return <Text isDark={darkMode} style={style} {...rest} />;
}

/* ------------------------------------------------------------------ */
/*  Figure — every figure in the mono face: fares, distances,          */
/*  durations, ratings, plates. Tabular, so columns line up.           */
/* ------------------------------------------------------------------ */

export function Figure({ style, ...rest }: TextProps) {
  const { darkMode } = useRide();
  return <Text isDark={darkMode} style={[styles.figure, style]} {...rest} />;
}

/* ------------------------------------------------------------------ */
/*  Backdrop — the three backgrounds, and nothing else.                */
/*  Dark: graphite #141415. Light: broken white #f7f4ee.               */
/*  Photo: the palm photo, full-bleed, under a neutral scrim.         */
/* ------------------------------------------------------------------ */

export function Backdrop() {
  const { backdrop } = useRide();
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
  const { backdrop, setBackdrop, darkMode } = useRide();
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
  const { darkMode } = useRide();
  return (
    <Card isDark={darkMode} padding={8} style={style}>
      {children}
    </Card>
  );
}

export function RowSeparator() {
  const { darkMode } = useRide();
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
  const { darkMode } = useRide();
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
      <HugeiconsIcon icon={ChevronRightIcon} size={18} color={darkMode ? colors.dark.muted : colors.light.muted} />
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  MapPanel — a composed "map": neutral ground, street lines drawn    */
/*  from plain Views, the route in signal yellow and two plain pins.   */
/*  No map library, no tiles, no network. `progress` (0–1) fills       */
/*  the route.                                                         */
/* ------------------------------------------------------------------ */

export function MapPanel({
  height = 220,
  progress = 0,
  destinationLabel,
}: {
  height?: number;
  progress?: number;
  destinationLabel?: string;
}) {
  const { darkMode, backdrop } = useRide();
  const ground = darkMode ? "#19191b" : "#efe9df";
  const street = darkMode ? "rgba(255,255,255,0.14)" : "rgba(31,27,22,0.12)";
  const block = darkMode ? "#232325" : "#e2dac8";
  const accent = accentColor(backdrop);
  const ink = inkColor(backdrop);
  return (
    <View style={[styles.map, { height, backgroundColor: ground }]}>
      {/* Streets: horizontal + vertical slabs. */}
      {[36, 92, 148].map((top) => (
        <View key={`h${top}`} style={[styles.streetH, { top, backgroundColor: street }]} />
      ))}
      {[58, 148, 238].map((left) => (
        <View key={`v${left}`} style={[styles.streetV, { left, backgroundColor: street }]} />
      ))}
      {/* A park block and a river, as neutral steps in the ground. */}
      <View
        style={[
          styles.mapBlock,
          { top: 104, left: 160, width: 66, height: 34, backgroundColor: block },
        ]}
      />
      <View
        style={[
          styles.mapBlock,
          { bottom: 0, right: 0, width: 90, height: 26, backgroundColor: block },
        ]}
      />
      {/* Route: an L-shaped pair of lines from pickup to destination. */}
      <View style={[styles.routeSeg, { left: 44, top: 62, width: 168, backgroundColor: street }]} />
      <View style={[styles.routeSeg, { left: 44, top: 62, width: 168 * Math.min(1, progress * 2), backgroundColor: accent }]} />
      <View style={[styles.routeSegV, { left: 208, top: 62, height: 96, backgroundColor: street }]} />
      <View
        style={[
          styles.routeSegV,
          {
            left: 208,
            top: 62,
            height: 96 * Math.max(0, Math.min(1, progress * 2 - 1)),
            backgroundColor: accent,
          },
        ]}
      />
      {/* Pins: pickup is a plain ink dot; the destination wears the accent. */}
      <View
        style={[
          styles.pin,
          styles.pinPickup,
          { backgroundColor: darkMode ? "rgba(255,255,255,0.18)" : "rgba(31,27,22,0.14)" },
        ]}
      >
        <View
          style={[
            styles.pinDotPickup,
            { backgroundColor: ink, borderColor: ground },
          ]}
        />
      </View>
      <View style={[styles.pin, styles.pinDest, { backgroundColor: accent }]}>
        <View style={styles.pinDotDest} />
      </View>
      <View style={styles.mapChip}>
        <T variant="caption" style={styles.mapChipText}>
          {destinationLabel ? `To ${destinationLabel}` : "248 Maple St · pickup"}
        </T>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Stars — a 1–5 star display or picker, drawn with Lucide stars.    */
/*  Filled stars are plain ink; the accent stays off the chrome.       */
/* ------------------------------------------------------------------ */

export function Stars({
  value,
  onChange,
  size = 22,
}: {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
}) {
  const { darkMode, backdrop } = useRide();
  const filledColor = inkColor(backdrop);
  const emptyColor = darkMode ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.22)";
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value;
        const star = (
          <HugeiconsIcon icon={StarIcon}
            size={size}
            color={filled ? filledColor : emptyColor}
            fill={filled ? filledColor : "transparent"}
          />
        );
        if (!onChange) return <View key={n}>{star}</View>;
        return (
          <Pressable
            key={n}
            onPress={() => onChange(n)}
            accessibilityRole="button"
            accessibilityLabel={`Rate ${n} star${n > 1 ? "s" : ""}`}
            accessibilityState={{ selected: value === n }}
            hitSlop={6}
          >
            {star}
          </Pressable>
        );
      })}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  FareBreakdown — the fare as a ruled table: label left, mono        */
/*  figure right, hairlines between, the total closing the table.      */
/*  The lines always sum to the total by construction (see data.ts).   */
/* ------------------------------------------------------------------ */

export function FareBreakdown({ fare, tip = 0 }: { fare: Fare; tip?: number }) {
  const rows: { label: string; value: number }[] = [
    { label: "Base fare", value: fare.base },
    { label: "Distance", value: fare.distanceCharge },
    { label: "Time", value: fare.timeCharge },
    { label: "Service fee", value: fare.serviceFee },
  ];
  if (tip > 0) rows.push({ label: "Tip", value: tip });
  return (
    <ListCard>
      <View style={styles.fareBody}>
        {rows.map((row, i) => (
          <View key={row.label}>
            {i > 0 ? <RowSeparator /> : null}
            <View style={styles.fareRow}>
              <T variant="body" muted>
                {row.label}
              </T>
              <Figure variant="body">{money(row.value)}</Figure>
            </View>
          </View>
        ))}
        <RowSeparator />
        <View style={styles.fareRow}>
          <T variant="heading">Total</T>
          <Figure variant="heading">{money(fare.total + tip)}</Figure>
        </View>
      </View>
    </ListCard>
  );
}

/* ------------------------------------------------------------------ */
/*  TripRow — one past trip, used on Activity. Leads with a Glacia     */
/*  Avatar: the destination's monogram is the mark — no emoji.         */
/* ------------------------------------------------------------------ */

export function TripRow({ trip, onPress }: { trip: Trip; onPress?: () => void }) {
  const { darkMode } = useRide();
  const body = (
    <>
      <Avatar name={trip.driver.name} source={trip.driver.image} size="md" isDark={darkMode} />
      <View style={styles.settingText}>
        <T variant="body" numberOfLines={1}>
          {trip.destinationLabel}
        </T>
        <T variant="caption" muted style={styles.settingDescription}>
          {trip.dateLabel} · {trip.rideClassName} · {trip.driver.name}
        </T>
      </View>
      <View style={styles.tripRight}>
        <Figure variant="body">{money(trip.fare.total + trip.tip)}</Figure>
        <Badge
          tone={trip.status === "unpaid" ? "destructive" : "muted"}
          isDark={darkMode}
        >
          {trip.status === "completed" ? "Completed" : trip.status === "unpaid" ? "Unpaid" : "Cancelled"}
        </Badge>
      </View>
    </>
  );
  if (!onPress) return <View style={styles.txRow}>{body}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Trip to ${trip.destinationLabel}, ${money(trip.fare.total + trip.tip)}`}
      style={({ pressed }) => [
        styles.txRow,
        pressed && {
          backgroundColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
        },
      ]}
    >
      {body}
    </Pressable>
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
    marginTop: 4,
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
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: 12,
  },
  tripRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  map: {
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  streetH: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 10,
  },
  streetV: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 10,
  },
  mapBlock: {
    position: "absolute",
    borderRadius: 8,
  },
  routeSeg: {
    position: "absolute",
    height: 4,
    borderRadius: 2,
  },
  routeSegV: {
    position: "absolute",
    width: 4,
    borderRadius: 2,
  },
  pin: {
    position: "absolute",
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  pinPickup: {
    left: 31,
    top: 49,
  },
  pinDotPickup: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  pinDest: {
    left: 195,
    top: 145,
  },
  pinDotDest: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#141415",
  },
  mapChip: {
    position: "absolute",
    left: 12,
    bottom: 12,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  mapChipText: {
    color: "#fff",
  },
  stars: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  fareBody: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  fareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
});
