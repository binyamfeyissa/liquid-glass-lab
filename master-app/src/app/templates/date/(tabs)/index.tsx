import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, Card } from "glacia-native";

import { useKindred } from "../state";
import { Figure, PhotoPanel, ProfileCardView, T } from "../ui";

export default function DiscoverScreen() {
  const kindred = useKindred();
  const current = kindred.deck[0];
  const pending = kindred.pendingMatch;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <T variant="title" style={styles.title}>
            Discover
          </T>
          <T variant="body" muted style={styles.subtitle}>
            People near you, one at a time
          </T>
        </View>
        <Figure variant="caption" muted style={styles.superCount}>
          {kindred.superLikesLeft} super likes left
        </Figure>
      </View>

      {!kindred.showMe ? (
        <Card isDark={kindred.darkMode} padding={16} style={styles.hiddenCard}>
          <T variant="body">
            You're hidden right now. Your profile isn't being shown to anyone
            new, but you can keep browsing — turn Show me back on in Profile
            when you're ready.
          </T>
        </Card>
      ) : null}

      {pending ? (
        <Card isDark={kindred.darkMode} padding={0} style={styles.matchCard}>
          <PhotoPanel profile={pending} height={260}>
            <View style={styles.matchBanner}>
              <T
                variant="title"
                style={{
                  letterSpacing: 0,
                  color:
                    kindred.backdrop === "light" ? "#3a332c" : "#f5efe6",
                }}
              >
                It's a match
              </T>
            </View>
          </PhotoPanel>
          <View style={styles.matchBody}>
            <T variant="body">
              You and {pending.name} liked each other. Their chat is open
              whenever you are.
            </T>
            <Button
              accessibilityLabel={`Send a message to ${pending.name}`}
              variant="filled"
              onPress={() => {
                kindred.clearPendingMatch();
                router.push(`/templates/date/chat/${pending.id}`);
              }}
            >
              Send a message
            </Button>
            <Button
              accessibilityLabel="Keep browsing"
              variant="glass"
              onPress={() => kindred.clearPendingMatch()}
            >
              Keep browsing
            </Button>
          </View>
        </Card>
      ) : current ? (
        <>
          <ProfileCardView profile={current} />
          <View style={styles.actions}>
            <Button
              accessibilityLabel={`Pass on ${current.name}`}
              variant="glass"
              size="lg"
              style={styles.actionButton}
              onPress={() => kindred.pass(current.id)}
            >
              Pass
            </Button>
            <Button
              accessibilityLabel={`Super like ${current.name}`}
              variant="glass"
              size="lg"
              style={styles.actionButton}
              disabled={kindred.superLikesLeft <= 0}
              onPress={() => kindred.superLike(current.id)}
            >
              Super like
            </Button>
            <Button
              accessibilityLabel={`Like ${current.name}`}
              variant="filled"
              size="lg"
              style={styles.actionButton}
              onPress={() => kindred.like(current.id)}
            >
              Like
            </Button>
          </View>
          <Figure variant="caption" muted style={styles.deckCount}>
            {kindred.deck.length}{" "}
            {kindred.deck.length === 1 ? "person" : "people"} left nearby
          </Figure>
        </>
      ) : (
        <Card isDark={kindred.darkMode} padding={20} style={styles.emptyCard}>
          <T variant="heading" style={styles.emptyTitle}>
            You've seen everyone nearby
          </T>
          <T variant="body" muted style={styles.emptyBody}>
            That's the whole deck for your current settings. Widen your age
            range or distance in Profile — or take another look from the top.
          </T>
          <Button
            accessibilityLabel="Start the deck over"
            variant="filled"
            onPress={() => kindred.resetDeck()}
          >
            Start over
          </Button>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 32,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerText: { flex: 1 },
  title: { letterSpacing: 0 },
  subtitle: { marginTop: 8 },
  superCount: { marginTop: 8 },
  hiddenCard: {},
  matchCard: { overflow: "hidden" },
  matchBanner: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 16,
    alignItems: "center",
  },
  matchBody: {
    padding: 20,
    gap: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: { flex: 1 },
  deckCount: { textAlign: "center" },
  emptyCard: { gap: 12 },
  emptyTitle: { textAlign: "center" },
  emptyBody: { textAlign: "center", lineHeight: 22 },
});
