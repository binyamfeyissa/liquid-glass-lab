import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import {
  colors,
  Avatar, IconButton
} from "glacia-native";
import { Mail } from "lucide-react-native";

import { useSocial } from "../state";
import { Figure, PostCard, StoryRing, T, accentColor } from "../ui";

export default function FeedScreen() {
  const social = useSocial();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.flex1}>
          <T variant="title">Orbit</T>
          <T variant="caption" muted>
            Posts from people you follow, newest first
          </T>
        </View>
        <View style={styles.msgWrap}>
          <IconButton
            accessibilityLabel="Messages"
            onPress={() => router.push("/templates/social/messages")}
            isDark={social.darkMode}
            icon={<Mail size={20} color={social.darkMode ? colors.dark.foreground : colors.light.foreground} />}
          />
          {social.totalUnreadMessages > 0 ? (
            <View
              style={[
                styles.msgBadge,
                { backgroundColor: accentColor(social.backdrop) },
              ]}
            >
              <Figure variant="caption" style={styles.msgBadgeCount}>
                {social.totalUnreadMessages}
              </Figure>
            </View>
          ) : null}
        </View>
      </View>

      {/* Stories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.stories}
      >
        <View style={styles.storyItem}>
          <Avatar name={social.me.name} source={social.me.image} size="lg" isDark={social.darkMode} />
          <T variant="caption" numberOfLines={1} style={styles.storyName}>
            You
          </T>
        </View>
        {social.stories.map((story) => (
          <StoryRing key={story.userId} userId={story.userId} />
        ))}
      </ScrollView>

      {/* Posts */}
      <View style={styles.posts}>
        {social.posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </View>

      <T variant="caption" muted style={styles.foot}>
        All caught up
      </T>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 112,
    paddingBottom: 128,
    gap: 24,
  },
  flex1: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  msgWrap: { position: "relative" },
  msgBadge: {
    position: "absolute",
    top: -4,
    right: -6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  msgBadgeCount: { color: "#ffffff", fontSize: 11, lineHeight: 14 },
  stories: { gap: 8, paddingRight: 8 },
  storyItem: { alignItems: "center", gap: 8, width: 76, paddingTop: 4 },
  storyName: { maxWidth: 72, textAlign: "center" },
  posts: { gap: 16 },
  foot: { textAlign: "center", paddingHorizontal: 12 },
});
