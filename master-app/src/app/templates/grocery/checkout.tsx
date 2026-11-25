import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, Field, IconButton, Input, RadioGroup } from "glacia-native";

import { useBasket, type Order } from "./state";
import { Figure, ListCard, RowSeparator, SectionTitle, T, money } from "./ui";

export default function CheckoutScreen() {
  const basket = useBasket();
  const [placed, setPlaced] = useState<Order | null>(null);

  const [addingAddress, setAddingAddress] = useState(false);
  const [label, setLabel] = useState("");
  const [line, setLine] = useState("");
  const [city, setCity] = useState("");
  const [addressError, setAddressError] = useState<string | undefined>();

  const saveAddress = () => {
    if (!label.trim() || !line.trim() || !city.trim()) {
      setAddressError("Fill in a label, street address and city");
      return;
    }
    basket.addAddress(label, line, city);
    setLabel("");
    setLine("");
    setCity("");
    setAddressError(undefined);
    setAddingAddress(false);
  };

  /* ------------------------- success state ------------------------- */
  if (placed) {
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.success}>
          <T variant="title">Order placed</T>
          <Figure variant="body" muted style={styles.successText}>
            Order {placed.number} · {money(placed.total)}
          </Figure>
          <ListCard style={styles.pad}>
            <View style={styles.totalRow}>
              <T variant="body" muted>
                Arriving
              </T>
              <Figure variant="body">{placed.slotLabel}</Figure>
            </View>
            <View style={styles.totalRow}>
              <T variant="body" muted>
                Deliver to
              </T>
              <T variant="body">{placed.addressLabel}</T>
            </View>
            <View style={styles.totalRow}>
              <T variant="body" muted>
                Paid with
              </T>
              <T variant="body">{placed.paymentLabel}</T>
            </View>
            <View style={styles.totalRow}>
              <T variant="body" muted>
                Items
              </T>
              <Figure variant="body">
                {placed.lines.reduce((s, l) => s + l.qty, 0)}
              </Figure>
            </View>
          </ListCard>
          <Button
            accessibilityLabel="View my orders"
            variant="filled"
            size="lg"
            style={styles.wide}
            onPress={() => router.replace("/templates/grocery/(tabs)/orders")}
          >
            View my orders
          </Button>
          <Button
            accessibilityLabel="Continue shopping"
            variant="ghost"
            onPress={() => router.replace("/templates/grocery/(tabs)")}
          >
            Continue shopping
          </Button>
        </View>
      </ScrollView>
    );
  }

  /* --------------------------- form state --------------------------- */
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <IconButton
          accessibilityLabel="Back"
          onPress={() => router.back()}
          isDark={basket.darkMode}
          icon={<T variant="heading">‹</T>}
        />
        <View style={styles.flex}>
          <T variant="title">Checkout</T>
          <Figure variant="body" muted style={styles.subtitle}>
            {basket.cartCount} items · {money(basket.cartTotal)}
          </Figure>
        </View>
      </View>

      {/* Address */}
      <View>
        <SectionTitle>Deliver to</SectionTitle>
        <ListCard style={styles.pad}>
          <RadioGroup
            accessibilityLabel="Delivery address"
            isDark={basket.darkMode}
            value={basket.selectedAddressId}
            onValueChange={basket.setSelectedAddressId}
            options={basket.addresses.map((a) => ({
              value: a.id,
              label: a.label,
              description: `${a.line}, ${a.city}`,
            }))}
          />
          {addingAddress ? (
            <View style={styles.addressForm}>
              <Field label="Label" isDark={basket.darkMode}>
                <Input
                  value={label}
                  onChangeText={setLabel}
                  placeholder="e.g. Parents' house"
                  accessibilityLabel="Address label"
                />
              </Field>
              <Field label="Street address" isDark={basket.darkMode}>
                <Input
                  value={line}
                  onChangeText={setLine}
                  placeholder="Street and number"
                  accessibilityLabel="Street address"
                />
              </Field>
              <Field label="City" error={addressError} isDark={basket.darkMode}>
                <Input
                  value={city}
                  onChangeText={setCity}
                  placeholder="City"
                  accessibilityLabel="City"
                  invalid={!!addressError}
                />
              </Field>
              <Button
                accessibilityLabel="Save address"
                variant="filled"
                onPress={saveAddress}
              >
                Save address
              </Button>
              <Button
                accessibilityLabel="Cancel adding address"
                variant="ghost"
                onPress={() => setAddingAddress(false)}
              >
                Cancel
              </Button>
            </View>
          ) : (
            <Button
              accessibilityLabel="Add a new address"
              variant="ghost"
              onPress={() => setAddingAddress(true)}
            >
              Add a new address
            </Button>
          )}
        </ListCard>
      </View>

      {/* Slot */}
      <View>
        <SectionTitle>Delivery slot</SectionTitle>
        <ListCard style={styles.pad}>
          <View style={styles.slotRow}>
            <View style={styles.flex}>
              <Figure variant="body">
                {basket.slot.dateLabel} · {basket.slot.windowLabel}
              </Figure>
            </View>
            <Button
              accessibilityLabel="Change delivery slot"
              variant="ghost"
              size="sm"
              onPress={() => router.push("/templates/grocery/slot")}
            >
              Change
            </Button>
          </View>
        </ListCard>
      </View>

      {/* Payment */}
      <View>
        <SectionTitle>Payment</SectionTitle>
        <ListCard style={styles.pad}>
          <RadioGroup
            accessibilityLabel="Payment method"
            isDark={basket.darkMode}
            value={basket.selectedPaymentId}
            onValueChange={basket.setSelectedPaymentId}
            options={basket.paymentMethods.map((p) => ({
              value: p.id,
              label: p.label,
              description: p.detail,
            }))}
          />
        </ListCard>
      </View>

      {/* Summary */}
      <ListCard style={styles.pad}>
        <View style={styles.totalRow}>
          <T variant="body" muted>
            Subtotal
          </T>
          <Figure variant="body">{money(basket.cartSubtotal)}</Figure>
        </View>
        <View style={styles.totalRow}>
          <T variant="body" muted>
            Delivery
          </T>
          <Figure variant="body">
            {basket.deliveryFee === 0 ? "Free" : money(basket.deliveryFee)}
          </Figure>
        </View>
        <RowSeparator />
        <View style={styles.totalRow}>
          <T variant="heading">Total</T>
          <Figure variant="heading">{money(basket.cartTotal)}</Figure>
        </View>
      </ListCard>

      <Button
        accessibilityLabel="Place order"
        variant="filled"
        size="lg"
        disabled={basket.cart.length === 0}
        onPress={() => setPlaced(basket.placeOrder())}
      >
        Place order · {money(basket.cartTotal)}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wide: { alignSelf: "stretch" },
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 40,
    gap: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  subtitle: {
    marginTop: 4,
  },
  pad: {
    padding: 16,
  },
  addressForm: {
    gap: 12,
    marginTop: 12,
  },
  slotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    gap: 12,
  },
  success: {
    alignItems: "center",
    gap: 12,
    paddingTop: 32,
  },
  successText: {
    textAlign: "center",
  },
});
