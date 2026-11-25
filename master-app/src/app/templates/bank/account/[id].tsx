import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Card } from "glacia-native";

import { useBank } from "../state";
import {
  Amount,
  MONO,
  ListCard,
  RowSeparator,
  Screen,
  SectionTitle,
  T,
  TransactionRow,
} from "../ui";

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bank = useBank();
  const [revealed, setRevealed] = useState(false);

  const account = bank.accounts.find((a) => a.id === id);
  if (!account) {
    return (
      <Screen title="Account not found">
        <Button accessibilityLabel="Back to accounts" onPress={() => router.back()}>
          Back
        </Button>
      </Screen>
    );
  }

  const txs = bank.transactionsFor(account.id);

  return (
    <Screen title={account.name} subtitle={account.kind}>
      <Card isDark={bank.darkMode} padding={20}>
        <T variant="label" muted>
          Balance
        </T>
        <Amount value={bank.balanceOf(account.id)} variant="title" signed={false} style={styles.balance} />
        <T variant="label" muted style={styles.numberLabel}>
          Account number
        </T>
        <T variant="heading" style={styles.number}>
          {revealed ? account.number : `•••• •••• •••• ${account.last4}`}
        </T>
        <Button
          accessibilityLabel={revealed ? "Hide account number" : "Reveal account number"}
          onPress={() => setRevealed(!revealed)}
          style={styles.reveal}
        >
          {revealed ? "Hide number" : "Reveal number"}
        </Button>
      </Card>

      <View>
        <SectionTitle>Activity · {account.name}</SectionTitle>
        <ListCard>
          {txs.length === 0 ? (
            <View style={styles.empty}>
              <T variant="body" muted>
                No activity yet on this account.
              </T>
            </View>
          ) : (
            txs.map((tx, i) => (
              <React.Fragment key={tx.id}>
                {i > 0 ? <RowSeparator /> : null}
                <TransactionRow
                  tx={tx}
                  onPress={() => router.push(`/templates/bank/transaction/${tx.id}`)}
                />
              </React.Fragment>
            ))
          )}
        </ListCard>
      </View>

      <Button accessibilityLabel="Back" variant="ghost" onPress={() => router.back()}>
        Back
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  balance: { marginTop: 8, marginBottom: 16, fontVariant: ["tabular-nums"] },
  numberLabel: { marginBottom: 4 },
  number: { fontFamily: MONO, fontVariant: ["tabular-nums"] },
  reveal: { marginTop: 14, alignSelf: "flex-start" },
  empty: { padding: 16 },
});
