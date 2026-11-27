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
import { colors, Avatar, Badge, Card, SegmentedControl, Separator, Text, type TextProps } from "glacia-native";
import { ChevronRight } from "lucide-react-native";

import { RECIPIENTS, useBank, type Account, type BackdropMode, type Transaction } from "./state";

/* ------------------------------------------------------------------ */
/*  Theme tokens — one graphite/warm ramp, one deep-green accent.      */
/* ------------------------------------------------------------------ */

export const MONO = Platform.OS === "ios" ? "Menlo" : "monospace";

/** Deep statement green. Darker on light surfaces for contrast. */
export function accentColor(mode: BackdropMode): string {
  return mode === "light" ? "#17663f" : "#35a06a";
}

/* ------------------------------------------------------------------ */
/*  Money formatting + the balance-visibility mask.                    */
/*  One format everywhere: $1,234.56, tabular figures.                 */
/* ------------------------------------------------------------------ */

export function money(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  return `${sign}$${abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function signedMoney(amount: number): string {
  return amount > 0 ? `+${money(amount)}` : money(amount);
}

/** Renders an amount, or •••• while the user has balances hidden. */
export function Amount({
  value,
  variant = "body",
  positive = false,
  signed = true,
  style,
}: {
  value: number;
  variant?: TextProps["variant"];
  positive?: boolean;
  /** Movements are signed (+/-). Balances pass signed={false}. */
  signed?: boolean;
  style?: TextProps["style"];
}) {
  const { hideBalances, backdrop } = useBank();
  return (
    <T
      variant={variant}
      style={[
        { fontVariant: ["tabular-nums"] },
        positive && value > 0 ? { color: accentColor(backdrop) } : undefined,
        style,
      ]}
    >
      {hideBalances ? "••••" : signed ? signedMoney(value) : money(value)}
    </T>
  );
}

/* ------------------------------------------------------------------ */
/*  T — Glacia Text threaded with the template's backdrop mode.        */
/* ------------------------------------------------------------------ */

export function T({ style, ...rest }: TextProps) {
  const { darkMode } = useBank();
  return <Text isDark={darkMode} style={style} {...rest} />;
}

/* ------------------------------------------------------------------ */
/*  Backdrop — the three backgrounds, and nothing else.                */
/*  Dark: graphite #141415. Light: broken white #f7f4ee.               */
/*  Photo: the palm image, full-bleed, under a neutral scrim.         */
/* ------------------------------------------------------------------ */

export function Backdrop() {
  const { backdrop } = useBank();
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
  const { backdrop, setBackdrop, darkMode } = useBank();
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
/* ------------------------------------------------------------------ */

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <T variant="label" muted style={[styles.sectionTitle, styles.sectionTitleText]}>
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
  const { darkMode } = useBank();
  return (
    <Card isDark={darkMode} padding={8} style={style}>
      {children}
    </Card>
  );
}

export function RowSeparator() {
  const { darkMode } = useBank();
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
  const { darkMode } = useBank();
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
        <T
          variant="caption"
          muted
          style={[styles.navDetail, { fontVariant: ["tabular-nums"] }]}
        >
          {detail}
        </T>
      ) : null}
      <ChevronRight size={20} color={colors[darkMode ? "dark" : "light"].muted} />
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  DetailRow — one label/value pair in a grouped list (account and    */
/*  transaction detail). Plain rows, no glass panel of their own: the  */
/*  surrounding ListCard is the only glass on the screen.              */
/* ------------------------------------------------------------------ */

export function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.detailRow}>
      <T variant="body" muted style={styles.detailLabel}>
        {label}
      </T>
      <View style={styles.detailValue}>{children}</View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  AccountRow — one account in a grouped list: name and number on the */
/*  left, live balance on the right, chevron. Used on Home and on the  */
/*  Accounts tab so the two screens read as one list, not two designs. */
/* ------------------------------------------------------------------ */

export function AccountRow({
  account,
  onPress,
}: {
  account: Account;
  onPress: () => void;
}) {
  const { balanceOf, darkMode } = useBank();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${account.name}, view details`}
      style={({ pressed }) => [
        styles.accountRow,
        pressed && {
          backgroundColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
        },
      ]}
    >
      <View style={styles.settingText}>
        <T variant="body" numberOfLines={1}>
          {account.name}
        </T>
        <T variant="caption" muted style={styles.settingDescription}>
          ••{account.last4} · {account.kind}
        </T>
      </View>
      <Amount
        value={balanceOf(account.id)}
        variant="body"
        signed={false}
        style={styles.accountRowBalance}
      />
      <ChevronRight size={20} color={colors[darkMode ? "dark" : "light"].muted} />
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  TransactionRow — one movement of money, used on Home, Accounts     */
/*  and Activity. Every row leads with a Glacia Avatar: the person     */
/*  no emoji, no colour of its own.                                    */
/* ------------------------------------------------------------------ */

export function TransactionRow({
  tx,
  onPress,
}: {
  tx: Transaction;
  onPress?: () => void;
}) {
  const { darkMode } = useBank();
  const recipient = RECIPIENTS.find((r) => r.name === tx.title);
  const isPerson =
    tx.category === "Transfer" &&
    tx.amount < 0 &&
    (tx.id.startsWith("x") || recipient !== undefined);
  const body = (
    <>
      <Avatar name={isPerson ? tx.title : tx.category} size="md" isDark={darkMode} source={isPerson ? recipient?.image : undefined} />
      <View style={styles.settingText}>
        <T variant="body" numberOfLines={1}>
          {tx.title}
        </T>
        <T variant="caption" muted style={styles.settingDescription}>
          {tx.detail} · {tx.dateLabel}
        </T>
        {tx.disputed ? (
          <Badge tone="destructive" isDark={darkMode} style={styles.disputeBadge}>
            Disputed
          </Badge>
        ) : null}
      </View>
      <Amount value={tx.amount} positive style={styles.txAmount} />
    </>
  );
  if (!onPress) return <View style={styles.txRow}>{body}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${tx.title}, ${signedMoney(tx.amount)}`}
      style={({ pressed }) => [
        styles.txRow,
        pressed && {
          backgroundColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
        },
      ]}
    >
      {body}
    </Pressable>
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
  sectionTitleText: {
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 16,
  },
  detailLabel: { flexShrink: 0 },
  detailValue: { flex: 1, alignItems: "flex-end" },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: 12,
  },
  accountRowBalance: { fontVariant: ["tabular-nums"], fontWeight: "600" },
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
  txAmount: { fontWeight: "600" },
  disputeBadge: {
    marginTop: 4,
  },
});
