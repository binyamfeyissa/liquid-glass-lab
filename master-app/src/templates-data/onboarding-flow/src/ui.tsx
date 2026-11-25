import type { ReactNode } from 'react';
import { SegmentedControl, Text, type TextProps } from 'glacia-native';
import { useBackdrop, type BackdropMode } from './state';
import { MONO, accentColor } from './theme';

/* ------------------------------------------------------------------ */
/*  Figure — every number in the template, mono and tabular.           */
/*  glacia-native's Text silently drops array styles, so the style is  */
/*  one merged object, never an array.                                 */
/* ------------------------------------------------------------------ */

export function Figure({
  children,
  variant = 'body',
  muted = false,
  numberOfLines,
  style,
}: {
  children: ReactNode;
  variant?: TextProps['variant'];
  muted?: boolean;
  numberOfLines?: number;
  style?: Record<string, unknown>;
}) {
  const { darkMode } = useBackdrop();
  return (
    <Text
      isDark={darkMode}
      variant={variant}
      muted={muted}
      numberOfLines={numberOfLines}
      style={Object.assign(
        {},
        { fontFamily: MONO, fontVariant: ['tabular-nums'] as const },
        style ?? {},
      )}
    >
      {children}
    </Text>
  );
}

/* ------------------------------------------------------------------ */
/*  BackdropControl — the three-background switcher.                   */
/* ------------------------------------------------------------------ */

export function BackdropControl() {
  const { backdrop, setBackdrop, darkMode } = useBackdrop();
  const modes: BackdropMode[] = ['dark', 'light', 'image'];
  return (
    <SegmentedControl
      segments={['Dark', 'Light', 'Photo']}
      selectedIndex={modes.indexOf(backdrop)}
      onChange={(i) => setBackdrop(modes[i])}
      isDark={darkMode}
      accessibilityLabel="Background"
    />
  );
}

/** The one accent, for Progress tints and the active page dot. */
export function useAccent(): string {
  const { backdrop } = useBackdrop();
  return accentColor(backdrop);
}
