import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { colors, Badge, Button, Chip, IconButton } from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import ChevronLeftIcon from "@hugeicons/core-free-icons/ChevronLeftIcon";
import { slotDays, windowsForDay } from "./data";
import { useBasket } from "./state";
import { ListCard, RowSeparator, SectionTitle, T, chromeColors } from "./ui";

export default function SlotScreen() {
  const basket = useBasket();
  const days = slotDays();
  const [dayId, setDayId] = useState(basket.slot.dayId);
  const [windowId, setWindowId] = useState(basket.slot.windowId);

  const day = days.find((d) => d.id === dayId) ?? days[0];
  const windows = windowsForDay(dayId);
  const selectedWindow = windows.find((w) => w.id === windowId);

  const save = () => {
    if (!selectedWindow || selectedWindow.state === "full") return;
    basket.setSlot({
      dayId: day.id,
      dayLabel: day.label,
      dateLabel: day.dateLabel,
      windowId: selectedWindow.id,
      windowLabel: selectedWindow.label,
    });
    router.back();
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <IconButton
          accessibilityLabel="Back"
          onPress={() => router.back()}
          isDark={basket.darkMode}
          icon={<HugeiconsIcon icon={ChevronLeftIcon} size={20} color={colors[basket.darkMode ? "dark" : "light"].foreground} />}
        />
        <View style={styles.flex}>
          <T variant="title">Delivery slot</T>
          <T variant="body" muted style={styles.subtitle}>
            To {basket.selectedAddress.label} · {basket.selectedAddress.line}
          </T>
        </View>
      </View>

      <View>
        <SectionTitle>Day</SectionTitle>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {days.map((d) => (
            <Chip
              key={d.id}
              label={`${d.label} · ${d.dateLabel.split(" ").slice(1).join(" ")}`}
              isDark={basket.darkMode}
              selected={dayId === d.id}
              onPress={() => {
                setDayId(d.id);
                // Keep the chosen window if it is bookable on the new day.
                const next = windowsForDay(d.id).find((w) => w.id === windowId);
                if (!next || next.state === "full") {
                  const first = windowsForDay(d.id).find((w) => w.state !== "full");
                  if (first) setWindowId(first.id);
                }
              }}
            />
          ))}
        </ScrollView>
      </View>

      <View>
        <SectionTitle>Time window · {day.dateLabel}</SectionTitle>
        <ListCard>
          {windows.map((w, i) => {
            const selected = windowId === w.id && w.state !== "full";
            return (
              <View key={w.id}>
                {i > 0 ? <RowSeparator /> : null}
                <Pressable
                  disabled={w.state === "full"}
                  onPress={() => setWindowId(w.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${w.label}${w.state === "full" ? ", fully booked" : ""}`}
                  style={({ pressed }) => [
                    styles.windowRow,
                    selected && {
                      backgroundColor: chromeColors(basket.backdrop).fill,
                    },
                    pressed && w.state !== "full" && { opacity: 0.7 },
                  ]}
                >
                  <View style={styles.flex}>
                    <T
                      variant="body"
                      style={w.state === "full" ? styles.fullText : undefined}
                    >
                      {w.label}
                    </T>
                    <T variant="caption" muted style={styles.description}>
                      {w.state === "full"
                        ? "Fully booked"
                        : w.state === "few"
                          ? "Few left"
                          : "Open"}
                    </T>
                  </View>
                  {selected ? (
                    <Badge tone="muted" isDark={basket.darkMode}>
                      Selected
                    </Badge>
                  ) : null}
                </Pressable>
              </View>
            );
          })}
        </ListCard>
      </View>

      <Button
        isDark={basket.darkMode}
        accessibilityLabel="Confirm delivery slot"
        variant="filled"
        size="lg"
        disabled={!selectedWindow || selectedWindow.state === "full"}
        onPress={save}
      >{`Confirm · ${day.label}, ${selectedWindow?.label ?? ""}`}</Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 112,
    paddingBottom: 40,
    gap: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  subtitle: {
    marginTop: 4,
  },
  chips: {
    gap: 8,
    paddingRight: 8,
  },
  windowRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: 12,
  },
  fullText: {
    opacity: 0.45,
  },
  description: {
    marginTop: 2,
  },
});
