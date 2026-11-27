import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, Card, IconButton } from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Cancel01Icon from "@hugeicons/core-free-icons/Cancel01Icon";
import FavouriteIcon from "@hugeicons/core-free-icons/FavouriteIcon";
import StarIcon from "@hugeicons/core-free-icons/StarIcon";

import { useKindred } from "../state";
import { accentColor, Figure, PhotoPanel, ProfileCardView, T } from "../ui";

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
        <T variant="title" style={styles.title}>
          Discover
        </T>
        <T variant="body" muted style={styles.subtitle}>
          People near you, one at a time
        </T>
      </View>

      {!kindred.showMe ? (
        <Card isDark={kindred.darkMode} padding={16}>
          <T variant="body">
            You're hidden right now. Your profile isn't being shown to anyone
            new, but you can keep browsing — turn Show me back on in Profile
            when you're ready.
          </T>
        </Card>
      ) : null}

      {pending ? (
        <View style={styles.matchBlock}>
          <PhotoPanel profile={pending} height={320} />
          <T variant="title">It's a match</T>
          <T variant="body">
            You and {pending.name} liked each other. Their chat is open
            whenever you are.
          </T>
          <Button
            isDark={kindred.darkMode}
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
            isDark={kindred.darkMode}
            accessibilityLabel="Keep browsing"
            variant="glass"
            onPress={() => kindred.clearPendingMatch()}
          >
            Keep browsing
          </Button>
        </View>
      ) : current ? (
        <>
          <ProfileCardView profile={current} />
          {/* The decision row: three tactile circles, not a row of text
              pills. Like is the primary action, so it alone wears the
              filled accent; Pass and Super like stay quiet glass. */}
          <View style={styles.actions}>
            <View style={styles.actionItem}>
              <IconButton
                icon={({ color, size }: { color: string; size: number }) => (
                  <HugeiconsIcon icon={Cancel01Icon} size={size} color={color} />
                )}
                accessibilityLabel={`Pass on ${current.name}`}
                isDark={kindred.darkMode}
                size="md"
                onPress={() => kindred.pass(current.id)}
              />
              <T variant="caption" muted style={styles.actionLabel}>
                Pass
              </T>
            </View>
            <View style={styles.actionItem}>
              <IconButton
                icon={({ color, size }: { color: string; size: number }) => (
                  <HugeiconsIcon icon={StarIcon} size={size} color={color} />
                )}
                accessibilityLabel={`Super like ${current.name}`}
                isDark={kindred.darkMode}
                size="md"
                disabled={kindred.superLikesLeft <= 0}
                onPress={() => kindred.superLike(current.id)}
              />
              <T variant="caption" muted style={styles.actionLabel}>
                Super like
              </T>
            </View>
            <View style={styles.actionItem}>
              <IconButton
                icon={({ color, size }: { color: string; size: number }) => (
                  <HugeiconsIcon icon={FavouriteIcon} size={size} color={color} />
                )}
                accessibilityLabel={`Like ${current.name}`}
                isDark={kindred.darkMode}
                size="lg"
                tint={accentColor(kindred.backdrop)}
                onPress={() => kindred.like(current.id)}
              />
              <T variant="caption" muted style={styles.actionLabel}>
                Like
              </T>
            </View>
          </View>
          <Figure variant="caption" muted style={styles.countLine}>
            {kindred.superLikesLeft} super likes left · {kindred.deck.length}{" "}
            {kindred.deck.length === 1 ? "person" : "people"} left nearby
          </Figure>
        </>
      ) : (
        <View style={styles.emptyBlock}>
          <T variant="heading" style={styles.emptyTitle}>
            You've seen everyone nearby
          </T>
          <T variant="body" muted style={styles.emptyBody}>
            That's the whole deck for your current settings. Widen your age
            range or distance in Profile — or take another look from the top.
          </T>
          <Button
            isDark={kindred.darkMode}
            accessibilityLabel="Start the deck over"
            variant="filled"
            style={styles.emptyButton}
            onPress={() => kindred.resetDeck()}
          >
            Start over
          </Button>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 112,
    paddingBottom: 128,
    gap: 16,
  },
  header: {
    gap: 8,
  },
  title: { letterSpacing: 0 },
  subtitle: {},
  matchBlock: {
    gap: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 28,
    marginTop: 8,
  },
  actionItem: {
    alignItems: "center",
    gap: 6,
  },
  actionLabel: {
    textAlign: "center",
  },
  countLine: { textAlign: "center" },
  emptyBlock: {
    alignItems: "center",
    gap: 12,
    paddingTop: 48,
  },
  emptyTitle: { textAlign: "center" },
  emptyBody: { textAlign: "center", lineHeight: 22 },
  emptyButton: { alignSelf: "stretch" },
});
