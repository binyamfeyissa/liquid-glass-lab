import React, { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import type { BottomTabBarProps } from "expo-router/build/layouts/Tabs";
import { colors, Card, IconButton, Progress, TabBar } from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import CompassIcon from "@hugeicons/core-free-icons/CompassIcon";
import Home01Icon from "@hugeicons/core-free-icons/Home01Icon";
import LibraryIcon from "@hugeicons/core-free-icons/LibraryIcon";
import PauseIcon from "@hugeicons/core-free-icons/PauseIcon";
import PlayIcon from "@hugeicons/core-free-icons/PlayIcon";
import UserIcon from "@hugeicons/core-free-icons/UserIcon";
import { episodeById, showById } from "./data";
import { useCast } from "./state";
import { Artwork, T } from "./ui";

/** Route name -> tab label for the four main tabs. */
const LABELS: Record<string, string> = {
  index: "Home",
  discover: "Discover",
  library: "Library",
  profile: "Profile",
};

/** Route name -> tab icon, as a render function: the engine tab bar
 *  calls icon({ focused, color, size }), so the colour and size it
 *  resolves (accent when focused, muted when not) flow straight in. */
const ICONS: Record<string, (state: { color: string; size: number }) => ReactNode> = {
  index: ({ color, size }) => <HugeiconsIcon icon={Home01Icon} color={color} size={size} />,
  discover: ({ color, size }) => <HugeiconsIcon icon={CompassIcon} color={color} size={size} />,
  library: ({ color, size }) => <HugeiconsIcon icon={LibraryIcon} color={color} size={size} />,
  profile: ({ color, size }) => <HugeiconsIcon icon={UserIcon} color={color} size={size} />,
};

/**
 * The mini player: the library's own Card (Liquid Glass) docked
 * directly above the tab bar whenever an episode is loaded. Tapping
 * it opens the full player; its own play/pause button works without
 * leaving the tab.
 */
function MiniPlayer() {
  const cast = useCast();
  const router = useRouter();
  if (!cast.currentEpisodeId) return null;

  const episode = episodeById(cast.currentEpisodeId);
  const show = showById(episode.showId);
  const progress =
    episode.duration > 0 ? (cast.position / episode.duration) * 100 : 0;

  return (
    <Card
      isDark={cast.darkMode}
      padding={8}
      onPress={() => router.push("/templates/cast/player")}
      accessibilityLabel={`Now playing: ${episode.title} from ${show.title}. Open the full player.`}
    >
      <View style={styles.miniRow}>
        <Artwork title={show.title} colors={show.colors} size={40} image={show.image} />
        <View style={styles.miniText}>
          <T variant="body" numberOfLines={1}>
            {episode.title}
          </T>
          <T variant="caption" muted numberOfLines={1}>
            {show.title}
          </T>
          <Progress
            value={progress}
            isDark={cast.darkMode}
            accessibilityLabel="Playback progress"
            style={styles.miniProgress}
          />
        </View>
        <IconButton
          accessibilityLabel={cast.isPlaying ? "Pause" : "Play"}
          onPress={cast.togglePlay}
          isDark={cast.darkMode}
          icon={cast.isPlaying ? <HugeiconsIcon icon={PauseIcon} size={16} color={colors[cast.darkMode ? "dark" : "light"].foreground} /> : <HugeiconsIcon icon={PlayIcon} size={16} color={colors[cast.darkMode ? "dark" : "light"].foreground} />}
        />
      </View>
    </Card>
  );
}

/**
 * Glacia's own TabBar as the expo-router tab bar, with the mini player
 * stacked above it in the same padded wrapper — the wrapper pads by the
 * larger of the device bottom inset and 10pt, so the bar always floats
 * fully above the Android navigation bar / iOS home indicator.
 */
export function GlaciaTabBar({ state, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const { darkMode } = useCast();
  const activeRoute = state.routes[state.index];

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
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
    // Floating, not in-flow: expo-router's BottomTabView renders the tab
    // bar as a flex child BELOW the screens container, so an in-flow bar
    // owns a strip the scene can never scroll behind (that strip is the
    // "opaque layer" hiding the content). Absolute over the scene, the
    // pill floats like Telegram's and the list scrolls visibly
    // behind/around it. box-none on the wrapper View above lets touches
    // pass through the strip around the pill to the scrolling content.
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
  },
  miniRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 4,
  },
  miniText: {
    flex: 1,
    gap: 4,
  },
  miniProgress: {
    marginTop: 4,
  },
});
