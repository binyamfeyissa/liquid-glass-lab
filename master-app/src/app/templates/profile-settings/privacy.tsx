import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Alert, Button, Field, Input, Switch } from "glacia-native";

import { useAppState } from "./state";
import {
  Figure,
  ListCard,
  RowSeparator,
  Screen,
  SectionTitle,
  SettingRow,
  StatusDot,
  T,
  accentColor,
} from "./ui";

interface PasswordErrors {
  current?: string;
  next?: string;
  confirm?: string;
}

export default function PrivacyScreen() {
  const {
    twoFactor,
    setTwoFactor,
    sessions,
    revokeSession,
    revokeAllOtherSessions,
    glaciaDark,
    backdrop,
  } = useAppState();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [revokedName, setRevokedName] = useState<string | null>(null);

  function handleChangePassword() {
    const nextErrors: PasswordErrors = {};
    if (!current) nextErrors.current = "Enter your current password";
    if (next.length < 8) nextErrors.next = "Use at least 8 characters";
    if (confirm !== next) nextErrors.confirm = "Passwords do not match";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setCurrent("");
    setNext("");
    setConfirm("");
    setPasswordSaved(true);
  }

  function handleRevoke(id: string, device: string) {
    revokeSession(id);
    setRevokedName(device);
  }

  const otherSessions = sessions.filter((s) => !s.current);

  return (
    <Screen title="Privacy & security" subtitle="Password, two-factor, and where you are signed in.">
      {/* Change password */}
      <View>
        <SectionTitle>Change password</SectionTitle>
        <View style={styles.fields}>
          <Field label="Current password" required error={errors.current} isDark={glaciaDark}>
            <Input
              value={current}
              onChangeText={setCurrent}
              placeholder="Your current password"
              secureTextEntry
              invalid={!!errors.current}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Current password"
              isDark={glaciaDark}
            />
          </Field>
          <Field
            label="New password"
            required
            error={errors.next}
            description="At least 8 characters."
            isDark={glaciaDark}
          >
            <Input
              value={next}
              onChangeText={setNext}
              placeholder="A new password"
              secureTextEntry
              invalid={!!errors.next}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="New password"
              isDark={glaciaDark}
            />
          </Field>
          <Field label="Confirm new password" required error={errors.confirm} isDark={glaciaDark}>
            <Input
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Repeat the new password"
              secureTextEntry
              invalid={!!errors.confirm}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Confirm new password"
              isDark={glaciaDark}
            />
          </Field>
        </View>
        {passwordSaved ? (
          <Alert
            tone="success"
            title="Password changed"
            description="Use the new password next time you sign in."
            isDark={glaciaDark}
            onDismiss={() => setPasswordSaved(false)}
            style={styles.alert}
          />
        ) : null}
        <Button
          variant="filled"
          isDark={glaciaDark}
          accessibilityLabel="Change password"
          onPress={handleChangePassword}
          style={styles.changeButton}
        >
          Change password
        </Button>
      </View>

      {/* Two-factor */}
      <View>
        <SectionTitle>Two-factor authentication</SectionTitle>
        <ListCard>
          <SettingRow
            title="Authenticator app"
            description={
              twoFactor
                ? "On — a code is required when you sign in on a new device."
                : "Off — your password alone signs you in."
            }
          >
            <Switch
              value={twoFactor}
              onValueChange={setTwoFactor}
              accessibilityLabel="Two-factor authentication"
              isDark={glaciaDark}
            />
          </SettingRow>
        </ListCard>
      </View>

      {/* Sessions */}
      <View>
        <SectionTitle>Active sessions</SectionTitle>
        {revokedName ? (
          <Alert
            tone="info"
            title="Session revoked"
            description={`${revokedName} will need to sign in again.`}
            isDark={glaciaDark}
            onDismiss={() => setRevokedName(null)}
            style={styles.alertBottom}
          />
        ) : null}
        <ListCard>
          {sessions.map((session, i) => (
            <React.Fragment key={session.id}>
              <View style={styles.sessionRow}>
                <View style={styles.sessionText}>
                  <T variant="body">{session.device}</T>
                  <View style={styles.sessionMeta}>
                    <T variant="caption" muted>
                      {session.location} ·
                    </T>
                    <Figure variant="caption" muted>
                      {session.lastActive}
                    </Figure>
                  </View>
                </View>
                {session.current ? (
                  <View style={styles.statusRow}>
                    <StatusDot color={accentColor(backdrop)} />
                    <T variant="caption" muted>
                      This device
                    </T>
                  </View>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    isDark={glaciaDark}
                    accessibilityLabel={`Revoke ${session.device}`}
                    onPress={() => handleRevoke(session.id, session.device)}
                  >
                    Revoke
                  </Button>
                )}
              </View>
              {i < sessions.length - 1 ? <RowSeparator /> : null}
            </React.Fragment>
          ))}
        </ListCard>
        <Button
          variant="ghost"
          isDark={glaciaDark}
          accessibilityLabel="Sign out everywhere else"
          disabled={otherSessions.length === 0}
          onPress={() => {
            revokeAllOtherSessions();
            setRevokedName("All other devices");
          }}
          style={styles.signOutButton}
        >
          Sign out everywhere else
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: 16,
  },
  alert: {
    marginTop: 16,
  },
  alertBottom: {
    marginBottom: 12,
  },
  changeButton: {
    marginTop: 16,
    alignSelf: "flex-start",
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  sessionText: {
    flex: 1,
    gap: 4,
  },
  sessionMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  signOutButton: {
    marginTop: 16,
    alignSelf: "flex-start",
  },
});
