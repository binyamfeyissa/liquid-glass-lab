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
  Badge,
  Card,
  IconButton,
  SegmentedControl,
  Separator,
  Stepper,
  Text,
  type TextProps,
} from "glacia-native";

import { useFood, type BackdropMode } from "./state";
import type { Restaurant } from "./data";

/* ------------------------------------------------------------------ */
/*  Theme tokens — one warm ramp, one tomato accent.                   */
/*  Figures and meta are set in mono with tabular numerals: the        */
/*  receipt is this template's signature.                              */
/* ------------------------------------------------------------------ */

export const MONO = Platform.OS === "ios" ? "Menlo" : "monospace";

/** Tomato. Deeper on light surfaces so text on it keeps contrast. */
export function accentColor(mode: BackdropMode): string {
  return mode === "light" ? "#c2371d" : "#e8705a";
}

/** Toned semantic colours, for figures that carry meaning only. */
export function positiveColor(darkMode: boolean): string {
  return darkMode ? "#4cc38a" : "#16a34a";
}

export function negativeColor(darkMode: boolean): string {
  return darkMode ? "#e5484d" : "#dc2626";
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
/*  T — Glacia Text threaded with the template's backdrop mode.        */
/* ------------------------------------------------------------------ */

export function T({ style, ...rest }: TextProps) {
  const { darkMode } = useFood();
  return <Text isDark={darkMode} style={style} {...rest} />;
}

/**
 * Meta — the signature line: price, time, rating and fee figures set in
 * mono, tabular, muted. Used under every dish and every restaurant.
 */
export function Meta({
  style,
  children,
  ...rest
}: TextProps & { children: ReactNode }) {
  return (
    <T
      variant="caption"
      muted
      style={[styles.meta, style]}
      {...rest}
    >
      {children}
    </T>
  );
}

/* ------------------------------------------------------------------ */
/*  Backdrop — the three backgrounds, and nothing else.                */
/*  Dark: graphite #141415. Light: broken white #f7f4ee.               */
/*  Photo: the Tahoe image, full-bleed, under a neutral scrim.         */
/* ------------------------------------------------------------------ */

export function Backdrop() {
  const { backdrop } = useFood();
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
  const { backdrop, setBackdrop, darkMode } = useFood();
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
  const { darkMode } = useFood();
  return (
    <Card isDark={darkMode} padding={8} style={style}>
      {children}
    </Card>
  );
}

export function RowSeparator() {
  const { darkMode } = useFood();
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
      <View style={styles.flex1}>
        <T variant="body">{title}</T>
        {description ? (
          <T variant="caption" muted style={styles.rowDescription}>
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
  const { darkMode } = useFood();
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
      <View style={styles.flex1}>
        <T variant="body">{title}</T>
        {description ? (
          <T variant="caption" muted style={styles.rowDescription}>
            {description}
          </T>
        ) : null}
      </View>
      {detail ? (
        <T variant="caption" muted style={styles.navDetail}>
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
/*  RestaurantVisual — the "photo": one flat colour field from the     */
/*  restaurant's world and its initial, set large. No image assets     */
/*  anywhere in the template.                                          */
/* ------------------------------------------------------------------ */

export function RestaurantVisual({
  restaurant,
  height = 120,
  initialSize = 52,
}: {
  restaurant: Restaurant;
  height?: number;
  initialSize?: number;
}) {
  const [base] = restaurant.colors;
  return (
    <View
      style={[styles.visual, { height, backgroundColor: base }]}
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      <T
        variant="title"
        style={[styles.visualInitial, { fontSize: initialSize }]}
      >
        {restaurant.name.charAt(0)}
      </T>
    </View>
  );
}

/** Small square version of the visual, for list rows. */
export function RestaurantThumb({ restaurant }: { restaurant: Restaurant }) {
  const [base] = restaurant.colors;
  return (
    <View style={[styles.thumb, { backgroundColor: base }]}>
      <T variant="heading" style={styles.thumbInitial}>
        {restaurant.name.charAt(0)}
      </T>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  CartButton — Glacia IconButton with a Badge count.                 */
/* ------------------------------------------------------------------ */

export function CartButton() {
  const { cartCount, darkMode } = useFood();
  return (
    <View style={styles.cartWrap}>
      <IconButton
        accessibilityLabel={
          cartCount > 0 ? `Cart, ${cartCount} items` : "Cart, empty"
        }
        onPress={() => router.push("/templates/food/cart")}
        isDark={darkMode}
        size="lg"
        icon={
          <T variant="caption" style={styles.cartLabel}>
            Cart
          </T>
        }
      />
      {cartCount > 0 ? (
        <View style={styles.cartBadge} pointerEvents="none">
          <Badge tone="fill" isDark={darkMode}>
            {String(cartCount)}
          </Badge>
        </View>
      ) : null}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  BackButton — Glacia IconButton, shared by the stack screens.       */
/* ------------------------------------------------------------------ */

export function BackButton({ label = "Back" }: { label?: string }) {
  const { darkMode } = useFood();
  return (
    <IconButton
      accessibilityLabel={label}
      onPress={() => router.back()}
      isDark={darkMode}
      size="lg"
      icon={<T variant="title">‹</T>}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  QuantityStepper — Glacia Stepper wired to the cart for one item.   */
/* ------------------------------------------------------------------ */

export function QuantityStepper({
  itemId,
  small = false,
}: {
  itemId: string;
  small?: boolean;
}) {
  const food = useFood();
  const qty = food.qtyOf(itemId);
  return (
    <Stepper
      value={qty}
      min={0}
      max={20}
      onValueChange={(v) => food.setQty(itemId, v)}
      isDark={food.darkMode}
      accessibilityLabel="Quantity"
      style={small ? styles.stepperSmall : undefined}
    />
  );
}

/** Heart toggle for a restaurant's favourite state. */
export function FavouriteButton({
  restaurantId,
  size = "md",
}: {
  restaurantId: string;
  size?: "md" | "lg";
}) {
  const food = useFood();
  const active = food.isFavourite(restaurantId);
  return (
    <IconButton
      accessibilityLabel={active ? "Remove from favourites" : "Add to favourites"}
      onPress={() => food.toggleFavourite(restaurantId)}
      isDark={food.darkMode}
      size={size}
      tint={food.darkMode ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.75)"}
      icon={
        <T
          variant={size === "lg" ? "title" : "heading"}
          style={styles.heartGlyph}
        >
          {active ? "♥" : "♡"}
        </T>
      }
    />
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  meta: {
    fontFamily: MONO,
    fontVariant: ["tabular-nums"],
  },
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
    marginLeft: 4,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  rowDescription: { marginTop: 4 },
  control: { flexShrink: 0 },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: 12,
  },
  navDetail: { flexShrink: 0 },
  visual: {
    borderRadius: 16,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  visualInitial: {
    color: "rgba(255,255,255,0.92)",
    fontWeight: "600",
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  thumbInitial: {
    color: "rgba(255,255,255,0.92)",
    fontWeight: "600",
  },
  cartWrap: { position: "relative" },
  cartLabel: { fontWeight: "600" },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
  },
  heartGlyph: { color: "#ffffff" },
  stepperSmall: { transform: [{ scale: 0.9 }] },
});
