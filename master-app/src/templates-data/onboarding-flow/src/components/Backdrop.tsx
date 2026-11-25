import { Image, StyleSheet, View } from 'react-native';
import { useBackdrop } from '../state';
import { pageColor } from '../theme';

/**
 * The three backgrounds, and nothing else. Dark: graphite #141415.
 * Light: broken white #f7f4ee. Photo: the palm photo, full-bleed,
 * under a neutral black scrim. On Android this is the single direct
 * child of `GlassProvider` — the content its glass siblings sample.
 */
export function Backdrop() {
  const { backdrop } = useBackdrop();
  if (backdrop === 'image') {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Image
          source={require('../../assets/tahoe-dark.jpg')}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.38)' }]} />
      </View>
    );
  }
  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { backgroundColor: pageColor(backdrop) }]}
    />
  );
}
