import React from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button } from "glacia-native";

import { useBank } from "../state";
import {
  Amount,
  DetailRow,
  ListCard,
  MONO,
  RowSeparator,
  Screen,
  SectionTitle,
  T,
  TransactionRow,
} from "../ui";

/**
 * Account detail — deliberately a different feel from the dashboard:
 * grouped Settings-style lists, balance as plain text, the number as
 * one revealable row. No dashboard card.
 */
export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bank = useBank();
  const [revealed, setRevealed] = React.useState(false);

  const account = bank.accounts.find((a) => a.id === id);
  if (!account) {
    return (
      <Screen title="Account not found">
        <Button accessibilityLabel="Back to accounts" onPress={() => router.back()} isDark={bank.darkMode}>
          Back
        </Button>
      </Screen>
    );
  }

  const txs = bank.transactionsFor(account.id);

  return (
    <Screen title={account.name} subtitle={account.kind}>
      <View>
        <T variant="label" muted>
          Balance
        </T>
        <Amount
          value={bank.balanceOf(account.id)}
          variant="title"
          signed={false}
          style={styles.balance}
        />
      </View>

      <View>
        <SectionTitle>Details</SectionTitle>
        <ListCard>
          {/* Number on its own line: the 19-char mono number does not fit
             beside its label in a side-by-side row at 390pt. */}
          <View style={styles.numberBlock}>
            <T variant="label" muted>
              Account number
            </T>
            <T variant="body" style={styles.number}>
              {revealed ? account.number : `•••• •••• •••• ${account.last4}`}
            </T>
          </View>
          <RowSeparator />
          <DetailRow label="Type">
            <T variant="body">{account.kind}</T>
          </DetailRow>
        </ListCard>
        <Button
          isDark={bank.darkMode}
          accessibilityLabel={revealed ? "Hide account number" : "Reveal account number"}
          variant="ghost"
          onPress={() => setRevealed(!revealed)}
          style={styles.reveal}
        >
          {revealed ? "Hide number" : "Reveal number"}
        </Button>
      </View>

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

      <Button accessibilityLabel="Back" variant="ghost" onPress={() => router.back()} isDark={bank.darkMode}>
        Back
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  balance: {
    marginTop: 4,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  number: { fontFamily: MONO, fontVariant: ["tabular-nums"] },
  numberBlock: { paddingVertical: 12, paddingHorizontal: 16, gap: 4 },
  reveal: { marginTop: 8, alignSelf: "flex-start" },
  empty: { padding: 16 },
});
