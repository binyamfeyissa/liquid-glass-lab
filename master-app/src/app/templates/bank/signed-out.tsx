import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, Card } from "glacia-native";

import { useBank } from "./state";
import { T } from "./ui";

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
          accessibilityLabel="Sign in"
          variant="filled"
          onPress={() => {
            bank.setSignedOut(false);
            router.replace("/templates/bank/(tabs)");
          }}
          style={styles.button}
        >
          Sign in as {bank.userName}
        </Button>
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
  button: { marginTop: 8, alignSelf: "stretch" },
});
