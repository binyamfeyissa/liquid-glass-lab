import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Badge, Button, Card } from "glacia-native";

import { productById } from "../data";
import { useBasket, type Order } from "../state";
import { CartBar, Figure, Screen, T, money } from "../ui";

function OrderCard({ order }: { order: Order }) {
  const basket = useBasket();
  const [reordered, setReordered] = useState(false);
  const itemCount = order.lines.reduce((s, l) => s + l.qty, 0);
  const names = order.lines
    .map((l) => productById(l.productId).name)
    .join(", ");

  return (
    <Card isDark={basket.darkMode} padding={16}>
      <View style={styles.head}>
        <View style={styles.flex}>
          <T variant="heading">{order.number}</T>
          <T variant="caption" muted style={styles.description}>
            {order.placedLabel} · {itemCount} items
          </T>
        </View>
        <Badge tone="muted" isDark={basket.darkMode}>
          {order.status}
        </Badge>
      </View>

      <T variant="body" numberOfLines={2} style={styles.names}>
        {names}
      </T>

      <View style={styles.meta}>
        <Figure variant="caption" muted>
          {order.slotLabel}
        </Figure>
        <T variant="caption" muted>
          {order.addressLabel} · {order.paymentLabel}
        </T>
      </View>

      <View style={styles.foot}>
        <Figure variant="heading">{money(order.total)}</Figure>
        {reordered ? (
          <Button
            accessibilityLabel="Go to cart"
            variant="filled"
            size="sm"
            onPress={() => router.push("/templates/grocery/cart")}
          >
            In cart — review
          </Button>
        ) : (
          <Button
            accessibilityLabel={`Reorder ${order.number}`}
            size="sm"
            onPress={() => {
              basket.reorder(order.id);
              setReordered(true);
            }}
          >
            Reorder
          </Button>
        )}
      </View>
    </Card>
  );
}

export default function OrdersScreen() {
  const basket = useBasket();
  return (
    <View style={styles.root}>
      <Screen title="Orders" subtitle="Scheduled deliveries and order history">
        {basket.orders.length === 0 ? (
          <View style={styles.empty}>
            <T variant="heading">No orders yet</T>
            <T variant="body" muted style={styles.emptyText}>
              Your first delivery will show up here
            </T>
            <Button
              accessibilityLabel="Browse groceries"
              variant="filled"
              size="lg"
              onPress={() => router.replace("/templates/grocery/(tabs)")}
            >
              Browse groceries
            </Button>
          </View>
        ) : (
          basket.orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        )}
      </Screen>
      <CartBar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  description: { marginTop: 2 },
  head: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  names: {
    marginTop: 8,
  },
  meta: {
    gap: 4,
    marginTop: 8,
  },
  foot: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  empty: {
    alignItems: "center",
    gap: 12,
    paddingTop: 40,
  },
  emptyText: {
    textAlign: "center",
  },
});
