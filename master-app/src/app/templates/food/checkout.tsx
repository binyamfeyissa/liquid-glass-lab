import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, Field, Input, RadioGroup, Textarea } from "glacia-native";

import { useFood } from "./state";
import { PAYMENT_CARDS } from "./data";
import {
  BackButton,
  ListCard,
  MONO,
  RowSeparator,
  SectionTitle,
  T,
  money,
  positiveColor,
} from "./ui";

export default function CheckoutScreen() {
  const food = useFood();

  const [addressId, setAddressId] = useState(food.addresses[0]?.id ?? "");
  const [street, setStreet] = useState("");
  const [streetError, setStreetError] = useState<string | undefined>();
  const [instructions, setInstructions] = useState("");
  const [paymentId, setPaymentId] = useState(PAYMENT_CARDS[0].id);

  const restaurant = food.cartRestaurant;
  const deliveryFee = restaurant?.deliveryFee ?? 0;
  const total = food.cartSubtotal - food.promoDiscount + deliveryFee;

  const selectedAddress = food.addresses.find((a) => a.id === addressId);

  const addressOptions = useMemo(
    () => [
      ...food.addresses.map((a) => ({
        value: a.id,
        label: a.label,
        description: a.line,
      })),
      { value: "new", label: "New address", description: "Enter a street below" },
    ],
    [food.addresses],
  );

  const placeOrder = () => {
    let addressLabel: string;
    if (addressId === "new") {
      if (street.trim().length < 6) {
        setStreetError("Enter the full street address");
        return;
      }
      const saved = food.addAddress("Custom", street.trim());
      addressLabel = `${saved.label} — ${saved.line}`;
    } else {
      if (!selectedAddress) return;
      addressLabel = `${selectedAddress.label} — ${selectedAddress.line}`;
    }
    const payment = PAYMENT_CARDS.find((c) => c.id === paymentId);
    food.placeOrder({
      addressLabel,
      paymentLabel: payment?.label ?? "Card",
      instructions,
    });
    router.replace("/templates/food/tracking");
  };

  if (food.cartLines.length === 0) {
    return (
      <View style={styles.empty}>
        <T variant="heading">Nothing to check out</T>
        <T variant="body" muted style={styles.emptyText}>
          Your cart is empty — add a dish first
        </T>
        <Button
          isDark={food.darkMode}
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

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <BackButton label="Back to cart" />
          <T variant="title">Checkout</T>
        </View>

        {/* Address */}
        <View>
          <SectionTitle>Delivery address</SectionTitle>
          <ListCard>
            <View style={styles.cardPad}>
              <RadioGroup
                options={addressOptions}
                value={addressId}
                onValueChange={(v) => {
                  setAddressId(v);
                  setStreetError(undefined);
                }}
                isDark={food.darkMode}
                accessibilityLabel="Delivery address"
              />
              {addressId === "new" ? (
                <Field
                  label="Street address"
                  error={streetError}
                  isDark={food.darkMode}
                  style={styles.streetField}
                >
                  <Input
                    value={street}
                    onChangeText={(t) => {
                      setStreet(t);
                      setStreetError(undefined);
                    }}
                    placeholder="42 Willow Lane, Apt 7"
                    accessibilityLabel="New street address"
                    invalid={!!streetError}
                    isDark={food.darkMode}
                  />
                </Field>
              ) : null}
            </View>
          </ListCard>
        </View>

        {/* Instructions */}
        <View>
          <SectionTitle>Delivery instructions</SectionTitle>
          <Textarea
            value={instructions}
            onChangeText={setInstructions}
            placeholder="Leave at the door, ring the bell twice…"
            accessibilityLabel="Delivery instructions"
            isDark={food.darkMode}
            minLines={3}
          />
        </View>

        {/* Payment */}
        <View>
          <SectionTitle>Payment</SectionTitle>
          <ListCard>
            <View style={styles.cardPad}>
              <RadioGroup
                options={PAYMENT_CARDS.map((c) => ({
                  value: c.id,
                  label: c.label,
                  description: c.detail,
                }))}
                value={paymentId}
                onValueChange={setPaymentId}
                isDark={food.darkMode}
                accessibilityLabel="Payment method"
              />
            </View>
          </ListCard>
        </View>

        {/* Summary */}
        <View>
          <SectionTitle>Order summary</SectionTitle>
          <ListCard>
            <View style={styles.summaryPad}>
              <T variant="label" muted>
                {restaurant?.name}
              </T>
              {food.cartLines.map((line) => (
                <View key={line.item.id} style={styles.summaryRow}>
                  <T variant="body" muted style={styles.flex1}>
                    {line.qty} × {line.item.name}
                  </T>
                  <T variant="body" style={styles.figure}>
                    {money(line.item.price * line.qty)}
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
                  {money(food.cartSubtotal)}
                </T>
              </View>
              {food.promoDiscount > 0 ? (
                <View style={styles.summaryRow}>
                  <T variant="body" muted>
                    Promo (FORK10)
                  </T>
                  <T
                    variant="body"
                    style={[styles.figure, { color: positiveColor(food.darkMode) }]}
                  >
                    −{money(food.promoDiscount)}
                  </T>
                </View>
              ) : null}
              <View style={styles.summaryRow}>
                <T variant="body" muted>
                  Delivery
                </T>
                <T variant="body" style={styles.figure}>
                  {deliveryFee === 0 ? "Free" : money(deliveryFee)}
                </T>
              </View>
              <View style={styles.summaryRow}>
                <T variant="heading">Total</T>
                <T variant="heading" style={styles.figure}>
                  {money(total)}
                </T>
              </View>
            </View>
          </ListCard>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          isDark={food.darkMode}
          accessibilityLabel={`Place order, ${money(total)}`}
          variant="filled"
          size="lg"
          onPress={placeOrder}
        >{`Place order · ${money(total)}`}</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 112,
    paddingBottom: 28,
    gap: 24,
  },
  flex1: { flex: 1 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardPad: { paddingVertical: 8, paddingHorizontal: 16 },
  streetField: { marginTop: 12 },
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
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyText: { textAlign: "center" },
  emptyButton: { marginTop: 8, minWidth: 200 },
});
