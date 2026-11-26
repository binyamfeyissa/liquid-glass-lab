import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Badge, Button, Card, Select, Slider } from "glacia-native";

import {
  MORTGAGE_RATE,
  agentOf,
  money,
  moneyExact,
  monthlyPayment,
  propertyById,
} from "../data";
import { useHomes } from "../state";
import {
  AgentLine,
  Figure,
  ListCard,
  PropertyVisual,
  RowSeparator,
  SaveButton,
  SectionTitle,
  StackHeader,
  T,
  SERIF,
} from "../ui";

const YEAR_OPTIONS = [10, 15, 20, 25, 30].map((y) => ({
  label: `${y} years`,
  value: String(y),
}));

function Fact({ label, value, figure = false }: { label: string; value: string; figure?: boolean }) {
  return (
    <View style={styles.fact}>
      <T variant="caption" muted>
        {label}
      </T>
      {figure ? (
        <Figure variant="body">{value}</Figure>
      ) : (
        <T variant="body">{value}</T>
      )}
    </View>
  );
}

export default function PropertyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { darkMode } = useHomes();
  const property = propertyById(id ?? "");

  const [depositPct, setDepositPct] = useState(20);
  const [years, setYears] = useState("25");

  const monthly = useMemo(
    () => (property ? monthlyPayment(property.price, depositPct, Number(years)) : 0),
    [property, depositPct, years],
  );

  if (!property) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <StackHeader title="Home not found" />
        <Card isDark={darkMode} padding={20}>
          <T variant="body">This home is no longer listed</T>
          <T variant="caption" muted style={styles.hint}>
            It may have been sold — browse the latest homes instead
          </T>
        </Card>
        <Button
          variant="filled"
          accessibilityLabel="Back to home"
          isDark={darkMode}
          onPress={() => router.replace("/templates/homes")}
        >
          Back to home
        </Button>
      </ScrollView>
    );
  }

  const agent = agentOf(property);
  const depositAmount = (property.price * depositPct) / 100;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <StackHeader
        title={property.title}
        subtitle={`${property.address} · ${property.area}`}
        titleStyle={{ fontFamily: SERIF }}
      />

      {/* Gallery — three tonal views of the same home */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.gallery}
      >
        {[0, 1, 2].map((variant) => (
          <View key={variant} style={styles.gallerySlide}>
            <PropertyVisual property={property} height={232} variant={variant} radius={16} image={property.image} />
            <View style={styles.galleryTag}>
              <Badge tone="muted" isDark={darkMode}>
                {variant === 0 ? "Front" : variant === 1 ? "Golden hour" : "Evening"}
              </Badge>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Price row */}
      <View style={styles.priceRow}>
        <View style={styles.priceText}>
          <Figure variant="title">{money(property.price)}</Figure>
          <View style={styles.badgeRow}>
            <Badge tone="muted" isDark={darkMode}>
              {property.status}
            </Badge>
            {property.newBuild ? (
              <Badge tone="muted" isDark={darkMode}>
                New build
              </Badge>
            ) : null}
          </View>
        </View>
        <SaveButton propertyId={property.id} large />
      </View>

      {/* Facts */}
      <View>
        <SectionTitle>Facts</SectionTitle>
        <ListCard>
          <View style={styles.factGrid}>
            <Fact label="Bedrooms" value={String(property.beds)} figure />
            <Fact label="Bathrooms" value={String(property.baths)} figure />
            <Fact label="Floor area" value={`${property.sqft.toLocaleString()} sq ft`} figure />
          </View>
          <RowSeparator />
          <View style={styles.factGrid}>
            <Fact label="Type" value={property.type} />
            <Fact label="Tenure" value={property.tenure} />
            <Fact
              label="Price per sq ft"
              value={money(Math.round(property.price / property.sqft))}
              figure
            />
          </View>
        </ListCard>
      </View>

      {/* Description + features */}
      <View>
        <SectionTitle>About this home</SectionTitle>
        <Card isDark={darkMode} padding={18}>
          <T variant="body">{property.description}</T>
          <View style={styles.featureList}>
            {property.features.map((f) => (
              <T key={f} variant="body" muted>
                {f}
              </T>
            ))}
          </View>
        </Card>
      </View>

      {/* Mortgage calculator */}
      <View>
        <SectionTitle>Mortgage calculator</SectionTitle>
        <Card isDark={darkMode} padding={18}>
          <View style={styles.calcRow}>
            <T variant="body">Deposit</T>
            <Figure variant="body">
              {depositPct}% · {money(depositAmount)}
            </Figure>
          </View>
          <Slider
            value={depositPct}
            onValueChange={setDepositPct}
            min={5}
            max={60}
            step={1}
            accessibilityLabel="Deposit percentage"
            isDark={darkMode}
          />
          <View style={styles.calcRow}>
            <T variant="body">Term</T>
            <View style={styles.yearsSelect}>
              <Select
                value={years}
                onValueChange={setYears}
                options={YEAR_OPTIONS}
                accessibilityLabel="Mortgage term"
                isDark={darkMode}
              />
            </View>
          </View>
          <RowSeparator />
          <View style={styles.calcResult}>
            <View>
              <T variant="caption" muted>
                Monthly payment
              </T>
              <T variant="caption" muted>
                at {MORTGAGE_RATE}% fixed, borrowing {money(property.price - depositAmount)}
              </T>
            </View>
            <Figure variant="title">{moneyExact(monthly)}</Figure>
          </View>
          <T variant="caption" muted style={styles.hint}>
            Illustrative only — not a mortgage offer. Your agent can introduce
            a broker.
          </T>
        </Card>
      </View>

      {/* Agent */}
      <View>
        <SectionTitle>Listed by</SectionTitle>
        <ListCard>
          <AgentLine property={property} />
          <RowSeparator />
          <View style={styles.agentPhone}>
            <T variant="body" muted>
              Call {agent.name.split(" ")[0]} on {agent.phone}
            </T>
          </View>
        </ListCard>
      </View>

      <Button
        variant="filled"
        size="lg"
        accessibilityLabel={`Book a viewing of ${property.title}`}
        isDark={darkMode}
        onPress={() => router.push(`/templates/homes/viewing/${property.id}`)}
      >
        Book a viewing
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 112,
    paddingBottom: 36,
    gap: 20,
  },
  gallery: {
    gap: 12,
  },
  gallerySlide: {
    width: 320,
  },
  galleryTag: {
    position: "absolute",
    bottom: 8,
    left: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  priceText: {
    flex: 1,
    gap: 8,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
  },
  factGrid: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  fact: {
    flex: 1,
    gap: 4,
  },
  featureList: {
    marginTop: 16,
    gap: 8,
  },
  calcRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginVertical: 8,
  },
  yearsSelect: {
    width: 150,
  },
  calcResult: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 12,
  },
  hint: {
    marginTop: 8,
  },
  agentPhone: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});
