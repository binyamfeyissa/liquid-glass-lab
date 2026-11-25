import React from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Card, Chip } from "glacia-native";

import { useJobs } from "../state";
import {
  CompanyTile,
  Figure,
  ListCard,
  MatchScore,
  Screen,
  SectionTitle,
  T,
} from "../ui";
import { postedLabel, salaryLabel } from "../data";

export default function JobDetailScreen() {
  const jobs = useJobs();
  const { id } = useLocalSearchParams<{ id: string }>();
  const job = id ? jobs.jobById(id) : undefined;

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

  const application = jobs.applicationFor(job.id);
  const saved = jobs.isSaved(job.id);

  return (
    <Screen title={job.title} subtitle={`${job.company} · ${job.location}`}>
      {/* Header */}
      <Card isDark={jobs.darkMode} padding={20} contentStyle={styles.headerCard}>
        <View style={styles.headerRow}>
          <CompanyTile company={job.company} size={58} />
          <View style={styles.headerText}>
            <T variant="heading">{job.company}</T>
            <T variant="body" muted>
              {job.location}
            </T>
            <T variant="caption" muted>
              {postedLabel(job)} · {job.applicants} applicants
            </T>
          </View>
        </View>
        <Figure variant="title">
          {salaryLabel(job)}
          <Figure variant="body" muted>
            {" "}
            / year
          </Figure>
        </Figure>
        <View style={styles.metaRow}>
          <T variant="caption" muted>
            {job.type} · {job.mode} · {job.category}
          </T>
          <MatchScore job={job} />
        </View>
      </Card>

      {/* About */}
      <View>
        <SectionTitle>About the role</SectionTitle>
        <ListCard>
          <View style={styles.textBody}>
            <T variant="body">{job.about}</T>
          </View>
        </ListCard>
      </View>

      {/* Responsibilities */}
      <View>
        <SectionTitle>What you'll do</SectionTitle>
        <ListCard>
          <View style={styles.textBody}>
            {job.responsibilities.map((item) => (
              <View key={item} style={styles.bulletRow}>
                <T variant="body">•</T>
                <T variant="body" style={styles.bulletText}>
                  {item}
                </T>
              </View>
            ))}
          </View>
        </ListCard>
      </View>

      {/* Requirements */}
      <View>
        <SectionTitle>What you'll bring</SectionTitle>
        <ListCard>
          <View style={styles.textBody}>
            {job.requirements.map((item) => (
              <View key={item} style={styles.bulletRow}>
                <T variant="body">•</T>
                <T variant="body" style={styles.bulletText}>
                  {item}
                </T>
              </View>
            ))}
          </View>
        </ListCard>
      </View>

      {/* Skills */}
      <View>
        <SectionTitle>Skills for this role</SectionTitle>
        <View style={styles.skillWrap}>
          {job.skills.map((skill) => {
            const mine = jobs.profile.skills.some(
              (s) => s.toLowerCase() === skill.toLowerCase(),
            );
            return (
              <Chip
                key={skill}
                label={skill}
                selected={mine}
                onPress={() => (mine ? jobs.removeSkill(skill) : jobs.addSkill(skill))}
                isDark={jobs.darkMode}
              />
            );
          })}
        </View>
        <T variant="caption" muted style={styles.skillNote}>
          Filled skills are on your profile — tap one to add or remove it
        </T>
      </View>

      {/* Actions */}
      {application ? (
        <Button
          accessibilityLabel="View your application"
          variant="filled"
          onPress={() => router.push(`/templates/jobs/application/${application.id}`)}
        >
          Applied · View application
        </Button>
      ) : (
        <Button
          accessibilityLabel={`Apply to ${job.title}`}
          variant="filled"
          onPress={() => router.push(`/templates/jobs/apply/${job.id}`)}
        >
          Apply now
        </Button>
      )}
      <Button
        accessibilityLabel={saved ? "Remove from saved" : "Save this job"}
        variant="glass"
        onPress={() => jobs.toggleSaved(job.id)}
      >
        {saved ? "Saved — tap to remove" : "Save for later"}
      </Button>
      <Button
        accessibilityLabel="Back"
        variant="ghost"
        onPress={() => router.back()}
      >
        Back
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerCard: { gap: 16 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerText: { flex: 1, gap: 4 },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  textBody: {
    padding: 16,
    gap: 8,
  },
  bulletRow: {
    flexDirection: "row",
    gap: 8,
  },
  bulletText: { flex: 1 },
  skillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillNote: {
    marginTop: 12,
    marginLeft: 4,
  },
});
