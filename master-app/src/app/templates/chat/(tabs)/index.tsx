import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { colors, Button, IconButton, Input } from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Edit02Icon from "@hugeicons/core-free-icons/Edit02Icon";
import Search01Icon from "@hugeicons/core-free-icons/Search01Icon";
import UserGroupIcon from "@hugeicons/core-free-icons/UserGroupIcon";
import { useChat, type Conversation } from "../state";
import { accentColor, ContactAvatar, Figure, GroupAvatar, pressedFill, RowSeparator, T } from "../ui";

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
  const unread = conversation.unread > 0;

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
      accessibilityLabel={`${title}${unread ? `, ${conversation.unread} unread` : ""}`}
      style={({ pressed }) => [
        styles.row,
        pressed && { backgroundColor: pressedFill(chat.backdrop) },
      ]}
    >
      {/* Unread dot, Apple Messages style: a small accent dot in the
          margin left of the avatar. It is absolutely positioned so read
          rows keep the exact same avatar alignment. */}
      {unread ? (
        <View
          style={[styles.unreadDot, { backgroundColor: accentColor(chat.backdrop) }]}
        />
      ) : null}
      {conversation.kind === "direct" ? (
        <ContactAvatar contact={chat.contactById(conversation.contactId ?? "")} size="lg" />
      ) : (
        <GroupAvatar memberIds={conversation.memberIds} />
      )}
      <View style={styles.rowText}>
        <T
          variant="body"
          numberOfLines={1}
          style={unread ? styles.rowNameUnread : undefined}
        >
          {title}
        </T>
        <T
          variant="caption"
          muted={!unread}
          numberOfLines={1}
          style={styles.rowPreview}
        >
          {preview}
        </T>
      </View>
      <View style={styles.rowMeta}>
        {last ? (
          <Figure variant="caption" muted numberOfLines={1}>
            {last.dayLabel === "Today" ? last.timeLabel : last.dayLabel}
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
              icon={<HugeiconsIcon icon={UserGroupIcon} size={16} color={colors[chat.darkMode ? "dark" : "light"].foreground} />}
              accessibilityLabel="Create a group"
              isDark={chat.darkMode}
              onPress={() => router.push("/templates/chat/new-group")}
            />
            <IconButton
              icon={<HugeiconsIcon icon={Edit02Icon} size={16} color={colors[chat.darkMode ? "dark" : "light"].foreground} />}
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
          prefix={
            <HugeiconsIcon
              icon={Search01Icon}
              size={16}
              color={colors[chat.darkMode ? "dark" : "light"].muted}
            />
          }
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
        ItemSeparatorComponent={() => <RowSeparator inset={68} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          query.trim() ? (
            <View style={styles.empty}>
              <T variant="body">No results</T>
              <T variant="caption" muted style={styles.emptySub}>
                No chats match “{query.trim()}”
              </T>
            </View>
          ) : (
            <View style={styles.empty}>
              <T variant="body">No conversations yet</T>
              <T variant="caption" muted style={styles.emptySub}>
                Start a chat with someone on Relay
              </T>
              <Button
                isDark={chat.darkMode}
                accessibilityLabel="Start a new chat"
                variant="glass"
                onPress={() => router.push("/templates/chat/new-chat")}
              >
                New chat
              </Button>
            </View>
          )
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
  unreadDot: {
    position: "absolute",
    left: 2,
    top: "50%",
    marginTop: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  rowText: { flex: 1 },
  rowNameUnread: { fontWeight: "600" },
  rowPreview: { marginTop: 4 },
  rowMeta: {
    alignItems: "flex-end",
    // Wide enough for a mono time ("10:02 AM") — the column never
    // squeezes the figure into wrapping.
    minWidth: 64,
  },
  empty: {
    alignItems: "center",
    gap: 8,
    marginTop: 48,
    paddingHorizontal: 32,
  },
  emptySub: {
    textAlign: "center",
  },
});
