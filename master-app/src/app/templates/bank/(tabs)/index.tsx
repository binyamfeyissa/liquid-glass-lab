import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import {
  Avatar,
  Badge,
  Button,
  Field,
  IconButton,
  Input,
  Sheet,
  colors,
} from "glacia-native";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Ellipsis,
  Eye,
  EyeOff,
  Plus,
} from "lucide-react-native";

import { useBank } from "../state";
import {
  AccountRow,
  Amount,
  ListCard,
  NavRow,
  RowSeparator,
  SectionTitle,
  T,
  TransactionRow,
  accentColor,
  money,
} from "../ui";

type SheetKind = "request" | "topup" | "more" | null;

/**
 * Home — the dashboard. The total balance is plain text on the backdrop
 * (28–40pt, tabular), not a glass card: glass is spent only on the four
 * action circles, the grouped lists and the TabBar. Send is the primary
 * action (green-tinted icon); Request / Top up / More are plain glass.
 */
export default function HomeScreen() {
  const bank = useBank();
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpError, setTopUpError] = useState<string | undefined>();
  const [topUpDone, setTopUpDone] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const checking = bank.accounts[0];
  const recent = bank.transactions.slice(0, 5);
  const foreground = colors[bank.darkMode ? "dark" : "light"].foreground;
  const accent = accentColor(bank.backdrop);
  /** Neutral glass wash for the non-primary action circles: the library
   *  IconButton fallback paints an untinted circle solid system-blue, so
   *  the tint is set explicitly. On the engine the same tint is a neutral
   *  wash over the glass. Send keeps the green tint + a white glyph. */
  const neutralTint = colors[bank.darkMode ? "dark" : "light"].glass;

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

  const actions = [
    {
      label: "Send",
      icon: <ArrowUpRight size={22} color="#FFFFFF" />,
      onPress: () => router.push("/templates/bank/send"),
      a11y: "Send money",
      primary: true,
    },
    {
      label: "Request",
      icon: <ArrowDownLeft size={22} color={foreground} />,
      onPress: () => setSheet("request"),
      a11y: "Request money",
      primary: false,
    },
    {
      label: "Top up",
      icon: <Plus size={22} color={foreground} />,
      onPress: () => setSheet("topup"),
      a11y: "Top up account",
      primary: false,
    },
    {
      label: "More",
      icon: <Ellipsis size={22} color={foreground} />,
      onPress: () => setSheet("more"),
      a11y: "More actions",
      primary: false,
    },
  ];

  return (
    <View style={styles.screen}>
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Greeting header */}
      <View style={styles.header}>
        <Avatar name={bank.userName} size="lg" isDark={bank.darkMode} source={bank.userImage} />
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
          tint={neutralTint}
          icon={
            bank.hideBalances ? (
              <EyeOff size={20} color={foreground} />
            ) : (
              <Eye size={20} color={foreground} />
            )
          }
        />
      </View>

      {/* Total balance — plain text on the backdrop, no glass card. */}
      <View style={styles.balanceBlock}>
        <T variant="label" muted>
          Total balance
        </T>
        <Amount
          value={bank.totalBalance}
          variant="title"
          signed={false}
          style={styles.total}
        />
        <T variant="caption" muted>
          {bank.hideBalances
            ? "Balances hidden"
            : `${bank.accounts.length} accounts · Checking, savings and goals`}
        </T>
      </View>

      {/* Quick actions — icon + label, Send primary in the bank green. */}
      <View style={styles.actions}>
        {actions.map((action) => (
          <Pressable
            key={action.label}
            onPress={action.onPress}
            accessibilityRole="button"
            accessibilityLabel={action.a11y}
            style={styles.action}
          >
            <IconButton
              accessibilityLabel={action.a11y}
              onPress={action.onPress}
              isDark={bank.darkMode}
              size="lg"
              tint={action.primary ? accent : neutralTint}
              icon={action.icon}
            />
            <T
              variant="caption"
              style={[styles.actionLabel, action.primary && { color: accent }]}
            >
              {action.label}
            </T>
          </Pressable>
        ))}
      </View>

      {/* Accounts — one grouped list, same rows as the Accounts tab. */}
      <View>
        <SectionTitle>Accounts</SectionTitle>
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
            <T variant="label" style={{ color: accent }}>
              See all
            </T>
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
    </ScrollView>

    {/* Sheets sit outside the ScrollView: the fallback Sheet is an
       absolutely-positioned panel, so inside the scroll content its
       bottom:0 lands below the fold. At the screen root it anchors to
       the viewport. The engine Sheet portals itself either way. */}
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
              <Button accessibilityLabel="Done" variant="filled" tint={accent} onPress={closeSheet} isDark={bank.darkMode}>
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
                tint={accent}
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
              <Button accessibilityLabel="Done" variant="filled" tint={accent} onPress={closeSheet} isDark={bank.darkMode}>
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
              <Button accessibilityLabel="Confirm top up" variant="filled" tint={accent} onPress={submitTopUp} isDark={bank.darkMode}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 112,
    paddingBottom: 32,
    gap: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerText: { flex: 1 },
  balanceBlock: { gap: 4 },
  total: {
    fontSize: 40,
    lineHeight: 46,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  action: { flex: 1, alignItems: "center", gap: 6 },
  actionLabel: { fontWeight: "600" },
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
