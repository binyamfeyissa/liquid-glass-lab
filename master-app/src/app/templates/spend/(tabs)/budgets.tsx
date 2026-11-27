import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Button, Card, Field, Input, Progress, Sheet } from "glacia-native";

import { CURRENT_MONTH, useTally, type Category } from "../state";
import {
  Figure,
  ListCard,
  RowSeparator,
  Screen,
  SectionTitle,
  T,
  usePalette,
} from "../ui";

export default function BudgetsScreen() {
  const tally = useTally();
  const palette = usePalette();
  const [editing, setEditing] = useState<Category | null>(null);
  const [limitText, setLimitText] = useState("");
  const [limitError, setLimitError] = useState<string | undefined>();

  const totalSpent = tally.spentForMonth(CURRENT_MONTH);
  const totalPct = Math.min(
    100,
    Math.round((totalSpent / tally.totalBudget) * 100),
  );

  const openEditor = (category: Category, current: number) => {
    setEditing(category);
    setLimitText(String(current));
    setLimitError(undefined);
  };

  const saveLimit = () => {
    if (!editing) return;
    const value = Number(limitText.replace(/[^0-9.]/g, ""));
    if (!limitText.trim() || Number.isNaN(value) || value <= 0) {
      setLimitError("Enter a limit above 0");
      return;
    }
    tally.setBudgetLimit(editing, Math.round(value * 100) / 100);
    setEditing(null);
  };

  return (
    <Screen belowTabBar title="Budgets" subtitle="Monthly limits for November">
      <Card isDark={tally.darkMode} padding={24}>
        <T variant="label" muted>
          All budgets
        </T>
        <View style={styles.summaryTotal}>
          <Figure variant="heading">{tally.format(totalSpent)}</Figure>
          <Figure variant="body" muted>
            {" "}
            of {tally.format(tally.totalBudget)}
          </Figure>
        </View>
        <Progress
          value={totalPct}
          isDark={tally.darkMode}
          tint={palette.accent}
          accessibilityLabel="Total budget used"
        />
        <Figure variant="caption" muted style={styles.summaryNote}>
          {totalPct}% used · {tally.format(tally.totalBudget - totalSpent)} left
        </Figure>
      </Card>

      <View>
        <SectionTitle>By category</SectionTitle>
        <ListCard>
          {tally.budgets.map((budget, i) => {
            const spent = tally.spentForCategory(CURRENT_MONTH, budget.category);
            const over = spent > budget.limit;
            const pct = Math.min(100, Math.round((spent / budget.limit) * 100));
            return (
              <React.Fragment key={budget.category}>
                {i > 0 ? <RowSeparator /> : null}
                <Pressable
                  onPress={() => openEditor(budget.category, budget.limit)}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${budget.category} budget`}
                  style={({ pressed }) => [
                    styles.budgetRow,
                    pressed && {
                      backgroundColor: tally.darkMode
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.05)",
                    },
                  ]}
                >
                  <View style={styles.budgetHead}>
                    <T variant="body">{budget.category}</T>
                    {over ? (
                      <Figure
                        variant="body"
                        style={{ color: palette.danger }}
                      >
                        {tally.format(spent - budget.limit)} over
                      </Figure>
                    ) : (
                      <Figure variant="body" muted>
                        {tally.format(budget.limit - spent)} left
                      </Figure>
                    )}
                  </View>
                  <Progress
                    value={pct}
                    isDark={tally.darkMode}
                    tint={over ? palette.danger : palette.accent}
                    accessibilityLabel={`${budget.category} budget used`}
                  />
                  <Figure variant="caption" muted>
                    {tally.format(spent)} of {tally.format(budget.limit)}
                    {over ? "" : ` · ${pct}% used`}
                  </Figure>
                </Pressable>
              </React.Fragment>
            );
          })}
        </ListCard>
      </View>

      <T variant="caption" muted style={styles.foot}>
        Bills runs over in November — rent, utilities and internet land in the
        first days of the month
      </T>

      {/* Edit-limit sheet */}
      <Sheet
        visible={editing !== null}
        onDismiss={() => setEditing(null)}
        isDark={tally.darkMode}
        height={360}
      >
        <View style={styles.sheetBody}>
          <T variant="heading">
            {editing ? `${editing} budget` : "Budget"}
          </T>
          <Field label="Monthly limit" error={limitError} isDark={tally.darkMode}>
            <Input
              value={limitText}
              onChangeText={(text) => {
                setLimitText(text);
                setLimitError(undefined);
              }}
              placeholder="0.00"
              keyboardType="numeric"
              accessibilityLabel="Monthly limit"
              invalid={!!limitError}
              isDark={tally.darkMode}
            />
          </Field>
          <Button isDark={tally.darkMode} accessibilityLabel="Save limit" variant="filled" onPress={saveLimit}>
            Save limit
          </Button>
        </View>
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryTotal: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 8,
    marginBottom: 12,
  },
  summaryNote: { marginTop: 8 },
  budgetRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    borderRadius: 12,
  },
  budgetHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  foot: { paddingHorizontal: 4 },
  sheetBody: { paddingHorizontal: 24, paddingTop: 8, gap: 16 },
});
