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
import { router } from "expo-router";
import {
  colors,
  Badge,
  Card,
  SegmentedControl,
  Separator,
  Text,
  type TextProps,
} from "glacia-native";
import { ChevronRight } from "lucide-react-native";

import { useSignal, type BackdropMode } from "./state";
import type { Article } from "./data";

/* ------------------------------------------------------------------ */
/*  Faces and the one accent. Serif carries the headlines (Georgia     */
/*  on iOS, the platform serif on Android); mono carries every         */
/*  dateline figure. The red is a newspaper red — used rarely.         */
/* ------------------------------------------------------------------ */

export const MONO = Platform.OS === "ios" ? "Menlo" : "monospace";
export const SERIF =
  Platform.select({ ios: "Georgia", android: "serif", default: "Georgia" }) ??
  "Georgia";

/** Newspaper red: lighter on dark surfaces, deeper on broken white. */
export const accentFor = (darkMode: boolean) =>
  darkMode ? "#e0655a" : "#b3261e";

/** Mix a hex colour toward a target by ratio (0 = colour, 1 = target). */
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

/** A story's cover plate: its hue mixed toward the mode neutral. */
export function plateColor(tint: string, darkMode: boolean): string {
  return darkMode
    ? mixHex(tint, "#232325", 0.55)
    : mixHex(tint, "#8a8578", 0.55);
}

/* ------------------------------------------------------------------ */
/*  T — Glacia Text threaded with the template's manual theme.         */
/* ------------------------------------------------------------------ */

export function T({ style, ...rest }: TextProps) {
  const { darkMode } = useSignal();
  return <Text isDark={darkMode} style={style} {...rest} />;
}

/* ------------------------------------------------------------------ */
/*  Figure — every dateline figure in the mono face: dates, times,     */
/*  reading minutes, market values. Tabular, so columns line up.       */
/* ------------------------------------------------------------------ */

export function Figure({ style, ...rest }: TextProps) {
  const { darkMode } = useSignal();
  return <Text isDark={darkMode} style={[styles.figure, style]} {...rest} />;
}

/* ------------------------------------------------------------------ */
/*  Headline — Glacia Text in the serif face: mastheads, headlines,    */
/*  section fronts. Hierarchy comes from size, not weight.             */
/* ------------------------------------------------------------------ */

export function Headline({ style, ...rest }: TextProps) {
  const { darkMode } = useSignal();
  return <Text isDark={darkMode} style={[styles.serif, style]} {...rest} />;
}

/* ------------------------------------------------------------------ */
/*  Backdrop — the three backgrounds, and nothing else.                */
/*  Dark: graphite #141415. Light: broken white #f7f4ee.               */
/*  Photo: the palm photo, full-bleed, under a neutral scrim.         */
/* ------------------------------------------------------------------ */

export function Backdrop() {
  const { backdrop } = useSignal();
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
  const { backdrop, setBackdrop, darkMode } = useSignal();
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
      <Headline variant="title">{title}</Headline>
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
  const { darkMode } = useSignal();
  return (
    <Card isDark={darkMode} padding={8} style={style}>
      {children}
    </Card>
  );
}

export function RowSeparator() {
  const { darkMode } = useSignal();
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
  const { darkMode } = useSignal();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.navRow,
        pressed && {
          backgroundColor: darkMode
            ? "rgba(255,255,255,0.08)"
            : "rgba(0,0,0,0.05)",
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
      <ChevronRight size={18} color={darkMode ? colors.dark.muted : colors.light.muted} />
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  CoverArt — a flat plate in the story's hue, mixed toward the       */
/*  mode neutral, with a serif monogram. Stands in for photography;    */
/*  no image assets.                                                   */
/* ------------------------------------------------------------------ */

export function CoverArt({
  article,
  height = 120,
  large = false,
  image,
}: {
  article: Article;
  height?: number;
  large?: boolean;
  /** Bundled cover photo; when provided it replaces the flat plate.
      Falls back to article.image. */
  image?: number;
}) {
  const { darkMode } = useSignal();
  const photo = image ?? article.image;
  if (photo) {
    return (
      <View
        style={[styles.cover, { height }]}
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        <Image source={photo} resizeMode="cover" style={StyleSheet.absoluteFill} />
      </View>
    );
  }
  return (
    <View
      style={[
        styles.cover,
        { height, backgroundColor: plateColor(article.tint, darkMode) },
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      <Text
        style={[
          styles.coverMonogram,
          {
            fontSize: large ? 92 : 44,
            lineHeight: large ? 104 : 52,
            color: darkMode ? "#ededed" : "#fdfbf7",
          },
        ]}
      >
        {article.monogram}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  StoryRow — one story in a ruled column. Read stories dim; a        */
/*  quiet "Saved" marks bookmarked stories. Tapping opens the story.   */
/* ------------------------------------------------------------------ */

export function StoryRow({
  article,
  reason,
}: {
  article: Article;
  /** e.g. "Because you follow Tech" — shown on the For You feed. */
  reason?: string;
}) {
  const { darkMode, isRead, isBookmarked } = useSignal();
  const read = isRead(article.id);
  return (
    <Pressable
      onPress={() => router.push(`/templates/news/article/${article.id}`)}
      accessibilityRole="button"
      accessibilityLabel={article.headline}
      style={({ pressed }) => [
        styles.storyRow,
        pressed && {
          backgroundColor: darkMode
            ? "rgba(255,255,255,0.08)"
            : "rgba(0,0,0,0.05)",
        },
      ]}
    >
      <View
        style={[
          styles.storyThumb,
          { backgroundColor: plateColor(article.tint, darkMode) },
        ]}
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        {article.image ? (
          <Image
            source={article.image}
            resizeMode="cover"
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <Text
            style={[
              styles.storyThumbText,
              { color: darkMode ? "#ededed" : "#fdfbf7" },
            ]}
          >
            {article.monogram}
          </Text>
        )}
      </View>
      <View style={[styles.settingText, read && styles.readDim]}>
        <View style={styles.storyMetaRow}>
          <Figure variant="caption" muted>
            {article.topic} · {article.timeLabel}
          </Figure>
          {isBookmarked(article.id) ? (
            <T variant="caption" muted>
              Saved
            </T>
          ) : null}
          {read ? (
            <Badge tone="muted" isDark={darkMode}>
              Read
            </Badge>
          ) : null}
        </View>
        <Headline variant="body" style={styles.storyHeadline} numberOfLines={3}>
          {article.headline}
        </Headline>
        <Figure variant="caption" muted style={styles.settingDescription}>
          {article.source} · {article.readMinutes} min read
        </Figure>
        {reason ? (
          <T variant="caption" muted style={styles.storyReason}>
            {reason}
          </T>
        ) : null}
      </View>
      <ChevronRight size={18} color={darkMode ? colors.dark.muted : colors.light.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  figure: {
    fontFamily: MONO,
    fontVariant: ["tabular-nums"],
  },
  serif: {
    fontFamily: SERIF,
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
  cover: {
    borderRadius: 20,
    overflow: "hidden",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  coverMonogram: {
    fontFamily: SERIF,
    fontWeight: "600",
  },
  storyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
    borderRadius: 12,
  },
  storyThumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  storyThumbText: {
    fontFamily: SERIF,
    fontSize: 24,
    fontWeight: "600",
  },
  storyMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  storyHeadline: {
    fontWeight: "600",
  },
  storyReason: {
    marginTop: 4,
  },
  readDim: {
    opacity: 0.55,
  },
});
