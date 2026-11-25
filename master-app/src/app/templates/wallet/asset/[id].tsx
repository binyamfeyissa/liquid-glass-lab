import React from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Card } from "glacia-native";

import { useWallet } from "../state";
import {
  AssetTile,
  ChangeText,
  Figure,
  ListCard,
  RowSeparator,
  Screen,
  SectionTitle,
  SparkBars,
  T,
  TxRow,
} from "../ui";

export default function AssetDetailScreen() {
  const wallet = useWallet();
  const { id } = useLocalSearchParams<{ id: string }>();
  const asset = wallet.assets.find((a) => a.id === id) ?? wallet.assets[0];
  const balance = wallet.balanceOf(asset.id);
  const value = wallet.valueUSDOf(asset.id);

  const related = wallet.transactions.filter(
    (tx) =>
      tx.amountLabel.includes(asset.symbol) ||
      tx.detail.includes(asset.symbol) ||
      tx.title.includes(asset.name),
  );

  return (
    <Screen title={asset.name} subtitle={`${asset.symbol} · Simulated market data`}>
      {/* Balance card */}
      <Card isDark={wallet.darkMode} padding={24} contentStyle={styles.balanceCard}>
        <View style={styles.balanceHead}>
          <AssetTile asset={asset} size={52} />
          <View style={styles.flex}>
            <T variant="label" muted>
              Your balance
            </T>
            <Figure variant="heading">
              {wallet.hideBalances ? "••••" : wallet.fmtQty(asset.id, balance)}
            </Figure>
            {asset.id !== "usd" ? (
              <Figure variant="body" muted>
                {wallet.hideBalances ? "••••" : wallet.fmt(value)}
              </Figure>
            ) : null}
          </View>
        </View>
        <View style={styles.priceRow}>
          <Figure variant="body" muted>
            Price {wallet.fmt(asset.priceUSD)}
          </Figure>
          <ChangeText pct={asset.change24h} />
          <T variant="caption" muted>
            24h
          </T>
        </View>
        <SparkBars points={asset.history} height={64} />
        <T variant="caption" muted>
          Last {asset.history.length} ticks · simulated price history
        </T>
      </Card>

      {/* Actions */}
      {asset.id === "usd" ? (
        <View style={styles.actions}>
          <View style={styles.flex}>
            <Button
              accessibilityLabel="Add money"
              variant="filled"
              onPress={() => router.push("/templates/wallet/topup")}
            >
              Add money
            </Button>
          </View>
          <View style={styles.flex}>
            <Button
              accessibilityLabel="Send dollars"
              variant="glass"
              onPress={() => router.push("/templates/wallet/send")}
            >
              Send
            </Button>
          </View>
          <View style={styles.flex}>
            <Button
              accessibilityLabel="Swap dollars"
              variant="glass"
              onPress={() =>
                router.push({ pathname: "/templates/wallet/(tabs)/swap", params: { from: asset.id } })
              }
            >
              Swap
            </Button>
          </View>
        </View>
      ) : (
        <View style={styles.actions}>
          <View style={styles.flex}>
            <Button
              accessibilityLabel={`Buy ${asset.name}`}
              variant="filled"
              onPress={() =>
                router.push({ pathname: "/templates/wallet/trade", params: { asset: asset.id, side: "buy" } })
              }
            >
              Buy
            </Button>
          </View>
          <View style={styles.flex}>
            <Button
              accessibilityLabel={`Sell ${asset.name}`}
              variant="glass"
              onPress={() =>
                router.push({ pathname: "/templates/wallet/trade", params: { asset: asset.id, side: "sell" } })
              }
            >
              Sell
            </Button>
          </View>
          <View style={styles.flex}>
            <Button
              accessibilityLabel={`Swap ${asset.name}`}
              variant="glass"
              onPress={() =>
                router.push({ pathname: "/templates/wallet/(tabs)/swap", params: { from: asset.id } })
              }
            >
              Swap
            </Button>
          </View>
        </View>
      )}

      {/* Related activity */}
      <View>
        <SectionTitle>{asset.symbol} activity</SectionTitle>
        {related.length > 0 ? (
          <ListCard>
            {related.slice(0, 5).map((tx, i) => (
              <React.Fragment key={tx.id}>
                {i > 0 ? <RowSeparator /> : null}
                <TxRow tx={tx} />
              </React.Fragment>
            ))}
          </ListCard>
        ) : (
          <ListCard>
            <View style={styles.empty}>
              <T variant="body" muted>
                No {asset.symbol} movements yet — trades will show here
              </T>
            </View>
          </ListCard>
        )}
      </View>

      <Button accessibilityLabel="Back" variant="ghost" onPress={() => router.back()}>
        Back
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  balanceCard: { gap: 16 },
  balanceHead: { flexDirection: "row", alignItems: "center", gap: 16 },
  flex: { flex: 1 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  actions: { flexDirection: "row", gap: 8 },
  empty: { padding: 16 },
});
