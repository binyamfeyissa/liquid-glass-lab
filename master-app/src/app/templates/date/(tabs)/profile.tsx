import React from "react";
import { StyleSheet, View } from "react-native";
import {
  Avatar,
  Chip,
  Input,
  Select,
  Stepper,
  Switch,
  Textarea,
} from "glacia-native";

import { INTERESTS, useKindred, type Profile } from "../state";
import {
  BackdropControl,
  Figure,
  ListCard,
  ProfileCardView,
  RowSeparator,
  Screen,
  SectionTitle,
  SettingRow,
  T,
} from "../ui";

const DISTANCE_OPTIONS = [
  { value: "5", label: "Up to 5 km" },
  { value: "10", label: "Up to 10 km" },
  { value: "25", label: "Up to 25 km" },
  { value: "50", label: "Up to 50 km" },
  { value: "100", label: "Up to 100 km" },
];

export default function ProfileScreen() {
  const kindred = useKindred();
  const me = kindred.myProfile;

  const previewProfile: Profile = {
    id: "me",
    name: me.name || "You",
    age: me.age,
    distanceKm: 0,
    job: "This is how your card looks to others",
    bio: me.bio,
    interests: me.interests,
    colors: ["#c2452d", "#8a5a34"],
    image: require("../assets/img/alex.jpg"),
  };

  return (
    <Screen belowTabBar title="Profile" subtitle="Your card and your settings">
      {/* Header */}
      <View style={styles.header}>
        <Avatar name={me.name || "You"} size="lg" isDark={kindred.darkMode} source={previewProfile.image} />
        <View style={styles.headerText}>
          <View style={styles.headerNameRow}>
            <T variant="heading">{me.name}</T>
            <Figure variant="heading" muted>
              {me.age}
            </Figure>
          </View>
          <Figure variant="body" muted>
            {kindred.matches.length} matches · {kindred.superLikesLeft} super
            likes left
          </Figure>
        </View>
      </View>

      <View>
        <SectionTitle>How others see you</SectionTitle>
        <ProfileCardView
          profile={previewProfile}
          photoHeight={240}
          distanceText="Shown to people near you"
        />
      </View>

      <View>
        <SectionTitle>Edit profile</SectionTitle>
        <ListCard>
          <View style={styles.fieldBlock}>
            <T variant="label" muted>
              Name
            </T>
            <Input
              value={me.name}
              onChangeText={(name) => kindred.setMyProfile({ name })}
              placeholder="Your first name"
              accessibilityLabel="Your name"
              autoCapitalize="words"
              isDark={kindred.darkMode}
            />
          </View>
          <RowSeparator />
          <SettingRow
            title="Age"
            description="Shown next to your name on your card"
          >
            <Stepper
              value={me.age}
              onValueChange={(age) => kindred.setMyProfile({ age })}
              min={18}
              max={80}
              accessibilityLabel="Your age"
              isDark={kindred.darkMode}
            />
          </SettingRow>
          <RowSeparator />
          <View style={styles.fieldBlock}>
            <T variant="label" muted>
              Bio
            </T>
            <Textarea
              value={me.bio}
              onChangeText={(bio) => kindred.setMyProfile({ bio })}
              placeholder="A few honest lines about you"
              accessibilityLabel="Your bio"
              rows={4}
              isDark={kindred.darkMode}
            />
          </View>
          <RowSeparator />
          <View style={styles.fieldBlock}>
            <T variant="label" muted>
              Interests
            </T>
            <View style={styles.chipWrap}>
              {INTERESTS.map((interest) => (
                <Chip
                  key={interest}
                  label={interest}
                  selected={me.interests.includes(interest)}
                  onSelectedChange={() => kindred.toggleMyInterest(interest)}
                  isDark={kindred.darkMode}
                />
              ))}
            </View>
            <Figure variant="caption" muted>
              {me.interests.length} selected
            </Figure>
          </View>
        </ListCard>
      </View>

      <View>
        <SectionTitle>Discovery settings</SectionTitle>
        <ListCard>
          <SettingRow
            title="Youngest age"
            description="The youngest person you'll see in Discover"
          >
            <Stepper
              value={kindred.ageMin}
              onValueChange={kindred.setAgeMin}
              min={18}
              max={60}
              accessibilityLabel="Minimum age"
              isDark={kindred.darkMode}
            />
          </SettingRow>
          <RowSeparator />
          <SettingRow
            title="Oldest age"
            description="The oldest person you'll see in Discover"
          >
            <Stepper
              value={kindred.ageMax}
              onValueChange={kindred.setAgeMax}
              min={19}
              max={80}
              accessibilityLabel="Maximum age"
              isDark={kindred.darkMode}
            />
          </SettingRow>
          <RowSeparator />
          <View style={styles.fieldBlock}>
            <T variant="label" muted>
              Distance
            </T>
            <Select
              value={String(kindred.maxDistanceKm)}
              onValueChange={(v) => kindred.setMaxDistanceKm(Number(v))}
              options={DISTANCE_OPTIONS}
              accessibilityLabel="Maximum distance"
              isDark={kindred.darkMode}
            />
          </View>
          <RowSeparator />
          <SettingRow
            title="Show me on Kindred"
            description="Off hides your profile from new people"
          >
            <Switch
              value={kindred.showMe}
              onValueChange={kindred.setShowMe}
              accessibilityLabel="Show me on Kindred"
              isDark={kindred.darkMode}
            />
          </SettingRow>
        </ListCard>
      </View>

      <View>
        <SectionTitle>App</SectionTitle>
        <ListCard>
          <View style={styles.fieldBlock}>
            <T variant="label" muted>
              Background
            </T>
            <BackdropControl />
          </View>
          <RowSeparator />
          <SettingRow
            title="New matches"
            description="A nudge when a like turns into a match"
          >
            <Switch
              value={kindred.notifyMatches}
              onValueChange={kindred.setNotifyMatches}
              accessibilityLabel="New match notifications"
              isDark={kindred.darkMode}
            />
          </SettingRow>
          <RowSeparator />
          <SettingRow
            title="Messages"
            description="A nudge when a match writes back"
          >
            <Switch
              value={kindred.notifyMessages}
              onValueChange={kindred.setNotifyMessages}
              accessibilityLabel="Message notifications"
              isDark={kindred.darkMode}
            />
          </SettingRow>
          <RowSeparator />
          <SettingRow
            title="Likes"
            description="A quiet heads-up when someone likes you"
          >
            <Switch
              value={kindred.notifyLikes}
              onValueChange={kindred.setNotifyLikes}
              accessibilityLabel="Like notifications"
              isDark={kindred.darkMode}
            />
          </SettingRow>
        </ListCard>
      </View>

      <T variant="caption" muted style={styles.foot}>
        Kindred · Template build — everyone here is fictional and nothing
        leaves your device
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
  headerText: { flex: 1, gap: 4 },
  headerNameRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  fieldBlock: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  foot: { textAlign: "center" },
});
