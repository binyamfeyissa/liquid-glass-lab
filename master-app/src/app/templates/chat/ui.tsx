import React, { useState, type ReactNode } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import {
  colors,
  Avatar,
  Card,
  initialsOf,
  SegmentedControl,
  Separator,
  Text,
  type TextProps,
} from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import ChevronRightIcon from "@hugeicons/core-free-icons/ChevronRightIcon";
import { useChat, type BackdropMode, type ChatMessage, type Contact } from "./state";

/* ------------------------------------------------------------------ */
/*  Theme tokens — one graphite/warm ramp, one message-blue accent.    */
/* ------------------------------------------------------------------ */

export const MONO = Platform.OS === "ios" ? "Menlo" : "monospace";

/** The one accent: message blue. Darker on light surfaces for contrast. */
export function accentColor(mode: BackdropMode): string {
  return mode === "light" ? "#1f5fc4" : "#6ea3f2";
}

/** My bubbles carry the accent, kept quiet. */
export function bubbleTint(mode: BackdropMode): string {
  return mode === "light" ? "#2a63c8" : "#33507f";
}

/** Incoming bubbles: a solid neutral surface, one step off the backdrop —
 *  graphite on graphite, a deeper warm tone on broken white, the same
 *  graphite over the palm photo (dark text theme there). Solid, never
 *  glass: the thread must read as text first, not as panels. */
export function theirsBubbleFill(mode: BackdropMode): string {
  return mode === "light" ? "#e9e3d7" : "#2c2c2e";
}

/** Pressed-row fill: a step of the template's own ramp, per mode. */
export function pressedFill(mode: BackdropMode): string {
  if (mode === "light") return "rgba(31,27,22,0.06)";
  if (mode === "image") return "rgba(255,255,255,0.10)";
  return "rgba(255,255,255,0.08)";
}

/** Selected-row fill: the accent at rest, per mode. */
export function selectedFill(mode: BackdropMode): string {
  return mode === "light" ? "rgba(31,95,196,0.10)" : "rgba(110,163,242,0.14)";
}

/** Secondary text colour of the ramp, for the typing dots. */
function secondaryInk(mode: BackdropMode): string {
  return mode === "light" ? "#5e554a" : "#a1a1a6";
}

/* ------------------------------------------------------------------ */
/*  T — Glacia Text threaded with the template's backdrop mode.        */
/* ------------------------------------------------------------------ */

export function T({ style, ...rest }: TextProps) {
  const { darkMode } = useChat();
  return <Text isDark={darkMode} style={style} {...rest} />;
}

/* ------------------------------------------------------------------ */
/*  Figure — a time, count or duration, set in mono with tabular       */
/*  figures. Every figure in the app goes through here.                */
/* ------------------------------------------------------------------ */

export function Figure({ style, ...rest }: TextProps) {
  const { darkMode } = useChat();
  // Glacia's Text spreads its style prop into one object, so an array
  // style would be dropped — always hand it a single merged object.
  const flat = Array.isArray(style)
    ? Object.assign({}, ...style)
    : ((style as Record<string, unknown>) ?? {});
  return (
    <Text
      isDark={darkMode}
      style={{ fontFamily: MONO, fontVariant: ["tabular-nums"], ...flat }}
      {...rest}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Backdrop — the three backgrounds, and nothing else.                */
/*  Dark: graphite #141415. Light: broken white #f7f4ee.               */
/*  Photo: the palm image, full-bleed, under a neutral scrim.         */
/* ------------------------------------------------------------------ */

export function Backdrop() {
  const { backdrop } = useChat();
  if (backdrop === "image") {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Image
          source={require("./assets/tahoe-dark.jpg")}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.38)" }]}
        />
      </View>
    );
  }
  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: backdrop === "light" ? "#f7f4ee" : "#141415" },
      ]}
    />
  );
}

/** The three-background switcher, used on Profile. */
export function BackdropControl() {
  const { backdrop, setBackdrop, darkMode } = useChat();
  const modes: BackdropMode[] = ["dark", "light", "image"];
  return (
    <SegmentedControl
      segments={["Dark", "Light", "Photo"]}
      selectedIndex={modes.indexOf(backdrop)}
      onChange={(i) => setBackdrop(modes[i])}
      isDark={darkMode}
      accessibilityLabel="Background"
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Screen — scrollable page shell with a title block.                 */
/* ------------------------------------------------------------------ */

/** Bottom clearance for tab screens: the floating TabBar is 64pt tall
 *  + 8pt top pad + the bottom safe-area inset (up to 34pt home indicator,
 *  48pt Android 3-button nav), so 128pt lets the last row scroll fully
 *  clear of the bar. Only tab screens use it (see Screen belowTabBar);
 *  stack/detail screens keep their 32pt bottom padding. */
export const TAB_BAR_CLEARANCE = 128;

export function Screen({
  title,
  subtitle,
  children,
  belowTabBar,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** True on tab screens: the floating TabBar overlays the scene, so the
   *  scroll content gets TAB_BAR_CLEARANCE of bottom padding and the last
   *  row can scroll up above the bar instead of hiding behind it. False
   *  (default) on stack/detail screens, which have no bar over them. */
  belowTabBar?: boolean;
}) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        belowTabBar
          ? [styles.screenContent, { paddingBottom: TAB_BAR_CLEARANCE }]
          : styles.screenContent
      }
      showsVerticalScrollIndicator={false}
    >
      <T variant="title">{title}</T>
      {subtitle ? (
        <T variant="body" muted style={styles.screenSubtitle}>
          {subtitle}
        </T>
      ) : null}
      <View style={styles.screenBody}>{children}</View>
    </ScrollView>
  );
}

/* ------------------------------------------------------------------ */
/*  List vocabulary shared by the screens.                             */
/*                                                                     */
/*  Lists are plain iOS rows with hairline separators, not cards: the  */
/*  conversation list, contacts, calls and pickers all read as one     */
/*  continuous list. ListCard stays only for the Settings-style        */
/*  grouped sections (Profile, contact About, group members sit in a  */
/*  plain list too). A plain row is 12pt vertical padding, no side     */
/*  padding of its own; its separator starts at the text edge —        */
/*  avatar (36) + gap (12) = 48pt inset inside a Screen, 60pt inside  */
/*  the Chats list (which adds 12pt of its own side padding).          */
/* ------------------------------------------------------------------ */

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <T variant="label" muted style={styles.sectionTitle}>
      {children}
    </T>
  );
}

export function ListCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { darkMode } = useChat();
  return (
    <Card isDark={darkMode} padding={8} style={style}>
      {children}
    </Card>
  );
}

export function RowSeparator({ inset = 48 }: { inset?: number }) {
  const { darkMode } = useChat();
  return <Separator isDark={darkMode} inset={inset} />;
}

/** A label + optional description on the left, a control on the right. */
export function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingText}>
        <T variant="body">{title}</T>
        {description ? (
          <T variant="caption" muted style={styles.settingDescription}>
            {description}
          </T>
        ) : null}
      </View>
      <View style={styles.settingControl}>{children}</View>
    </View>
  );
}

/** A tappable list row with a chevron, for menus and link lists. */
export function NavRow({
  title,
  description,
  detail,
  onPress,
}: {
  title: string;
  description?: string;
  detail?: string;
  onPress: () => void;
}) {
  const { darkMode, backdrop } = useChat();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.navRow,
        pressed && { backgroundColor: pressedFill(backdrop) },
      ]}
    >
      <View style={styles.settingText}>
        <T variant="body">{title}</T>
        {description ? (
          <T variant="caption" muted style={styles.settingDescription}>
            {description}
          </T>
        ) : null}
      </View>
      {detail ? (
        <Figure variant="caption" muted style={styles.navDetail}>
          {detail}
        </Figure>
      ) : null}
      <HugeiconsIcon icon={ChevronRightIcon} size={20} color={colors[darkMode ? "dark" : "light"].muted} />
    </Pressable>
  );
}

/** Contact avatar with a presence dot (Glacia Avatar's status prop). */
export function ContactAvatar({
  contact,
  size = "md",
}: {
  contact: Contact;
  size?: "sm" | "md" | "lg";
}) {
  const { darkMode } = useChat();
  return (
    <Avatar
      name={contact.name}
      size={size}
      status={contact.presence}
      isDark={darkMode}
      source={contact.image}
    />
  );
}

/** Group avatar, Apple Messages style: the first two members' photos
 *  overlapped inside one circle, so a group reads as people, not as a
 *  generic initials tile. */
export function GroupAvatar({ memberIds }: { memberIds: string[] }) {
  const chat = useChat();
  const first = chat.contactById(memberIds[0]);
  const second = memberIds.length > 1 ? chat.contactById(memberIds[1]) : null;
  const { darkMode } = chat;
  return (
    <View
      style={[
        styles.groupAvatar,
        { backgroundColor: colors[darkMode ? "dark" : "light"].wash },
      ]}
    >
      <View style={[styles.groupAvatarHalf, { top: 0, left: 0 }]}>
        <Avatar name={first.name} size="sm" isDark={darkMode} source={first.image} />
      </View>
      {second ? (
        <View style={[styles.groupAvatarHalf, { bottom: 0, right: 0 }]}>
          <Avatar name={second.name} size="sm" isDark={darkMode} source={second.image} />
        </View>
      ) : null}
    </View>
  );
}

/** A large round portrait for profile and call heroes — the photo is
 *  content, not a control, so it is a plain Image; if it ever fails to
 *  load it falls back to initials on the same wash, in Glacia Text. */
export function HeroPhoto({
  image,
  name,
  size = 96,
}: {
  image?: number;
  name: string;
  size?: number;
}) {
  const { darkMode } = useChat();
  const [failed, setFailed] = useState(false);
  if (image && !failed) {
    return (
      <Image
        source={image}
        onError={() => setFailed(true)}
        accessibilityLabel={`Photo of ${name}`}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors[darkMode ? "dark" : "light"].wash,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        isDark={darkMode}
        style={{ fontSize: size * 0.36, fontWeight: "600" }}
      >
        {initialsOf(name)}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  The Message family.                                                */
/*                                                                     */
/*  The published glacia-native 0.6.7 package does not export Message  */
/*  components, so the thread is composed here from Glacia primitives  */
/*  (Avatar, Text) and plain Views, keeping the classic structure:     */
/*                                                                     */
/*    Message          — the row: alignment + avatar slot              */
/*    MessageAvatar    — the sender's photo, last message of a run     */
/*    MessageBubble    — a SOLID surface, never glass: mine in the     */
/*                       accent, theirs one neutral step off the       */
/*                       backdrop (prompt §7: bubbles are not glass)   */
/*    MessageContent   — the message text                              */
/*    MessageTimestamp — the small time label, only on the last        */
/*                       message of a run (mine adds "· Sent" only    */
/*                       on the very last message of the thread)       */
/*                                                                     */
/*  Consecutive messages from one sender form a run: the avatar and    */
/*  the tail corner belong to the run's last bubble only, the sender    */
/*  name (groups) to its first, and the gap inside a run is 2pt        */
/*  against 12pt between runs — so a run reads as one thought.         */
/* ------------------------------------------------------------------ */

export function Message({
  message,
  senderName,
  senderImage,
  showSenderName,
  isFirstInRun,
  isLastInRun,
  isLastOverall,
  onLongPress,
}: {
  message: ChatMessage;
  /** Name of the sender (for the avatar + the group sender label). */
  senderName: string;
  /** Bundled portrait of the sender, if known. */
  senderImage?: number;
  /** Groups show who said what; 1:1 threads don't need it. */
  showSenderName?: boolean;
  /** First message of a consecutive same-sender run. */
  isFirstInRun: boolean;
  /** Last message of a consecutive same-sender run. */
  isLastInRun: boolean;
  /** The very last message of the whole thread. */
  isLastOverall: boolean;
  onLongPress?: () => void;
}) {
  const { darkMode, backdrop } = useChat();
  const mine = message.senderId === "me";

  return (
    <View
      style={[
        styles.messageRow,
        mine && styles.messageRowMine,
        { marginTop: isFirstInRun ? 12 : 2 },
      ]}
    >
      {/* MessageAvatar — only the run's last incoming bubble carries it;
          earlier bubbles keep the empty slot so the column stays aligned. */}
      {!mine ? (
        <View style={styles.messageAvatar}>
          {isLastInRun ? (
            <Avatar name={senderName} size="sm" isDark={darkMode} source={senderImage} />
          ) : null}
        </View>
      ) : null}

      <View style={[styles.messageColumn, mine && styles.messageColumnMine]}>
        {showSenderName && !mine && isFirstInRun ? (
          <T variant="caption" muted style={styles.messageSender}>
            {senderName}
          </T>
        ) : null}

        {/* MessageBubble + MessageContent */}
        <Pressable
          onLongPress={onLongPress}
          accessibilityRole="text"
          accessibilityLabel={`Message from ${mine ? "you" : senderName}: ${message.text}`}
          style={styles.bubblePressable}
        >
          <View
            style={[
              styles.bubble,
              {
                backgroundColor: mine
                  ? bubbleTint(backdrop)
                  : theirsBubbleFill(backdrop),
              },
              mine
                ? isLastInRun && styles.bubbleMineTail
                : isLastInRun && styles.bubbleTheirsTail,
            ]}
          >
            <Text
              isDark={darkMode}
              variant="body"
              style={mine ? styles.bubbleTextMine : undefined}
            >
              {message.text}
            </Text>
          </View>
        </Pressable>

        {/* MessageTimestamp — only the run's last bubble carries one. */}
        {isLastInRun ? (
          <Figure variant="caption" muted style={styles.messageTime}>
            {message.timeLabel}
            {mine && isLastOverall ? " · Sent" : ""}
          </Figure>
        ) : null}
      </View>
    </View>
  );
}

/** The bubble shown while the other side is typing: three quiet dots in
 *  the same solid incoming surface as a real message. */
export function TypingIndicator({
  senderName,
  senderImage,
}: {
  senderName: string;
  senderImage?: number;
}) {
  const { darkMode, backdrop } = useChat();
  const dot = { backgroundColor: secondaryInk(backdrop) };
  return (
    <View style={[styles.messageRow, { marginTop: 12 }]}>
      <View style={styles.messageAvatar}>
        <Avatar name={senderName} size="sm" isDark={darkMode} source={senderImage} />
      </View>
      <View style={styles.messageColumn}>
        <View
          style={[
            styles.bubble,
            styles.bubbleTheirsTail,
            { backgroundColor: theirsBubbleFill(backdrop) },
          ]}
        >
          <View style={styles.typingDots}>
            <View style={[styles.typingDot, dot]} />
            <View style={[styles.typingDot, dot]} />
            <View style={[styles.typingDot, dot]} />
          </View>
        </View>
      </View>
    </View>
  );
}

/** A centred day label: "Today", "Yesterday", … — quiet mono text. */
export function DaySeparator({ label }: { label: string }) {
  return (
    <View style={styles.dayRow}>
      <Figure variant="caption" muted>
        {label}
      </Figure>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  screenContent: {
    paddingHorizontal: 24,
    paddingTop: 112,
    paddingBottom: 32,
  },
  screenSubtitle: {
    marginTop: 8,
  },
  screenBody: {
    marginTop: 24,
    gap: 24,
  },
  sectionTitle: {
    marginBottom: 8,
    marginLeft: 4,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 16,
  },
  settingText: {
    flex: 1,
  },
  settingDescription: {
    marginTop: 4,
  },
  settingControl: {
    flexShrink: 0,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: 12,
  },
  navDetail: {
    flexShrink: 0,
  },
  groupAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },
  groupAvatarHalf: {
    position: "absolute",
    width: 28,
    height: 28,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 16,
  },
  messageRowMine: {
    justifyContent: "flex-end",
  },
  messageAvatar: {
    width: 28,
    alignItems: "center",
  },
  messageColumn: {
    maxWidth: "78%",
    alignItems: "flex-start",
  },
  messageColumnMine: {
    alignItems: "flex-end",
  },
  messageSender: {
    marginLeft: 4,
    marginBottom: 4,
  },
  bubblePressable: {
    borderRadius: 20,
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  bubbleMineTail: {
    borderBottomRightRadius: 8,
  },
  bubbleTheirsTail: {
    borderBottomLeftRadius: 8,
  },
  bubbleTextMine: {
    color: "#ffffff",
  },
  messageTime: {
    marginTop: 4,
    marginHorizontal: 4,
  },
  typingDots: {
    flexDirection: "row",
    gap: 4,
    paddingVertical: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.55,
  },
  dayRow: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 4,
  },
});
