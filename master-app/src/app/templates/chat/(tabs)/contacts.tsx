import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { colors, Input } from "glacia-native";
import { ChevronRight } from "lucide-react-native";

import { useChat, type Contact } from "../state";
import { ContactAvatar, ListCard, pressedFill, RowSeparator, Screen, T } from "../ui";

function ContactRow({ contact, onPress }: { contact: Contact; onPress: () => void }) {
  const chat = useChat();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View ${contact.name}`}
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
          {contact.presenceLabel}
        </T>
      </View>
      <ChevronRight size={20} color={colors[chat.darkMode ? "dark" : "light"].muted} />
    </Pressable>
  );
}

export default function ContactsScreen() {
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
    <Screen title="Contacts" subtitle={`${chat.contacts.length} people on Relay`}>
      <Input
        value={query}
        onChangeText={setQuery}
        placeholder="Search contacts"
        accessibilityLabel="Search contacts"
        isDark={chat.darkMode}
      />
      {visible.length > 0 ? (
        <ListCard>
          {visible.map((contact, index) => (
            <React.Fragment key={contact.id}>
              {index > 0 ? <RowSeparator /> : null}
              <ContactRow
                contact={contact}
                onPress={() => router.push(`/templates/chat/contact/${contact.id}`)}
              />
            </React.Fragment>
          ))}
        </ListCard>
      ) : (
        <T variant="body" muted style={styles.empty}>
          No contacts match “{query}”
        </T>
      )}
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
