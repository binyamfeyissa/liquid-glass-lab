import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Avatar, Button, Field, Input, Sheet, Switch, Textarea } from "glacia-native";

import { useSocial } from "../state";
import {
  BackdropControl,
  Figure,
  ListCard,
  NavRow,
  PostCard,
  RowSeparator,
  Screen,
  SectionTitle,
  SettingRow,
  T,
  compact,
} from "../ui";

export default function ProfileScreen() {
  const social = useSocial();
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(social.me.name);
  const [bio, setBio] = useState(social.me.bio);
  const [saved, setSaved] = useState(false);

  const myPosts = social.postsByUser(social.me.id);

  const openEdit = () => {
    setName(social.me.name);
    setBio(social.me.bio);
    setSaved(false);
    setEditOpen(true);
  };

  const save = () => {
    social.updateMyProfile(name, bio);
    setSaved(true);
  };

  return (
    <Screen title="Profile">
      {/* Header */}
      <View style={styles.header}>
        <Avatar
          name={social.me.name}
          size="lg"
          isDark={social.darkMode}
          status={social.activityStatus ? "online" : undefined}
        />
        <View style={styles.flex1}>
          <T variant="heading">{social.me.name}</T>
          <T variant="body" muted>
            {social.me.handle}
          </T>
        </View>
        <Button accessibilityLabel="Edit profile" onPress={openEdit}>
          Edit
        </Button>
      </View>
      <T variant="body" style={styles.bio}>
        {social.me.bio}
      </T>

      {/* Counts */}
      <View style={styles.counts}>
        <View style={styles.count}>
          <Figure variant="heading">{myPosts.length}</Figure>
          <T variant="caption" muted>
            Posts
          </T>
        </View>
        <View style={styles.count}>
          <Figure variant="heading">{compact(social.me.followers)}</Figure>
          <T variant="caption" muted>
            Followers
          </T>
        </View>
        <View style={styles.count}>
          <Figure variant="heading">{compact(social.myFollowingCount)}</Figure>
          <T variant="caption" muted>
            Following
          </T>
        </View>
      </View>

      <View>
        <SectionTitle>Messages</SectionTitle>
        <ListCard>
          <NavRow
            title="Conversations"
            description="Direct messages with your people"
            badge={social.totalUnreadMessages}
            onPress={() => router.push("/templates/social/messages")}
          />
        </ListCard>
      </View>

      <View>
        <SectionTitle>Background</SectionTitle>
        <ListCard>
          <View style={styles.backdropBody}>
            <BackdropControl />
            <T variant="caption" muted>
              Dark gray, broken white, or the Tahoe photo — the glass sits over
              all three
            </T>
          </View>
        </ListCard>
      </View>

      <View>
        <SectionTitle>App</SectionTitle>
        <ListCard>
          <SettingRow
            title="Push notifications"
            description="Likes, follows and mentions"
          >
            <Switch
              value={social.pushNotifications}
              onValueChange={social.setPushNotifications}
              accessibilityLabel="Push notifications"
              isDark={social.darkMode}
            />
          </SettingRow>
          <RowSeparator />
          <SettingRow
            title="Show activity status"
            description="Let followers see when you're around"
          >
            <Switch
              value={social.activityStatus}
              onValueChange={social.setActivityStatus}
              accessibilityLabel="Show activity status"
              isDark={social.darkMode}
            />
          </SettingRow>
        </ListCard>
      </View>

      <View>
        <SectionTitle>Your posts</SectionTitle>
        {myPosts.length === 0 ? (
          <T variant="body" muted>
            No posts yet
          </T>
        ) : (
          <View style={styles.posts}>
            {myPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </View>
        )}
      </View>

      <T variant="caption" muted style={styles.foot}>
        Orbit is a fictional social network — every person and post here is
        made up
      </T>

      {/* Edit profile sheet */}
      <Sheet
        visible={editOpen}
        onDismiss={() => setEditOpen(false)}
        isDark={social.darkMode}
        height={520}
      >
        <View style={styles.sheetBody}>
          <T variant="heading">Edit profile</T>
          {saved ? (
            <>
              <T variant="body" muted>
                Saved — the new name and bio are already in use
              </T>
              <Button
                accessibilityLabel="Done editing"
                variant="filled"
                onPress={() => setEditOpen(false)}
              >
                Done
              </Button>
            </>
          ) : (
            <>
              <Field label="Display name" isDark={social.darkMode}>
                <Input
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  accessibilityLabel="Display name"
                  isDark={social.darkMode}
                />
              </Field>
              <Field label="Bio" isDark={social.darkMode}>
                <Textarea
                  value={bio}
                  onChangeText={setBio}
                  placeholder="One or two lines about you"
                  accessibilityLabel="Bio"
                  rows={3}
                  isDark={social.darkMode}
                />
              </Field>
              <Button
                accessibilityLabel="Save profile"
                variant="filled"
                disabled={!name.trim()}
                onPress={save}
              >
                Save changes
              </Button>
            </>
          )}
        </View>
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 16 },
  bio: { lineHeight: 22 },
  counts: { flexDirection: "row", gap: 12 },
  count: { flex: 1, alignItems: "center", gap: 4 },
  backdropBody: { padding: 16, gap: 8 },
  posts: { gap: 16 },
  foot: { textAlign: "center" },
  sheetBody: { paddingHorizontal: 24, paddingTop: 8, gap: 16 },
});
