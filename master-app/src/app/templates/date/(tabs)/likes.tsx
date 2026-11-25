import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, Card } from "glacia-native";

import { useKindred } from "../state";
import { Figure, InterestChips, PhotoPanel, ProfileFacts, Screen, T } from "../ui";

export default function LikesScreen() {
  const kindred = useKindred();

  return (
    <Screen
      title="Likes you"
      subtitle="People who already liked your profile — like back and it's a match"
    >
      {kindred.likesYou.length === 0 ? (
        <Card isDark={kindred.darkMode} padding={20} style={styles.emptyCard}>
          <T variant="heading" style={styles.emptyTitle}>
            All caught up
          </T>
          <T variant="body" muted style={styles.emptyBody}>
            Nobody new is waiting right now. New likes appear here as they
            come in.
          </T>
        </Card>
      ) : (
        kindred.likesYou.map((profile) => (
          <Card
            key={profile.id}
            isDark={kindred.darkMode}
            padding={0}
            style={styles.card}
          >
            <PhotoPanel profile={profile} height={220} />
            <View style={styles.body}>
              <View style={styles.nameRow}>
                <T variant="heading">{profile.name}</T>
                <Figure variant="heading" muted>
                  {profile.age}
                </Figure>
              </View>
              <T variant="body" style={styles.bio}>
                {profile.bio}
              </T>
              <ProfileFacts profile={profile} />
              <InterestChips interests={profile.interests} />
              <View style={styles.actions}>
                <Button
                  accessibilityLabel={`Dismiss ${profile.name}`}
                  variant="glass"
                  style={styles.actionButton}
                  onPress={() => kindred.dismissLike(profile.id)}
                >
                  Not for me
                </Button>
                <Button
                  accessibilityLabel={`Like ${profile.name} back`}
                  variant="filled"
                  style={styles.actionButton}
                  onPress={() => {
                    kindred.likeBack(profile.id);
                    router.push(`/templates/date/chat/${profile.id}`);
                  }}
                >
                  Like back
                </Button>
              </View>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyCard: { gap: 12 },
  emptyTitle: { textAlign: "center" },
  emptyBody: { textAlign: "center", lineHeight: 22 },
  card: { overflow: "hidden" },
  body: {
    padding: 20,
    gap: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  bio: { lineHeight: 22 },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  actionButton: { flex: 1 },
});
