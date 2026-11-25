import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, IconButton } from "glacia-native";

import { nowLabel, useChat, type CallKind } from "../state";
import { ContactAvatar, Figure, T } from "../ui";

function formatTimer(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function CallScreen() {
  const { id, kind } = useLocalSearchParams<{ id: string; kind?: string }>();
  const chat = useChat();
  const insets = useSafeAreaInsets();
  const contact = chat.contacts.find((c) => c.id === id);
  const callKind: CallKind = kind === "video" ? "video" : "voice";

  const [connected, setConnected] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const ended = useRef(false);

  // The "other side" picks up after a moment, then the timer ticks.
  useEffect(() => {
    const pickup = setTimeout(() => setConnected(true), 1400);
    return () => clearTimeout(pickup);
  }, []);

  useEffect(() => {
    if (!connected) return;
    const tick = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(tick);
  }, [connected]);

  if (!contact) {
    return (
      <View style={styles.missing}>
        <T variant="heading">Contact not found</T>
        <Button accessibilityLabel="Back" variant="ghost" onPress={() => router.back()}>
          Back
        </Button>
      </View>
    );
  }

  const endCall = () => {
    if (ended.current) return;
    ended.current = true;
    chat.logCall({
      contactId: contact.id,
      kind: callKind,
      direction: "out",
      missed: false,
      timeLabel: `Today · ${nowLabel()}`,
      durationLabel: connected ? formatTimer(seconds) : "0:00",
    });
    router.back();
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: Math.max(insets.bottom, 16) }]}>
      <View style={styles.hero}>
        <ContactAvatar contact={contact} size="lg" />
        <T variant="title" style={styles.name}>
          {contact.name}
        </T>
        <T variant="body" muted>
          {callKind === "video" ? "Video call" : "Voice call"}
        </T>
        <Figure variant="heading" style={styles.timer}>
          {connected ? formatTimer(seconds) : "Calling…"}
        </Figure>
        {connected && muted ? (
          <T variant="caption" muted>
            Microphone muted
          </T>
        ) : null}
        {connected && callKind === "video" && cameraOff ? (
          <T variant="caption" muted>
            Camera off
          </T>
        ) : null}
      </View>

      <View style={styles.controls}>
        <View style={styles.control}>
          <IconButton
            icon={<T variant="caption">{muted ? "Unmute" : "Mute"}</T>}
            accessibilityLabel={muted ? "Unmute" : "Mute"}
            isDark={chat.darkMode}
            size="lg"
            onPress={() => setMuted((v) => !v)}
          />
          <T variant="caption" muted>
            {muted ? "Unmute" : "Mute"}
          </T>
        </View>
        <View style={styles.control}>
          <IconButton
            icon={<T variant="caption">Speaker</T>}
            accessibilityLabel={speaker ? "Speaker off" : "Speaker on"}
            isDark={chat.darkMode}
            size="lg"
            onPress={() => setSpeaker((v) => !v)}
          />
          <T variant="caption" muted>
            Speaker
          </T>
        </View>
        {callKind === "video" ? (
          <View style={styles.control}>
            <IconButton
              icon={<T variant="caption">Camera</T>}
              accessibilityLabel={cameraOff ? "Camera on" : "Camera off"}
              isDark={chat.darkMode}
              size="lg"
              onPress={() => setCameraOff((v) => !v)}
            />
            <T variant="caption" muted>
              Camera
            </T>
          </View>
        ) : null}
      </View>

      <Button
        accessibilityLabel="End call"
        variant="filled"
        tint={chat.darkMode ? "#c93a30" : "#b3261e"}
        style={styles.endButton}
        onPress={endCall}
      >
        End call
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  missing: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  hero: {
    alignItems: "center",
    gap: 4,
    marginTop: 32,
  },
  name: { marginTop: 8 },
  timer: { marginTop: 4 },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
  },
  control: {
    alignItems: "center",
    gap: 8,
  },
  endButton: {
    alignSelf: "stretch",
  },
});
