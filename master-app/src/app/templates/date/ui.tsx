import React, { type ReactNode } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import {
  Avatar,
  Card,
  Chip,
  Glass,
  SegmentedControl,
  Separator,
  Text,
  type TextProps,
} from "glacia-native";

import {
  useKindred,
  type BackdropMode,
  type ChatMessage,
  type Profile,
} from "./state";

/* ------------------------------------------------------------------ */
/*  Type + colour helpers — one warm ramp, one warm-red accent.        */
/* ------------------------------------------------------------------ */

export const MONO = Platform.OS === "ios" ? "Menlo" : "monospace";
export const SERIF = Platform.OS === "ios" ? "Georgia" : "serif";

/** The one accent: a warm red, darker on light surfaces for contrast. */
export function accentColor(mode: BackdropMode): string {
  return mode === "light" ? "#b3372a" : "#e0684f";
}

/** The wash on my chat bubbles — the same red, kept quiet. */
function bubbleTint(mode: BackdropMode): string {
  return mode === "light" ? "#c0452f" : "#9c3a26";
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) =>
    Math.round(Math.max(0, Math.min(255, v)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Mix `hex` toward `target` by `amount` (0 = hex, 1 = target). */
export function mixHex(hex: string, target: string, amount: number): string {
  const [r1, g1, b1] = hexToRgb(hex);
  const [r2, g2, b2] = hexToRgb(target);
  return rgbToHex(
    r1 + (r2 - r1) * amount,
    g1 + (g2 - g1) * amount,
    b1 + (b2 - b1) * amount,
  );
}

function avgHex(a: string, b: string): string {
  return mixHex(a, b, 0.5);
}

/* ------------------------------------------------------------------ */
/*  T — Glacia Text threaded with the template's manual theme.         */
/*  Figure — the same, set in mono with tabular figures.               */
/* ------------------------------------------------------------------ */

export function T({ style, ...rest }: TextProps) {
  const { darkMode } = useKindred();
  return <Text isDark={darkMode} style={style} {...rest} />;
}

export function Figure({ style, ...rest }: TextProps) {
  const { darkMode } = useKindred();
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
  const { backdrop } = useKindred();
  if (backdrop === "image") {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Image
          source={require("./assets/tahoe-dark.jpg")}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(0,0,0,0.38)" },
          ]}
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
  const { backdrop, setBackdrop, darkMode } = useKindred();
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
      <T variant="title" style={styles.screenTitle}>
        {title}
      </T>
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
  const { darkMode } = useKindred();
  return (
    <Card isDark={darkMode} padding={8} style={style}>
      {children}
    </Card>
  );
}

export function RowSeparator() {
  const { darkMode } = useKindred();
  return <Separator isDark={darkMode} inset={16} />;
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

/* ------------------------------------------------------------------ */
/*  PhotoPanel — the composed "photo": one flat tonal plate with the   */
/*  person's initials. The fixture pair is averaged and mixed toward   */
/*  the mode neutral, so the plate sits in the room, not on it.        */
/*  No images of real people.                                          */
/* ------------------------------------------------------------------ */

export function PhotoPanel({
  profile,
  height = 340,
  children,
}: {
  profile: Pick<Profile, "name" | "colors" | "image">;
  height?: number;
  children?: ReactNode;
}) {
  const { backdrop, darkMode } = useKindred();
  const [c1, c2] = profile.colors;
  const neutral = backdrop === "light" ? "#efe9df" : "#26211f";
  const plate = mixHex(avgHex(c1, c2), neutral, 0.55);
  const initials = profile.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <View style={[styles.photo, { height, backgroundColor: plate }]}>
      {profile.image ? (
        <Image
          source={profile.image}
          resizeMode="cover"
          style={[StyleSheet.absoluteFill, { width: "100%", height: "100%" }]}
        />
      ) : (
        <View style={styles.photoCenter}>
          <Text
            variant="title"
            isDark={darkMode}
            style={{
              fontFamily: SERIF,
              fontSize: 72,
              letterSpacing: 0,
              color: backdrop === "light" ? "#3a332c" : "#f5efe6",
            }}
          >
            {initials}
          </Text>
        </View>
      )}
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  InterestChips — a wrapping row of read-only interest pills.        */
/* ------------------------------------------------------------------ */

export function InterestChips({ interests }: { interests: string[] }) {
  const { darkMode } = useKindred();
  return (
    <View style={styles.chipRow}>
      {interests.map((interest) => (
        <Chip key={interest} label={interest} isDark={darkMode} />
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  ProfileFacts — the signature: a person's facts as a clean ruled    */
/*  list. Label on the left, value on the right, hairlines between.    */
/* ------------------------------------------------------------------ */

export function ProfileFacts({
  profile,
  distanceText,
}: {
  profile: Profile;
  /** Overrides the distance value — used for your own card preview. */
  distanceText?: string;
}) {
  const { darkMode } = useKindred();
  return (
    <View>
      <Separator isDark={darkMode} />
      <View style={styles.factRow}>
        <T variant="caption" muted>
          Job
        </T>
        <T variant="body">{profile.job}</T>
      </View>
      <Separator isDark={darkMode} />
      <View style={styles.factRow}>
        <T variant="caption" muted>
          Distance
        </T>
        {distanceText ? (
          <T variant="body">{distanceText}</T>
        ) : (
          <Figure variant="body">{profile.distanceKm} km</Figure>
        )}
      </View>
      <Separator isDark={darkMode} />
      <View style={styles.factRow}>
        <T variant="caption" muted>
          Interests
        </T>
        <Figure variant="body">{profile.interests.length}</Figure>
      </View>
      <Separator isDark={darkMode} />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  ProfileCard — the full Discover/profile-preview card.              */
/* ------------------------------------------------------------------ */

export function ProfileCardView({
  profile,
  photoHeight = 320,
  distanceText,
}: {
  profile: Profile;
  photoHeight?: number;
  /** Overrides the distance line — used for your own card preview. */
  distanceText?: string;
}) {
  const { darkMode } = useKindred();
  return (
    <Card isDark={darkMode} padding={0} style={styles.profileCard}>
      <PhotoPanel profile={profile} height={photoHeight} />
      <View style={styles.profileBody}>
        <View style={styles.profileNameRow}>
          <T variant="title">{profile.name}</T>
          <Figure variant="title" muted>
            {profile.age}
          </Figure>
        </View>
        <T variant="body" style={styles.profileBio}>
          {profile.bio}
        </T>
        <ProfileFacts profile={profile} distanceText={distanceText} />
        <InterestChips interests={profile.interests} />
      </View>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  MessageBubble — glacia-native has no Message family, so chat       */
/*  bubbles are composed locally from the Glass primitive, the way     */
/*  the Chat template does it. Mine wear the warm-red tint, quietly,   */
/*  theirs stay neutral. Times are mono and muted.                     */
/* ------------------------------------------------------------------ */

export function MessageBubble({
  message,
  senderName,
  senderImage,
}: {
  message: ChatMessage;
  senderName: string;
  /** Bundled portrait of the sender, if known. */
  senderImage?: number;
}) {
  const { darkMode, backdrop } = useKindred();
  const mine = message.senderId === "me";
  return (
    <View style={[styles.messageRow, mine && styles.messageRowMine]}>
      {!mine ? (
        <View style={styles.messageAvatar}>
          <Avatar name={senderName} size="sm" isDark={darkMode} source={senderImage} />
        </View>
      ) : null}
      <View style={[styles.messageColumn, mine && styles.messageColumnMine]}>
        <Glass
          isDark={darkMode}
          tintColor={mine ? bubbleTint(backdrop) : undefined}
          style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}
        >
          <Text
            isDark={darkMode}
            variant="body"
            style={mine ? styles.bubbleTextMine : undefined}
          >
            {message.text}
          </Text>
        </Glass>
        <Figure variant="caption" muted style={styles.messageTime}>
          {message.timeLabel}
          {mine ? " · Sent" : ""}
        </Figure>
      </View>
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
  screenTitle: {
    letterSpacing: 0,
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
  photo: {
    overflow: "hidden",
    justifyContent: "center",
  },
  photoCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  profileCard: {
    overflow: "hidden",
  },
  profileBody: {
    padding: 20,
    gap: 12,
  },
  profileNameRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  profileBio: {
    lineHeight: 22,
  },
  factRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    paddingVertical: 8,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 16,
  },
  messageRowMine: {
    justifyContent: "flex-end",
  },
  messageAvatar: {
    marginBottom: 20,
  },
  messageColumn: {
    maxWidth: "78%",
    alignItems: "flex-start",
  },
  messageColumnMine: {
    alignItems: "flex-end",
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleMine: {
    borderBottomRightRadius: 6,
  },
  bubbleTheirs: {
    borderBottomLeftRadius: 6,
  },
  bubbleTextMine: {
    color: "#ffffff",
  },
  messageTime: {
    marginTop: 4,
    marginHorizontal: 4,
    fontSize: 11,
  },
});
