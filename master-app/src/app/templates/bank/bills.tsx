import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Badge, Button } from "glacia-native";
import { Landmark, Receipt, Shield, Wifi, Zap } from "lucide-react-native";

import { useBank, type Bill } from "./state";
import {
  Amount,
  ListCard,
  RowSeparator,
  Screen,
  SectionTitle,
  T,
  accentColor,
  money,
} from "./ui";

/** One small neutral icon per biller — identification, not decoration. */
const BILL_ICONS: Record<string, typeof Zap> = {
  b1: Zap,
  b2: Wifi,
  b3: Shield,
  b4: Landmark,
};

function BillRow({ bill }: { bill: Bill }) {
  const bank = useBank();
  const Icon = BILL_ICONS[bill.id] ?? Receipt;
  const iconColor = bank.darkMode ? "#EBEBF599" : "#3C3C4399";
  return (
    <View style={styles.row}>
      <Icon size={20} color={iconColor} />
      <View style={styles.text}>
        <T variant="body">{bill.name}</T>
        <T variant="caption" muted style={styles.detail}>
          {bill.detail}
        </T>
        <T variant="caption" muted>
          {bill.dueLabel}
        </T>
      </View>
      <View style={styles.right}>
        <Amount value={-bill.amount} style={styles.billAmount} />
        {bill.paid ? (
          <Badge tone="muted" isDark={bank.darkMode}>
            Paid
          </Badge>
        ) : (
          <Button
            isDark={bank.darkMode}
            accessibilityLabel={`Pay ${bill.name}, ${bill.amount} dollars`}
            variant="filled"
            tint={accentColor(bank.backdrop)}
            size="sm"
            onPress={() => bank.payBill(bill.id)}
          >
            Pay
          </Button>
        )}
      </View>
    </View>
  );
}

export default function BillsScreen() {
  const bank = useBank();
  const upcoming = bank.bills.filter((b) => !b.paid);
  const paid = bank.bills.filter((b) => b.paid);
  const totalDue = upcoming.reduce((s, b) => s + b.amount, 0);

  return (
    <Screen
      title="Bills"
      subtitle={
        upcoming.length
          ? `${upcoming.length} coming up · ${bank.hideBalances ? "••••" : money(totalDue)} total`
          : "Everything is paid up"
      }
    >
      <View>
        <SectionTitle>Upcoming</SectionTitle>
        <ListCard>
          {upcoming.length === 0 ? (
            <View style={styles.empty}>
              <T variant="body" muted>
                No bills due. New bills will appear here.
              </T>
            </View>
          ) : (
            upcoming.map((bill, i) => (
              <React.Fragment key={bill.id}>
                {i > 0 ? <RowSeparator /> : null}
                <BillRow bill={bill} />
              </React.Fragment>
            ))
          )}
        </ListCard>
      </View>

      <View>
        <SectionTitle>Paid</SectionTitle>
        <ListCard>
          {paid.map((bill, i) => (
            <React.Fragment key={bill.id}>
              {i > 0 ? <RowSeparator /> : null}
              <BillRow bill={bill} />
            </React.Fragment>
          ))}
        </ListCard>
      </View>

      <T variant="caption" muted style={styles.note}>
        Paying a bill deducts it from Main Checking and adds it to your activity
        right away.
      </T>

      <Button accessibilityLabel="Back" variant="ghost" onPress={() => router.back()} isDark={bank.darkMode}>
        Back
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  text: { flex: 1 },
  detail: { marginTop: 2 },
  right: { alignItems: "flex-end", gap: 8 },
  billAmount: { fontWeight: "600" },
  empty: { padding: 16 },
  note: { paddingHorizontal: 4 },
});
