import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { colors, Avatar, Badge, Card } from "glacia-native";
import { ChevronRight } from "lucide-react-native";

import { profileById, useKindred } from "../state";
import {
  Figure,
  ListCard,
  RowSeparator,
  Screen,
  SectionTitle,
  T,
} from "../ui";

export default function MatchesScreen() {
  const kindred = useKindred();
  const newMatches = kindred.matches.filter((m) => m.isNew);
  const conversations = [...kindred.matches].sort((a, b) => {
    const aHas = kindred.lastMessageOf(a.profileId) ? 0 : 1;
    const bHas = kindred.lastMessageOf(b.profileId) ? 0 : 1;
    return aHas - bHas;
  });

  return (
    <Screen
      title="Matches"
      subtitle="People you've liked who liked you back"
    >
      {newMatches.length > 0 ? (
        <View>
          <SectionTitle>New matches</SectionTitle>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.newRow}
          >
            {newMatches.map((match) => {
              const profile = profileById(match.profileId);
              return (
                <Pressable
                  key={match.profileId}
                  onPress={() => router.push(`/templates/date/chat/${match.profileId}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`New match: ${profile.name}`}
                  style={styles.newItem}
                >
                  <View>
                    <Avatar
                      name={profile.name}
                      size="lg"
                      isDark={kindred.darkMode}
                      source={profile.image}
                    />
                    <Badge
                      tone="muted"
                      isDark={kindred.darkMode}
                      style={styles.newDot}
                    >
                      New
                    </Badge>
                  </View>
                  <T variant="caption" style={styles.newName}>
                    {profile.name}
                  </T>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      <View>
        <SectionTitle>Conversations</SectionTitle>
        {conversations.length === 0 ? (
          <Card isDark={kindred.darkMode} padding={20}>
            <T variant="body" muted>
              No matches yet. People you match with appear here — find them
              in Discover.
            </T>
          </Card>
        ) : (
          <ListCard>
            {conversations.map((match, index) => {
              const profile = profileById(match.profileId);
              const last = kindred.lastMessageOf(match.profileId);
              return (
                <View key={match.profileId}>
                  {index > 0 ? <RowSeparator /> : null}
                  <Pressable
                    onPress={() => router.push(`/templates/date/chat/${match.profileId}`)}
                    accessibilityRole="button"
                    accessibilityLabel={`Chat with ${profile.name}`}
                    style={({ pressed }) => [
                      styles.row,
                      pressed && {
                        backgroundColor: kindred.darkMode
                          ? "rgba(237,237,237,0.06)"
                          : "rgba(31,27,22,0.05)",
                      },
                    ]}
                  >
                    <Avatar
                      name={profile.name}
                      size="md"
                      isDark={kindred.darkMode}
                      source={profile.image}
                    />
                    <View style={styles.rowText}>
                      <View style={styles.rowNameLine}>
                        <T variant="body">{profile.name}</T>
                        <Figure variant="body" muted>
                          {profile.age}
                        </Figure>
                        {match.isNew ? (
                          <Badge tone="muted" isDark={kindred.darkMode}>
                            New
                          </Badge>
                        ) : null}
                      </View>
                      <T variant="caption" muted numberOfLines={1}>
                        {last
                          ? `${last.senderId === "me" ? "You: " : ""}${last.text}`
                          : "No messages yet — say hello"}
                      </T>
                      <Figure variant="caption" muted>
                        {last ? last.timeLabel : match.matchedLabel}
                      </Figure>
                    </View>
                    <ChevronRight size={20} color={colors[kindred.darkMode ? "dark" : "light"].muted} />
                  </Pressable>
                </View>
              );
            })}
          </ListCard>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  newRow: {
    gap: 16,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  newItem: {
    alignItems: "center",
    gap: 8,
    width: 76,
  },
  newDot: {
    position: "absolute",
    bottom: -4,
    right: -8,
  },
  newName: {
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: 12,
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
  rowNameLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
