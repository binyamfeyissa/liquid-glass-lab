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
import {
  Avatar,
  Card,
  Progress,
  SegmentedControl,
  Separator,
  Text,
  type TextProps,
} from "glacia-native";

import {
  FIXTURE_TODAY,
  useTally,
  type BackdropMode,
  type Category,
  type Transaction,
} from "./state";

/* ------------------------------------------------------------------ */
/*  Date labels, pinned to the fixture calendar (November 2026).       */
/* ------------------------------------------------------------------ */

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDay(iso: string): Date {
  // Noon UTC keeps the calendar day stable in every timezone.
  return new Date(`${iso}T12:00:00Z`);
}

export function dayLabel(iso: string): string {
  const diff = Math.round(
    (parseDay(FIXTURE_TODAY).getTime() - parseDay(iso).getTime()) / DAY_MS,
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return parseDay(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function fullDateLabel(iso: string): string {
  return parseDay(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** Shift an ISO day by a number of days, staying on the fixture calendar. */
export function shiftDay(iso: string, days: number): string {
  const d = parseDay(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/* ------------------------------------------------------------------ */
/*  T — Glacia Text threaded with the template's manual theme.         */
/* ------------------------------------------------------------------ */

export function T({ style, ...rest }: TextProps) {
  const { darkMode } = useTally();
  return <Text isDark={darkMode} style={style} {...rest} />;
}

/* ------------------------------------------------------------------ */
/*  Figure — every amount in the ledger face: mono, tabular.           */
/* ------------------------------------------------------------------ */

const MONO = Platform.OS === "ios" ? "Menlo" : "monospace";

export function Figure({ style, ...rest }: TextProps) {
  const { darkMode } = useTally();
  return <Text isDark={darkMode} style={[styles.figure, style]} {...rest} />;
}

/* ------------------------------------------------------------------ */
/*  Palette — one teal accent (ledger ink), one toned red.             */
/* ------------------------------------------------------------------ */

export function usePalette() {
  const { darkMode } = useTally();
  return darkMode
    ? { accent: "#3cab9b", danger: "#d97762" }
    : { accent: "#0e6e62", danger: "#b3402a" };
}

/* ------------------------------------------------------------------ */
/*  Backdrop — the only three backgrounds: graphite, broken white,     */
/*  or the owner's Tahoe photo under a neutral scrim.                  */
/* ------------------------------------------------------------------ */

export function Backdrop() {
  const { backdrop } = useTally();
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
  const { backdrop, setBackdrop, darkMode } = useTally();
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
  const { darkMode } = useTally();
  return (
    <Card isDark={darkMode} padding={8} style={style}>
      {children}
    </Card>
  );
}

export function RowSeparator() {
  const { darkMode } = useTally();
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
  const { darkMode } = useTally();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.navRow,
        pressed && {
          backgroundColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
        },
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
      <T variant="heading" muted>
        ›
      </T>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  TransactionRow — one movement of money, used on Home and History.  */
/*  The category monogram is the mark; the amount is the ledger        */
/*  column, mono and right-aligned.                                    */
/* ------------------------------------------------------------------ */

export function TransactionRow({ tx }: { tx: Transaction }) {
  const tally = useTally();
  const palette = usePalette();
  return (
    <View style={styles.txRow}>
      <Avatar name={tx.category} size="md" isDark={tally.darkMode} />
      <View style={styles.settingText}>
        <T variant="body" numberOfLines={1}>
          {tx.title}
        </T>
        <T variant="caption" muted style={styles.settingDescription}>
          {tx.category} · {dayLabel(tx.date)}
        </T>
        {tx.note ? (
          <T variant="caption" muted style={styles.settingDescription}>
            {tx.note}
          </T>
        ) : null}
      </View>
      <Figure
        variant="body"
        style={tx.amount > 0 ? { color: palette.accent } : undefined}
      >
        {tally.formatSigned(tx.amount)}
      </Figure>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  CategoryBar — label, amount and a relative Progress bar.           */
/* ------------------------------------------------------------------ */

export function CategoryBar({
  category,
  amount,
  max,
  caption,
}: {
  category: Category;
  amount: number;
  /** The largest bar in the group; this bar scales against it. */
  max: number;
  caption?: string;
}) {
  const tally = useTally();
  const palette = usePalette();
  return (
    <View style={styles.barRow}>
      <View style={styles.barHead}>
        <T variant="body">{category}</T>
        <Figure variant="body" muted>
          {caption ?? tally.format(amount)}
        </Figure>
      </View>
      <Progress
        value={max > 0 ? Math.round((amount / max) * 100) : 0}
        isDark={tally.darkMode}
        tint={palette.accent}
        accessibilityLabel={`${category} spending`}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  WeekBars — weekly totals as plain Views (the package has no        */
/*  charts). Heights are relative to the biggest week; the biggest     */
/*  week carries the accent, the rest are neutral steps.               */
/* ------------------------------------------------------------------ */

export function WeekBars({
  weeks,
}: {
  weeks: { label: string; amount: number }[];
}) {
  const tally = useTally();
  const palette = usePalette();
  const max = Math.max(...weeks.map((w) => w.amount), 0);
  return (
    <View style={styles.weekBars}>
      {weeks.map((w) => (
        <View key={w.label} style={styles.weekCol}>
          <Figure variant="caption" muted>
            {w.amount > 0 ? tally.format(w.amount) : "—"}
          </Figure>
          <View
            style={[
              styles.weekBar,
              {
                height: max > 0 ? Math.max(6, Math.round((w.amount / max) * 96)) : 6,
                backgroundColor:
                  w.amount === max && max > 0
                    ? palette.accent
                    : tally.darkMode
                      ? "rgba(237,237,237,0.28)"
                      : "rgba(31,27,22,0.22)",
              },
            ]}
          />
          <T variant="caption" muted>
            {w.label}
          </T>
        </View>
      ))}
    </View>
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
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: 12,
  },
  barRow: {
    gap: 8,
  },
  barHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  weekBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    paddingHorizontal: 4,
  },
  weekCol: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  weekBar: {
    width: "70%",
    borderRadius: 6,
  },
});
