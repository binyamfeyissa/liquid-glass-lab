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
  Button,
  Card,
  SegmentedControl,
  Separator,
  Text,
  type TextProps,
} from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import ArrowLeft01Icon from "@hugeicons/core-free-icons/ArrowLeft01Icon";
import ChevronRightIcon from "@hugeicons/core-free-icons/ChevronRightIcon";
import { useStillwater, type BackdropMode } from "./state";
import { formatDuration, type Category, type Session } from "./data";

/* ------------------------------------------------------------------ */
/*  The one accent: desaturated sage.                                  */
/* ------------------------------------------------------------------ */

export const SAGE = {
  /** Accent on light surfaces (fills, tints, figures). */
  light: "#54685a",
  /** Accent on dark surfaces. */
  dark: "#9db29a",
  /** The breathing circle's fill, both modes. */
  deep: "#506354",
};

export function accentColor(mode: BackdropMode): string {
  return mode === "light" ? SAGE.light : SAGE.dark;
}

/** Filled primary buttons use the deep sage in BOTH modes: white onTint
 *  text reads on it in light and dark, where the pale dark-mode accent
 *  (#9db29a) would not. Same fill as the breathing circle. */
export const FILLED_TINT = SAGE.deep;

/** Neutral tint for glass buttons: the theme's glass token, so the
 *  fallback floor renders a neutral pill instead of system blue, and
 *  the engine gets a neutral wash over the glass (bank's pattern). */
export function neutralTint(darkMode: boolean): string {
  return colors[darkMode ? "dark" : "light"].glass;
}

/** Horizontal padding every content-sized button needs: the fallback
 *  floor gives the button's content view no padding of its own, so a
 *  width-less button renders edge-to-edge (a blue circle for "Back",
 *  a blue dot for "Use"). Pass this as contentStyle on every button
 *  whose width comes from its label. */
export const BUTTON_PAD = { paddingHorizontal: 16 };

const MONO = Platform.OS === "ios" ? "Menlo" : "monospace";

/* ------------------------------------------------------------------ */
/*  T — Glacia Text threaded with the template's manual theme.         */
/* ------------------------------------------------------------------ */

export function T({ style, ...rest }: TextProps) {
  const { darkMode } = useStillwater();
  return <Text isDark={darkMode} style={style} {...rest} />;
}

/* ------------------------------------------------------------------ */
/*  Figure — every figure in the mono face: minutes, clocks, counts.   */
/* ------------------------------------------------------------------ */

export function Figure({ style, ...rest }: TextProps) {
  const { darkMode } = useStillwater();
  return <Text isDark={darkMode} style={[styles.figure, style]} {...rest} />;
}

/* ------------------------------------------------------------------ */
/*  Backdrop — the three backgrounds, and nothing else.                */
/*  Dark: graphite #141415. Light: broken white #f7f4ee.               */
/*  Photo: the palm image, full-bleed, under a neutral scrim.         */
/* ------------------------------------------------------------------ */

export function Backdrop() {
  const { backdrop } = useStillwater();
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
  const { backdrop, setBackdrop, darkMode } = useStillwater();
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
  const { darkMode } = useStillwater();
  return (
    <Card isDark={darkMode} padding={8} style={style}>
      {children}
    </Card>
  );
}

export function RowSeparator() {
  const { darkMode } = useStillwater();
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

/** A tappable list row with an optional leading icon and a chevron, for
 *  menus and link lists. */
export function NavRow({
  title,
  description,
  detail,
  icon,
  onPress,
}: {
  title: string;
  description?: string;
  detail?: string;
  icon?: ReactNode;
  onPress: () => void;
}) {
  const { darkMode } = useStillwater();
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
      {icon ? <View style={styles.navIcon}>{icon}</View> : null}
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
      <HugeiconsIcon icon={ChevronRightIcon} size={20} color={colors[darkMode ? "dark" : "light"].muted} />
    </Pressable>
  );
}

/** The shared glass back button for stack screens (Player, Breathing):
 *  a left-arrow icon plus the word "Back" — the icon alone would be a
 *  bare glyph on the fallback floor, the word alone is plain. */
export function BackButton({ onPress }: { onPress: () => void }) {
  const { darkMode } = useStillwater();
  return (
    <Button
      isDark={darkMode}
      accessibilityLabel="Back"
      variant="glass"
      tint={neutralTint(darkMode)}
      contentStyle={BUTTON_PAD}
      onPress={onPress}
      icon={<HugeiconsIcon icon={ArrowLeft01Icon} size={18} color={colors[darkMode ? "dark" : "light"].foreground} />}
    >
      Back
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/*  Artwork — a flat printed plate for a session: the session's deep   */
/*  hue mixed toward the room's neutral. No gradient, no shapes.       */
/* ------------------------------------------------------------------ */

function mixHex(hex: string, target: string, ratio: number): string {
  const parse = (h: string) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const a = parse(hex);
  const b = parse(target);
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * ratio));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

export function Artwork({
  session,
  height = 120,
  radius = 16,
}: {
  session: Session;
  height?: number;
  radius?: number;
}) {
  const { backdrop } = useStillwater();
  const plate =
    backdrop === "light"
      ? mixHex(session.art[0], "#8a8578", 0.5)
      : mixHex(session.art[0], "#232325", 0.45);
  return (
    <View
      style={[
        styles.artwork,
        { height, borderRadius: radius, backgroundColor: plate, overflow: "hidden" },
      ]}
    >
      {session.image ? (
        <Image
          source={session.image}
          resizeMode="cover"
          style={{ width: "100%", height: "100%" }}
        />
      ) : null}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  SessionRow — one catalogue entry, used on Home and Library.        */
/*  The thumb is the session's own cover photo, Apple-Music style:     */
/*  the row reads as content, not as a monogram for its category.      */
/* ------------------------------------------------------------------ */

export function SessionRow({
  session,
  onPress,
}: {
  session: Session;
  onPress: () => void;
}) {
  const { darkMode } = useStillwater();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${session.title}, ${formatDuration(session.durationSec)}, by ${session.narrator}`}
      style={({ pressed }) => [
        styles.sessionRow,
        pressed && {
          backgroundColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
        },
      ]}
    >
      {session.image ? (
        <Image source={session.image} resizeMode="cover" style={styles.sessionThumb} />
      ) : null}
      <View style={styles.settingText}>
        <T variant="body" numberOfLines={1}>
          {session.title}
        </T>
        <T variant="caption" muted style={styles.settingDescription}>
          {session.narrator} · {session.plays} plays
        </T>
      </View>
      <Figure variant="caption" muted>
        {formatDuration(session.durationSec)}
      </Figure>
    </Pressable>
  );
}

/** One photo card per category for Home's browse strip: the first
 *  session's cover, the category name over a scrim, and the count.
 *  Uses only existing catalogue data — no invented content. */
export function CategoryCard({
  category,
  cover,
  count,
  onPress,
}: {
  category: Category;
  cover: number;
  count: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${category}, ${count} sessions`}
      style={styles.categoryCard}
    >
      <Image source={cover} resizeMode="cover" style={styles.categoryImage} />
      <View style={styles.categoryScrim} />
      <View style={styles.categoryLabel}>
        <T variant="body" style={styles.categoryName}>
          {category}
        </T>
        <T variant="caption" style={styles.categoryCount}>
          {count} session{count === 1 ? "" : "s"}
        </T>
      </View>
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
  navIcon: {
    width: 28,
    alignItems: "center",
    flexShrink: 0,
  },
  navDetail: {
    flexShrink: 0,
  },
  artwork: {
    width: "100%",
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: 12,
  },
  sessionThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  categoryCard: {
    width: 148,
    height: 104,
    borderRadius: 16,
    overflow: "hidden",
    flexShrink: 0,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
  },
  categoryScrim: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.38)",
  },
  categoryLabel: {
    position: "absolute",
    left: 12,
    bottom: 10,
    gap: 2,
  },
  categoryName: {
    color: "#ffffff",
  },
  categoryCount: {
    color: "rgba(255,255,255,0.8)",
  },
});
