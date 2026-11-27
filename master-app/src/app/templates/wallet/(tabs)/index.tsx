import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Button, Card } from "glacia-native";

import { useWallet } from "../state";
import {
  AssetRow,
  ChangeText,
  Figure,
  ListCard,
  RowSeparator,
  Screen,
  SectionTitle,
  T,
  TxRow,
} from "../ui";

export default function PortfolioScreen() {
  const wallet = useWallet();

  return (
    <Screen belowTabBar>
      {/* Header */}
      <View style={styles.header}>
        <Avatar name={wallet.userName} size="md" isDark={wallet.darkMode} source={wallet.userImage} />
        <View style={styles.headerText}>
          <T variant="caption" muted>
            {wallet.userHandle}
          </T>
          <T variant="heading">{wallet.userName}</T>
        </View>
      </View>

      {/* Portfolio total — the statement figure */}
      <Card isDark={wallet.darkMode} padding={24} contentStyle={styles.totalCard}>
        <T variant="label" muted>
          Total balance · {wallet.currency}
        </T>
        <Figure variant="title" style={styles.total}>
          {wallet.hideBalances ? "••••••" : wallet.fmt(wallet.totalUSD)}
        </Figure>
        <View style={styles.changeRow}>
          <ChangeText pct={wallet.changePct24h} />
          <Figure variant="caption" muted>
            {wallet.hideBalances
              ? "past 24 hours"
              : `${wallet.fmtSigned(wallet.changeUSD24h)} past 24 hours`}
          </Figure>
        </View>
        <T variant="caption" muted style={styles.simNote}>
          Simulated prices — no real assets move
        </T>
      </Card>

      {/* Quick actions */}
      <View style={styles.actions}>
        <View style={styles.actionBtn}>
          <Button isDark={wallet.darkMode} size="sm" accessibilityLabel="Add money" variant="glass" onPress={() => router.push("/templates/wallet/topup")}>
            Add
          </Button>
        </View>
        <View style={styles.actionBtn}>
          <Button isDark={wallet.darkMode} size="sm" accessibilityLabel="Send money" variant="glass" onPress={() => router.push("/templates/wallet/send")}>
            Send
          </Button>
        </View>
        <View style={styles.actionBtn}>
          <Button isDark={wallet.darkMode} size="sm" accessibilityLabel="Request money" variant="glass" onPress={() => router.push("/templates/wallet/request")}>
            Request
          </Button>
        </View>
        <View style={styles.actionBtn}>
          <Button isDark={wallet.darkMode} size="sm" accessibilityLabel="Swap assets" variant="glass" onPress={() => router.push("/templates/wallet/(tabs)/swap")}>
            Swap
          </Button>
        </View>
      </View>

      {/* Assets */}
      <View>
        <SectionTitle>Assets</SectionTitle>
        <ListCard>
          {wallet.assets.map((asset, i) => (
            <React.Fragment key={asset.id}>
              {i > 0 ? <RowSeparator /> : null}
              <AssetRow
                asset={asset}
                onPress={() => router.push({ pathname: "/templates/wallet/asset/[id]", params: { id: asset.id } })}
              />
            </React.Fragment>
          ))}
        </ListCard>
      </View>

      {/* Recent activity */}
      <View>
        <SectionTitle>Recent activity</SectionTitle>
        <ListCard>
          {wallet.transactions.slice(0, 3).map((tx, i) => (
            <React.Fragment key={tx.id}>
              {i > 0 ? <RowSeparator /> : null}
              <TxRow tx={tx} />
            </React.Fragment>
          ))}
        </ListCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerText: { flex: 1, gap: 4 },
  totalCard: { gap: 8 },
  total: {},
  changeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  simNote: { marginTop: 4 },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: { flex: 1 },
});
