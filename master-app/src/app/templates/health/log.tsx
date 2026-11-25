import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, Input, SegmentedControl, Slider, Stepper } from "glacia-native";

import { useHealth } from "./state";
import { MOOD_LABELS, todayKey } from "./data";
import {
  chromeColors,
  Field,
  ListCard,
  RowSeparator,
  Screen,
  SectionTitle,
  T,
} from "./ui";

/**
 * Quick-log forms. Every form validates, writes a dated entry into the
 * shared store, and confirms inline — the entry shows up immediately on
 * Today, in Trends and in History.
 */
export default function LogScreen() {
  const app = useHealth();
  const chrome = chromeColors(app.backdrop);
  const today = todayKey();

  const [weightText, setWeightText] = useState("");
  const [weightError, setWeightError] = useState("");
  const [weightSaved, setWeightSaved] = useState(false);

  const [stepsText, setStepsText] = useState("");
  const [stepsError, setStepsError] = useState("");
  const [stepsSaved, setStepsSaved] = useState(false);

  const [waterAdd, setWaterAdd] = useState(1);
  const [waterSaved, setWaterSaved] = useState(false);

  const [sleepHours, setSleepHours] = useState(7.5);
  const [sleepSaved, setSleepSaved] = useState(false);

  const [moodIndex, setMoodIndex] = useState(-1);
  const [moodSaved, setMoodSaved] = useState(false);

  function saveWeight() {
    const value = Number(weightText.replace(",", "."));
    if (!weightText.trim() || Number.isNaN(value)) {
      setWeightError("Enter your weight as a number, e.g. 69.4");
      setWeightSaved(false);
      return;
    }
    if (value < 30 || value > 300) {
      setWeightError("That looks off — weight must be between 30 and 300 kg.");
      setWeightSaved(false);
      return;
    }
    app.addEntry("weight", Math.round(value * 10) / 10);
    setWeightError("");
    setWeightSaved(true);
    setWeightText("");
  }

  function saveSteps() {
    const value = Number(stepsText);
    if (!stepsText.trim() || Number.isNaN(value) || !Number.isInteger(value)) {
      setStepsError("Enter a whole number of steps, e.g. 1200");
      setStepsSaved(false);
      return;
    }
    if (value <= 0 || value > 100000) {
      setStepsError("Steps must be between 1 and 100,000.");
      setStepsSaved(false);
      return;
    }
    app.addEntry("steps", value);
    setStepsError("");
    setStepsSaved(true);
    setStepsText("");
  }

  function saveWater() {
    app.setDayTotal("water", today, app.dayTotal("water", today) + waterAdd);
    setWaterSaved(true);
  }

  function saveSleep() {
    app.addEntry("sleep", sleepHours);
    setSleepSaved(true);
  }

  function saveMood() {
    if (moodIndex < 0) return;
    app.addEntry("mood", moodIndex + 1);
    setMoodSaved(true);
  }

  return (
    <Screen title="Log entry" subtitle="One form per metric, saved with today's date">
      <Button
        isDark={app.darkMode}
        accessibilityLabel="Back"
        variant="ghost"
        onPress={() => router.back()}
        style={styles.backBtn}
      >
        Back
      </Button>

      {/* Weight */}
      <View>
        <SectionTitle>Weight</SectionTitle>
        <ListCard>
          <Field label="Weight (kg)">
            <Input
              value={weightText}
              onChangeText={(t) => {
                setWeightText(t);
                setWeightSaved(false);
              }}
              placeholder={
                app.latestWeight() !== undefined
                  ? `Last logged ${app.latestWeight()!.toFixed(1)} kg`
                  : "e.g. 69.4"
              }
              keyboardType="numeric"
              accessibilityLabel="Weight in kilograms"
              isDark={app.darkMode}
            />
          </Field>
          {weightError ? (
            <T variant="caption" style={[styles.error, { color: chrome.neg }]}>
              {weightError}
            </T>
          ) : null}
          {weightSaved ? (
            <T variant="caption" style={[styles.saved, { color: chrome.pos }]}>
              Saved to today's log
            </T>
          ) : null}
          <View style={styles.cardBtn}>
            <Button
              isDark={app.darkMode}
              accessibilityLabel="Save weight"
              variant="filled"
              onPress={saveWeight}
            >
              Save weight
            </Button>
          </View>
        </ListCard>
      </View>

      {/* Steps */}
      <View>
        <SectionTitle>Steps</SectionTitle>
        <ListCard>
          <Field label="Steps to add">
            <Input
              value={stepsText}
              onChangeText={(t) => {
                setStepsText(t);
                setStepsSaved(false);
              }}
              placeholder="e.g. 1200"
              keyboardType="numeric"
              accessibilityLabel="Steps to add"
              isDark={app.darkMode}
            />
          </Field>
          {stepsError ? (
            <T variant="caption" style={[styles.error, { color: chrome.neg }]}>
              {stepsError}
            </T>
          ) : null}
          {stepsSaved ? (
            <T variant="caption" style={[styles.saved, { color: chrome.pos }]}>
              Added — today's total is {app.dayTotal("steps", today).toLocaleString("en-US")}
            </T>
          ) : null}
          <View style={styles.cardBtn}>
            <Button
              isDark={app.darkMode}
              accessibilityLabel="Add steps"
              variant="filled"
              onPress={saveSteps}
            >
              Add steps
            </Button>
          </View>
        </ListCard>
      </View>

      {/* Water */}
      <View>
        <SectionTitle>Water</SectionTitle>
        <ListCard>
          <View style={styles.rowBetween}>
            <View style={styles.flex1}>
              <T variant="body">Glasses to add</T>
              <T variant="caption" muted style={styles.sub}>
                Today so far: {app.dayTotal("water", today)} of {app.goals.water}
              </T>
            </View>
            <Stepper
              value={waterAdd}
              onValueChange={(v) => {
                setWaterAdd(v);
                setWaterSaved(false);
              }}
              min={1}
              max={10}
              accessibilityLabel="Glasses of water to add"
              isDark={app.darkMode}
            />
          </View>
          {waterSaved ? (
            <T variant="caption" style={[styles.savedPad, { color: chrome.pos }]}>
              Added — today is now {app.dayTotal("water", today)} glasses
            </T>
          ) : null}
          <View style={styles.cardBtn}>
            <Button
              isDark={app.darkMode}
              accessibilityLabel="Add water"
              variant="filled"
              onPress={saveWater}
            >
              Add water
            </Button>
          </View>
        </ListCard>
      </View>

      {/* Sleep */}
      <View>
        <SectionTitle>Sleep</SectionTitle>
        <ListCard>
          <Field label={`Last night: ${sleepHours} hours`}>
            <Slider
              value={sleepHours}
              min={0}
              max={14}
              step={0.5}
              onValueChange={(v) => {
                setSleepHours(v);
                setSleepSaved(false);
              }}
              accessibilityLabel="Hours of sleep"
              isDark={app.darkMode}
            />
          </Field>
          {sleepSaved ? (
            <T variant="caption" style={[styles.saved, { color: chrome.pos }]}>
              Saved — {sleepHours} h logged for last night
            </T>
          ) : null}
          <View style={styles.cardBtn}>
            <Button
              isDark={app.darkMode}
              accessibilityLabel="Save sleep"
              variant="filled"
              onPress={saveSleep}
            >
              Save sleep
            </Button>
          </View>
        </ListCard>
      </View>

      {/* Mood */}
      <View>
        <SectionTitle>Mood</SectionTitle>
        <ListCard>
          <View style={styles.moodHead}>
            <T variant="heading">
              {moodIndex >= 0 ? MOOD_LABELS[moodIndex + 1] : "Mood for today"}
            </T>
            <T variant="caption" muted>
              {moodIndex >= 0 ? "Your pick for today" : "Not picked yet"}
            </T>
          </View>
          <View style={styles.segmentPad}>
            <SegmentedControl
              segments={["Awful", "Low", "Okay", "Good", "Great"]}
              selectedIndex={Math.max(0, moodIndex)}
              onChange={(i) => {
                setMoodIndex(i);
                setMoodSaved(false);
              }}
              accessibilityLabel="Mood"
              isDark={app.darkMode}
            />
          </View>
          {moodSaved ? (
            <T variant="caption" style={[styles.saved, { color: chrome.pos }]}>
              Saved — feeling {MOOD_LABELS[moodIndex + 1].toLowerCase()} today
            </T>
          ) : null}
          <View style={styles.cardBtn}>
            <Button
              isDark={app.darkMode}
              accessibilityLabel="Save mood"
              variant="filled"
              onPress={saveMood}
            >
              Save mood
            </Button>
          </View>
        </ListCard>
      </View>

      <RowSeparator />
      <Button
        isDark={app.darkMode}
        accessibilityLabel="View history"
        variant="ghost"
        onPress={() => router.push("/templates/health/history")}
      >
        See everything in History
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  backBtn: { alignSelf: "flex-start" },
  error: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  saved: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  savedPad: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  cardBtn: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  sub: { marginTop: 2 },
  moodHead: {
    alignItems: "center",
    gap: 4,
    paddingTop: 16,
  },
  segmentPad: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});
