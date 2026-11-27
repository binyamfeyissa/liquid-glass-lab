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
  IconButton,
  SegmentedControl,
  Separator,
  Text,
  type TextProps,
} from "glacia-native";
import { Heart, Music, Pause } from "lucide-react-native";

import {
  artistOf,
  formatTime,
  initialsOfTitle,
  type Track,
} from "./data";
import { useTunes, type BackdropMode } from "./state";

/* ------------------------------------------------------------------ */
/*  Theme tokens — one warm graphite/paper ramp, one red accent.       */
/* ------------------------------------------------------------------ */

export const MONO = Platform.OS === "ios" ? "Menlo" : "monospace";
export const SERIF = Platform.OS === "ios" ? "Georgia" : "serif";

/** Record-store red. Darker on light surfaces for contrast. */
export function accentColor(mode: BackdropMode): string {
  return mode === "light" ? "#b3261e" : "#e0655a";
}

/** Mixes a fixture hue toward a neutral so plates sit in the ramp. */
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

/** Pressed-state wash for local rows, per mode. */
export function pressedColor(darkMode: boolean): string {
  return darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)";
}

/* ------------------------------------------------------------------ */
/*  T — Glacia Text threaded with the template's manual theme.         */
/* ------------------------------------------------------------------ */

export function T({ style, ...rest }: TextProps) {
  const { darkMode } = useTunes();
  return <Text isDark={darkMode} style={style} {...rest} />;
}

/* ------------------------------------------------------------------ */
/*  Figure — every figure in the mono face: durations, timecodes,      */
/*  queue positions, listening stats. Tabular, so columns line up.     */
/*  Serif — titles and names set like sleeve notes.                    */
/*  Glacia's Text spreads its style prop into one object, so an        */
/*  array style would be dropped — both hand it a single merged        */
/*  object.                                                            */
/* ------------------------------------------------------------------ */

function merged(style: TextProps["style"]): Record<string, unknown> {
  return Array.isArray(style)
    ? Object.assign({}, ...style)
    : ((style as Record<string, unknown>) ?? {});
}

export function Figure({ style, ...rest }: TextProps) {
  const { darkMode } = useTunes();
  return (
    <Text
      isDark={darkMode}
      style={{ fontFamily: MONO, fontVariant: ["tabular-nums"], ...merged(style) }}
      {...rest}
    />
  );
}

export function Serif({ style, ...rest }: TextProps) {
  const { darkMode } = useTunes();
  return (
    <Text
      isDark={darkMode}
      style={{ fontFamily: SERIF, ...merged(style) }}
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
  const { backdrop } = useTunes();
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
  const { backdrop, setBackdrop, darkMode } = useTunes();
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
 *  48pt Android 3-button nav) — and in this template the mini player
 *  (~56pt + 8pt gap) stacks above the bar whenever something is playing,
 *  so 192pt lets the last row scroll fully clear of bar + mini player. */
export const TAB_BAR_CLEARANCE = 192;

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
  const { darkMode } = useTunes();
  return (
    <Card isDark={darkMode} padding={8} style={style}>
      {children}
    </Card>
  );
}

export function RowSeparator() {
  const { darkMode } = useTunes();
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
/*  Artwork — the record's flat plate: its hue mixed toward the        */
/*  mode neutral, the title's initials set in serif. No blobs,         */
/*  no second colour.                                                  */
/* ------------------------------------------------------------------ */

export function Artwork({
  title,
  colors,
  size = 52,
  radius,
  image,
}: {
  title: string;
  colors: [string, string];
  size?: number;
  radius?: number;
  /** Bundled cover art — when provided it replaces the colour plate. */
  image?: number;
}) {
  const { backdrop } = useTunes();
  const r = radius ?? Math.min(20, Math.max(8, Math.round(size * 0.25)));
  const plate =
    backdrop === "light"
      ? mixHex(colors[0], "#8a8578", 0.5)
      : mixHex(colors[0], "#232325", 0.45);
  if (image) {
    return (
      <Image
        source={image}
        resizeMode="cover"
        style={{ width: size, height: size, borderRadius: r }}
      />
    );
  }
  return (
    <View
      style={[
        styles.artwork,
        { width: size, height: size, borderRadius: r, backgroundColor: plate },
      ]}
    >
      <Serif
        variant={size >= 120 ? "title" : "label"}
        style={{ color: backdrop === "light" ? "#f7f4ee" : "#ededed" }}
      >
        {initialsOfTitle(title)}
      </Serif>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  TrackRow — one track in any list. Tapping plays it in context;     */
/*  the heart toggles Liked Songs. The row for the current track       */
/*  shows the playing marker and its title takes the accent. The       */
/*  duration closes the row, set in mono.                              */
/* ------------------------------------------------------------------ */

export function TrackRow({
  track,
  contextIds,
  showPlays = false,
  onPress,
}: {
  track: Track;
  /** The list this row belongs to — becomes the playback queue. */
  contextIds?: string[];
  showPlays?: boolean;
  onPress?: () => void;
}) {
  const tunes = useTunes();
  const { darkMode, backdrop } = tunes;
  const accent = accentColor(backdrop);
  const isCurrent = tunes.currentTrackId === track.id;
  const liked = tunes.isLiked(track.id);
  const artist = artistOf(track);

  return (
    <Pressable
      onPress={() =>
        onPress ? onPress() : tunes.playTrack(track.id, contextIds)
      }
      accessibilityRole="button"
      accessibilityLabel={`Play ${track.title} by ${artist.name}`}
      style={({ pressed }) => [
        styles.trackRow,
        pressed && { backgroundColor: pressedColor(darkMode) },
      ]}
    >
      <Artwork title={track.title} colors={track.colors} size={48} image={track.image} />
      <View style={styles.flex}>
        <Serif
          variant="body"
          numberOfLines={1}
          style={isCurrent ? { color: accent } : undefined}
        >
          {track.title}
        </Serif>
        <T variant="caption" muted style={styles.settingDescription}>
          {artist.name} · {track.album}
          {showPlays ? ` · ${track.plays} plays` : ""}
        </T>
      </View>
      {isCurrent ? (
        tunes.isPlaying ? (
          <Music size={16} color={accent} />
        ) : (
          <Pause size={16} color={accent} />
        )
      ) : null}
      <IconButton
        accessibilityLabel={liked ? `Unlike ${track.title}` : `Like ${track.title}`}
        onPress={() => tunes.toggleLike(track.id)}
        isDark={darkMode}
        size="sm"
        tint={liked ? accent : undefined}
        icon={
          <Heart
            size={18}
            color={liked ? accent : darkMode ? colors.dark.foreground : colors.light.foreground}
            fill={liked ? accent : "transparent"}
          />
        }
      />
      <Figure variant="caption" muted>
        {formatTime(track.duration)}
      </Figure>
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
  settingDescription: {
    marginTop: 4,
  },
  settingControl: {
    flexShrink: 0,
  },
  artwork: {
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
    borderRadius: 12,
  },
});
