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
  const [filters, setFilters] = useState(false);
  const [category, setCategory] = useState('ALL');
  const [sort, setSort] = useState<'featured' | 'priceLow' | 'priceHigh' | 'name'>('featured');
  const q = query.trim().toLowerCase();

  const visibleProducts = useMemo(() => products.filter(product => !product.hidden), [products]);
  const categories = useMemo(
    () => Array.from(new Set(visibleProducts.map(product => product.category).filter(Boolean))) as string[],
    [visibleProducts],
  );
  const result = useMemo(() => {
    let list = visibleProducts.filter(product => {
      if (category !== 'ALL' && product.category !== category) return false;
      if (!q) return true;
      return [product.name, product.category, product.collection, product.tags, product.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q);
    });

    if (sort === 'priceLow') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'priceHigh') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [visibleProducts, category, q, sort]);

  const collectionResults = useMemo(
    () => collections.filter(collection =>
      !collection.hidden &&
      (!q || [collection.name, collection.description].filter(Boolean).join(' ').toLowerCase().includes(q)),
    ),
    [collections, q],
  );

  function clearFilters() {
    setCategory('ALL');
    setSort('featured');
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12} accessibilityLabel="Back">
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text style={styles.title}>SEARCH</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          autoFocus
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Search products, collections, categories"
          placeholderTextColor="#555"
          autoCapitalize="none"
          returnKeyType="search"
        />
        <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityLabel="Clear search">
          <Text style={styles.clear}>{query ? '×' : ''}</Text>
        </Pressable>
      </View>

      <View style={styles.tools}>
        <Text style={styles.summary}>{q ? `${result.length} RESULTS` : 'SEARCH EVERYTHING'}</Text>
        <Pressable onPress={() => setFilters(value => !value)}>
          <Text style={styles.filterButton}>FILTER / SORT</Text>
        </Pressable>
      </View>

      {filters && (
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

          <Text style={styles.filterLabel}>SORT</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choices}>
            {([
              ['featured', 'FEATURED'],
              ['priceLow', 'PRICE ↑'],
              ['priceHigh', 'PRICE ↓'],
              ['name', 'NAME A-Z'],
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

          <Pressable onPress={clearFilters}>
            <Text style={styles.clearFilters}>CLEAR FILTERS</Text>
          </Pressable>
        </View>
      )}

      {error ? (
        <View style={styles.loader}>
          <Text style={styles.error}>{error}</Text>
          <Pressable style={styles.outline} onPress={onRetry}>
            <Text style={styles.outlineText}>TRY AGAIN</Text>
          </Pressable>
        </View>
      ) : loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color="#fff" />
          <Text style={styles.muted}>LOADING…</Text>
        </View>
      ) : (
        <>
          <Section title={`PRODUCTS · ${result.length}`} />
          {result.length ? (
            <View style={styles.grid}>
              {result.map(product => (
                <SearchProductCard key={product.id} product={product} onPress={() => onProduct(product)} />
              ))}
            </View>
          ) : (
            <Text style={styles.muted}>NO PRODUCTS MATCH YOUR SEARCH.</Text>
          )}

          {collectionResults.length ? (
            <>
              <Section title={`COLLECTIONS · ${collectionResults.length}`} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontal}>
                {collectionResults.map(collection => (
                  <View key={collection.id} style={styles.collection}>
                    {collection.image ? (
                      <Image source={{ uri: collection.image }} style={styles.collectionImage} />
                    ) : (
                      <View style={styles.collectionImage}>
                        <Text style={styles.collectionFallback}>{collection.name}</Text>
                      </View>
                    )}
                    <Text style={styles.collectionName}>{collection.name}</Text>
                    <Text style={styles.collectionCount}>{collection.productCount || 0} PIECES</Text>
                  </View>
                ))}
              </ScrollView>
            </>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

function SearchProductCard({ product, onPress }: { product: Product; onPress: () => void }) {
  return (
    <Pressable style={styles.product} onPress={onPress}>
      <View style={styles.productImage}>
        {product.image ? <Image source={{ uri: product.image }} style={styles.image} /> : <Text style={styles.placeholder}>STAYUNKNOWN</Text>}
        {product.comingSoon ? (
          <View style={styles.badge}><Text style={styles.badgeText}>COMING SOON</Text></View>
        ) : typeof product.stock === 'number' && product.stock <= 0 ? (
          <View style={styles.badge}><Text style={styles.badgeText}>SOLD OUT</Text></View>
        ) : null}
      </View>
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productPrice}>₦{Number(product.price).toLocaleString('en-NG')}</Text>
      {product.category ? <Text style={styles.meta}>{product.category.toUpperCase()}</Text> : null}
    </Pressable>
  );
}

function Section({ title }: { title: string }) {
  return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text></View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#000' },
  content: { paddingBottom: 30 },
  header: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { color: '#fff', fontSize: 32, fontWeight: '300', lineHeight: 28 },
  title: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 2 },
  headerSpacer: { width: 24 },
  searchBox: { marginHorizontal: 18, borderWidth: 1, borderColor: '#333', backgroundColor: '#151515', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  searchIcon: { color: '#fff', fontSize: 20 },
  input: { flex: 1, color: '#fff', padding: 14, fontSize: 13 },
  clear: { color: '#fff', fontSize: 22, minWidth: 18, textAlign: 'center' },
  tools: { paddingHorizontal: 18, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summary: { color: '#777', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  filterButton: { color: '#fff', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  filterPanel: { borderWidth: 1, borderColor: '#292929', padding: 14, marginBottom: 12, marginHorizontal: 18 },
  filterLabel: { color: '#888', fontSize: 8, fontWeight: '900', letterSpacing: 1, marginTop: 5, marginBottom: 8 },
  choices: { gap: 7, paddingBottom: 8 },
  choice: { borderWidth: 1, borderColor: '#333', paddingHorizontal: 10, paddingVertical: 8 },
  choiceActive: { backgroundColor: '#fff', borderColor: '#fff' },
  choiceText: { color: '#777', fontSize: 8, fontWeight: '900' },
  choiceTextActive: { color: '#000' },
  clearFilters: { color: '#fff', fontSize: 8, fontWeight: '900', marginTop: 8 },
  section: { paddingHorizontal: 18, marginTop: 30, marginBottom: 14 },
  sectionTitle: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 6 },
  product: { width: '50%', paddingHorizontal: 6, marginBottom: 22 },
  productImage: { height: 235, backgroundColor: '#151515', position: 'relative', alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  placeholder: { color: '#555', fontSize: 8, fontWeight: '900' },
  badge: { position: 'absolute', bottom: 9, left: 9, backgroundColor: '#fff', paddingHorizontal: 7, paddingVertical: 5 },
  badgeText: { color: '#000', fontSize: 7, fontWeight: '900', letterSpacing: 0.5 },
  productName: { color: '#fff', fontSize: 12, fontWeight: '800', marginTop: 8 },
  productPrice: { color: '#888', fontSize: 12, marginTop: 4 },
  meta: { color: '#555', fontSize: 8, fontWeight: '900', letterSpacing: 1, marginTop: 5 },
  collection: { width: 190, borderWidth: 1, borderColor: '#292929', paddingBottom: 12 },
  collectionImage: { height: 190, width: '100%', backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' },
  collectionFallback: { color: '#fff', fontSize: 24, fontWeight: '900', textAlign: 'center' },
  collectionName: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 1, paddingHorizontal: 12, paddingTop: 12 },
  collectionCount: { color: '#666', fontSize: 9, fontWeight: '900', letterSpacing: 1, paddingHorizontal: 12, paddingTop: 5 },
  horizontal: { paddingHorizontal: 18, gap: 10 },
  loader: { padding: 40, alignItems: 'center', gap: 10 },
  muted: { color: '#666', fontSize: 11, lineHeight: 18, textAlign: 'center' },
  error: { color: '#fff', textAlign: 'center', fontSize: 11, lineHeight: 18 },
  outline: { borderWidth: 1, borderColor: '#fff', paddingHorizontal: 20, paddingVertical: 14, alignSelf: 'center', marginTop: 12 },
  outlineText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
});
