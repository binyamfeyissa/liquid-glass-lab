import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Badge,
  Button,
  Card,
  Field,
  Progress,
  SegmentedControl,
  Select,
} from "glacia-native";

import { useStillwater } from "../state";
import {
  SESSIONS,
  SLEEP_TIMER_OPTIONS,
  SPEED_SEGMENTS,
  SPEED_VALUES,
  formatClock,
  formatDuration,
} from "../data";
import { Artwork, Figure, T, accentColor } from "../ui";

type PlayerStatus = "ready" | "playing" | "paused" | "completed" | "goodnight";

/**
 * The session player. Playback is simulated: a one-second interval
 * advances the elapsed time by the chosen speed, the sleep timer counts
 * down alongside it, and reaching the end credits the minutes to today
 * and to the practice history in the shared store.
 */
export default function PlayerScreen() {
  const app = useStillwater();
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = SESSIONS.find((s) => s.id === id) ?? SESSIONS[0];

  const resumeAt =
    app.lastSessionId === session.id ? app.lastSessionElapsed : 0;
  const [elapsed, setElapsed] = useState(resumeAt);
  const [status, setStatus] = useState<PlayerStatus>("ready");
  const [speedIndex, setSpeedIndex] = useState(1);
  const [sleepTimer, setSleepTimer] = useState("0");
  const [sleepLeft, setSleepLeft] = useState<number | null>(null);

  const elapsedRef = useRef(elapsed);
  const sleepLeftRef = useRef<number | null>(null);
  const creditedRef = useRef(false);
  elapsedRef.current = elapsed;

  const duration = session.durationSec;
  const speed = SPEED_VALUES[speedIndex];
  const playing = status === "playing";
  const finished = status === "completed" || status === "goodnight";

  const finish = (how: "completed" | "goodnight") => {
    setStatus(how);
    if (how === "completed" && !creditedRef.current) {
      creditedRef.current = true;
      app.completePractice({
        kind: "session",
        title: session.title,
        minutes: Math.round(duration / 60),
      });
      app.setLastSession(session.id, 0);
    }
  };

  // The playback clock.
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      const next = elapsedRef.current + speed;
      if (next >= duration) {
        setElapsed(duration);
        finish("completed");
        return;
      }
      setElapsed(next);
      app.setLastSession(session.id, Math.floor(next));
      if (sleepLeftRef.current !== null) {
        const left = sleepLeftRef.current - speed;
        if (left <= 0) {
          sleepLeftRef.current = 0;
          setSleepLeft(0);
          finish("goodnight");
          return;
        }
        sleepLeftRef.current = left;
        setSleepLeft(left);
      }
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, speed, duration, session.id]);

  const togglePlay = () => {
    if (finished) {
      // Listen again from the top.
      creditedRef.current = false;
      setElapsed(0);
      const fresh = sleepTimer === "0" ? null : Number(sleepTimer) * 60;
      sleepLeftRef.current = fresh;
      setSleepLeft(fresh);
      setStatus("playing");
      return;
    }
    setStatus(playing ? "paused" : "playing");
  };

  const skip = (delta: number) => {
    const next = Math.min(duration, Math.max(0, elapsedRef.current + delta));
    setElapsed(next);
    app.setLastSession(session.id, Math.floor(next));
    if (next >= duration) finish("completed");
    else if (finished) setStatus("paused");
  };

  const chooseSleepTimer = (value: string) => {
    setSleepTimer(value);
    const fresh = value === "0" ? null : Number(value) * 60;
    sleepLeftRef.current = fresh;
    setSleepLeft(fresh);
  };

  const pct = Math.min(100, Math.round((elapsed / duration) * 100));

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topRow}>
        <Button
          isDark={app.darkMode}
          accessibilityLabel="Back"
          variant="glass"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          Back
        </Button>
        <Badge tone="muted" isDark={app.darkMode}>
          {session.category}
        </Badge>
      </View>

      <Artwork session={session} height={230} radius={20} />

      <View style={styles.titleBlock}>
        <T variant="title">{session.title}</T>
        <T variant="body" muted style={styles.meta}>
          {session.narrator} · {formatDuration(duration)} · {session.plays} plays
        </T>
        <T variant="body" muted style={styles.blurb}>
          {session.blurb}
        </T>
      </View>

      {status === "completed" ? (
        <Card isDark={app.darkMode} padding={16} style={styles.banner}>
          <Badge tone="muted" isDark={app.darkMode}>
            Session complete
          </Badge>
          <T variant="body" style={styles.bannerText}>
            {Math.round(duration / 60)} minutes added to today — you're at{" "}
            {app.todayMinutes} minutes. It is in your history on the Progress
            tab.
          </T>
        </Card>
      ) : null}

      {status === "goodnight" ? (
        <Card isDark={app.darkMode} padding={16} style={styles.banner}>
          <Badge tone="muted" isDark={app.darkMode}>
            Sleep timer
          </Badge>
          <T variant="body" style={styles.bannerText}>
            The timer faded playback out. Good night — Stillwater will keep
            your place at {formatClock(elapsed)}.
          </T>
        </Card>
      ) : null}

      {/* Progress */}
      <View>
        <Progress
          value={pct}
          tint={accentColor(app.backdrop)}
          accessibilityLabel="Session progress"
          isDark={app.darkMode}
        />
        <View style={styles.timeRow}>
          <Figure variant="caption" muted>
            {formatClock(elapsed)}
          </Figure>
          <Figure variant="caption" muted>
            −{formatClock(duration - elapsed)} left
          </Figure>
        </View>
      </View>

      {/* Transport */}
      <View style={styles.transport}>
        <Button
          isDark={app.darkMode}
          accessibilityLabel="Back 30 seconds"
          variant="glass"
          onPress={() => skip(-30)}
          style={styles.skipButton}
        >
          −30s
        </Button>
        <Button
          isDark={app.darkMode}
          accessibilityLabel={playing ? "Pause" : "Play"}
          variant="filled"
          onPress={togglePlay}
          style={styles.playButton}
        >
          {finished ? "Listen again" : playing ? "Pause" : "Play"}
        </Button>
        <Button
          isDark={app.darkMode}
          accessibilityLabel="Forward 30 seconds"
          variant="glass"
          onPress={() => skip(30)}
          style={styles.skipButton}
        >
          +30s
        </Button>
      </View>

      {/* Speed */}
      <View>
        <T variant="label" muted style={styles.controlLabel}>
          Playback speed
        </T>
        <SegmentedControl
          segments={SPEED_SEGMENTS}
          selectedIndex={speedIndex}
          onChange={setSpeedIndex}
          accessibilityLabel="Playback speed"
          isDark={app.darkMode}
        />
      </View>

      {/* Sleep timer */}
      <Field label="Sleep timer — fade out and stop" isDark={app.darkMode}>
        <Select
          value={sleepTimer}
          onValueChange={chooseSleepTimer}
          options={SLEEP_TIMER_OPTIONS}
          accessibilityLabel="Sleep timer"
          isDark={app.darkMode}
        />
      </Field>
      {sleepLeft !== null && !finished ? (
        <T variant="caption" muted style={styles.sleepNote}>
          Sleep timer: {formatClock(sleepLeft)} remaining
          {playing ? "" : " (counts down while playing)"}
        </T>
      ) : null}

      <T variant="caption" muted style={styles.foot}>
        Simulated playback — the timer is real, the audio is not
      </T>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 32,
    gap: 20,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: { alignSelf: "flex-start" },
  titleBlock: { gap: 4 },
  meta: { marginTop: 4 },
  blurb: { marginTop: 8 },
  banner: { gap: 12 },
  bannerText: { marginTop: 4 },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  transport: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  skipButton: { flexShrink: 0 },
  playButton: { flex: 1 },
  controlLabel: {
    marginBottom: 8,
    marginLeft: 4,
  },
  sleepNote: { marginTop: -8 },
  foot: { textAlign: "center" },
});
