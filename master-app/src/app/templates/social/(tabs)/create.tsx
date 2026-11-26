import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Badge, Button, Chip, Field, Textarea } from "glacia-native";

import { GRADIENT_NAMES, useSocial } from "../state";
import { Figure, GradientTile, SectionTitle, T, dangerColor } from "../ui";

const MAX_CHARS = 500;

export default function CreateScreen() {
  const social = useSocial();
  const [text, setText] = useState("");
  const [gradient, setGradient] = useState<number | null>(null);
  const [posted, setPosted] = useState(false);

  const remaining = MAX_CHARS - text.length;
  const canPost = text.trim().length > 0 && remaining >= 0;

  const publish = () => {
    if (!canPost) return;
    social.createPost(text, gradient);
    setText("");
    setGradient(null);
    setPosted(true);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <T variant="title">New post</T>

      {posted ? (
        <View style={styles.doneBox}>
          <Badge tone="muted" isDark={social.darkMode}>
            Posted
          </Badge>
          <T variant="body" muted>
            Your post is at the top of the feed
          </T>
          <View style={styles.doneActions}>
            <Button
              isDark={social.darkMode}
              accessibilityLabel="View feed"
              variant="filled"
              onPress={() => {
                setPosted(false);
                router.push("/templates/social/(tabs)/index");
              }}
            >
              View feed
            </Button>
            <Button
              isDark={social.darkMode}
              accessibilityLabel="Write another post"
              onPress={() => setPosted(false)}
            >
              Write another
            </Button>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.authorRow}>
            <Avatar name={social.me.name} source={social.me.image} size="md" isDark={social.darkMode} />
            <View>
              <T variant="body">{social.me.name}</T>
              <T variant="caption" muted>
                {social.me.handle} · Posting to everyone
              </T>
            </View>
          </View>

          <Field
            label="Your post"
            error={
              remaining < 0
                ? `${Math.abs(remaining)} characters over the limit`
                : undefined
            }
            isDark={social.darkMode}
          >
            <Textarea
              value={text}
              onChangeText={setText}
              placeholder="Write your post — add a #tag to file it"
              accessibilityLabel="Post text"
              rows={5}
              isDark={social.darkMode}
            />
          </Field>
          <Figure
            variant="caption"
            muted={remaining >= 0}
            style={{
              textAlign: "right",
              ...(remaining < 0
                ? { color: dangerColor(social.backdrop) }
                : null),
            }}
          >
            {remaining} characters left
          </Figure>

          <View>
            <SectionTitle>Media tile</SectionTitle>
            <View style={styles.chips}>
              <Chip
                label="None"
                selected={gradient === null}
                onPress={() => setGradient(null)}
                isDark={social.darkMode}
              />
              {GRADIENT_NAMES.map((name, i) => (
                <Chip
                  key={name}
                  label={name}
                  selected={gradient === i}
                  onPress={() => setGradient(i)}
                  isDark={social.darkMode}
                />
              ))}
            </View>
            {gradient !== null ? (
              <View style={styles.preview}>
                <GradientTile
                  gradient={gradient}
                  label={text.trim().split(" ").slice(0, 2).join(" ") || "New post"}
                  height={150}
                  radius={16}
                />
              </View>
            ) : null}
          </View>

          <Button
            isDark={social.darkMode}
            accessibilityLabel="Publish post"
            variant="filled"
            disabled={!canPost}
            onPress={publish}
          >
            Post
          </Button>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 112,
    paddingBottom: 32,
    gap: 16,
  },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  preview: { marginTop: 12 },
  doneBox: { gap: 12, alignItems: "flex-start" },
  doneActions: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
});
