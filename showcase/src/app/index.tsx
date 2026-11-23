import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card, Input, Separator, Text } from "glacia-native";

import { CATALOGUE } from "../catalogue";
import { useBackdropMode } from "../theme";
import { ModeToggle } from "../backdrop";

/**
 * The showcase home, modelled on the React Native Reusables showcase:
 * a big "Showcase" title, a search field, and one row per component.
 */
export default function ShowcaseHome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useBackdropMode();
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATALOGUE;
    return CATALOGUE.filter(
      (e) =>
        e.name.toLowerCase().includes(q) || e.slug.replace(/-/g, " ").includes(q),
    );
  }, [query]);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <View style={styles.headerRow}>
        <View style={styles.flex} />
        <ModeToggle />
      </View>
      <Text isDark={isDark} variant="title" style={styles.title}>
        Showcase
      </Text>
      <Text isDark={isDark} variant="caption" muted style={styles.subtitle}>
        glacia-native 0.6.0 — {CATALOGUE.length} components. Toggle ◐ for
        light, dark, and photo backdrops.
      </Text>
      <View style={styles.search}>
        <Input
          isDark={isDark}
          placeholder="Components"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Search components"
        />
      </View>
      <Card isDark={isDark} padding={0} style={styles.listCard}>
        <FlatList
          data={shown}
          keyExtractor={(e) => e.slug}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 12 }}
          ItemSeparatorComponent={() => <Separator isDark={isDark} inset={16} />}
          ListEmptyComponent={
            <Text isDark={isDark} muted style={styles.empty}>
              No component matches “{query}”.
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/component/${item.slug}`)}
              accessibilityRole="button"
              accessibilityLabel={item.name}
              style={({ pressed }) => [
                styles.rowPress,
                pressed && {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.05)",
                },
              ]}
            >
              <Text isDark={isDark} variant="body" style={styles.flex}>
                {item.name}
              </Text>
              <Text isDark={isDark} variant="heading" muted>
                ›
              </Text>
            </Pressable>
          )}
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 36,
  },
  flex: { flex: 1 },
  title: { fontSize: 40, letterSpacing: -0.6, marginTop: 4 },
  subtitle: { marginTop: 6 },
  search: { marginTop: 16, marginBottom: 16 },
  listCard: { flex: 1, overflow: "hidden" },
  rowPress: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  empty: { padding: 20, textAlign: "center" },
});
