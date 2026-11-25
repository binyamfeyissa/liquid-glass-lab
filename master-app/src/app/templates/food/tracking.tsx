import React, { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, Progress } from "glacia-native";

import { ORDER_STEPS, useFood } from "./state";
import {
  ListCard,
  MONO,
  Meta,
  RowSeparator,
  SectionTitle,
  T,
  accentColor,
  money,
  positiveColor,
} from "./ui";

const STEP_NOTES: Record<number, string> = {
  0: "The restaurant confirmed your order",
  1: "Your food is being prepared",
  2: "The courier picked it up — it's on the way",
  3: "Delivered to your address",
};

export default function TrackingScreen() {
  const food = useFood();
  const order = food.activeOrder ?? food.orders[0];

  // While this screen is open, the order advances one step every few
  // seconds until it is delivered — a template-friendly stand-in for a
  // real courier feed.
  useEffect(() => {
    if (!order || order.statusIndex >= ORDER_STEPS.length - 1) return;
    const timer = setTimeout(() => food.advanceActiveOrder(), 3500);
    return () => clearTimeout(timer);
  }, [order?.id, order?.statusIndex, food]);

  if (!order) {
    return (
      <View style={styles.empty}>
        <T variant="heading">No orders yet</T>
        <Button
          accessibilityLabel="Browse restaurants"
          variant="filled"
          onPress={() => router.replace("/templates/food/(tabs)")}
          style={styles.emptyButton}
        >
          Browse restaurants
        </Button>
      </View>
    );
  }

  const delivered = order.statusIndex >= ORDER_STEPS.length - 1;
  const progress = ((order.statusIndex + 1) / ORDER_STEPS.length) * 100;

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Meta>
            Order {order.id} · {order.placedLabel}
          </Meta>
          <T variant="title" style={styles.titleText}>
            {delivered ? "Delivered" : ORDER_STEPS[order.statusIndex]}
          </T>
          <T variant="body" muted style={styles.note}>
            {STEP_NOTES[order.statusIndex]}
          </T>
        </View>

        <View style={styles.progressBlock}>
          <Progress
            value={progress}
            isDark={food.darkMode}
            accessibilityLabel={`Order progress: ${ORDER_STEPS[order.statusIndex]}`}
          />
        </View>

        {/* Step timeline */}
        <ListCard>
          {ORDER_STEPS.map((step, i) => {
            const done = i < order.statusIndex;
            const current = i === order.statusIndex;
            const accent = accentColor(food.backdrop);
            return (
              <React.Fragment key={step}>
                {i > 0 ? <RowSeparator /> : null}
                <View style={styles.stepRow}>
                  <View
                    style={[
                      styles.stepIcon,
                      {
                        backgroundColor: done || current
                          ? accent
                          : food.darkMode
                            ? "rgba(255,255,255,0.10)"
                            : "rgba(0,0,0,0.06)",
                      },
                    ]}
                  >
                    {done || (delivered && current) ? (
                      <T variant="body" style={styles.stepGlyphOn}>
                        ✓
                      </T>
                    ) : (
                      <T
                        variant="body"
                        muted={!current}
                        style={current ? styles.stepGlyphOn : undefined}
                      >
                        {i + 1}
                      </T>
                    )}
                  </View>
                  <View style={styles.flex1}>
                    <T variant="body" style={current ? styles.stepCurrent : undefined}>
                      {step}
                    </T>
                    <T variant="caption" muted>
                      {done
                        ? "Done"
                        : current
                          ? order.restaurantName
                          : "Up next"}
                    </T>
                  </View>
                  {current && !delivered ? (
                    <T variant="label" style={{ color: accent }}>
                      Now
                    </T>
                  ) : null}
                </View>
              </React.Fragment>
            );
          })}
        </ListCard>

        {/* Order summary */}
        <View>
          <SectionTitle>Order summary</SectionTitle>
          <ListCard>
            <View style={styles.summaryPad}>
              {order.lines.map((line) => (
                <View key={line.itemId} style={styles.summaryRow}>
                  <T variant="body" muted style={styles.flex1}>
                    {line.qty} × {line.name}
                  </T>
                  <T variant="body" style={styles.figure}>
                    {money(line.price * line.qty)}
                  </T>
                </View>
              ))}
            </View>
            <RowSeparator />
            <View style={styles.summaryPad}>
              <View style={styles.summaryRow}>
                <T variant="body" muted>
                  Subtotal
                </T>
                <T variant="body" style={styles.figure}>
                  {money(order.subtotal)}
                </T>
              </View>
              {order.discount > 0 ? (
                <View style={styles.summaryRow}>
                  <T variant="body" muted>
                    Promo (FORK10)
                  </T>
                  <T
                    variant="body"
                    style={[styles.figure, { color: positiveColor(food.darkMode) }]}
                  >
                    −{money(order.discount)}
                  </T>
                </View>
              ) : null}
              <View style={styles.summaryRow}>
                <T variant="body" muted>
                  Delivery
                </T>
                <T variant="body" style={styles.figure}>
                  {order.deliveryFee === 0 ? "Free" : money(order.deliveryFee)}
                </T>
              </View>
              <View style={styles.summaryRow}>
                <T variant="heading">Total</T>
                <T variant="heading" style={styles.figure}>
                  {money(order.total)}
                </T>
              </View>
            </View>
            <RowSeparator />
            <View style={styles.summaryPad}>
              <T variant="caption" muted>
                Deliver to
              </T>
              <T variant="body">{order.addressLabel}</T>
              <T variant="caption" muted style={styles.payLabel}>
                Paid with
              </T>
              <T variant="body">{order.paymentLabel}</T>
            </View>
          </ListCard>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {delivered ? (
          <Button
            accessibilityLabel="Back to orders"
            variant="filled"
            size="lg"
            onPress={() => router.replace("/templates/food/(tabs)/orders")}
          >
            Back to orders
          </Button>
        ) : (
          <Button
            accessibilityLabel="Continue browsing"
            size="lg"
            onPress={() => router.replace("/templates/food/(tabs)")}
          >
            Continue browsing
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 28,
    gap: 16,
  },
  flex1: { flex: 1 },
  titleText: { marginTop: 8 },
  note: { marginTop: 4 },
  progressBlock: { paddingHorizontal: 2 },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  stepGlyphOn: { color: "#ffffff" },
  stepCurrent: { fontWeight: "600" },
  summaryPad: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  figure: {
    fontFamily: MONO,
    fontVariant: ["tabular-nums"],
  },
  payLabel: { marginTop: 8 },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 32,
  },
  emptyButton: { minWidth: 200 },
});
