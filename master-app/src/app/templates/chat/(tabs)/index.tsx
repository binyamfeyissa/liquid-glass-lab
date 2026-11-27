import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { colors, Avatar, IconButton, Input } from "glacia-native";
import { Plus, Users } from "lucide-react-native";

import { useChat, type Conversation } from "../state";
import { accentColor, ContactAvatar, Figure, pressedFill, T } from "../ui";

function ConversationRow({
  conversation,
  onPress,
}: {
  conversation: Conversation;
  onPress: () => void;
}) {
  const chat = useChat();
  const last = chat.lastMessageOf(conversation.id);
  const title = chat.titleOf(conversation);

  const preview = useMemo(() => {
    if (!last) return "No messages yet";
    if (last.senderId === "me") return `You: ${last.text}`;
    if (conversation.kind === "group") {
      return `${chat.contactById(last.senderId).name.split(" ")[0]}: ${last.text}`;
    }
    return last.text;
  }, [chat, conversation.kind, last]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}${conversation.unread ? `, ${conversation.unread} unread` : ""}`}
      style={({ pressed }) => [
        styles.row,
        pressed && { backgroundColor: pressedFill(chat.backdrop) },
      ]}
    >
      {conversation.kind === "direct" ? (
        <ContactAvatar contact={chat.contactById(conversation.contactId ?? "")} size="lg" />
      ) : (
        <Avatar name={title} size="lg" isDark={chat.darkMode} />
      )}
      <View style={styles.rowText}>
        <T variant="body" numberOfLines={1}>
          {title}
        </T>
        <T
          variant="caption"
          muted={conversation.unread === 0}
          numberOfLines={1}
          style={styles.rowPreview}
        >
          {preview}
        </T>
      </View>
      <View style={styles.rowMeta}>
        {last ? (
          <Figure
            variant="caption"
            numberOfLines={1}
            muted={conversation.unread === 0}
            style={
              conversation.unread > 0
                ? { color: accentColor(chat.backdrop) }
                : undefined
            }
          >
            {last.dayLabel === "Today" ? last.timeLabel : last.dayLabel}
          </Figure>
        ) : null}
        {conversation.unread > 0 ? (
          <Figure
            variant="caption"
            numberOfLines={1}
            style={{ color: accentColor(chat.backdrop) }}
          >
            {conversation.unread} unread
          </Figure>
        ) : null}
      </View>
    </Pressable>
  );
}

export default function ChatsScreen() {
  const chat = useChat();
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chat.conversations;
    return chat.conversations.filter((c) => {
      if (chat.titleOf(c).toLowerCase().includes(q)) return true;
      const last = chat.lastMessageOf(c.id);
      return last ? last.text.toLowerCase().includes(q) : false;
    });
  }, [chat, query]);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <T variant="title">Relay</T>
          <View style={styles.headerActions}>
            <IconButton
              icon={<Users size={16} color={colors[chat.darkMode ? "dark" : "light"].foreground} />}
              accessibilityLabel="Create a group"
              isDark={chat.darkMode}
              onPress={() => router.push("/templates/chat/new-group")}
            />
            <IconButton
              icon={<Plus size={16} color={colors[chat.darkMode ? "dark" : "light"].foreground} />}
              accessibilityLabel="New chat"
              isDark={chat.darkMode}
              onPress={() => router.push("/templates/chat/new-chat")}
            />
          </View>
        </View>
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Search chats"
          accessibilityLabel="Search chats"
          isDark={chat.darkMode}
          style={styles.search}
        />
      </View>

      <FlatList
        data={visible}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => (
          <ConversationRow
            conversation={item}
            onPress={() => router.push(`/templates/chat/conversation/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <T variant="body" muted style={styles.empty}>
            No chats match “{query}”
          </T>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 112,
    gap: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerGlyph: {
    textAlign: "center",
  },
  search: {},
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 128,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  rowText: { flex: 1 },
  rowPreview: { marginTop: 4 },
  rowMeta: {
    alignItems: "flex-end",
    gap: 4,
    // Wide enough for a mono time ("10:02 AM") — the column never
    // squeezes the figure into wrapping.
    minWidth: 64,
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
  },
});
