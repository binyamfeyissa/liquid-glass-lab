import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button } from "glacia-native";

import { useJobs } from "../state";
import { JobCard, Screen, T } from "../ui";

export default function SavedScreen() {
  const jobs = useJobs();
  const savedJobs = jobs.savedIds
    .map((id) => jobs.jobById(id))
    .filter((j): j is NonNullable<typeof j> => !!j);

  return (
    <Screen
      title="Saved"
      subtitle="Jobs you bookmarked for a closer look"
    >
      {savedJobs.length === 0 ? (
        <View style={styles.empty}>
          <T variant="heading">Nothing saved yet</T>
          <T variant="body" muted style={styles.emptyText}>
            Save a job from any listing and it will wait for you here
          </T>
          <Button
            isDark={jobs.darkMode}
            accessibilityLabel="Find jobs to save"
            variant="filled"
            onPress={() => router.push("/templates/jobs/(tabs)")}
          >
            Find jobs
          </Button>
        </View>
      ) : (
        <View style={styles.list}>
          {savedJobs.map((job) => {
            const applied = !!jobs.applicationFor(job.id);
            return (
              <View key={job.id} style={styles.item}>
                <JobCard job={job} />
                <View style={styles.actions}>
                  <Button
                    isDark={jobs.darkMode}
                    accessibilityLabel={`Remove ${job.title} from saved`}
                    variant="glass"
                    onPress={() => jobs.toggleSaved(job.id)}
                    style={styles.action}
                  >
                    Remove
                  </Button>
                  <Button
                    isDark={jobs.darkMode}
                    accessibilityLabel={
                      applied ? `View application for ${job.title}` : `Apply to ${job.title}`
                    }
                    variant="filled"
                    onPress={() =>
                      applied
                        ? router.push(`/templates/jobs/application/${jobs.applicationFor(job.id)!.id}`)
                        : router.push(`/templates/jobs/apply/${job.id}`)
                    }
                    style={styles.action}
                  >
                    {applied ? "View application" : "Apply now"}
                  </Button>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 16 },
  item: { gap: 8 },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  action: { flex: 1 },
  empty: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 32,
  },
  emptyText: { textAlign: "center" },
});
