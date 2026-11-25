import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, Card, Field, Input, Sheet, Toast } from "glacia-native";

import { productById } from "../data";
import { useBasket, type ShoppingList } from "../state";
import {
  CartBar,
  Figure,
  RowSeparator,
  Screen,
  SectionTitle,
  T,
  accentColor,
  money,
} from "../ui";

function ListCard({ list }: { list: ShoppingList }) {
  const basket = useBasket();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addedAll, setAddedAll] = useState(false);

  const total = list.items.reduce(
    (sum, item) => sum + productById(item.productId).price * item.qty,
    0,
  );

  return (
    <Card isDark={basket.darkMode} padding={16}>
      <View style={styles.listHead}>
        <View style={styles.flex}>
          <T variant="heading">{list.name}</T>
          <Figure variant="caption" muted style={styles.description}>
            {list.items.length} items · {money(total)}
          </Figure>
        </View>
        {confirmDelete ? (
          <Button
            isDark={basket.darkMode}
            accessibilityLabel={`Confirm delete of ${list.name}`}
            variant="filled"
            size="sm"
            onPress={() => basket.deleteList(list.id)}
          >
            Tap again to delete
          </Button>
        ) : (
          <Button
            isDark={basket.darkMode}
            accessibilityLabel={`Delete ${list.name}`}
            variant="ghost"
            size="sm"
            onPress={() => setConfirmDelete(true)}
          >
            Delete
          </Button>
        )}
      </View>

      <View style={styles.items}>
        {list.items.map((item, i) => {
          const product = productById(item.productId);
          const inCart = basket.qtyOf(item.productId);
          return (
            <View key={item.productId}>
              {i > 0 ? <RowSeparator /> : null}
              <View style={styles.itemRow}>
                <View style={styles.flex}>
                  <T variant="body" numberOfLines={1}>
                    {product.name}
                  </T>
                  <Figure variant="caption" muted style={styles.description}>
                    {item.qty} × {money(product.price)} / {product.unit}
                  </Figure>
                </View>
                {inCart >= item.qty ? (
                  <T
                    variant="caption"
                    style={{ color: accentColor(basket.backdrop) }}
                  >
                    In cart
                  </T>
                ) : (
                  <Button
                    isDark={basket.darkMode}
                    accessibilityLabel={`Add ${product.name} from ${list.name} to cart`}
                    size="sm"
                    onPress={() => basket.addListItemToCart(list.id, item.productId)}
                  >
                    Add
                  </Button>
                )}
              </View>
            </View>
          );
        })}
        {list.items.length === 0 ? (
          <T variant="body" muted style={styles.empty}>
            This list is empty
          </T>
        ) : null}
      </View>

      {list.items.length > 0 ? (
        <Button
          isDark={basket.darkMode}
          accessibilityLabel={`Add all of ${list.name} to cart`}
          variant="filled"
          style={styles.addAll}
          onPress={() => {
            basket.addListToCart(list.id);
            setAddedAll(true);
          }}
        >
          {addedAll ? "Added — review cart" : "Add all to cart"}
        </Button>
      ) : null}
      {addedAll ? (
        <Button
          isDark={basket.darkMode}
          accessibilityLabel="Go to cart"
          variant="ghost"
          onPress={() => router.push("/templates/grocery/cart")}
        >
          Go to cart
        </Button>
      ) : null}
    </Card>
  );
}

export default function ListsScreen() {
  const basket = useBasket();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [toast, setToast] = useState(false);

  const create = () => {
    if (!name.trim()) {
      setError("Give your list a name");
      return;
    }
    basket.createList(name);
    setName("");
    setError(undefined);
    setSheetOpen(false);
    setToast(true);
  };

  return (
    <View style={styles.root}>
      <Screen title="Shopping lists" subtitle="Your saved shopping lists">
        <Button
          isDark={basket.darkMode}
          accessibilityLabel="Create a new shopping list"
          variant="filled"
          size="lg"
          onPress={() => setSheetOpen(true)}
        >
          New list
        </Button>

        {basket.lists.map((list) => (
          <View key={list.id}>
            <SectionTitle>{list.name}</SectionTitle>
            <ListCard list={list} />
          </View>
        ))}

        {basket.lists.length === 0 ? (
          <T variant="body" muted>
            No lists yet — create one for the weekly shop, a party or a
            recipe
          </T>
        ) : null}
      </Screen>
      <CartBar />

      <Sheet
        visible={sheetOpen}
        onDismiss={() => setSheetOpen(false)}
        isDark={basket.darkMode}
        height={320}
      >
        <View style={styles.sheetContent}>
          <T variant="heading">New shopping list</T>
          <Field label="List name" error={error} isDark={basket.darkMode}>
            <Input
              isDark={basket.darkMode}
              value={name}
              onChangeText={(text) => {
                setName(text);
                setError(undefined);
              }}
              placeholder="e.g. Sunday roast"
              accessibilityLabel="List name"
              invalid={!!error}
              autoCapitalize="sentences"
            />
          </Field>
          <Button
            isDark={basket.darkMode}
            accessibilityLabel="Create list"
            variant="filled"
            size="lg"
            onPress={create}
          >
            Create list
          </Button>
          <Button
            isDark={basket.darkMode}
            accessibilityLabel="Cancel"
            variant="ghost"
            onPress={() => setSheetOpen(false)}
          >
            Cancel
          </Button>
        </View>
      </Sheet>

      <Toast
        visible={toast}
        message="List created"
        isDark={basket.darkMode}
        onDismiss={() => setToast(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  description: { marginTop: 2 },
  listHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  items: {
    marginTop: 8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 12,
  },
  empty: {
    paddingVertical: 12,
  },
  addAll: {
    marginTop: 12,
  },
  sheetContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 16,
  },
});
