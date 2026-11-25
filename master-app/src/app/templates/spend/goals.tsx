import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Badge, Button, Field, Input, Progress, Sheet } from "glacia-native";

import { useTally, type Goal } from "./state";
import {
  Figure,
  ListCard,
  RowSeparator,
  Screen,
  SectionTitle,
  T,
  usePalette,
} from "./ui";

type SheetState =
  | { kind: "contribute"; goal: Goal }
  | { kind: "add" }
  | null;

export default function GoalsScreen() {
  const tally = useTally();
  const palette = usePalette();
  const [sheet, setSheet] = useState<SheetState>(null);
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState<string | undefined>();
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalError, setGoalError] = useState<string | undefined>();

  const totalSaved = tally.goals.reduce((sum, g) => sum + g.saved, 0);
  const totalTarget = tally.goals.reduce((sum, g) => sum + g.target, 0);

  const openContribute = (goal: Goal) => {
    setSheet({ kind: "contribute", goal });
    setAmount("");
    setAmountError(undefined);
  };

  const openAdd = () => {
    setSheet({ kind: "add" });
    setGoalName("");
    setGoalTarget("");
    setGoalError(undefined);
  };

  const saveContribute = () => {
    if (!sheet || sheet.kind !== "contribute") return;
    const value = Number(amount.replace(/[^0-9.]/g, ""));
    if (!amount.trim() || Number.isNaN(value) || value <= 0) {
      setAmountError("Enter an amount above 0");
      return;
    }
    tally.contributeToGoal(sheet.goal.id, value);
    setSheet(null);
  };

  const saveGoal = () => {
    const target = Number(goalTarget.replace(/[^0-9.]/g, ""));
    if (!goalName.trim()) {
      setGoalError("Give the goal a name");
      return;
    }
    if (!goalTarget.trim() || Number.isNaN(target) || target <= 0) {
      setGoalError("Enter a target above 0");
      return;
    }
    tally.addGoal(goalName.trim(), target);
    setSheet(null);
  };

  return (
    <Screen
      title="Savings goals"
      subtitle={`${tally.format(totalSaved)} saved toward ${tally.format(totalTarget)} of goals`}
    >
      <View>
        <SectionTitle>Your goals</SectionTitle>
        <ListCard>
          {tally.goals.map((goal, i) => {
            const pct = Math.min(
              100,
              Math.round((goal.saved / goal.target) * 100),
            );
            const funded = goal.saved >= goal.target;
            return (
              <View key={goal.id}>
                {i > 0 ? <RowSeparator /> : null}
                <View style={styles.goalRow}>
                  <View style={styles.goalHead}>
                    <Avatar name={goal.name} size="lg" isDark={tally.darkMode} />
                    <View style={styles.goalText}>
                      <T variant="body">{goal.name}</T>
                      <Figure variant="caption" muted style={styles.goalMeta}>
                        {tally.format(goal.saved)} of {tally.format(goal.target)}
                      </Figure>
                    </View>
                    {funded ? (
                      <Badge tone="muted" isDark={tally.darkMode}>
                        Funded
                      </Badge>
                    ) : (
                      <Figure variant="body" muted>
                        {pct}%
                      </Figure>
                    )}
                  </View>
                  <Progress
                    value={pct}
                    isDark={tally.darkMode}
                    tint={palette.accent}
                    accessibilityLabel={`${goal.name} progress`}
                  />
                  <View style={styles.goalFoot}>
                    <Figure variant="caption" muted>
                      {funded
                        ? `${tally.format(goal.saved)} saved`
                        : `${tally.format(goal.target - goal.saved)} to go`}
                    </Figure>
                    <Button
                      accessibilityLabel={`Contribute to ${goal.name}`}
                      size="sm"
                      onPress={() => openContribute(goal)}
                    >
                      Contribute
                    </Button>
                  </View>
                </View>
              </View>
            );
          })}
        </ListCard>
      </View>

      <Button accessibilityLabel="New goal" variant="filled" onPress={openAdd}>
        New goal
      </Button>
      <Button accessibilityLabel="Back" variant="ghost" onPress={() => router.back()}>
        Back
      </Button>

      {/* Contribute sheet */}
      <Sheet
        visible={sheet?.kind === "contribute"}
        onDismiss={() => setSheet(null)}
        isDark={tally.darkMode}
        height={360}
      >
        <View style={styles.sheetBody}>
          <T variant="heading">
            {sheet?.kind === "contribute" ? sheet.goal.name : "Contribute"}
          </T>
          <T variant="body" muted>
            Move money into this goal
          </T>
          <Field label="Amount" error={amountError} isDark={tally.darkMode}>
            <Input
              value={amount}
              onChangeText={(text) => {
                setAmount(text);
                setAmountError(undefined);
              }}
              placeholder="0.00"
              keyboardType="numeric"
              accessibilityLabel="Contribution amount"
              invalid={!!amountError}
              isDark={tally.darkMode}
            />
          </Field>
          <Button
            accessibilityLabel="Save contribution"
            variant="filled"
            onPress={saveContribute}
          >
            Add to goal
          </Button>
        </View>
      </Sheet>

      {/* Add-goal sheet */}
      <Sheet
        visible={sheet?.kind === "add"}
        onDismiss={() => setSheet(null)}
        isDark={tally.darkMode}
        height={420}
      >
        <View style={styles.sheetBody}>
          <T variant="heading">New goal</T>
          <Field label="Name" error={goalError} isDark={tally.darkMode}>
            <Input
              value={goalName}
              onChangeText={(text) => {
                setGoalName(text);
                setGoalError(undefined);
              }}
              placeholder="e.g. Japan trip"
              accessibilityLabel="Goal name"
              isDark={tally.darkMode}
            />
          </Field>
          <Field label="Target amount" isDark={tally.darkMode}>
            <Input
              value={goalTarget}
              onChangeText={(text) => {
                setGoalTarget(text);
                setGoalError(undefined);
              }}
              placeholder="0.00"
              keyboardType="numeric"
              accessibilityLabel="Goal target"
              isDark={tally.darkMode}
            />
          </Field>
          <Button accessibilityLabel="Create goal" variant="filled" onPress={saveGoal}>
            Create goal
          </Button>
        </View>
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  goalRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  goalHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  goalText: { flex: 1 },
  goalMeta: { marginTop: 4 },
  goalFoot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sheetBody: { paddingHorizontal: 24, paddingTop: 8, gap: 16 },
});
