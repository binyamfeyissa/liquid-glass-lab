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
  colors,
  Card,
  IconButton,
  SegmentedControl,
  Separator,
  Text,
  type TextProps,
} from "glacia-native";
import { Bookmark, ChevronRight } from "lucide-react-native";

import { useJobs, type ApplicationStatus, type BackdropMode } from "./state";
import {
  companyInitials,
  matchScore,
  postedLabel,
  salaryLabel,
  type Job,
} from "./data";

export const MONO = Platform.OS === "ios" ? "Menlo" : "monospace";

/* ------------------------------------------------------------------ */
/*  Chrome colours — one ramp per mode, one navy accent.               */
/*  The accent is ledger ink: #1e4a7a on broken white, #82a8d8 on      */
/*  graphite and photo. State colours are toned pairs, nothing neon.   */
/* ------------------------------------------------------------------ */

export function chromeColors(mode: BackdropMode) {
  const light = mode === "light";
  return {
    accent: light ? "#1e4a7a" : "#82a8d8",
    pos: light ? "#177245" : "#3fae7c",
    neg: light ? "#b3261e" : "#e0655a",
    neutral: light ? "#a89f8d" : "#55555a",
    hairline: light ? "rgba(31,27,22,0.10)" : "rgba(237,237,237,0.10)",
    fill: light ? "rgba(31,27,22,0.05)" : "rgba(237,237,237,0.07)",
    pressed: light ? "rgba(31,27,22,0.06)" : "rgba(237,237,237,0.08)",
    tile: light ? "#efe9df" : "#232325",
  };
}

export function accentColor(mode: BackdropMode): string {
  return chromeColors(mode).accent;
}

/* ------------------------------------------------------------------ */
/*  T — Glacia Text threaded with the template's manual theme.         */
/* ------------------------------------------------------------------ */

export function T({ style, ...rest }: TextProps) {
  const { darkMode } = useJobs();
  return <Text isDark={darkMode} style={style} {...rest} />;
}

/* ------------------------------------------------------------------ */
/*  Figure — every figure in the mono face: salary, applicants,        */
/*  posted days, counts, and the match percent that signs each card.   */
/* ------------------------------------------------------------------ */

export function Figure({ style, ...rest }: TextProps) {
  const { darkMode } = useJobs();
  return <Text isDark={darkMode} style={[styles.figure, style]} {...rest} />;
}

/* ------------------------------------------------------------------ */
/*  Backdrop — the three backgrounds, and nothing else.                */
/*  Dark: graphite #141415. Light: broken white #f7f4ee.               */
/*  Photo: the palm image, full-bleed, under a neutral scrim.         */
/* ------------------------------------------------------------------ */

export function Backdrop() {
  const { backdrop } = useJobs();
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
  const { backdrop, setBackdrop, darkMode } = useJobs();
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
  const { darkMode } = useJobs();
  return (
    <Card isDark={darkMode} padding={8} style={style}>
      {children}
    </Card>
  );
}

export function RowSeparator() {
  const { darkMode } = useJobs();
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
  const { backdrop, darkMode } = useJobs();
  const chrome = chromeColors(backdrop);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.navRow,
        pressed && { backgroundColor: chrome.pressed },
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
      <ChevronRight size={20} color={colors[darkMode ? "dark" : "light"].muted} />
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  Job vocabulary: company tile, match figure, status, JobCard.       */
/* ------------------------------------------------------------------ */

/** Composed company mark: the company's initials on a neutral tile. */
export function CompanyTile({ company, size = 46 }: { company: string; size?: number }) {
  const { backdrop } = useJobs();
  const chrome = chromeColors(backdrop);
  return (
    <View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderRadius: Math.max(8, Math.round(size * 0.25)),
          backgroundColor: chrome.tile,
          borderColor: chrome.hairline,
        },
      ]}
    >
      <T variant="heading" style={{ fontSize: size * 0.36 }}>
        {companyInitials(company)}
      </T>
    </View>
  );
}

/**
 * The signature figure: the match score as a quiet mono percent.
 * Scores of 75 and up take the navy accent; the rest stay muted.
 */
export function MatchScore({ job }: { job: Job }) {
  const { profile, backdrop } = useJobs();
  const chrome = chromeColors(backdrop);
  const score = matchScore(job, profile.skills);
  const strong = score >= 75;
  return (
    <Figure
      variant="caption"
      muted={!strong}
      style={strong ? { color: chrome.accent } : undefined}
    >
      {score}% match
    </Figure>
  );
}

/** Application status as a quiet word with a small toned dot. */
export function StatusText({ status }: { status: ApplicationStatus }) {
  const { backdrop } = useJobs();
  const chrome = chromeColors(backdrop);
  const dot =
    status === "Offer"
      ? chrome.pos
      : status === "Closed"
        ? chrome.neg
        : status === "Interview"
          ? chrome.accent
          : chrome.neutral;
  return (
    <View style={styles.statusRow}>
      <View style={[styles.statusDot, { backgroundColor: dot }]} />
      <T variant="caption">{status}</T>
    </View>
  );
}

/**
 * One job listing. Used on Home, Search and Saved. The bookmark button
 * toggles the saved set in the store; tapping the card opens the detail.
 */
export function JobCard({ job, showMatch = true }: { job: Job; showMatch?: boolean }) {
  const jobs = useJobs();
  const chrome = chromeColors(jobs.backdrop);
  const saved = jobs.isSaved(job.id);
  const applied = !!jobs.applicationFor(job.id);
  return (
    <Card
      isDark={jobs.darkMode}
      padding={16}
      onPress={() => router.push(`/templates/jobs/job/${job.id}`)}
      accessibilityLabel={`${job.title} at ${job.company}`}
      style={styles.jobCard}
    >
      <View style={styles.jobHead}>
        <CompanyTile company={job.company} />
        <View style={styles.settingText}>
          <T variant="body" numberOfLines={2} style={styles.jobTitle}>
            {job.title}
          </T>
          <T variant="caption" muted style={styles.settingDescription}>
            {job.company} · {job.location}
          </T>
        </View>
        <IconButton
          accessibilityLabel={saved ? `Remove ${job.title} from saved` : `Save ${job.title}`}
          onPress={() => jobs.toggleSaved(job.id)}
          isDark={jobs.darkMode}
          icon={
            <Bookmark
              size={16}
              color={saved ? chrome.accent : colors[jobs.darkMode ? "dark" : "light"].foreground}
              fill={saved ? chrome.accent : "none"}
            />
          }
        />
      </View>
      <View style={styles.metaRow}>
        <T variant="caption" muted>
          {job.type} · {job.mode}
          {applied ? (
            <T variant="caption" style={{ color: chrome.pos }}>
              {" · Applied"}
            </T>
          ) : null}
        </T>
        {showMatch ? <MatchScore job={job} /> : null}
      </View>
      <View style={styles.jobFoot}>
        <Figure variant="body" numberOfLines={1}>
          {salaryLabel(job)}
        </Figure>
        <Figure variant="caption" muted>
          {postedLabel(job)} · {job.applicants} applicants
        </Figure>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  figure: {
    fontFamily: MONO,
    fontVariant: ["tabular-nums"],
  },
  screen: {
    flex: 1,
  },
  screenContent: {
    paddingHorizontal: 24,
    paddingTop: 64,
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
  tile: {
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderWidth: 1,
  },
  jobCard: {
    gap: 12,
  },
  jobHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  jobTitle: {
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  jobFoot: {
    gap: 4,
  },
});
