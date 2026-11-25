import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Card, Field, Input, Select, Textarea } from "glacia-native";

import { useJobs } from "../state";
import { CompanyTile, ListCard, Screen, SectionTitle, T } from "../ui";
import { RESUMES, salaryLabel } from "../data";

type Step = "form" | "review" | "done";
const NOTE_LIMIT = 600;

export default function ApplyScreen() {
  const jobs = useJobs();
  const { id } = useLocalSearchParams<{ id: string }>();
  const job = id ? jobs.jobById(id) : undefined;

  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState(jobs.profile.name);
  const [email, setEmail] = useState(jobs.profile.email);
  const [note, setNote] = useState("");
  const [resume, setResume] = useState(RESUMES[0]);
  const [error, setError] = useState<string | undefined>();
  const [applicationId, setApplicationId] = useState<string | null>(null);

  if (!job) {
    return (
      <Screen title="Job not found" subtitle="This posting may have been filled or removed">
        <Button
          accessibilityLabel="Back to jobs"
          variant="filled"
          onPress={() => router.replace("/templates/jobs/(tabs)")}
        >
          Back to jobs
        </Button>
      </Screen>
    );
  }

  const existing = jobs.applicationFor(job.id);

  const validate = (): boolean => {
    if (name.trim().length < 2) {
      setError("Enter your full name");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address");
      return false;
    }
    if (note.length > NOTE_LIMIT) {
      setError(`Cover note is ${note.length - NOTE_LIMIT} characters over the limit`);
      return false;
    }
    setError(undefined);
    return true;
  };

  const submit = () => {
    const app = jobs.apply(job.id, note, resume);
    setApplicationId(app.id);
    setStep("done");
  };

  /* Already applied — don't let a second application through. */
  if (existing && step === "form") {
    return (
      <Screen title="Already applied" subtitle={`You applied to ${job.title} at ${job.company}`}>
        <Card isDark={jobs.darkMode} padding={20} contentStyle={styles.centerCard}>
          <T variant="heading">Status: {existing.status}</T>
          <T variant="body" muted style={styles.centerText}>
            {existing.appliedLabel} · Follow its progress on the application timeline
          </T>
        </Card>
        <Button
          accessibilityLabel="View your application"
          variant="filled"
          onPress={() => router.replace(`/templates/jobs/application/${existing.id}`)}
        >
          View application
        </Button>
        <Button accessibilityLabel="Back to job" variant="ghost" onPress={() => router.back()}>
          Back to job
        </Button>
      </Screen>
    );
  }

  if (step === "done") {
    return (
      <Screen title="Application sent" subtitle="What happens next">
        <Card isDark={jobs.darkMode} padding={20} contentStyle={styles.centerCard}>
          <T variant="heading">
            Applied to {job.title}
          </T>
          <T variant="body" muted style={styles.centerText}>
            Your application is in the Applications tab at status Applied — the
            timeline there tracks it from here
          </T>
        </Card>
        <Button
          accessibilityLabel="View my application"
          variant="filled"
          onPress={() =>
            applicationId
              ? router.replace(`/templates/jobs/application/${applicationId}`)
              : router.replace("/templates/jobs/(tabs)/applications")
          }
        >
          View my application
        </Button>
        <Button
          accessibilityLabel="Keep browsing jobs"
          variant="ghost"
          onPress={() => router.replace("/templates/jobs/(tabs)")}
        >
          Keep browsing
        </Button>
      </Screen>
    );
  }

  if (step === "review") {
    return (
      <Screen title="Review and send" subtitle="One last look before it goes to the hiring team">
        <ListCard>
          <View style={styles.reviewBody}>
            <View style={styles.reviewHead}>
              <CompanyTile company={job.company} size={44} />
              <View style={styles.reviewHeadText}>
                <T variant="body" style={styles.bold}>
                  {job.title}
                </T>
                <T variant="caption" muted>
                  {job.company} · {salaryLabel(job)}
                </T>
              </View>
            </View>
            <View style={styles.reviewRow}>
              <T variant="caption" muted>
                Applying as
              </T>
              <T variant="body">
                {name.trim()} · {email.trim()}
              </T>
            </View>
            <View style={styles.reviewRow}>
              <T variant="caption" muted>
                Resume
              </T>
              <T variant="body">{resume}</T>
            </View>
            <View style={styles.reviewRow}>
              <T variant="caption" muted>
                Cover note
              </T>
              <T variant="body">
                {note.trim() ? note.trim() : "No cover note"}
              </T>
            </View>
          </View>
        </ListCard>
        <Button accessibilityLabel="Submit application" variant="filled" onPress={submit}>
          Submit application
        </Button>
        <Button
          accessibilityLabel="Back to edit application"
          variant="ghost"
          onPress={() => setStep("form")}
        >
          Back and edit
        </Button>
      </Screen>
    );
  }

  return (
    <Screen
      title="Apply"
      subtitle={`${job.title} · ${job.company} · ${salaryLabel(job)}`}
    >
      <Field label="Full name" isDark={jobs.darkMode}>
        <Input
          value={name}
          onChangeText={setName}
          accessibilityLabel="Full name"
          isDark={jobs.darkMode}
        />
      </Field>

      <Field label="Email" error={error} isDark={jobs.darkMode}>
        <Input
          value={email}
          onChangeText={setEmail}
          accessibilityLabel="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          invalid={!!error}
          isDark={jobs.darkMode}
        />
      </Field>

      <Field label="Resume" isDark={jobs.darkMode}>
        <Select
          value={resume}
          onValueChange={setResume}
          options={RESUMES.map((r) => ({ value: r, label: r }))}
          accessibilityLabel="Resume"
          isDark={jobs.darkMode}
        />
      </Field>

      <View>
        <SectionTitle>Cover note (optional)</SectionTitle>
        <Field
          label={`${note.length} / ${NOTE_LIMIT} characters`}
          isDark={jobs.darkMode}
        >
          <Textarea
            value={note}
            onChangeText={setNote}
            placeholder="Two or three sentences on why this role, why you"
            accessibilityLabel="Cover note"
            rows={5}
            isDark={jobs.darkMode}
          />
        </Field>
      </View>

      <Button
        accessibilityLabel="Review application"
        variant="filled"
        onPress={() => {
          if (validate()) setStep("review");
        }}
      >
        Review application
      </Button>
      <Button accessibilityLabel="Cancel application" variant="ghost" onPress={() => router.back()}>
        Cancel
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centerCard: { alignItems: "center", gap: 8 },
  centerText: { textAlign: "center" },
  reviewBody: {
    padding: 16,
    gap: 16,
  },
  reviewHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  reviewHeadText: { flex: 1, gap: 4 },
  reviewRow: { gap: 4 },
  bold: { fontWeight: "600" },
});
