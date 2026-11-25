import { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GlassProvider } from 'glacia-native';
import { Backdrop } from './src/components/Backdrop';
import { FinishScreen } from './src/screens/FinishScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { BackdropProvider, useBackdrop } from './src/state';
import { pageColor } from './src/theme';

type Stage = 'intro' | 'finish';

/**
 * App shell. Layout follows the glacia-native Android provider rule:
 * `GlassProvider` holds exactly one direct child — the backdrop whose
 * pixels the glass samples — and every glass surface is its sibling,
 * drawn after it, never inside it. On iOS the provider is a plain view
 * and the same tree works unchanged.
 */
export default function App() {
  return (
    <BackdropProvider>
      <Shell />
    </BackdropProvider>
  );
}

function Shell() {
  const [stage, setStage] = useState<Stage>('intro');
  const [run, setRun] = useState(0);
  const { backdrop, darkMode } = useBackdrop();

  return (
    <>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <View style={[styles.root, { backgroundColor: pageColor(backdrop) }]}>
        <GlassProvider style={styles.fill}>
          <Backdrop />
        </GlassProvider>

        <SafeAreaView style={styles.content}>
          {stage === 'intro' ? (
            <OnboardingScreen key={run} onFinish={() => setStage('finish')} />
          ) : (
            <FinishScreen
              onRestart={() => {
                setRun((value) => value + 1);
                setStage('intro');
              }}
            />
          )}
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
  },
});
