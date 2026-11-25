import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Button, Glass, Progress, Text } from 'glacia-native';
import { PageDots } from '../components/PageDots';
import { SLIDES, type Slide } from '../data/slides';
import { useBackdrop } from '../state';
import { Figure, useAccent } from '../ui';

/**
 * The swipeable onboarding pager. A horizontal FlatList with paging —
 * no carousel library — whose scroll position drives the Glacia
 * Progress bar and the page dots (glacia-native 0.6.0 has no
 * PageControl, so the dots are rendered from this same state).
 */
export function OnboardingScreen({ onFinish }: { onFinish: () => void }) {
  const { width } = useWindowDimensions();
  const { darkMode } = useBackdrop();
  const accent = useAccent();
  const listRef = useRef<FlatList<Slide>>(null);
  const [page, setPage] = useState(0);
  const isLast = page === SLIDES.length - 1;

  const goTo = useCallback(
    (index: number) => {
      listRef.current?.scrollToIndex({ index, animated: true });
      setPage(index);
    },
    [],
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(event.nativeEvent.contentOffset.x / width);
      if (next >= 0 && next < SLIDES.length) setPage(next);
    },
    [width],
  );

  return (
    <View style={styles.root}>
      {/* Brand + Skip */}
      <View style={styles.header}>
        <View style={styles.brand}>
          <Glass isDark={darkMode} effect="regular" style={styles.brandMark}>
            <Text isDark={darkMode} variant="label" style={styles.brandLetter}>
              N
            </Text>
          </Glass>
          <Text isDark={darkMode} variant="heading">
            Northwind
          </Text>
        </View>
        {isLast ? (
          <View style={styles.skipSpacer} />
        ) : (
          <Button
            isDark={darkMode}
            variant="ghost"
            size="sm"
            accessibilityLabel="Skip the introduction"
            onPress={onFinish}
          >
            Skip
          </Button>
        )}
      </View>

      <Progress
        isDark={darkMode}
        value={((page + 1) / SLIDES.length) * 100}
        tint={accent}
        accessibilityLabel={`Onboarding progress: screen ${page + 1} of ${SLIDES.length}`}
        style={styles.progress}
      />

      {/* Pager */}
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(slide) => slide.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onScrollToIndexFailed={(info) => {
          listRef.current?.scrollToOffset({ offset: info.index * width, animated: true });
        }}
        renderItem={({ item }) => (
          <View style={[styles.page, { width }]}>
            <View style={styles.visual}>{item.visual()}</View>
            <Text isDark={darkMode} variant="title" style={styles.headline}>
              {item.headline}
            </Text>
            <Text isDark={darkMode} variant="body" muted style={styles.body}>
              {item.body}
            </Text>
          </View>
        )}
        style={styles.pager}
      />

      {/* Dots + position + Next */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <PageDots page={page} count={SLIDES.length} onPress={goTo} />
          <Figure variant="caption" muted>
            {page + 1} of {SLIDES.length}
          </Figure>
        </View>
        <Button
          isDark={darkMode}
          variant="filled"
          size="lg"
          accessibilityLabel={isLast ? 'Get started with Northwind' : 'Next screen'}
          onPress={() => (isLast ? onFinish() : goTo(page + 1))}
        >
          {isLast ? 'Get started' : 'Next'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 12,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    minHeight: 36,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandMark: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLetter: {
    fontSize: 16,
  },
  skipSpacer: {
    width: 52,
  },
  progress: {
    marginHorizontal: 24,
    marginTop: 16,
  },
  pager: {
    flex: 1,
  },
  page: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  visual: {
    minHeight: 300,
    justifyContent: 'flex-start',
  },
  headline: {
    marginTop: 24,
  },
  body: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 8,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
