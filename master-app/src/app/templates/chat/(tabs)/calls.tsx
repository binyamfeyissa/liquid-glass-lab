import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { colors, IconButton } from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import ArrowDownLeft01Icon from "@hugeicons/core-free-icons/ArrowDownLeft01Icon";
import ArrowUpRight01Icon from "@hugeicons/core-free-icons/ArrowUpRight01Icon";
import PhoneIcon from "@hugeicons/core-free-icons/PhoneIcon";

import { useChat, type CallEntry } from "../state";
import { ContactAvatar, Figure, pressedFill, RowSeparator, Screen, SectionTitle, T } from "../ui";

function CallRow({ entry, onPress }: { entry: CallEntry; onPress: () => void }) {
  const chat = useChat();
  const contact = chat.contactById(entry.contactId);
  const kindLabel = entry.kind === "video" ? "Video" : "Voice";
  const timePart = entry.timeLabel.split(" · ")[1] ?? entry.timeLabel;
  const theme = colors[chat.darkMode ? "dark" : "light"];
  const directionColor = entry.missed ? theme.destructive : theme.muted;

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
        <View style={styles.rowSub}>
          <HugeiconsIcon
            icon={entry.direction === "in" ? ArrowDownLeft01Icon : ArrowUpRight01Icon}
            size={14}
            color={directionColor}
          />
          <Figure variant="caption" muted numberOfLines={1}>
            {timePart} · {kindLabel}
          </Figure>
        </View>
      </View>
      <Figure variant="caption" muted>
        {entry.durationLabel}
      </Figure>
      <IconButton
        icon={<HugeiconsIcon icon={PhoneIcon} size={16} color={theme.foreground} />}
        accessibilityLabel={`Call ${contact.name}`}
        isDark={chat.darkMode}
        size="sm"
        onPress={onPress}
      />
    </Pressable>
  );
}

export default function CallsScreen() {
  const chat = useChat();

  // Recents groups by day — "Today", "Yesterday", "Mon", "Sun" — in the
  // order the calls already arrive in (newest first).
  const sections = useMemo(() => {
    const groups: { day: string; entries: CallEntry[] }[] = [];
    for (const entry of chat.calls) {
      const day = entry.timeLabel.split(" · ")[0];
      const last = groups[groups.length - 1];
      if (last && last.day === day) last.entries.push(entry);
      else groups.push({ day, entries: [entry] });
    }
    return groups;
  }, [chat.calls]);

  return (
    <Screen belowTabBar title="Calls" subtitle="Voice and video, newest first">
      {sections.map(({ day, entries }) => (
        <View key={day}>
          <SectionTitle>{day}</SectionTitle>
          {entries.map((entry, index) => (
            <React.Fragment key={entry.id}>
              {index > 0 ? <RowSeparator /> : null}
              <CallRow
                entry={entry}
                onPress={() => router.push(`/templates/chat/call/${entry.contactId}?kind=${entry.kind}`)}
              />
            </React.Fragment>
          ))}
        </View>
      ))}
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
  rowSub: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
});
