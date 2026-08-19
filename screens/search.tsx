import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Collection, Product } from '../services/api';

type Props = {
  query: string;
  setQuery: (value: string) => void;
  products: Product[];
  collections: Collection[];
  loading: boolean;
  error: string;
  onRetry: () => void;
  onBack: () => void;
  onProduct: (product: Product) => void;
};

type SortMode = 'featured' | 'priceLow' | 'priceHigh' | 'name';

export default function SearchScreen({
  query,
  setQuery,
  products,
  collections,
  loading,
  error,
  onRetry,
  onBack,
  onProduct,
}: Props) {
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState('ALL');
  const [sort, setSort] = useState<SortMode>('featured');

  const searchableProducts = useMemo(
    () => products.filter(product => !product.hidden && product.visibleInStore !== false),
    [products],
  );

  const categories = useMemo(
    () => Array.from(new Set(searchableProducts.map(product => product.category).filter(Boolean))) as string[],
    [searchableProducts],
  );

  const normalizedQuery = query.trim().toLowerCase();

  const productResults = useMemo(() => {
    let result = searchableProducts.filter(product => {
      if (category !== 'ALL' && product.category !== category) return false;
      if (!normalizedQuery) return true;

      const haystack = [
        product.name,
        product.category,
        product.collection,
        product.tags,
        product.description,
        product.colors?.join(' '),
        product.sizes?.join(' '),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });

    if (sort === 'priceLow') result = [...result].sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === 'priceHigh') result = [...result].sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === 'name') result = [...result].sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [searchableProducts, category, normalizedQuery, sort]);

  const collectionResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return collections.filter(collection => {
      if (collection.hidden) return false;
      const haystack = [collection.name, collection.description].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [collections, normalizedQuery]);

  const matchingCategories = useMemo(() => {
    if (!normalizedQuery) return [];
    return categories.filter(value => value.toLowerCase().includes(normalizedQuery));
  }, [categories, normalizedQuery]);

  const clearAll = () => {
    setQuery('');
    setCategory('ALL');
    setSort('featured');
  };

  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={onBack} hitSlop={12} accessibilityLabel="Back">
            <Text style={styles.back}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>SEARCH</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchGlyph}>⌕</Text>
          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="Search STAYUNKNOWN"
            placeholderTextColor="#666"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            style={styles.input}
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityLabel="Clear search">
              <Text style={styles.clear}>×</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.toolbar}>
          <Text style={styles.resultLabel}>
            {normalizedQuery ? `${productResults.length} PRODUCT${productResults.length === 1 ? '' : 'S'}` : 'SEARCH PRODUCTS & MORE'}
          </Text>
          <Pressable onPress={() => setShowFilters(value => !value)} style={styles.filterToggle}>
            <Text style={styles.filterToggleText}>{showFilters ? 'HIDE FILTERS' : 'FILTER / SORT'}</Text>
          </Pressable>
        </View>

        {showFilters ? (
          <View style={styles.filterPanel}>
            <Text style={styles.filterLabel}>CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choices}>
              {['ALL', ...categories].map(value => (
                <Pressable
                  key={value}
                  onPress={() => setCategory(value)}
                  style={[styles.choice, category === value && styles.choiceActive]}
                >
                  <Text style={[styles.choiceText, category === value && styles.choiceTextActive]}>{value}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.filterLabel}>SORT BY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choices}>
              {([
                ['featured', 'FEATURED'],
                ['priceLow', 'PRICE ↑'],
                ['priceHigh', 'PRICE ↓'],
                ['name', 'NAME A–Z'],
              ] as const).map(([value, label]) => (
                <Pressable
                  key={value}
                  onPress={() => setSort(value)}
                  style={[styles.choice, sort === value && styles.choiceActive]}
                >
                  <Text style={[styles.choiceText, sort === value && styles.choiceTextActive]}>{label}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Pressable onPress={clearAll} style={styles.clearFilters}>
              <Text style={styles.clearFiltersText}>CLEAR SEARCH + FILTERS</Text>
            </Pressable>
          </View>
        ) : null}

        {error ? (
          <View style={styles.state}>
            <Text style={styles.stateTitle}>SEARCH UNAVAILABLE</Text>
            <Text style={styles.stateText}>{error}</Text>
            <Pressable style={styles.primaryButton} onPress={onRetry}>
              <Text style={styles.primaryText}>TRY AGAIN</Text>
            </Pressable>
          </View>
        ) : loading ? (
          <View style={styles.state}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.stateText}>LOADING CATALOG…</Text>
          </View>
        ) : (
          <>
            {normalizedQuery && matchingCategories.length > 0 ? (
              <Section title="CATEGORIES" />
            ) : null}
            {normalizedQuery && matchingCategories.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontal}>
                {matchingCategories.map(value => (
                  <Pressable key={value} style={styles.categoryCard} onPress={() => setCategory(value)}>
                    <Text style={styles.categoryCardTitle}>{value.toUpperCase()}</Text>
                    <Text style={styles.categoryCardMeta}>VIEW PRODUCTS →</Text>
                  </Pressable>
                ))}
              </ScrollView>
            ) : null}

            {collectionResults.length > 0 ? (
              <>
                <Section title={`COLLECTIONS · ${collectionResults.length}`} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontal}>
                  {collectionResults.map(collection => (
                    <View key={collection.id} style={styles.collectionCard}>
                      {collection.image ? (
                        <Image source={{ uri: collection.image }} style={styles.collectionImage} />
                      ) : (
                        <View style={styles.collectionImage}>
                          <Text style={styles.collectionFallback}>{collection.name}</Text>
                        </View>
                      )}
                      <Text style={styles.collectionName}>{collection.name}</Text>
                      <Text style={styles.collectionMeta}>{collection.productCount || 0} PIECES</Text>
                    </View>
                  ))}
                </ScrollView>
              </>
            ) : null}

            <Section title={`PRODUCTS · ${productResults.length}`} />
            {productResults.length > 0 ? (
              <View style={styles.grid}>
                {productResults.map(product => (
                  <ProductCard key={product.id} product={product} onPress={() => onProduct(product)} />
                ))}
              </View>
            ) : (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>{normalizedQuery ? 'NO MATCHES' : 'SEARCH STAYUNKNOWN'}</Text>
                <Text style={styles.stateText}>
                  {normalizedQuery
                    ? 'Try another product, collection, category or keyword.'
                    : 'Find products, collections and categories from one place.'}
                </Text>
                {normalizedQuery ? (
                  <Pressable style={styles.outlineButton} onPress={clearAll}>
                    <Text style={styles.outlineText}>CLEAR SEARCH</Text>
                  </Pressable>
                ) : null}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function ProductCard({ product, onPress }: { product: Product; onPress: () => void }) {
  const image = product.image || product.images?.[0];
  const soldOut = !product.comingSoon && typeof product.stock === 'number' && product.stock <= 0;

  return (
    <Pressable style={styles.product} onPress={onPress} accessibilityLabel={`Open ${product.name}`}>
      <View style={styles.productImage}>
        {image ? <Image source={{ uri: image }} style={styles.image} resizeMode="cover" /> : <Text style={styles.placeholder}>STAYUNKNOWN</Text>}
        {product.comingSoon ? (
          <View style={styles.badge}><Text style={styles.badgeText}>COMING SOON</Text></View>
        ) : soldOut ? (
          <View style={styles.badge}><Text style={styles.badgeText}>SOLD OUT</Text></View>
        ) : null}
      </View>
      <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
      <Text style={styles.productPrice}>₦{Number(product.price || 0).toLocaleString('en-NG')}</Text>
      {product.category ? <Text style={styles.productMeta}>{product.category.toUpperCase()}</Text> : null}
    </Pressable>
  );
}

function Section({ title }: { title: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#000' },
  content: { paddingBottom: 40 },
  header: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { color: '#fff', fontSize: 34, fontWeight: '300', lineHeight: 28 },
  headerTitle: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 2.5 },
  headerSpacer: { width: 24 },
  searchBox: { marginHorizontal: 18, minHeight: 54, borderWidth: 1, borderColor: '#303030', backgroundColor: '#121212', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 },
  searchGlyph: { color: '#fff', fontSize: 22, marginRight: 7 },
  input: { flex: 1, color: '#fff', fontSize: 14, paddingVertical: 14 },
  clear: { color: '#fff', fontSize: 25, minWidth: 20, textAlign: 'center' },
  toolbar: { paddingHorizontal: 18, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resultLabel: { color: '#777', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  filterToggle: { borderWidth: 1, borderColor: '#333', paddingHorizontal: 10, paddingVertical: 8 },
  filterToggleText: { color: '#fff', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  filterPanel: { marginHorizontal: 18, marginBottom: 12, borderWidth: 1, borderColor: '#292929', padding: 14 },
  filterLabel: { color: '#888', fontSize: 8, fontWeight: '900', letterSpacing: 1, marginBottom: 8 },
  choices: { gap: 7, paddingBottom: 10 },
  choice: { borderWidth: 1, borderColor: '#333', paddingHorizontal: 10, paddingVertical: 8 },
  choiceActive: { backgroundColor: '#fff', borderColor: '#fff' },
  choiceText: { color: '#777', fontSize: 8, fontWeight: '900', letterSpacing: 0.4 },
  choiceTextActive: { color: '#000' },
  clearFilters: { paddingTop: 4 },
  clearFiltersText: { color: '#fff', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  section: { paddingHorizontal: 18, marginTop: 24, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 1.2 },
  sectionLine: { flex: 1, height: 1, backgroundColor: '#202020' },
  horizontal: { paddingHorizontal: 18, gap: 10 },
  categoryCard: { width: 175, minHeight: 76, borderWidth: 1, borderColor: '#292929', backgroundColor: '#0c0c0c', padding: 13, justifyContent: 'space-between' },
  categoryCardTitle: { color: '#fff', fontSize: 12, fontWeight: '900' },
  categoryCardMeta: { color: '#666', fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  collectionCard: { width: 210, borderWidth: 1, borderColor: '#292929', paddingBottom: 12 },
  collectionImage: { width: '100%', height: 180, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' },
  collectionFallback: { color: '#fff', fontSize: 19, fontWeight: '900', textAlign: 'center', paddingHorizontal: 12 },
  collectionName: { color: '#fff', fontSize: 14, fontWeight: '900', paddingHorizontal: 12, paddingTop: 10 },
  collectionMeta: { color: '#666', fontSize: 8, fontWeight: '900', letterSpacing: 1, paddingHorizontal: 12, paddingTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 6 },
  product: { width: '50%', paddingHorizontal: 6, marginBottom: 22 },
  productImage: { height: 235, backgroundColor: '#151515', position: 'relative', alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  placeholder: { color: '#555', fontSize: 8, fontWeight: '900' },
  badge: { position: 'absolute', left: 9, bottom: 9, backgroundColor: '#fff', paddingHorizontal: 7, paddingVertical: 5 },
  badgeText: { color: '#000', fontSize: 7, fontWeight: '900', letterSpacing: 0.5 },
  productName: { color: '#fff', fontSize: 12, fontWeight: '800', marginTop: 8 },
  productPrice: { color: '#aaa', fontSize: 12, marginTop: 4 },
  productMeta: { color: '#555', fontSize: 8, fontWeight: '900', letterSpacing: 0.8, marginTop: 4 },
  state: { minHeight: 190, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, gap: 10 },
  stateTitle: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  stateText: { color: '#666', fontSize: 11, lineHeight: 18, textAlign: 'center' },
  primaryButton: { backgroundColor: '#fff', paddingHorizontal: 18, paddingVertical: 13, marginTop: 5 },
  primaryText: { color: '#000', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  outlineButton: { borderWidth: 1, borderColor: '#fff', paddingHorizontal: 18, paddingVertical: 12, marginTop: 6 },
  outlineText: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  empty: { minHeight: 250, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 35, gap: 10 },
  emptyTitle: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
});
