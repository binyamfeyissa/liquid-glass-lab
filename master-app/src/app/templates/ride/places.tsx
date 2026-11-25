import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { AlertDialog, Avatar, Button, Field, Input } from "glacia-native";

import { useRide } from "./state";
import { ListCard, RowSeparator, Screen, SectionTitle, T } from "./ui";

export default function PlacesScreen() {
  const ride = useRide();
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [savedNote, setSavedNote] = useState<string | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const add = () => {
    if (label.trim().length < 2) {
      setError("Give the place a short label, like Grandma's");
      return;
    }
    if (address.trim().length < 6) {
      setError("Enter a full address so drivers can find it");
      return;
    }
    if (ride.savedPlaces.some((p) => p.label.toLowerCase() === label.trim().toLowerCase())) {
      setError(`You already have a place called "${label.trim()}"`);
      return;
    }
    ride.addPlace(label, address);
    setSavedNote(`Saved "${label.trim()}" — it now appears on Home`);
    setLabel("");
    setAddress("");
    setError(undefined);
  };

  const deleting = deleteId ? ride.savedPlaces.find((p) => p.id === deleteId) : undefined;

  return (
    <Screen title="Saved places" subtitle="Shortcuts that appear on the Home screen">
      <View>
        <SectionTitle>Your places</SectionTitle>
        <ListCard>
          {ride.savedPlaces.map((place, i) => (
            <View key={place.id}>
              {i > 0 ? <RowSeparator /> : null}
              <View style={styles.placeRow}>
                <Avatar name={place.label} size="md" isDark={ride.darkMode} />
                <View style={styles.placeText}>
                  <T variant="body">{place.label}</T>
                  <T variant="caption" muted style={styles.placeSub}>
                    {place.address}
                  </T>
                </View>
                <Button
                  accessibilityLabel={`Remove saved place ${place.label}`}
                  variant="ghost"
                  size="sm"
                  onPress={() => setDeleteId(place.id)}
                >
                  Remove
                </Button>
              </View>
            </View>
          ))}
          {ride.savedPlaces.length === 0 ? (
            <View style={styles.placeRow}>
              <T variant="body" muted>
                No saved places yet — add your first one below
              </T>
            </View>
          ) : null}
        </ListCard>
      </View>

      <View>
        <SectionTitle>Add a place</SectionTitle>
        <View style={styles.form}>
          <Field label="Label" error={error} isDark={ride.darkMode}>
            <Input
              value={label}
              onChangeText={(v) => {
                setLabel(v);
                setSavedNote(undefined);
              }}
              placeholder="e.g. Grandma's"
              accessibilityLabel="New place label"
              invalid={!!error}
              isDark={ride.darkMode}
            />
          </Field>
          <Field label="Address" isDark={ride.darkMode}>
            <Input
              value={address}
              onChangeText={(v) => {
                setAddress(v);
                setSavedNote(undefined);
              }}
              placeholder="Street, number, area"
              accessibilityLabel="New place address"
              isDark={ride.darkMode}
            />
          </Field>
          {savedNote ? (
            <T variant="caption" style={styles.savedNote}>
              {savedNote}
            </T>
          ) : null}
          <Button accessibilityLabel="Save this place" variant="filled" onPress={add}>
            Save place
          </Button>
        </View>
      </View>

      <Button
        accessibilityLabel="Back to profile"
        variant="ghost"
        onPress={() => router.back()}
      >
        Back
      </Button>

      <AlertDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title={deleting ? `Remove "${deleting.label}"?` : "Remove place?"}
        description="It will disappear from your Home shortcuts. Trips you've already taken there stay in Activity."
        confirmLabel="Remove"
        cancelLabel="Keep it"
        destructive
        isDark={ride.darkMode}
        onConfirm={() => {
          if (deleteId) ride.removePlace(deleteId);
          setDeleteId(null);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  placeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  placeText: { flex: 1 },
  placeSub: { marginTop: 4 },
  form: { gap: 16 },
  savedNote: { marginLeft: 4 },
});
