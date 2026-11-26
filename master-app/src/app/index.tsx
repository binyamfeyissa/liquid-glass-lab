import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card, Input, Separator, Text } from "glacia-native";

import { TEMPLATES } from "../templates";
import { useBackdropMode } from "../theme";
import { ModeToggle } from "../backdrop";

/**
 * Master home: one row per template. Tapping a row opens that template
 * inside this app, on its own screens, with its own navigation.
 */
export default function MasterHome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, mode } = useBackdropMode();
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TEMPLATES;
    return TEMPLATES.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.app.toLowerCase().includes(q) ||
        e.slug.replace(/-/g, " ").includes(q),
    );
  }, [query]);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <View style={styles.headerRow}>
        <View style={styles.flex} />
        <ModeToggle />
      </View>
      <Text isDark={isDark} variant="title" style={styles.title}>
        Templates
      </Text>
      <Text isDark={isDark} variant="caption" muted style={styles.subtitle}>
        Glacia — {TEMPLATES.length} mobile templates. Tap one to open it
        inside this app. Toggle ◐ for light, dark, and photo backdrops.
      </Text>
      <View style={styles.search}>
        <Input
          isDark={isDark}
          placeholder="Templates"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Search templates"
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
              No template matches “{query}”.
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              // Pass the host's current backdrop mode so the template opens
              // on the same background. The template reads `backdrop` as its
              // initial mode (its own store defaults to dark otherwise and
              // never sees the host's mode). Owner fix 2026-11-26.
              onPress={() =>
                router.push({
                  pathname: `/templates/${item.slug}`,
                  params: { backdrop: mode },
                })
              }
              accessibilityRole="button"
              accessibilityLabel={`${item.name} — ${item.app}`}
              style={({ pressed }) => [
                styles.rowPress,
                pressed && {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.05)",
                },
              ]}
            >
              <View style={styles.flex}>
                <Text isDark={isDark} variant="body">
                  {item.name}
                </Text>
                <Text isDark={isDark} variant="caption" muted style={styles.rowSub}>
                  {item.app} — {item.blurb}
                </Text>
              </View>
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
  rowSub: { marginTop: 2 },
  empty: { padding: 20, textAlign: "center" },
});
