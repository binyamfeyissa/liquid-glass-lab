import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Avatar,
  Button,
  colors,
  Field,
  IconButton,
  Input,
} from "glacia-native";
import { Heart } from "lucide-react-native";

import { useSocial, type Comment } from "../state";
import {
  Figure,
  ListCard,
  PostCard,
  RowSeparator,
  SectionTitle,
  T,
  accentColor,
  compact,
} from "../ui";

function CommentRow({ comment }: { comment: Comment }) {
  const social = useSocial();
  const author = social.userById(comment.authorId);
  const liked = social.isCommentLiked(comment.id);

  return (
    <View style={styles.commentRow}>
      <Avatar name={author.name} size="sm" isDark={social.darkMode} />
      <View style={styles.flex1}>
        <View style={styles.commentHead}>
          <T variant="body">{author.name}</T>
          <Figure variant="caption" muted>
            {comment.timeLabel}
          </Figure>
        </View>
        <T variant="body" style={styles.commentText}>
          {comment.text}
        </T>
        <View style={styles.commentLike}>
          <IconButton
            accessibilityLabel={liked ? "Unlike comment" : "Like comment"}
            onPress={() => social.toggleCommentLike(comment.id)}
            isDark={social.darkMode}
            size="sm"
            icon={
              <Heart
                size={16}
                color={liked ? accentColor(social.backdrop) : social.darkMode ? colors.dark.foreground : colors.light.foreground}
                fill={liked ? accentColor(social.backdrop) : "transparent"}
              />
            }
          />
          <Figure variant="caption" muted>
            {compact(social.commentLikeCountOf(comment))}
          </Figure>
        </View>
      </View>
    </View>
  );
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const social = useSocial();
  const [draft, setDraft] = useState("");
  const post = social.postById(id ?? "");

  if (!post) {
    return (
      <View style={styles.missing}>
        <T variant="heading">Post not found</T>
        <T variant="body" muted style={styles.missingText}>
          It may have been removed
        </T>
        <Button isDark={social.darkMode} accessibilityLabel="Back" variant="glass" onPress={() => router.back()}>
          Back
        </Button>
      </View>
    );
  }

  const comments = social.commentsFor(post.id);

  const submit = () => {
    if (!draft.trim()) return;
    social.addComment(post.id, draft);
    setDraft("");
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Button isDark={social.darkMode} accessibilityLabel="Back" variant="ghost" onPress={() => router.back()}>
        Back
      </Button>

      <PostCard post={post} preview />

      <View>
        <SectionTitle>Comments · {comments.length}</SectionTitle>
        {comments.length === 0 ? (
          <T variant="body" muted>
            No comments yet
          </T>
        ) : (
          <ListCard>
            {comments.map((comment, i) => (
              <React.Fragment key={comment.id}>
                {i > 0 ? <RowSeparator /> : null}
                <CommentRow comment={comment} />
              </React.Fragment>
            ))}
          </ListCard>
        )}
      </View>

      <View style={styles.composer}>
        <Field label="Add a comment" isDark={social.darkMode}>
          <Input
            value={draft}
            onChangeText={setDraft}
            placeholder="Be kind, be specific"
            accessibilityLabel="Comment text"
            isDark={social.darkMode}
          />
        </Field>
        <Button
          isDark={social.darkMode}
          accessibilityLabel="Post comment"
          variant="filled"
          disabled={!draft.trim()}
          onPress={submit}
        >
          Reply
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 112,
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
  commentRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  commentHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  commentText: { marginTop: 4, lineHeight: 21 },
  commentLike: {
    marginTop: 8,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  composer: { gap: 12 },
});
