import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";

import { useChat, type CallEntry } from "../state";
import { ContactAvatar, Figure, ListCard, pressedFill, RowSeparator, Screen, T } from "../ui";

function CallRow({ entry, onPress }: { entry: CallEntry; onPress: () => void }) {
  const chat = useChat();
  const contact = chat.contactById(entry.contactId);
  const kindLabel = entry.kind === "video" ? "Video" : "Voice";
  const directionLabel = entry.direction === "in" ? "Incoming" : "Outgoing";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Call ${contact.name} back`}
      style={({ pressed }) => [
        styles.row,
        pressed && { backgroundColor: pressedFill(chat.backdrop) },
      ]}
    >
      <ContactAvatar contact={contact} size="md" />
      <View style={styles.rowText}>
        <T variant="body" destructive={entry.missed} numberOfLines={1}>
          {contact.name}
        </T>
        <Figure variant="caption" muted numberOfLines={1} style={styles.rowSub}>
          {entry.timeLabel} · {kindLabel} · {directionLabel}
        </Figure>
      </View>
      <Figure variant="caption" muted>
        {entry.durationLabel}
      </Figure>
    </Pressable>
  );
}

export default function CallsScreen() {
  const chat = useChat();

  return (
    <Screen belowTabBar title="Calls" subtitle="Voice and video, newest first">
      <ListCard>
        {chat.calls.map((entry, index) => (
          <React.Fragment key={entry.id}>
            {index > 0 ? <RowSeparator /> : null}
            <CallRow
              entry={entry}
              onPress={() => router.push(`/templates/chat/call/${entry.contactId}?kind=${entry.kind}`)}
            />
          </React.Fragment>
        ))}
      </ListCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: 12,
  },
  rowText: { flex: 1 },
  rowSub: { marginTop: 4 },
});
