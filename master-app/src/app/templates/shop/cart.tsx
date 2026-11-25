import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, Field, Input, Stepper } from "glacia-native";

import { useShop, FREE_SHIPPING_OVER, type CartLine } from "./state";
import { productById } from "./data";
import {
  Figure,
  ListCard,
  ProductVisual,
  RowSeparator,
  SectionTitle,
  T,
  money,
} from "./ui";

function CartRow({ line }: { line: CartLine }) {
  const shop = useShop();
  const product = productById(line.productId);
  return (
    <View style={styles.row}>
      <View style={styles.thumb}>
        <ProductVisual product={product} finish={line.finish} height={56} radius={10} />
      </View>
      <View style={styles.flex}>
        <T variant="body" numberOfLines={1}>
          {product.name}
        </T>
        <T variant="caption" muted>
          {line.finish} · {money(product.price)} each
        </T>
        <View style={styles.rowControls}>
          <Stepper
            value={line.qty}
            onValueChange={(qty) => shop.setLineQty(line.key, qty)}
            min={0}
            max={12}
            accessibilityLabel={`Quantity for ${product.name}`}
            isDark={shop.darkMode}
          />
          <Button
            isDark={shop.darkMode}
            accessibilityLabel={`Remove ${product.name} from cart`}
            variant="ghost"
            size="sm"
            onPress={() => shop.removeLine(line.key)}
          >
            Remove
          </Button>
        </View>
      </View>
      <Figure value={product.price * line.qty} />
    </View>
  );
}

export default function CartScreen() {
  const shop = useShop();
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState<string | undefined>();

  const afterDiscount = shop.cartSubtotal - shop.promoDiscount;
  const shipping = shop.shippingFor(afterDiscount);
  const total = afterDiscount + shipping;
  const awayFromFree = FREE_SHIPPING_OVER - afterDiscount;

  const applyPromo = () => {
    if (!promoInput.trim()) {
      setPromoError("Enter a code — try GLASS10");
      return;
    }
    if (shop.applyPromo(promoInput)) {
      setPromoError(undefined);
      setPromoInput("");
    } else {
      setPromoError("That code is not valid for this shop");
    }
  };

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
          accessibilityLabel="Back"
          variant="ghost"
          size="sm"
          onPress={() => router.back()}
        >
          Back
        </Button>
        <T variant="heading">Cart</T>
        <View style={styles.spacer} />
      </View>

      {shop.cart.length === 0 ? (
        <ListCard>
          <View style={styles.empty}>
            <T variant="heading">Your cart is empty</T>
            <T variant="body" muted>
              Add a piece from the shop and it will show up here
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
      ) : (
        <>
          <ListCard>
            {shop.cart.map((line, i) => (
              <React.Fragment key={line.key}>
                {i > 0 ? <RowSeparator /> : null}
                <CartRow line={line} />
              </React.Fragment>
            ))}
          </ListCard>

          {/* Promo code */}
          <View>
            <SectionTitle>Promo code</SectionTitle>
            {shop.promoCode ? (
              <ListCard>
                <View style={styles.promoApplied}>
                  <View style={styles.flex}>
                    <T variant="body">{shop.promoCode} applied</T>
                    <T variant="caption" muted>
                      10% off your subtotal — {money(shop.promoDiscount)} saved
                    </T>
                  </View>
                  <Button
                    isDark={shop.darkMode}
                    accessibilityLabel="Remove promo code"
                    variant="ghost"
                    size="sm"
                    onPress={shop.removePromo}
                  >
                    Remove
                  </Button>
                </View>
              </ListCard>
            ) : (
              <View style={styles.promoRow}>
                <View style={styles.flex}>
                  <Field error={promoError} isDark={shop.darkMode}>
                    <Input
                      value={promoInput}
                      onChangeText={setPromoInput}
                      placeholder="Try GLASS10"
                      accessibilityLabel="Promo code"
                      autoCapitalize="characters"
                      autoCorrect={false}
                      invalid={!!promoError}
                      isDark={shop.darkMode}
                    />
                  </Field>
                </View>
                <Button isDark={shop.darkMode} accessibilityLabel="Apply promo code" onPress={applyPromo}>
                  Apply
                </Button>
              </View>
            )}
          </View>

          {/* Totals */}
          <View>
            <SectionTitle>Summary</SectionTitle>
            <ListCard>
              <View style={styles.summary}>
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
                {shipping > 0 ? (
                  <T variant="caption" muted>
                    Add {money(awayFromFree)} more for free shipping
                  </T>
                ) : null}
                <RowSeparator />
                <View style={styles.summaryRow}>
                  <T variant="heading">Total</T>
                  <Figure value={total} variant="heading" />
                </View>
              </View>
            </ListCard>
          </View>

          <Button
            isDark={shop.darkMode}
            accessibilityLabel="Go to checkout"
            variant="filled"
            size="lg"
            onPress={() => router.push("/templates/shop/checkout")}
          >
            Checkout · {money(total)}
          </Button>
          <Button
            isDark={shop.darkMode}
            accessibilityLabel="Clear cart"
            variant="ghost"
            onPress={shop.clearCart}
          >
            Clear cart
          </Button>
        </>
      )}
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
  empty: { padding: 16, gap: 10, alignItems: "flex-start" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  thumb: { width: 72 },
  rowControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  promoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  promoApplied: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  summary: { paddingVertical: 8, gap: 4 },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});
