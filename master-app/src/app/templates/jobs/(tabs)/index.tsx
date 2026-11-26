import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Button, Chip, Field, Input } from "glacia-native";

import { useJobs } from "../state";
import { Figure, JobCard, ListCard, RowSeparator, SectionTitle, T } from "../ui";
import { CATEGORIES, USER_IMAGE, matchScore, type Category } from "../data";

type Filter = Category | "All";

export default function HomeScreen() {
  const jobs = useJobs();
  const [filter, setFilter] = useState<Filter>("All");
  const [draftQuery, setDraftQuery] = useState("");

  /** Recommended = best skill overlap first, then most recent. */
  const recommended = useMemo(
    () =>
      [...jobs.jobs]
        .sort(
          (a, b) =>
            matchScore(b, jobs.profile.skills) - matchScore(a, jobs.profile.skills) ||
            a.postedDaysAgo - b.postedDaysAgo,
        )
        .slice(0, 3),
    [jobs.jobs, jobs.profile.skills],
  );

  const browse = useMemo(
    () =>
      (filter === "All"
        ? jobs.jobs
        : jobs.jobs.filter((j) => j.category === filter)
      )
        .slice()
        .sort((a, b) => a.postedDaysAgo - b.postedDaysAgo),
    [jobs.jobs, filter],
  );

  const submitSearch = () => {
    jobs.setSearchQuery(draftQuery.trim());
    router.push("/templates/jobs/(tabs)/search");
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header — the candidate, not a greeting */}
      <View style={styles.header}>
        <Avatar name={jobs.profile.name} source={USER_IMAGE} size="lg" isDark={jobs.darkMode} />
        <View style={styles.headerText}>
          <T variant="heading">{jobs.profile.name}</T>
          <T variant="caption" muted>
            {jobs.profile.title} · {jobs.profile.location}
          </T>
        </View>
      </View>

      {/* Search — writes to the store, the Search tab picks it up. */}
      <Field label="Search jobs" isDark={jobs.darkMode}>
        <View style={styles.searchRow}>
          <View style={styles.searchInput}>
            <Input
              value={draftQuery}
              onChangeText={setDraftQuery}
              placeholder="Title, company or skill"
              accessibilityLabel="Search jobs"
              isDark={jobs.darkMode}
              onSubmitEditing={submitSearch}
              returnKeyType="search"
            />
          </View>
          <Button accessibilityLabel="Run search" variant="filled" onPress={submitSearch} isDark={jobs.darkMode}>
            Search
          </Button>
        </View>
      </Field>

      {/* The ledger line — counts as quiet rows, figures in mono */}
      <ListCard>
        <View style={styles.statRow}>
          <T variant="body">Saved jobs</T>
          <Figure variant="body">{jobs.savedIds.length}</Figure>
        </View>
        <RowSeparator />
        <View style={styles.statRow}>
          <T variant="body">Applications</T>
          <Figure variant="body">{jobs.applications.length}</Figure>
        </View>
        <RowSeparator />
        <View style={styles.statRow}>
          <T variant="body">Profile skills</T>
          <Figure variant="body">{jobs.profile.skills.length}</Figure>
        </View>
      </ListCard>

      {/* Recommended for you */}
      <View>
        <SectionTitle>Recommended for you</SectionTitle>
        <T variant="caption" muted style={styles.note}>
          Ranked by skill overlap with your profile
        </T>
        <View style={styles.list}>
          {recommended.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </View>
      </View>

      {/* Browse by category */}
      <View>
        <SectionTitle>Browse</SectionTitle>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {(["All", ...CATEGORIES] as Filter[]).map((c) => (
            <Chip
              key={c}
              label={c}
              selected={filter === c}
              onSelectedChange={() => setFilter(c)}
              isDark={jobs.darkMode}
            />
          ))}
        </ScrollView>
        <View style={styles.list}>
          {browse.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
          {browse.length === 0 ? (
            <T variant="body" muted>
              No jobs in this category yet.
            </T>
          ) : null}
        </View>
      </View>

      <T variant="caption" muted style={styles.foot}>
        Northbound · Template build — every company here is fictional and no
        application leaves the device.
      </T>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 112,
    paddingBottom: 32,
    gap: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerText: { flex: 1, gap: 4 },
  searchRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  searchInput: { flex: 1 },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  note: {
    marginLeft: 4,
    marginBottom: 12,
  },
  chips: {
    gap: 8,
    paddingRight: 4,
    marginBottom: 12,
  },
  list: { gap: 12 },
  foot: { textAlign: "center" },
});
