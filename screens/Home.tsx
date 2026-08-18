import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  Image,
  TextInput,
} from 'react-native';
import { getCatalog, Product } from '../services/api';
import {
  getWishlist,
  isWishlisted,
  toggleWishlist,
} from '../services/store';
import ProductDetails from './ProductDetails';
import AdminProducts from './AdminProducts';
import Bag from './Bag';
import {
  createAccount,
  login,
  logout,
  auth,
} from '../services/firebase';

import {
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { checkAdmin } from '../services/admin';
type Tab =
  | 'home'
  | 'shop'
  | 'wishlist'
  | 'bag'
  | 'account'
  | 'admin-products';

export default function Home() {
  const [tab, setTab] = useState<Tab>('home');
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [wishlist, setWishlist] = useState<Product[]>(
    getWishlist()
  );
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [showBag, setShowBag] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    let mounted = true;
    async function check() {
      if (!user) {
        if (mounted) setIsAdmin(false);
        return;
      }

      try {
        const res = await checkAdmin();
        if (mounted) setIsAdmin(Boolean(res?.isAdmin));
      } catch (err) {
        console.warn('Admin check failed', err);
        if (mounted) setIsAdmin(false);
      }
    }

    check();

    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      setError('');

      const catalog = await getCatalog();
      setProducts(catalog);
    } catch (err) {
      console.error('Catalog loading error:', err);
      setError('Unable to load products right now.');
    } finally {
      setLoading(false);
    }
  }
  async function handleAuth() {
    if (!authEmail.trim() || !authPassword) {
      setAuthMessage('Enter your email and password.');
      return;
    }

    try {
      setAuthLoading(true);
      setAuthMessage('');

      if (authMode === 'signup') {
        await createAccount(
          authEmail.trim(),
          authPassword
        );

        setAuthMessage('Account created successfully.');
      } else {
        await login(
          authEmail.trim(),
          authPassword
        );

        setAuthMessage('Welcome back.');
      }

      setAuthPassword('');
    } catch (error: any) {
      console.error('Authentication error:', error);

      setAuthMessage(
        error?.message?.includes('auth/invalid-credential')
          ? 'Email or password is incorrect.'
          : error?.message ||
            'Unable to complete authentication.'
      );
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
      setAuthMessage('');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  function handleWishlistToggle(product: Product) {
    const updatedWishlist = toggleWishlist(product);
    setWishlist([...updatedWishlist]);
  }

  const availableProducts = products.filter(
    product => !product.comingSoon
  );

  const openProduct = (product: Product) => {
    setShowBag(false);
  };

  const openBag = () => {
    setSelectedProduct(null);
    setShowBag(true);
    setTab('bag');
  };

  const renderProducts = (items: Product[]) => {
    if (loading) {
      return (
        <View style={styles.loadingBox}>
          <ActivityIndicator color="#fff" />
          <Text style={styles.loadingText}>
            LOADING PRODUCTS
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.loadingBox}>
          <Text style={styles.errorText}>{error}</Text>

          <Pressable
            style={styles.outlineButton}
            onPress={loadProducts}
          >
            <Text style={styles.whiteButtonText}>
              TRY AGAIN
            </Text>
          </Pressable>
        </View>
      );
    }

    if (items.length === 0) {
      return (
        <View style={styles.loadingBox}>
          <Text style={styles.emptyText}>
            No products available right now.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.productGrid}>
        {items.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onPress={() => setSelectedProduct(product)}
            onWishlist={() => handleWishlistToggle(product)}
            wishlisted={wishlist.some(
              item => item.id === product.id
            )}
          />
        ))}
      </View>
    );
  };

  const renderContent = () => {
    if (selectedProduct) {
      return (
        <ProductDetails
          product={selectedProduct}
          onBack={() => setSelectedProduct(null)}
          onBag={openBag}
        />
      );
    }

    if (showBag) {
      return (
        <Bag
          onBack={() => setShowBag(false)}
          onCheckout={() => {}}
        />
      );
    }

    if (tab === 'shop') {
      return (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <PageHeader title="SHOP" />

          <View style={styles.searchBox}>
            <Text style={styles.searchText}>
              Search products
            </Text>

            <Text style={styles.searchIcon}>⌕</Text>
          </View>

          <SectionTitle title="COLLECTIONS" />

          <View style={styles.collectionGrid}>
            {getCollections(products).map(collection => (
              <CollectionCard
                key={collection}
                title={collection}
              />
            ))}
          </View>

          <SectionTitle title="ALL PRODUCTS" />

          {renderProducts(availableProducts)}
        </ScrollView>
      );
    }

    if (tab === 'wishlist') {
      return (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <PageHeader title="WISHLIST" />

          {wishlist.length === 0 ? (
            <View style={styles.emptyScreen}>
              <Text style={styles.largeTitle}>
                NOTHING SAVED
              </Text>

              <Text style={styles.emptyText}>
                Save pieces you want to come back to.
              </Text>

              <Pressable
                style={styles.whiteButton}
                onPress={() => setTab('shop')}
              >
                <Text style={styles.blackButtonText}>
                  EXPLORE SHOP
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={styles.wishlistCount}>
                {wishlist.length}{' '}
                {wishlist.length === 1
                  ? 'ITEM'
                  : 'ITEMS'}{' '}
                SAVED
              </Text>

              <View style={styles.productGrid}>
                {wishlist.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onPress={() =>
                      setSelectedProduct(product)
                    }
                    onWishlist={() =>
                      handleWishlistToggle(product)
                    }
                    wishlisted={true}
                  />
                ))}
              </View>
            </>
          )}
        </ScrollView>
      );
    }

    if (tab === 'bag') {
      return (
        <Bag
          onBack={() => setShowBag(false)}
          onCheckout={() => {}}
        />
      );
    }
    if (tab === 'admin-products') {
      return (
        <AdminProducts
          onBack={() => setTab('account')}
        />
      );
    }
    if (tab === 'account') {
      return (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <PageHeader title="ACCOUNT" />

          {user ? (
            <>
              <View style={styles.accountIntro}>
                <Text style={styles.accountTitle}>
                  WELCOME
                </Text>

                <Text style={styles.accountSubtitle}>
                  {user.email}
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
              {isAdmin && (
                <Pressable
                  style={styles.accountRow}
                  onPress={() => setTab('admin-products')}
                >
                  <Text style={styles.accountRowText}>ADMIN</Text>

                  <Text style={styles.accountArrow}>→</Text>
                </Pressable>
              )}
              <View style={styles.accountActions}>
                <Pressable
                  style={styles.whiteButton}
                  onPress={handleLogout}
                >
                  <Text style={styles.blackButtonText}>
                    LOG OUT
                  </Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <View style={styles.accountIntro}>
                <Text style={styles.accountTitle}>
                  STAYUNKNOWN
                </Text>

                <Text style={styles.accountSubtitle}>
                  {authMode === 'login'
                    ? 'Sign in to your account.'
                    : 'Create your STAYUNKNOWN account.'}
                </Text>
              </View>

              <View style={styles.authBox}>
                <Text style={styles.authLabel}>
                  EMAIL
                </Text>

                <TextInput
                  style={styles.authInput}
                  value={authEmail}
                  onChangeText={setAuthEmail}
                  placeholder="you@example.com"
                  placeholderTextColor="#555"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                <Text style={styles.authLabel}>
                  PASSWORD
                </Text>

                <TextInput
                  style={styles.authInput}
                  value={authPassword}
                  onChangeText={setAuthPassword}
                  placeholder="Password"
                  placeholderTextColor="#555"
                  secureTextEntry
                />

                {authMessage ? (
                  <Text style={styles.authMessage}>
                    {authMessage}
                  </Text>
                ) : null}

                <Pressable
                  style={styles.whiteButton}
                  onPress={handleAuth}
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <Text style={styles.blackButtonText}>
                      {authMode === 'login'
                        ? 'SIGN IN'
                        : 'CREATE ACCOUNT'}
                    </Text>
                  )}
                </Pressable>

                <Pressable
                  style={styles.authSwitch}
                  onPress={() => {
                    setAuthMode(
                      authMode === 'login'
                        ? 'signup'
                        : 'login'
                    );
                    setAuthMessage('');
                  }}
                >
                  <Text style={styles.authSwitchText}>
                    {authMode === 'login'
                      ? 'CREATE A NEW ACCOUNT'
                      : 'ALREADY HAVE AN ACCOUNT? SIGN IN'}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.outlineButton}
                  onPress={() => setTab('home')}
                >
                  <Text style={styles.whiteButtonText}>
                    CONTINUE AS GUEST
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      );
    }

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>
            STAYUNKNOWN
          </Text>

          <View style={styles.headerActions}>
            <Text style={styles.headerIcon}>⌕</Text>
            <Text style={styles.headerIcon}>♡</Text>
            <Pressable onPress={openBag}>
              <Text style={styles.headerIcon}>▢</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroKicker}>
            STAYUNKNOWN
          </Text>

          <Text style={styles.heroTitle}>
            MOVE IN SILENCE.
          </Text>

          <Text style={styles.heroDescription}>
            New pieces. Limited drops. Built for those who
            don't need to be seen.
          </Text>

          <Pressable
            style={styles.whiteButton}
            onPress={() => setTab('shop')}
          >
            <Text style={styles.blackButtonText}>
              SHOP THE DROP
            </Text>
          </Pressable>
        </View>

        <SectionTitle title="LATEST DROP" />

        <View style={styles.featureCard}>
          <Text style={styles.featureLabel}>
            NEW
          </Text>

          <Text style={styles.featureTitle}>
            UNKNOWN
          </Text>

          <Text style={styles.featureSubtitle}>
            The latest STAYUNKNOWN pieces.
          </Text>

          <Pressable
            style={styles.outlineButton}
            onPress={() => setTab('shop')}
          >
            <Text style={styles.whiteButtonText}>
              VIEW DROP
            </Text>
          </Pressable>
        </View>

        <SectionTitle title="COLLECTIONS" />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontal}
        >
          {getCollections(products).map(collection => (
            <CollectionCard
              key={collection}
              title={collection}
            />
          ))}
        </ScrollView>

        <SectionTitle title="BEST SELLERS" />

        {renderProducts(availableProducts.slice(0, 4))}

        <View style={styles.statement}>
          <Text style={styles.statementTitle}>
            MOVE IN SILENCE.
          </Text>

          <Text style={styles.statementText}>
            STAYUNKNOWN is an independent streetwear brand
            from Lagos, available worldwide.
          </Text>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.main}>
        {renderContent()}
      </View>

      {!selectedProduct && !showBag && (
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
            onPress={openBag}
          />

          <NavItem
            label="ACCOUNT"
            active={tab === 'account'}
            onPress={() => setTab('account')}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

function getCollections(products: Product[]) {
  const collections = products
    .map(product => product.collection)
    .filter(
      (collection): collection is string =>
        Boolean(collection)
    );

  return Array.from(new Set(collections));
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
      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      <Text style={styles.sectionArrow}>→</Text>
    </View>
  );
}

function CollectionCard({ title }: { title: string }) {
  return (
    <Pressable style={styles.collection}>
      <Text style={styles.collectionTitle}>
        {title}
      </Text>

      <Text style={styles.collectionArrow}>
        →
      </Text>
    </Pressable>
  );
}

function ProductCard({
  product,
  onPress,
  onWishlist,
  wishlisted,
}: {
  product: Product;
  onPress: () => void;
  onWishlist: () => void;
  wishlisted: boolean;
}) {
  const isLowStock =
    typeof product.stock === 'number' &&
    typeof product.lowStockThreshold === 'number' &&
    product.stock > 0 &&
    product.stock <= product.lowStockThreshold;

  return (
    <Pressable
      style={styles.product}
      onPress={onPress}
    >
      <View style={styles.productImage}>
        {product.image ? (
          <Image
            source={{ uri: product.image }}
            style={styles.productImageActual}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.placeholder}>
            STAYUNKNOWN
          </Text>
        )}

        <Pressable
          style={styles.productHeart}
          onPress={onWishlist}
          hitSlop={10}
        >
          <Text style={styles.heart}>{wishlisted ? '♥' : '♡'}</Text>
        </Pressable>
        {isLowStock && (
          <View style={styles.stockBadge}>
            <Text style={styles.stockText}>LOW STOCK</Text>
          </View>
        )}

        {product.stock === 0 && (
          <View style={styles.stockBadge}>
            <Text style={styles.stockText}>SOLD OUT</Text>
          </View>
        )}
      </View>

      <Text style={styles.productName}>{product.name}</Text>

      <Text style={styles.productPrice}>₦{product.price.toLocaleString('en-NG')}</Text>

      {product.colors?.length > 0 && (
        <Text style={styles.productMeta}>{product.colors.length} colours</Text>
      )}
    </Pressable>
  );
}

function AccountRow({ title }: { title: string }) {
  return (
    <Pressable style={styles.accountRow}>
      <Text style={styles.accountRowText}>
        {title}
      </Text>

      <Text style={styles.accountArrow}>→</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wishlistCount: {
    color: '#666',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
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

