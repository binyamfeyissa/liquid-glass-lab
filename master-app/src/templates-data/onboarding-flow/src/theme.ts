import { Platform } from 'react-native';
import { radii } from 'glacia-native';
import type { BackdropMode } from './state';

/**
 * The template's theme is a thin layer over the Glacia tokens.
 * `radii` is re-exported from `glacia-native` (sourced from
 * `glacia-tokens`). The three backgrounds live here as plain values —
 * the Backdrop renders them, everything else threads `darkMode` from
 * `src/state.tsx`.
 */
export { radii };

export const MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

/** One ink blue, spent only on progress, the active dot and the key figure. */
export function accentColor(mode: BackdropMode): string {
  return mode === 'light' ? '#1d4ed8' : '#7aa2f0';
}

/** Page colour per backdrop mode (image mode paints the photo instead). */
export function pageColor(mode: BackdropMode): string {
  return mode === 'light' ? '#f7f4ee' : '#141415';
}
