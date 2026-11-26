import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Avatar, Button, Field, Input, Switch } from "glacia-native";

import { useFood } from "../state";
import { RESTAURANTS, USER_IMAGE } from "../data";
import { RestaurantCard } from "../cards";
import {
  BackdropControl,
  ListCard,
  NavRow,
  RowSeparator,
  Screen,
  SectionTitle,
  SettingRow,
  T,
} from "../ui";
import { router } from "expo-router";

export default function ProfileScreen() {
  const food = useFood();
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [line, setLine] = useState("");
  const [labelError, setLabelError] = useState<string | undefined>();
  const [lineError, setLineError] = useState<string | undefined>();

  const favouriteRestaurants = RESTAURANTS.filter((r) =>
    food.favourites.includes(r.id),
  );

  const saveAddress = () => {
    let ok = true;
    if (label.trim().length < 2) {
      setLabelError("Give it a short name, like “Home”");
      ok = false;
    } else setLabelError(undefined);
    if (line.trim().length < 6) {
      setLineError("Enter the full street address");
      ok = false;
    } else setLineError(undefined);
    if (!ok) return;
    food.addAddress(label.trim(), line.trim());
    setLabel("");
    setLine("");
    setShowForm(false);
  };

  return (
    <Screen title="Profile" subtitle="Your account, places and favourites">
      {/* Header */}
      <View style={styles.header}>
        <Avatar name={food.userName} size="lg" isDark={food.darkMode} source={USER_IMAGE} />
        <View style={styles.flex1}>
          <T variant="heading">{food.userName}</T>
          <T variant="caption" muted>
            alex.rivera@example.com
          </T>
        </View>
      </View>

      {/* Favourites */}
      <View>
        <SectionTitle>Favourites</SectionTitle>
        {favouriteRestaurants.length === 0 ? (
          <T variant="body" muted>
            Tap the heart on any restaurant to keep it here
          </T>
        ) : (
          favouriteRestaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))
        )}
      </View>

      {/* Addresses */}
      <View>
        <SectionTitle>Saved addresses</SectionTitle>
        <ListCard>
          {food.addresses.map((a, i) => (
            <React.Fragment key={a.id}>
              {i > 0 ? <RowSeparator /> : null}
              <View style={styles.addressRow}>
                <T variant="body">{a.label}</T>
                <T variant="caption" muted>
                  {a.line}
                </T>
              </View>
            </React.Fragment>
          ))}
        </ListCard>

        {showForm ? (
          <View style={styles.form}>
            <Field label="Label" error={labelError} isDark={food.darkMode}>
              <Input
                value={label}
                onChangeText={setLabel}
                placeholder="Home, Work, Mum's…"
                accessibilityLabel="Address label"
                invalid={!!labelError}
                isDark={food.darkMode}
              />
            </Field>
            <Field label="Street address" error={lineError} isDark={food.darkMode}>
              <Input
                value={line}
                onChangeText={setLine}
                placeholder="42 Willow Lane, Apt 7"
                accessibilityLabel="Street address"
                invalid={!!lineError}
                isDark={food.darkMode}
              />
            </Field>
            <View style={styles.formButtons}>
              <Button
                isDark={food.darkMode}
                accessibilityLabel="Cancel adding address"
                onPress={() => setShowForm(false)}
                style={styles.flex1}
              >
                Cancel
              </Button>
              <Button
                isDark={food.darkMode}
                accessibilityLabel="Save address"
                variant="filled"
                onPress={saveAddress}
                style={styles.flex1}
              >
                Save address
              </Button>
            </View>
          </View>
        ) : (
          <Button
            isDark={food.darkMode}
            accessibilityLabel="Add a new address"
            onPress={() => setShowForm(true)}
            style={styles.addButton}
          >
            Add address
          </Button>
        )}
      </View>

      {/* Background */}
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

      {/* Settings */}
      <View>
        <SectionTitle>Settings</SectionTitle>
        <ListCard>
          <SettingRow
            title="Order notifications"
            description="Courier updates and delivery alerts"
          >
            <Switch
              value={food.notifications}
              onValueChange={food.setNotifications}
              isDark={food.darkMode}
              accessibilityLabel="Order notifications"
            />
          </SettingRow>
        </ListCard>
      </View>

      {/* Shortcuts */}
      <View>
        <SectionTitle>More</SectionTitle>
        <ListCard>
          <NavRow
            title="Your orders"
            description={`${food.orders.length} orders so far`}
            onPress={() => router.push("/templates/food/(tabs)/orders")}
          />
          <RowSeparator />
          <NavRow
            title="Promo codes"
            description="FORK10 takes 10% off any order"
            onPress={() => router.push("/templates/food/cart")}
          />
        </ListCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  addressRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 4,
  },
  form: { marginTop: 16, gap: 12 },
  formButtons: {
    flexDirection: "row",
    gap: 12,
  },
  addButton: { marginTop: 12 },
  backdropBody: { paddingVertical: 12, paddingHorizontal: 16 },
  backdropNote: { marginTop: 8 },
});
