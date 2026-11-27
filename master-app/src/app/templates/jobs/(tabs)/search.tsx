import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Field, Input, SegmentedControl, Select } from "glacia-native";

import { useJobs } from "../state";
import { JobCard, Screen, SectionTitle, T } from "../ui";
import {
  JOB_TYPES,
  SALARY_BANDS,
  WORK_MODES,
  matchScore,
  type WorkMode,
} from "../data";

const MODE_FILTERS = ["Any", ...WORK_MODES] as const;
type ModeFilter = (typeof MODE_FILTERS)[number];

export default function SearchScreen() {
  const jobs = useJobs();
  const [type, setType] = useState<string>("any");
  const [band, setBand] = useState<string>("any");
  const [modeIndex, setModeIndex] = useState(0);
  const [sort, setSort] = useState<string>("match");

  const results = useMemo(() => {
    const q = jobs.searchQuery.trim().toLowerCase();
    const mode: ModeFilter = MODE_FILTERS[modeIndex];
    const bandDef = SALARY_BANDS.find((b) => b.value === band) ?? SALARY_BANDS[0];

    const filtered = jobs.jobs.filter((job) => {
      if (q) {
        const haystack = [
          job.title,
          job.company,
          job.location,
          job.category,
          ...job.skills,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (type !== "any" && job.type !== type) return false;
      if (mode !== "Any" && job.mode !== (mode as WorkMode)) return false;
      const mid = (job.salaryMin + job.salaryMax) / 2;
      if (mid < bandDef.min || mid >= bandDef.max) return false;
      return true;
    });

    return filtered.sort((a, b) =>
      sort === "match"
        ? matchScore(b, jobs.profile.skills) - matchScore(a, jobs.profile.skills) ||
          a.postedDaysAgo - b.postedDaysAgo
        : a.postedDaysAgo - b.postedDaysAgo,
    );
  }, [jobs.jobs, jobs.searchQuery, jobs.profile.skills, type, band, modeIndex, sort]);

  const hasFilters =
    jobs.searchQuery.trim() !== "" || type !== "any" || band !== "any" || modeIndex !== 0;

  const clearAll = () => {
    jobs.setSearchQuery("");
    setType("any");
    setBand("any");
    setModeIndex(0);
  };

  return (
    <Screen belowTabBar title="Search" subtitle="Every posting on Northbound">
      <Field label="Keywords" isDark={jobs.darkMode}>
        <Input
          value={jobs.searchQuery}
          onChangeText={jobs.setSearchQuery}
          placeholder="Title, company or skill"
          accessibilityLabel="Search keywords"
          isDark={jobs.darkMode}
        />
      </Field>

      <View style={styles.filterGrid}>
        <View style={styles.filterItem}>
          <Field label="Job type" isDark={jobs.darkMode}>
            <Select
              value={type}
              onValueChange={setType}
              options={[
                { value: "any", label: "Any type" },
                ...JOB_TYPES.map((t) => ({ value: t, label: t })),
              ]}
              accessibilityLabel="Job type"
              isDark={jobs.darkMode}
            />
          </Field>
        </View>
        <View style={styles.filterItem}>
          <Field label="Salary" isDark={jobs.darkMode}>
            <Select
              value={band}
              onValueChange={setBand}
              options={SALARY_BANDS.map((b) => ({ value: b.value, label: b.label }))}
              accessibilityLabel="Salary band"
              isDark={jobs.darkMode}
            />
          </Field>
        </View>
      </View>

      <View>
        <SectionTitle>Work mode</SectionTitle>
        <SegmentedControl
          segments={[...MODE_FILTERS]}
          selectedIndex={modeIndex}
          onChange={setModeIndex}
          accessibilityLabel="Work mode filter"
          isDark={jobs.darkMode}
        />
      </View>

      <View>
        <SectionTitle>Sort by</SectionTitle>
        <SegmentedControl
          segments={["Best match", "Newest"]}
          selectedIndex={sort === "match" ? 0 : 1}
          onChange={(i) => setSort(i === 0 ? "match" : "newest")}
          accessibilityLabel="Sort results"
          isDark={jobs.darkMode}
        />
      </View>

      <View>
        <SectionTitle>
          {results.length} {results.length === 1 ? "job" : "jobs"}
        </SectionTitle>
        <View style={styles.list}>
          {results.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
          {results.length === 0 ? (
            <>
              <T variant="body" muted>
                Nothing matches that combination — try widening the salary band or
                clearing the keywords
              </T>
              {hasFilters ? (
                <Button accessibilityLabel="Clear all filters" onPress={clearAll} isDark={jobs.darkMode}>
                  Clear all filters
                </Button>
              ) : null}
            </>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterGrid: {
    flexDirection: "row",
    gap: 12,
  },
  filterItem: { flex: 1 },
  list: { gap: 12 },
});
