import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, Input } from "glacia-native";

import { useChat, type Contact } from "./state";
import { ContactAvatar, ListCard, pressedFill, RowSeparator, Screen, T } from "./ui";

function PickerRow({ contact, onPress }: { contact: Contact; onPress: () => void }) {
  const chat = useChat();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Chat with ${contact.name}`}
      style={({ pressed }) => [
        styles.row,
        pressed && { backgroundColor: pressedFill(chat.backdrop) },
      ]}
    >
      <ContactAvatar contact={contact} size="md" />
      <View style={styles.rowText}>
        <T variant="body" numberOfLines={1}>
          {contact.name}
        </T>
        <T variant="caption" muted numberOfLines={1} style={styles.rowSub}>
          {contact.about}
        </T>
      </View>
    </Pressable>
  );
}

export default function NewChatScreen() {
  const chat = useChat();
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chat.contacts;
    return chat.contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q),
    );
  }, [chat.contacts, query]);

  return (
    <Screen title="New chat" subtitle={`${chat.contacts.length} people on Relay`}>
      <Input
        value={query}
        onChangeText={setQuery}
        placeholder="Search contacts"
        accessibilityLabel="Search contacts"
        isDark={chat.darkMode}
      />
      <Button
        isDark={chat.darkMode}
        accessibilityLabel="Create a group instead"
        variant="glass"
        onPress={() => router.replace("/templates/chat/new-group")}
      >
        Create a group instead
      </Button>
      {visible.length > 0 ? (
        <ListCard>
          {visible.map((contact, index) => (
            <React.Fragment key={contact.id}>
              {index > 0 ? <RowSeparator /> : null}
              <PickerRow
                contact={contact}
                onPress={() => {
                  const convId = chat.directConversationFor(contact.id);
                  router.replace(`/templates/chat/conversation/${convId}`);
                }}
              />
            </React.Fragment>
          ))}
        </ListCard>
      ) : (
        <T variant="body" muted style={styles.empty}>
          No contacts match “{query}”
        </T>
      )}
      <Button accessibilityLabel="Cancel" variant="ghost" onPress={() => router.back()} isDark={chat.darkMode}>
        Cancel
      </Button>
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
  empty: {
    textAlign: "center",
    marginTop: 12,
  },
});
