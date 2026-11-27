import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Sheet } from "glacia-native";

import { useAppState } from "./state";
import { Figure, ListCard, NavRow, RowSeparator, Screen, SectionTitle, Serif, T } from "./ui";

const APP_VERSION = "1.0.0";
const APP_BUILD = "42";

interface Doc {
  title: string;
  body: string;
}

const DOCS: Record<string, Doc> = {
  terms: {
    title: "Terms of Service",
    body: "Northwind is provided as-is for your workspace. You keep ownership of everything you create; we keep the service running and tell you before anything material changes.",
  },
  privacy: {
    title: "Privacy Policy",
    body: "Northwind stores the minimum needed to run your account: your profile, your content, and sign-in records. We do not sell personal data, and you can export or delete your account at any time from Privacy & security.",
  },
  licenses: {
    title: "Open-source licenses",
    body: "This template is built with Glacia for React Native (MIT), React Native (MIT), Expo (MIT), react-native-reanimated (MIT), and react-native-gesture-handler (MIT). Full license texts ship with each package in node_modules.",
  },
  feedback: {
    title: "Send feedback",
    body: "Tell us what felt slow or confusing: feedback@northwind.example.",
  },
};

const ROWS: { key: keyof typeof DOCS; title: string; description: string }[] = [
  { key: "terms", title: "Terms of Service", description: "The rules of using Northwind" },
  { key: "privacy", title: "Privacy Policy", description: "What we store and why" },
  { key: "licenses", title: "Open-source licenses", description: "The libraries this app is built with" },
  { key: "feedback", title: "Send feedback", description: "Tell us what to fix" },
];

export default function AboutScreen() {
  const { glaciaDark, isDark } = useAppState();
  const [openDoc, setOpenDoc] = useState<keyof typeof DOCS | null>(null);
  const doc = openDoc ? DOCS[openDoc] : null;

  return (
    <>
      <Screen belowTabBar title="About" subtitle="This app, its rules, and its parts.">
        <Card isDark={glaciaDark} padding={22}>
          <View
            style={[
              styles.logoTile,
              { backgroundColor: isDark ? "#232325" : "#efe9df" },
            ]}
          >
            <Serif variant="title" style={styles.logoLetter}>
              N
            </Serif>
          </View>
          <Serif variant="heading" style={styles.appName}>
            Northwind
          </Serif>
          <Figure variant="caption" muted>
            Version {APP_VERSION} (build {APP_BUILD})
          </Figure>
          <T variant="body" style={styles.blurb}>
            Profile, notifications, appearance and security — the settings stack,
            built entirely from Glacia components.
          </T>
        </Card>

        <View>
          <SectionTitle>Legal & support</SectionTitle>
          <ListCard>
            {ROWS.map((row, i) => (
              <React.Fragment key={row.key}>
                <NavRow
                  title={row.title}
                  description={row.description}
                  onPress={() => setOpenDoc(row.key)}
                />
                {i < ROWS.length - 1 ? <RowSeparator /> : null}
              </React.Fragment>
            ))}
          </ListCard>
        </View>

        <T variant="caption" muted style={styles.footer}>
          Built with Glacia for React Native.
        </T>
      </Screen>

      <Sheet
        visible={doc !== null}
        onDismiss={() => setOpenDoc(null)}
        height={340}
        isDark={glaciaDark}
      >
        {doc ? (
          <View style={styles.sheetBody}>
            <T variant="heading">{doc.title}</T>
            <T variant="body" muted style={styles.sheetText}>
              {doc.body}
            </T>
            <Button
              variant="filled"
              isDark={glaciaDark}
              accessibilityLabel="Close"
              onPress={() => setOpenDoc(null)}
            >
              Close
            </Button>
          </View>
        ) : null}
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  logoTile: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoLetter: {},
  appName: {
    marginBottom: 4,
  },
  blurb: {
    marginTop: 12,
  },
  footer: {
    textAlign: "center",
    paddingHorizontal: 12,
  },
  sheetBody: {
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 12,
  },
  sheetText: {
    marginBottom: 8,
  },
});
