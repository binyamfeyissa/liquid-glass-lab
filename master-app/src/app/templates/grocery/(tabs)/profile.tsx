import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Badge, Button, Card, Field, Input, Switch } from "glacia-native";

import { productById } from "../data";
import { useBasket } from "../state";
import {
  BackdropControl,
  CartBar,
  ListCard,
  NavRow,
  ProductRow,
  RowSeparator,
  Screen,
  SectionTitle,
  SettingRow,
  T,
} from "../ui";

export default function ProfileScreen() {
  const basket = useBasket();
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [line, setLine] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState<string | undefined>();

  const favourites = basket.favourites
    .map((id) => productById(id))
    .filter((p) => basket.isFavourite(p.id));

  const saveAddress = () => {
    if (!label.trim() || !line.trim() || !city.trim()) {
      setError("Fill in a label, street address and city");
      return;
    }
    basket.addAddress(label, line, city);
    setLabel("");
    setLine("");
    setCity("");
    setError(undefined);
    setAdding(false);
  };

  return (
    <View style={styles.root}>
      <Screen title="Profile" subtitle="Addresses, favourites and preferences">
        {/* Identity */}
        <View style={styles.identity}>
          <Avatar name={basket.userName} size="lg" isDark={basket.darkMode} />
          <View style={styles.flex}>
            <T variant="heading">{basket.userName}</T>
            <T variant="caption" muted style={styles.description}>
              Basket member since 2024 · {basket.orders.length} orders
            </T>
          </View>
        </View>

        {/* Shortcuts */}
        <ListCard>
          <NavRow
            title="Delivery slot"
            description="When your groceries arrive"
            detail={basket.slotLabel}
            onPress={() => router.push("/templates/grocery/slot")}
          />
          <RowSeparator />
          <NavRow
            title="Shopping lists"
            description="Weekly shop and more"
            detail={`${basket.lists.length} lists`}
            onPress={() => router.push("/templates/grocery/(tabs)/lists")}
          />
          <RowSeparator />
          <NavRow
            title="Orders"
            description="History and reordering"
            detail={`${basket.orders.length}`}
            onPress={() => router.push("/templates/grocery/(tabs)/orders")}
          />
        </ListCard>

        {/* Addresses */}
        <View>
          <SectionTitle>Addresses</SectionTitle>
          <ListCard>
            {basket.addresses.map((address, i) => {
              const selected = basket.selectedAddressId === address.id;
              return (
                <View key={address.id}>
                  {i > 0 ? <RowSeparator /> : null}
                  <Pressable
                    onPress={() => basket.setSelectedAddressId(address.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Deliver to ${address.label}`}
                    style={styles.addressRow}
                  >
                    <View style={styles.flex}>
                      <T variant="body">{address.label}</T>
                      <T variant="caption" muted style={styles.description}>
                        {address.line}, {address.city}
                      </T>
                    </View>
                    {selected ? (
                      <Badge tone="muted" isDark={basket.darkMode}>
                        Default
                      </Badge>
                    ) : null}
                  </Pressable>
                </View>
              );
            })}
          </ListCard>
          {adding ? (
            <ListCard style={styles.form}>
              <Field label="Label" isDark={basket.darkMode}>
                <Input
                  isDark={basket.darkMode}
                  value={label}
                  onChangeText={setLabel}
                  placeholder="e.g. Parents' house"
                  accessibilityLabel="Address label"
                />
              </Field>
              <Field label="Street address" isDark={basket.darkMode}>
                <Input
                  isDark={basket.darkMode}
                  value={line}
                  onChangeText={setLine}
                  placeholder="Street and number"
                  accessibilityLabel="Street address"
                />
              </Field>
              <Field label="City" error={error} isDark={basket.darkMode}>
                <Input
                  isDark={basket.darkMode}
                  value={city}
                  onChangeText={setCity}
                  placeholder="City"
                  accessibilityLabel="City"
                  invalid={!!error}
                />
              </Field>
              <Button
                isDark={basket.darkMode}
                accessibilityLabel="Save address"
                variant="filled"
                onPress={saveAddress}
              >
                Save address
              </Button>
              <Button
                isDark={basket.darkMode}
                accessibilityLabel="Cancel adding address"
                variant="ghost"
                onPress={() => setAdding(false)}
              >
                Cancel
              </Button>
            </ListCard>
          ) : (
            <Button
              isDark={basket.darkMode}
              accessibilityLabel="Add a new address"
              variant="ghost"
              onPress={() => setAdding(true)}
            >
              Add a new address
            </Button>
          )}
        </View>

        {/* Favourites */}
        <View>
          <SectionTitle>Favourites</SectionTitle>
          {favourites.length === 0 ? (
            <T variant="body" muted>
              Nothing saved yet
            </T>
          ) : (
            <ListCard>
              {favourites.map((product, i) => (
                <View key={product.id}>
                  {i > 0 ? <RowSeparator /> : null}
                  <ProductRow product={product} />
                </View>
              ))}
            </ListCard>
          )}
        </View>

        {/* Background — the three backgrounds, switchable */}
        <View>
          <SectionTitle>Background</SectionTitle>
          <Card isDark={basket.darkMode} padding={16}>
            <BackdropControl />
            <T variant="caption" muted style={styles.backdropNote}>
              Dark, broken white, or the palm photo behind the glass
            </T>
          </Card>
        </View>

        {/* Preferences */}
        <View>
          <SectionTitle>Preferences</SectionTitle>
          <ListCard>
            <SettingRow
              title="Delivery notifications"
              description="Slot reminders and courier updates"
            >
              <Switch
                accessibilityLabel="Delivery notifications"
                value={basket.notifications}
                onValueChange={basket.setNotifications}
                isDark={basket.darkMode}
              />
            </SettingRow>
            <RowSeparator />
            <SettingRow
              title="Offers & deals"
              description="A weekly note about price drops"
            >
              <Switch
                accessibilityLabel="Offers and deals"
                value={basket.offers}
                onValueChange={basket.setOffers}
                isDark={basket.darkMode}
              />
            </SettingRow>
          </ListCard>
        </View>

        <T variant="caption" muted style={styles.footNote}>
          All data is local sample data
        </T>
      </Screen>
      <CartBar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  description: { marginTop: 2 },
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  backdropNote: {
    marginTop: 12,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  form: {
    padding: 16,
    gap: 12,
    marginTop: 12,
  },
  footNote: {
    textAlign: "center",
  },
});
