import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Badge, Button, Card, Field, Input } from "glacia-native";

import { useBank, type Recipient } from "./state";
import { ListCard, Screen, SectionTitle, T, money } from "./ui";

type Step = "pick" | "confirm" | "done";

export default function SendScreen() {
  const bank = useBank();
  const [step, setStep] = useState<Step>("pick");
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [amountText, setAmountText] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | undefined>();

  const checking = bank.accounts[0];
  const balance = bank.balanceOf("checking");
  const amount = useMemo(
    () => Number(amountText.replace(/[^0-9.]/g, "")),
    [amountText],
  );

  const validate = (): boolean => {
    if (!recipient) {
      setError("Pick a recipient");
      return false;
    }
    if (!amountText.trim() || Number.isNaN(amount) || amount <= 0) {
      setError("Enter an amount above $0");
      return false;
    }
    if (amount > balance) {
      setError(`That is more than your checking balance (${money(balance)})`);
      return false;
    }
    setError(undefined);
    return true;
  };

  if (step === "done" && recipient) {
    return (
      <Screen title="Money sent" subtitle="From Main Checking">
        <Card isDark={bank.darkMode} padding={20} contentStyle={styles.doneCard}>
          <T variant="heading">
            {money(amount)} to {recipient.name}
          </T>
          <T variant="body" muted>
            From Main Checking ••{checking.last4} · New balance {money(bank.balanceOf("checking"))}
          </T>
          <Badge tone="muted" isDark={bank.darkMode}>
            Delivered
          </Badge>
        </Card>
        <Button
          accessibilityLabel="Back to home"
          variant="filled"
          onPress={() => router.replace("/templates/bank/(tabs)")}
        >
          Back to home
        </Button>
        <Button
          accessibilityLabel="Send another payment"
          variant="ghost"
          onPress={() => {
            setStep("pick");
            setRecipient(null);
            setAmountText("");
            setNote("");
          }}
        >
          Send another payment
        </Button>
      </Screen>
    );
  }

  if (step === "confirm" && recipient) {
    return (
      <Screen title="Check it is right" subtitle="Payments are instant and cannot be recalled">
        <ListCard>
          <View style={styles.confirmBody}>
            <Avatar name={recipient.name} size="lg" isDark={bank.darkMode} />
            <T variant="heading">{recipient.name}</T>
            <T variant="caption" muted>
              {recipient.handle} · Northwind Pay
            </T>
            <T variant="title" style={styles.confirmAmount}>
              {money(amount)}
            </T>
            {note.trim() ? (
              <T variant="body" muted>
                “{note.trim()}”
              </T>
            ) : null}
            <T variant="caption" muted>
              From Main Checking ••{checking.last4} · Balance after:{" "}
              {money(balance - amount)}
            </T>
          </View>
        </ListCard>
        <Button
          accessibilityLabel={`Send ${money(amount)} to ${recipient.name}`}
          variant="filled"
          onPress={() => {
            bank.sendMoney(recipient, amount, note);
            setStep("done");
          }}
        >
          Send {money(amount)}
        </Button>
        <Button
          accessibilityLabel="Back to edit payment"
          variant="ghost"
          onPress={() => setStep("pick")}
        >
          Back and edit
        </Button>
      </Screen>
    );
  }

  return (
    <Screen title="Send money" subtitle={`From Main Checking · ${money(balance)} available`}>
      <View>
        <SectionTitle>Who to</SectionTitle>
        <ListCard>
          {bank.recipients.map((r) => {
            const selected = recipient?.id === r.id;
            return (
              <Pressable
                key={r.id}
                onPress={() => setRecipient(r)}
                accessibilityRole="button"
                accessibilityLabel={`Send to ${r.name}`}
                accessibilityState={{ selected }}
                style={({ pressed }) => [
                  styles.recipientRow,
                  selected && styles.recipientSelected,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Avatar name={r.name} size="md" isDark={bank.darkMode} />
                <View style={styles.recipientText}>
                  <T variant="body">{r.name}</T>
                  <T variant="caption" muted>
                    {r.handle}
                  </T>
                </View>
                {selected ? (
                  <Badge tone="muted" isDark={bank.darkMode}>
                    Selected
                  </Badge>
                ) : null}
              </Pressable>
            );
          })}
        </ListCard>
      </View>

      <Field label="Amount" error={error} isDark={bank.darkMode}>
        <Input
          value={amountText}
          onChangeText={setAmountText}
          placeholder="0.00"
          keyboardType="numeric"
          accessibilityLabel="Amount to send"
          invalid={!!error}
          isDark={bank.darkMode}
          prefix={<T variant="body" muted>$</T>}
        />
      </Field>

      <Field label="Note (optional)" isDark={bank.darkMode}>
        <Input
          value={note}
          onChangeText={setNote}
          placeholder="What's it for?"
          accessibilityLabel="Payment note"
          isDark={bank.darkMode}
        />
      </Field>

      <Button
        accessibilityLabel="Review payment"
        variant="filled"
        onPress={() => {
          if (validate()) setStep("confirm");
        }}
      >
        Review payment
      </Button>
      <Button accessibilityLabel="Cancel" variant="ghost" onPress={() => router.back()}>
        Cancel
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  recipientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  recipientSelected: {
    backgroundColor: "rgba(53, 160, 106, 0.12)",
  },
  recipientText: { flex: 1 },
  confirmBody: {
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  confirmAmount: { marginTop: 8, fontVariant: ["tabular-nums"] },
  doneCard: { alignItems: "center", gap: 8 },
});
