import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Field, Input, Switch, Toast } from "glacia-native";

import { useChat } from "../state";
import { BackdropControl, HeroPhoto, ListCard, Screen, SectionTitle, SettingRow, T } from "../ui";

export default function ProfileScreen() {
  const chat = useChat();
  const [statusDraft, setStatusDraft] = useState(chat.myStatus);
  const [savedToast, setSavedToast] = useState(false);
  const dirty = statusDraft.trim() !== chat.myStatus;

  const saveStatus = () => {
    if (!statusDraft.trim()) return;
    chat.setMyStatus(statusDraft.trim());
    setSavedToast(true);
  };

  return (
    <Screen belowTabBar title="Profile" subtitle="Name, status and settings">
      <View style={styles.hero}>
        <HeroPhoto image={chat.me.image} name={chat.me.name} size={96} />
        <T variant="heading" style={styles.heroName}>
          {chat.me.name}
        </T>
        <T variant="body" muted>
          {chat.me.handle}
        </T>
        <T variant="caption" muted style={styles.heroStatus}>
          {chat.myStatus}
        </T>
      </View>

      <View>
        <SectionTitle>Status</SectionTitle>
        <ListCard>
          <View style={styles.statusForm}>
            <Field label="Your status line" isDark={chat.darkMode}>
              <Input
                value={statusDraft}
                onChangeText={setStatusDraft}
                placeholder="Add a status line"
                accessibilityLabel="Your status line"
                isDark={chat.darkMode}
              />
            </Field>
            <Button
              isDark={chat.darkMode}
              accessibilityLabel="Save status"
              variant="filled"
              disabled={!dirty || !statusDraft.trim()}
              onPress={saveStatus}
            >
              Save status
            </Button>
          </View>
        </ListCard>
      </View>

      <View>
        <SectionTitle>Background</SectionTitle>
        <ListCard>
          <View style={styles.backdropBody}>
            <BackdropControl />
            <T variant="caption" muted style={styles.backdropNote}>
              Dark gray, broken white, or the palm photo — the glass sits over all three
            </T>
          </View>
        </ListCard>
      </View>

      <View>
        <SectionTitle>Notifications</SectionTitle>
        <ListCard>
          <SettingRow
            title="Message notifications"
            description="Banners for new messages and calls"
          >
            <Switch
              value={chat.notifications}
              onValueChange={chat.setNotifications}
              accessibilityLabel="Message notifications"
              isDark={chat.darkMode}
            />
          </SettingRow>
        </ListCard>
      </View>

      <View>
        <SectionTitle>Privacy</SectionTitle>
        <ListCard>
          <SettingRow
            title="Read receipts"
            description="Let people see when you've read their messages"
          >
            <Switch
              value={chat.readReceipts}
              onValueChange={chat.setReadReceipts}
              accessibilityLabel="Read receipts"
              isDark={chat.darkMode}
            />
          </SettingRow>
          <SettingRow
            title="Share last seen"
            description="Contacts can see when you were last active"
          >
            <Switch
              value={chat.showLastSeen}
              onValueChange={chat.setShowLastSeen}
              accessibilityLabel="Share last seen"
              isDark={chat.darkMode}
            />
          </SettingRow>
        </ListCard>
      </View>

      <Toast
        visible={savedToast}
        message="Status saved"
        onDismiss={() => setSavedToast(false)}
        isDark={chat.darkMode}
        edge="top"
      />
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
  heroStatus: { marginTop: 4 },
  statusForm: {
    padding: 16,
    gap: 12,
  },
  backdropBody: {
    padding: 16,
    gap: 12,
  },
  backdropNote: {
    textAlign: "center",
  },
});
