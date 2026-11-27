import React, { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, Button, IconButton } from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import CallEnd01Icon from "@hugeicons/core-free-icons/CallEnd01Icon";
import Mic01Icon from "@hugeicons/core-free-icons/Mic01Icon";
import MicOff01Icon from "@hugeicons/core-free-icons/MicOff01Icon";
import Video01Icon from "@hugeicons/core-free-icons/Video01Icon";
import VideoOffIcon from "@hugeicons/core-free-icons/VideoOffIcon";
import VolumeHighIcon from "@hugeicons/core-free-icons/VolumeHighIcon";
import VolumeMute01Icon from "@hugeicons/core-free-icons/VolumeMute01Icon";
import { nowLabel, useChat, type CallKind } from "../state";
import { accentColor, Figure, HeroPhoto, T } from "../ui";

function formatTimer(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** A control icon that reads white on the accent when its state is on,
 *  foreground on glass when off — the IconButton hands a render-function
 *  icon the colour it resolves, so one function serves both states. */
function controlIcon(icon: any) {
  return ({ color, size }: { color: string; size: number }) => (
    <HugeiconsIcon icon={icon} size={size} color={color} />
  );
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
  const [tileFailed, setTileFailed] = useState(false);
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
        <Button accessibilityLabel="Back" variant="ghost" onPress={() => router.back()} isDark={chat.darkMode}>
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

  const accent = accentColor(chat.backdrop);
  const endRed = chat.darkMode ? "#c93a30" : "#b3261e";

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: Math.max(insets.bottom, 16) }]}>
      {/* The video area is the primary visual element on a video call:
          the contact's photo fills a large tile, the way a remote feed
          would. A voice call stays a centred portrait instead. */}
      {callKind === "video" ? (
        <View
          style={[
            styles.videoTile,
            { backgroundColor: colors[chat.darkMode ? "dark" : "light"].wash },
          ]}
        >
          {contact.image && !tileFailed ? (
            <Image
              source={contact.image}
              onError={() => setTileFailed(true)}
              accessibilityLabel={`Video of ${contact.name}`}
              style={styles.videoImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.videoFallback}>
              <HeroPhoto image={contact.image} name={contact.name} size={120} />
            </View>
          )}
        </View>
      ) : (
        <View style={styles.voiceHero}>
          <HeroPhoto image={contact.image} name={contact.name} size={120} />
        </View>
      )}

      <View style={styles.identity}>
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
            icon={controlIcon(muted ? MicOff01Icon : Mic01Icon)}
            accessibilityLabel={muted ? "Unmute" : "Mute"}
            isDark={chat.darkMode}
            size="lg"
            tint={muted ? accent : undefined}
            onPress={() => setMuted((v) => !v)}
          />
          <T variant="caption" muted>
            {muted ? "Unmute" : "Mute"}
          </T>
        </View>
        <View style={styles.control}>
          <IconButton
            icon={controlIcon(speaker ? VolumeHighIcon : VolumeMute01Icon)}
            accessibilityLabel={speaker ? "Speaker off" : "Speaker on"}
            isDark={chat.darkMode}
            size="lg"
            tint={speaker ? accent : undefined}
            onPress={() => setSpeaker((v) => !v)}
          />
          <T variant="caption" muted>
            Speaker
          </T>
        </View>
        {callKind === "video" ? (
          <View style={styles.control}>
            <IconButton
              icon={controlIcon(cameraOff ? VideoOffIcon : Video01Icon)}
              accessibilityLabel={cameraOff ? "Camera on" : "Camera off"}
              isDark={chat.darkMode}
              size="lg"
              tint={cameraOff ? accent : undefined}
              onPress={() => setCameraOff((v) => !v)}
            />
            <T variant="caption" muted>
              Camera
            </T>
          </View>
        ) : null}
      </View>

      {/* End call is the most important action: one large red circle,
          FaceTime style, centred under the controls — not a full-width
          bar. */}
      <View style={styles.endWrap}>
        <IconButton
          icon={controlIcon(CallEnd01Icon)}
          accessibilityLabel="End call"
          isDark={chat.darkMode}
          size="lg"
          tint={endRed}
          onPress={endCall}
        />
        <T variant="caption" muted>
          End call
        </T>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 24,
  },
  missing: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  videoTile: {
    aspectRatio: 4 / 3,
    borderRadius: 24,
    overflow: "hidden",
  },
  videoImage: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },
  videoFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  voiceHero: {
    alignItems: "center",
    marginTop: 32,
  },
  identity: {
    alignItems: "center",
    gap: 4,
    marginTop: 24,
  },
  name: { textAlign: "center" },
  timer: { marginTop: 4 },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: "auto",
  },
  control: {
    alignItems: "center",
    gap: 8,
  },
  endWrap: {
    alignItems: "center",
    gap: 8,
    marginTop: 32,
  },
});
