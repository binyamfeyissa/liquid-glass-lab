import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import {
  colors,
  Button, IconButton
} from "glacia-native";
import { X } from "lucide-react-native";

import { ARTICLES } from "../data";
import { useSignal } from "../state";
import { ListCard, RowSeparator, Screen, StoryRow, T } from "../ui";

export default function BookmarksScreen() {
  const { darkMode, bookmarkIds, toggleBookmark } = useSignal();
  const saved = ARTICLES.filter((a) => bookmarkIds.includes(a.id)).sort(
    (a, b) => a.minutesAgo - b.minutesAgo,
  );

  return (
    <Screen belowTabBar
      title="Bookmarks"
      subtitle={
        saved.length === 0
          ? "Stories you save for later collect here"
          : `${saved.length} ${saved.length === 1 ? "story" : "stories"} saved for later`
      }
    >
      {saved.length === 0 ? (
        <View style={styles.empty}>
          <T variant="heading" style={styles.emptyTitle}>
            No bookmarks yet
          </T>
          <T variant="body" muted style={styles.emptyText}>
            Open any story and tap the bookmark icon to keep it here — for
            the train, the queue, or Sunday morning
          </T>
          <Button
            isDark={darkMode}
            accessibilityLabel="Browse top stories"
            variant="filled"
            onPress={() => router.replace("/templates/news/(tabs)")}
          >
            Browse top stories
          </Button>
        </View>
      ) : (
        <ListCard>
          {saved.map((article, i) => (
            <React.Fragment key={article.id}>
              {i > 0 ? <RowSeparator /> : null}
              <View style={styles.rowWithRemove}>
                <View style={styles.rowGrow}>
                  <StoryRow article={article} />
                </View>
                <IconButton
                  accessibilityLabel={`Remove bookmark for ${article.headline}`}
                  isDark={darkMode}
                  onPress={() => toggleBookmark(article.id)}
                  icon={<X size={18} color={darkMode ? colors.dark.foreground : colors.light.foreground} />}
                />
              </View>
            </React.Fragment>
          ))}
        </ListCard>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: "center",
    paddingVertical: 36,
    paddingHorizontal: 12,
    gap: 12,
  },
  emptyTitle: { textAlign: "center" },
  emptyText: { textAlign: "center", marginBottom: 8 },
  rowWithRemove: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
  },
  rowGrow: { flex: 1 },
});
