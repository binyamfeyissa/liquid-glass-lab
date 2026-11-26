import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Badge, Button, Card, Progress, Switch } from "glacia-native";

import { useBank } from "../state";
import {
  MONO,
  ListCard,
  RowSeparator,
  Screen,
  SectionTitle,
  SettingRow,
  T,
  accentColor,
  money,
} from "../ui";

const CARD_NUMBER = "4021 7784 0093 4821";

export default function CardsScreen() {
  const bank = useBank();
  const [detailsRevealed, setDetailsRevealed] = useState(false);
  const limitUsed = Math.min(100, Math.round((bank.spentToday / bank.dailyLimit) * 100));

  return (
    <Screen title="Cards" subtitle="Debit card ending in 4821">
      {/* The card visual */}
      <Card
        isDark={bank.darkMode}
        padding={20}
        cornerRadius={20}
        style={bank.cardFrozen ? styles.frozenCard : undefined}
        contentStyle={styles.cardInner}
      >
        <View style={styles.cardTop}>
          <T variant="heading" style={bank.cardFrozen ? styles.frozenText : undefined}>
            Northwind
          </T>
          {bank.cardFrozen ? (
            <Badge tone="destructive" isDark={bank.darkMode}>
              Frozen
            </Badge>
          ) : (
            <Badge tone="muted" isDark={bank.darkMode}>
              Active
            </Badge>
          )}
        </View>
        <View style={styles.chip} />
        <T variant="title" style={[styles.cardNumber, bank.cardFrozen && styles.frozenText]}>
          {detailsRevealed ? CARD_NUMBER : "•••• •••• •••• 4821"}
        </T>
        <View style={styles.cardBottom}>
          <View>
            <T variant="caption" muted>
              Card holder
            </T>
            <T variant="body">{bank.userName}</T>
          </View>
          <View>
            <T variant="caption" muted>
              Expires
            </T>
            <T variant="body">09 / 29</T>
          </View>
          <View>
            <T variant="caption" muted>
              CVC
            </T>
            <T variant="body">{detailsRevealed ? "314" : "•••"}</T>
          </View>
        </View>
        {bank.cardFrozen ? (
          <T variant="caption" muted style={styles.frozenNote}>
            This card is frozen — new payments will be declined until you unfreeze it.
          </T>
        ) : null}
      </Card>

      <Button
        isDark={bank.darkMode}
        accessibilityLabel={detailsRevealed ? "Hide card details" : "Show card details"}
        variant="filled"
        tint={accentColor(bank.backdrop)}
        onPress={() => setDetailsRevealed(!detailsRevealed)}
      >
        {detailsRevealed ? "Hide card details" : "Show card details"}
      </Button>

      {/* Controls */}
      <View>
        <SectionTitle>Controls</SectionTitle>
        <ListCard>
          <SettingRow
            title="Freeze card"
            description="Instantly blocks all new payments"
          >
            <Switch
              value={bank.cardFrozen}
              onValueChange={bank.setCardFrozen}
              accessibilityLabel="Freeze card"
              accentColor={accentColor(bank.backdrop)}
              isDark={bank.darkMode}
            />
          </SettingRow>
          <RowSeparator />
          <SettingRow
            title="Online payments"
            description="Shopping on websites and in apps"
          >
            <Switch
              value={bank.cardOnlinePayments}
              onValueChange={bank.setCardOnlinePayments}
              accessibilityLabel="Online payments"
              accentColor={accentColor(bank.backdrop)}
              isDark={bank.darkMode}
            />
          </SettingRow>
          <RowSeparator />
          <SettingRow
            title="International use"
            description="Payments outside your home country"
          >
            <Switch
              value={bank.cardInternational}
              onValueChange={bank.setCardInternational}
              accessibilityLabel="International use"
              accentColor={accentColor(bank.backdrop)}
              isDark={bank.darkMode}
            />
          </SettingRow>
        </ListCard>
      </View>

      {/* Daily limit */}
      <View>
        <SectionTitle>Daily spending limit</SectionTitle>
        <ListCard>
          <View style={styles.limitBody}>
            <View style={styles.limitHead}>
              <T variant="body">
                {money(bank.spentToday)} spent today
              </T>
              <T variant="body" muted>
                of {money(bank.dailyLimit)}
              </T>
            </View>
            <Progress
              value={limitUsed}
              tint={accentColor(bank.backdrop)}
              isDark={bank.darkMode}
              accessibilityLabel="Daily limit used"
            />
            <T variant="caption" muted>
              Card payments from Main Checking count toward this limit. It resets at
              midnight.
            </T>
          </View>
        </ListCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardInner: { gap: 16 },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chip: {
    width: 44,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(168, 154, 109, 0.8)",
  },
  cardNumber: { fontFamily: MONO, fontVariant: ["tabular-nums"] },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  frozenCard: { opacity: 0.72 },
  frozenText: { opacity: 0.65 },
  frozenNote: { marginTop: 2 },
  limitBody: { padding: 16, gap: 8 },
  limitHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
});
