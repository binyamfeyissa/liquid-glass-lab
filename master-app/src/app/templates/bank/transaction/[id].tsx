import React from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Badge, Button, Card } from "glacia-native";

import { useBank } from "../state";
import { Amount, Screen, T } from "../ui";

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bank = useBank();

  const tx = bank.transactions.find((t) => t.id === id);
  if (!tx) {
    return (
      <Screen title="Payment not found">
        <Button accessibilityLabel="Back" onPress={() => router.back()} isDark={bank.darkMode}>
          Back
        </Button>
      </Screen>
    );
  }

  const account = bank.accounts.find((a) => a.id === tx.accountId);

  return (
    <Screen title="Payment details" subtitle={tx.dateLabel}>
      <Card isDark={bank.darkMode} padding={20} contentStyle={styles.body}>
        <T variant="heading">{tx.title}</T>
        <Amount value={tx.amount} variant="title" positive />
        <View style={styles.rows}>
          <View style={styles.row}>
            <T variant="body" muted>
              Category
            </T>
            <T variant="body">{tx.category}</T>
          </View>
          <View style={styles.row}>
            <T variant="body" muted>
              Details
            </T>
            <T variant="body">{tx.detail}</T>
          </View>
          <View style={styles.row}>
            <T variant="body" muted>
              Account
            </T>
            <T variant="body">
              {account ? `${account.name} ••${account.last4}` : "—"}
            </T>
          </View>
          <View style={styles.row}>
            <T variant="body" muted>
              Status
            </T>
            {tx.disputed ? (
              <Badge tone="destructive" isDark={bank.darkMode}>
                Disputed
              </Badge>
            ) : (
              <Badge tone="muted" isDark={bank.darkMode}>
                Completed
              </Badge>
            )}
          </View>
        </View>
      </Card>

      <Button
        isDark={bank.darkMode}
        accessibilityLabel={tx.disputed ? "Cancel dispute" : "Dispute this payment"}
        variant={tx.disputed ? "glass" : "filled"}
        onPress={() => bank.toggleDisputed(tx.id)}
      >
        {tx.disputed ? "Cancel dispute" : "Dispute this payment"}
      </Button>
      <T variant="caption" muted style={styles.note}>
        {tx.disputed
          ? "Our team reviews disputes within 2 business days. The payment stays marked here and in your activity list."
          : "Disputing flags the payment for review — use it if you don't recognise this charge."}
      </T>
      <Button accessibilityLabel="Back" variant="ghost" onPress={() => router.back()} isDark={bank.darkMode}>
        Back
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: 8 },
  rows: { marginTop: 8, gap: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  note: { paddingHorizontal: 4 },
});
