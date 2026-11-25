import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Badge, Button, Field, Input } from "glacia-native";

import { useChat, type Contact } from "./state";
import { ContactAvatar, ListCard, RowSeparator, Screen, SectionTitle, selectedFill, T } from "./ui";

function MemberRow({
  contact,
  selected,
  onToggle,
}: {
  contact: Contact;
  selected: boolean;
  onToggle: () => void;
}) {
  const chat = useChat();
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityLabel={`${selected ? "Remove" : "Add"} ${contact.name}`}
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.row,
        selected && { backgroundColor: selectedFill(chat.backdrop) },
        pressed && { opacity: 0.85 },
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
      {selected ? (
        <Badge tone="muted" isDark={chat.darkMode}>
          Added
        </Badge>
      ) : null}
    </Pressable>
  );
}

export default function NewGroupScreen() {
  const chat = useChat();
  const [name, setName] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | undefined>();

  const toggle = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const canCreate = name.trim().length > 0 && selectedIds.length >= 2;

  const create = () => {
    if (!name.trim()) {
      setError("Give the group a name");
      return;
    }
    if (selectedIds.length < 2) {
      setError("Pick at least two people for a group");
      return;
    }
    setError(undefined);
    const id = chat.createGroup(name, selectedIds);
    router.replace(`/templates/chat/conversation/${id}`);
  };

  const selectedNames = useMemo(
    () =>
      selectedIds
        .map((id) => chat.contactById(id).name.split(" ")[0])
        .join(", "),
    [chat, selectedIds],
  );

  return (
    <Screen
      title="New group"
      subtitle={
        selectedIds.length
          ? `${selectedIds.length} selected: ${selectedNames}`
          : "Name the group, then pick at least two people"
      }
    >
      <Field label="Group name" error={error} isDark={chat.darkMode}>
        <Input
          value={name}
          onChangeText={setName}
          placeholder="Book Club"
          accessibilityLabel="Group name"
          invalid={!!error && !name.trim()}
          isDark={chat.darkMode}
        />
      </Field>

      <View>
        <SectionTitle>Members</SectionTitle>
        <ListCard>
          {chat.contacts.map((contact, index) => (
            <React.Fragment key={contact.id}>
              {index > 0 ? <RowSeparator /> : null}
              <MemberRow
                contact={contact}
                selected={selectedIds.includes(contact.id)}
                onToggle={() => toggle(contact.id)}
              />
            </React.Fragment>
          ))}
        </ListCard>
      </View>

      <Button
        accessibilityLabel="Create group"
        variant="filled"
        disabled={!canCreate}
        onPress={create}
      >
        Create group
      </Button>
      <Button accessibilityLabel="Cancel" variant="ghost" onPress={() => router.back()}>
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
});
