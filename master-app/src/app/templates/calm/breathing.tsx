import React, { useEffect, useRef, useState } from "react";
import { Animated, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Badge, Button, Card, Field, Select } from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import CheckmarkCircle02Icon from "@hugeicons/core-free-icons/CheckmarkCircle02Icon";
import PlayIcon from "@hugeicons/core-free-icons/PlayIcon";

import { useStillwater } from "./state";
import { BREATH_PATTERNS, CYCLE_OPTIONS } from "./data";
import { BackButton, BUTTON_PAD, FILLED_TINT, ListCard, RowSeparator, SAGE, SectionTitle, T, accentColor } from "./ui";

/**
 * Guided breathing. A timer-driven state machine walks the pattern's
 * phases (in / hold / out / hold), the circle swells and settles with an
 * Animated timing matched to each phase, and finishing the chosen
 * number of cycles credits the practice to the shared store.
 */
export default function BreathingScreen() {
  const app = useStillwater();
  const [patternId, setPatternId] = useState(BREATH_PATTERNS[0].id);
  const [cyclesChoice, setCyclesChoice] = useState("6");
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [phaseLeft, setPhaseLeft] = useState(BREATH_PATTERNS[0].phases[0].seconds);
  const [cycle, setCycle] = useState(1);

  const pattern = BREATH_PATTERNS.find((p) => p.id === patternId) ?? BREATH_PATTERNS[0];
  const targetCycles = Number(cyclesChoice);
  const phase = pattern.phases[phaseIdx];
  const cycleSeconds = pattern.phases.reduce((a, p) => a + p.seconds, 0);
  const totalMinutes = Math.max(1, Math.round((cycleSeconds * targetCycles) / 60));

  const scale = useRef(new Animated.Value(1)).current;
  const creditedRef = useRef(false);

  const reset = (nextPattern = pattern) => {
    setRunning(false);
    setCompleted(false);
    setPhaseIdx(0);
    setPhaseLeft(nextPattern.phases[0].seconds);
    setCycle(1);
    creditedRef.current = false;
  };

  // The circle follows the current phase.
  useEffect(() => {
    Animated.timing(scale, {
      toValue: running ? phase.scale : 1,
      duration: running ? phase.seconds * 1000 : 350,
      useNativeDriver: true,
    }).start();
  }, [running, phaseIdx, patternId, phase, scale]);

  // The phase clock.
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => {
      if (phaseLeft > 1) {
        setPhaseLeft(phaseLeft - 1);
        return;
      }
      const nextIdx = phaseIdx + 1;
      if (nextIdx < pattern.phases.length) {
        setPhaseIdx(nextIdx);
        setPhaseLeft(pattern.phases[nextIdx].seconds);
        return;
      }
      if (cycle >= targetCycles) {
        setRunning(false);
        setCompleted(true);
        setPhaseIdx(0);
        setPhaseLeft(pattern.phases[0].seconds);
        if (!creditedRef.current) {
          creditedRef.current = true;
          app.completePractice({
            kind: "breathing",
            title: `Breathing · ${pattern.name}`,
            minutes: totalMinutes,
          });
        }
        return;
      }
      setCycle(cycle + 1);
      setPhaseIdx(0);
      setPhaseLeft(pattern.phases[0].seconds);
    }, 1000);
    return () => clearTimeout(t);
  }, [running, phaseLeft, phaseIdx, cycle, pattern, targetCycles, app, totalMinutes]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topRow}>
        <BackButton onPress={() => router.back()} />
        <Badge tone="muted" isDark={app.darkMode}>
          Breathing
        </Badge>
      </View>

      <View style={styles.titleBlock}>
        <T variant="title">Breathing</T>
        <T variant="body" muted>
          {pattern.detail} · {targetCycles} cycles, about {totalMinutes} min
        </T>
      </View>

      {/* The breathing circle — the app's one moving thing. A hairline
          ring marks its full swell (200pt × 1.45) so the motion has a
          frame; the phase names underneath name the moment. The timing
          logic is untouched. */}
      <View style={styles.stage}>
        <View style={[styles.ring, { borderColor: `${accentColor(app.backdrop)}33` }]}>
          <Animated.View
            style={[
              styles.circle,
              {
                transform: [{ scale }],
                backgroundColor: SAGE.deep,
              },
            ]}
          >
            <T variant="heading" style={styles.circlePhase}>
              {completed ? "Done" : running || phaseIdx > 0 || cycle > 1 ? phase.label : "Ready"}
            </T>
            <T variant="title" style={styles.circleCount}>
              {completed ? totalMinutes : running ? phaseLeft : "·"}
            </T>
            <T variant="caption" style={styles.circleCycle}>
              {completed
                ? "minutes added"
                : `Cycle ${Math.min(cycle, targetCycles)} of ${targetCycles}`}
            </T>
          </Animated.View>
        </View>
      </View>

      <View style={styles.phaseRow}>
        {Array.from(new Set(pattern.phases.map((p) => p.label))).map((label, i) => (
          <React.Fragment key={label}>
            {i > 0 ? (
              <T variant="caption" muted>
                ·
              </T>
            ) : null}
            <T
              variant="caption"
              muted={phase.label !== label}
              style={phase.label === label ? { color: accentColor(app.backdrop) } : undefined}
            >
              {label}
            </T>
          </React.Fragment>
        ))}
      </View>

      {completed ? (
        <Card isDark={app.darkMode} padding={16} style={styles.banner}>
          <View style={styles.bannerHead}>
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={22} color={accentColor(app.backdrop)} />
            <Badge tone="muted" isDark={app.darkMode}>
              Round complete
            </Badge>
          </View>
          <T variant="body" style={styles.bannerText}>
            {totalMinutes} minute{totalMinutes > 1 ? "s" : ""} of {pattern.name}{" "}
            breathing added to today — you're at {app.todayMinutes} minutes.
          </T>
        </Card>
      ) : null}

      <Button
        isDark={app.darkMode}
        accessibilityLabel={running ? "Stop breathing exercise" : "Start breathing exercise"}
        variant="filled"
        tint={FILLED_TINT}
        icon={
          running ? undefined : (
            <HugeiconsIcon icon={PlayIcon} size={18} color="#ffffff" />
          )
        }
        onPress={() => {
          if (running) {
            reset();
          } else {
            setCompleted(false);
            creditedRef.current = false;
            setRunning(true);
          }
        }}
      >
        {running ? "Stop" : completed ? "Breathe again" : "Start breathing"}
      </Button>

      {/* Pattern + cycles */}
      <View>
        <SectionTitle>Pattern</SectionTitle>
        <ListCard>
          {BREATH_PATTERNS.map((p, i) => (
            <React.Fragment key={p.id}>
              {i > 0 ? <RowSeparator /> : null}
              <View style={styles.patternRow}>
                <View style={styles.patternText}>
                  <T variant="body">{p.name}</T>
                  <T variant="caption" muted style={styles.patternSub}>
                    {p.detail}
                  </T>
                </View>
                <Button
                  isDark={app.darkMode}
                  accessibilityLabel={`Use the ${p.name} pattern`}
                  variant={p.id === patternId ? "filled" : "ghost"}
                  size="sm"
                  tint={p.id === patternId ? FILLED_TINT : undefined}
                  contentStyle={p.id === patternId ? BUTTON_PAD : undefined}
                  onPress={() => {
                    setPatternId(p.id);
                    reset(p);
                  }}
                >
                  {p.id === patternId ? "Active" : "Use"}
                </Button>
              </View>
            </React.Fragment>
          ))}
        </ListCard>
      </View>

      <Field label="Cycles" isDark={app.darkMode}>
        <Select
          value={cyclesChoice}
          onValueChange={(v) => {
            setCyclesChoice(v);
            reset();
          }}
          options={CYCLE_OPTIONS}
          accessibilityLabel="Number of breathing cycles"
          isDark={app.darkMode}
        />
      </Field>

      <T variant="caption" muted style={styles.foot}>
        Finishing a round logs it on Progress
      </T>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 112,
    paddingBottom: 32,
    gap: 20,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleBlock: { gap: 8 },
  stage: {
    alignItems: "center",
    justifyContent: "center",
    height: 320,
  },
  ring: {
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  circlePhase: { color: "#ffffff" },
  circleCount: { color: "#ffffff" },
  circleCycle: { color: "rgba(255,255,255,0.75)" },
  phaseRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: -8,
  },
  banner: { gap: 12 },
  bannerHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bannerText: { marginTop: 4 },
  patternRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  patternText: { flex: 1 },
  patternSub: { marginTop: 4 },
  foot: { textAlign: "center" },
});
