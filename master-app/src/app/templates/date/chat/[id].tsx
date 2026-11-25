import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar, Button, Input } from "glacia-native";

import { profileById, useKindred, type ChatMessage } from "../state";
import { Figure, MessageBubble, T } from "../ui";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const kindred = useKindred();
  const insets = useSafeAreaInsets();
  const profile = profileById(id ?? "");
  const messages = kindred.chats[profile.id] ?? [];
  const [draft, setDraft] = useState("");
  const listRef = useRef<FlatList<ChatMessage>>(null);

  // Opening the conversation clears its "New" badge on the Matches tab.
  useEffect(() => {
    kindred.markMatchSeen(profile.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.id]);

  useEffect(() => {
    if (messages.length === 0) return;
    const t = setTimeout(
      () => listRef.current?.scrollToEnd({ animated: true }),
      60,
    );
    return () => clearTimeout(t);
  }, [messages.length]);

  const send = () => {
    if (!draft.trim()) return;
    kindred.sendMessage(profile.id, draft);
    setDraft("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back to matches"
          style={styles.backButton}
        >
          <T variant="heading">‹</T>
        </Pressable>
        <Avatar name={profile.name} size="md" isDark={kindred.darkMode} />
        <View style={styles.headerText}>
          <View style={styles.headerNameRow}>
            <T variant="heading">{profile.name}</T>
            <Figure variant="heading" muted>
              {profile.age}
            </Figure>
          </View>
          <Figure variant="caption" muted>
            {profile.job} · {profile.distanceKm} km away
          </Figure>
        </View>
      </View>

      <FlatList
        ref={listRef}
        style={styles.thread}
        contentContainerStyle={styles.threadContent}
        showsVerticalScrollIndicator={false}
        data={messages}
        keyExtractor={(message) => message.id}
        renderItem={({ item }) => (
          <MessageBubble message={item} senderName={profile.name} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyThread}>
            <T variant="heading" style={styles.emptyTitle}>
              You matched with {profile.name}
            </T>
            <T variant="body" muted style={styles.emptyBody}>
              {profile.bio}
            </T>
            <T variant="caption" muted>
              Ask about something from their profile
            </T>
          </View>
        }
      />

      <View
        style={[
          styles.composer,
          { paddingBottom: Math.max(insets.bottom, 10) },
        ]}
      >
        <View style={styles.composerInput}>
          <Input
            value={draft}
            onChangeText={setDraft}
            placeholder={`Message ${profile.name}`}
            accessibilityLabel={`Message ${profile.name}`}
            returnKeyType="send"
            onSubmitEditing={send}
            isDark={kindred.darkMode}
          />
        </View>
        <Button
          accessibilityLabel="Send message"
          variant="filled"
          disabled={!draft.trim()}
          onPress={send}
        >
          Send
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: { flex: 1, gap: 4 },
  headerNameRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  thread: { flex: 1 },
  threadContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  emptyThread: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 36,
    paddingHorizontal: 12,
  },
  emptyTitle: { textAlign: "center" },
  emptyBody: { textAlign: "center", lineHeight: 22 },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  composerInput: { flex: 1 },
});
