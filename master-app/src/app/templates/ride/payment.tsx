import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Badge, Button, Field, Input } from "glacia-native";

import { useRide } from "./state";
import { Figure, ListCard, RowSeparator, Screen, SectionTitle, T } from "./ui";

/** 1234567812345678 -> "1234 5678 1234 5678" */
export function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

/** 1228 -> "12/28" */
export function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function expiryIsFuture(expiry: string): boolean {
  const match = /^(\d{2})\/(\d{2})$/.exec(expiry);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
}

export default function PaymentScreen() {
  const ride = useRide();
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<{ number?: string; expiry?: string; cvc?: string; name?: string }>({});
  const [addedNote, setAddedNote] = useState<string | undefined>();

  const add = () => {
    const next: typeof errors = {};
    if (number.replace(/\D/g, "").length !== 16) next.number = "Enter the 16-digit card number";
    if (!expiryIsFuture(expiry)) next.expiry = "Use a valid future date, MM/YY";
    if (!/^\d{3}$/.test(cvc)) next.cvc = "The 3-digit code on the back";
    if (name.trim().length < 2) next.name = "Enter the name on the card";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    const card = ride.addCard(number, expiry);
    setAddedNote(`${card.brand} ••${card.last4} added — set it as default any time`);
    setNumber("");
    setExpiry("");
    setCvc("");
    setName("");
  };

  return (
    <Screen title="Payment" subtitle="Cards are charged when a trip completes">
      <View>
        <SectionTitle>Your cards</SectionTitle>
        <ListCard>
          {ride.cards.map((card, i) => (
            <View key={card.id}>
              {i > 0 ? <RowSeparator /> : null}
              <View style={styles.cardRow}>
                <Avatar name={card.brand} size="md" isDark={ride.darkMode} />
                <View style={styles.cardText}>
                  <T variant="body">
                    {card.brand} ••{card.last4}
                  </T>
                  <Figure variant="caption" muted style={styles.cardSub}>
                    Expires {card.expiry}
                  </Figure>
                </View>
                {card.isDefault ? (
                  <Badge tone="muted" isDark={ride.darkMode}>
                    Default
                  </Badge>
                ) : (
                  <Button
                    accessibilityLabel={`Make ${card.brand} ending ${card.last4} the default card`}
                    variant="ghost"
                    size="sm"
                    onPress={() => ride.setDefaultCard(card.id)}
                  >
                    Set default
                  </Button>
                )}
              </View>
            </View>
          ))}
          {ride.cards.length === 0 ? (
            <View style={styles.cardRow}>
              <T variant="body" muted>
                No cards yet — add one below to book rides
              </T>
            </View>
          ) : null}
        </ListCard>
      </View>

      <View>
        <SectionTitle>Add a card</SectionTitle>
        <View style={styles.form}>
          <Field label="Card number" error={errors.number} isDark={ride.darkMode}>
            <Input
              value={number}
              onChangeText={(v) => {
                setNumber(formatCardNumber(v));
                setAddedNote(undefined);
              }}
              placeholder="1234 5678 1234 5678"
              keyboardType="numeric"
              accessibilityLabel="Card number"
              invalid={!!errors.number}
              isDark={ride.darkMode}
            />
          </Field>
          <View style={styles.formRow}>
            <View style={styles.formHalf}>
              <Field label="Expiry" error={errors.expiry} isDark={ride.darkMode}>
                <Input
                  value={expiry}
                  onChangeText={(v) => setExpiry(formatExpiry(v))}
                  placeholder="MM/YY"
                  keyboardType="numeric"
                  accessibilityLabel="Card expiry"
                  invalid={!!errors.expiry}
                  isDark={ride.darkMode}
                />
              </Field>
            </View>
            <View style={styles.formHalf}>
              <Field label="CVC" error={errors.cvc} isDark={ride.darkMode}>
                <Input
                  value={cvc}
                  onChangeText={(v) => setCvc(v.replace(/\D/g, "").slice(0, 3))}
                  placeholder="123"
                  keyboardType="numeric"
                  accessibilityLabel="Card security code"
                  invalid={!!errors.cvc}
                  isDark={ride.darkMode}
                />
              </Field>
            </View>
          </View>
          <Field label="Name on card" error={errors.name} isDark={ride.darkMode}>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="e.g. Jordan Ellis"
              accessibilityLabel="Name on card"
              invalid={!!errors.name}
              isDark={ride.darkMode}
            />
          </Field>
          {addedNote ? (
            <T variant="caption" style={styles.addedNote}>
              {addedNote}
            </T>
          ) : null}
          <Button accessibilityLabel="Add this card" variant="filled" onPress={add}>
            Add card
          </Button>
          <T variant="caption" muted style={styles.foot}>
            Template build — card details never leave this screen
          </T>
        </View>
      </View>

      <Button
        accessibilityLabel="Back to profile"
        variant="ghost"
        onPress={() => router.back()}
      >
        Back
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cardText: { flex: 1 },
  cardSub: { marginTop: 4 },
  form: { gap: 16 },
  formRow: { flexDirection: "row", gap: 12 },
  formHalf: { flex: 1 },
  addedNote: { marginLeft: 4 },
  foot: { textAlign: "center" },
});
