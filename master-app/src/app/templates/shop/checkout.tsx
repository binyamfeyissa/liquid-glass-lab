import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Badge, Button, Field, Input, RadioGroup } from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Tick01Icon from "@hugeicons/core-free-icons/Tick01Icon";
import { useShop, type Address, type Order } from "./state";
import { productById } from "./data";
import {
  Figure,
  ListCard,
  RowSeparator,
  SectionTitle,
  T,
  accentColor,
  money,
} from "./ui";

const PAYMENTS = [
  { value: "Card ••4821", label: "Card ••4821", description: "Visa ending 4821" },
  { value: "PayPal", label: "PayPal", description: "alex@rivera.mail" },
  { value: "Apple Pay", label: "Apple Pay", description: "Confirm with Face ID" },
];

const NEW_ADDRESS = "__new";

export default function CheckoutScreen() {
  const shop = useShop();

  const [name, setName] = useState(shop.userName);
  const [email, setEmail] = useState(shop.userEmail);
  const [addressChoice, setAddressChoice] = useState(shop.addresses[0]?.id ?? NEW_ADDRESS);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [payment, setPayment] = useState(PAYMENTS[0].value);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placed, setPlaced] = useState<Order | null>(null);

  const afterDiscount = shop.cartSubtotal - shop.promoDiscount;
  const shipping = shop.shippingFor(afterDiscount);
  const total = afterDiscount + shipping;

  const addressOptions = useMemo(
    () => [
      ...shop.addresses.map((a) => ({
        value: a.id,
        label: a.label,
        description: `${a.street}, ${a.city} ${a.postcode}`,
      })),
      { value: NEW_ADDRESS, label: "New address", description: "Enter it below" },
    ],
    [shop.addresses],
  );

  const placeOrder = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Your name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Enter a valid email address";
    }

    let address: Address | undefined = shop.addresses.find((a) => a.id === addressChoice);
    if (addressChoice === NEW_ADDRESS) {
      if (!street.trim()) next.street = "Street address is required";
      if (!city.trim()) next.city = "City is required";
      if (!postcode.trim()) next.postcode = "Postcode is required";
      if (!next.street && !next.city && !next.postcode) {
        address = shop.addAddress({
          label: "Home",
          street: street.trim(),
          city: city.trim(),
          postcode: postcode.trim(),
        });
      }
    }

    setErrors(next);
    if (Object.keys(next).length > 0 || !address) return;

    const order = shop.placeOrder({
      name: name.trim(),
      email: email.trim(),
      address,
      paymentLabel: payment,
    });
    setPlaced(order);
  };

  /* ---- Success state ---- */
  if (placed) {
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.success}>
          <HugeiconsIcon icon={Tick01Icon} size={36} color={accentColor(shop.backdrop)} />
          <T variant="title">Order placed</T>
          <Badge tone="muted" isDark={shop.darkMode}>
            {placed.number}
          </Badge>
          <T variant="body" muted style={styles.successText}>
            Thank you — your {placed.items.length}{" "}
            {placed.items.length === 1 ? "piece is" : "pieces are"} being prepared in
            the studio. A confirmation is on its way to your email — this is a
            template, so no real email (or charge) exists.
          </T>
          <ListCard style={styles.successCard}>
            <View style={styles.summary}>
              {placed.items.map((item) => (
                <View key={`${item.productId}-${item.finish}`} style={styles.summaryRow}>
                  <T variant="body" muted>
                    {item.qty} × {item.name} ({item.finish})
                  </T>
                  <Figure value={item.price * item.qty} />
                </View>
              ))}
              <RowSeparator />
              <View style={styles.summaryRow}>
                <T variant="heading">Total</T>
                <Figure value={placed.total} variant="heading" />
              </View>
            </View>
          </ListCard>
          <Button
            isDark={shop.darkMode}
            accessibilityLabel="View this order"
            variant="filled"
            size="lg"
            onPress={() => router.replace(`/templates/shop/order/${placed.id}`)}
            style={styles.successButton}
          >{`View order ${placed.number}`}</Button>
          <Button
            isDark={shop.darkMode}
            accessibilityLabel="Continue shopping"
            variant="ghost"
            onPress={() => router.replace("/templates/shop/(tabs)/index")}
          >
            Continue shopping
          </Button>
        </View>
      </ScrollView>
    );
  }

  /* ---- Empty cart guard ---- */
  if (shop.cart.length === 0) {
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <T variant="title">Checkout</T>
        <ListCard>
          <View style={styles.empty}>
            <T variant="heading">Nothing to check out</T>
            <T variant="body" muted>
              Your cart is empty — add a piece from the shop first
            </T>
            <Button
              isDark={shop.darkMode}
              accessibilityLabel="Browse products"
              variant="filled"
              onPress={() => router.replace("/templates/shop/(tabs)/shop")}
            >
              Browse products
            </Button>
          </View>
        </ListCard>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.topBar}>
        <Button
          isDark={shop.darkMode}
          accessibilityLabel="Back to cart"
          variant="ghost"
          size="sm"
          onPress={() => router.back()}
        >
          Cart
        </Button>
        <T variant="heading">Checkout</T>
        <View style={styles.spacer} />
      </View>

      {/* Contact */}
      <View>
        <SectionTitle>Contact</SectionTitle>
        <View style={styles.form}>
          <Field label="Full name" error={errors.name} isDark={shop.darkMode}>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Alex Rivera"
              accessibilityLabel="Full name"
              autoCapitalize="words"
              invalid={!!errors.name}
              isDark={shop.darkMode}
            />
          </Field>
          <Field label="Email" error={errors.email} isDark={shop.darkMode}>
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              accessibilityLabel="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              invalid={!!errors.email}
              isDark={shop.darkMode}
            />
          </Field>
        </View>
      </View>

      {/* Delivery address */}
      <View>
        <SectionTitle>Delivery address</SectionTitle>
        <ListCard>
          <View style={styles.radioWrap}>
            <RadioGroup
              value={addressChoice}
              onValueChange={setAddressChoice}
              options={addressOptions}
              accessibilityLabel="Delivery address"
              isDark={shop.darkMode}
            />
          </View>
        </ListCard>
        {addressChoice === NEW_ADDRESS ? (
          <View style={styles.form}>
            <Field label="Street address" error={errors.street} isDark={shop.darkMode}>
              <Input
                value={street}
                onChangeText={setStreet}
                placeholder="418 Maple Street, Apt 7"
                accessibilityLabel="Street address"
                invalid={!!errors.street}
                isDark={shop.darkMode}
              />
            </Field>
            <View style={styles.formRow}>
              <View style={styles.flex}>
                <Field label="City" error={errors.city} isDark={shop.darkMode}>
                  <Input
                    value={city}
                    onChangeText={setCity}
                    placeholder="Portland, OR"
                    accessibilityLabel="City"
                    invalid={!!errors.city}
                    isDark={shop.darkMode}
                  />
                </Field>
              </View>
              <View style={styles.flex}>
                <Field label="Postcode" error={errors.postcode} isDark={shop.darkMode}>
                  <Input
                    value={postcode}
                    onChangeText={setPostcode}
                    placeholder="97205"
                    accessibilityLabel="Postcode"
                    invalid={!!errors.postcode}
                    isDark={shop.darkMode}
                  />
                </Field>
              </View>
            </View>
          </View>
        ) : null}
      </View>

      {/* Payment */}
      <View>
        <SectionTitle>Payment</SectionTitle>
        <ListCard>
          <View style={styles.radioWrap}>
            <RadioGroup
              value={payment}
              onValueChange={setPayment}
              options={PAYMENTS}
              accessibilityLabel="Payment method"
              isDark={shop.darkMode}
            />
          </View>
        </ListCard>
        <T variant="caption" muted style={styles.note}>
          Fixture payment methods — placing the order charges nothing
        </T>
      </View>

      {/* Summary */}
      <View>
        <SectionTitle>Order summary</SectionTitle>
        <ListCard>
          <View style={styles.summary}>
            {shop.cart.map((line) => {
              const product = productById(line.productId);
              return (
                <View key={line.key} style={styles.summaryRow}>
                  <T variant="body" muted>
                    {line.qty} × {product.name} ({line.finish})
                  </T>
                  <Figure value={product.price * line.qty} />
                </View>
              );
            })}
            <RowSeparator />
            <View style={styles.summaryRow}>
              <T variant="body" muted>Subtotal</T>
              <Figure value={shop.cartSubtotal} />
            </View>
            {shop.promoDiscount > 0 ? (
              <View style={styles.summaryRow}>
                <T variant="body" muted>Discount (GLASS10)</T>
                <Figure value={-shop.promoDiscount} />
              </View>
            ) : null}
            <View style={styles.summaryRow}>
              <T variant="body" muted>Shipping</T>
              {shipping === 0 ? (
                <T variant="body">Free</T>
              ) : (
                <Figure value={shipping} />
              )}
            </View>
            <View style={styles.summaryRow}>
              <T variant="heading">Total</T>
              <Figure value={total} variant="heading" />
            </View>
          </View>
        </ListCard>
      </View>

      <Button
        isDark={shop.darkMode}
        accessibilityLabel={`Place order, total ${money(total)}`}
        variant="filled"
        size="lg"
        onPress={placeOrder}
      >{`Place order · ${money(total)}`}</Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 28,
    gap: 20,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  spacer: { width: 64 },
  flex: { flex: 1 },
  form: { gap: 12 },
  formRow: { flexDirection: "row", gap: 12 },
  radioWrap: { paddingVertical: 8, paddingHorizontal: 16 },
  note: { marginTop: 8, marginLeft: 8 },
  summary: { paddingVertical: 8, gap: 4 },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 12,
  },
  empty: { padding: 16, gap: 8, alignItems: "flex-start" },
  success: { alignItems: "center", gap: 12, paddingTop: 24 },
  successText: { textAlign: "center", lineHeight: 22 },
  successCard: { alignSelf: "stretch" },
  successButton: { alignSelf: "stretch" },
});
