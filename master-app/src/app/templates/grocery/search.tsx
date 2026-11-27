import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { colors, Chip, Field, IconButton, Input } from "glacia-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import ChevronLeftIcon from "@hugeicons/core-free-icons/ChevronLeftIcon";
import { PRODUCTS, aisleById } from "./data";
import { useBasket } from "./state";
import {
  CartBar,
  ListCard,
  ProductRow,
  RowSeparator,
  SectionTitle,
  T,
} from "./ui";

export default function SearchScreen() {
  const basket = useBasket();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.detail.toLowerCase().includes(q) ||
        aisleById(p.aisleId).name.toLowerCase().includes(q),
    );
  }, [query]);

  const runChip = (term: string) => {
    setQuery(term);
    basket.addRecentSearch(term);
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <IconButton
            accessibilityLabel="Back"
            onPress={() => router.back()}
            isDark={basket.darkMode}
            icon={<HugeiconsIcon icon={ChevronLeftIcon} size={20} color={colors[basket.darkMode ? "dark" : "light"].foreground} />}
          />
          <T variant="title">Search</T>
        </View>

        <Field isDark={basket.darkMode}>
          <Input
            isDark={basket.darkMode}
            value={query}
            onChangeText={setQuery}
            placeholder="Search the whole store"
            accessibilityLabel="Search groceries"
            returnKeyType="search"
            onSubmitEditing={() => basket.addRecentSearch(query)}
          />
        </Field>

        {query.trim() === "" ? (
          <>
            {basket.recentSearches.length > 0 ? (
              <View>
                <SectionTitle>Recent searches</SectionTitle>
                <View style={styles.chips}>
                  {basket.recentSearches.map((term) => (
                    <Chip
                      key={term}
                      label={term}
                      isDark={basket.darkMode}
                      onPress={() => runChip(term)}
                    />
                  ))}
                </View>
              </View>
            ) : null}
            <View>
              <SectionTitle>Popular right now</SectionTitle>
              <View style={styles.chips}>
                {["salmon", "eggs", "coffee", "ice cream", "avocado"].map(
                  (term) => (
                    <Chip
                      key={term}
                      label={term}
                      isDark={basket.darkMode}
                      onPress={() => runChip(term)}
                    />
                  ),
                )}
              </View>
            </View>
          </>
        ) : results.length === 0 ? (
          <T variant="body" muted>
            Nothing matches {query} — try a single word like milk, pasta or
            juice
          </T>
        ) : (
          <View>
            <SectionTitle>
              {results.length} {results.length === 1 ? "result" : "results"}
            </SectionTitle>
            <ListCard>
              {results.map((product, i) => (
                <View key={product.id}>
                  {i > 0 ? <RowSeparator /> : null}
                  <ProductRow product={product} />
                </View>
              ))}
            </ListCard>
          </View>
        )}
      </ScrollView>
      <CartBar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 112,
    paddingBottom: 96,
    gap: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});
