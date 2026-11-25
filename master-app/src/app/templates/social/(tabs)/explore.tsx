import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Chip, Field, Input } from "glacia-native";

import { ME_ID, useSocial } from "../state";
import { PostCard, SectionTitle, T, pressedFill } from "../ui";

export default function ExploreScreen() {
  const social = useSocial();
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);

  const tags = useMemo(() => {
    const all = social.posts.map((p) => p.tag).filter(Boolean) as string[];
    return Array.from(new Set(all));
  }, [social.posts]);

  const q = query.trim().toLowerCase();

  const people = useMemo(() => {
    if (!q) return social.users.filter((u) => u.id !== ME_ID).slice(0, 4);
    return social.users.filter(
      (u) =>
        u.id !== ME_ID &&
        (u.name.toLowerCase().includes(q) || u.handle.toLowerCase().includes(q)),
    );
  }, [q, social.users]);

  const posts = useMemo(() => {
    let list = social.posts;
    if (tag) list = list.filter((p) => p.tag === tag);
    if (q) {
      list = list.filter(
        (p) =>
          p.text.toLowerCase().includes(q) ||
          (p.tag ?? "").includes(q) ||
          social.userById(p.authorId).name.toLowerCase().includes(q),
      );
    }
    return list;
  }, [q, tag, social.posts, social.userById]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <T variant="title">Explore</T>

      <Field label="Search" isDark={social.darkMode}>
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="People, posts, #tags"
          accessibilityLabel="Search Orbit"
          isDark={social.darkMode}
        />
      </Field>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        <Chip
          label="All tags"
          selected={tag === null}
          onPress={() => setTag(null)}
          isDark={social.darkMode}
        />
        {tags.map((t) => (
          <Chip
            key={t}
            label={`#${t}`}
            selected={tag === t}
            onPress={() => setTag(tag === t ? null : t)}
            isDark={social.darkMode}
          />
        ))}
      </ScrollView>

      {people.length > 0 ? (
        <View>
          <SectionTitle>People</SectionTitle>
          <View style={styles.people}>
            {people.map((user) => (
              <Pressable
                key={user.id}
                onPress={() => router.push(`/templates/social/user/${user.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`${user.name}'s profile`}
                style={({ pressed }) => [
                  styles.person,
                  pressed && { backgroundColor: pressedFill(social.backdrop) },
                ]}
              >
                <Avatar name={user.name} size="md" isDark={social.darkMode} />
                <View style={styles.flex1}>
                  <T variant="body">{user.name}</T>
                  <T variant="caption" muted numberOfLines={1}>
                    {user.handle} · {user.bio}
                  </T>
                </View>
                <T variant="heading" muted>
                  ›
                </T>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <View>
        <SectionTitle>
          {tag ? `Posts in #${tag}` : q ? "Matching posts" : "Trending posts"}
        </SectionTitle>
        {posts.length === 0 ? (
          <T variant="body" muted style={styles.empty}>
            Nothing matches that yet
          </T>
        ) : (
          <View style={styles.posts}>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 32,
    gap: 16,
  },
  flex1: { flex: 1 },
  chips: { gap: 8, paddingRight: 8 },
  people: { gap: 4 },
  person: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  posts: { gap: 16 },
  empty: { paddingHorizontal: 8 },
});
