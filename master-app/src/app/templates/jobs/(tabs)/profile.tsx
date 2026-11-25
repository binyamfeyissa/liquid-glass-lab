import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Badge, Button, Chip, Field, Input, Switch } from "glacia-native";

import { useJobs } from "../state";
import {
  BackdropControl,
  ListCard,
  RowSeparator,
  Screen,
  SectionTitle,
  SettingRow,
  T,
} from "../ui";
import { ALL_SKILLS } from "../data";

export default function ProfileScreen() {
  const jobs = useJobs();
  const p = jobs.profile;

  const [name, setName] = useState(p.name);
  const [email, setEmail] = useState(p.email);
  const [title, setTitle] = useState(p.title);
  const [location, setLocation] = useState(p.location);
  const [error, setError] = useState<string | undefined>();
  const [savedNote, setSavedNote] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  const suggestions = ALL_SKILLS.filter(
    (s) => !p.skills.some((mine) => mine.toLowerCase() === s.toLowerCase()),
  );

  const saveDetails = () => {
    if (name.trim().length < 2) {
      setError("Enter your full name");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address");
      return;
    }
    if (title.trim().length < 2) {
      setError("Enter your current or target job title");
      return;
    }
    setError(undefined);
    jobs.updateProfile({
      name: name.trim(),
      email: email.trim(),
      title: title.trim(),
      location: location.trim(),
    });
    setSavedNote(true);
  };

  const dirty =
    name !== p.name || email !== p.email || title !== p.title || location !== p.location;

  return (
    <Screen title="Profile" subtitle="Your candidate profile">
      {/* Header */}
      <View style={styles.header}>
        <Avatar name={p.name} size="lg" isDark={jobs.darkMode} />
        <View style={styles.headerText}>
          <T variant="heading">{p.name}</T>
          <T variant="body" muted>
            {p.title}
          </T>
          <T variant="caption" muted>
            {p.location} · {p.yearsExperience} years of experience
          </T>
        </View>
      </View>

      {/* Details form */}
      <View>
        <SectionTitle>Details</SectionTitle>
        <View style={styles.form}>
          <Field label="Full name" isDark={jobs.darkMode}>
            <Input
              value={name}
              onChangeText={(v) => {
                setName(v);
                setSavedNote(false);
              }}
              accessibilityLabel="Full name"
              isDark={jobs.darkMode}
            />
          </Field>
          <Field label="Email" error={error} isDark={jobs.darkMode}>
            <Input
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setSavedNote(false);
              }}
              accessibilityLabel="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              invalid={!!error}
              isDark={jobs.darkMode}
            />
          </Field>
          <Field label="Job title" isDark={jobs.darkMode}>
            <Input
              value={title}
              onChangeText={(v) => {
                setTitle(v);
                setSavedNote(false);
              }}
              accessibilityLabel="Job title"
              isDark={jobs.darkMode}
            />
          </Field>
          <Field label="Location" isDark={jobs.darkMode}>
            <Input
              value={location}
              onChangeText={(v) => {
                setLocation(v);
                setSavedNote(false);
              }}
              accessibilityLabel="Location"
              isDark={jobs.darkMode}
            />
          </Field>
          <Button
            isDark={jobs.darkMode}
            accessibilityLabel="Save profile details"
            variant="filled"
            onPress={saveDetails}
          >
            Save details
          </Button>
          {savedNote && !dirty ? (
            <Badge tone="muted" isDark={jobs.darkMode} style={styles.savedBadge}>
              Profile saved
            </Badge>
          ) : null}
        </View>
      </View>

      {/* Skills editor — these feed the match score everywhere. */}
      <View>
        <SectionTitle>Skills · {p.skills.length}</SectionTitle>
        <ListCard style={styles.skillsCard}>
          <View style={styles.skillChips}>
            {p.skills.map((skill) => (
              <Chip
                key={skill}
                label={skill}
                selected
                onPress={() => jobs.removeSkill(skill)}
                isDark={jobs.darkMode}
              />
            ))}
            {p.skills.length === 0 ? (
              <T variant="body" muted>
                No skills yet — add some below and job matches will start scoring
              </T>
            ) : null}
          </View>
          <View style={styles.addRow}>
            <View style={styles.addInput}>
              <Input
                value={newSkill}
                onChangeText={setNewSkill}
                placeholder="Add a skill"
                accessibilityLabel="New skill"
                isDark={jobs.darkMode}
                onSubmitEditing={() => {
                  jobs.addSkill(newSkill);
                  setNewSkill("");
                }}
              />
            </View>
            <Button
              isDark={jobs.darkMode}
              accessibilityLabel="Add skill"
              variant="filled"
              onPress={() => {
                jobs.addSkill(newSkill);
                setNewSkill("");
              }}
            >
              Add
            </Button>
          </View>
          <T variant="caption" muted>
            Tap a skill to remove it — suggestions:
          </T>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {suggestions.map((s) => (
              <Chip
                key={s}
                label={s}
                onPress={() => jobs.addSkill(s)}
                isDark={jobs.darkMode}
              />
            ))}
          </ScrollView>
        </ListCard>
      </View>

      {/* Experience summary */}
      <View>
        <SectionTitle>Experience</SectionTitle>
        <ListCard>
          <View style={styles.expBody}>
            <T variant="body" style={styles.expRole}>
              Senior Product Engineer — Brightstack (2022 – now)
            </T>
            <T variant="body" muted>
              Owns the customer-facing React Native app; shipped the offline mode
              used by 40k field workers.
            </T>
            <RowSeparator />
            <T variant="body" style={styles.expRole}>
              Frontend Engineer — Loopwire (2019 – 2022)
            </T>
            <T variant="body" muted>
              Built the component library and checkout flow for a B2B SaaS
              dashboard suite.
            </T>
          </View>
        </ListCard>
      </View>

      {/* Background — the three backgrounds */}
      <View>
        <SectionTitle>Background</SectionTitle>
        <ListCard>
          <View style={styles.backdropBody}>
            <BackdropControl />
            <T variant="caption" muted>
              Dark gray, broken white, or the palm photo — the glass sits over all three
            </T>
          </View>
        </ListCard>
      </View>

      {/* App settings */}
      <View>
        <SectionTitle>App</SectionTitle>
        <ListCard>
          <SettingRow
            title="New matching jobs"
            description="Alert when a posting scores 75% or higher"
          >
            <Switch
              value={jobs.alertsNewJobs}
              onValueChange={jobs.setAlertsNewJobs}
              accessibilityLabel="New matching jobs alerts"
              isDark={jobs.darkMode}
            />
          </SettingRow>
          <RowSeparator />
          <SettingRow
            title="Application updates"
            description="Status changes on jobs you've applied to"
          >
            <Switch
              value={jobs.alertsStatusChanges}
              onValueChange={jobs.setAlertsStatusChanges}
              accessibilityLabel="Application update alerts"
              isDark={jobs.darkMode}
            />
          </SettingRow>
          <RowSeparator />
          <SettingRow
            title="Weekly digest"
            description="One email each Monday with fresh matches"
          >
            <Switch
              value={jobs.alertsDigest}
              onValueChange={jobs.setAlertsDigest}
              accessibilityLabel="Weekly digest"
              isDark={jobs.darkMode}
            />
          </SettingRow>
        </ListCard>
      </View>

      <T variant="caption" muted style={styles.foot}>
        Northbound · Template build — your profile never leaves this device.
      </T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerText: { flex: 1, gap: 4 },
  form: { gap: 16 },
  savedBadge: { alignSelf: "flex-start" },
  skillsCard: { padding: 16, gap: 16 },
  skillChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  backdropBody: { padding: 16, gap: 12 },
  addRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  addInput: { flex: 1 },
  chips: {
    gap: 8,
    paddingRight: 4,
  },
  expBody: {
    padding: 16,
    gap: 8,
  },
  expRole: { fontWeight: "600" },
  foot: { textAlign: "center" },
});
