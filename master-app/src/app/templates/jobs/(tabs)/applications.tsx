import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button } from "glacia-native";

import { useJobs } from "../state";
import {
  CompanyTile,
  ListCard,
  Screen,
  SectionTitle,
  StatusText,
  T,
  chromeColors,
} from "../ui";

export default function ApplicationsScreen() {
  const jobs = useJobs();
  const active = jobs.applications.filter((a) => a.status !== "Closed");
  const closed = jobs.applications.filter((a) => a.status === "Closed");

  const renderList = (apps: typeof jobs.applications) => (
    <ListCard>
      {apps.map((app, i) => {
        const job = jobs.jobById(app.jobId);
        if (!job) return null;
        return (
          <Pressable
            key={app.id}
            onPress={() => router.push(`/templates/jobs/application/${app.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`${job.title} at ${job.company}, status ${app.status}`}
            style={({ pressed }) => [
              styles.row,
              i > 0 && {
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: chromeColors(jobs.backdrop).hairline,
              },
              pressed && {
                backgroundColor: chromeColors(jobs.backdrop).pressed,
              },
            ]}
          >
            <CompanyTile company={job.company} size={42} />
            <View style={styles.rowText}>
              <T variant="body" numberOfLines={1} style={styles.rowTitle}>
                {job.title}
              </T>
              <T variant="caption" muted>
                {job.company} · {app.appliedLabel}
              </T>
              <T variant="caption" muted>
                {app.updatedLabel}
              </T>
            </View>
            <StatusText status={app.status} />
          </Pressable>
        );
      })}
    </ListCard>
  );

  return (
    <Screen
      title="Applications"
      subtitle="Every application and where it stands"
    >
      {jobs.applications.length === 0 ? (
        <View style={styles.empty}>
          <T variant="heading">No applications yet</T>
          <T variant="body" muted style={styles.emptyText}>
            When you apply to a job it lands here with its full timeline
          </T>
          <Button
            isDark={jobs.darkMode}
            accessibilityLabel="Browse jobs"
            variant="filled"
            onPress={() => router.push("/templates/jobs/(tabs)/search")}
          >
            Browse jobs
          </Button>
        </View>
      ) : (
        <>
          {active.length > 0 ? (
            <View>
              <SectionTitle>In progress · {active.length}</SectionTitle>
              {renderList(active)}
            </View>
          ) : null}
          {closed.length > 0 ? (
            <View>
              <SectionTitle>Closed · {closed.length}</SectionTitle>
              {renderList(closed)}
            </View>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  rowText: { flex: 1, gap: 4 },
  rowTitle: { fontWeight: "600" },
  empty: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 32,
  },
  emptyText: { textAlign: "center" },
});
