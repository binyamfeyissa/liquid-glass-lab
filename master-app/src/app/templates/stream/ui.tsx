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
import { useRouter } from "expo-router";
import {
  Card,
  Progress,
  SegmentedControl,
  Separator,
  Text,
  type TextProps,
} from "glacia-native";

import {
  formatRuntime,
  initialsOfTitle,
  playableDuration,
  type Title,
} from "./data";
import { useStream, type BackdropMode } from "./state";

const MONO = Platform.OS === "ios" ? "Menlo" : "monospace";

/** The one accent — cinema red, toned per background. */
export function accentColor(backdrop: BackdropMode): string {
  return backdrop === "light" ? "#b3261e" : "#e0655a";
}

/* ------------------------------------------------------------------ */
/*  T — Glacia Text threaded with the template's manual theme.         */
/* ------------------------------------------------------------------ */

export function T({ style, ...rest }: TextProps) {
  const { darkMode } = useStream();
  return <Text isDark={darkMode} style={style} {...rest} />;
}

/* ------------------------------------------------------------------ */
/*  Figure — every figure in the mono face: durations, timecodes,      */
/*  positions, file sizes. Tabular, so columns line up. The style is   */
/*  flattened to a single object — Glacia Text drops array styles.     */
/* ------------------------------------------------------------------ */

export function Figure({ style, ...rest }: TextProps) {
  const { darkMode } = useStream();
  return (
    <Text
      isDark={darkMode}
      style={StyleSheet.flatten([
        { fontFamily: MONO, fontVariant: ["tabular-nums"] as const },
        style,
      ])}
      {...rest}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Backdrop — the three backgrounds, and nothing else.                */
/*  Dark: graphite #141415. Light: broken white #f7f4ee.               */
/*  Photo: the palm photo, full-bleed, under a neutral scrim.         */
/* ------------------------------------------------------------------ */

export function Backdrop() {
  const { backdrop } = useStream();
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
  const { backdrop, setBackdrop, darkMode } = useStream();
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
  const { darkMode } = useStream();
  return (
    <Card isDark={darkMode} padding={8} style={style}>
      {children}
    </Card>
  );
}

export function RowSeparator() {
  const { darkMode } = useStream();
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

/* ------------------------------------------------------------------ */
/*  Artwork — composed poster art: one flat tonal plate per title.     */
/*  The fixture colour pair is averaged and mixed toward the mode      */
/*  neutral, so the stills carry the identity and the chrome stays     */
/*  quiet. No blobs, no image assets.                                  */
/* ------------------------------------------------------------------ */

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mixHex(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const m = ca.map((v, i) => Math.round(v + (cb[i] - v) * t));
  return `#${m.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export function Artwork({
  name,
  colors,
  width,
  height,
  radius = 16,
}: {
  name: string;
  colors: [string, string];
  width: number;
  height: number;
  radius?: number;
}) {
  const { darkMode } = useStream();
  const big = Math.min(width, height) >= 110;
  const pair = mixHex(colors[0], colors[1], 0.5);
  const plate = mixHex(pair, darkMode ? "#141415" : "#efe9df", darkMode ? 0.3 : 0.5);
  return (
    <View
      style={[
        styles.artwork,
        { width, height, borderRadius: radius, backgroundColor: plate },
      ]}
    >
      <T
        variant={big ? "title" : "label"}
        style={{ color: darkMode ? "#f5f1e8" : "#2e2921" }}
      >
        {initialsOfTitle(name)}
      </T>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  TitleCard — a poster card for the horizontal rails on Home.        */
/* ------------------------------------------------------------------ */

export function TitleCard({ title, width = 118 }: { title: Title; width?: number }) {
  const router = useRouter();
  const stream = useStream();
  const resume = stream.resumeForTitle(title);
  const started = stream.progressOf(resume.playableId) > 0 && !stream.isFinished(resume.playableId);
  return (
    <Pressable
      onPress={() => router.push(`/templates/stream/title/${title.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`Open ${title.name}`}
      style={({ pressed }) => [{ width }, pressed && { opacity: 0.75 }]}
    >
      <Artwork name={title.name} colors={title.colors} width={width} height={Math.round(width * 1.4)} radius={16} />
      <T variant="body" numberOfLines={1} style={styles.cardName}>
        {title.name}
      </T>
      <Figure variant="caption" muted numberOfLines={1}>
        {title.year} · {title.kind === "movie" ? formatRuntime(title.duration ?? 0) : `${title.seasons?.length ?? 1} Season${(title.seasons?.length ?? 1) > 1 ? "s" : ""}`}
      </Figure>
      {started ? (
        <T variant="caption" style={{ color: accentColor(stream.backdrop) }}>
          In progress
        </T>
      ) : null}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  TitleRow — a full-width row for Browse and My List.                */
/* ------------------------------------------------------------------ */

export function TitleRow({
  title,
  playableId,
  trailing,
  onPress,
}: {
  title: Title;
  /** When set, a progress bar for this playable is shown. */
  playableId?: string;
  trailing?: ReactNode;
  onPress?: () => void;
}) {
  const router = useRouter();
  const stream = useStream();
  const { darkMode } = stream;
  const progress = playableId ? stream.progressOf(playableId) : 0;
  const duration = playableId ? playableDuration(playableId) : 0;
  const pct = duration > 0 ? Math.min(100, Math.round((progress / duration) * 100)) : 0;

  return (
    <Pressable
      onPress={onPress ?? (() => router.push(`/templates/stream/title/${title.id}`))}
      accessibilityRole="button"
      accessibilityLabel={`Open ${title.name}`}
      style={({ pressed }) => [
        styles.titleRow,
        pressed && {
          backgroundColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
        },
      ]}
    >
      <Artwork name={title.name} colors={title.colors} width={52} height={72} radius={12} />
      <View style={styles.flex}>
        <T variant="body" numberOfLines={1}>
          {title.name}
        </T>
        <T variant="caption" muted style={styles.settingDescription} numberOfLines={1}>
          {title.year} · {title.rating} · {title.genres.join(" · ")}
        </T>
        <Figure variant="caption" muted style={styles.settingDescription} numberOfLines={1}>
          {title.kind === "movie"
            ? formatRuntime(title.duration ?? 0)
            : `${title.seasons?.length ?? 1} Season${(title.seasons?.length ?? 1) > 1 ? "s" : ""}`}
          {stream.isInMyList(title.id) ? " · In your list" : ""}
        </Figure>
        {playableId && progress > 0 ? (
          <View style={styles.rowProgress}>
            <Progress
              value={pct}
              tint={accentColor(stream.backdrop)}
              accessibilityLabel={`Progress in ${title.name}`}
              isDark={darkMode}
            />
          </View>
        ) : null}
      </View>
      {trailing ?? (
        <T variant="caption" muted>
          {title.kind === "movie" ? "Film" : "Series"}
        </T>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
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
    marginLeft: 4,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 16,
  },
  settingDescription: {
    marginTop: 4,
  },
  settingControl: {
    flexShrink: 0,
  },
  artwork: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
  cardName: {
    marginTop: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
    borderRadius: 12,
  },
  rowProgress: {
    marginTop: 8,
    maxWidth: 190,
  },
});
