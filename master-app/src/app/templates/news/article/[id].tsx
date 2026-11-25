import React, { useEffect, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  colors,
  Button, Card, IconButton, Progress
} from "glacia-native";
import { ArrowLeft, ArrowUpRight } from "lucide-react-native";

import { articleById, type Article } from "../data";
import { FONT_STEPS, useSignal } from "../state";
import {
  CoverArt,
  Figure,
  Headline,
  ListCard,
  RowSeparator,
  SectionTitle,
  StoryRow,
  T,
  accentFor,
} from "../ui";

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const signal = useSignal();
  const article = articleById(id ?? "");
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Opening a story marks it read — the feeds dim it from now on.
  useEffect(() => {
    if (article) signal.markRead(article.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article?.id]);

  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  if (!article) {
    return (
      <View style={styles.missing}>
        <T variant="heading">Story not found</T>
        <T variant="body" muted style={styles.missingText}>
          This story may have rotated out of today's edition
        </T>
        <Button
          isDark={signal.darkMode}
          accessibilityLabel="Back to top stories"
          variant="glass"
          onPress={() => router.back()}
        >
          Back to Top
        </Button>
      </View>
    );
  }

  const bookmarked = signal.isBookmarked(article.id);
  const bodySize = 17 * signal.fontScale;
  const related = article.related
    .map((rid) => articleById(rid))
    .filter((a): a is Article => a !== undefined && a.id !== article.id);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const range = contentSize.height - layoutMeasurement.height;
    setProgress(range > 0 ? Math.min(1, Math.max(0, contentOffset.y / range)) : 0);
  };

  const share = () => {
    // Demo share: no clipboard or network in a template build — the
    // button confirms the action the way a real share sheet would end.
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.root}>
      {/* Reading progress — the one red rule */}
      <View style={styles.progressWrap}>
        <Progress
          value={Math.round(progress * 100)}
          tint={accentFor(signal.darkMode)}
          isDark={signal.darkMode}
          accessibilityLabel="Reading progress"
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={32}
      >
        {/* Toolbar */}
        <View style={styles.toolbar}>
          <IconButton
            accessibilityLabel="Back"
            isDark={signal.darkMode}
            onPress={() => router.back()}
            icon={<ArrowLeft size={20} color={signal.darkMode ? colors.dark.foreground : colors.light.foreground} />}
          />
          <View style={styles.toolbarSpacer} />
          <View style={styles.fontControls}>
            <Button
              isDark={signal.darkMode}
              accessibilityLabel="Decrease text size"
              variant="glass"
              size="sm"
              disabled={signal.fontStep === 0}
              onPress={() => signal.setFontStep(signal.fontStep - 1)}
            >
              A−
            </Button>
            <Button
              isDark={signal.darkMode}
              accessibilityLabel="Increase text size"
              variant="glass"
              size="sm"
              disabled={signal.fontStep === FONT_STEPS.length - 1}
              onPress={() => signal.setFontStep(signal.fontStep + 1)}
            >
              A+
            </Button>
          </View>
          <IconButton
            accessibilityLabel={bookmarked ? "Remove bookmark" : "Bookmark this story"}
            isDark={signal.darkMode}
            onPress={() => signal.toggleBookmark(article.id)}
            icon={
              <T variant="caption">{bookmarked ? "Saved" : "Save"}</T>
            }
          />
          <IconButton
            accessibilityLabel="Share this story"
            isDark={signal.darkMode}
            onPress={share}
            icon={<ArrowUpRight size={18} color={signal.darkMode ? colors.dark.foreground : colors.light.foreground} />}
          />
        </View>

        {copied ? (
          <T variant="caption" muted style={styles.copiedNote}>
            Link copied — demo only, nothing is sent
          </T>
        ) : null}

        <T variant="caption" muted>
          {article.topic} · {article.source}
        </T>
        <Headline variant="title" style={styles.headline}>
          {article.headline}
        </Headline>
        <T variant="body" muted style={styles.dek}>
          {article.dek}
        </T>
        <Figure variant="caption" muted>
          By {article.author} · {article.timeLabel} · {article.readMinutes}{" "}
          min read
        </Figure>

        <CoverArt article={article} height={192} large />

        <View style={styles.body}>
          {article.body.map((paragraph, i) => (
            <T
              key={i}
              variant="body"
              style={{ fontSize: bodySize, lineHeight: bodySize * 1.55 }}
            >
              {paragraph}
            </T>
          ))}
        </View>

        <Card isDark={signal.darkMode} style={styles.endCard}>
          <T variant="body">Keep this story</T>
          <T variant="caption" muted style={styles.endText}>
            {bookmarked
              ? "This story is in your bookmarks — find it any time on the Bookmarks tab"
              : "Bookmark this story to keep it in your reading list"}
          </T>
          <Button
            isDark={signal.darkMode}
            accessibilityLabel={bookmarked ? "Remove bookmark" : "Bookmark this story"}
            variant={bookmarked ? "glass" : "filled"}
            onPress={() => signal.toggleBookmark(article.id)}
          >
            {bookmarked ? "Bookmarked" : "Bookmark this story"}
          </Button>
        </Card>

        {related.length > 0 ? (
          <View>
            <SectionTitle>Related stories</SectionTitle>
            <ListCard>
              {related.map((rel, i) => (
                <React.Fragment key={rel.id}>
                  {i > 0 ? <RowSeparator /> : null}
                  <StoryRow article={rel} />
                </React.Fragment>
              ))}
            </ListCard>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  progressWrap: {
    paddingTop: 56,
    paddingHorizontal: 24,
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
    gap: 16,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toolbarSpacer: { flex: 1 },
  fontControls: { flexDirection: "row", gap: 8 },
  copiedNote: {
    alignSelf: "flex-end",
  },
  headline: { lineHeight: 40 },
  dek: { fontSize: 17, lineHeight: 25 },
  body: { gap: 16, marginTop: 4 },
  endCard: { gap: 8, marginTop: 8 },
  endText: { marginBottom: 4 },
  missing: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  missingText: { textAlign: "center", marginBottom: 8 },
});
