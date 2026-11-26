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
  Avatar,
  Badge,
  Card,
  colors,
  Glass,
  IconButton,
  SegmentedControl,
  Separator,
  Text,
  type TextProps,
} from "glacia-native";
import { ChevronRight, Heart } from "lucide-react-native";
import { router } from "expo-router";

import type { ImageSourcePropType } from "react-native";
import { hostImageByName, useTravel, type BackdropMode, type ChatMsg, type Stay } from "./state";

/* ------------------------------------------------------------------ */
/*  Type faces — the journal and the ledger.                           */
/*  Place names are set in serif, like the cover of a travel journal;  */
/*  dates, money and references are set in the mono figure face,       */
/*  tabular, like entries in a guesthouse ledger.                      */
/* ------------------------------------------------------------------ */

export const SERIF = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "Georgia",
});

export const MONO = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "Menlo",
});

/** The one accent: bronze, the colour of a brass key tag. */
export function accent(darkMode: boolean): string {
  return darkMode ? "#d9a45b" : "#8a5a1e";
}

/* ------------------------------------------------------------------ */
/*  T — Glacia Text threaded with the template's manual theme.         */
/* ------------------------------------------------------------------ */

export function T({ style, ...rest }: TextProps) {
  const { darkMode } = useTravel();
  return <Text isDark={darkMode} style={style} {...rest} />;
}

/* ------------------------------------------------------------------ */
/*  Figure — the same text set in the mono figure face: every date,    */
/*  price, fee and reference, tabular, so figures line up.             */
/* ------------------------------------------------------------------ */

export function Figure({ style, ...rest }: TextProps) {
  return (
    <T style={[{ fontFamily: MONO, fontVariant: ["tabular-nums"] }, style]} {...rest} />
  );
}

/* ------------------------------------------------------------------ */
/*  Backdrop — the three backgrounds, and nothing else.                */
/*  Dark: graphite #141415. Light: broken white #f7f4ee.               */
/*  Photo: the palm photo, full-bleed, under a neutral scrim.         */
/* ------------------------------------------------------------------ */

export function Backdrop() {
  const { backdrop } = useTravel();
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
  const { backdrop, setBackdrop, darkMode } = useTravel();
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
  const { darkMode } = useTravel();
  return (
    <Card isDark={darkMode} padding={8} style={style}>
      {children}
    </Card>
  );
}

export function RowSeparator() {
  const { darkMode } = useTravel();
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
  const { darkMode } = useTravel();
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
      <View style={styles.flex}>
        <T variant="body">{title}</T>
        {description ? (
          <T variant="caption" muted style={styles.settingDescription}>
            {description}
          </T>
        ) : null}
      </View>
      {detail ? (
        <Figure variant="caption" muted>
          {detail}
        </Figure>
      ) : null}
      <ChevronRight
        size={18}
        color={darkMode ? colors.dark.muted : colors.light.muted}
      />
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  Plate — the visual for a place. The place's bundled photo fills    */
/*  the frame, with the place name set in serif ink over a scrim;      */
/*  without a photo, one flat plate in the fixture hue, mixed 80%      */
/*  toward the mode's neutral, carries the name instead.               */
/* ------------------------------------------------------------------ */

function hexRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mixHex(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexRgb(a);
  const [r2, g2, b2] = hexRgb(b);
  const c = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `rgb(${c(r1, r2)}, ${c(g1, g2)}, ${c(b1, b2)})`;
}

/** The flat plate colour for a place in the current mode. */
export function plateColor(colors: [string, string], darkMode: boolean): string {
  const base = mixHex(colors[0], colors[1], 0.5);
  return mixHex(base, darkMode ? "#232325" : "#e9e1cf", 0.8);
}

export function Plate({
  colors,
  label,
  height,
  radius = 16,
  fontSize,
  image,
}: {
  colors: [string, string];
  label: string;
  height: number;
  radius?: number;
  fontSize?: number;
  /** Bundled photo; the flat plate is the fallback. */
  image?: ImageSourcePropType;
}) {
  const { darkMode } = useTravel();
  return (
    <View
      style={{
        height,
        borderRadius: radius,
        overflow: "hidden",
        backgroundColor: plateColor(colors, darkMode),
      }}
    >
      {image ? (
        <Image
          source={image}
          style={[StyleSheet.absoluteFill, { width: "100%", height: "100%" }]}
          resizeMode="cover"
        />
      ) : null}
      {image ? (
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.30)" }]}
        />
      ) : null}
      <View style={styles.plateLabelWrap}>
        <Text
          isDark={darkMode}
          variant="title"
          style={[
            styles.plateLabel,
            image ? { color: "#ffffff" } : null,
            fontSize ? { fontSize, lineHeight: fontSize * 1.15 } : null,
          ]}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

/** The heart toggle used on every stay card and the detail gallery. */
export function HeartButton({ stayId }: { stayId: string }) {
  const { isSaved, toggleSaved, darkMode } = useTravel();
  const saved = isSaved(stayId);
  return (
    <IconButton
      accessibilityLabel={saved ? "Remove from saved" : "Save this stay"}
      onPress={() => toggleSaved(stayId)}
      isDark={darkMode}
      icon={
        <Heart
          size={18}
          color={saved ? accent(darkMode) : darkMode ? "#f5f2ec" : "#3d362a"}
          fill={saved ? accent(darkMode) : "transparent"}
        />
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/*  StayCard — the stay row/card used on Explore, Search and Saved.    */
/* ------------------------------------------------------------------ */

export function StayCard({ stay, wide = false }: { stay: Stay; wide?: boolean }) {
  const { price, destinationById, darkMode } = useTravel();
  const dest = destinationById(stay.destinationId);
  return (
    <Card
      isDark={darkMode}
      padding={12}
      onPress={() => router.push(`/templates/travel/stay/${stay.id}`)}
      accessibilityLabel={stay.title}
      style={wide ? styles.stayCardWide : undefined}
    >
      <View>
        <Plate
          colors={stay.colors}
          label={dest?.city ?? "Wayfare"}
          height={wide ? 150 : 120}
          radius={12}
          fontSize={30}
          image={stay.image}
        />
        <View style={styles.heartOverlay}>
          <HeartButton stayId={stay.id} />
        </View>
      </View>
      <View style={styles.stayMeta}>
        <View style={styles.stayTitleRow}>
          <T variant="body" style={styles.flex} numberOfLines={1}>
            {stay.title}
          </T>
          <Figure variant="caption">{stay.rating.toFixed(2)}</Figure>
        </View>
        <T variant="caption" muted numberOfLines={1}>
          {dest?.city}, {dest?.country} · {stay.type} · up to {stay.guests} guests
        </T>
        <View style={styles.stayPriceRow}>
          <Figure variant="body">{price(stay.pricePerNight)}</Figure>
          <T variant="caption" muted>
            {" "}
            / night
          </T>
        </View>
      </View>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  The Message family.                                                */
/*                                                                     */
/*  The published glacia-native 0.6.0 package does not export Message  */
/*  components, so the thread is composed here from Glacia primitives  */
/*  (Glass, Avatar, Text), keeping the classic structure:              */
/*                                                                     */
/*    Message          — the row: alignment + avatar slot              */
/*    MessageAvatar    — the sender's initials avatar                  */
/*    MessageBubble    — the glass bubble surface                      */
/*    MessageContent   — the message text                              */
/*    MessageTimestamp — the small time label under the bubble         */
/* ------------------------------------------------------------------ */

export function Message({
  message,
  senderName,
}: {
  message: ChatMsg;
  senderName: string;
}) {
  const { darkMode } = useTravel();
  const mine = message.senderId === "me";

  return (
    <View style={[styles.messageRow, mine && styles.messageRowMine]}>
      {/* MessageAvatar */}
      {!mine ? (
        <View style={styles.messageAvatar}>
          <Avatar name={senderName} source={hostImageByName(senderName)} size="sm" isDark={darkMode} />
        </View>
      ) : null}

      <View style={[styles.messageColumn, mine && styles.messageColumnMine]}>
        {/* MessageBubble + MessageContent */}
        <Glass
          isDark={darkMode}
          tintColor={mine ? (darkMode ? "#8a5a1e" : "#a8742c") : undefined}
          style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}
        >
          <Text
            isDark={darkMode}
            variant="body"
            style={mine ? styles.bubbleTextMine : undefined}
          >
            {message.text}
          </Text>
        </Glass>

        {/* MessageTimestamp */}
        <Figure variant="caption" muted style={styles.messageTime}>
          {message.timeLabel}
          {mine ? " · Sent" : ""}
        </Figure>
      </View>
    </View>
  );
}

/** The "•••" bubble shown briefly before a simulated host reply lands. */
export function TypingIndicator({ senderName }: { senderName: string }) {
  const { darkMode } = useTravel();
  return (
    <View style={styles.messageRow}>
      <View style={styles.messageAvatar}>
        <Avatar name={senderName} source={hostImageByName(senderName)} size="sm" isDark={darkMode} />
      </View>
      <View style={styles.messageColumn}>
        <Glass isDark={darkMode} style={[styles.bubble, styles.bubbleTheirs]}>
          <T variant="body" muted>
            •••
          </T>
        </Glass>
        <T variant="caption" muted style={styles.messageTime}>
          Typing
        </T>
      </View>
    </View>
  );
}

export function StatusBadge({ status }: { status: "upcoming" | "past" | "cancelled" }) {
  const { darkMode } = useTravel();
  if (status === "upcoming")
    return (
      <Badge tone="muted" isDark={darkMode}>
        Upcoming
      </Badge>
    );
  if (status === "cancelled")
    return (
      <Badge tone="muted" isDark={darkMode}>
        Cancelled
      </Badge>
    );
  return (
    <Badge tone="muted" isDark={darkMode}>
      Completed
    </Badge>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1 },
  screenContent: {
    paddingHorizontal: 24,
    paddingTop: 112,
    paddingBottom: 32,
  },
  screenTitle: {},
  screenSubtitle: { marginTop: 4 },
  screenBody: { marginTop: 24, gap: 24 },
  sectionTitle: {
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 16,
  },
  settingDescription: { marginTop: 2 },
  settingControl: { flexShrink: 0 },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: 12,
  },
  plateLabelWrap: {
    position: "absolute",
    left: 16,
    bottom: 12,
  },
  plateLabel: {
    fontFamily: SERIF,
    fontWeight: "600",
  },
  heartOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  stayCardWide: { width: 270 },
  stayMeta: { paddingHorizontal: 4, paddingTop: 12, paddingBottom: 4, gap: 4 },
  stayTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  stayPriceRow: { flexDirection: "row", alignItems: "baseline", marginTop: 4 },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  messageRowMine: { justifyContent: "flex-end" },
  messageAvatar: { width: 28 },
  messageColumn: { maxWidth: "78%", alignItems: "flex-start" },
  messageColumnMine: { alignItems: "flex-end" },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
  bubbleMine: { borderBottomRightRadius: 6 },
  bubbleTheirs: { borderBottomLeftRadius: 6 },
  bubbleTextMine: { color: "#ffffff" },
  messageTime: { marginTop: 4, marginHorizontal: 4 },
});
