import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import {
  getCart,
  getCartTotal,
  updateCartQuantity,
  removeFromCart,
} from '../services/store';

type Props = {
  onBack: () => void;
  onCheckout: () => void;
};

export default function Bag({
  onBack,
  onCheckout,
}: Props) {
  const cart = getCart();
  const total = getCartTotal();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Pressable onPress={onBack}>
            <Text style={styles.back}>← BACK</Text>
          </Pressable>

          <Text style={styles.title}>YOUR BAG</Text>

          <View style={{ width: 45 }} />
        </View>

        {cart.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              YOUR BAG IS EMPTY
            </Text>

            <Text style={styles.emptyText}>
              Discover the latest STAYUNKNOWN pieces.
            </Text>

            <Pressable
              style={styles.whiteButton}
              onPress={onBack}
            >
              <Text style={styles.blackText}>
                CONTINUE SHOPPING
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            {cart.map(item => (
              <View
                key={`${item.product.id}-${item.size}-${item.color}`}
                style={styles.item}
              >
                <View style={styles.image}>
                  <Text style={styles.placeholder}>
                    STAYUNKNOWN
                  </Text>
                </View>

                <View style={styles.itemInfo}>
                  <Text style={styles.name}>
                    {item.product.name}
                  </Text>

                  <Text style={styles.price}>
                    ₦{item.product.price.toLocaleString('en-NG')}
                  </Text>

                  <Text style={styles.meta}>
                    {item.color} · {item.size}
                  </Text>

                  <View style={styles.quantityRow}>
                    <Pressable
                      style={styles.quantityButton}
                      onPress={() =>
                        updateCartQuantity(
                          item.product.id,
                          item.size,
                          item.color,
                          item.quantity - 1
                        )
                      }
                    >
                      <Text style={styles.quantityText}>
                        −
                      </Text>
                    </Pressable>

                    <Text style={styles.quantity}>
                      {item.quantity}
                    </Text>

                    <Pressable
                      style={styles.quantityButton}
                      onPress={() =>
                        updateCartQuantity(
                          item.product.id,
                          item.size,
                          item.color,
                          item.quantity + 1
                        )
                      }
                    >
                      <Text style={styles.quantityText}>
                        +
                      </Text>
                    </Pressable>
                  </View>

                  <Pressable
                    onPress={() =>
                      removeFromCart(
                        item.product.id,
                        item.size,
                        item.color
                      )
                    }
                  >
                    <Text style={styles.remove}>
                      REMOVE
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}

            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  SUBTOTAL
                </Text>

                <Text style={styles.summaryValue}>
                  ₦{total.toLocaleString('en-NG')}
                </Text>
              </View>

              <Text style={styles.shipping}>
                Shipping and final payment details are
                calculated at checkout.
              </Text>

              <Pressable
                style={styles.checkout}
                onPress={onCheckout}
              >
                <Text style={styles.checkoutText}>
                  CHECKOUT →
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  content: {
    paddingBottom: 50,
  },

  header: {
    height: 70,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  back: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  title: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 1,
  },

  empty: {
    minHeight: 500,
    paddingHorizontal: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },

  emptyText: {
    color: '#777',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 25,
  },

  whiteButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  blackText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  item: {
    paddingHorizontal: 16,
    paddingVertical: 15,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1c1c1c',
  },

  image: {
    width: 125,
    height: 155,
    backgroundColor: '#181818',
    alignItems: 'center',
    justifyContent: 'center',
  },

  placeholder: {
    color: '#555',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },

  itemInfo: {
    flex: 1,
    paddingLeft: 15,
  },

  name: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },

  price: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 5,
  },

  meta: {
    color: '#666',
    fontSize: 11,
    marginTop: 7,
  },

  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },

  quantityButton: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },

  quantityText: {
    color: '#fff',
    fontSize: 18,
  },

  quantity: {
    color: '#fff',
    width: 35,
    textAlign: 'center',
    fontSize: 12,
  },

  remove: {
    color: '#666',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 12,
  },

  summary: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  summaryLabel: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  summaryValue: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },

  shipping: {
    color: '#666',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },

  checkout: {
    backgroundColor: '#fff',
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 25,
  },

  checkoutText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
