import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Button } from "glacia-native";

import { useSocial } from "./state";
import {
  Figure,
  ListCard,
  RowSeparator,
  T,
  accentColor,
  pressedFill,
} from "./ui";

export default function MessagesScreen() {
  const social = useSocial();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Button isDark={social.darkMode} accessibilityLabel="Back" variant="ghost" onPress={() => router.back()}>
        Back
      </Button>
      <T variant="title">Messages</T>

      <ListCard>
        {social.conversations.map((conv, i) => {
          const user = social.userById(conv.userId);
          const last = conv.messages[conv.messages.length - 1];
          return (
            <React.Fragment key={conv.id}>
              {i > 0 ? <RowSeparator /> : null}
              <Pressable
                onPress={() => {
                  social.openConversation(conv.id);
                  router.push(`/templates/social/thread/${conv.id}`);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Conversation with ${user.name}`}
                style={({ pressed }) => [
                  styles.row,
                  pressed && { backgroundColor: pressedFill(social.backdrop) },
                ]}
              >
                <Avatar name={user.name} source={user.image} size="md" isDark={social.darkMode} />
                <View style={styles.flex1}>
                  <View style={styles.nameRow}>
                    <T variant="body">{user.name}</T>
                    {last ? (
                      <Figure variant="caption" muted>
                        {last.timeLabel}
                      </Figure>
                    ) : null}
                  </View>
                  <T variant="caption" muted numberOfLines={1}>
                    {last
                      ? `${last.fromMe ? "You: " : ""}${last.text}`
                      : "No messages yet"}
                  </T>
                </View>
                {conv.unread > 0 ? (
                  <Figure
                    variant="caption"
                    style={{ color: accentColor(social.backdrop) }}
                  >
                    {conv.unread} unread
                  </Figure>
                ) : null}
              </Pressable>
            </React.Fragment>
          );
        })}
      </ListCard>

      <T variant="caption" muted style={styles.foot}>
        New conversations start from a profile or a post
      </T>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  foot: { textAlign: "center" },
});
