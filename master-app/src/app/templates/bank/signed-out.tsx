import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, Card } from "glacia-native";

import { useBank } from "./state";
import { T, accentColor } from "./ui";

export default function SignedOutScreen() {
  const bank = useBank();

  return (
    <View style={styles.wrap}>
      <Card isDark={bank.darkMode} padding={24} contentStyle={styles.card}>
        <T variant="title" style={styles.logo}>
          Northwind
        </T>
        <T variant="body" muted style={styles.sub}>
          You are signed out. Sign in to return to your accounts.
        </T>
        <Button
          isDark={bank.darkMode}
          accessibilityLabel="Sign in"
          variant="filled"
          tint={accentColor(bank.backdrop)}
          onPress={() => {
            bank.setSignedOut(false);
            router.replace("/templates/bank/(tabs)");
          }}
          style={styles.button}
        >{`Sign in as ${bank.userName}`}</Button>
        <T variant="caption" muted style={styles.foot}>
          Northwind Bank · Template build — no real money moves anywhere
        </T>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: { alignItems: "center", gap: 8 },
  logo: {},
  sub: { textAlign: "center" },
  foot: { textAlign: "center", marginTop: 8 },
  button: { marginTop: 8, alignSelf: "stretch" },
});
