import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Avatar, Button, Field, Input } from "glacia-native";

import { useSocial, type Message } from "../state";
import { Figure, T, bubbleTint, raisedFill } from "../ui";

/**
 * Chat bubbles are composed locally from plain views — glacia-native 0.6.0
 * does not export a Message family (verified in the published package), so
 * the bubble, alignment and timestamp are built here on Glacia colours.
 */
function Bubble({ message }: { message: Message }) {
  const { backdrop } = useSocial();
  return (
    <View
      style={[
        styles.bubbleRow,
        message.fromMe ? styles.bubbleRowMine : styles.bubbleRowTheirs,
      ]}
    >
      <View
        style={[
          styles.bubble,
          message.fromMe
            ? { backgroundColor: bubbleTint(backdrop), borderBottomRightRadius: 6 }
            : { backgroundColor: raisedFill(backdrop) },
        ]}
      >
        <T variant="body" style={message.fromMe ? styles.bubbleTextMine : undefined}>
          {message.text}
        </T>
        <Figure
          variant="caption"
          muted={!message.fromMe}
          style={{
            marginTop: 4,
            fontSize: 11,
            ...(message.fromMe ? { color: "rgba(255,255,255,0.75)" } : null),
          }}
        >
          {message.timeLabel}
        </Figure>
      </View>
    </View>
  );
}

export default function ThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const social = useSocial();
  const [draft, setDraft] = useState("");
  // RN 0.88's ScrollView ref typing is awkward; the instance is only used
  // for scrollToEnd, so the ref is kept untyped.
  const scrollRef = useRef<any>(null);
  const conversation = social.conversationById(id ?? "");

  useEffect(() => {
    if (conversation) social.openConversation(conversation.id);
    // Only on mount: opening a thread clears its unread badge.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(
      () => scrollRef.current?.scrollToEnd({ animated: true }),
      60,
    );
    return () => clearTimeout(t);
  }, [conversation?.messages.length]);

  if (!conversation) {
    return (
      <View style={styles.missing}>
        <T variant="heading">Conversation not found</T>
        <T variant="body" muted style={styles.missingText}>
          This conversation could not be found
        </T>
        <Button isDark={social.darkMode} accessibilityLabel="Back" variant="glass" onPress={() => router.back()}>
          Back
        </Button>
      </View>
    );
  }

  const user = social.userById(conversation.userId);

  const send = () => {
    if (!draft.trim()) return;
    social.sendMessage(conversation.id, draft);
    setDraft("");
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Button isDark={social.darkMode} accessibilityLabel="Back" variant="ghost" onPress={() => router.back()}>
          Back
        </Button>
        <PressableHeader userId={user.id} name={user.name} handle={user.handle} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.flex1}
        contentContainerStyle={styles.thread}
        showsVerticalScrollIndicator={false}
      >
        {conversation.messages.length === 0 ? (
          <T variant="body" muted style={styles.empty}>
            No messages yet
          </T>
        ) : (
          conversation.messages.map((m) => <Bubble key={m.id} message={m} />)
        )}
      </ScrollView>

      <View style={styles.composer}>
        <View style={styles.flex1}>
          <Field label={`Message ${user.name.split(" ")[0]}`} isDark={social.darkMode}>
            <Input
              value={draft}
              onChangeText={setDraft}
              placeholder="Type a message"
              accessibilityLabel="Message text"
              isDark={social.darkMode}
            />
          </Field>
        </View>
        <Button
          isDark={social.darkMode}
          accessibilityLabel="Send message"
          variant="filled"
          disabled={!draft.trim()}
          onPress={send}
        >
          Send
        </Button>
      </View>
    </View>
  );
}

function PressableHeader({
  userId,
  name,
  handle,
}: {
  userId: string;
  name: string;
  handle: string;
}) {
  const { darkMode } = useSocial();
  return (
    <View style={styles.headerMain}>
      <Avatar name={name} size="md" isDark={darkMode} />
      <View>
        <T variant="body">{name}</T>
        <T variant="caption" muted>
          {handle}
        </T>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  root: { flex: 1, paddingTop: 56 },
  missing: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  missingText: { textAlign: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerMain: { flexDirection: "row", alignItems: "center", gap: 12 },
  thread: { paddingHorizontal: 24, paddingVertical: 12, gap: 8 },
  empty: { textAlign: "center", marginTop: 40 },
  bubbleRow: { flexDirection: "row" },
  bubbleRowMine: { justifyContent: "flex-end" },
  bubbleRowTheirs: { justifyContent: "flex-start" },
  bubble: {
    maxWidth: "78%",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bubbleTextMine: { color: "#ffffff" },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
});
