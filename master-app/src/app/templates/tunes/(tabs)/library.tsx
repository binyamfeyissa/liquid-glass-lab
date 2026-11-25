import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import {
  colors,
  Button, Card, Input
} from "glacia-native";
import { ChevronRight, Heart } from "lucide-react-native";

import { formatLongDuration, trackById } from "../data";
import { LIKED_PLAYLIST_ID, useTunes } from "../state";
import {
  Artwork,
  ListCard,
  Screen,
  SectionTitle,
  Serif,
  T,
  accentColor,
  pressedColor,
} from "../ui";

function totalDuration(trackIds: string[]): number {
  return trackIds.reduce((sum, id) => sum + trackById(id).duration, 0);
}

export default function LibraryScreen() {
  const tunes = useTunes();
  const router = useRouter();
  const { darkMode, backdrop } = tunes;
  const accent = accentColor(backdrop);

  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [createdNote, setCreatedNote] = useState<string | null>(null);

  const createPlaylist = () => {
    const name = newName.trim();
    if (name.length < 2) {
      setError("Give your playlist a name of at least 2 characters");
      setCreatedNote(null);
      return;
    }
    if (
      tunes.playlists.some(
        (p) => p.name.toLowerCase() === name.toLowerCase(),
      ) ||
      name.toLowerCase() === "liked songs"
    ) {
      setError("You already have a playlist with that name");
      setCreatedNote(null);
      return;
    }
    const created = tunes.createPlaylist(name);
    setNewName("");
    setError(null);
    setCreatedNote(`${created.name} created — open it to add tracks`);
  };

  const openPlaylist = (id: string) => router.push(`/templates/tunes/playlist/${id}`);

  return (
    <Screen title="Your Library" subtitle="Playlists, liked songs and your own mixes">
      {/* Liked Songs — the automatic playlist fed by every heart. */}
      <Card
        isDark={darkMode}
        padding={16}
        onPress={() => openPlaylist(LIKED_PLAYLIST_ID)}
        accessibilityLabel="Open Liked Songs"
      >
        <View style={styles.likedRow}>
          <Artwork title="Liked Songs" colors={["#db2777", "#7c3aed"]} size={56} />
          <View style={styles.flex}>
            <Serif variant="heading">Liked Songs</Serif>
            <T variant="caption" muted style={styles.sub}>
              {tunes.likedIds.length} tracks ·{" "}
              {formatLongDuration(totalDuration(tunes.likedIds))}
            </T>
          </View>
          <Heart size={20} color={accent} fill={accent} />
        </View>
      </Card>

      {/* All playlists */}
      <View>
        <SectionTitle>Playlists</SectionTitle>
        <ListCard>
          {tunes.playlists.map((playlist, i) => (
            <View key={playlist.id}>
              {i > 0 ? <View style={styles.rowGap} /> : null}
              <Pressable
                onPress={() => openPlaylist(playlist.id)}
                accessibilityRole="button"
                accessibilityLabel={`Open playlist ${playlist.name}`}
                style={({ pressed }) => [
                  styles.playlistRow,
                  pressed && { backgroundColor: pressedColor(darkMode) },
                ]}
              >
                <Artwork
                  title={playlist.name}
                  colors={playlist.colors}
                  size={48}
                />
                <View style={styles.flex}>
                  <Serif variant="body" numberOfLines={1}>
                    {playlist.name}
                  </Serif>
                  <T variant="caption" muted style={styles.sub}>
                    {playlist.trackIds.length} tracks ·{" "}
                    {formatLongDuration(totalDuration(playlist.trackIds))}
                    {playlist.userCreated ? " · Yours" : ""}
                  </T>
                </View>
                <ChevronRight size={18} color={darkMode ? colors.dark.muted : colors.light.muted} />
              </Pressable>
            </View>
          ))}
        </ListCard>
      </View>

      {/* Create a playlist */}
      <View>
        <SectionTitle>New playlist</SectionTitle>
        <ListCard>
          <View style={styles.createBox}>
            <Input
              value={newName}
              onChangeText={(text) => {
                setNewName(text);
                setError(null);
              }}
              placeholder="Playlist name"
              accessibilityLabel="New playlist name"
              invalid={!!error}
              isDark={darkMode}
            />
            {error ? (
              <T variant="caption" style={{ color: accent }}>
                {error}
              </T>
            ) : null}
            {createdNote ? (
              <T variant="caption">{createdNote}</T>
            ) : null}
            <Button
              accessibilityLabel="Create playlist"
              onPress={createPlaylist}
              isDark={darkMode}
            >
              Create playlist
            </Button>
          </View>
        </ListCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sub: { marginTop: 4 },
  likedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  playlistRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
    borderRadius: 12,
  },
  rowGap: { height: 2 },
  createBox: {
    padding: 16,
    gap: 8,
  },
});
