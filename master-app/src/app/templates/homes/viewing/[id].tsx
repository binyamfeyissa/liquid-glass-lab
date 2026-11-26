import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Card, Chip, Input } from "glacia-native";

import {
  TIME_SLOTS,
  money,
  nextSevenDays,
  propertyById,
  takenSlots,
} from "../data";
import { useHomes } from "../state";
import { Figure, PropertyVisual, SectionTitle, StackHeader, T, errorColor } from "../ui";

export default function ViewingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { darkMode, backdrop, profile, addViewing } = useHomes();
  const property = propertyById(id ?? "");
  const days = useMemo(() => nextSevenDays(), []);

  const [dayKey, setDayKey] = useState(days[0].key);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  if (!property) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <StackHeader title="Home not found" />
        <Card isDark={darkMode} padding={20}>
          <T variant="body">This home is no longer listed, so it can't be viewed</T>
        </Card>
        <Button
          variant="filled"
          accessibilityLabel="Back to home"
          isDark={darkMode}
          onPress={() => router.replace("/templates/homes")}
        >
          Back to home
        </Button>
      </ScrollView>
    );
  }

  const taken = takenSlots(property.id, dayKey);
  const chosenDay = days.find((d) => d.key === dayKey) ?? days[0];

  const confirm = () => {
    if (!time) {
      setError("Pick a time slot first");
      return;
    }
    if (name.trim().length < 2) {
      setError("Please enter your name so the agent knows who to meet");
      return;
    }
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 7) {
      setError("Please enter a phone number with at least 7 digits");
      return;
    }
    setError(null);
    addViewing({
      propertyId: property.id,
      dayKey,
      dayLabel: chosenDay.longLabel,
      time,
      name: name.trim(),
      phone: phone.trim(),
    });
    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <StackHeader title="Viewing booked" subtitle={property.title} />
        <Card isDark={darkMode} padding={24}>
          <T variant="heading">You're booked in, {name.trim().split(" ")[0]}</T>
          <T variant="body" muted style={styles.confirmBody}>
            {property.title}, {property.address} · {property.area}
          </T>
          <Figure variant="body" style={styles.confirmBody}>
            {chosenDay.longLabel} at {time}
          </Figure>
          <T variant="caption" muted style={styles.confirmBody}>
            The agent will call {phone.trim()} if anything changes. This
            booking now lives in your Saved tab, where you can cancel it.
          </T>
        </Card>
        <Button
          variant="filled"
          accessibilityLabel="View my bookings in Saved"
          isDark={darkMode}
          onPress={() => router.replace("/templates/homes/saved")}
        >
          View in Saved
        </Button>
        <Button
          variant="ghost"
          accessibilityLabel="Back to the property"
          isDark={darkMode}
          onPress={() => router.back()}
        >
          Back to the property
        </Button>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <StackHeader title="Book a viewing" subtitle={`${property.title} · ${money(property.price)}`} />

      <PropertyVisual property={property} height={120} />

      <View>
        <SectionTitle>Pick a day</SectionTitle>
        <View style={styles.chipWrap}>
          {days.map((d) => (
            <Chip
              key={d.key}
              label={d.label}
              selected={dayKey === d.key}
              onSelectedChange={(selected) => {
                if (selected) {
                  setDayKey(d.key);
                  setTime(null);
                }
              }}
              isDark={darkMode}
            />
          ))}
        </View>
      </View>

      <View>
        <SectionTitle>Pick a time — {chosenDay.longLabel}</SectionTitle>
        <View style={styles.chipWrap}>
          {TIME_SLOTS.map((slot) => {
            const isTaken = taken.includes(slot);
            return (
              <Chip
                key={slot}
                label={isTaken ? `${slot} · taken` : slot}
                selected={time === slot}
                disabled={isTaken}
                onSelectedChange={(selected) => {
                  if (selected) setTime(slot);
                }}
                isDark={darkMode}
              />
            );
          })}
        </View>
      </View>

      <View>
        <SectionTitle>Your details</SectionTitle>
        <View style={styles.form}>
          <View>
            <T variant="caption" muted style={styles.label}>
              Name
            </T>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              accessibilityLabel="Your name"
              isDark={darkMode}
              autoCapitalize="words"
            />
          </View>
          <View>
            <T variant="caption" muted style={styles.label}>
              Phone
            </T>
            <Input
              value={phone}
              onChangeText={setPhone}
              placeholder="+1 (555) 000-0000"
              accessibilityLabel="Your phone number"
              keyboardType="phone-pad"
              isDark={darkMode}
            />
          </View>
          {error ? (
            <T variant="caption" style={{ color: errorColor(backdrop) }}>
              {error}
            </T>
          ) : null}
          <Button
            variant="filled"
            size="lg"
            accessibilityLabel="Confirm viewing"
            isDark={darkMode}
            onPress={confirm}
          >
            Confirm viewing
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 112,
    paddingBottom: 36,
    gap: 20,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  form: {
    gap: 16,
  },
  label: {
    marginBottom: 8,
    marginLeft: 4,
  },
  confirmBody: {
    marginTop: 8,
  },
});
