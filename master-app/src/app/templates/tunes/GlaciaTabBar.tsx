import React, { type ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import type { BottomTabBarProps } from "expo-router/build/layouts/Tabs";
import {
  colors,
  IconButton, Progress, TabBar
} from "glacia-native";
import { Home, Library, Pause, Play, Search, SkipForward, User } from "lucide-react-native";

import { artistOf, trackById } from "./data";
import { useTunes } from "./state";
import { Artwork, Serif, T, accentColor } from "./ui";

/** Route name -> tab label for the four main tabs. */
const LABELS: Record<string, string> = {
  index: "Home",
  search: "Search",
  library: "Library",
  profile: "Profile",
};

/** Route name -> tab icon, as a render function: the engine tab bar
 *  calls icon({ focused, color, size }), so the colour and size it
 *  resolves (accent when focused, muted when not) flow straight in. */
const ICONS: Record<string, (state: { color: string; size: number }) => ReactNode> = {
  index: ({ color, size }) => <Home color={color} size={size} />,
  search: ({ color, size }) => <Search color={color} size={size} />,
  library: ({ color, size }) => <Library color={color} size={size} />,
  profile: ({ color, size }) => <User color={color} size={size} />,
};

/**
 * The mini player: a slim glass strip docked directly above the tab
 * bar whenever a track is loaded. Tapping it opens the full player;
 * its own play/pause and next buttons work without leaving the tab.
 */
function MiniPlayer() {
  const tunes = useTunes();
  const router = useRouter();
  if (!tunes.currentTrackId) return null;

  const track = trackById(tunes.currentTrackId);
  const artist = artistOf(track);
  const progress =
    track.duration > 0 ? (tunes.position / track.duration) * 100 : 0;

  return (
    <Pressable
      onPress={() => router.push("/templates/tunes/player")}
      accessibilityRole="button"
      accessibilityLabel={`Now playing: ${track.title} by ${artist.name}. Open the full player.`}
      style={styles.mini}
    >
      <Artwork title={track.title} colors={track.colors} size={40} />
      <View style={styles.miniText}>
        <Serif variant="body" numberOfLines={1}>
          {track.title}
        </Serif>
        <T variant="caption" muted numberOfLines={1}>
          {artist.name}
        </T>
        <Progress
          value={progress}
          isDark={tunes.darkMode}
          tint={accentColor(tunes.backdrop)}
          accessibilityLabel="Playback progress"
          style={styles.miniProgress}
        />
      </View>
      <IconButton
        accessibilityLabel={tunes.isPlaying ? "Pause" : "Play"}
        onPress={tunes.togglePlay}
        isDark={tunes.darkMode}
        icon={
          tunes.isPlaying ? (
            <Pause size={18} color={tunes.darkMode ? colors.dark.foreground : colors.light.foreground} />
          ) : (
            <Play size={18} color={tunes.darkMode ? colors.dark.foreground : colors.light.foreground} />
          )
        }
      />
      <IconButton
        accessibilityLabel="Next track"
        onPress={() => tunes.next(true)}
        isDark={tunes.darkMode}
        icon={<SkipForward size={18} color={tunes.darkMode ? colors.dark.foreground : colors.light.foreground} />}
      />
    </Pressable>
  );
}

/**
 * Glacia's own TabBar as the expo-router tab bar, with the mini player
 * stacked above it in the same padded wrapper — the wrapper pads by the
 * larger of the device bottom inset and 10pt, so the bar always floats
 * fully above the Android navigation bar / iOS home indicator.
 */
export function GlaciaTabBar({ state, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const { darkMode } = useTunes();
  const activeRoute = state.routes[state.index];

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <MiniPlayer />
      <TabBar
        isDark={darkMode}
        activeId={activeRoute.key}
        items={state.routes.map((route) => ({
          id: route.key,
          label: LABELS[route.name] ?? route.name,
          icon: ICONS[route.name],
        }))}
        onTabChange={(key) => {
          const route = state.routes.find((r) => r.key === key);
          if (!route || route.key === activeRoute.key) return;
          const event = emitter.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!event.defaultPrevented) navigateToTab(route.key);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
  },
  mini: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(127,127,127,0.16)",
  },
  miniText: {
    flex: 1,
    gap: 4,
  },
  miniProgress: {
    marginTop: 4,
  },
});
