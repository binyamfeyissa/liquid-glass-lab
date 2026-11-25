import React from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Card } from "glacia-native";

import { STAGES, useJobs, type ApplicationStatus } from "../state";
import {
  CompanyTile,
  Figure,
  ListCard,
  Screen,
  SectionTitle,
  StatusText,
  T,
  chromeColors,
} from "../ui";
import { salaryLabel } from "../data";

/**
 * Where the application stands, as an index into STAGES. Closed
 * applications remember the stage they reached (`closedAtStage`).
 */
function reachedIndex(status: ApplicationStatus, closedAtStage?: number): number {
  if (status === "Closed") return closedAtStage ?? 0;
  return STAGES.indexOf(status as (typeof STAGES)[number]);
}

export default function ApplicationDetailScreen() {
  const jobs = useJobs();
  const { id } = useLocalSearchParams<{ id: string }>();
  const application = jobs.applications.find((a) => a.id === id);
  const job = application ? jobs.jobById(application.jobId) : undefined;

  if (!application || !job) {
    return (
      <Screen title="Application not found" subtitle="It may have been withdrawn">
        <Button
          accessibilityLabel="Back to applications"
          variant="filled"
          onPress={() => router.replace("/templates/jobs/(tabs)/applications")}
        >
          Back to applications
        </Button>
      </Screen>
    );
  }

  const reached = reachedIndex(application.status, application.closedAtStage);
  const closed = application.status === "Closed";
  const chrome = chromeColors(jobs.backdrop);
  const onAccent = jobs.backdrop === "light" ? "#ffffff" : "#141415";

  return (
    <Screen title={job.title} subtitle={`${job.company} · ${application.appliedLabel}`}>
      {/* Header */}
      <Card isDark={jobs.darkMode} padding={20} contentStyle={styles.headerCard}>
        <View style={styles.headerRow}>
          <CompanyTile company={job.company} size={54} />
          <View style={styles.headerText}>
            <T variant="heading">{job.company}</T>
            <T variant="body" muted>
              {job.location} · {salaryLabel(job)}
            </T>
            <T variant="caption" muted>
              {application.updatedLabel}
            </T>
          </View>
          <StatusText status={application.status} />
        </View>
      </Card>

      {/* Timeline */}
      <View>
        <SectionTitle>Timeline</SectionTitle>
        <ListCard>
          <View style={styles.timeline}>
            {STAGES.map((stage, i) => {
              const done = i < reached || (!closed && i === reached);
              const isCurrent = !closed && i === reached;
              const pending = i > reached;
              const note = application.stageNotes[stage];
              return (
                <View key={stage} style={styles.stepRow}>
                  <View style={styles.stepRail}>
                    <View
                      style={[
                        styles.dot,
                        { backgroundColor: chrome.fill },
                        done && { backgroundColor: chrome.accent },
                        isCurrent && {
                          backgroundColor: "transparent",
                          borderWidth: 2,
                          borderColor: chrome.accent,
                        },
                      ]}
                    >
                      <Figure
                        variant="caption"
                        muted={pending}
                        style={
                          done
                            ? { color: onAccent }
                            : isCurrent
                              ? { color: chrome.accent }
                              : undefined
                        }
                      >
                        {i + 1}
                      </Figure>
                    </View>
                    {i < STAGES.length - 1 ? (
                      <View
                        style={[
                          styles.line,
                          { backgroundColor: chrome.hairline },
                          i < reached && { backgroundColor: chrome.accent },
                        ]}
                      />
                    ) : null}
                  </View>
                  <View style={styles.stepText}>
                    <T variant="body" style={isCurrent ? styles.stepCurrent : undefined}>
                      {stage}
                      {isCurrent ? " · current stage" : ""}
                    </T>
                    {note ? (
                      <T variant="caption" muted>
                        {note}
                      </T>
                    ) : pending ? (
                      <T variant="caption" muted>
                        Not reached yet
                      </T>
                    ) : null}
                  </View>
                </View>
              );
            })}

            {closed ? (
              <View style={styles.stepRow}>
                <View style={styles.stepRail}>
                  <View style={[styles.dot, { backgroundColor: chrome.neg }]}>
                    <T variant="caption" style={{ color: onAccent }}>
                      ✕
                    </T>
                  </View>
                </View>
                <View style={styles.stepText}>
                  <T variant="body">Closed</T>
                  {application.stageNotes.Closed ? (
                    <T variant="caption" muted>
                      {application.stageNotes.Closed}
                    </T>
                  ) : null}
                </View>
              </View>
            ) : null}
          </View>
        </ListCard>
      </View>

      {/* What was sent */}
      <View>
        <SectionTitle>What you sent</SectionTitle>
        <ListCard>
          <View style={styles.sentBody}>
            <T variant="caption" muted>
              Resume
            </T>
            <T variant="body">{application.resume}</T>
            <T variant="caption" muted style={styles.sentLabel}>
              Cover note
            </T>
            <T variant="body">
              {application.coverNote
                ? application.coverNote
                : "No cover note was included"}
            </T>
          </View>
        </ListCard>
      </View>

      <Button
        accessibilityLabel="View the job posting"
        variant="glass"
        onPress={() => router.push(`/templates/jobs/job/${job.id}`)}
      >
        View the job posting
      </Button>
      <Button
        accessibilityLabel="Back to applications"
        variant="ghost"
        onPress={() => router.back()}
      >
        Back
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerCard: { gap: 12 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerText: { flex: 1, gap: 4 },
  timeline: {
    padding: 16,
    gap: 4,
  },
  stepRow: {
    flexDirection: "row",
    gap: 16,
  },
  stepRail: {
    alignItems: "center",
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 16,
    marginVertical: 4,
  },
  stepText: {
    flex: 1,
    paddingBottom: 16,
    gap: 4,
  },
  stepCurrent: { fontWeight: "600" },
  sentBody: {
    padding: 16,
    gap: 4,
  },
  sentLabel: { marginTop: 12 },
});
