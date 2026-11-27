import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Badge, Button, Field, Input } from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import CheckmarkCircle02Icon from "@hugeicons/core-free-icons/CheckmarkCircle02Icon";
import { useBank, type Recipient } from "./state";
import { ListCard, Screen, SectionTitle, T, accentColor, money } from "./ui";

type Step = "pick" | "confirm" | "done";

/**
 * Send — 3 steps, all validation unchanged (recipient required;
 * amount > $0; amount ≤ checking balance; top-up ≤ $10,000 lives on
 * Home). The amount is the primary focus on step 1: it comes first,
 * with a large live preview above the field, then the recipient list.
 */
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
  const accent = accentColor(bank.backdrop);

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
        <View style={styles.doneBody}>
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={48} color={accent} />
          <T variant="heading">
            {money(amount)} to {recipient.name}
          </T>
          <T variant="body" muted style={styles.doneSub}>
            From Main Checking ••{checking.last4} · New balance{" "}
            {money(bank.balanceOf("checking"))}
          </T>
          <Badge tone="muted" isDark={bank.darkMode}>
            Delivered
          </Badge>
        </View>
        <Button
          isDark={bank.darkMode}
          accessibilityLabel="Back to home"
          variant="filled"
          tint={accent}
          onPress={() => router.replace("/templates/bank/(tabs)")}
        >
          Back to home
        </Button>
        <Button
          isDark={bank.darkMode}
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
      <Screen title="Check it is right" subtitle="Step 2 of 3 · Payments are instant and cannot be recalled">
        <ListCard>
          <View style={styles.confirmBody}>
            <Avatar name={recipient.name} size="lg" isDark={bank.darkMode} source={recipient.image} />
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
          isDark={bank.darkMode}
          accessibilityLabel={`Send ${money(amount)} to ${recipient.name}`}
          variant="filled"
          tint={accent}
          onPress={() => {
            bank.sendMoney(recipient, amount, note);
            setStep("done");
          }}
        >{`Send ${money(amount)}`}</Button>
        <Button
          isDark={bank.darkMode}
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
    <Screen title="Send money" subtitle={`Step 1 of 3 · From Main Checking · ${money(balance)} available`}>
      {/* Amount first — the primary focus of this step. */}
      <View>
        <T
          variant="title"
          style={[
            styles.amountPreview,
            { color: amount > 0 ? accent : undefined },
          ]}
        >
          {amountText.trim() && !Number.isNaN(amount) && amount > 0
            ? money(amount)
            : "$0.00"}
        </T>
        <Field label="Amount" error={error} isDark={bank.darkMode}>
          <Input
            value={amountText}
            onChangeText={setAmountText}
            placeholder="0.00"
            keyboardType="numeric"
            size="lg"
            accessibilityLabel="Amount to send"
            invalid={!!error}
            isDark={bank.darkMode}
            prefix={<T variant="body" muted>$</T>}
          />
        </Field>
      </View>

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
                <Avatar name={r.name} size="md" isDark={bank.darkMode} source={r.image} />
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
        isDark={bank.darkMode}
        accessibilityLabel="Review payment"
        variant="filled"
        tint={accent}
        onPress={() => {
          if (validate()) setStep("confirm");
        }}
      >
        Review payment
      </Button>
      <Button accessibilityLabel="Cancel" variant="ghost" onPress={() => router.back()} isDark={bank.darkMode}>
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
  amountPreview: {
    fontSize: 40,
    lineHeight: 46,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    marginBottom: 12,
  },
  confirmBody: {
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  confirmAmount: { marginTop: 8, fontVariant: ["tabular-nums"] },
  doneBody: { alignItems: "center", gap: 10, paddingTop: 16 },
  doneSub: { textAlign: "center" },
});
