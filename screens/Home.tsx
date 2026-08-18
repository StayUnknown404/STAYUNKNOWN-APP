import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.logo}>STAYUNKNOWN</Text>

          <View style={styles.headerActions}>
            <Pressable>
              <Text style={styles.icon}>⌕</Text>
            </Pressable>

            <Pressable>
              <Text style={styles.icon}>♡</Text>
            </Pressable>

            <Pressable>
              <Text style={styles.icon}>▢</Text>
            </Pressable>
          </View>
        </View>

        {/* HERO / DROP */}
        <View style={styles.hero}>
          <Text style={styles.kicker}>STAYUNKNOWN</Text>

          <Text style={styles.heroTitle}>NEW DROP</Text>

          <Text style={styles.heroDescription}>
            Move in silence. Limited pieces. No restocks.
          </Text>

          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>SHOP THE DROP</Text>
          </Pressable>
        </View>

        {/* COLLECTIONS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>COLLECTIONS</Text>

          <Pressable>
            <Text style={styles.viewAll}>VIEW ALL</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontal}
        >
          <Pressable style={styles.collection}>
            <Text style={styles.collectionTitle}>NEW DROP</Text>
            <Text style={styles.collectionArrow}>→</Text>
          </Pressable>

          <Pressable style={styles.collection}>
            <Text style={styles.collectionTitle}>ESSENTIALS</Text>
            <Text style={styles.collectionArrow}>→</Text>
          </Pressable>

          <Pressable style={styles.collection}>
            <Text style={styles.collectionTitle}>LIMITED</Text>
            <Text style={styles.collectionArrow}>→</Text>
          </Pressable>
        </ScrollView>

        {/* NEW ARRIVALS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>NEW ARRIVALS</Text>

          <Pressable>
            <Text style={styles.viewAll}>VIEW ALL</Text>
          </Pressable>
        </View>

        <View style={styles.productGrid}>
          <Pressable style={styles.product}>
            <View style={styles.productImage}>
              <Text style={styles.imagePlaceholder}>STAYUNKNOWN</Text>

              <View style={styles.wishlist}>
                <Text style={styles.heart}>♡</Text>
              </View>
            </View>

            <Text style={styles.productName}>UNKNOWN TEE</Text>
            <Text style={styles.productPrice}>₦45,000</Text>
          </Pressable>

          <Pressable style={styles.product}>
            <View style={styles.productImage}>
              <Text style={styles.imagePlaceholder}>STAYUNKNOWN</Text>

              <View style={styles.wishlist}>
                <Text style={styles.heart}>♡</Text>
              </View>
            </View>

            <Text style={styles.productName}>SIGNATURE HOODIE</Text>
            <Text style={styles.productPrice}>₦85,000</Text>
          </Pressable>
        </View>

        {/* BRAND STATEMENT */}
        <View style={styles.statement}>
          <Text style={styles.statementTitle}>MOVE IN SILENCE.</Text>

          <Text style={styles.statementText}>
            STAYUNKNOWN is built for those who don't need to be seen to be
            remembered.
          </Text>
        </View>
      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <Pressable>
          <Text style={styles.activeNav}>HOME</Text>
        </Pressable>

        <Pressable>
          <Text style={styles.nav}>SHOP</Text>
        </Pressable>

        <Pressable>
          <Text style={styles.nav}>♡</Text>
        </Pressable>

        <Pressable>
          <Text style={styles.nav}>BAG</Text>
        </Pressable>

        <Pressable>
          <Text style={styles.nav}>ACCOUNT</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  content: {
    paddingBottom: 100,
  },

  header: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  logo: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 2.5,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },

  icon: {
    color: '#fff',
    fontSize: 23,
  },

  hero: {
    minHeight: 440,
    marginHorizontal: 16,
    padding: 24,
    backgroundColor: '#181818',
    justifyContent: 'flex-end',
  },

  kicker: {
    color: '#999',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
  },

  heroTitle: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 1,
  },

  heroDescription: {
    color: '#bbb',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 24,
    maxWidth: 300,
  },

  primaryButton: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    paddingHorizontal: 22,
    paddingVertical: 15,
  },

  primaryButtonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },

  sectionHeader: {
    marginTop: 34,
    marginBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  viewAll: {
    color: '#888',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },

  horizontal: {
    paddingHorizontal: 20,
    gap: 10,
  },

  collection: {
    width: 160,
    height: 190,
    backgroundColor: '#171717',
    padding: 15,
    justifyContent: 'space-between',
  },

  collectionTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },

  collectionArrow: {
    color: '#fff',
    fontSize: 22,
  },

  productGrid: {
    flexDirection: 'row',
    paddingHorizontal: 12,
  },

  product: {
    width: '50%',
    paddingHorizontal: 8,
  },

  productImage: {
    height: 230,
    backgroundColor: '#181818',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  imagePlaceholder: {
    color: '#555',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  wishlist: {
    position: 'absolute',
    top: 12,
    right: 12,
  },

  heart: {
    color: '#fff',
    fontSize: 23,
  },

  productName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 10,
  },

  productPrice: {
    color: '#999',
    fontSize: 12,
    marginTop: 5,
  },

  statement: {
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 30,
    alignItems: 'center',
  },

  statementTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },

  statementText: {
    color: '#888',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 14,
    maxWidth: 320,
  },

  bottomNav: {
    height: 72,
    backgroundColor: '#050505',
    borderTopWidth: 1,
    borderTopColor: '#222',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  activeNav: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  nav: {
    color: '#777',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
