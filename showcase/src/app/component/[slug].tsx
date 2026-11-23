import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "glacia-native";

import { CATALOGUE, catalogueIndex } from "../../catalogue";
import { DEMOS } from "../../demos";
import { useBackdropMode } from "../../theme";
import { ModeToggle } from "../../backdrop";

/**
 * One component's screen: Back header with the mode toggle, the demo in a
 * scroll view, and prev/next square buttons at the bottom that walk the
 * catalogue in order (the Reusables showcase pattern).
 */
export default function ComponentScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useBackdropMode();

  const index = catalogueIndex(slug ?? "");
  if (index < 0) return <Redirect href="/" />;
  const entry = CATALOGUE[index];
  const Demo = DEMOS[entry.slug];
  const prev = CATALOGUE[index - 1];
  const next = CATALOGUE[index + 1];

  const goNeighbour = (target?: { slug: string }) => () => {
    if (target) router.replace(`/component/${target.slug}`);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 4 }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          style={styles.backButton}
        >
          <Text isDark={isDark} variant="title">
            ‹
          </Text>
          <Text isDark={isDark} variant="body">
            Back
          </Text>
        </Pressable>
        <Text
          isDark={isDark}
          variant="heading"
          numberOfLines={1}
          style={styles.headerTitle}
        >
          {entry.name}
        </Text>
        <View style={styles.toggleSlot}>
          <ModeToggle />
        </View>
      </View>
      <View style={styles.divider} />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text isDark={isDark} variant="caption" muted style={styles.description}>
          {entry.description}
        </Text>
        {Demo ? <Demo /> : null}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
        <Pressable
          onPress={goNeighbour(prev)}
          disabled={!prev}
          accessibilityRole="button"
          accessibilityLabel={prev ? `Previous: ${prev.name}` : "No previous component"}
          style={[styles.navButton, !prev && styles.navButtonDisabled]}
        >
          <Text isDark={isDark} variant="title">
            ‹
          </Text>
        </Pressable>
        <Text isDark={isDark} variant="caption" muted>
          {index + 1} / {CATALOGUE.length}
        </Text>
        <Pressable
          onPress={goNeighbour(next)}
          disabled={!next}
          accessibilityRole="button"
          accessibilityLabel={next ? `Next: ${next.name}` : "No next component"}
          style={[styles.navButton, !next && styles.navButtonDisabled]}
        >
          <Text isDark={isDark} variant="title">
            ›
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20 },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    minWidth: 86,
  },
  headerTitle: { flex: 1, textAlign: "center" },
  toggleSlot: { minWidth: 86, alignItems: "flex-end" },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(127,127,127,0.35)",
    marginHorizontal: -20,
  },
  content: { paddingTop: 18, paddingBottom: 24 },
  description: { marginBottom: 20, lineHeight: 18 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
  },
  navButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(127,127,127,0.14)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(127,127,127,0.35)",
  },
  navButtonDisabled: { opacity: 0.35 },
});
