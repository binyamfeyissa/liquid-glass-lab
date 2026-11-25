import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Avatar, Button } from "glacia-native";

import { useSocial } from "../state";
import { Figure, GradientTile, PostCard, SectionTitle, T, compact } from "../ui";

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const social = useSocial();
  const user = social.users.find((u) => u.id === id);

  if (!user) {
    return (
      <View style={styles.missing}>
        <T variant="heading">Person not found</T>
        <T variant="body" muted style={styles.missingText}>
          This person could not be found
        </T>
        <Button isDark={social.darkMode} accessibilityLabel="Back" variant="glass" onPress={() => router.back()}>
          Back
        </Button>
      </View>
    );
  }

  const following = social.isFollowing(user.id);
  const theirPosts = social.postsByUser(user.id);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Button isDark={social.darkMode} accessibilityLabel="Back" variant="ghost" onPress={() => router.back()}>
        Back
      </Button>

      <GradientTile gradient={user.gradient} label={user.name} height={110} radius={20} fontSize={26} />

      <View style={styles.header}>
        <Avatar name={user.name} size="lg" isDark={social.darkMode} />
        <View style={styles.flex1}>
          <T variant="heading">{user.name}</T>
          <T variant="body" muted>
            {user.handle}
          </T>
        </View>
      </View>
      <T variant="body" style={styles.bio}>
        {user.bio}
      </T>

      <View style={styles.counts}>
        <View style={styles.count}>
          <Figure variant="heading">{theirPosts.length}</Figure>
          <T variant="caption" muted>
            Posts
          </T>
        </View>
        <View style={styles.count}>
          <Figure variant="heading">{compact(social.followerCountOf(user))}</Figure>
          <T variant="caption" muted>
            Followers
          </T>
        </View>
        <View style={styles.count}>
          <Figure variant="heading">{compact(user.following)}</Figure>
          <T variant="caption" muted>
            Following
          </T>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          isDark={social.darkMode}
          accessibilityLabel={following ? `Unfollow ${user.name}` : `Follow ${user.name}`}
          variant={following ? "glass" : "filled"}
          onPress={() => social.toggleFollow(user.id)}
          style={styles.action}
        >
          {following ? "Following" : "Follow"}
        </Button>
        <Button
          isDark={social.darkMode}
          accessibilityLabel={`Message ${user.name}`}
          onPress={() => {
            const convId = social.startConversationWith(user.id);
            router.push(`/templates/social/thread/${convId}`);
          }}
          style={styles.action}
        >
          Message
        </Button>
      </View>

      <View>
        <SectionTitle>Posts by {user.name.split(" ")[0]}</SectionTitle>
        {theirPosts.length === 0 ? (
          <T variant="body" muted>
            No posts yet
          </T>
        ) : (
          <View style={styles.posts}>
            {theirPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 32,
    gap: 16,
  },
  missing: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  missingText: { textAlign: "center" },
  header: { flexDirection: "row", alignItems: "center", gap: 16 },
  bio: { lineHeight: 22 },
  counts: { flexDirection: "row", gap: 12 },
  count: { flex: 1, alignItems: "center", gap: 4 },
  actions: { flexDirection: "row", gap: 12 },
  action: { flex: 1 },
  posts: { gap: 16 },
});
