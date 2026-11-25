import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Badge, Button, Card, Field, Input } from "glacia-native";

import { useWallet, type Contact } from "./state";
import { ListCard, Screen, SectionTitle, Figure, T } from "./ui";

type Step = "pick" | "confirm" | "done";

export default function SendScreen() {
  const wallet = useWallet();
  const [step, setStep] = useState<Step>("pick");
  const [contact, setContact] = useState<Contact | null>(null);
  const [amountText, setAmountText] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | undefined>();

  const balance = wallet.balanceOf("usd");
  const amount = useMemo(() => Number(amountText.replace(/[^0-9.]/g, "")), [amountText]);

  const validate = (): boolean => {
    if (!contact) {
      setError("Pick who you're sending to");
      return false;
    }
    if (!amountText.trim() || Number.isNaN(amount) || amount <= 0) {
      setError("Enter an amount above $0");
      return false;
    }
    if (amount > balance) {
      setError(`That's more than your USD cash (${wallet.fmt(balance)})`);
      return false;
    }
    setError(undefined);
    return true;
  };

  if (step === "done" && contact) {
    return (
      <Screen title="Payment sent" subtitle="From your USD cash">
        <Card isDark={wallet.darkMode} padding={20} contentStyle={styles.doneCard}>
          <T variant="heading">
            {wallet.fmt(amount)} to {contact.name}
          </T>
          <T variant="body" muted>
            USD cash remaining: {wallet.fmt(wallet.balanceOf("usd"))}
          </T>
          <Badge tone="muted" isDark={wallet.darkMode}>
            Delivered
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
          accessibilityLabel="Send another payment"
          variant="ghost"
          onPress={() => {
            setStep("pick");
            setContact(null);
            setAmountText("");
            setNote("");
          }}
        >
          Send another payment
        </Button>
      </Screen>
    );
  }

  if (step === "confirm" && contact) {
    return (
      <Screen title="Check it's right" subtitle="Payments can't be recalled">
        <ListCard>
          <View style={styles.confirmBody}>
            <Avatar name={contact.name} size="lg" isDark={wallet.darkMode} />
            <T variant="heading">{contact.name}</T>
            <T variant="caption" muted>
              {contact.handle} · Orbit Pay
            </T>
            <Figure variant="title" style={styles.confirmAmount}>
              {wallet.fmt(amount)}
            </Figure>
            {note.trim() ? (
              <T variant="body" muted>
                {note.trim()}
              </T>
            ) : null}
            <T variant="caption" muted>
              From USD cash · Balance after: {wallet.fmt(balance - amount)}
            </T>
          </View>
        </ListCard>
        <Button
          isDark={wallet.darkMode}
          accessibilityLabel={`Send ${wallet.fmt(amount)} to ${contact.name}`}
          variant="filled"
          onPress={() => {
            wallet.send(contact, amount, note);
            setStep("done");
          }}
        >
          Send {wallet.fmt(amount)}
        </Button>
        <Button
          isDark={wallet.darkMode}
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
    <Screen title="Send money" subtitle={`From USD cash · ${wallet.fmt(balance)} available`}>
      <View>
        <SectionTitle>Who to</SectionTitle>
        <ListCard>
          {wallet.contacts.map((c) => {
            const selected = contact?.id === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => setContact(c)}
                accessibilityRole="button"
                accessibilityLabel={`Send to ${c.name}`}
                accessibilityState={{ selected }}
                style={({ pressed }) => [
                  styles.contactRow,
                  selected && {
                    backgroundColor: wallet.darkMode
                      ? "rgba(129,140,248,0.16)"
                      : "rgba(67,56,202,0.08)",
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Avatar name={c.name} size="md" isDark={wallet.darkMode} />
                <View style={styles.flex}>
                  <T variant="body">{c.name}</T>
                  <T variant="caption" muted>
                    {c.handle}
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

      <Field label="Amount (USD)" error={error} isDark={wallet.darkMode}>
        <Input
          value={amountText}
          onChangeText={setAmountText}
          placeholder="0.00"
          keyboardType="numeric"
          accessibilityLabel="Amount to send"
          invalid={!!error}
          isDark={wallet.darkMode}
          prefix={
            <T variant="body" muted>
              $
            </T>
          }
        />
      </Field>

      <Field label="Note (optional)" isDark={wallet.darkMode}>
        <Input
          value={note}
          onChangeText={setNote}
          placeholder="What's it for?"
          accessibilityLabel="Payment note"
          isDark={wallet.darkMode}
        />
      </Field>

      <Button
        isDark={wallet.darkMode}
        accessibilityLabel="Review payment"
        variant="filled"
        onPress={() => {
          if (validate()) setStep("confirm");
        }}
      >
        Review payment
      </Button>
      <Button isDark={wallet.darkMode} accessibilityLabel="Cancel" variant="ghost" onPress={() => router.back()}>
        Cancel
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  confirmBody: { padding: 20, alignItems: "center", gap: 8 },
  confirmAmount: { marginTop: 8 },
  doneCard: { alignItems: "center", gap: 8 },
});
