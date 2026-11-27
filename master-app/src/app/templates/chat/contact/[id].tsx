import React from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { colors, Button, IconButton } from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Message01Icon from "@hugeicons/core-free-icons/Message01Icon";
import PhoneIcon from "@hugeicons/core-free-icons/PhoneIcon";
import Video01Icon from "@hugeicons/core-free-icons/Video01Icon";

import { useChat } from "../state";
import { accentColor, HeroPhoto, ListCard, Screen, SectionTitle, T } from "../ui";

export default function ContactProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const chat = useChat();
  const contact = chat.contacts.find((c) => c.id === id);

  if (!contact) {
    return (
      <Screen title="Not found" subtitle="That contact doesn't exist">
        <Button accessibilityLabel="Back" variant="ghost" onPress={() => router.back()} isDark={chat.darkMode}>
          Back
        </Button>
      </Screen>
    );
  }

  const theme = colors[chat.darkMode ? "dark" : "light"];
  const message = () => {
    const convId = chat.directConversationFor(contact.id);
    router.replace(`/templates/chat/conversation/${convId}`);
  };

  return (
    <Screen title={contact.name} subtitle={contact.presenceLabel}>
      <View style={styles.hero}>
        <HeroPhoto image={contact.image} name={contact.name} size={96} />
        <T variant="heading" style={styles.heroName}>
          {contact.name}
        </T>
        <T variant="body" muted>
          {contact.handle}
        </T>
      </View>

      {/* Contacts-style action row: one solid accent circle for the
          primary action (message), glass circles for call and video. */}
      <View style={styles.actions}>
        <View style={styles.action}>
          <IconButton
            icon={({ color, size }: { color: string; size: number }) => (
              <HugeiconsIcon icon={Message01Icon} size={size} color={color} />
            )}
            accessibilityLabel={`Message ${contact.name}`}
            isDark={chat.darkMode}
            size="lg"
            tint={accentColor(chat.backdrop)}
            onPress={message}
          />
          <T variant="caption" muted>
            Message
          </T>
        </View>
        <View style={styles.action}>
          <IconButton
            icon={<HugeiconsIcon icon={PhoneIcon} size={20} color={theme.foreground} />}
            accessibilityLabel={`Voice call ${contact.name}`}
            isDark={chat.darkMode}
            size="lg"
            onPress={() => router.push(`/templates/chat/call/${contact.id}?kind=voice`)}
          />
          <T variant="caption" muted>
            Call
          </T>
        </View>
        <View style={styles.action}>
          <IconButton
            icon={<HugeiconsIcon icon={Video01Icon} size={20} color={theme.foreground} />}
            accessibilityLabel={`Video call ${contact.name}`}
            isDark={chat.darkMode}
            size="lg"
            onPress={() => router.push(`/templates/chat/call/${contact.id}?kind=video`)}
          />
          <T variant="caption" muted>
            Video
          </T>
        </View>
      </View>

      <View>
        <SectionTitle>About</SectionTitle>
        <ListCard>
          <View style={styles.aboutBody}>
            <T variant="body">{contact.about}</T>
          </View>
        </ListCard>
      </View>

      <Button accessibilityLabel="Back" variant="ghost" onPress={() => router.back()} isDark={chat.darkMode}>
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
    justifyContent: "center",
    gap: 32,
  },
  action: {
    alignItems: "center",
    gap: 8,
  },
});
