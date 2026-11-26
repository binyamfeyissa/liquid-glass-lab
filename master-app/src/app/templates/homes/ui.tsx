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
import Svg, { Circle, Rect } from "react-native-svg";
import {
  colors,
  Avatar,
  Badge,
  Card,
  IconButton,
  SegmentedControl,
  Separator,
  Text,
  type TextProps,
} from "glacia-native";
import { Bookmark, ChevronLeft, ChevronRight } from "lucide-react-native";
import { router } from "expo-router";

import { useHomes, type BackdropMode } from "./state";
import { agentOf, money, type Property } from "./data";

/* ------------------------------------------------------------------ */
/*  Theme tokens — one graphite/warm ramp, one bronze accent.          */
/*  Serif carries house names like the heading on a set of             */
/*  particulars; mono carries every figure (price, area, payment).     */
/* ------------------------------------------------------------------ */

export const MONO = Platform.OS === "ios" ? "Menlo" : "monospace";
export const SERIF = Platform.OS === "ios" ? "Georgia" : "serif";

/** Bronze — a brass door plate. Darker on light surfaces for contrast. */
export function accentColor(mode: BackdropMode): string {
  return mode === "light" ? "#96622a" : "#cf9a58";
}

/** Toned red for errors, per mode. */
export function errorColor(mode: BackdropMode): string {
  return mode === "light" ? "#b3261e" : "#e0655a";
}

function pageNeutral(mode: BackdropMode): string {
  return mode === "light" ? "#f7f4ee" : "#141415";
}

function inkTone(mode: BackdropMode): string {
  return mode === "light" ? "#292420" : "#101012";
}

function paperTone(mode: BackdropMode): string {
  return mode === "light" ? "#fdfbf7" : "#ededed";
}

export function mixHex(hex: string, target: string, amount: number): string {
  const parse = (h: string): [number, number, number] => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const [r1, g1, b1] = parse(hex);
  const [r2, g2, b2] = parse(target);
  const mix = (a: number, b: number) => Math.round(a + (b - a) * amount);
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(mix(r1, r2))}${toHex(mix(g1, g2))}${toHex(mix(b1, b2))}`;
}

/* ------------------------------------------------------------------ */
/*  T — Glacia Text threaded with the template's backdrop mode.        */
/*  Figure — the same text in mono with tabular figures.               */
/*  Serif — the same text in the particulars serif.                    */
/* ------------------------------------------------------------------ */

export function T({ style, ...rest }: TextProps) {
  const { darkMode } = useHomes();
  return <Text isDark={darkMode} style={style} {...rest} />;
}

export function Figure({ style, ...rest }: TextProps) {
  return (
    <T
      style={[{ fontFamily: MONO, fontVariant: ["tabular-nums"] }, style]}
      {...rest}
    />
  );
}

export function Serif({ style, ...rest }: TextProps) {
  return <T style={[{ fontFamily: SERIF }, style]} {...rest} />;
}

/* ------------------------------------------------------------------ */
/*  Backdrop — the three backgrounds, and nothing else.                */
/*  Dark: graphite #141415. Light: broken white #f7f4ee.               */
/*  Photo: the palm image, full-bleed, under a neutral scrim.         */
/* ------------------------------------------------------------------ */

export function Backdrop() {
  const { backdrop } = useHomes();
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
  const { backdrop, setBackdrop, darkMode } = useHomes();
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

/** Header row for stack screens: a back button + title. */
export function StackHeader({
  title,
  subtitle,
  titleStyle,
}: {
  title: string;
  subtitle?: string;
  titleStyle?: StyleProp<TextStyle>;
}) {
  const { backdrop, darkMode } = useHomes();
  return (
    <View style={styles.stackHeader}>
      <IconButton
        accessibilityLabel="Go back"
        onPress={() => router.back()}
        isDark={darkMode}
        size="md"
        tint={backdrop === "light" ? "#efe9df" : "#232325"}
        icon={<ChevronLeft size={20} color={colors[darkMode ? "dark" : "light"].foreground} />}
      />
      <View style={styles.settingText}>
        <T variant="heading" numberOfLines={1} style={titleStyle}>
          {title}
        </T>
        {subtitle ? (
          <T variant="caption" muted>
            {subtitle}
          </T>
        ) : null}
      </View>
    </View>
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
  const { darkMode } = useHomes();
  return (
    <Card isDark={darkMode} padding={8} style={style}>
      {children}
    </Card>
  );
}

export function RowSeparator() {
  const { darkMode } = useHomes();
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
  const { darkMode } = useHomes();
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
        <T variant="caption" muted style={styles.navDetail}>
          {detail}
        </T>
      ) : null}
      <ChevronRight size={20} color={colors[darkMode ? "dark" : "light"].muted} />
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  PropertyVisual — a composed elevation scene per property. No       */
/*  image assets: one flat tonal plate (the fixture's sky stops        */
/*  averaged, mixed toward the mode neutral), hills and ground in      */
/*  neutral steps, and a house or tower silhouette in the fixture      */
/*  hue mixed toward the ink. `variant` steps the same plate           */
/*  (front / golden hour / evening); the evening view is the deepest   */
/*  step and its windows are lit in the bronze accent.                 */
/* ------------------------------------------------------------------ */

export function PropertyVisual({
  property,
  height = 150,
  variant = 0,
  radius = 12,
  image,
}: {
  property: Property;
  height?: number;
  variant?: number;
  radius?: number;
  /** Bundled photo; when provided (and this is the front view) it
      replaces the composed plate. Falls back to property.image. */
  image?: number;
}) {
  const { backdrop } = useHomes();
  const base = mixHex(property.palette[0], property.palette[1], 0.5);
  const plate =
    variant === 1
      ? mixHex(base, pageNeutral(backdrop), 0.38)
      : variant === 2
        ? mixHex(base, "#141415", 0.72)
        : mixHex(base, pageNeutral(backdrop), 0.5);
  const building = mixHex(property.silhouette, inkTone(backdrop), 0.6);
  const ground = mixHex(building, pageNeutral(backdrop), 0.35);
  const isTower = property.type === "Flat";
  const evening = variant === 2;
  const windowFill = evening ? "#cf9a58" : paperTone(backdrop);
  const photo = image ?? property.image;
  if (photo && variant === 0) {
    return (
      <View style={{ height, borderRadius: radius, overflow: "hidden" }}>
        <Image
          source={photo}
          resizeMode="cover"
          style={{ width: "100%", height: "100%" }}
        />
      </View>
    );
  }

  return (
    <View style={{ height, borderRadius: radius, overflow: "hidden" }}>
      <Svg width="100%" height="100%" viewBox="0 0 300 160" preserveAspectRatio="xMidYMid slice">
        <Rect x="0" y="0" width="300" height="160" fill={plate} />
        {/* distant hills */}
        <Rect x="-20" y="104" width="180" height="56" rx="28" fill={building} opacity={0.22} />
        <Rect x="170" y="110" width="170" height="50" rx="25" fill={building} opacity={0.16} />
        {/* ground */}
        <Rect x="0" y="128" width="300" height="32" fill={ground} opacity={0.55} />
        {isTower ? (
          <>
            <Rect x="118" y="34" width="64" height="96" rx="4" fill={building} />
            {[0, 1, 2, 3].map((row) =>
              [0, 1, 2].map((col) => (
                <Rect
                  key={`${row}-${col}`}
                  x={128 + col * 18}
                  y={44 + row * 22}
                  width="10"
                  height="13"
                  rx="2"
                  fill={windowFill}
                  opacity={evening || (row + col) % 3 !== 0 ? 0.95 : 0.35}
                />
              )),
            )}
            <Rect x="86" y="74" width="34" height="56" rx="3" fill={building} opacity={0.65} />
            <Rect x="182" y="88" width="28" height="42" rx="3" fill={building} opacity={0.5} />
          </>
        ) : (
          <>
            {/* house: body, roof, door, windows, chimney */}
            <Rect x="104" y="78" width="92" height="52" rx="3" fill={building} />
            <Rect x="94" y="66" width="112" height="16" rx="5" fill={building} opacity={0.9} />
            <Rect x="168" y="48" width="12" height="22" fill={building} opacity={0.9} />
            <Rect x="140" y="98" width="20" height="32" rx="3" fill={windowFill} opacity={0.9} />
            <Rect x="114" y="88" width="16" height="16" rx="2" fill={windowFill} />
            <Rect x="170" y="88" width="16" height="16" rx="2" fill={windowFill} />
            {/* trees */}
            <Circle cx="72" cy="106" r="17" fill={building} opacity={0.85} />
            <Rect x="69" y="116" width="6" height="14" fill={building} />
            <Circle cx="232" cy="110" r="13" fill={building} opacity={0.7} />
            <Rect x="229" y="118" width="6" height="12" fill={building} />
          </>
        )}
      </Svg>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  SaveButton — the favourite toggle, wired to the shared store       */
/*  from anywhere. A neutral pill with a word, not a glyph: "Saved"    */
/*  takes the bronze accent, the live measure.                         */
/* ------------------------------------------------------------------ */

export function SaveButton({ propertyId, large = false }: { propertyId: string; large?: boolean }) {
  const { backdrop, darkMode, isFavourite, toggleFavourite } = useHomes();
  const active = isFavourite(propertyId);
  return (
    <IconButton
      accessibilityLabel={active ? "Remove from favourites" : "Save to favourites"}
      onPress={() => toggleFavourite(propertyId)}
      isDark={darkMode}
      size={large ? "md" : "sm"}
      tint={backdrop === "light" ? "rgba(253,251,247,0.88)" : "rgba(20,20,21,0.78)"}
      icon={
        <Bookmark
          size={16}
          color={
            active
              ? accentColor(backdrop)
              : colors[darkMode ? "dark" : "light"].foreground
          }
          fill={active ? accentColor(backdrop) : "none"}
        />
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/*  PropertyCard — the catalogue card used on Home, Search and Saved.  */
/* ------------------------------------------------------------------ */

export function PropertyCard({ property }: { property: Property }) {
  const { darkMode } = useHomes();
  return (
    <Card
      isDark={darkMode}
      padding={8}
      onPress={() => router.push(`/templates/homes/property/${property.id}`)}
      accessibilityLabel={`${property.title}, ${money(property.price)}`}
    >
      <View>
        <PropertyVisual property={property} image={property.image} />
        <View style={styles.cardBadge}>
          <Badge tone="muted" isDark={darkMode}>
            {property.status}
          </Badge>
        </View>
        <View style={styles.cardSave}>
          <SaveButton propertyId={property.id} />
        </View>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardPriceRow}>
          <Figure variant="heading">{money(property.price)}</Figure>
          {property.newBuild ? (
            <Badge tone="muted" isDark={darkMode}>
              New build
            </Badge>
          ) : null}
        </View>
        <Serif variant="body" numberOfLines={1}>
          {property.title}
        </Serif>
        <T variant="caption" muted numberOfLines={1}>
          {property.address} · {property.area}
        </T>
        <Figure variant="caption" muted style={styles.cardFacts}>
          {property.beds} beds · {property.baths} baths · {property.sqft.toLocaleString()} sq ft
        </Figure>
      </View>
    </Card>
  );
}

/** Agent line used on the property page: name, role, rating, sales. */
export function AgentLine({ property }: { property: Property }) {
  const { darkMode } = useHomes();
  const agent = agentOf(property);
  return (
    <View style={styles.agentLine}>
      <Avatar name={agent.name} source={agent.image} size="md" isDark={darkMode} />
      <View style={styles.settingText}>
        <T variant="body">{agent.name}</T>
        <View style={styles.agentMeta}>
          <T variant="caption" muted>
            {agent.role + " · "}
          </T>
          <Figure variant="caption" muted>
            {agent.rating.toFixed(1)}
          </Figure>
          <T variant="caption" muted>
            {" rating · "}
          </T>
          <Figure variant="caption" muted>
            {String(agent.sales)}
          </Figure>
          <T variant="caption" muted>
            {" homes sold"}
          </T>
        </View>
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
  screenSubtitle: {
    marginTop: 8,
  },
  screenBody: {
    marginTop: 24,
    gap: 24,
  },
  stackHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
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
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingDescription: {
    marginTop: 2,
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
  savePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  savePillLarge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  cardBadge: {
    position: "absolute",
    top: 8,
    left: 8,
  },
  cardSave: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  cardBody: {
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 4,
  },
  cardPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardFacts: {
    marginTop: 4,
  },
  agentLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  agentMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
});
