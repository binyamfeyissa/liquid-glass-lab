import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Card } from "glacia-native";

import { TRACKS, artistOf, trackById } from "../data";
import { useTunes } from "../state";
import {
  Artwork,
  ListCard,
  Screen,
  SectionTitle,
  Serif,
  T,
  TrackRow,
} from "../ui";

export default function HomeScreen() {
  const tunes = useTunes();
  const router = useRouter();
  const { darkMode } = tunes;

  const recent = tunes.recentTrackIds.slice(0, 6).map(trackById);
  const newReleases = [...TRACKS]
    .sort((a, b) => b.year - a.year)
    .slice(0, 5);
  const newReleaseIds = newReleases.map((t) => t.id);

  return (
    <Screen
      title="Waveform"
      subtitle="Recent listening, playlists and new releases"
    >
      {/* Recently played — a horizontal rail fed by the play history. */}
      <View>
        <SectionTitle>Recently played</SectionTitle>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rail}
        >
          {recent.map((track) => (
            <Pressable
              key={track.id}
              onPress={() => tunes.playTrack(track.id, tunes.recentTrackIds)}
              accessibilityRole="button"
              accessibilityLabel={`Play ${track.title}`}
              style={styles.railItem}
            >
              <Artwork title={track.title} colors={track.colors} size={96} image={track.image} />
              <Serif variant="caption" numberOfLines={1} style={styles.railTitle}>
                {track.title}
              </Serif>
              <T variant="caption" muted numberOfLines={1}>
                {artistOf(track).name}
              </T>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Made for you — the fixture playlists as composed cards. */}
      <View>
        <SectionTitle>Made for you</SectionTitle>
        <View style={styles.playlistGrid}>
          {tunes.playlists.slice(0, 4).map((playlist) => (
            <Card
              key={playlist.id}
              isDark={darkMode}
              padding={16}
              style={styles.playlistCard}
              onPress={() => router.push(`/templates/tunes/playlist/${playlist.id}`)}
              accessibilityLabel={`Open playlist ${playlist.name}`}
            >
              <Artwork
                title={playlist.name}
                colors={playlist.colors}
                size={64}
                image={playlist.image}
              />
              <Serif variant="body" numberOfLines={1} style={styles.cardTitle}>
                {playlist.name}
              </Serif>
              <T variant="caption" muted numberOfLines={2}>
                {playlist.description}
              </T>
              <T variant="caption" muted>
                {playlist.trackIds.length} tracks
              </T>
            </Card>
          ))}
        </View>
      </View>

      {/* New releases — tapping a row starts it with this list as queue. */}
      <View>
        <SectionTitle>New releases</SectionTitle>
        <ListCard>
          {newReleases.map((track, i) => (
            <View key={track.id}>
              {i > 0 ? <View style={styles.rowGap} /> : null}
              <TrackRow track={track} contextIds={newReleaseIds} showPlays />
            </View>
          ))}
        </ListCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  rail: {
    gap: 12,
    paddingHorizontal: 2,
  },
  railItem: {
    width: 96,
    gap: 4,
  },
  railTitle: {
    marginTop: 8,
  },
  playlistGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  playlistCard: {
    width: "48%",
    flexGrow: 1,
    gap: 4,
  },
  cardTitle: {
    marginTop: 8,
  },
  rowGap: {
    height: 2,
  },
});
