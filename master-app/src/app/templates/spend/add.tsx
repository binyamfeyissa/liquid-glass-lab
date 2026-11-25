import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import {
  Button,
  Chip,
  Field,
  Input,
  SegmentedControl,
  Stepper,
} from "glacia-native";

import {
  EXPENSE_CATEGORIES,
  FIXTURE_TODAY,
  useTally,
  type Category,
} from "./state";
import { ListCard, Screen, SectionTitle, T, dayLabel, shiftDay } from "./ui";

export default function AddExpenseScreen() {
  const tally = useTally();
  const [typeIndex, setTypeIndex] = useState(0); // 0 = expense, 1 = income
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState<string | undefined>();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Groceries");
  const [note, setNote] = useState("");
  const [dayOffset, setDayOffset] = useState(0);

  const isExpense = typeIndex === 0;
  const date = shiftDay(FIXTURE_TODAY, dayOffset);

  const save = () => {
    const value = Number(amount.replace(/[^0-9.]/g, ""));
    if (!amount.trim() || Number.isNaN(value) || value <= 0) {
      setAmountError("Enter an amount above 0");
      return;
    }
    if (value > 1000000) {
      setAmountError("That looks too large — check the amount");
      return;
    }
    tally.addTransaction({
      title: title.trim() || (isExpense ? category : "Income"),
      category: isExpense ? category : "Income",
      amount: isExpense ? -value : value,
      date,
      note: note.trim() || undefined,
    });
    // Reset for the next visit (stack screens stay mounted), then go back.
    setAmount("");
    setTitle("");
    setNote("");
    setDayOffset(0);
    setAmountError(undefined);
    router.back();
  };

  return (
    <Screen title={isExpense ? "Add expense" : "Add income"}>
      <SegmentedControl
        segments={["Expense", "Income"]}
        selectedIndex={typeIndex}
        onChange={setTypeIndex}
        isDark={tally.darkMode}
        accessibilityLabel="Type"
      />

      <Field label="Amount" error={amountError} isDark={tally.darkMode}>
        <Input
          value={amount}
          onChangeText={(text) => {
            setAmount(text);
            setAmountError(undefined);
          }}
          placeholder="0.00"
          keyboardType="numeric"
          accessibilityLabel="Amount"
          invalid={!!amountError}
          isDark={tally.darkMode}
        />
      </Field>

      <Field label="Name" isDark={tally.darkMode}>
        <Input
          value={title}
          onChangeText={setTitle}
          placeholder={isExpense ? "e.g. Weekly shop" : "e.g. Salary"}
          accessibilityLabel="Name"
          isDark={tally.darkMode}
        />
      </Field>

      {isExpense ? (
        <View>
          <SectionTitle>Category</SectionTitle>
          <View style={styles.chipGrid}>
            {EXPENSE_CATEGORIES.map((c) => (
              <Chip
                key={c}
                label={c}
                selected={category === c}
                onSelectedChange={(selected) => {
                  if (selected) setCategory(c);
                }}
                isDark={tally.darkMode}
              />
            ))}
          </View>
        </View>
      ) : null}

      <View>
        <SectionTitle>Date</SectionTitle>
        <ListCard>
          <View style={styles.dateRow}>
            <View style={styles.dateText}>
              <T variant="body">{dayLabel(date)}</T>
              <T variant="caption" muted style={styles.dateCaption}>
                Up to 30 days back
              </T>
            </View>
            <Stepper
              value={dayOffset}
              onValueChange={setDayOffset}
              min={-30}
              max={0}
              step={1}
              formatValue={(v) => (v === 0 ? "Today" : `${v}d`)}
              accessibilityLabel="Date"
              isDark={tally.darkMode}
            />
          </View>
        </ListCard>
      </View>

      <Field label="Note (optional)" isDark={tally.darkMode}>
        <Input
          value={note}
          onChangeText={setNote}
          placeholder="Add a note"
          accessibilityLabel="Note"
          isDark={tally.darkMode}
        />
      </Field>

      <Button isDark={tally.darkMode} accessibilityLabel="Save" variant="filled" size="lg" onPress={save}>
        Save {isExpense ? "expense" : "income"}
      </Button>
      <Button isDark={tally.darkMode} accessibilityLabel="Cancel" variant="ghost" onPress={() => router.back()}>
        Cancel
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 16,
  },
  dateText: { flex: 1 },
  dateCaption: { marginTop: 4 },
});
