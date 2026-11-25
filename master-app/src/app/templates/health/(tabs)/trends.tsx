import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Card, SegmentedControl } from "glacia-native";

import { useHealth } from "../state";
import {
  dateKey,
  formatValue,
  METRIC_META,
  weekdayLetter,
  type Metric,
} from "../data";
import {
  Bars,
  Figure,
  ListCard,
  Screen,
  SectionTitle,
  SettingRow,
  T,
} from "../ui";

const METRICS: Metric[] = ["steps", "water", "sleep", "weight", "mood"];

export default function TrendsScreen() {
  const app = useHealth();
  const [metricIndex, setMetricIndex] = useState(0);
  const [rangeIndex, setRangeIndex] = useState(0); // 0 = 7 days, 1 = 14 days

  const metric = METRICS[metricIndex];
  const days = rangeIndex === 0 ? 7 : 14;

  const { values, labels, average, best, goalDays, change } = useMemo(() => {
    const vals: number[] = [];
    const labs: string[] = [];
    for (let ago = days - 1; ago >= 0; ago--) {
      const key = dateKey(ago);
      labs.push(weekdayLetter(key));
      if (metric === "steps" || metric === "water") {
        vals.push(app.dayTotal(metric, key));
      } else {
        vals.push(app.dayLatest(metric, key) ?? 0);
      }
    }
    const present = vals.filter((v) => v > 0);
    const avg = present.length
      ? present.reduce((a, b) => a + b, 0) / present.length
      : 0;
    const goal =
      metric === "steps"
        ? app.goals.steps
        : metric === "water"
          ? app.goals.water
          : metric === "sleep"
            ? app.goals.sleep
            : 0;
    return {
      values: vals,
      labels: labs,
      average: avg,
      best: present.length ? Math.max(...present) : 0,
      goalDays:
        goal > 0
          ? vals.filter((v) => v >= goal).length
          : 0,
      change:
        metric === "weight" &&
        vals.find((v) => v > 0) !== undefined &&
        vals[vals.length - 1] > 0
          ? vals[vals.length - 1] - vals.find((v) => v > 0)!
          : undefined,
    };
  }, [app, metric, days]);

  const meta = METRIC_META[metric];

  return (
    <Screen title="Trends" subtitle="From the entries in your log — sample data">
      <SegmentedControl
        segments={METRICS.map((m) => METRIC_META[m].label)}
        selectedIndex={metricIndex}
        onChange={setMetricIndex}
        accessibilityLabel="Metric"
        isDark={app.darkMode}
      />
      <SegmentedControl
        segments={["Last 7 days", "Last 14 days"]}
        selectedIndex={rangeIndex}
        onChange={setRangeIndex}
        accessibilityLabel="Range"
        isDark={app.darkMode}
      />

      <Card isDark={app.darkMode} padding={20}>
        <View style={styles.chartHead}>
          <T variant="heading">{meta.label}</T>
          <Figure variant="caption" muted>
            avg {formatValue(metric, Math.round(average * 10) / 10)}
            {metric === "steps" || metric === "water" ? " / day" : ""}
          </Figure>
        </View>
        <Bars
          values={values}
          labels={labels}
          height={120}
          floor={
            metric === "weight"
              ? Math.min(...values.filter((v) => v > 0)) - 1
              : undefined
          }
        />
        {metric === "weight" ? (
          <T variant="caption" muted style={styles.chartNote}>
            Scale starts at the lowest reading so small changes stay visible
          </T>
        ) : null}
      </Card>

      <View>
        <SectionTitle>Summary</SectionTitle>
        <ListCard>
          <SettingRow
            title="Average"
            description={`Across the last ${days} days`}
          >
            <Figure variant="body">
              {formatValue(metric, Math.round(average * 10) / 10)}
              {metric === "steps" || metric === "water" ? " / day" : ""}
            </Figure>
          </SettingRow>
          <SettingRow title="Best day" description="Highest value in range">
            <Figure variant="body">{formatValue(metric, best)}</Figure>
          </SettingRow>
          {metric === "weight" ? (
            <SettingRow
              title="Change"
              description="First reading to latest in range"
            >
              <Figure variant="body">
                {change !== undefined
                  ? `${change <= 0 ? "−" : "+"}${Math.abs(change).toFixed(1)} kg`
                  : "—"}
              </Figure>
            </SettingRow>
          ) : (
            <SettingRow
              title="Goal days"
              description={`Days at or over your ${meta.label.toLowerCase()} goal`}
            >
              <Figure variant="body">
                {goalDays} of {days}
              </Figure>
            </SettingRow>
          )}
          <SettingRow
            title="Days logged"
            description="Days with at least one entry"
          >
            <Figure variant="body">
              {values.filter((v) => v > 0).length} of {days}
            </Figure>
          </SettingRow>
        </ListCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chartHead: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  chartNote: { marginTop: 12 },
});
