import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';

type Tab = 'home' | 'shop' | 'wishlist' | 'bag' | 'account';

export default function Home() {
  const [tab, setTab] = useState<Tab>('home');

  const renderContent = () => {
    if (tab === 'shop') {
      return (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <PageHeader title="SHOP" />

          <View style={styles.searchBox}>
            <Text style={styles.searchText}>Search products</Text>
            <Text style={styles.searchIcon}>⌕</Text>
          </View>

          <SectionTitle title="COLLECTIONS" />

          <View style={styles.collectionGrid}>
            <CollectionCard title="NEW DROP" />
            <CollectionCard title="ESSENTIALS" />
            <CollectionCard title="TEES" />
            <CollectionCard title="HOODIES" />
          </View>

          <SectionTitle title="ALL PRODUCTS" />

          <View style={styles.productGrid}>
            <ProductCard name="UNKNOWN TEE" price="₦45,000" />
            <ProductCard name="SILENCE HOODIE" price="₦85,000" />
            <ProductCard name="TRACK PANTS" price="₦70,000" />
            <ProductCard name="UNKNOWN CAP" price="₦35,000" />
          </View>
        </ScrollView>
      );
    }

    if (tab === 'wishlist') {
      return (
        <View style={styles.emptyScreen}>
          <Text style={styles.largeTitle}>WISHLIST</Text>
          <Text style={styles.emptyText}>
            Save pieces you want to come back to.
          </Text>
          <Pressable
            style={styles.whiteButton}
            onPress={() => setTab('shop')}
          >
            <Text style={styles.blackButtonText}>EXPLORE SHOP</Text>
          </Pressable>
        </View>
      );
    }

    if (tab === 'bag') {
      return (
        <View style={styles.emptyScreen}>
          <Text style={styles.largeTitle}>YOUR BAG</Text>
          <Text style={styles.emptyText}>
            Your bag is empty.
          </Text>
          <Pressable
            style={styles.whiteButton}
            onPress={() => setTab('shop')}
          >
            <Text style={styles.blackButtonText}>START SHOPPING</Text>
          </Pressable>
        </View>
      );
    }

    if (tab === 'account') {
      return (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <PageHeader title="ACCOUNT" />

          <View style={styles.accountIntro}>
            <Text style={styles.accountTitle}>STAYUNKNOWN</Text>
            <Text style={styles.accountSubtitle}>
              Your account, orders and preferences.
            </Text>
          </View>

          <AccountRow title="My Orders" />
          <AccountRow title="Notifications" />
          <AccountRow title="Profile" />
          <AccountRow title="Help & Support" />
          <AccountRow title="About STAYUNKNOWN" />
          <AccountRow title="Socials" />
          <AccountRow title="Contact" />
          <AccountRow title="Terms & Privacy" />

          <View style={styles.accountActions}>
            <Pressable style={styles.whiteButton}>
              <Text style={styles.blackButtonText}>
                SIGN IN / CREATE ACCOUNT
              </Text>
            </Pressable>

            <Pressable style={styles.outlineButton}>
              <Text style={styles.whiteButtonText}>
                CONTINUE AS GUEST
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      );
    }

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>STAYUNKNOWN</Text>

          <View style={styles.headerActions}>
            <Text style={styles.headerIcon}>⌕</Text>
            <Text style={styles.headerIcon}>♡</Text>
            <Text style={styles.headerIcon}>▢</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroKicker}>STAYUNKNOWN</Text>

          <Text style={styles.heroTitle}>MOVE IN SILENCE.</Text>

          <Text style={styles.heroDescription}>
            New pieces. Limited drops. Built for those who don't need to be
            seen.
          </Text>

          <Pressable
            style={styles.whiteButton}
            onPress={() => setTab('shop')}
          >
            <Text style={styles.blackButtonText}>SHOP THE DROP</Text>
          </Pressable>
        </View>

        <SectionTitle title="LATEST DROP" />

        <View style={styles.featureCard}>
          <Text style={styles.featureLabel}>NEW</Text>
          <Text style={styles.featureTitle}>UNKNOWN</Text>
          <Text style={styles.featureSubtitle}>
            The latest STAYUNKNOWN pieces.
          </Text>

          <Pressable
            style={styles.outlineButton}
            onPress={() => setTab('shop')}
          >
            <Text style={styles.whiteButtonText}>VIEW DROP</Text>
          </Pressable>
        </View>

        <SectionTitle title="COLLECTIONS" />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontal}
        >
          <CollectionCard title="NEW DROP" />
          <CollectionCard title="ESSENTIALS" />
          <CollectionCard title="LIMITED" />
        </ScrollView>

        <SectionTitle title="BEST SELLERS" />

        <View style={styles.productGrid}>
          <ProductCard name="UNKNOWN TEE" price="₦45,000" />
          <ProductCard name="SILENCE HOODIE" price="₦85,000" />
        </View>

        <View style={styles.statement}>
          <Text style={styles.statementTitle}>MOVE IN SILENCE.</Text>
          <Text style={styles.statementText}>
            STAYUNKNOWN is an independent streetwear brand from Lagos,
            available worldwide.
          </Text>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.main}>{renderContent()}</View>

      <View style={styles.bottomNav}>
        <NavItem
          label="HOME"
          active={tab === 'home'}
          onPress={() => setTab('home')}
        />

        <NavItem
          label="SHOP"
          active={tab === 'shop'}
          onPress={() => setTab('shop')}
        />

        <NavItem
          label="♡"
          active={tab === 'wishlist'}
          onPress={() => setTab('wishlist')}
        />

        <NavItem
          label="BAG"
          active={tab === 'bag'}
          onPress={() => setTab('bag')}
        />

        <NavItem
          label="ACCOUNT"
          active={tab === 'account'}
          onPress={() => setTab('account')}
        />
      </View>
    </SafeAreaView>
  );
}

function PageHeader({ title }: { title: string }) {
  return (
    <View style={styles.pageHeader}>
      <Text style={styles.pageTitle}>{title}</Text>
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionArrow}>→</Text>
    </View>
  );
}

function CollectionCard({ title }: { title: string }) {
  return (
    <Pressable style={styles.collection}>
      <Text style={styles.collectionTitle}>{title}</Text>
      <Text style={styles.collectionArrow}>→</Text>
    </Pressable>
  );
}

function ProductCard({
  name,
  price,
}: {
  name: string;
  price: string;
}) {
  return (
    <Pressable style={styles.product}>
      <View style={styles.productImage}>
        <Text style={styles.placeholder}>STAYUNKNOWN</Text>

        <View style={styles.productHeart}>
          <Text style={styles.heart}>♡</Text>
        </View>
      </View>

      <Text style={styles.productName}>{name}</Text>
      <Text style={styles.productPrice}>{price}</Text>
    </Pressable>
  );
}

function AccountRow({ title }: { title: string }) {
  return (
    <Pressable style={styles.accountRow}>
      <Text style={styles.accountRowText}>{title}</Text>
      <Text style={styles.accountArrow}>→</Text>
    </Pressable>
  );
}

function NavItem({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.navItem}>
      <Text style={active ? styles.navActive : styles.navText}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  main: {
    flex: 1,
  },

  content: {
    paddingBottom: 35,
  },

  header: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  logo: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 2.5,
  },

  headerActions: {
    flexDirection: 'row',
    gap: 18,
  },

  headerIcon: {
    color: '#fff',
    fontSize: 22,
  },

  hero: {
    minHeight: 430,
    marginHorizontal: 16,
    padding: 24,
    backgroundColor: '#181818',
    justifyContent: 'flex-end',
  },

  heroKicker: {
    color: '#999',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 10,
  },

  heroTitle: {
    color: '#fff',
    fontSize: 40,
    lineHeight: 45,
    fontWeight: '900',
    letterSpacing: 1,
  },

  heroDescription: {
    color: '#aaa',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    marginBottom: 24,
    maxWidth: 320,
  },

  whiteButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignSelf: 'flex-start',
  },

  blackButtonText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  outlineButton: {
    borderWidth: 1,
    borderColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignSelf: 'flex-start',
  },

  whiteButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 32,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  sectionArrow: {
    color: '#777',
    fontSize: 18,
  },

  featureCard: {
    marginHorizontal: 16,
    minHeight: 250,
    padding: 22,
    backgroundColor: '#151515',
    justifyContent: 'flex-end',
  },

  featureLabel: {
    color: '#777',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },

  featureTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1,
  },

  featureSubtitle: {
    color: '#999',
    marginTop: 6,
    marginBottom: 20,
  },

  horizontal: {
    paddingHorizontal: 20,
    gap: 10,
  },

  collectionGrid: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  collection: {
    width: 155,
    height: 175,
    backgroundColor: '#171717',
    padding: 15,
    justifyContent: 'space-between',
  },

  collectionTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },

  collectionArrow: {
    color: '#fff',
    fontSize: 20,
  },

  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },

  product: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 22,
  },

  productImage: {
    height: 220,
    backgroundColor: '#181818',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  placeholder: {
    color: '#555',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  productHeart: {
    position: 'absolute',
    top: 10,
    right: 10,
  },

  heart: {
    color: '#fff',
    fontSize: 22,
  },

  productName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 9,
  },

  productPrice: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },

  statement: {
    paddingHorizontal: 24,
    paddingVertical: 65,
    alignItems: 'center',
  },

  statementTitle: {
    color: '#fff',
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },

  statementText: {
    color: '#777',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 330,
  },

  pageHeader: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 20,
  },

  pageTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
  },

  searchBox: {
    marginHorizontal: 20,
    height: 52,
    borderWidth: 1,
    borderColor: '#292929',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  searchText: {
    color: '#666',
    fontSize: 14,
  },

  searchIcon: {
    color: '#fff',
    fontSize: 22,
  },

  emptyScreen: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },

  largeTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1,
  },

  emptyText: {
    color: '#888',
    fontSize: 15,
    marginTop: 10,
    marginBottom: 25,
  },

  accountIntro: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  accountTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },

  accountSubtitle: {
    color: '#777',
    marginTop: 6,
    lineHeight: 21,
  },

  accountRow: {
    marginHorizontal: 20,
    paddingVertical: 19,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e1e',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  accountRowText: {
    color: '#fff',
    fontSize: 14,
  },

  accountArrow: {
    color: '#666',
  },

  accountActions: {
    paddingHorizontal: 20,
    paddingTop: 30,
    gap: 12,
  },

  bottomNav: {
    height: 70,
    backgroundColor: '#050505',
    borderTopWidth: 1,
    borderTopColor: '#202020',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  navItem: {
    minWidth: 55,
    alignItems: 'center',
  },

  navActive: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  navText: {
    color: '#666',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
