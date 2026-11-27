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
  colors,
  Badge,
  Card,
  IconButton,
  Progress,
  SegmentedControl,
  Separator,
  Text,
  type TextProps,
} from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Download01Icon from "@hugeicons/core-free-icons/Download01Icon";
import Menu01Icon from "@hugeicons/core-free-icons/Menu01Icon";
import Tick01Icon from "@hugeicons/core-free-icons/Tick01Icon";
import {
  formatDuration,
  formatTime,
  initialsOfTitle,
  showById,
  type Episode,
  type Show,
} from "./data";
import { useCast, type BackdropMode } from "./state";

/* ------------------------------------------------------------------ */
/*  Theme tokens — one warm graphite/paper ramp, one amber accent.     */
/* ------------------------------------------------------------------ */

export const MONO = Platform.OS === "ios" ? "Menlo" : "monospace";

/** Warm amber, the on-air lamp. Darker on light surfaces for contrast. */
export function accentColor(mode: BackdropMode): string {
  return mode === "light" ? "#9a4a06" : "#eda33c";
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

/* ------------------------------------------------------------------ */
/*  T — Glacia Text threaded with the template's manual theme.         */
/* ------------------------------------------------------------------ */

export function T({ style, ...rest }: TextProps) {
  const { darkMode } = useCast();
  return <Text isDark={darkMode} style={style} {...rest} />;
}

/* ------------------------------------------------------------------ */
/*  Figure — every figure in the mono face: durations, timecodes,      */
/*  positions, file sizes. Tabular, so columns line up.                */
/* ------------------------------------------------------------------ */

export function Figure({ style, ...rest }: TextProps) {
  const { darkMode } = useCast();
  return <Text isDark={darkMode} style={[styles.figure, style]} {...rest} />;
}

/* ------------------------------------------------------------------ */
/*  Backdrop — the three backgrounds, and nothing else.                */
/*  Dark: graphite #141415. Light: broken white #f7f4ee.               */
/*  Photo: the palm image, full-bleed, under a neutral scrim.         */
/* ------------------------------------------------------------------ */

export function Backdrop() {
  const { backdrop } = useCast();
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
  const { backdrop, setBackdrop, darkMode } = useCast();
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
      <T variant="title">
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
  const { darkMode } = useCast();
  return (
    <Card isDark={darkMode} padding={8} style={style}>
      {children}
    </Card>
  );
}

export function RowSeparator() {
  const { darkMode } = useCast();
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
/*  Artwork — show art: the bundled cover photo when present, falling  */
/*  back to one flat plate (the show's hue mixed toward the mode       */
/*  neutral) carrying the title's initials like a printed sleeve.      */
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
  /** Bundled cover photo; when present it replaces the flat plate. */
  image?: number;
}) {
  const { backdrop } = useCast();
  const r = radius ?? Math.round(size * 0.24);
  const plate =
    backdrop === "light"
      ? mixHex(colors[0], "#8a8578", 0.5)
      : mixHex(colors[0], "#232325", 0.45);
  return (
    <View
      style={[
        styles.artwork,
        {
          width: size,
          height: size,
          borderRadius: r,
          backgroundColor: plate,
        },
      ]}
    >
      {image ? (
        <Image
          source={image}
          resizeMode="cover"
          style={{ width: size, height: size, borderRadius: r }}
        />
      ) : (
        <T
          variant={size >= 120 ? "title" : "label"}
          style={{ color: backdrop === "light" ? "#1f1b16" : "#f7f4ee" }}
        >
          {initialsOfTitle(title)}
        </T>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  EpisodeRow — one episode in any list. Tapping plays it and opens   */
/*  the player; the side buttons queue it or download it without       */
/*  triggering the row. Progress, Played badge and remaining time      */
/*  all read live from the store.                                      */
/* ------------------------------------------------------------------ */

export function EpisodeRow({
  episode,
  showTitle = true,
  openPlayerOnPlay = true,
}: {
  episode: Episode;
  /** Show the podcast name under the title (mixed-show lists). */
  showTitle?: boolean;
  openPlayerOnPlay?: boolean;
}) {
  const cast = useCast();
  const router = useRouter();
  const { darkMode } = cast;
  const show = showById(episode.showId);
  const isCurrent = cast.currentEpisodeId === episode.id;
  const played = cast.isPlayed(episode.id);
  const progressSec = cast.progressOf(episode.id);
  const progressPct =
    episode.duration > 0 ? (progressSec / episode.duration) * 100 : 0;
  const download = cast.downloadProgressOf(episode.id);
  const downloading = download !== undefined && download < 100;
  const downloaded = cast.isDownloaded(episode.id);
  const queued = cast.isQueued(episode.id);

  return (
    <Pressable
      onPress={() => {
        cast.playEpisode(episode.id);
        if (openPlayerOnPlay) router.push("/templates/cast/player");
      }}
      accessibilityRole="button"
      accessibilityLabel={`Play ${episode.title} from ${show.title}`}
      style={({ pressed }) => [
        styles.episodeRow,
        pressed && {
          backgroundColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
        },
      ]}
    >
      <Artwork title={show.title} colors={show.colors} size={52} image={show.image} />
      <View style={styles.flex}>
        <T
          variant="body"
          numberOfLines={2}
          style={isCurrent ? { color: accentColor(cast.backdrop) } : undefined}
        >
          {episode.title}
        </T>
        <View style={styles.metaLine}>
          <T variant="caption" muted numberOfLines={1} style={{ flexShrink: 1 }}>
            {showTitle ? `${show.title} · ` : ""}
            {episode.dateLabel} ·
          </T>
          <Figure variant="caption" muted>
            {formatDuration(episode.duration)}
          </Figure>
        </View>
        {played ? (
          <View style={styles.badgeRow}>
            <Badge tone="muted" isDark={darkMode}>
              Played
            </Badge>
          </View>
        ) : progressSec > 5 ? (
          <View style={styles.progressWrap}>
            <Progress
              value={progressPct}
              isDark={darkMode}
              accessibilityLabel={`Progress in ${episode.title}`}
              style={styles.progressBar}
            />
            <Figure variant="caption" muted>
              {formatTime(episode.duration - progressSec)} left
            </Figure>
          </View>
        ) : null}
      </View>
      {isCurrent ? (
        <T variant="label" style={{ color: accentColor(cast.backdrop) }}>
          {cast.isPlaying ? "Playing" : "Paused"}
        </T>
      ) : null}
      <IconButton
        accessibilityLabel={
          queued
            ? `${episode.title} is in your queue`
            : `Add ${episode.title} to queue`
        }
        onPress={() =>
          queued ? cast.removeFromQueue(episode.id) : cast.addToQueue(episode.id)
        }
        isDark={darkMode}
        size="sm"
        icon={
          queued ? (
            <HugeiconsIcon icon={Tick01Icon} size={16} color={accentColor(cast.backdrop)} />
          ) : (
            <HugeiconsIcon icon={Menu01Icon} size={16} color={colors[darkMode ? "dark" : "light"].foreground} />
          )
        }
      />
      <IconButton
        accessibilityLabel={
          downloaded
            ? `${episode.title} downloaded`
            : downloading
              ? `Downloading ${episode.title}`
              : `Download ${episode.title}`
        }
        onPress={() => {
          if (downloaded) cast.removeDownload(episode.id);
          else if (!downloading) cast.startDownload(episode.id);
        }}
        isDark={darkMode}
        size="sm"
        icon={
          downloaded ? (
            <HugeiconsIcon icon={Tick01Icon} size={16} color={colors[darkMode ? "dark" : "light"].foreground} />
          ) : downloading ? (
            <Figure variant="caption">{Math.floor(download)}%</Figure>
          ) : (
            <HugeiconsIcon icon={Download01Icon} size={16} color={colors[darkMode ? "dark" : "light"].foreground} />
          )
        }
      />
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  ShowRow — one show in an editorial list. The left side (artwork +  */
/*  title/author/meta) navigates to the show; the trailing node is a   */
/*  separate control (a Follow Button in Discover, a plain chevron in  */
/*  Library), so no pressable nests inside another.                    */
/* ------------------------------------------------------------------ */

export function ShowRow({
  show,
  onPress,
  trailing,
}: {
  show: Show;
  onPress: () => void;
  trailing?: ReactNode;
}) {
  const { darkMode } = useCast();
  return (
    <View style={styles.showRow}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Open ${show.title}`}
        style={({ pressed }) => [
          styles.showRowMain,
          pressed && {
            backgroundColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
          },
        ]}
      >
        <Artwork title={show.title} colors={show.colors} size={64} image={show.image} />
        <View style={styles.flex}>
          <T variant="body" numberOfLines={1}>
            {show.title}
          </T>
          <T variant="caption" muted numberOfLines={1}>
            {show.author}
          </T>
          <View style={styles.metaLine}>
            <T variant="caption" muted>
              {show.category} ·
            </T>
            <Figure variant="caption" muted>
              {show.rating}
            </Figure>
            <T variant="caption" muted>
              · {show.cadence}
            </T>
          </View>
        </View>
      </Pressable>
      {trailing ? <View style={styles.showRowTrailing}>{trailing}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  figure: {
    fontFamily: MONO,
    fontVariant: ["tabular-nums"],
  },
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
    overflow: "hidden",
    flexShrink: 0,
  },
  episodeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
    borderRadius: 12,
  },
  metaLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: "row",
    marginTop: 4,
  },
  progressWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
  },
  showRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  showRowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  showRowTrailing: {
    flexShrink: 0,
  },
});
