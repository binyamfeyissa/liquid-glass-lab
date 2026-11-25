import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Field,
  IconButton,
  Input,
  Sheet,
} from "glacia-native";

import { useBank } from "../state";
import {
  Amount,
  ListCard,
  NavRow,
  RowSeparator,
  SectionTitle,
  T,
  TransactionRow,
  money,
} from "../ui";

type SheetKind = "request" | "topup" | "more" | null;

export default function HomeScreen() {
  const bank = useBank();
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpError, setTopUpError] = useState<string | undefined>();
  const [topUpDone, setTopUpDone] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const checking = bank.accounts[0];
  const recent = bank.transactions.slice(0, 5);

  const closeSheet = () => {
    setSheet(null);
    setTopUpError(undefined);
    setTopUpDone(false);
    setRequestSent(false);
  };

  const submitTopUp = () => {
    const value = Number(topUpAmount.replace(/[^0-9.]/g, ""));
    if (!topUpAmount.trim() || Number.isNaN(value) || value <= 0) {
      setTopUpError("Enter an amount above $0");
      return;
    }
    if (value > 10000) {
      setTopUpError("Instant top ups are limited to $10,000");
      return;
    }
    bank.topUp(value);
    setTopUpDone(true);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Greeting header */}
      <View style={styles.header}>
        <Avatar name={bank.userName} size="lg" isDark={bank.darkMode} />
        <View style={styles.headerText}>
          <T variant="caption" muted>
            Northwind Bank
          </T>
          <T variant="heading">{bank.userName}</T>
        </View>
        <IconButton
          accessibilityLabel={bank.hideBalances ? "Show balances" : "Hide balances"}
          onPress={() => bank.setHideBalances(!bank.hideBalances)}
          isDark={bank.darkMode}
          icon={
            <T variant="caption">{bank.hideBalances ? "Show" : "Hide"}</T>
          }
        />
      </View>

      {/* Total balance */}
      <Card isDark={bank.darkMode} padding={20}>
        <T variant="label" muted>
          Total balance · {bank.accounts.length} accounts
        </T>
        <Amount value={bank.totalBalance} variant="title" signed={false} style={styles.total} />
        <T variant="caption" muted>
          {bank.hideBalances ? "Balances hidden" : "Across checking, savings and goals"}
        </T>
      </Card>

      {/* Quick actions */}
      <View style={styles.actions}>
        <Button
          size="sm"
          isDark={bank.darkMode}
          accessibilityLabel="Send money"
          variant="filled"
          onPress={() => router.push("/templates/bank/send")}
          style={styles.action}
        >
          Send
        </Button>
        <Button
          size="sm"
          isDark={bank.darkMode}
          accessibilityLabel="Request money"
          variant="filled"
          onPress={() => setSheet("request")}
          style={styles.action}
        >
          Request
        </Button>
        <Button
          size="sm"
          isDark={bank.darkMode}
          accessibilityLabel="Top up account"
          variant="filled"
          onPress={() => setSheet("topup")}
          style={styles.action}
        >
          Top up
        </Button>
        <Button
          size="sm"
          isDark={bank.darkMode}
          accessibilityLabel="More actions"
          onPress={() => setSheet("more")}
          style={styles.action}
        >
          More
        </Button>
      </View>

      {/* Accounts row */}
      <View>
        <SectionTitle>Accounts</SectionTitle>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.accountRow}
        >
          {bank.accounts.map((account) => (
            <Card
              key={account.id}
              isDark={bank.darkMode}
              padding={16}
              style={styles.accountCard}
              onPress={() => router.push(`/templates/bank/account/${account.id}`)}
              accessibilityLabel={`${account.name}, view details`}
            >
              <T variant="label" muted>
                {account.name}
              </T>
              <Amount
                value={bank.balanceOf(account.id)}
                variant="heading"
                signed={false}
                style={styles.accountBalance}
              />
              <T variant="caption" muted>
                ••{account.last4} · {account.kind}
              </T>
            </Card>
          ))}
        </ScrollView>
      </View>

      {/* Bills teaser */}
      <View>
        <SectionTitle>Bills</SectionTitle>
        <ListCard>
          <NavRow
            title={`${bank.bills.filter((b) => !b.paid).length} bills coming up`}
            description={bank.bills.find((b) => !b.paid)?.dueLabel}
            detail={money(bank.bills.filter((b) => !b.paid).reduce((s, b) => s + b.amount, 0))}
            onPress={() => router.push("/templates/bank/bills")}
          />
        </ListCard>
      </View>

      {/* Recent activity */}
      <View>
        <View style={styles.sectionHead}>
          <SectionTitle>Recent activity</SectionTitle>
          <Pressable
            onPress={() => router.push("/templates/bank/(tabs)/activity")}
            accessibilityRole="button"
            accessibilityLabel="See all activity"
          >
            <T variant="label">See all</T>
          </Pressable>
        </View>
        <ListCard>
          {recent.map((tx, i) => (
            <React.Fragment key={tx.id}>
              {i > 0 ? <RowSeparator /> : null}
              <TransactionRow
                tx={tx}
                onPress={() => router.push(`/templates/bank/transaction/${tx.id}`)}
              />
            </React.Fragment>
          ))}
        </ListCard>
      </View>

      {/* ---- Sheets ---- */}
      <Sheet visible={sheet === "request"} onDismiss={closeSheet} isDark={bank.darkMode} height={380}>
        <View style={styles.sheetBody}>
          <T variant="heading">Request money</T>
          {requestSent ? (
            <>
              <Badge tone="muted" isDark={bank.darkMode} style={styles.sheetBadge}>
                Request sent
              </Badge>
              <T variant="body" muted>
                Your payment link northwind.pay/{bank.userHandle.replace("@", "")} was
                shared. Requests this session: {bank.requestCount + 1}.
              </T>
              <Button accessibilityLabel="Done" variant="filled" onPress={closeSheet} isDark={bank.darkMode}>
                Done
              </Button>
            </>
          ) : (
            <>
              <T variant="body" muted>
                Anyone with your link can pay you instantly — no account needed on
                their side.
              </T>
              <ListCard>
                <View style={styles.linkRow}>
                  <T variant="body">northwind.pay/{bank.userHandle.replace("@", "")}</T>
                </View>
              </ListCard>
              <Button
                isDark={bank.darkMode}
                accessibilityLabel="Send request link"
                variant="filled"
                onPress={() => {
                  bank.addRequest();
                  setRequestSent(true);
                }}
              >
                Send request link
              </Button>
            </>
          )}
        </View>
      </Sheet>

      <Sheet visible={sheet === "topup"} onDismiss={closeSheet} isDark={bank.darkMode} height={420}>
        <View style={styles.sheetBody}>
          <T variant="heading">Top up checking</T>
          {topUpDone ? (
            <>
              <Badge tone="muted" isDark={bank.darkMode} style={styles.sheetBadge}>
                Top up complete
              </Badge>
              <T variant="body" muted>
                The money is in your Main Checking (••{checking.last4}) and shows in
                your activity.
              </T>
              <Button accessibilityLabel="Done" variant="filled" onPress={closeSheet} isDark={bank.darkMode}>
                Done
              </Button>
            </>
          ) : (
            <>
              <T variant="body" muted>
                From your linked bank · arrives instantly · free up to $10,000
              </T>
              <Field label="Amount" error={topUpError} isDark={bank.darkMode}>
                <Input
                  value={topUpAmount}
                  onChangeText={setTopUpAmount}
                  placeholder="0.00"
                  keyboardType="numeric"
                  accessibilityLabel="Top up amount"
                  invalid={!!topUpError}
                  isDark={bank.darkMode}
                />
              </Field>
              <Button accessibilityLabel="Confirm top up" variant="filled" onPress={submitTopUp} isDark={bank.darkMode}>
                Add money
              </Button>
            </>
          )}
        </View>
      </Sheet>

      <Sheet visible={sheet === "more"} onDismiss={closeSheet} isDark={bank.darkMode} height={400}>
        <View style={styles.sheetBody}>
          <T variant="heading">More</T>
          <ListCard>
            <NavRow
              title="Spending insights"
              description="Where your money went this month"
              onPress={() => {
                closeSheet();
                router.push("/templates/bank/insights");
              }}
            />
            <RowSeparator />
            <NavRow
              title="Pay a bill"
              description="Utilities, internet, insurance"
              onPress={() => {
                closeSheet();
                router.push("/templates/bank/bills");
              }}
            />
            <RowSeparator />
            <NavRow
              title="All accounts"
              description="Balances and account numbers"
              onPress={() => {
                closeSheet();
                router.push("/templates/bank/(tabs)/accounts");
              }}
            />
          </ListCard>
        </View>
      </Sheet>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 32,
    gap: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerText: { flex: 1 },
  total: { marginTop: 8, marginBottom: 4, fontVariant: ["tabular-nums"] },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  action: { flexGrow: 1, flexBasis: "21%" },
  accountRow: { gap: 12, paddingRight: 4 },
  accountCard: { width: 218 },
  accountBalance: { marginTop: 8, marginBottom: 4 },
  sectionHead: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingRight: 6,
  },
  sheetBody: { paddingHorizontal: 24, paddingTop: 8, gap: 16 },
  sheetBadge: { alignSelf: "flex-start" },
  linkRow: { paddingVertical: 12, paddingHorizontal: 16 },
});
