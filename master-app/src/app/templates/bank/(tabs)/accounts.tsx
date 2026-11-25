import React from "react";
import { View } from "react-native";
import { router } from "expo-router";

import { useBank } from "../state";
import {
  Amount,
  ListCard,
  NavRow,
  RowSeparator,
  Screen,
  SectionTitle,
  T,
} from "../ui";

export default function AccountsScreen() {
  const bank = useBank();

  return (
    <Screen title="Accounts" subtitle="Number and activity for each account">
      <View>
        <SectionTitle>Your accounts</SectionTitle>
        <ListCard>
          {bank.accounts.map((account, i) => (
            <React.Fragment key={account.id}>
              {i > 0 ? <RowSeparator /> : null}
              <NavRow
                title={account.name}
                description={`••${account.last4} · ${account.kind}`}
                detail={
                  bank.hideBalances ? "••••" : undefined
                }
                onPress={() => router.push(`/templates/bank/account/${account.id}`)}
              />
              <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
                <Amount value={bank.balanceOf(account.id)} variant="heading" signed={false} />
              </View>
            </React.Fragment>
          ))}
        </ListCard>
      </View>

      <View>
        <SectionTitle>Total</SectionTitle>
        <ListCard>
          <View style={{ padding: 16, gap: 4 }}>
            <T variant="label" muted>
              Combined balance
            </T>
            <Amount value={bank.totalBalance} variant="title" signed={false} />
            <T variant="caption" muted>
              {bank.hideBalances
                ? "Balances are hidden — use Show on Home to reveal them"
                : "Across checking, savings and your travel goal"}
            </T>
          </View>
        </ListCard>
      </View>
    </Screen>
  );
}
