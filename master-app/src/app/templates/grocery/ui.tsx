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
  Badge,
  Button,
  Card,
  IconButton,
  SegmentedControl,
  Separator,
  Stepper,
  Text,
  type TextProps,
} from "glacia-native";
import { ChevronRight, Heart } from "lucide-react-native";

import { useBasket, type BackdropMode } from "./state";
import type { Product } from "./data";

/* ------------------------------------------------------------------ */
/*  Theme tokens — one graphite/warm ramp, one leaf-green accent.      */
/* ------------------------------------------------------------------ */

export const MONO = Platform.OS === "ios" ? "Menlo" : "monospace";

/** Leaf green. Darker on light surfaces for contrast. */
export function accentColor(mode: BackdropMode): string {
  return mode === "light" ? "#2f7a3d" : "#63ab72";
}

/** Chrome surfaces per mode, for the pieces Glacia does not style. */
export function chromeColors(mode: BackdropMode) {
  return mode === "light"
    ? {
        fill: "rgba(0,0,0,0.05)",
        pressed: "rgba(0,0,0,0.08)",
        bar: "#efe9df",
      }
    : {
        fill: "rgba(255,255,255,0.08)",
        pressed: "rgba(255,255,255,0.12)",
        bar: "#232325",
      };
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
/*  Figure — the same, in mono with tabular figures. Every price,      */
/*  total and nutrition value on screen is a Figure.                   */
/* ------------------------------------------------------------------ */

export function T({ style, ...rest }: TextProps) {
  const { darkMode } = useBasket();
  return <Text isDark={darkMode} style={style} {...rest} />;
}

export function Figure({
  style,
  ...rest
}: TextProps) {
  const { darkMode } = useBasket();
  return (
    <Text
      isDark={darkMode}
      style={{ fontFamily: MONO, fontVariant: ["tabular-nums"], ...(style as object) }}
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
  const { backdrop } = useBasket();
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
  const { backdrop, setBackdrop, darkMode } = useBasket();
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
  const { darkMode } = useBasket();
  return (
    <Card isDark={darkMode} padding={8} style={style}>
      {children}
    </Card>
  );
}

export function RowSeparator() {
  const { darkMode } = useBasket();
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
  const { darkMode, backdrop } = useBasket();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.navRow,
        pressed && { backgroundColor: chromeColors(backdrop).pressed },
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
        <Figure variant="caption" muted style={styles.navDetail}>
          {detail}
        </Figure>
      ) : null}
      <ChevronRight size={20} color={colors[darkMode ? "dark" : "light"].muted} />
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  ProductVisual — the composed "photo": one flat tonal plate mixed   */
/*  from the product's hue pair toward the mode neutral, and its       */
/*  initial set large. No gradients, no images.                        */
/* ------------------------------------------------------------------ */

function mixHex(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const mixed = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `#${mixed.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** The flat plate colour for a hue pair in the current mode. */
export function plateColor(hue: [string, string], dark: boolean): string {
  const averaged = mixHex(hue[0], hue[1], 0.5);
  return mixHex(averaged, dark ? "#232325" : "#efe9df", 0.55);
}

export function ProductVisual({
  product,
  height = 110,
  radius = 14,
  fontSize = 34,
}: {
  product: Product;
  height?: number;
  radius?: number;
  fontSize?: number;
}) {
  const { darkMode } = useBasket();
  return (
    <View
      style={{
        height,
        borderRadius: radius,
        overflow: "hidden",
        backgroundColor: plateColor(product.hue, darkMode),
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        isDark={darkMode}
        variant="title"
        style={{
          fontSize,
          color: darkMode ? "rgba(237,237,237,0.92)" : "rgba(31,27,22,0.85)",
        }}
      >
        {product.name.charAt(0)}
      </Text>
      {product.badge ? (
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
/*  HeartButton — favourite toggle used on rows, cards and detail.     */
/* ------------------------------------------------------------------ */

export function HeartButton({
  productId,
  size = "md",
}: {
  productId: string;
  size?: "sm" | "md";
}) {
  const basket = useBasket();
  const active = basket.isFavourite(productId);
  return (
    <IconButton
      accessibilityLabel={active ? "Remove from favourites" : "Add to favourites"}
      onPress={() => basket.toggleFavourite(productId)}
      isDark={basket.darkMode}
      size={size}
      icon={
        <Heart
          size={16}
          color={active ? accentColor(basket.backdrop) : colors[basket.darkMode ? "dark" : "light"].foreground}
          fill={active ? accentColor(basket.backdrop) : "none"}
        />
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/*  AddControl — an "Add" button that becomes a quantity Stepper       */
/*  once the product is in the cart. Quantities are whole units.       */
/* ------------------------------------------------------------------ */

export function AddControl({ product }: { product: Product }) {
  const basket = useBasket();
  const qty = basket.qtyOf(product.id);
  if (qty === 0) {
    return (
      <Button
        isDark={basket.darkMode}
        accessibilityLabel={`Add ${product.name} to cart`}
        variant="filled"
        size="sm"
        onPress={() => basket.addToCart(product.id)}
      >
        Add
      </Button>
    );
  }
  return (
    <Stepper
      accessibilityLabel={`Quantity of ${product.name}`}
      value={qty}
      min={0}
      max={99}
      height={34}
      isDark={basket.darkMode}
      onValueChange={(value) => basket.setQty(product.id, value)}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  ProductRow — the workhorse grocery row: thumb, name, unit price    */
/*  and the add control. Tapping opens the product detail.             */
/* ------------------------------------------------------------------ */

export function ProductRow({ product }: { product: Product }) {
  const basket = useBasket();
  return (
    <View style={styles.productRow}>
      <Pressable
        onPress={() => router.push(`/templates/grocery/product/${product.id}`)}
        accessibilityRole="button"
        accessibilityLabel={`View ${product.name}`}
        style={styles.productMain}
      >
        <View style={styles.thumb}>
          <ProductVisual product={product} height={64} radius={12} fontSize={26} />
        </View>
        <View style={styles.flex}>
          <T variant="body" numberOfLines={1}>
            {product.name}
          </T>
          <T variant="caption" muted style={styles.description}>
            {product.detail}
          </T>
          <View style={styles.priceLine}>
            {product.compareAt ? (
              <Figure variant="caption" muted style={styles.strike}>
                {money(product.compareAt)}
              </Figure>
            ) : null}
            <Figure variant="body">{money(product.price)}</Figure>
            <T variant="caption" muted>
              / {product.unit}
            </T>
          </View>
        </View>
      </Pressable>
      <View style={styles.rowActions}>
        <HeartButton productId={product.id} size="sm" />
        <AddControl product={product} />
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  CartButton — header basket with the live item count.               */
/* ------------------------------------------------------------------ */

export function CartButton() {
  const basket = useBasket();
  return (
    <View>
      <IconButton
        accessibilityLabel={`Cart, ${basket.cartCount} items`}
        onPress={() => router.push("/templates/grocery/cart")}
        isDark={basket.darkMode}
        size="lg"
        icon={<T variant="body">Cart</T>}
      />
      {basket.cartCount > 0 ? (
        <View
          style={{
            ...styles.cartBadge,
            backgroundColor: accentColor(basket.backdrop),
          }}
        >
          <Text
            variant="caption"
            style={{
              fontFamily: MONO,
              fontVariant: ["tabular-nums"],
              color: basket.backdrop === "light" ? "#ffffff" : "#0f0f10",
            }}
          >
            {basket.cartCount}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/** Floating cart summary bar shown over Home when the cart has items. */
export function CartBar() {
  const basket = useBasket();
  if (basket.cartCount === 0) return null;
  return (
    <View style={styles.cartBarWrap}>
      <Pressable
        onPress={() => router.push("/templates/grocery/cart")}
        accessibilityRole="button"
        accessibilityLabel={`View cart, ${basket.cartCount} items, ${money(basket.cartSubtotal)}`}
        style={{
          ...styles.cartBar,
          backgroundColor: chromeColors(basket.backdrop).bar,
        }}
      >
        <Figure variant="body">
          {basket.cartCount} {basket.cartCount === 1 ? "item" : "items"} ·{" "}
          {money(basket.cartSubtotal)}
        </Figure>
        <T variant="body" style={{ color: accentColor(basket.backdrop) }}>
          View cart
        </T>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  screenContent: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 96,
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
    marginLeft: 8,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 16,
  },
  description: {
    marginTop: 2,
  },
  control: {
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
  visualBadge: {
    position: "absolute",
    top: 8,
    left: 8,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
  },
  productMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  thumb: {
    width: 64,
    flexShrink: 0,
  },
  priceLine: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginTop: 4,
  },
  strike: {
    textDecorationLine: "line-through",
  },
  rowActions: {
    alignItems: "flex-end",
    gap: 4,
    flexShrink: 0,
  },
  cartBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBarWrap: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 14,
  },
  cartBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
