import React from "react";
import { StyleSheet, View } from "react-native";
import { Chip } from "glacia-native";

import { ARTICLES, TOPICS } from "../data";
import { useSignal } from "../state";
import { ListCard, RowSeparator, Screen, SectionTitle, StoryRow, T } from "../ui";

export default function ForYouScreen() {
  const { darkMode, followedTopics, toggleTopic } = useSignal();

  const feed = [...ARTICLES]
    .filter((a) => followedTopics.includes(a.topic))
    .sort((a, b) => a.minutesAgo - b.minutesAgo);

  return (
    <Screen
      title="For You"
      subtitle="Stories from the topics you follow"
    >
      <View>
        <SectionTitle>Your topics</SectionTitle>
        <View style={styles.chipWrap}>
          {TOPICS.map((topic) => (
            <Chip
              key={topic}
              label={topic}
              selected={followedTopics.includes(topic)}
              onPress={() => toggleTopic(topic)}
              isDark={darkMode}
            />
          ))}
        </View>
        <T variant="caption" muted style={styles.chipNote}>
          {followedTopics.length === 0
            ? "You are not following any topics right now"
            : `Following ${followedTopics.length} of ${TOPICS.length} topics`}
        </T>
      </View>

      <View>
        <SectionTitle>Your feed</SectionTitle>
        {feed.length === 0 ? (
          <View style={styles.empty}>
            <T variant="heading" style={styles.emptyTitle}>
              Nothing here yet
            </T>
            <T variant="body" muted style={styles.emptyText}>
              Follow at least one topic above and its latest stories will
              collect here, labelled with the reason they were picked
            </T>
          </View>
        ) : (
          <ListCard>
            {feed.map((article, i) => (
              <React.Fragment key={article.id}>
                {i > 0 ? <RowSeparator /> : null}
                <StoryRow
                  article={article}
                  reason={`Because you follow ${article.topic}`}
                />
              </React.Fragment>
            ))}
          </ListCard>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chipNote: { marginTop: 12, marginLeft: 4 },
  empty: { paddingVertical: 24, paddingHorizontal: 8, gap: 6 },
  emptyTitle: { textAlign: "center" },
  emptyText: { textAlign: "center" },
});
