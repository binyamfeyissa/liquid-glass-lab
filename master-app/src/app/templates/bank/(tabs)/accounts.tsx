import React from "react";
import { View } from "react-native";
import { router } from "expo-router";

import { useBank } from "../state";
import {
  AccountRow,
  Amount,
  ListCard,
  RowSeparator,
  Screen,
  SectionTitle,
  T,
} from "../ui";

/**
 * Accounts — the same grouped-list rows as Home, with the combined
 * balance as plain text at the top. No glass card around the total:
 * the list itself is the only glass on this screen.
 */
export default function AccountsScreen() {
  const bank = useBank();

  return (
    <Screen title="Accounts" subtitle="Number and activity for each account">
      <View>
        <T variant="label" muted>
          Combined balance
        </T>
        <Amount
          value={bank.totalBalance}
          variant="title"
          signed={false}
          style={{ fontSize: 34, lineHeight: 40, fontWeight: "700", marginTop: 4 }}
        />
        <T variant="caption" muted style={{ marginTop: 4 }}>
          {bank.hideBalances
            ? "Balances are hidden — use Show on Home to reveal them"
            : "Across checking, savings and your travel goal"}
        </T>
      </View>

      <View>
        <SectionTitle>Your accounts</SectionTitle>
        <ListCard>
          {bank.accounts.map((account, i) => (
            <React.Fragment key={account.id}>
              {i > 0 ? <RowSeparator /> : null}
              <AccountRow
                account={account}
                onPress={() => router.push(`/templates/bank/account/${account.id}`)}
              />
            </React.Fragment>
          ))}
        </ListCard>
      </View>
    </Screen>
  );
}
