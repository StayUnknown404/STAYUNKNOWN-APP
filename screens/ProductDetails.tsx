import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Image
} from 'react-native';
import { Product } from '../services/api';
import {
  addToCart,
  isWishlisted,
  toggleWishlist,
} from '../services/store';

type Props = {
  product: Product;
  onBack: () => void;
  onBag: () => void;
};

export default function ProductDetails({
  product,
  onBack,
  onBag,
}: Props) {
  const [selectedSize, setSelectedSize] = useState(
    product.sizes?.[0] || ''
  );

  const [selectedColor, setSelectedColor] = useState(
    product.colors?.[0] || ''
  );

  const [saved, setSaved] = useState(
    isWishlisted(product.id)
  );

  const [added, setAdded] = useState(false);

  const soldOut =
    typeof product.stock === 'number' &&
    product.stock <= 0;

  const lowStock =
    typeof product.stock === 'number' &&
    typeof product.lowStockThreshold === 'number' &&
    product.stock > 0 &&
    product.stock <= product.lowStockThreshold;

  function handleWishlist() {
    toggleWishlist(product);
    setSaved(isWishlisted(product.id));
  }

  function handleAddToBag() {
    if (soldOut) return;

    addToCart(
      product,
      selectedSize,
      selectedColor,
      1
    );

    setAdded(true);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.topBar}>
          <Pressable onPress={onBack}>
            <Text style={styles.back}>← BACK</Text>
          </Pressable>

          <Pressable onPress={handleWishlist}>
            <Text style={styles.heart}>
              {saved ? '♥' : '♡'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.image}>
  {product.image ? (
    <Image
      source={{ uri: product.image }}
      style={styles.imageActual}
      resizeMode="cover"
    />
  ) : (
    <Text style={styles.placeholder}>
      STAYUNKNOWN
    </Text>
  )}
</View>

        <View style={styles.details}>
          <Text style={styles.collection}>
            {product.collection || product.category || 'STAYUNKNOWN'}
          </Text>

          <Text style={styles.name}>
            {product.name}
          </Text>

          <Text style={styles.price}>
            ₦{product.price.toLocaleString('en-NG')}
          </Text>

          {lowStock && (
            <Text style={styles.lowStock}>
              LOW STOCK — {product.stock} LEFT
            </Text>
          )}

          {soldOut && (
            <Text style={styles.soldOut}>
              SOLD OUT
            </Text>
          )}

          <View style={styles.divider} />

          <Text style={styles.label}>COLOUR</Text>

          <View style={styles.options}>
            {(product.colors || []).map(color => (
              <Pressable
                key={color}
                onPress={() => setSelectedColor(color)}
                style={[
                  styles.option,
                  selectedColor === color &&
                    styles.optionSelected,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedColor === color &&
                      styles.optionTextSelected,
                  ]}
                >
                  {color}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>SIZE</Text>

          <View style={styles.options}>
            {(product.sizes || []).map(size => (
              <Pressable
                key={size}
                onPress={() => setSelectedSize(size)}
                style={[
                  styles.option,
                  selectedSize === size &&
                    styles.optionSelected,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedSize === size &&
                      styles.optionTextSelected,
                  ]}
                >
                  {size}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.actions}>
            <Pressable
              style={[
                styles.addButton,
                soldOut && styles.disabled,
              ]}
              onPress={handleAddToBag}
              disabled={soldOut}
            >
              <Text style={styles.addText}>
                {soldOut
                  ? 'SOLD OUT'
                  : added
                  ? 'ADDED TO BAG'
                  : 'ADD TO BAG'}
              </Text>
            </Pressable>

            {added && (
              <Pressable
                style={styles.bagButton}
                onPress={onBag}
              >
                <Text style={styles.bagText}>
                  VIEW BAG →
                </Text>
              </Pressable>
            )}
          </View>

          <View style={styles.info}>
            <Text style={styles.infoTitle}>
              PRODUCT DETAILS
            </Text>

            <Text style={styles.infoText}>
              Designed for the STAYUNKNOWN uniform.
              Select your preferred colour and size
              before adding to your bag.
            </Text>
          </View>
        </View>
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

  topBar: {
    height: 65,
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

  heart: {
    color: '#fff',
    fontSize: 28,
  },

  image: {
    height: 440,
    marginHorizontal: 12,
    backgroundColor: '#181818',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageActual: {
  width: '100%',
  height: '100%',
  },
  placeholder: {
    color: '#555',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },

  details: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },

  collection: {
    color: '#777',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  name: {
    color: '#fff',
    fontSize: 25,
    fontWeight: '900',
    marginTop: 7,
  },

  price: {
    color: '#aaa',
    fontSize: 16,
    marginTop: 8,
  },

  lowStock: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 12,
  },

  soldOut: {
    color: '#777',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 12,
  },

  divider: {
    height: 1,
    backgroundColor: '#222',
    marginVertical: 25,
  },

  label: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 12,
    marginTop: 12,
  },

  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },

  option: {
    minWidth: 58,
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },

  optionSelected: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },

  optionText: {
    color: '#aaa',
    fontSize: 11,
    fontWeight: '700',
  },

  optionTextSelected: {
    color: '#000',
  },

  actions: {
    marginTop: 25,
    gap: 12,
  },

  addButton: {
    backgroundColor: '#fff',
    paddingVertical: 17,
    alignItems: 'center',
  },

  disabled: {
    backgroundColor: '#222',
  },

  addText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },

  bagButton: {
    borderWidth: 1,
    borderColor: '#fff',
    paddingVertical: 16,
    alignItems: 'center',
  },

  bagText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  info: {
    marginTop: 35,
    paddingTop: 25,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },

  infoTitle: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  infoText: {
    color: '#777',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
});
