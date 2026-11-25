import React from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button } from "glacia-native";

import { useChat } from "../state";
import { ContactAvatar, ListCard, Screen, SectionTitle, T } from "../ui";

export default function ContactProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const chat = useChat();
  const contact = chat.contacts.find((c) => c.id === id);

  if (!contact) {
    return (
      <Screen title="Not found" subtitle="That contact doesn't exist">
        <Button accessibilityLabel="Back" variant="ghost" onPress={() => router.back()}>
          Back
        </Button>
      </Screen>
    );
  }

  return (
    <Screen title={contact.name} subtitle={contact.presenceLabel}>
      <View style={styles.hero}>
        <ContactAvatar contact={contact} size="lg" />
        <T variant="heading" style={styles.heroName}>
          {contact.name}
        </T>
        <T variant="body" muted>
          {contact.handle}
        </T>
      </View>

      <View>
        <SectionTitle>About</SectionTitle>
        <ListCard>
          <View style={styles.aboutBody}>
            <T variant="body">{contact.about}</T>
          </View>
        </ListCard>
      </View>

      <View style={styles.actions}>
        <Button
          accessibilityLabel={`Message ${contact.name}`}
          variant="filled"
          style={styles.actionButton}
          onPress={() => {
            const convId = chat.directConversationFor(contact.id);
            router.replace(`/templates/chat/conversation/${convId}`);
          }}
        >
          Message
        </Button>
        <Button
          accessibilityLabel={`Voice call ${contact.name}`}
          variant="glass"
          style={styles.actionButton}
          onPress={() => router.push(`/templates/chat/call/${contact.id}?kind=voice`)}
        >
          Call
        </Button>
        <Button
          accessibilityLabel={`Video call ${contact.name}`}
          variant="glass"
          style={styles.actionButton}
          onPress={() => router.push(`/templates/chat/call/${contact.id}?kind=video`)}
        >
          Video
        </Button>
      </View>

      <Button accessibilityLabel="Back" variant="ghost" onPress={() => router.back()}>
        Back
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
  },
  heroName: { marginTop: 8 },
  aboutBody: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: { flex: 1 },
});
