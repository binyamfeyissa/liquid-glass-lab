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
import * as Clipboard from "expo-clipboard";
import {
  colors,
  ActionSheet,
  Avatar,
  IconButton,
  Input,
  Separator,
  Toast,
} from "glacia-native";
import { ArrowUp, ChevronLeft, Phone, Video } from "lucide-react-native";

import { useChat, type ChatMessage } from "../state";
import { ContactAvatar, DaySeparator, Message, T, TypingIndicator } from "../ui";

type ListItem =
  | { type: "day"; key: string; label: string }
  | { type: "message"; key: string; message: ChatMessage };

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const chat = useChat();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState("");
  const [selected, setSelected] = useState<ChatMessage | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const listRef = useRef<FlatList<ListItem>>(null);

  const conversation = chat.conversationById(id ?? "");
  const messages = chat.messagesOf(id ?? "");
  const typing = chat.typingIn === id;

  useEffect(() => {
    if (id) chat.markRead(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, messages.length]);

  const items = useMemo<ListItem[]>(() => {
    const out: ListItem[] = [];
    let lastDay = "";
    for (const message of messages) {
      if (message.dayLabel !== lastDay) {
        out.push({ type: "day", key: `day-${message.dayLabel}`, label: message.dayLabel });
        lastDay = message.dayLabel;
      }
      out.push({ type: "message", key: message.id, message });
    }
    return out;
  }, [messages]);

  if (!conversation) {
    return (
      <View style={styles.missing}>
        <T variant="heading">Conversation not found</T>
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <T variant="body" muted style={styles.backLink}>
            Back to chats
          </T>
        </Pressable>
      </View>
    );
  }

  const title = chat.titleOf(conversation);
  const isGroup = conversation.kind === "group";
  const contact = !isGroup ? chat.contactById(conversation.contactId ?? "") : null;
  const subtitle = isGroup
    ? conversation.memberIds.map((m) => chat.contactById(m).name.split(" ")[0]).join(", ")
    : (contact?.presenceLabel ?? "");
  const typingName = isGroup
    ? chat.contactById(conversation.memberIds[0]).name
    : (contact?.name ?? "");

  const send = () => {
    if (!draft.trim()) return;
    chat.sendMessage(conversation.id, draft);
    setDraft("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <IconButton
          icon={<ChevronLeft size={20} color={colors[chat.darkMode ? "dark" : "light"].foreground} />}
          accessibilityLabel="Back"
          isDark={chat.darkMode}
          onPress={() => router.back()}
        />
        <Pressable
          style={styles.headerTitle}
          disabled={isGroup}
          onPress={() => contact && router.push(`/templates/chat/contact/${contact.id}`)}
          accessibilityRole="button"
          accessibilityLabel={isGroup ? title : `View ${title}'s profile`}
        >
          {contact ? (
            <ContactAvatar contact={contact} size="md" />
          ) : (
            <Avatar name={title} size="md" isDark={chat.darkMode} />
          )}
          <View style={styles.headerText}>
            <T variant="body" numberOfLines={1}>
              {title}
            </T>
            <T variant="caption" muted numberOfLines={1}>
              {typing ? "typing…" : subtitle}
            </T>
          </View>
        </Pressable>
        {contact ? (
          <>
            <IconButton
              icon={<Phone size={16} color={colors[chat.darkMode ? "dark" : "light"].foreground} />}
              accessibilityLabel={`Voice call ${contact.name}`}
              isDark={chat.darkMode}
              onPress={() => router.push(`/templates/chat/call/${contact.id}?kind=voice`)}
            />
            <IconButton
              icon={<Video size={16} color={colors[chat.darkMode ? "dark" : "light"].foreground} />}
              accessibilityLabel={`Video call ${contact.name}`}
              isDark={chat.darkMode}
              onPress={() => router.push(`/templates/chat/call/${contact.id}?kind=video`)}
            />
          </>
        ) : null}
      </View>
      <Separator isDark={chat.darkMode} />

      {/* Thread */}
      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) =>
          item.type === "day" ? (
            <DaySeparator label={item.label} />
          ) : (
            <Message
              message={item.message}
              senderName={
                item.message.senderId === "me"
                  ? chat.me.name
                  : chat.contactById(item.message.senderId).name
              }
              showSenderName={isGroup}
              onLongPress={() => setSelected(item.message)}
            />
          )
        }
        contentContainerStyle={styles.threadContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          listRef.current?.scrollToEnd({ animated: true })
        }
        ListFooterComponent={
          typing ? <TypingIndicator senderName={typingName} /> : undefined
        }
      />

      {/* Composer */}
      <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.composerInput}>
          <Input
            value={draft}
            onChangeText={setDraft}
            placeholder="Message"
            accessibilityLabel="Message"
            multiline
            minLines={1}
            returnKeyType="send"
            onSubmitEditing={send}
            isDark={chat.darkMode}
          />
        </View>
        <IconButton
          icon={<ArrowUp size={20} color={colors[chat.darkMode ? "dark" : "light"].foreground} />}
          accessibilityLabel="Send message"
          isDark={chat.darkMode}
          disabled={!draft.trim()}
          onPress={send}
        />
      </View>

      {/* Message actions */}
      <ActionSheet
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={selected ? `${selected.text.slice(0, 40)}${selected.text.length > 40 ? "…" : ""}` : undefined}
        isDark={chat.darkMode}
        options={[
          {
            label: "Copy",
            onPress: () => {
              if (selected) {
                void Clipboard.setStringAsync(selected.text);
                setToastVisible(true);
              }
              setSelected(null);
            },
          },
          {
            label: "Delete",
            destructive: true,
            onPress: () => {
              if (selected) chat.deleteMessage(conversation.id, selected.id);
              setSelected(null);
            },
          },
        ]}
      />

      <Toast
        visible={toastVisible}
        message="Copied to clipboard"
        onDismiss={() => setToastVisible(false)}
        isDark={chat.darkMode}
        edge="top"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  missing: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  backLink: { textDecorationLine: "underline" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  headerTitle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerText: { flex: 1 },
  threadContent: {
    paddingBottom: 12,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  composerInput: { flex: 1 },
});
