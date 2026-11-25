import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Badge, Button, Card, Field, Input } from "glacia-native";

import { FEE_RATE, useWallet, type TradeResult } from "./state";
import { AssetTile, ListCard, Screen, SectionTitle, Figure, T } from "./ui";

type Step = "enter" | "review" | "done";

export default function TradeScreen() {
  const wallet = useWallet();
  const params = useLocalSearchParams<{ asset: string; side: string }>();
  const asset = wallet.assets.find((a) => a.id === params.asset) ?? wallet.assets[2];
  const side: "buy" | "sell" = params.side === "sell" ? "sell" : "buy";

  const [step, setStep] = useState<Step>("enter");
  const [amountText, setAmountText] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [result, setResult] = useState<TradeResult | null>(null);

  const amount = useMemo(() => Number(amountText.replace(/[^0-9.]/g, "")), [amountText]);
  const cashBalance = wallet.balanceOf("usd");
  const assetValue = wallet.valueUSDOf(asset.id);
  const maxSpend = side === "buy" ? cashBalance : assetValue;
  const feeUSD = amount * FEE_RATE;
  const receiveQty =
    side === "buy"
      ? (amount - feeUSD) / asset.priceUSD
      : amount - feeUSD; // sell: received qty is USD cash

  const validate = (): boolean => {
    if (!amountText.trim() || Number.isNaN(amount) || amount <= 0) {
      setError("Enter an amount above $0");
      return false;
    }
    if (amount > maxSpend) {
      setError(
        side === "buy"
          ? `That's more than your USD cash (${wallet.fmt(cashBalance)}). Add money first`
          : `That's more than your ${asset.symbol} is worth (${wallet.fmt(assetValue)})`,
      );
      return false;
    }
    setError(undefined);
    return true;
  };

  if (step === "done" && result) {
    return (
      <Screen
        title={side === "buy" ? "Purchase complete" : "Sale complete"}
        subtitle="Settled at the simulated rate"
      >
        <Card isDark={wallet.darkMode} padding={20} contentStyle={styles.doneCard}>
          <Figure variant="heading">
            {side === "buy"
              ? `+${wallet.fmtQty(asset.id, result.receivedQty)}`
              : `+${wallet.fmt(result.receivedQty)}`}
          </Figure>
          <T variant="body" muted>
            {side === "buy"
              ? `You now hold ${wallet.fmtQty(asset.id, wallet.balanceOf(asset.id))}`
              : `USD cash is now ${wallet.fmt(wallet.balanceOf("usd"))}`}
          </T>
          <Badge tone="muted" isDark={wallet.darkMode}>
            Confirmed
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
          accessibilityLabel="Trade again"
          variant="ghost"
          onPress={() => {
            setStep("enter");
            setAmountText("");
            setResult(null);
          }}
        >
          Trade again
        </Button>
      </Screen>
    );
  }

  if (step === "review") {
    return (
      <Screen title="Review trade" subtitle="Simulated rates, fixed for this demo">
        <ListCard>
          <View style={styles.reviewBody}>
            <AssetTile asset={asset} size={52} />
            <T variant="heading">
              {side === "buy" ? "Buy" : "Sell"} {asset.name}
            </T>
            <View style={styles.reviewRows}>
              <ReviewRow
                label={side === "buy" ? "You pay" : "You sell"}
                value={wallet.fmt(amount)}
              />
              <ReviewRow label="Rate" value={`1 ${asset.symbol} = ${wallet.fmt(asset.priceUSD)}`} />
              <ReviewRow label="Network fee (0.5%)" value={wallet.fmt(feeUSD)} />
              <ReviewRow
                label="You receive"
                value={
                  side === "buy"
                    ? wallet.fmtQty(asset.id, receiveQty)
                    : wallet.fmt(receiveQty)
                }
              />
            </View>
          </View>
        </ListCard>
        <Button
          isDark={wallet.darkMode}
          accessibilityLabel={`Confirm ${side} of ${wallet.fmt(amount)}`}
          variant="filled"
          onPress={() => {
            const r =
              side === "buy" ? wallet.buy(asset.id, amount) : wallet.sell(asset.id, amount);
            setResult(r);
            setStep("done");
          }}
        >
          Confirm {side === "buy" ? "purchase" : "sale"}
        </Button>
        <Button
          isDark={wallet.darkMode}
          accessibilityLabel="Back to edit trade"
          variant="ghost"
          onPress={() => setStep("enter")}
        >
          Back and edit
        </Button>
      </Screen>
    );
  }

  return (
    <Screen
      title={`${side === "buy" ? "Buy" : "Sell"} ${asset.name}`}
      subtitle={
        side === "buy"
          ? `Paying from USD cash · ${wallet.fmt(cashBalance)} available`
          : `You hold ${wallet.fmtQty(asset.id, wallet.balanceOf(asset.id))} · worth ${wallet.fmt(assetValue)}`
      }
    >
      <View style={styles.assetHead}>
        <AssetTile asset={asset} size={46} />
        <View style={styles.flex}>
          <T variant="body">{asset.symbol} / USD</T>
          <Figure variant="caption" muted>
            {wallet.fmt(asset.priceUSD)} · simulated rate
          </Figure>
        </View>
      </View>

      <Field label="Amount (USD)" error={error} isDark={wallet.darkMode}>
        <Input
          value={amountText}
          onChangeText={setAmountText}
          placeholder="0.00"
          keyboardType="numeric"
          accessibilityLabel="Trade amount in US dollars"
          invalid={!!error}
          isDark={wallet.darkMode}
          prefix={
            <T variant="body" muted>
              $
            </T>
          }
        />
      </Field>

      <View>
        <SectionTitle>You receive (after 0.5% fee)</SectionTitle>
        <ListCard>
          <View style={styles.receiveRow}>
            <Figure variant="heading">
              {amount > 0
                ? side === "buy"
                  ? wallet.fmtQty(asset.id, receiveQty)
                  : wallet.fmt(receiveQty)
                : "—"}
            </Figure>
            <T variant="caption" muted>
              Max {wallet.fmt(maxSpend)}
            </T>
          </View>
        </ListCard>
      </View>

      <Button
        isDark={wallet.darkMode}
        accessibilityLabel="Review trade"
        variant="filled"
        onPress={() => {
          if (validate()) setStep("review");
        }}
      >
        Review {side === "buy" ? "purchase" : "sale"}
      </Button>
      <Button isDark={wallet.darkMode} accessibilityLabel="Cancel trade" variant="ghost" onPress={() => router.back()}>
        Cancel
      </Button>
    </Screen>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.reviewRow}>
      <T variant="body" muted>
        {label}
      </T>
      <Figure variant="body">{value}</Figure>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  assetHead: { flexDirection: "row", alignItems: "center", gap: 12 },
  receiveRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  reviewBody: { padding: 20, alignItems: "center", gap: 8 },
  reviewRows: { alignSelf: "stretch", marginTop: 12, gap: 12 },
  reviewRow: { flexDirection: "row", justifyContent: "space-between", gap: 16 },
  doneCard: { alignItems: "center", gap: 8 },
});
