import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Alert, Button, Field, Input } from "glacia-native";

import { useAppState } from "./state";
import { Screen, SectionTitle, T } from "./ui";

interface Errors {
  name?: string;
  username?: string;
}

export default function EditProfileScreen() {
  const { profile, saveProfile, glaciaDark } = useAppState();

  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [role, setRole] = useState(profile.role);
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const dirty =
    name !== profile.name ||
    username !== profile.username ||
    bio !== profile.bio ||
    role !== profile.role;

  function handleSave() {
    const nextErrors: Errors = {};
    if (!name.trim()) nextErrors.name = "Your name is required";
    const handle = username.trim().replace(/^@+/, "");
    if (!handle) {
      nextErrors.username = "A username is required";
    } else if (!/^[a-zA-Z0-9_.]+$/.test(handle)) {
      nextErrors.username = "Letters, numbers, dots and underscores only";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    saveProfile({ name: name.trim(), username: handle, bio: bio.trim(), role: role.trim() });
    setUsername(handle);
    setSaved(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setSaved(false), 3000);
  }

  function handleDiscard() {
    setName(profile.name);
    setUsername(profile.username);
    setBio(profile.bio);
    setRole(profile.role);
    setErrors({});
  }

  return (
    <Screen belowTabBar title="Edit profile" subtitle="Edit the details people see.">
      <View>
        <SectionTitle>Public profile</SectionTitle>
        <View style={styles.fields}>
          <Field label="Full name" required error={errors.name} isDark={glaciaDark}>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              invalid={!!errors.name}
              autoCapitalize="words"
              accessibilityLabel="Full name"
              isDark={glaciaDark}
            />
          </Field>

          <Field
            label="Username"
            required
            error={errors.username}
            description={`northwind.app/@${username.trim().replace(/^@+/, "") || "username"}`}
            isDark={glaciaDark}
          >
            <Input
              value={username}
              onChangeText={setUsername}
              placeholder="username"
              invalid={!!errors.username}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              accessibilityLabel="Username"
              isDark={glaciaDark}
            />
          </Field>

          <Field label="Bio" description="A line or two about you." isDark={glaciaDark}>
            <Input
              value={bio}
              onChangeText={setBio}
              placeholder="Tell people what you do"
              multiline
              minLines={3}
              maxLength={160}
              accessibilityLabel="Bio"
              isDark={glaciaDark}
            />
          </Field>

          <Field label="Role" isDark={glaciaDark}>
            <Input
              value={role}
              onChangeText={setRole}
              placeholder="What you do at Northwind"
              autoCapitalize="words"
              accessibilityLabel="Role"
              isDark={glaciaDark}
            />
          </Field>
        </View>
      </View>

      {saved ? (
        <Alert
          tone="success"
          title="Profile saved"
          description="Your changes are live on the Profile screen."
          isDark={glaciaDark}
          onDismiss={() => setSaved(false)}
        />
      ) : null}

      <View style={styles.actions}>
        <Button
          variant="filled"
          isDark={glaciaDark}
          accessibilityLabel="Save changes"
          disabled={!dirty}
          onPress={handleSave}
          style={styles.saveButton}
        >
          {saved ? "Saved" : "Save changes"}
        </Button>
        <Button
          variant="ghost"
          isDark={glaciaDark}
          accessibilityLabel="Discard changes"
          disabled={!dirty}
          onPress={handleDiscard}
        >
          Discard
        </Button>
      </View>

      <T variant="caption" muted>
        Your profile is visible to everyone in your Northwind workspace.
      </T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: 16,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  saveButton: {
    flexGrow: 0,
  },
});
