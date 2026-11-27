import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Avatar,
  Button,
  colors,
  Field,
  IconButton,
  Input,
} from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Cancel01Icon from "@hugeicons/core-free-icons/Cancel01Icon";
import { useSocial } from "../state";
import { GradientTile, T } from "../ui";

const SEGMENT_MS = 4000;

export default function StoryViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const social = useSocial();
  const insets = useSafeAreaInsets();
  const story = social.stories.find((s) => s.userId === id);
  const user = social.userById(id ?? "");

  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [reply, setReply] = useState("");
  const [sent, setSent] = useState(false);
  const doneRef = useRef(false);

  const segmentCount = story?.segments.length ?? 0;

  useEffect(() => {
    if (!story || sent) return;
    const started = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - started;
      const p = elapsed / SEGMENT_MS;
      if (p >= 1) {
        if (index + 1 >= segmentCount) {
          if (!doneRef.current) {
            doneRef.current = true;
            clearInterval(timer);
            router.back();
          }
        } else {
          setIndex(index + 1);
          setProgress(0);
        }
      } else {
        setProgress(p);
      }
    }, 50);
    return () => clearInterval(timer);
  }, [story, index, segmentCount, sent]);

  if (!story) {
    return (
      <View style={styles.missing}>
        <T variant="heading">No story here</T>
        <T variant="body" muted style={styles.missingText}>
          This story has expired
        </T>
        <Button isDark={social.darkMode} accessibilityLabel="Back" variant="glass" onPress={() => router.back()}>
          Back
        </Button>
      </View>
    );
  }

  const segment = story.segments[Math.min(index, segmentCount - 1)];
  const light = social.backdrop === "light";

  const sendReply = () => {
    if (!reply.trim()) return;
    setSent(true);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12, paddingBottom: Math.max(insets.bottom, 12) }]}>
      {/* Progress bars */}
      <View style={styles.bars}>
        {story.segments.map((s, i) => (
          <View
            key={i}
            style={[
              styles.barTrack,
              {
                backgroundColor: light
                  ? "rgba(31,27,22,0.18)"
                  : "rgba(237,237,237,0.25)",
              },
            ]}
          >
            <View
              style={[
                styles.barFill,
                {
                  backgroundColor: light ? "#1f1b16" : "#ededed",
                  width:
                    i < index ? "100%" : i === index ? `${Math.round(progress * 100)}%` : "0%",
                },
              ]}
            />
          </View>
        ))}
      </View>

      {/* Author row */}
      <View style={styles.authorRow}>
        <Avatar name={user.name} source={user.image} size="md" isDark={social.darkMode} />
        <View style={styles.flex1}>
          <T variant="body">{user.name}</T>
          <T variant="caption" muted>
            {user.handle} · Story {index + 1} of {segmentCount}
          </T>
        </View>
        <IconButton
          accessibilityLabel="Close story"
          onPress={() => router.back()}
          isDark={social.darkMode}
          icon={<HugeiconsIcon icon={Cancel01Icon} size={18} color={social.darkMode ? colors.dark.foreground : colors.light.foreground} />}
        />
      </View>

      {/* Tap zones: back / forward */}
      <View style={styles.stage}>
        <GradientTile
          gradient={segment.gradient}
          label={segment.text}
          height={430}
          radius={20}
          fontSize={30}
          image={segment.image}
        />
        <Pressable
          style={styles.tapLeft}
          onPress={() => {
            setIndex(Math.max(0, index - 1));
            setProgress(0);
          }}
          accessibilityRole="button"
          accessibilityLabel="Previous story segment"
        />
        <Pressable
          style={styles.tapRight}
          onPress={() => {
            if (index + 1 >= segmentCount) router.back();
            else {
              setIndex(index + 1);
              setProgress(0);
            }
          }}
          accessibilityRole="button"
          accessibilityLabel="Next story segment"
        />
      </View>

      {/* Reply */}
      {sent ? (
        <View style={styles.sentBox}>
          <T variant="body">Reply sent to {user.name.split(" ")[0]}</T>
          <Button isDark={social.darkMode} accessibilityLabel="Done" variant="filled" onPress={() => router.back()}>
            Done
          </Button>
        </View>
      ) : (
        <View style={styles.replyRow}>
          <View style={styles.flex1}>
            <Field label={`Reply to ${user.name.split(" ")[0]}`} isDark={social.darkMode}>
              <Input
                value={reply}
                onChangeText={setReply}
                placeholder="Say something nice"
                accessibilityLabel="Story reply"
                isDark={social.darkMode}
              />
            </Field>
          </View>
          <Button
            isDark={social.darkMode}
            accessibilityLabel="Send story reply"
            variant="filled"
            disabled={!reply.trim()}
            onPress={sendReply}
          >
            Send
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  root: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 16,
  },
  missing: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  missingText: { textAlign: "center" },
  bars: { flexDirection: "row", gap: 8 },
  barTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 2 },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  stage: { position: "relative" },
  tapLeft: { position: "absolute", left: 0, top: 0, bottom: 0, width: "30%" },
  tapRight: { position: "absolute", right: 0, top: 0, bottom: 0, width: "30%" },
  replyRow: { flexDirection: "row", alignItems: "flex-end", gap: 12 },
  sentBox: { gap: 12, alignItems: "flex-start" },
});
