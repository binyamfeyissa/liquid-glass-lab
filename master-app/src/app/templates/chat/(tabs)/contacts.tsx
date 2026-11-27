import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { colors, Input } from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Search01Icon from "@hugeicons/core-free-icons/Search01Icon";
import { useChat, type Contact } from "../state";
import { ContactAvatar, pressedFill, RowSeparator, Screen, SectionTitle, T } from "../ui";

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

  // Apple Contacts groups by first letter; the groups follow the filter.
  const sections = useMemo(() => {
    const map = new Map<string, Contact[]>();
    for (const contact of visible) {
      const key = contact.name.charAt(0).toUpperCase();
      const list = map.get(key) ?? [];
      list.push(contact);
      map.set(key, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [visible]);

  return (
    <Screen belowTabBar title="Contacts" subtitle={`${chat.contacts.length} people on Relay`}>
      <Input
        value={query}
        onChangeText={setQuery}
        placeholder="Search contacts"
        accessibilityLabel="Search contacts"
        isDark={chat.darkMode}
        prefix={
          <HugeiconsIcon
            icon={Search01Icon}
            size={16}
            color={colors[chat.darkMode ? "dark" : "light"].muted}
          />
        }
      />
      {visible.length > 0 ? (
        sections.map(([letter, contacts]) => (
          <View key={letter}>
            <SectionTitle>{letter}</SectionTitle>
            {contacts.map((contact, index) => (
              <React.Fragment key={contact.id}>
                {index > 0 ? <RowSeparator /> : null}
                <ContactRow
                  contact={contact}
                  onPress={() => router.push(`/templates/chat/contact/${contact.id}`)}
                />
              </React.Fragment>
            ))}
          </View>
        ))
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
    gap: 12,
  },
  rowText: { flex: 1 },
  rowSub: { marginTop: 4 },
  empty: {
    textAlign: "center",
    marginTop: 12,
  },
});
