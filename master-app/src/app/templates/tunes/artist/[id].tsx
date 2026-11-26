import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  colors,
  Avatar, Button, Card, IconButton
} from "glacia-native";
import { ChevronLeft } from "lucide-react-native";

import { TRACKS, artistById } from "../data";
import { useTunes } from "../state";
import {
  Artwork,
  Figure,
  ListCard,
  SectionTitle,
  Serif,
  T,
  TrackRow,
} from "../ui";

/**
 * Artist page: header with listener count and bio, the artist's top
 * tracks (by catalogue plays order — fixtures are listed most-played
 * first per artist), and their albums as composed-art cards.
 */
export default function ArtistScreen() {
  const tunes = useTunes();
  const router = useRouter();
  const { darkMode } = tunes;
  const { id } = useLocalSearchParams<{ id: string }>();

  const artist = id ? artistById(id) : null;
  if (!artist || artist.id !== id) {
    return (
      <View style={styles.emptyWrap}>
        <T variant="title">Artist not found</T>
        <Button
          accessibilityLabel="Back"
          onPress={() => router.back()}
          isDark={darkMode}
          style={styles.emptyButton}
        >
          Back
        </Button>
      </View>
    );
  }

  const artistTracks = TRACKS.filter((t) => t.artistId === artist.id);
  const trackIds = artistTracks.map((t) => t.id);
  const albums = [...new Set(artistTracks.map((t) => t.album))].map(
    (album) => {
      const first = artistTracks.find((t) => t.album === album)!;
      return {
        name: album,
        year: first.year,
        colors: first.colors,
        count: artistTracks.filter((t) => t.album === album).length,
        firstTrackId: first.id,
      };
    },
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <IconButton
          accessibilityLabel="Back"
          onPress={() => router.back()}
          isDark={darkMode}
          icon={<ChevronLeft size={20} color={darkMode ? colors.dark.foreground : colors.light.foreground} />}
        />
      </View>

      {/* Artist header */}
      <Card isDark={darkMode} padding={20}>
        <View style={styles.artistHead}>
          <Avatar name={artist.name} size="lg" isDark={darkMode} />
          <View style={styles.flex}>
            <Serif variant="title">{artist.name}</Serif>
            <View style={styles.listeners}>
              <Figure variant="caption">{artist.listeners}</Figure>
              <T variant="caption" muted>
                monthly listeners
              </T>
            </View>
          </View>
        </View>
        <T variant="body" muted style={styles.bio}>
          {artist.bio}
        </T>
        <Button
          accessibilityLabel={`Play top tracks by ${artist.name}`}
          onPress={() => tunes.playTrack(trackIds[0], trackIds)}
          isDark={darkMode}
          variant="filled"
          style={styles.playTop}
        >
          Play top tracks
        </Button>
      </Card>

      {/* Top tracks */}
      <View style={styles.block}>
        <SectionTitle>Top tracks</SectionTitle>
        <ListCard>
          {artistTracks.map((track, i) => (
            <View key={track.id}>
              {i > 0 ? <View style={styles.rowGap} /> : null}
              <TrackRow track={track} contextIds={trackIds} showPlays />
            </View>
          ))}
        </ListCard>
      </View>

      {/* Albums */}
      <View style={styles.block}>
        <SectionTitle>Albums</SectionTitle>
        <View style={styles.albumGrid}>
          {albums.map((album) => (
            <Card
              key={album.name}
              isDark={darkMode}
              padding={16}
              style={styles.albumCard}
              onPress={() => tunes.playTrack(album.firstTrackId, trackIds)}
              accessibilityLabel={`Play ${album.name} by ${artist.name}`}
            >
              <Artwork title={album.name} colors={album.colors} size={64} />
              <Serif variant="body" numberOfLines={1} style={styles.albumTitle}>
                {album.name}
              </Serif>
              <T variant="caption" muted>
                {album.year} · {album.count} tracks
              </T>
            </Card>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 112,
    paddingBottom: 32,
  },
  header: { marginBottom: 8 },
  flex: { flex: 1 },
  listeners: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginTop: 4,
  },
  artistHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  bio: { marginTop: 16, lineHeight: 20 },
  playTop: { marginTop: 16 },
  block: { marginTop: 24 },
  albumGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  albumCard: {
    width: "48%",
    flexGrow: 1,
    gap: 4,
  },
  albumTitle: { marginTop: 8 },
  rowGap: { height: 2 },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyButton: { marginTop: 8 },
});
