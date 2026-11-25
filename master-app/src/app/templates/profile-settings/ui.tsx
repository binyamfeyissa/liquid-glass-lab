import React, { type ReactNode } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import {
  Card,
  SegmentedControl,
  Separator,
  Text,
  type TextProps,
  type TextVariant,
} from "glacia-native";

import { useAppState, type BackdropMode } from "./state";

/* ------------------------------------------------------------------ */
/*  Faces — mono for figures, serif for names.                         */
/* ------------------------------------------------------------------ */

export const MONO = Platform.OS === "ios" ? "Menlo" : "monospace";
export const SERIF = Platform.OS === "ios" ? "Georgia" : "serif";

/** Ink blue. Darker on light surfaces for contrast. */
export function accentColor(mode: BackdropMode): string {
  return mode === "light" ? "#1e4f7a" : "#7aa5c9";
}

/** Muted text colour for drawn marks (chevron, status dot when idle). */
export function mutedColor(isDark: boolean): string {
  return isDark ? "#a1a1a6" : "#7b7266";
}

/* ------------------------------------------------------------------ */
/*  T — Glacia Text that follows the template's text-size setting.     */
/*  Glacia's Text lets `style` override its type scale, so scaling is  */
/*  just proportional fontSize/lineHeight overrides.                   */
/*  NOTE: Glacia's Text silently drops array styles, so the scale and  */
/*  the caller style are flattened into one object before handing      */
/*  them over — the old `[scaled, style]` array never applied.         */
/* ------------------------------------------------------------------ */

const TYPE_SCALE: Record<TextVariant, { fontSize: number; lineHeight: number }> = {
  title: { fontSize: 28, lineHeight: 34 },
  heading: { fontSize: 20, lineHeight: 26 },
  body: { fontSize: 16, lineHeight: 22 },
  label: { fontSize: 13, lineHeight: 18 },
  caption: { fontSize: 12, lineHeight: 16 },
};

export function T({ variant = "body", style, ...rest }: TextProps) {
  const { textScale, glaciaDark } = useAppState();
  const base = TYPE_SCALE[variant];
  const scaled: TextStyle | undefined =
    textScale === 1
      ? undefined
      : {
          fontSize: Math.round(base.fontSize * textScale),
          lineHeight: Math.round(base.lineHeight * textScale),
        };
  return (
    <Text
      variant={variant}
      isDark={glaciaDark}
      style={StyleSheet.flatten([scaled, style])}
      {...rest}
    />
  );
}

function merged(style: TextProps["style"]): Record<string, unknown> {
  return Array.isArray(style)
    ? Object.assign({}, ...style)
    : ((style as Record<string, unknown>) ?? {});
}

/* ------------------------------------------------------------------ */
/*  Figure — every figure in the mono face: storage, counts, version,  */
/*  intensity. Tabular, so columns line up.                            */
/*  Serif — the profile name and the app name, set like a file card.   */
/*  Both hand Glacia's Text a single merged object — array styles      */
/*  would be dropped.                                                  */
/* ------------------------------------------------------------------ */

export function Figure({ style, ...rest }: TextProps) {
  const { glaciaDark } = useAppState();
  return (
    <Text
      isDark={glaciaDark}
      style={{ fontFamily: MONO, fontVariant: ["tabular-nums"], ...merged(style) }}
      {...rest}
    />
  );
}

export function Serif({ style, ...rest }: TextProps) {
  const { glaciaDark } = useAppState();
  return (
    <Text isDark={glaciaDark} style={{ fontFamily: SERIF, ...merged(style) }} {...rest} />
  );
}

/* ------------------------------------------------------------------ */
/*  Backdrop — the three backgrounds, and nothing else.                */
/*  Dark: graphite #141415. Light: broken white #f7f4ee.               */
/*  Photo: the palm photo, full-bleed, under a neutral scrim.         */
/* ------------------------------------------------------------------ */

export function Backdrop() {
  const { backdrop } = useAppState();
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

/** The three-background switcher, used on Appearance. */
export function BackdropControl() {
  const { backdrop, setBackdrop, isDark } = useAppState();
  const modes: BackdropMode[] = ["dark", "light", "image"];
  return (
    <SegmentedControl
      segments={["Dark", "Light", "Photo"]}
      selectedIndex={modes.indexOf(backdrop)}
      onChange={(i) => setBackdrop(modes[i])}
      isDark={isDark}
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
/*  SectionTitle + ListCard + rows — the settings-list vocabulary.     */
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
  const { glaciaDark } = useAppState();
  return (
    <Card isDark={glaciaDark} padding={8} style={style}>
      {children}
    </Card>
  );
}

export function RowSeparator() {
  const { glaciaDark } = useAppState();
  return <Separator isDark={glaciaDark} inset={16} />;
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

/** A small dot for "this is the live one" — quiet, never a badge. */
export function StatusDot({ color }: { color: string }) {
  return <View style={[styles.statusDot, { backgroundColor: color }]} />;
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
  const { isDark } = useAppState();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.navRow,
        pressed && { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)" },
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
      <View
        style={[styles.chevron, { borderColor: mutedColor(isDark) }]}
        accessibilityElementsHidden
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  screenContent: {
    paddingHorizontal: 24,
    paddingTop: 64,
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
    marginLeft: 8,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
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
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
  chevron: {
    width: 10,
    height: 10,
    borderTopWidth: 1.5,
    borderRightWidth: 1.5,
    transform: [{ rotate: "45deg" }],
    marginRight: 4,
    flexShrink: 0,
  },
});
