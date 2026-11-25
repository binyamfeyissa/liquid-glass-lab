import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Alert, Button, Card, Input, Text } from 'glacia-native';
import { useBackdrop } from '../state';
import { BackdropControl } from '../ui';

type Mode = 'create' | 'existing';

/**
 * The finish screen. Both calls to action open a real next step on the
 * same screen — an email field with validation and a confirmation —
 * because this template has no backend and no dead ends. The background
 * switcher lives here too, so the three backgrounds can be tried before
 * replaying the intro.
 */
export function FinishScreen({ onRestart }: { onRestart: () => void }) {
  const { darkMode } = useBackdrop();
  const [mode, setMode] = useState<Mode | null>(null);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const choose = (next: Mode) => {
    setMode(next);
    setError(null);
    setDone(false);
  };

  const submit = () => {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!valid) {
      setError('That email doesn’t look right — check it and try again');
      setDone(false);
      return;
    }
    setError(null);
    setDone(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.root} showsVerticalScrollIndicator={false}>
      <Card isDark={darkMode} padding={24} style={styles.card}>
        <Text isDark={darkMode} variant="title" style={styles.title}>
          Start with Northwind
        </Text>
        <Text isDark={darkMode} variant="body" muted style={styles.body}>
          Connect your team’s calendar and tools to build your first focus report.
        </Text>

        <View style={styles.actions}>
          <Button
            isDark={darkMode}
            variant="filled"
            size="lg"
            accessibilityLabel="Create a Northwind account"
            onPress={() => choose('create')}
          >
            Create account
          </Button>
          <Button
            isDark={darkMode}
            variant="glass"
            size="lg"
            accessibilityLabel="Sign in to an existing Northwind account"
            onPress={() => choose('existing')}
          >
            I already have an account
          </Button>
        </View>

        {mode ? (
          <View style={styles.panel}>
            <Text isDark={darkMode} variant="label">
              {mode === 'create' ? 'Your work email' : 'The email on your account'}
            </Text>
            <Input
              isDark={darkMode}
              value={email}
              onChangeText={setEmail}
              placeholder="you@company.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              invalid={Boolean(error)}
              accessibilityLabel="Email address"
              returnKeyType="go"
              onSubmitEditing={submit}
            />
            {error ? (
              <Alert isDark={darkMode} tone="destructive" title="Check your email" description={error} />
            ) : null}
            {done ? (
              <Alert
                isDark={darkMode}
                tone="success"
                title={mode === 'create' ? 'Workspace reserved' : 'Sign-in link sent'}
                description={
                  mode === 'create'
                    ? `We sent a setup link to ${email.trim()}. It expires in 30 minutes.`
                    : `We sent a sign-in link to ${email.trim()}. Open it on this device to continue.`
                }
              />
            ) : (
              <Button
                isDark={darkMode}
                variant="filled"
                accessibilityLabel={mode === 'create' ? 'Create my workspace' : 'Send me a sign-in link'}
                onPress={submit}
              >
                {mode === 'create' ? 'Create my workspace' : 'Send me a sign-in link'}
              </Button>
            )}
          </View>
        ) : null}
      </Card>

      <View style={styles.background}>
        <Text isDark={darkMode} variant="label">
          Background
        </Text>
        <BackdropControl />
      </View>

      <Button
        isDark={darkMode}
        variant="ghost"
        accessibilityLabel="Replay the introduction"
        onPress={onRestart}
        style={styles.restart}
      >
        Replay the intro
      </Button>
      <Text isDark={darkMode} variant="caption" muted style={styles.footnote}>
        By continuing you agree to Northwind’s Terms and Privacy Policy.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  card: {
    width: '100%',
  },
  title: {
    marginTop: 0,
  },
  body: {
    marginTop: 8,
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  panel: {
    marginTop: 20,
    gap: 12,
  },
  background: {
    marginTop: 24,
    gap: 8,
  },
  restart: {
    alignSelf: 'center',
    marginTop: 16,
  },
  footnote: {
    textAlign: 'center',
    marginTop: 12,
  },
});
