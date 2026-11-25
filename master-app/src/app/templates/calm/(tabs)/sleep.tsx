import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Avatar, Badge, Button, Card, Field, Select, Slider, Switch } from "glacia-native";

import { useStillwater } from "../state";
import { BEDTIME_OPTIONS, MIXER_TIMER_OPTIONS, SOUNDS, formatClock } from "../data";
import { Figure, ListCard, RowSeparator, Screen, SectionTitle, SettingRow, T } from "../ui";

/**
 * The sleep-sounds mixer. There is no audio in this template: the sliders
 * shape a simulated mix (labelled as such on screen), and the master
 * timer counts down in real time and silences the mix when it ends.
 */
export default function SleepScreen() {
  const app = useStillwater();
  const [mixerRunning, setMixerRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const activeSounds = SOUNDS.filter((s) => (app.mixer.volumes[s.id] ?? 0) > 0);
  const timerLabel =
    MIXER_TIMER_OPTIONS.find((o) => o.value === String(app.mixer.timerMinutes))
      ?.label ?? "No timer";

  // Master countdown while the mixer runs.
  useEffect(() => {
    if (!mixerRunning) return;
    if (secondsLeft <= 0) {
      setMixerRunning(false);
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [mixerRunning, secondsLeft]);

  const startMixer = () => {
    setSecondsLeft(app.mixer.timerMinutes * 60);
    setMixerRunning(true);
  };

  return (
    <Screen
      title="Sleep"
      subtitle="Sounds, a timer, and a bedtime"
    >
      {/* Mixer status */}
      <Card isDark={app.darkMode} padding={20}>
        <View style={styles.statusRow}>
          <View style={styles.statusText}>
            <T variant="label" muted>
              Your mix
            </T>
            <T variant="heading" style={styles.statusValue}>
              {activeSounds.length === 0
                ? "Silence"
                : activeSounds.map((s) => s.name).join(" · ")}
            </T>
            <T variant="caption" muted style={styles.statusSub}>
              {mixerRunning
                ? app.mixer.timerMinutes > 0
                  ? `Playing · ${formatClock(secondsLeft)} left on the timer`
                  : "Playing · no timer set"
                : `Timer: ${timerLabel} · simulated playback — no real audio in this template`}
            </T>
          </View>
          <Badge tone="muted" isDark={app.darkMode}>
            {mixerRunning ? "On" : "Off"}
          </Badge>
        </View>
        <Button
          isDark={app.darkMode}
          accessibilityLabel={mixerRunning ? "Stop the soundscape" : "Play the soundscape"}
          variant="filled"
          disabled={activeSounds.length === 0}
          onPress={() => (mixerRunning ? setMixerRunning(false) : startMixer())}
          style={styles.playButton}
        >
          {mixerRunning ? "Stop soundscape" : "Play soundscape"}
        </Button>
        {activeSounds.length === 0 ? (
          <T variant="caption" muted style={styles.hint}>
            Raise at least one sound above zero to play the mix
          </T>
        ) : null}
      </Card>

      {/* Sound sliders */}
      <View>
        <SectionTitle>Sounds</SectionTitle>
        <ListCard>
          {SOUNDS.map((sound, i) => {
            const volume = app.mixer.volumes[sound.id] ?? 0;
            return (
              <React.Fragment key={sound.id}>
                {i > 0 ? <RowSeparator /> : null}
                <View style={styles.soundRow}>
                  <View style={styles.soundHead}>
                    <Avatar name={sound.name} isDark={app.darkMode} />
                    <T variant="body" style={styles.soundName}>
                      {sound.name}
                    </T>
                    <Figure variant="caption" muted>
                      {volume}%
                    </Figure>
                  </View>
                  <T variant="caption" muted>
                    {sound.detail}
                  </T>
                  <Slider
                    value={volume}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(v) => app.setSoundVolume(sound.id, v)}
                    accessibilityLabel={`${sound.name} volume`}
                    isDark={app.darkMode}
                  />
                </View>
              </React.Fragment>
            );
          })}
        </ListCard>
      </View>

      {/* Timer + bedtime */}
      <View>
        <SectionTitle>Night routine</SectionTitle>
        <ListCard>
          <View style={styles.form}>
            <Field label="Soundscape timer" isDark={app.darkMode}>
              <Select
                value={String(app.mixer.timerMinutes)}
                onValueChange={(v) => {
                  app.setMixerTimer(Number(v));
                  setMixerRunning(false);
                }}
                options={MIXER_TIMER_OPTIONS}
                accessibilityLabel="Soundscape timer"
                isDark={app.darkMode}
              />
            </Field>
            <Field label="Bedtime reminder" isDark={app.darkMode}>
              <Select
                value={app.bedtime}
                onValueChange={app.setBedtime}
                options={BEDTIME_OPTIONS}
                accessibilityLabel="Bedtime reminder time"
                isDark={app.darkMode}
              />
            </Field>
          </View>
          <RowSeparator />
          <SettingRow
            title="Remind me at bedtime"
            description={`Stillwater will nudge you at ${BEDTIME_OPTIONS.find((o) => o.value === app.bedtime)?.label ?? app.bedtime}`}
          >
            <Switch
              value={app.bedtimeReminder}
              onValueChange={app.setBedtimeReminder}
              accessibilityLabel="Bedtime reminder"
              isDark={app.darkMode}
            />
          </SettingRow>
        </ListCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  statusText: { flex: 1 },
  statusValue: { marginTop: 8 },
  statusSub: { marginTop: 4 },
  playButton: { marginTop: 16 },
  hint: { marginTop: 8 },
  soundRow: { paddingVertical: 12, paddingHorizontal: 16, gap: 8 },
  soundHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  soundName: { flex: 1 },
  form: { paddingHorizontal: 16, paddingVertical: 12, gap: 16 },
});
