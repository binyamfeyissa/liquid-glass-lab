import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import {
  colors,
  Chip, IconButton, Input
} from "glacia-native";
import { ArrowLeft } from "lucide-react-native";

import { ARTICLES, TOPICS } from "./data";
import { useSignal } from "./state";
import {
  Headline,
  ListCard,
  RowSeparator,
  SectionTitle,
  StoryRow,
  T,
} from "./ui";

export default function SearchScreen() {
  const { darkMode } = useSignal();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return ARTICLES.filter((a) => {
      const haystack = [
        a.headline,
        a.dek,
        a.topic,
        a.source,
        a.author,
        ...a.body,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    }).sort((a, b) => a.minutesAgo - b.minutesAgo);
  }, [query]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <IconButton
          accessibilityLabel="Back"
          isDark={darkMode}
          onPress={() => router.back()}
          icon={<ArrowLeft size={20} color={darkMode ? colors.dark.foreground : colors.light.foreground} />}
        />
        <Headline variant="title">Search</Headline>
      </View>

      <Input
        value={query}
        onChangeText={setQuery}
        placeholder="Search headlines, topics, full text"
        accessibilityLabel="Search stories"
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        isDark={darkMode}
      />

      {query.trim().length < 2 ? (
        <View>
          <SectionTitle>Browse by topic</SectionTitle>
          <View style={styles.chipWrap}>
            {TOPICS.map((topic) => (
              <Chip
                key={topic}
                label={topic}
                onPress={() => setQuery(topic)}
                isDark={darkMode}
              />
            ))}
          </View>
          <T variant="body" muted style={styles.hint}>
            Search covers every headline and article body in today's
            edition, from two characters
          </T>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.empty}>
          <T variant="heading" style={styles.center}>
            No matches
          </T>
          <T variant="body" muted style={styles.center}>
            Nothing in today's edition matches “{query.trim()}”. Try a
            shorter word, or browse a topic above
          </T>
        </View>
      ) : (
        <View>
          <SectionTitle>
            {results.length} {results.length === 1 ? "result" : "results"}
          </SectionTitle>
          <ListCard>
            {results.map((article, i) => (
              <React.Fragment key={article.id}>
                {i > 0 ? <RowSeparator /> : null}
                <StoryRow article={article} />
              </React.Fragment>
            ))}
          </ListCard>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 32,
    gap: 20,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  hint: { marginTop: 16 },
  empty: { paddingVertical: 28, gap: 8 },
  center: { textAlign: "center" },
});
