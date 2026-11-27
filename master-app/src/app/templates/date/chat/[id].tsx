import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { colors, Avatar, IconButton, Input, Separator } from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import ArrowUp01Icon from "@hugeicons/core-free-icons/ArrowUp01Icon";
import ChevronLeftIcon from "@hugeicons/core-free-icons/ChevronLeftIcon";
import { profileById, useKindred, type ChatMessage } from "../state";
import { accentColor, Figure, Message, T } from "../ui";

interface RunItem {
  message: ChatMessage;
  isFirstInRun: boolean;
  isLastInRun: boolean;
  isLastOverall: boolean;
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const kindred = useKindred();
  const insets = useSafeAreaInsets();
  const profile = profileById(id ?? "");
  const messages = kindred.chats[profile.id] ?? [];
  const [draft, setDraft] = useState("");
  const listRef = useRef<FlatList<RunItem>>(null);

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

  // Runs: consecutive messages from one sender. The run flags decide
  // where the avatar, the tail corner, and the timestamp land.
  const items = useMemo(
    () =>
      messages.map((message, index) => {
        const prev = messages[index - 1];
        const next = messages[index + 1];
        return {
          message,
          isFirstInRun: !prev || prev.senderId !== message.senderId,
          isLastInRun:
            !next || next.senderId !== message.senderId,
          isLastOverall: index === messages.length - 1,
        };
      }),
    [messages],
  );

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
          <HugeiconsIcon icon={ChevronLeftIcon} size={20} color={colors[kindred.darkMode ? "dark" : "light"].foreground} />
        </Pressable>
        <Avatar name={profile.name} size="md" isDark={kindred.darkMode} source={profile.image} />
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
      <Separator isDark={kindred.darkMode} />

      <FlatList
        ref={listRef}
        style={styles.thread}
        contentContainerStyle={styles.threadContent}
        showsVerticalScrollIndicator={false}
        data={items}
        keyExtractor={(item) => item.message.id}
        renderItem={({ item }) => (
          <Message
            message={item.message}
            senderName={profile.name}
            senderImage={profile.image}
            isFirstInRun={item.isFirstInRun}
            isLastInRun={item.isLastInRun}
            isLastOverall={item.isLastOverall}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyThread}>
            <Avatar
              name={profile.name}
              size="lg"
              isDark={kindred.darkMode}
              source={profile.image}
            />
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

      {/* Composer — the send button is a solid accent circle (IconButton
          tint), white arrow, dimmed while the draft is empty: the
          Messages pattern, not another glass disc. */}
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
            multiline
            minLines={1}
            returnKeyType="send"
            onSubmitEditing={send}
            isDark={kindred.darkMode}
          />
        </View>
        <IconButton
          icon={({ color, size }: { color: string; size: number }) => (
            <HugeiconsIcon icon={ArrowUp01Icon} size={size} color={color} />
          )}
          accessibilityLabel="Send message"
          isDark={kindred.darkMode}
          tint={draft.trim() ? accentColor(kindred.backdrop) : undefined}
          disabled={!draft.trim()}
          onPress={send}
        />
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
