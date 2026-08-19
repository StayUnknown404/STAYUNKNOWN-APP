import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Pressable, Image } from 'react-native';
import {
  getCart,
  getCartTotal,
  getCartCount,
  updateCartQuantity,
  removeFromCart,
  toggleWishlist,
} from '../services/store';

type Props = { onBack: () => void; onCheckout: () => void };

export default function Bag({ onBack, onCheckout }: Props) {
  const [, refresh] = useState(0);
  const cart = getCart();
  const total = getCartTotal();
  const bump = () => refresh(value => value + 1);

  const setQuantity = (productId: string, size: string, color: string, quantity: number) => {
    updateCartQuantity(productId, size, color, quantity);
    bump();
  };

  const saveForLater = (productId: string, size: string, color: string) => {
    const item = getCart().find(entry => entry.product.id === productId && entry.size === size && entry.color === color);
    if (!item) return;
    toggleWishlist(item.product);
    removeFromCart(productId, size, color);
    bump();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={onBack} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back">
            <Text style={styles.back}>← BACK</Text>
          </Pressable>
          <Text style={styles.title}>404 BAG · {getCartCount()}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {cart.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyBagIcon}>
              <View style={styles.handle} />
              <View style={styles.bagBody}><Text style={styles.bag404}>404</Text></View>
            </View>
            <Text style={styles.emptyTitle}>YOUR 404 BAG IS EMPTY</Text>
            <Text style={styles.emptyText}>Discover the latest STAYUNKNOWN pieces.</Text>
            <Pressable style={styles.white} onPress={onBack}>
              <Text style={styles.black}>CONTINUE SHOPPING</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.sectionIntro}>
              <Text style={styles.sectionTitle}>YOUR PICKS</Text>
              <Text style={styles.sectionCount}>{getCartCount()} ITEM{getCartCount() === 1 ? '' : 'S'}</Text>
            </View>

            {cart.map(item => {
              const stock = typeof item.product.stock === 'number' ? Math.max(0, item.product.stock) : undefined;
              const maxQuantity = stock === undefined ? 20 : Math.min(20, stock);
              const soldOut = stock === 0 || item.product.comingSoon;
              const atMax = maxQuantity > 0 && item.quantity >= maxQuantity;

              return (
                <View key={`${item.product.id}-${item.size}-${item.color}`} style={styles.item}>
                  <View style={styles.image}>
                    {item.product.image ? (
                      <Image source={{ uri: item.product.image }} style={styles.imageActual} resizeMode="cover" />
                    ) : (
                      <Text style={styles.placeholder}>STAYUNKNOWN</Text>
                    )}
                    {item.product.comingSoon && (
                      <View style={styles.imageBadge}><Text style={styles.imageBadgeText}>COMING SOON</Text></View>
                    )}
                    {!item.product.comingSoon && stock === 0 && (
                      <View style={styles.imageBadge}><Text style={styles.imageBadgeText}>SOLD OUT</Text></View>
                    )}
                  </View>

                  <View style={styles.info}>
                    <View style={styles.nameRow}>
                      <Text style={styles.name} numberOfLines={2}>{item.product.name}</Text>
                      <Text style={styles.price}>₦{Number(item.product.price || 0).toLocaleString('en-NG')}</Text>
                    </View>
                    <Text style={styles.meta}>{item.color || 'STANDARD'} · {item.size || 'ONE SIZE'}</Text>

                    <View style={styles.stockRow}>
                      <View style={[styles.stockDot, { opacity: soldOut ? 1 : 0.65 }]} />
                      <Text style={styles.stockText}>
                        {item.product.comingSoon
                          ? 'COMING SOON'
                          : stock === 0
                            ? 'SOLD OUT'
                            : stock !== undefined && stock <= (item.product.lowStockThreshold || 3)
                              ? `ONLY ${stock} LEFT`
                              : 'AVAILABLE'}
                      </Text>
                    </View>

                    <View style={styles.controlsRow}>
                      <View style={[styles.qty, soldOut && styles.disabledControl]}>
                        <Pressable
                          style={styles.qtyBtn}
                          disabled={soldOut}
                          onPress={() => setQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                          accessibilityRole="button"
                          accessibilityLabel={`Decrease ${item.product.name} quantity`}
                        >
                          <Text style={styles.qtyText}>−</Text>
                        </Pressable>
                        <Text style={styles.qtyNumber}>{item.quantity}</Text>
                        <Pressable
                          style={styles.qtyBtn}
                          disabled={soldOut || atMax}
                          onPress={() => setQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                          accessibilityRole="button"
                          accessibilityLabel={`Increase ${item.product.name} quantity`}
                        >
                          <Text style={[styles.qtyText, (soldOut || atMax) && styles.muted]}>+</Text>
                        </Pressable>
                      </View>
                      <Text style={styles.lineTotal}>
                        ₦{(Number(item.product.price || 0) * item.quantity).toLocaleString('en-NG')}
                      </Text>
                    </View>

                    <View style={styles.actions}>
                      <Pressable onPress={() => saveForLater(item.product.id, item.size, item.color)}>
                        <Text style={styles.actionText}>♡ SAVE FOR LATER</Text>
                      </Pressable>
                      <Pressable onPress={() => { removeFromCart(item.product.id, item.size, item.color); bump(); }}>
                        <Text style={styles.actionText}>REMOVE</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}

            <View style={styles.summary}>
              <View style={styles.row}>
                <Text style={styles.summaryLabel}>SUBTOTAL</Text>
                <Text style={styles.summaryValue}>₦{total.toLocaleString('en-NG')}</Text>
              </View>
              <Text style={styles.shipping}>Shipping and final payment details are calculated at checkout.</Text>
              <Pressable style={styles.checkout} onPress={onCheckout}>
                <Text style={styles.checkoutText}>CHECKOUT →</Text>
              </Pressable>
              <Pressable style={styles.continue} onPress={onBack}>
                <Text style={styles.continueText}>CONTINUE SHOPPING</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { paddingBottom: 60 },
  header: { height: 70, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerSpacer: { width: 45 },
  back: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  title: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  sectionIntro: { paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
  sectionCount: { color: '#666', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  empty: { minHeight: 520, justifyContent: 'center', alignItems: 'center', padding: 25 },
  emptyBagIcon: { width: 62, height: 66, alignItems: 'center', marginBottom: 25 },
  handle: { width: 26, height: 12, borderWidth: 2, borderBottomWidth: 0, borderColor: '#fff', borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  bagBody: { width: 56, height: 45, borderWidth: 1.5, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  bag404: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  emptyTitle: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 1, textAlign: 'center' },
  emptyText: { color: '#777', fontSize: 14, textAlign: 'center', marginTop: 10, marginBottom: 25 },
  white: { backgroundColor: '#fff', paddingVertical: 16, paddingHorizontal: 20 },
  black: { color: '#000', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  item: { padding: 16, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#1d1d1d' },
  image: { width: 125, height: 155, backgroundColor: '#151515', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  imageActual: { width: '100%', height: '100%' },
  placeholder: { color: '#555', fontSize: 8, fontWeight: '900' },
  imageBadge: { position: 'absolute', left: 6, right: 6, bottom: 6, backgroundColor: '#000', paddingVertical: 5, alignItems: 'center' },
  imageBadgeText: { color: '#fff', fontSize: 7, fontWeight: '900', letterSpacing: 1 },
  info: { flex: 1, paddingLeft: 15 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  name: { color: '#fff', fontSize: 14, fontWeight: '900', flex: 1 },
  price: { color: '#aaa', fontSize: 12, fontWeight: '800' },
  meta: { color: '#666', fontSize: 11, marginTop: 7 },
  stockRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  stockDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#fff', marginRight: 6 },
  stockText: { color: '#777', fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  controlsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 13 },
  qty: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  disabledControl: { opacity: 0.45 },
  qtyBtn: { width: 29, height: 29, alignItems: 'center', justifyContent: 'center' },
  qtyText: { color: '#fff', fontSize: 18, lineHeight: 20 },
  muted: { color: '#555' },
  qtyNumber: { color: '#fff', width: 32, textAlign: 'center', fontSize: 11, fontWeight: '800' },
  lineTotal: { color: '#fff', fontSize: 12, fontWeight: '900' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  actionText: { color: '#666', fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  summary: { padding: 20, paddingTop: 30 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  summaryValue: { color: '#fff', fontSize: 15, fontWeight: '900' },
  shipping: { color: '#666', fontSize: 12, lineHeight: 18, marginTop: 10 },
  checkout: { backgroundColor: '#fff', paddingVertical: 17, alignItems: 'center', marginTop: 25 },
  checkoutText: { color: '#000', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  continue: { paddingVertical: 17, alignItems: 'center', marginTop: 4 },
  continueText: { color: '#777', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
});
