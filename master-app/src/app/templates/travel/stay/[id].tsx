import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Avatar, Button, Card } from "glacia-native";

import { useTravel } from "../state";
import {
  accent,
  Figure,
  HeartButton,
  ListCard,
  Plate,
  RowSeparator,
  SectionTitle,
  SERIF,
  T,
} from "../ui";

const GALLERY_PANELS = ["Living space", "Sleep", "The view"];

export default function StayDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { stayById, destinationById, price, darkMode } = useTravel();
  const stay = stayById(id ?? "");
  const [panel, setPanel] = useState(0);
  const [galleryW, setGalleryW] = useState(0);

  if (!stay) {
    return (
      <View style={styles.missing}>
        <T variant="title">Stay not found</T>
        <Button isDark={darkMode} accessibilityLabel="Go back" onPress={() => router.back()}>
          Go back
        </Button>
      </View>
    );
  }

  const dest = destinationById(stay.destinationId);
  // Gallery panels stay within the stay's own pair — flat plates, no new hues.
  const panelColors: [string, string][] = [
    stay.colors,
    [stay.colors[1], stay.colors[0]],
    [stay.colors[0], stay.colors[0]],
  ];

  const onGalleryScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (galleryW > 0) setPanel(Math.round(e.nativeEvent.contentOffset.x / galleryW));
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header row */}
        <View style={styles.headerRow}>
          <Button
            isDark={darkMode}
            size="sm"
            shape="circle"
            accessibilityLabel="Back"
            onPress={() => router.back()}
          >
            ‹
          </Button>
          <T variant="heading" style={[styles.flex, styles.placeName]} numberOfLines={1}>
            {dest?.city}, {dest?.country}
          </T>
          <HeartButton stayId={stay.id} />
        </View>

        {/* Gallery — horizontally paged composed panels + dots */}
        <View
          onLayout={(e) => {
            setGalleryW(e.nativeEvent.layout.width);
          }}
        >
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onGalleryScroll}
            scrollEventThrottle={16}
          >
            {GALLERY_PANELS.map((label, i) => (
              <View key={label} style={{ width: galleryW || 340 }}>
                <Plate
                  colors={panelColors[i]}
                  label={label}
                  height={230}
                  radius={20}
                  fontSize={28}
                />
              </View>
            ))}
          </ScrollView>
          <View style={styles.dots}>
            {GALLERY_PANELS.map((label, i) => (
              <View
                key={label}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      i === panel ? accent(darkMode) : "rgba(127,127,127,0.45)",
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Title + facts */}
        <View style={styles.block}>
          <T variant="title" style={styles.stayTitle}>
            {stay.title}
          </T>
          <T variant="body" muted>
            {stay.type} · <Figure variant="body">{stay.rating.toFixed(2)}</Figure> ·{" "}
            <Figure variant="body">{stay.reviewsCount}</Figure> reviews
          </T>
          <Card isDark={darkMode} padding={12} style={styles.factsCard}>
            <View style={styles.factsRow}>
              <Fact label="Guests" value={`${stay.guests}`} />
              <Fact label="Bedrooms" value={`${stay.bedrooms}`} />
              <Fact label="Beds" value={`${stay.beds}`} />
              <Fact label="Baths" value={`${stay.baths}`} />
            </View>
          </Card>
        </View>

        {/* Host */}
        <ListCard>
          <View style={styles.hostRow}>
            <Avatar name={stay.hostName} size="md" isDark={darkMode} />
            <View style={styles.flex}>
              <T variant="body">Hosted by {stay.hostName}</T>
              <T variant="caption" muted>
                Hosting since <Figure variant="caption">{stay.hostSince}</Figure>
              </T>
            </View>
            <Button
              isDark={darkMode}
              size="sm"
              accessibilityLabel={`Message ${stay.hostName}`}
              onPress={() => router.push("/templates/travel/(tabs)/messages")}
            >
              Message
            </Button>
          </View>
        </ListCard>

        <T variant="body" style={styles.description}>
          {stay.description}
        </T>

        {/* Amenities */}
        <View>
          <SectionTitle>Amenities</SectionTitle>
          <ListCard>
            {stay.amenities.map((a, i) => (
              <View key={a}>
                {i > 0 ? <RowSeparator /> : null}
                <View style={styles.amenityRow}>
                  <T variant="body" muted>
                    ✓
                  </T>
                  <T variant="body">{a}</T>
                </View>
              </View>
            ))}
          </ListCard>
        </View>

        {/* Reviews */}
        <View>
          <SectionTitle>Reviews</SectionTitle>
          <View style={styles.reviewList}>
            {stay.reviews.map((review) => (
              <ListCard key={review.author}>
                <View style={styles.reviewInner}>
                  <View style={styles.hostRowPlain}>
                    <Avatar name={review.author} size="sm" isDark={darkMode} />
                    <View style={styles.flex}>
                      <T variant="body">{review.author}</T>
                      <T variant="caption" muted>
                        {review.dateLabel} · <Figure variant="caption">{review.rating} of 5</Figure>
                      </T>
                    </View>
                  </View>
                  <T variant="body">{review.text}</T>
                </View>
              </ListCard>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Sticky reserve bar with the price breakdown summary */}
      <Card isDark={darkMode} padding={16} style={styles.reserveBar}>
        <View style={styles.reserveInner}>
          <View style={styles.flex}>
            <View style={styles.reservePriceRow}>
              <Figure variant="body">{price(stay.pricePerNight)}</Figure>
              <T variant="caption" muted>
                {" "}
                / night
              </T>
            </View>
            <T variant="caption" muted>
              + <Figure variant="caption">{price(stay.cleaningFee)}</Figure> cleaning ·
              free cancellation for 48 hours
            </T>
          </View>
          <Button
            isDark={darkMode}
            variant="filled"
            accessibilityLabel={`Reserve ${stay.title}`}
            onPress={() => router.push(`/templates/travel/book/${stay.id}`)}
          >
            Reserve
          </Button>
        </View>
      </Card>
    </View>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Figure variant="heading">{value}</Figure>
      <T variant="caption" muted>
        {label}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1 },
  missing: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  content: { paddingHorizontal: 24, paddingTop: 64, gap: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  placeName: { fontFamily: SERIF },
  dots: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  block: { gap: 8 },
  stayTitle: { fontFamily: SERIF },
  factsCard: { marginTop: 8 },
  factsRow: { flexDirection: "row", gap: 8 },
  fact: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    gap: 2,
  },
  hostRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12 },
  hostRowPlain: { flexDirection: "row", alignItems: "center", gap: 12 },
  description: { lineHeight: 24 },
  amenityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  reviewList: { gap: 12 },
  reviewInner: { padding: 16, gap: 12 },
  bottomSpacer: { height: 96 },
  reserveBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
  },
  reserveInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  reservePriceRow: { flexDirection: "row", alignItems: "baseline" },
});
