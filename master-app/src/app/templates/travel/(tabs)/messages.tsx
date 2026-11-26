import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Badge } from "glacia-native";

import { hostImageByName, useTravel, type Thread } from "../state";
import { Figure, ListCard, RowSeparator, Screen, T } from "../ui";

export default function MessagesScreen() {
  const { threads } = useTravel();

  return (
    <Screen title="Messages" subtitle="Chats with hosts">
      <ListCard>
        {threads.map((thread, i) => (
          <View key={thread.id}>
            {i > 0 ? <RowSeparator /> : null}
            <ThreadRow thread={thread} />
          </View>
        ))}
      </ListCard>
    </Screen>
  );
}

function ThreadRow({ thread }: { thread: Thread }) {
  const { stayById, destinationById, darkMode } = useTravel();
  const stay = stayById(thread.stayId);
  const dest = stay ? destinationById(stay.destinationId) : undefined;
  const last = thread.messages[thread.messages.length - 1];

  return (
    <Pressable
      onPress={() => router.push(`/templates/travel/thread/${thread.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`Chat with ${thread.hostName} about ${stay?.title ?? "a stay"}`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Avatar name={thread.hostName} source={hostImageByName(thread.hostName)} size="md" isDark={darkMode} />
      <View style={styles.flex}>
        <View style={styles.titleRow}>
          <T variant="body" style={styles.flex} numberOfLines={1}>
            {thread.hostName}
          </T>
          <Figure variant="caption" muted>
            {last?.timeLabel ?? ""}
          </Figure>
        </View>
        <T variant="caption" muted numberOfLines={1}>
          {stay?.title} · {dest?.city}
        </T>
        <T
          variant="caption"
          muted={thread.unread === 0}
          numberOfLines={1}
          style={thread.unread > 0 ? styles.unreadText : undefined}
        >
          {last ? `${last.senderId === "me" ? "You: " : ""}${last.text}` : ""}
        </T>
      </View>
      {thread.unread > 0 ? (
        <Badge tone="muted" isDark={darkMode}>
          {thread.unread}
        </Badge>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  pressed: { backgroundColor: "rgba(127,127,127,0.14)" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  unreadText: { fontWeight: "600" },
});
