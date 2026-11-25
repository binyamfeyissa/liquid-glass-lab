import React from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Badge, Button } from "glacia-native";

import { useShop } from "../state";
import { productById } from "../data";
import {
  Figure,
  ListCard,
  ProductVisual,
  RowSeparator,
  Screen,
  SectionTitle,
  T,
  statusTone,
} from "../ui";

export default function OrderDetailScreen() {
  const shop = useShop();
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = shop.orders.find((o) => o.id === id);

  if (!order) {
    return (
      <Screen title="Order not found" subtitle="This order is not in the list">
        <Button
          isDark={shop.darkMode}
          accessibilityLabel="Back to orders"
          variant="glass"
          onPress={() => router.push("/templates/shop/(tabs)/orders")}
        >
          Back to orders
        </Button>
      </Screen>
    );
  }

  const buyAgain = () => {
    for (const item of order.items) {
      shop.addToCart(item.productId, item.finish, item.qty);
    }
    router.push("/templates/shop/cart");
  };

  return (
    <Screen title={order.number} subtitle={`Placed ${order.dateLabel}`}>
      <View style={styles.statusRow}>
        <Badge tone={statusTone(order.status)} isDark={shop.darkMode}>
          {order.status}
        </Badge>
        <T variant="body" muted>
          {order.status === "Delivered"
            ? "Delivered to your door"
            : order.status === "Shipped"
              ? "On its way to you"
              : "Being prepared in the studio"}
        </T>
      </View>

      <View>
        <SectionTitle>Items</SectionTitle>
        <ListCard>
          {order.items.map((item, i) => {
            const product = productById(item.productId);
            return (
              <React.Fragment key={`${item.productId}-${item.finish}`}>
                {i > 0 ? <RowSeparator /> : null}
                <View style={styles.itemRow}>
                  <View style={styles.thumb}>
                    <ProductVisual product={product} finish={item.finish} height={52} radius={10} />
                  </View>
                  <View style={styles.flex}>
                    <T variant="body" numberOfLines={1}>
                      {item.name}
                    </T>
                    <T variant="caption" muted>
                      {item.finish} · Qty {item.qty}
                    </T>
                  </View>
                  <Figure value={item.price * item.qty} />
                </View>
              </React.Fragment>
            );
          })}
        </ListCard>
      </View>

      <View>
        <SectionTitle>Summary</SectionTitle>
        <ListCard>
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <T variant="body" muted>Subtotal</T>
              <Figure value={order.subtotal} />
            </View>
            {order.discount > 0 ? (
              <View style={styles.summaryRow}>
                <T variant="body" muted>Discount (GLASS10)</T>
                <Figure value={-order.discount} />
              </View>
            ) : null}
            <View style={styles.summaryRow}>
              <T variant="body" muted>Shipping</T>
              {order.shipping === 0 ? (
                <T variant="body">Free</T>
              ) : (
                <Figure value={order.shipping} />
              )}
            </View>
            <RowSeparator />
            <View style={styles.summaryRow}>
              <T variant="heading">Total</T>
              <Figure value={order.total} variant="heading" />
            </View>
          </View>
        </ListCard>
      </View>

      <View>
        <SectionTitle>Delivery & payment</SectionTitle>
        <ListCard>
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <T variant="body" muted>Ship to</T>
              <T variant="body" style={styles.rightText}>{order.addressLabel}</T>
            </View>
            <View style={styles.summaryRow}>
              <T variant="body" muted>Paid with</T>
              <T variant="body">{order.paymentLabel}</T>
            </View>
          </View>
        </ListCard>
      </View>

      <Button isDark={shop.darkMode} accessibilityLabel="Buy these items again" variant="filled" onPress={buyAgain}>
        Buy again
      </Button>
      <Button
        isDark={shop.darkMode}
        accessibilityLabel="Back to orders"
        variant="ghost"
        onPress={() => router.push("/templates/shop/(tabs)/orders")}
      >
        Back to orders
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statusRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  flex: { flex: 1 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  thumb: { width: 68 },
  summary: { paddingVertical: 8, gap: 4 },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 12,
  },
  rightText: { flexShrink: 1, textAlign: "right" },
});
