import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Badge, Button, Card } from "glacia-native";

import { ORDER_STEPS, useFood, type Order } from "../state";
import { restaurantById } from "../data";
import { Meta, RestaurantThumb, Screen, SectionTitle, T, money } from "../ui";

export default function OrdersScreen() {
  const food = useFood();
  const active = food.orders.filter((o) => o.statusIndex < ORDER_STEPS.length - 1);
  const past = food.orders.filter((o) => o.statusIndex >= ORDER_STEPS.length - 1);

  return (
    <Screen belowTabBar title="Orders" subtitle="Track live orders and reorder favourites">
      {active.length > 0 ? (
        <View>
          <SectionTitle>Live</SectionTitle>
          <View style={styles.stack}>
            {active.map((order) => (
              <OrderCard key={order.id} order={order} live />
            ))}
          </View>
        </View>
      ) : null}

      <View>
        <SectionTitle>Past orders</SectionTitle>
        {past.length === 0 ? (
          <T variant="body" muted>
            No past orders yet — your delivered orders will land here
          </T>
        ) : (
          <View style={styles.stack}>
            {past.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}

function OrderCard({ order, live = false }: { order: Order; live?: boolean }) {
  const food = useFood();
  const restaurant = restaurantById(order.restaurantId);
  const status = ORDER_STEPS[order.statusIndex];
  const summary = order.lines.map((l) => `${l.qty} × ${l.name}`).join(", ");

  return (
    <Card isDark={food.darkMode} padding={16}>
      <View style={styles.head}>
        {restaurant ? <RestaurantThumb restaurant={restaurant} /> : null}
        <View style={styles.flex1}>
          <T variant="body" numberOfLines={1}>
            {order.restaurantName}
          </T>
          <Meta>
            {order.id} · {order.placedLabel}
          </Meta>
        </View>
        <Badge tone="muted" isDark={food.darkMode}>
          {status}
        </Badge>
      </View>
      <T variant="body" muted style={styles.summary} numberOfLines={2}>
        {summary}
      </T>
      <View style={styles.foot}>
        <T variant="heading" style={styles.flex1}>
          {money(order.total)}
        </T>
        {live ? (
          <Button
            isDark={food.darkMode}
            accessibilityLabel={`Track order ${order.id}`}
            variant="filled"
            size="sm"
            onPress={() => router.push("/templates/food/tracking")}
          >
            Track order
          </Button>
        ) : (
          <Button
            isDark={food.darkMode}
            accessibilityLabel={`Reorder from ${order.restaurantName}`}
            variant="filled"
            size="sm"
            onPress={() => {
              food.reorder(order);
              router.push("/templates/food/cart");
            }}
          >
            Reorder
          </Button>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  stack: { gap: 12 },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  summary: { marginTop: 12 },
  foot: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 12,
  },
});
