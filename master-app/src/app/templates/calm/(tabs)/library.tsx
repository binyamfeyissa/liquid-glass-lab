import React, { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Field, Input } from "glacia-native";

import { useStillwater } from "../state";
import { CATEGORIES, SESSIONS } from "../data";
import { ListCard, RowSeparator, Screen, SectionTitle, SessionRow, T } from "../ui";

/**
 * Library, redesigned: the twelve sessions are grouped under their four
 * categories instead of one long undifferentiated list, so the catalogue
 * reads as curated shelves. Search narrows every shelf at once; a shelf
 * with no match hides. Nothing is invented — the categories and the
 * sessions are the existing catalogue.
 */
export default function LibraryScreen() {
  const app = useStillwater();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const results = SESSIONS.filter(
    (s) =>
      !q ||
      s.title.toLowerCase().includes(q) ||
      s.narrator.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q),
  );

  return (
    <Screen belowTabBar
      title="Library"
      subtitle={`${SESSIONS.length} guided sessions — sleep, focus, anxiety and mornings`}
    >
      <Field label="Search" isDark={app.darkMode}>
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Search titles, narrators, categories"
          accessibilityLabel="Search sessions"
          isDark={app.darkMode}
        />
      </Field>

      {results.length > 0 ? (
        CATEGORIES.map((category) => {
          const shelf = results.filter((s) => s.category === category);
          if (shelf.length === 0) return null;
          return (
            <View key={category}>
              <SectionTitle>
                {category} · {shelf.length} session{shelf.length === 1 ? "" : "s"}
              </SectionTitle>
              <ListCard>
                {shelf.map((session, i) => (
                  <React.Fragment key={session.id}>
                    {i > 0 ? <RowSeparator /> : null}
                    <SessionRow
                      session={session}
                      onPress={() => router.push(`/templates/calm/player/${session.id}`)}
                    />
                  </React.Fragment>
                ))}
              </ListCard>
            </View>
          );
        })
      ) : (
        <View>
          <T variant="body" muted>
            Nothing matches “{query}”. Try a category — Sleep, Focus, Anxiety,
            Morning — or clear the search.
          </T>
        </View>
      )}

      <T variant="caption" muted>
        Playback is simulated with timers — no audio in this template
      </T>
    </Screen>
  );
}
