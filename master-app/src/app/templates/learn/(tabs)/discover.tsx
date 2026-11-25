import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Chip, Field, Input } from "glacia-native";

import { useLearn } from "../state";
import { CATEGORIES, COURSES } from "../data";
import { CourseCard, Figure, Screen, T } from "../ui";

export default function DiscoverScreen() {
  const learn = useLearn();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COURSES.filter((course) => {
      if (category !== "All" && course.category !== category) return false;
      if (!q) return true;
      return (
        course.title.toLowerCase().includes(q) ||
        course.tagline.toLowerCase().includes(q) ||
        course.instructor.name.toLowerCase().includes(q) ||
        course.category.toLowerCase().includes(q)
      );
    });
  }, [query, category]);

  return (
    <Screen
      title="Discover"
      subtitle="Eight courses, taught by people who do the work"
    >
      <Field label="Search courses" isDark={learn.darkMode}>
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Try glass, SQL or an instructor"
          accessibilityLabel="Search courses"
          isDark={learn.darkMode}
          returnKeyType="search"
        />
      </Field>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {CATEGORIES.map((c) => (
          <Chip
            key={c}
            label={c}
            isDark={learn.darkMode}
            selected={category === c}
            onSelectedChange={(selected) => {
              if (selected) setCategory(c);
            }}
          />
        ))}
      </ScrollView>

      <T variant="caption" muted>
        <Figure variant="caption" muted>
          {results.length}
        </Figure>{" "}
        {results.length === 1 ? "course" : "courses"}
        {category !== "All" ? ` in ${category}` : ""}
        {query.trim() ? ` matching "${query.trim()}"` : ""}
      </T>

      <View style={styles.list}>
        {results.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onPress={() => router.push(`/templates/learn/course/${course.id}`)}
          />
        ))}
        {results.length === 0 ? (
          <T variant="body" muted>
            Nothing matches that search yet. Try a shorter term, or browse
            the full catalogue with the category set to All
          </T>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chipRow: { gap: 8, paddingRight: 4 },
  list: { gap: 16 },
});
