import { Pressable, StyleSheet, View } from 'react-native';
import { useBackdrop } from '../state';
import { useAccent } from '../ui';

/**
 * Page dots rendered from pager state. glacia-native 0.6.0 does not ship
 * a PageControl, so the dots are drawn here and driven by the same
 * `page` state as the pager and the progress bar. Tapping a dot jumps
 * straight to that screen. The active dot takes the one accent; idle
 * dots are quiet neutrals.
 */
export function PageDots({
  page,
  count,
  onPress,
}: {
  page: number;
  count: number;
  onPress: (index: number) => void;
}) {
  const { darkMode } = useBackdrop();
  const accent = useAccent();
  return (
    <View style={styles.row}>
      {Array.from({ length: count }, (_, index) => {
        const active = index === page;
        return (
          <Pressable
            key={index}
            accessibilityRole="button"
            accessibilityLabel={`Go to screen ${index + 1} of ${count}`}
            accessibilityState={{ selected: active }}
            onPress={() => onPress(index)}
            style={styles.hit}
          >
            <View
              style={[
                styles.dot,
                active
                  ? { width: 26, backgroundColor: accent }
                  : {
                      width: 8,
                      backgroundColor: darkMode
                        ? 'rgba(255,255,255,0.35)'
                        : 'rgba(31,27,22,0.25)',
                    },
              ]}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hit: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
