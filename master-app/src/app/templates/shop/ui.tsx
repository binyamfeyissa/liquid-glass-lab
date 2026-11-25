import React, { type ReactNode } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { router } from "expo-router";
import {
  Badge,
  Card,
  IconButton,
  SegmentedControl,
  Separator,
  Text,
  type TextProps,
} from "glacia-native";

import { useShop, type BackdropMode, type OrderStatus } from "./state";
import { finishOf, type Product } from "./data";

/** Order status as a quiet muted badge — the word carries the meaning. */
export function statusTone(_status: OrderStatus): "muted" {
  return "muted";
}

/* ------------------------------------------------------------------ */
/*  Theme tokens — one graphite/warm ramp, one clay accent.            */
/* ------------------------------------------------------------------ */

export const MONO = Platform.OS === "ios" ? "Menlo" : "monospace";

/** Fired clay. Deeper on light surfaces for contrast. */
export function accentColor(mode: BackdropMode): string {
  return mode === "light" ? "#9e4a26" : "#d98a5f";
}

/* ------------------------------------------------------------------ */
/*  Money formatting. One format everywhere: $1,234.56.                */
/* ------------------------------------------------------------------ */

export function money(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  return `${sign}$${abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/* ------------------------------------------------------------------ */
/*  T — Glacia Text threaded with the template's manual theme.         */
/* ------------------------------------------------------------------ */

export function T({ style, ...rest }: TextProps) {
  const { darkMode } = useShop();
  return <Text isDark={darkMode} style={style} {...rest} />;
}

/* ------------------------------------------------------------------ */
/*  Figure — a money amount set as a figure: mono, tabular, so every   */
/*  price and total lines up. The shop's signature type treatment.     */
/* ------------------------------------------------------------------ */

export function Figure({
  value,
  variant = "body",
  muted,
  style,
}: {
  value: number;
  variant?: TextProps["variant"];
  muted?: boolean;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <T variant={variant} muted={muted} style={[styles.figure, style]}>
      {money(value)}
    </T>
  );
}

/* ------------------------------------------------------------------ */
/*  Backdrop — the three backgrounds, and nothing else.                */
/*  Dark: graphite #141415. Light: broken white #f7f4ee.               */
/*  Photo: the Tahoe image, full-bleed, under a neutral scrim.         */
/* ------------------------------------------------------------------ */

export function Backdrop() {
  const { backdrop } = useShop();
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
  const { backdrop, setBackdrop, darkMode } = useShop();
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
  const { darkMode } = useShop();
  return (
    <Card isDark={darkMode} padding={8} style={style}>
      {children}
    </Card>
  );
}

export function RowSeparator() {
  const { darkMode } = useShop();
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
  const { darkMode } = useShop();
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
      <T variant="heading" muted>
        ›
      </T>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  ProductVisual — the composed "photo". One flat, toned colour       */
/*  field from the finish's own world, and the product's initial set   */
/*  large. The tiles carry the colour; nothing else does.              */
/* ------------------------------------------------------------------ */

export function ProductVisual({
  product,
  finish,
  height = 120,
  radius = 16,
}: {
  product: Product;
  /** Finish name; defaults to the product's first finish. */
  finish?: string;
  height?: number;
  radius?: number;
}) {
  const { darkMode } = useShop();
  const { tone } = finishOf(product, finish ?? product.finishes[0].name);
  return (
    <View style={{ height, borderRadius: radius, overflow: "hidden", backgroundColor: tone }}>
      <View style={styles.visualCenter}>
        <Text isDark={darkMode} variant="title" style={styles.visualInitial}>
          {product.name.charAt(0)}
        </Text>
      </View>
      {product.badge && height >= 100 ? (
        <View style={styles.visualBadge}>
          <Badge tone="muted" isDark={darkMode}>
            {product.badge}
          </Badge>
        </View>
      ) : null}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  HeartButton — favourite toggle used on cards, lists and detail.    */
/*  The one place the clay accent lives in the chrome.                 */
/* ------------------------------------------------------------------ */

export function HeartButton({ productId, size = "md" }: { productId: string; size?: "sm" | "md" }) {
  const shop = useShop();
  const active = shop.isFavourite(productId);
  return (
    <IconButton
      accessibilityLabel={active ? "Remove from favourites" : "Add to favourites"}
      onPress={() => shop.toggleFavourite(productId)}
      isDark={shop.darkMode}
      size={size}
      icon={
        <T
          variant="body"
          style={active ? { color: accentColor(shop.backdrop) } : undefined}
        >
          {active ? "♥" : "♡"}
        </T>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/*  CartButton — header cart icon with the live item count.            */
/* ------------------------------------------------------------------ */

export function CartButton() {
  const shop = useShop();
  return (
    <View>
      <IconButton
        accessibilityLabel={`Cart, ${shop.cartCount} items`}
        onPress={() => router.push("/templates/shop/cart")}
        isDark={shop.darkMode}
        icon={<T variant="caption">Cart</T>}
      />
      {shop.cartCount > 0 ? (
        <View style={styles.cartCount}>
          <Badge tone="fill" isDark={shop.darkMode}>
            {`${shop.cartCount}`}
          </Badge>
        </View>
      ) : null}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Price — the price as a tabular figure, with an optional            */
/*  struck-through compare-at figure beside it.                        */
/* ------------------------------------------------------------------ */

export function Price({
  product,
  variant = "body",
}: {
  product: Product;
  variant?: TextProps["variant"];
}) {
  return (
    <View style={styles.priceRow}>
      <Figure value={product.price} variant={variant} />
      {product.compareAt ? (
        <Figure value={product.compareAt} variant="caption" muted style={styles.compareAt} />
      ) : null}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  ProductCard — the grid card used on Home, Shop and related rows.   */
/* ------------------------------------------------------------------ */

export function ProductCard({
  product,
  width,
}: {
  product: Product;
  width?: number;
}) {
  const shop = useShop();
  return (
    <Card
      isDark={shop.darkMode}
      padding={12}
      style={width ? { width } : styles.gridCard}
      onPress={() => router.push(`/templates/shop/product/${product.id}`)}
      accessibilityLabel={`${product.name}, view details`}
    >
      <ProductVisual product={product} height={112} radius={12} />
      <View style={styles.cardBody}>
        <View style={styles.cardNameRow}>
          <T variant="body" numberOfLines={2} style={styles.flex}>
            {product.name}
          </T>
          <HeartButton productId={product.id} size="sm" />
        </View>
        <T variant="caption" muted>
          {product.category} · {product.rating.toFixed(1)} ({product.reviews})
        </T>
        <Price product={product} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  screenContent: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 28,
  },
  screenSubtitle: { marginTop: 4 },
  screenBody: { marginTop: 24, gap: 24 },
  sectionTitle: {
    marginBottom: 8,
    marginLeft: 8,
  },
  flex: { flex: 1 },
  description: { marginTop: 4 },
  control: { flexShrink: 0 },
  figure: {
    fontFamily: MONO,
    fontVariant: ["tabular-nums"],
  },
  compareAt: { textDecorationLine: "line-through" },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 16,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    borderRadius: 12,
  },
  visualCenter: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  visualInitial: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 44,
    fontWeight: "600",
  },
  visualBadge: {
    position: "absolute",
    top: 8,
    left: 8,
  },
  cartCount: {
    position: "absolute",
    top: -4,
    right: -4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  gridCard: { flex: 1 },
  cardBody: { marginTop: 12, gap: 4 },
  cardNameRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
  },
});
