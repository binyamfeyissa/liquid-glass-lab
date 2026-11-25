import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button } from "glacia-native";

import { useShop } from "../state";
import { ListCard, NavRow, RowSeparator, Screen, T, money } from "../ui";

export default function OrdersScreen() {
  const shop = useShop();

  return (
    <Screen title="Orders" subtitle="Everything you have ordered from Lumen">
      {shop.orders.length === 0 ? (
        <ListCard>
          <View style={styles.empty}>
            <T variant="heading">No orders yet</T>
            <T variant="body" muted style={styles.emptyText}>
              When you place an order it will show up here with its tracking status
            </T>
            <Button
              accessibilityLabel="Browse products"
              variant="filled"
              onPress={() => router.push("/templates/shop/(tabs)/shop")}
            >
              Browse products
            </Button>
          </View>
        </ListCard>
      ) : (
        <ListCard>
          {shop.orders.map((order, i) => (
            <React.Fragment key={order.id}>
              {i > 0 ? <RowSeparator /> : null}
              <NavRow
                title={order.number}
                description={`${order.dateLabel} · ${order.items.reduce((s, it) => s + it.qty, 0)} items · ${money(order.total)}`}
                detail={order.status}
                onPress={() => router.push(`/templates/shop/order/${order.id}`)}
              />
            </React.Fragment>
          ))}
        </ListCard>
      )}
      <T variant="caption" muted style={styles.foot}>
        Questions about an order? Every order carries a 60-day return window
      </T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { padding: 16, gap: 8, alignItems: "flex-start" },
  emptyText: { marginBottom: 4 },
  foot: { textAlign: "center" },
});
