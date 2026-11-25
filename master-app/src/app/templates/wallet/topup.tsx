import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Badge, Button, Card, Field, Input } from "glacia-native";

import { useWallet, type PayCard } from "./state";
import { ListCard, Screen, SectionTitle, Figure, T } from "./ui";

type Step = "enter" | "done";

const QUICK_AMOUNTS = [50, 100, 250, 500];

export default function TopUpScreen() {
  const wallet = useWallet();
  const [step, setStep] = useState<Step>("enter");
  const [card, setCard] = useState<PayCard | null>(wallet.cards[0]);
  const [amountText, setAmountText] = useState("");
  const [error, setError] = useState<string | undefined>();

  const amount = useMemo(() => Number(amountText.replace(/[^0-9.]/g, "")), [amountText]);

  const validate = (): boolean => {
    if (!card) {
      setError("Pick a card to add money from");
      return false;
    }
    if (!amountText.trim() || Number.isNaN(amount) || amount <= 0) {
      setError("Enter an amount above $0");
      return false;
    }
    if (amount > 10000) {
      setError("Single top-ups are capped at $10,000 in this demo");
      return false;
    }
    setError(undefined);
    return true;
  };

  if (step === "done" && card) {
    return (
      <Screen title="Money added" subtitle="USD cash balance updated">
        <Card isDark={wallet.darkMode} padding={20} contentStyle={styles.doneCard}>
          <Figure variant="heading">+{wallet.fmt(amount)}</Figure>
          <T variant="body" muted>
            From {card.brand} ••{card.last4} · USD cash is now{" "}
            {wallet.fmt(wallet.balanceOf("usd"))}
          </T>
          <Badge tone="muted" isDark={wallet.darkMode}>
            Completed
          </Badge>
        </Card>
        <Button
          isDark={wallet.darkMode}
          accessibilityLabel="Back to portfolio"
          variant="glass"
          onPress={() => router.replace("/templates/wallet/(tabs)")}
        >
          Back to portfolio
        </Button>
        <Button
          isDark={wallet.darkMode}
          accessibilityLabel="Add more money"
          variant="ghost"
          onPress={() => {
            setStep("enter");
            setAmountText("");
          }}
        >
          Add more
        </Button>
      </Screen>
    );
  }

  return (
    <Screen title="Add money" subtitle="Add USD cash from a linked card">
      <View>
        <SectionTitle>From card</SectionTitle>
        <ListCard>
          {wallet.cards.map((c) => {
            const selected = card?.id === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => setCard(c)}
                accessibilityRole="button"
                accessibilityLabel={`Pay with ${c.brand} ending ${c.last4}`}
                accessibilityState={{ selected }}
                style={({ pressed }) => [
                  styles.cardRow,
                  selected && {
                    backgroundColor: wallet.darkMode
                      ? "rgba(129,140,248,0.16)"
                      : "rgba(67,56,202,0.08)",
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <View style={styles.cardGlyph}>
                  <Figure variant="caption">{c.last4}</Figure>
                </View>
                <View style={styles.flex}>
                  <T variant="body">
                    {c.brand} ••<Figure variant="body">{c.last4}</Figure>
                  </T>
                  <T variant="caption" muted>
                    {c.detail}
                  </T>
                </View>
                {selected ? (
                  <Badge tone="muted" isDark={wallet.darkMode}>
                    Selected
                  </Badge>
                ) : null}
              </Pressable>
            );
          })}
        </ListCard>
      </View>

      <View style={styles.quickRow}>
        {QUICK_AMOUNTS.map((q) => (
          <View key={q} style={styles.flex}>
            <Button
              isDark={wallet.darkMode}
              size="sm"
              accessibilityLabel={`Quick amount ${q} dollars`}
              variant={amount === q ? "filled" : "glass"}
              onPress={() => setAmountText(String(q))}
            >
              ${q}
            </Button>
          </View>
        ))}
      </View>

      <Field label="Amount (USD)" error={error} isDark={wallet.darkMode}>
        <Input
          value={amountText}
          onChangeText={setAmountText}
          placeholder="0.00"
          keyboardType="numeric"
          accessibilityLabel="Amount to add"
          invalid={!!error}
          isDark={wallet.darkMode}
          prefix={
            <T variant="body" muted>
              $
            </T>
          }
        />
      </Field>

      <Button
        isDark={wallet.darkMode}
        accessibilityLabel="Add money now"
        variant="filled"
        onPress={() => {
          if (!validate() || !card) return;
          wallet.topUp(card, amount);
          setStep("done");
        }}
      >
        Add {amount > 0 ? wallet.fmt(amount) : "money"}
      </Button>
      <Button isDark={wallet.darkMode} accessibilityLabel="Cancel top up" variant="ghost" onPress={() => router.back()}>
        Cancel
      </Button>
      <T variant="caption" muted style={styles.note}>
        Demo flow — no real card is charged
      </T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  cardGlyph: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(127,127,127,0.16)",
  },
  quickRow: { flexDirection: "row", gap: 8 },
  doneCard: { alignItems: "center", gap: 8 },
  note: { textAlign: "center" },
});
