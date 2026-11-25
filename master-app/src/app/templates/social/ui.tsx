import React, { type ReactNode } from "react";
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
import { router } from "expo-router";
import {
  Avatar,
  Badge,
  Card,
  colors,
  IconButton,
  SegmentedControl,
  Separator,
  Text,
  type TextProps,
} from "glacia-native";
import { ChevronRight, Heart, MessageCircle, Send } from "lucide-react-native";

import { GRADIENTS, ME_ID, useSocial, type BackdropMode, type Post } from "./state";

/* ------------------------------------------------------------------ */
/*  Theme tokens — one graphite/warm ramp, one coral accent.           */
/*  The media plates carry what colour there is; the chrome is         */
/*  neutral. Coral is spent only on the live measure.                  */
/* ------------------------------------------------------------------ */

export const MONO = Platform.OS === "ios" ? "Menlo" : "monospace";

/** The one accent: coral. Darker on light surfaces for contrast. */
export function accentColor(mode: BackdropMode): string {
  return mode === "light" ? "#b8401d" : "#f07f52";
}

/** A toned red pair for the few negative figures (the over-limit count). */
export function dangerColor(mode: BackdropMode): string {
  return mode === "light" ? "#b3261e" : "#e0655a";
}

/** Pressed-row fill: a step of the template's own ramp, per mode. */
export function pressedFill(mode: BackdropMode): string {
  if (mode === "light") return "rgba(31,27,22,0.06)";
  if (mode === "image") return "rgba(255,255,255,0.10)";
  return "rgba(255,255,255,0.08)";
}

/** A raised step of the ramp (kind discs, their chat bubbles). */
export function raisedFill(mode: BackdropMode): string {
  return mode === "light" ? "#efe9df" : "#232325";
}

/** My chat bubbles carry the accent, kept quiet. */
export function bubbleTint(mode: BackdropMode): string {
  return mode === "light" ? "#b8401d" : "#9c3a26";
}

/* ------------------------------------------------------------------ */
/*  Media plates — each fixture pair averaged and mixed toward the     */
/*  mode neutral: one flat plate per post. The colour stays,           */
/*  the gradient goes.                                                 */
/* ------------------------------------------------------------------ */

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

/** The flat plate colour for a fixture gradient index, per mode. */
export function plateColor(gradient: number, mode: BackdropMode): string {
  const [c1, c2] = GRADIENTS[gradient % GRADIENTS.length];
  const neutral = mode === "light" ? "#efe9df" : "#232325";
  return mixHex(mixHex(c1, c2, 0.5), neutral, 0.55);
}

/** Ink for type set on a plate: the ramp's primary text. */
function plateInk(mode: BackdropMode): string {
  return mode === "light" ? "#1f1b16" : "#ededed";
}

/* ------------------------------------------------------------------ */
/*  T — Glacia Text threaded with the template's manual theme.         */
/*  Figure — the same, set in mono with tabular figures.               */
/* ------------------------------------------------------------------ */

export function T({ style, ...rest }: TextProps) {
  const { darkMode } = useSocial();
  return <Text isDark={darkMode} style={style} {...rest} />;
}

export function Figure({ style, ...rest }: TextProps) {
  const { darkMode } = useSocial();
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

export function compact(n: number): string {
  if (n >= 1000) {
    const v = n / 1000;
    return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, "")}k`;
  }
  return `${n}`;
}

/* ------------------------------------------------------------------ */
/*  Backdrop — the three backgrounds, and nothing else.                */
/*  Dark: graphite #141415. Light: broken white #f7f4ee.               */
/*  Photo: the palm photo, full-bleed, under a neutral scrim.         */
/* ------------------------------------------------------------------ */

export function Backdrop() {
  const { backdrop } = useSocial();
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
  const { backdrop, setBackdrop, darkMode } = useSocial();
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

export function Screen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
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
  const { darkMode } = useSocial();
  return (
    <Card isDark={darkMode} padding={8} style={style}>
      {children}
    </Card>
  );
}

export function RowSeparator() {
  const { darkMode } = useSocial();
  return <Separator isDark={darkMode} inset={16} />;
}

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
      <View style={styles.flex1}>
        <T variant="body">{title}</T>
        {description ? (
          <T variant="caption" muted style={styles.description}>
            {description}
          </T>
        ) : null}
      </View>
      <View style={styles.control}>{children}</View>
    </View>
  );
}

export function NavRow({
  title,
  description,
  detail,
  badge,
  onPress,
}: {
  title: string;
  description?: string;
  detail?: string;
  badge?: number;
  onPress: () => void;
}) {
  const { darkMode, backdrop } = useSocial();
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
      <View style={styles.flex1}>
        <T variant="body">{title}</T>
        {description ? (
          <T variant="caption" muted style={styles.description}>
            {description}
          </T>
        ) : null}
      </View>
      {badge ? (
        <Figure variant="caption" style={{ color: accentColor(backdrop) }}>
          {badge} unread
        </Figure>
      ) : null}
      {detail ? (
        <T variant="caption" muted>
          {detail}
        </T>
      ) : null}
      <ChevronRight
        size={18}
        color={darkMode ? colors.dark.muted : colors.light.muted}
      />
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  MediaTile — composed media: one flat tonal plate + a big word.     */
/*  Orbit has no photos; the plate and the word are the media.         */
/*  (Exported as GradientTile's replacement under its old name so      */
/*  the screens' imports stand.)                                       */
/* ------------------------------------------------------------------ */

export function GradientTile({
  gradient,
  label,
  height,
  radius = 20,
  fontSize,
}: {
  gradient: number;
  label: string;
  height: number;
  radius?: number;
  fontSize?: number;
}) {
  const { backdrop } = useSocial();
  return (
    <View
      style={{
        height,
        borderRadius: radius,
        overflow: "hidden",
        backgroundColor: plateColor(gradient, backdrop),
      }}
    >
      <View style={styles.tileLabelWrap}>
        <T
          variant="title"
          style={{
            color: plateInk(backdrop),
            ...(fontSize ? { fontSize, lineHeight: fontSize * 1.12 } : null),
          }}
        >
          {label}
        </T>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  StoryRing — avatar inside a flat plate-colour ring, opens the      */
/*  viewer. The ring takes the person's plate colour, toned flat.      */
/* ------------------------------------------------------------------ */

export function StoryRing({
  userId,
  size = 64,
}: {
  userId: string;
  size?: number;
}) {
  const { userById, darkMode, backdrop } = useSocial();
  const user = userById(userId);
  return (
    <Pressable
      onPress={() => router.push(`/templates/social/story/${userId}`)}
      accessibilityRole="button"
      accessibilityLabel={`${user.name}'s story`}
      style={styles.storyItem}
    >
      <View
        style={{
          width: size + 8,
          height: size + 8,
          borderRadius: (size + 8) / 2,
          borderWidth: 3,
          borderColor: plateColor(user.gradient, backdrop),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Avatar name={user.name} size="lg" isDark={darkMode} />
      </View>
      <T variant="caption" numberOfLines={1} style={styles.storyName}>
        {user.name.split(" ")[0]}
      </T>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  PostCard — the one post rendering used by Feed, Explore,           */
/*  Profile and User profile. Like toggles live; comments navigate.    */
/* ------------------------------------------------------------------ */

export function PostCard({ post, preview = false }: { post: Post; preview?: boolean }) {
  const social = useSocial();
  const author = social.userById(post.authorId);
  const liked = social.isPostLiked(post.id);
  const commentCount = social.commentsFor(post.id).length;

  const openAuthor = () => {
    if (post.authorId === ME_ID) router.push("/templates/social/(tabs)/profile");
    else router.push(`/templates/social/user/${post.authorId}`);
  };

  return (
    <Card isDark={social.darkMode} padding={16}>
      <View style={styles.postHead}>
        <Pressable
          onPress={openAuthor}
          accessibilityRole="button"
          accessibilityLabel={`${author.name}'s profile`}
        >
          <Avatar name={author.name} size="md" isDark={social.darkMode} />
        </Pressable>
        <View style={styles.flex1}>
          <T variant="body">{author.name}</T>
          <View style={styles.postMeta}>
            <T variant="caption" muted>
              {author.handle} ·
            </T>
            <Figure variant="caption" muted>
              {post.timeLabel}
            </Figure>
          </View>
        </View>
        {post.tag ? (
          <Badge tone="muted" isDark={social.darkMode}>
            #{post.tag}
          </Badge>
        ) : null}
      </View>

      <Pressable
        onPress={preview ? undefined : () => router.push(`/templates/social/post/${post.id}`)}
        accessibilityRole={preview ? undefined : "button"}
        accessibilityLabel={preview ? undefined : "Open post"}
      >
        <T variant="body" style={styles.postText}>
          {post.text}
        </T>
        {post.gradient !== null ? (
          <View style={styles.postMedia}>
            <GradientTile
              gradient={post.gradient}
              label={post.mediaLabel ?? "Orbit"}
              height={168}
              radius={8}
            />
          </View>
        ) : null}
      </Pressable>

      <View style={styles.postActions}>
        <View style={styles.actionButton}>
          <IconButton
            accessibilityLabel={liked ? "Unlike this post" : "Like this post"}
            onPress={() => social.togglePostLike(post.id)}
            isDark={social.darkMode}
            size="sm"
            icon={
              <Heart
                size={18}
                color={liked ? accentColor(social.backdrop) : social.darkMode ? colors.dark.foreground : colors.light.foreground}
                fill={liked ? accentColor(social.backdrop) : "transparent"}
              />
            }
          />
          <Figure variant="caption" muted>
            {compact(social.likeCountOf(post))}
          </Figure>
        </View>
        <View style={styles.actionButton}>
          <IconButton
            accessibilityLabel="Open comments"
            onPress={() => router.push(`/templates/social/post/${post.id}`)}
            isDark={social.darkMode}
            size="sm"
            icon={<MessageCircle size={18} color={social.darkMode ? colors.dark.foreground : colors.light.foreground} />}
          />
          <Figure variant="caption" muted>
            {commentCount}
          </Figure>
        </View>
        {post.authorId !== ME_ID ? (
          <View style={styles.actionButton}>
            <IconButton
              accessibilityLabel={`Message ${author.name}`}
              onPress={() => {
                const id = social.startConversationWith(post.authorId);
                router.push(`/templates/social/thread/${id}`);
              }}
              isDark={social.darkMode}
              size="sm"
              icon={<Send size={18} color={social.darkMode ? colors.dark.foreground : colors.light.foreground} />}
            />
            <T variant="caption" muted>
              Message
            </T>
          </View>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  screen: { flex: 1 },
  screenContent: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 32,
  },
  screenSubtitle: { marginTop: 8 },
  screenBody: { marginTop: 24, gap: 24 },
  sectionTitle: { marginBottom: 8, marginLeft: 8 },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 16,
  },
  description: { marginTop: 2 },
  control: { flexShrink: 0 },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: 12,
  },
  tileLabelWrap: {
    position: "absolute",
    left: 16,
    bottom: 16,
    right: 16,
  },
  storyItem: { alignItems: "center", gap: 8, width: 76 },
  storyName: { maxWidth: 72, textAlign: "center" },
  postHead: { flexDirection: "row", alignItems: "center", gap: 12 },
  postMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  postText: { marginTop: 12, lineHeight: 22 },
  postMedia: { marginTop: 12 },
  postActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
    marginTop: 16,
  },
  actionButton: { flexDirection: "row", alignItems: "center", gap: 8 },
});
