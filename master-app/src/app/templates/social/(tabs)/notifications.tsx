import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Button } from "glacia-native";

import { useSocial, type NotificationKind } from "../state";
import {
  Figure,
  ListCard,
  RowSeparator,
  Screen,
  T,
  accentColor,
  raisedFill,
} from "../ui";

const KIND_GLYPH: Record<NotificationKind, string> = {
  like: "♥",
  follow: "+",
  mention: "@",
  comment: "↩",
};

export default function NotificationsScreen() {
  const social = useSocial();

  return (
    <Screen
      title="Activity"
      subtitle={
        social.unreadNotifications > 0
          ? `${social.unreadNotifications} unread`
          : "All read"
      }
    >
      {social.unreadNotifications > 0 ? (
        <Button
          accessibilityLabel="Mark all notifications as read"
          onPress={social.markAllNotificationsRead}
        >
          Mark all as read
        </Button>
      ) : null}

      <ListCard>
        {social.notifications.map((n, i) => {
          const actor = social.userById(n.actorId);
          return (
            <React.Fragment key={n.id}>
              {i > 0 ? <RowSeparator /> : null}
              <View style={styles.row}>
                <View style={styles.avatarWrap}>
                  <Avatar name={actor.name} size="md" isDark={social.darkMode} />
                  <View
                    style={[
                      styles.kindBadge,
                      { backgroundColor: raisedFill(social.backdrop) },
                    ]}
                  >
                    <T
                      variant="caption"
                      style={{
                        fontSize: 10,
                        lineHeight: 12,
                        color:
                          n.kind === "like"
                            ? accentColor(social.backdrop)
                            : undefined,
                      }}
                      muted={n.kind !== "like"}
                    >
                      {KIND_GLYPH[n.kind]}
                    </T>
                  </View>
                </View>
                <View style={styles.flex1}>
                  <T variant="body">
                    <T variant="body">{actor.name} </T>
                    {n.text}
                  </T>
                  <Figure variant="caption" muted style={styles.time}>
                    {n.timeLabel} ago
                  </Figure>
                </View>
                {!n.read ? (
                  <View
                    style={[
                      styles.unreadDot,
                      { backgroundColor: accentColor(social.backdrop) },
                    ]}
                  />
                ) : null}
              </View>
            </React.Fragment>
          );
        })}
      </ListCard>

      <Button
        accessibilityLabel="Open messages"
        variant="ghost"
        onPress={() => router.push("/templates/social/messages")}
      >
        Go to messages
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  avatarWrap: { position: "relative" },
  kindBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  time: { marginTop: 4 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
  },
});
