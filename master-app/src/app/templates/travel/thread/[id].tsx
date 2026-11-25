import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar, Button, Input } from "glacia-native";

import { useTravel, type ChatMsg } from "../state";
import { Message, T, TypingIndicator } from "../ui";

export default function ThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { threads, stayById, sendMessage, markThreadRead, darkMode } = useTravel();
  const thread = threads.find((t) => t.id === id);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<ChatMsg>>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (id) markThreadRead(id);
  }, [id, markThreadRead]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  if (!thread) {
    return (
      <View style={styles.missing}>
        <T variant="title">Conversation not found</T>
        <Button isDark={darkMode} accessibilityLabel="Go back" onPress={() => router.back()}>
          Go back
        </Button>
      </View>
    );
  }

  const stay = stayById(thread.stayId);
  const messages = thread.messages;

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    sendMessage(thread.id, text);
    // The store's simulated reply lands ~1.4s later; show typing meanwhile.
    timers.current.push(setTimeout(() => setTyping(true), 500));
    timers.current.push(setTimeout(() => setTyping(false), 1350));
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <Button
          isDark={darkMode}
          size="sm"
          shape="circle"
          accessibilityLabel="Back to messages"
          onPress={() => router.back()}
        >
          ‹
        </Button>
        <Avatar name={thread.hostName} size="sm" isDark={darkMode} />
        <View style={styles.flex}>
          <T variant="body" numberOfLines={1}>
            {thread.hostName}
          </T>
          <T variant="caption" muted numberOfLines={1}>
            {stay?.title}
          </T>
        </View>
        {stay ? (
          <Button
            isDark={darkMode}
            size="sm"
            accessibilityLabel="View the stay"
            onPress={() => router.push(`/templates/travel/stay/${stay.id}`)}
          >
            View stay
          </Button>
        ) : null}
      </View>

      {/* Thread */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <Message message={item} senderName={thread.hostName} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          listRef.current?.scrollToEnd({ animated: false })
        }
        ListFooterComponent={
          typing ? <TypingIndicator senderName={thread.hostName} /> : undefined
        }
      />

      {/* Composer */}
      <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <View style={styles.flex}>
          <Input
            isDark={darkMode}
            value={draft}
            onChangeText={setDraft}
            placeholder={`Message ${thread.hostName.split(" ")[0]}`}
            accessibilityLabel="Message text"
            returnKeyType="send"
            onSubmitEditing={send}
          />
        </View>
        <Button
          isDark={darkMode}
          variant="filled"
          shape="circle"
          accessibilityLabel="Send message"
          disabled={draft.trim().length === 0}
          onPress={send}
        >
          ↑
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  missing: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  listContent: { paddingVertical: 12, paddingBottom: 8 },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});
