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
  Progress,
  SegmentedControl,
  Separator,
  Text,
  type TextProps,
} from "glacia-native";
import { ChevronRight } from "lucide-react-native";

import { useLearn, type BackdropMode } from "./state";
import { courseLessons, courseMinutes, type Course } from "./data";

/* ------------------------------------------------------------------ */
/*  Theme tokens — one warm ramp, one burgundy accent.                 */
/*  Serif carries course titles like book titles; mono carries every   */
/*  figure.                                                            */
/* ------------------------------------------------------------------ */

export const MONO = Platform.OS === "ios" ? "Menlo" : "monospace";
export const SERIF = Platform.OS === "ios" ? "Georgia" : "serif";

/** Burgundy. Darker on light surfaces for contrast. */
export function accentColor(mode: BackdropMode): string {
  return mode === "light" ? "#7c2233" : "#cf7285";
}

/** The page neutral a cover hue is mixed toward, per mode. */
function pageNeutral(mode: BackdropMode): string {
  return mode === "light" ? "#f7f4ee" : "#141415";
}

/** Mix a hex colour toward another hex colour by `amount` (0–1). */
export function mixHex(hex: string, target: string, amount: number): string {
  const parse = (h: string): [number, number, number] => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const [r1, g1, b1] = parse(hex);
  const [r2, g2, b2] = parse(target);
  const mix = (a: number, b: number) => Math.round(a + (b - a) * amount);
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(mix(r1, r2))}${toHex(mix(g1, g2))}${toHex(mix(b1, b2))}`;
}

/** A course's flat cover plate: its hue mixed toward the mode neutral. */
export function plateColor(course: Course, mode: BackdropMode): string {
  return mixHex(course.cover, pageNeutral(mode), 0.55);
}

/** Two-letter monogram from a course title, e.g. "Liquid Glass" → "LG". */
export function initialsOfTitle(title: string): string {
  return title
    .replace(/^The\s+/i, "")
    .split(/\s+/)
    .filter((w) => /[A-Za-z0-9]/.test(w.charAt(0)))
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

/* ------------------------------------------------------------------ */
/*  T — Glacia Text threaded with the template's manual theme.         */
/*  Figure — the same text set in mono with tabular figures: every     */
/*  minute, percent, rating, score and clock time goes through it.     */
/*  Serif — the same text set in the reading-room serif.               */
/* ------------------------------------------------------------------ */

export function T({ style, ...rest }: TextProps) {
  const { darkMode } = useLearn();
  return <Text isDark={darkMode} style={style} {...rest} />;
}

export function Figure({ style, ...rest }: TextProps) {
  return (
    <T
      style={[{ fontFamily: MONO, fontVariant: ["tabular-nums"] }, style]}
      {...rest}
    />
  );
}

export function Serif({ style, ...rest }: TextProps) {
  return <T style={[{ fontFamily: SERIF }, style]} {...rest} />;
}

/* ------------------------------------------------------------------ */
/*  Formatting helpers.                                                */
/* ------------------------------------------------------------------ */

export function formatMinutes(total: number): string {
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/* ------------------------------------------------------------------ */
/*  Backdrop — the three backgrounds, and nothing else.                */
/*  Dark: graphite #141415. Light: broken white #f7f4ee.               */
/*  Photo: the palm photo, full-bleed, under a neutral scrim.         */
/* ------------------------------------------------------------------ */

export function Backdrop() {
  const { backdrop } = useLearn();
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
  const { backdrop, setBackdrop, darkMode } = useLearn();
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
  const { darkMode } = useLearn();
  return (
    <Card isDark={darkMode} padding={8} style={style}>
      {children}
    </Card>
  );
}

export function RowSeparator() {
  const { darkMode } = useLearn();
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
          <T variant="caption" muted style={styles.description}>
            {description}
          </T>
        ) : null}
      </View>
      <View style={styles.control}>{children}</View>
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
  const { darkMode } = useLearn();
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
          <T variant="caption" muted style={styles.description}>
            {description}
          </T>
        ) : null}
      </View>
      {detail ? (
        <Figure variant="caption" muted>
          {detail}
        </Figure>
      ) : null}
      <ChevronRight size={18} color={darkMode ? colors.dark.muted : colors.light.muted} />
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  CourseCover — one flat plate: the course hue mixed toward the      */
/*  mode neutral, a serif monogram, the category in sentence case.     */
/* ------------------------------------------------------------------ */

export function CourseCover({
  course,
  height = 120,
  image,
}: {
  course: Course;
  height?: number;
  /** Bundled cover photo; when provided it replaces the flat plate.
      Falls back to course.image. */
  image?: number;
}) {
  const { backdrop } = useLearn();
  const photo = image ?? course.image;
  if (photo) {
    return (
      <View style={[styles.cover, { height }]}>
        <Image source={photo} resizeMode="cover" style={StyleSheet.absoluteFill} />
      </View>
    );
  }
  const onPlate = backdrop === "light" ? "#1f1b16" : "#f7f4ee";
  return (
    <View
      style={[styles.cover, { height, backgroundColor: plateColor(course, backdrop) }]}
    >
      <Serif variant="title" style={[styles.coverMonogram, { color: onPlate }]}>
        {initialsOfTitle(course.title)}
      </Serif>
      <T variant="caption" style={[styles.coverCategory, { color: onPlate }]}>
        {course.category}
      </T>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  CourseCard — catalogue card used on Home and Discover. Shows the   */
/*  live progress bar when the learner is enrolled: a thin burgundy   */
/*  rule with its percent in mono.                                     */
/* ------------------------------------------------------------------ */

export function CourseCard({
  course,
  onPress,
  width,
}: {
  course: Course;
  onPress: () => void;
  width?: number;
}) {
  const learn = useLearn();
  const lessons = courseLessons(course).length;
  const enrolled = learn.isEnrolled(course.id);
  const progress = learn.progressFor(course);

  return (
    <Card
      isDark={learn.darkMode}
      padding={0}
      style={width ? { width } : undefined}
      onPress={onPress}
      accessibilityLabel={`${course.title}, view course`}
    >
      <CourseCover course={course} height={104} image={course.image} />
      <View style={styles.courseBody}>
        <View style={styles.courseMetaRow}>
          <Badge tone="muted" isDark={learn.darkMode}>
            {course.level}
          </Badge>
          <T variant="caption" muted>
            <Figure variant="caption" muted>
              {course.rating.toFixed(1)}
            </Figure>{" "}
            · {course.reviews} reviews
          </T>
        </View>
        <Serif variant="heading" numberOfLines={2} style={styles.courseTitle}>
          {course.title}
        </Serif>
        <T variant="caption" muted numberOfLines={1}>
          {course.instructor.name} ·{" "}
          <Figure variant="caption" muted>
            {lessons}
          </Figure>{" "}
          lessons ·{" "}
          <Figure variant="caption" muted>
            {formatMinutes(courseMinutes(course))}
          </Figure>
        </T>
        {enrolled ? (
          <View style={styles.courseProgress}>
            <Progress
              value={progress}
              tint={accentColor(learn.backdrop)}
              isDark={learn.darkMode}
              accessibilityLabel={`${course.title} progress, ${progress} percent`}
            />
            <T variant="caption" muted style={styles.progressLabel}>
              {progress === 100 ? (
                "Completed"
              ) : (
                <>
                  <Figure variant="caption" muted>
                    {progress}%
                  </Figure>{" "}
                  ·{" "}
                  <Figure variant="caption" muted>
                    {learn.completedCountFor(course)}
                  </Figure>{" "}
                  of{" "}
                  <Figure variant="caption" muted>
                    {lessons}
                  </Figure>{" "}
                  lessons
                </>
              )}
            </T>
          </View>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  screenContent: {
    paddingHorizontal: 24,
    paddingTop: 112,
    paddingBottom: 32,
  },
  screenTitle: {},
  screenSubtitle: { marginTop: 8 },
  screenBody: { marginTop: 24, gap: 24 },
  sectionTitle: {
    marginBottom: 8,
  },
  flex1: { flex: 1 },
  description: { marginTop: 4 },
  control: { flexShrink: 0 },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 16,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: 12,
  },
  cover: {
    overflow: "hidden",
    justifyContent: "flex-end",
    padding: 16,
  },
  coverMonogram: {
    fontSize: 40,
    lineHeight: 44,
  },
  coverCategory: {
    marginTop: 4,
    opacity: 0.85,
  },
  courseBody: {
    padding: 16,
    gap: 8,
  },
  courseMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  courseTitle: { lineHeight: 24 },
  courseProgress: { marginTop: 4, gap: 8 },
  progressLabel: { marginTop: 0 },
});
