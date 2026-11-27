import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, IconButton, Separator } from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Cancel01Icon from "@hugeicons/core-free-icons/Cancel01Icon";

import { useKindred } from "../state";
import { Figure, PhotoPanel, Screen, T } from "../ui";

export default function LikesScreen() {
  const kindred = useKindred();

  return (
    <Screen
      belowTabBar
      title="Likes you"
      subtitle="People who already liked your profile — like back and it's a match"
    >
      {kindred.likesYou.length === 0 ? (
        <View style={styles.emptyBlock}>
          <T variant="heading" style={styles.emptyTitle}>
            All caught up
          </T>
          <T variant="body" muted style={styles.emptyBody}>
            Nobody new is waiting right now. New likes appear here as they
            come in.
          </T>
        </View>
      ) : (
        <View>
          {kindred.likesYou.map((profile, index) => (
            <View key={profile.id}>
              {index > 0 ? (
                <Separator isDark={kindred.darkMode} inset={120} />
              ) : null}
              {/* Image-led row: a portrait tile, the person in a few
                  lines, and the decision right there — no full profile
                  card per like, the list stays browsable. */}
              <View style={styles.row}>
                <View style={styles.tile}>
                  <PhotoPanel profile={profile} height={120} radius={16} />
                </View>
                <View style={styles.rowText}>
                  <View style={styles.nameRow}>
                    <T variant="heading">{profile.name}</T>
                    <Figure variant="heading" muted>
                      {profile.age}
                    </Figure>
                  </View>
                  <Figure variant="caption" muted>
                    {profile.job} · {profile.distanceKm} km away
                  </Figure>
                  <T variant="body" numberOfLines={2} style={styles.bio}>
                    {profile.bio}
                  </T>
                  <View style={styles.actions}>
                    <Button
                      isDark={kindred.darkMode}
                      accessibilityLabel={`Like ${profile.name} back`}
                      variant="filled"
                      size="sm"
                      style={styles.likeButton}
                      onPress={() => {
                        kindred.likeBack(profile.id);
                        router.push(`/templates/date/chat/${profile.id}`);
                      }}
                    >
                      Like back
                    </Button>
                    <IconButton
                      icon={({ color, size }: { color: string; size: number }) => (
                        <HugeiconsIcon
                          icon={Cancel01Icon}
                          size={size}
                          color={color}
                        />
                      )}
                      accessibilityLabel={`Dismiss ${profile.name}`}
                      isDark={kindred.darkMode}
                      size="sm"
                      onPress={() => kindred.dismissLike(profile.id)}
                    />
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyBlock: {
    alignItems: "center",
    gap: 12,
    paddingTop: 48,
  },
  emptyTitle: { textAlign: "center" },
  emptyBody: { textAlign: "center", lineHeight: 22 },
  row: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
    alignItems: "flex-start",
  },
  tile: {
    width: 96,
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  bio: { lineHeight: 20 },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    alignItems: "center",
  },
  likeButton: { flex: 1 },
});
