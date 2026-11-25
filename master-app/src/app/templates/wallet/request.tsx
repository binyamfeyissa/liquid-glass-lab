import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, Card, Field, Input, SegmentedControl } from "glacia-native";

import { useWallet } from "./state";
import { ListCard, Screen, SectionTitle, Figure, T } from "./ui";

/**
 * A placeholder payment code: a deterministic grid of cells derived from
 * the amount, drawn from plain Views. It is NOT a scannable QR code — the
 * label underneath says so, and a real app would generate one with a QR
 * library at this seam.
 */
function PlaceholderCode({ seed }: { seed: string }) {
  const cells = useMemo(() => {
    const out: boolean[] = [];
    let h = 7;
    for (let i = 0; i < 121; i++) {
      h = (h * 31 + seed.charCodeAt(i % seed.length) + i) % 997;
      out.push(h % 3 !== 0);
    }
    // Finder squares in three corners, like a real code's anchors.
    const mark = (r0: number, c0: number) => {
      for (let r = 0; r < 3; r++)
        for (let c = 0; c < 3; c++) out[(r0 + r) * 11 + (c0 + c)] = !(r === 1 && c === 1);
    };
    mark(0, 0);
    mark(0, 8);
    mark(8, 0);
    return out;
  }, [seed]);

  return (
    <View style={styles.codeGrid} accessibilityLabel="Placeholder payment code, not scannable">
      {cells.map((on, i) => (
        <View key={i} style={[styles.codeCell, { backgroundColor: on ? "#141415" : "transparent" }]} />
      ))}
    </View>
  );
}

export default function RequestScreen() {
  const wallet = useWallet();
  const [mode, setMode] = useState(0); // 0 = any amount, 1 = set amount
  const [amountText, setAmountText] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [shared, setShared] = useState(false);

  const amount = useMemo(() => Number(amountText.replace(/[^0-9.]/g, "")), [amountText]);
  const link =
    mode === 1 && amount > 0
      ? `${wallet.payLink}/${amount.toFixed(2)}`
      : wallet.payLink;

  const share = () => {
    if (mode === 1) {
      if (!amountText.trim() || Number.isNaN(amount) || amount <= 0) {
        setError("Enter the amount you're requesting, above $0");
        return;
      }
    }
    setError(undefined);
    wallet.addRequest();
    setShared(true);
  };

  return (
    <Screen title="Request money" subtitle="Your code and payment link">
      <Card isDark={wallet.darkMode} padding={24} contentStyle={styles.codeCard}>
        <View style={styles.codePlate}>
          <PlaceholderCode seed={link} />
        </View>
        <T variant="heading">{wallet.userHandle}</T>
        <Figure variant="body" muted>
          {link}
        </Figure>
        <T variant="caption" muted style={styles.codeNote}>
          Placeholder code for the template — not a scannable QR. Swap in a QR
          library where PlaceholderCode is defined.
        </T>
      </Card>

      <View>
        <SectionTitle>Amount</SectionTitle>
        <SegmentedControl
          segments={["Any amount", "Set amount"]}
          selectedIndex={mode}
          onChange={(i) => {
            setMode(i);
            setShared(false);
          }}
          accessibilityLabel="Request amount mode"
          isDark={wallet.darkMode}
        />
      </View>

      {mode === 1 ? (
        <Field label="Amount (USD)" error={error} isDark={wallet.darkMode}>
          <Input
            value={amountText}
            onChangeText={(t) => {
              setAmountText(t);
              setShared(false);
            }}
            placeholder="0.00"
            keyboardType="numeric"
            accessibilityLabel="Amount to request"
            invalid={!!error}
            isDark={wallet.darkMode}
            prefix={
              <T variant="body" muted>
                $
              </T>
            }
          />
        </Field>
      ) : null}

      <Button accessibilityLabel="Share payment link" variant="filled" onPress={share}>
        Share payment link
      </Button>
      {shared ? (
        <ListCard>
          <View style={styles.sharedBody}>
            <T variant="body">
              Link ready to share: {link}
            </T>
            <T variant="caption" muted>
              Requests shared this session: {wallet.requestCount} · In a real app this
              button opens the system share sheet.
            </T>
          </View>
        </ListCard>
      ) : null}
      <Button accessibilityLabel="Back" variant="ghost" onPress={() => router.back()}>
        Back
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  codeCard: { alignItems: "center", gap: 8 },
  codePlate: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 16,
  },
  codeGrid: {
    width: 176,
    height: 176,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  codeCell: { width: 16, height: 16 },
  codeNote: { textAlign: "center" },
  sharedBody: { padding: 16, gap: 4 },
});
