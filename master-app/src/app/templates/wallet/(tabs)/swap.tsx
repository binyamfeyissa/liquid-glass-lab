import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Badge, Button, Card, Field, Input, Select } from "glacia-native";

import { FEE_RATE, useWallet } from "../state";
import { ListCard, Screen, SectionTitle, Figure, T } from "../ui";

export default function SwapScreen() {
  const wallet = useWallet();
  const params = useLocalSearchParams<{ from?: string }>();

  const [fromId, setFromId] = useState<string>("btc");
  const [toId, setToId] = useState<string>("eth");
  const [amountText, setAmountText] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [doneLabel, setDoneLabel] = useState<string | null>(null);

  // Arriving from an asset page ("Swap" button) pre-selects the source.
  useEffect(() => {
    if (params.from && wallet.assets.some((a) => a.id === params.from)) {
      setFromId(params.from);
      if (params.from === toId) setToId(params.from === "eth" ? "btc" : "eth");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.from]);

  const from = wallet.assetById(fromId);
  const to = wallet.assetById(toId);
  const fromBalance = wallet.balanceOf(fromId);

  const amount = useMemo(() => Number(amountText.replace(/[^0-9.]/g, "")), [amountText]);
  const fromUSD = amount * from.priceUSD;
  const feeUSD = fromUSD * FEE_RATE;
  const receiveQty = fromUSD > 0 ? (fromUSD - feeUSD) / to.priceUSD : 0;
  const rate = from.priceUSD / to.priceUSD;

  const options = wallet.assets.map((a) => ({
    value: a.id,
    label: `${a.symbol} — ${a.name}`,
  }));

  const flip = () => {
    setFromId(toId);
    setToId(fromId);
    setDoneLabel(null);
  };

  const validate = (): boolean => {
    if (fromId === toId) {
      setError("Pick two different assets");
      return false;
    }
    if (!amountText.trim() || Number.isNaN(amount) || amount <= 0) {
      setError(`Enter an amount of ${from.symbol} above 0`);
      return false;
    }
    if (amount > fromBalance) {
      setError(`That's more than your ${from.symbol} balance (${wallet.fmtQty(fromId, fromBalance)})`);
      return false;
    }
    setError(undefined);
    return true;
  };

  return (
    <Screen belowTabBar title="Swap" subtitle="One asset for another, at simulated rates">
      {doneLabel ? (
        <Card isDark={wallet.darkMode} padding={20} contentStyle={styles.doneCard}>
          <T variant="heading">Swap complete</T>
          <T variant="body" muted>
            {doneLabel}
          </T>
          <Badge tone="muted" isDark={wallet.darkMode}>
            Confirmed
          </Badge>
        </Card>
      ) : null}

      <View>
        <SectionTitle>From</SectionTitle>
        <ListCard>
          <View style={styles.pickerBody}>
            <Select
              value={fromId}
              onValueChange={(v) => {
                setFromId(v);
                setDoneLabel(null);
              }}
              options={options}
              accessibilityLabel="Asset to swap from"
              isDark={wallet.darkMode}
            />
            <Figure variant="caption" muted>
              Balance {wallet.fmtQty(fromId, fromBalance)} · {wallet.fmt(wallet.valueUSDOf(fromId))}
            </Figure>
          </View>
        </ListCard>
      </View>

      <View style={styles.flipRow}>
        <View style={styles.flex}>
          <Button isDark={wallet.darkMode} accessibilityLabel="Flip swap direction" variant="glass" onPress={flip}>
            Flip
          </Button>
        </View>
      </View>

      <View>
        <SectionTitle>To</SectionTitle>
        <ListCard>
          <View style={styles.pickerBody}>
            <Select
              value={toId}
              onValueChange={(v) => {
                setToId(v);
                setDoneLabel(null);
              }}
              options={options}
              accessibilityLabel="Asset to swap into"
              isDark={wallet.darkMode}
            />
            <Figure variant="caption" muted>
              Balance {wallet.fmtQty(toId, wallet.balanceOf(toId))}
            </Figure>
          </View>
        </ListCard>
      </View>

      <Field label={`Amount (${from.symbol})`} error={error} isDark={wallet.darkMode}>
        <Input
          value={amountText}
          onChangeText={setAmountText}
          placeholder="0.00"
          keyboardType="numeric"
          accessibilityLabel={`Amount of ${from.symbol} to swap`}
          invalid={!!error}
          isDark={wallet.darkMode}
        />
      </Field>

      <View>
        <SectionTitle>Conversion</SectionTitle>
        <ListCard>
          <View style={styles.convBody}>
            <ConvRow label="Rate" value={`1 ${from.symbol} ≈ ${rate.toLocaleString("en-US", { maximumFractionDigits: 6 })} ${to.symbol}`} />
            <ConvRow label="Value" value={wallet.fmt(fromUSD)} />
            <ConvRow label="Fee (0.5%)" value={wallet.fmt(feeUSD)} />
            <ConvRow
              label="You receive"
              value={amount > 0 ? wallet.fmtQty(toId, receiveQty) : "—"}
            />
          </View>
        </ListCard>
      </View>

      <Button
        isDark={wallet.darkMode}
        accessibilityLabel="Confirm swap"
        variant="filled"
        onPress={() => {
          if (!validate()) return;
          const summary = `${wallet.fmtQty(fromId, amount)} → ${wallet.fmtQty(toId, receiveQty)}`;
          wallet.swap(fromId, toId, amount);
          setDoneLabel(summary);
          setAmountText("");
        }}
      >{`Swap ${from.symbol} → ${to.symbol}`}</Button>
      <T variant="caption" muted style={styles.note}>
        Simulated rates — no real exchange is involved
      </T>
    </Screen>
  );
}

function ConvRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.convRow}>
      <T variant="body" muted>
        {label}
      </T>
      <Figure variant="body">{value}</Figure>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pickerBody: { padding: 16, gap: 8 },
  flipRow: { flexDirection: "row", marginVertical: -8 },
  convBody: { padding: 16, gap: 12 },
  convRow: { flexDirection: "row", justifyContent: "space-between", gap: 16 },
  doneCard: { alignItems: "center", gap: 8 },
  note: { textAlign: "center" },
});
