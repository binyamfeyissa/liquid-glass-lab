import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Button, Field, Input, Switch } from "glacia-native";

import { useShop } from "../state";
import {
  BackdropControl,
  ListCard,
  NavRow,
  Price,
  ProductVisual,
  RowSeparator,
  Screen,
  SectionTitle,
  SettingRow,
  T,
} from "../ui";

export default function ProfileScreen() {
  const shop = useShop();

  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const favouriteProducts = shop.favourites
    .map((id) => shop.products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => !!p);

  const saveAddress = () => {
    const next: Record<string, string> = {};
    if (!label.trim()) next.label = "Give this address a label, like Home";
    if (!street.trim()) next.street = "Street address is required";
    if (!city.trim()) next.city = "City is required";
    if (!postcode.trim()) next.postcode = "Postcode is required";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    shop.addAddress({
      label: label.trim(),
      street: street.trim(),
      city: city.trim(),
      postcode: postcode.trim(),
    });
    setLabel("");
    setStreet("");
    setCity("");
    setPostcode("");
    setShowForm(false);
  };

  return (
    <Screen belowTabBar title="Profile" subtitle="Your favourites, addresses and app settings">
      {/* Profile header */}
      <View style={styles.header}>
        <Avatar name={shop.userName} source={shop.userImage} size="lg" isDark={shop.darkMode} status="online" />
        <View style={styles.headerText}>
          <T variant="heading">{shop.userName}</T>
          <T variant="body" muted>
            {shop.userEmail} · Lumen member since 2023
          </T>
        </View>
      </View>

      {/* Shortcuts */}
      <ListCard>
        <NavRow
          title="Your orders"
          description="Track, return, buy again"
          detail={`${shop.orders.length}`}
          onPress={() => router.push("/templates/shop/(tabs)/orders")}
        />
        <RowSeparator />
        <NavRow
          title="Your cart"
          description="Review items before checkout"
          detail={shop.cartCount > 0 ? `${shop.cartCount} items` : "Empty"}
          onPress={() => router.push("/templates/shop/cart")}
        />
      </ListCard>

      {/* Favourites */}
      <View>
        <SectionTitle>Favourites · {favouriteProducts.length}</SectionTitle>
        {favouriteProducts.length === 0 ? (
          <ListCard>
            <View style={styles.empty}>
              <T variant="body" muted>
                Nothing saved yet. Tap the heart on any product and it will live
                here.
              </T>
              <Button
                isDark={shop.darkMode}
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
            {favouriteProducts.map((product, i) => (
              <React.Fragment key={product.id}>
                {i > 0 ? <RowSeparator /> : null}
                <View style={styles.favRow}>
                  <Pressable
                    onPress={() => router.push(`/templates/shop/product/${product.id}`)}
                    accessibilityRole="button"
                    accessibilityLabel={`${product.name}, view details`}
                    style={styles.favMain}
                  >
                    <View style={styles.thumb}>
                      <ProductVisual product={product} height={52} radius={10} />
                    </View>
                    <View style={styles.flex}>
                      <T variant="body" numberOfLines={1}>
                        {product.name}
                      </T>
                      <Price product={product} />
                    </View>
                  </Pressable>
                  <Button
                    isDark={shop.darkMode}
                    accessibilityLabel={`Remove ${product.name} from favourites`}
                    variant="ghost"
                    size="sm"
                    onPress={() => shop.toggleFavourite(product.id)}
                  >
                    Remove
                  </Button>
                </View>
              </React.Fragment>
            ))}
          </ListCard>
        )}
      </View>

      {/* Addresses */}
      <View>
        <SectionTitle>Addresses</SectionTitle>
        <ListCard>
          {shop.addresses.map((address, i) => (
            <React.Fragment key={address.id}>
              {i > 0 ? <RowSeparator /> : null}
              <View style={styles.addressRow}>
                <T variant="body">{address.label}</T>
                <T variant="caption" muted>
                  {address.street}, {address.city} {address.postcode}
                </T>
              </View>
            </React.Fragment>
          ))}
        </ListCard>
        {showForm ? (
          <View style={styles.form}>
            <Field label="Label" error={errors.label} isDark={shop.darkMode}>
              <Input
                value={label}
                onChangeText={setLabel}
                placeholder="Home, Work, Studio…"
                accessibilityLabel="Address label"
                invalid={!!errors.label}
                isDark={shop.darkMode}
              />
            </Field>
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
            <View style={styles.formButtons}>
              <Button
                isDark={shop.darkMode}
                accessibilityLabel="Cancel adding address"
                variant="ghost"
                onPress={() => {
                  setShowForm(false);
                  setErrors({});
                }}
              >
                Cancel
              </Button>
              <Button isDark={shop.darkMode} accessibilityLabel="Save address" variant="filled" onPress={saveAddress}>
                Save address
              </Button>
            </View>
          </View>
        ) : (
          <Button
            isDark={shop.darkMode}
            accessibilityLabel="Add an address"
            onPress={() => setShowForm(true)}
            style={styles.addButton}
          >
            Add an address
          </Button>
        )}
      </View>

      {/* Background — the three backgrounds */}
      <View>
        <SectionTitle>Background</SectionTitle>
        <ListCard>
          <View style={styles.backdropBody}>
            <BackdropControl />
            <T variant="caption" muted style={styles.backdropNote}>
              Dark gray, broken white, or the palm photo — the glass sits over all three
            </T>
          </View>
        </ListCard>
      </View>

      {/* App settings */}
      <View>
        <SectionTitle>App</SectionTitle>
        <ListCard>
          <SettingRow
            title="Order updates"
            description="Shipping and delivery notifications"
          >
            <Switch
              value={shop.orderUpdates}
              onValueChange={shop.setOrderUpdates}
              accessibilityLabel="Order updates"
              isDark={shop.darkMode}
            />
          </SettingRow>
          <RowSeparator />
          <SettingRow
            title="Offers & new pieces"
            description="Sale alerts and new-collection drops"
          >
            <Switch
              value={shop.notifications}
              onValueChange={shop.setNotifications}
              accessibilityLabel="Offers and new pieces"
              isDark={shop.darkMode}
            />
          </SettingRow>
        </ListCard>
      </View>

      <T variant="caption" muted style={styles.foot}>
        Lumen · Template build — no real orders, payments or deliveries
      </T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerText: { flex: 1, gap: 2 },
  flex: { flex: 1 },
  empty: { padding: 16, gap: 10, alignItems: "flex-start" },
  favRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  favMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  thumb: { width: 68 },
  addressRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 4,
  },
  form: { gap: 12, marginTop: 12 },
  formRow: { flexDirection: "row", gap: 12 },
  formButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  backdropBody: { paddingVertical: 12, paddingHorizontal: 16, gap: 8 },
  backdropNote: { marginTop: 4 },
  addButton: { marginTop: 12 },
  foot: { textAlign: "center" },
});
