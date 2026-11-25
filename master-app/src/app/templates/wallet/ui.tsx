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
  colors,
  Badge, Card, SegmentedControl, Separator, Text, type TextProps
} from "glacia-native";
import { ChevronRight } from "lucide-react-native";

import { useWallet, type Asset, type BackdropMode, type WalletTx } from "./state";

/* ------------------------------------------------------------------ */
/*  Theme tokens — one graphite/warm ramp, one deep-indigo accent.     */
/* ------------------------------------------------------------------ */

export const MONO = Platform.OS === "ios" ? "Menlo" : "monospace";

/** Deep indigo. Darker on light surfaces for contrast. */
export function accentColor(mode: BackdropMode): string {
  return mode === "light" ? "#4338ca" : "#818cf8";
}

/** Toned semantic colour for 24h change figures. */
export function changeColor(pct: number, mode: BackdropMode): string {
  if (pct > 0) return mode === "light" ? "#1e7a4c" : "#45a878";
  if (pct < 0) return mode === "light" ? "#b3402a" : "#d97762";
  return mode === "light" ? "#7b7266" : "#85858b";
}

/* ------------------------------------------------------------------ */
/*  T — Glacia Text threaded with the template's manual theme.         */
/*  Figure — the same text set in the mono figure face: every number   */
/*  in the app (balances, prices, quantities, card numbers) is mono    */
/*  and tabular, so figures line up wherever they appear.              */
/* ------------------------------------------------------------------ */

export function T({ style, ...rest }: TextProps) {
  const { darkMode } = useWallet();
  return <Text isDark={darkMode} style={style} {...rest} />;
}

export function Figure({ style, ...rest }: TextProps) {
  return (
    <T style={[{ fontFamily: MONO, fontVariant: ["tabular-nums"] }, style]} {...rest} />
  );
}

/* ------------------------------------------------------------------ */
/*  Backdrop — the three backgrounds, and nothing else.                */
/*  Dark: graphite #141415. Light: broken white #f7f4ee.               */
/*  Photo: the palm photo, full-bleed, under a neutral scrim.         */
/* ------------------------------------------------------------------ */

export function Backdrop() {
  const { backdrop } = useWallet();
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
  const { backdrop, setBackdrop, darkMode } = useWallet();
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
  title?: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      {title ? (
        <T variant="title" style={styles.screenTitle}>
          {title}
        </T>
      ) : null}
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
  const { darkMode } = useWallet();
  return (
    <Card isDark={darkMode} padding={8} style={style}>
      {children}
    </Card>
  );
}

export function RowSeparator() {
  const { darkMode } = useWallet();
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
      <View style={styles.flex}>
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
  const { darkMode } = useWallet();
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
      <View style={styles.flex}>
        <T variant="body">{title}</T>
        {description ? (
          <T variant="caption" muted style={styles.description}>
            {description}
          </T>
        ) : null}
      </View>
      {detail ? (
        <T variant="caption" muted>
          {detail}
        </T>
      ) : null}
      <ChevronRight size={18} color={darkMode ? colors.dark.muted : colors.light.muted} />
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  AssetTile — the asset's coin: a neutral disc with its symbol.      */
/*  The asset hues stay in the fixture data; they do not paint the UI. */
/* ------------------------------------------------------------------ */

export function AssetTile({ asset, size = 42 }: { asset: Asset; size?: number }) {
  const { darkMode } = useWallet();
  return (
    <View
      style={[
        styles.assetTile,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: darkMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)",
          borderColor: darkMode ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)",
        },
      ]}
    >
      <T variant="body" style={{ fontWeight: "600" }}>
        {asset.id === "usd" ? "$" : asset.id === "eur" ? "€" : asset.symbol.charAt(0)}
      </T>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  ChangeText — a signed percent in mono, toned green up, red down.   */
/* ------------------------------------------------------------------ */

export function ChangeText({ pct, style }: { pct: number; style?: TextProps["style"] }) {
  const { backdrop } = useWallet();
  const arrow = pct > 0 ? "▲" : pct < 0 ? "▼" : "•";
  return (
    <Figure variant="caption" style={[{ color: changeColor(pct, backdrop) }, style]}>
      {arrow} {Math.abs(pct).toFixed(2)}%
    </Figure>
  );
}

/* ------------------------------------------------------------------ */
/*  SparkBars — price history as a row of plain Views (glacia-native   */
/*  has no chart components; bars are the chart). Bars read in neutral */
/*  steps of the ramp; the last bar — the current price — is the       */
/*  accent.                                                            */
/* ------------------------------------------------------------------ */

export function SparkBars({
  points,
  height = 56,
  bars = 14,
}: {
  points: number[];
  height?: number;
  bars?: number;
}) {
  const { backdrop } = useWallet();
  const slice = points.slice(-bars);
  const min = Math.min(...slice);
  const max = Math.max(...slice);
  const span = max - min || 1;
  const barColor = backdrop === "light" ? "rgba(31,27,22,0.28)" : "rgba(237,237,237,0.30)";
  return (
    <View
      style={[styles.sparkRow, { height }]}
      accessibilityLabel="Price history, simulated"
    >
      {slice.map((p, i) => {
        const h = 18 + ((p - min) / span) * (height - 22);
        const last = i === slice.length - 1;
        return (
          <View
            key={i}
            style={[
              styles.sparkBar,
              { height: h, backgroundColor: last ? accentColor(backdrop) : barColor },
            ]}
          />
        );
      })}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  AssetRow — one asset on Home; taps through to its detail screen.   */
/* ------------------------------------------------------------------ */

export function AssetRow({ asset, onPress }: { asset: Asset; onPress: () => void }) {
  const wallet = useWallet();
  const balance = wallet.balanceOf(asset.id);
  const value = wallet.valueUSDOf(asset.id);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${asset.name}, ${wallet.fmtQty(asset.id, balance)}`}
      style={({ pressed }) => [
        styles.navRow,
        pressed && {
          backgroundColor: wallet.darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
        },
      ]}
    >
      <AssetTile asset={asset} />
      <View style={styles.flex}>
        <T variant="body">{asset.name}</T>
        <Figure variant="caption" muted style={styles.description}>
          {wallet.hideBalances ? "••••" : wallet.fmtQty(asset.id, balance)}
        </Figure>
      </View>
      <View style={styles.valueCol}>
        <Figure variant="body">{wallet.hideBalances ? "••••" : wallet.fmt(value)}</Figure>
        <ChangeText pct={asset.change24h} style={styles.changeAlign} />
      </View>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  TxRow — one wallet movement, used on Home and Activity.            */
/* ------------------------------------------------------------------ */

const TX_LABEL: Record<WalletTx["type"], string> = {
  buy: "Buy",
  sell: "Sell",
  swap: "Swap",
  send: "Send",
  receive: "Receive",
  topup: "Top up",
  payment: "Payment",
};

export function TxBadge({ type }: { type: WalletTx["type"] }) {
  const { darkMode } = useWallet();
  return (
    <Badge tone="muted" isDark={darkMode}>
      {TX_LABEL[type]}
    </Badge>
  );
}

export function TxRow({ tx }: { tx: WalletTx }) {
  const wallet = useWallet();
  return (
    <View style={styles.txRow}>
      <View style={styles.flex}>
        <T variant="body" numberOfLines={1}>
          {tx.title}
        </T>
        <T variant="caption" muted style={styles.description}>
          {tx.detail} · {tx.dateLabel}
        </T>
      </View>
      <View style={styles.valueCol}>
        <Figure variant="body">{wallet.hideBalances ? "••••" : tx.amountLabel}</Figure>
        <Figure variant="caption" muted style={styles.changeAlign}>
          {wallet.hideBalances ? "" : wallet.fmtSigned(tx.valueUSD)}
        </Figure>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  screenContent: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 32,
  },
  screenTitle: {},
  screenSubtitle: { marginTop: 4 },
  screenBody: { marginTop: 24, gap: 24 },
  sectionTitle: {
    marginBottom: 8,
    marginLeft: 4,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  flex: { flex: 1 },
  description: { marginTop: 4 },
  control: { flexShrink: 0 },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: 12,
  },
  assetTile: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  sparkRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  sparkBar: {
    flex: 1,
    borderRadius: 3,
    minHeight: 4,
  },
  valueCol: { alignItems: "flex-end", gap: 4 },
  changeAlign: { textAlign: "right" },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: 12,
  },
});
