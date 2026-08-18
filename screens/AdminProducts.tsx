import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  checkAdmin,
  createAdminProduct,
  getAdminProducts,
  updateAdminProduct,
  AdminProductInput,
} from '../services/admin';

type Props = {
  onBack: () => void;
};

export default function AdminProducts({
  onBack,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [collection, setCollection] = useState('');
  const [stock, setStock] = useState('');
  const [lowStockThreshold, setLowStockThreshold] =
    useState('3');
  const [sizes, setSizes] = useState('');
  const [colors, setColors] = useState('');
  const [image, setImage] = useState('');
  const [image2, setImage2] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [comingSoon, setComingSoon] = useState(false);
  const [hidden, setHidden] = useState(false);

  async function load() {
    try {
      setLoading(true);

      const admin = await checkAdmin();

      if (!admin?.isAdmin) {
        setIsAdmin(false);
        return;
      }

      setIsAdmin(true);

      const list = await getAdminProducts();
      setProducts(list);
    } catch (error) {
      console.error('Admin load error:', error);
      Alert.alert(
        'Admin',
        error instanceof Error
          ? error.message
          : 'Unable to load admin products.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setEditing(null);
    setName('');
    setCategory('');
    setPrice('');
    setCollection('');
    setStock('');
    setLowStockThreshold('3');
    setSizes('');
    setColors('');
    setImage('');
    setImage2('');
    setDescription('');
    setTags('');
    setComingSoon(false);
    setHidden(false);
  }

  function editProduct(product: any) {
    setEditing(product);

    setName(product.name || '');
    setCategory(product.category || '');
    setPrice(String(product.price ?? ''));
    setCollection(product.collection || '');
    setStock(String(product.stock ?? ''));
    setLowStockThreshold(
      String(product.lowStockThreshold ?? 3)
    );

    setSizes(
      Array.isArray(product.sizes)
        ? product.sizes.join(', ')
        : ''
    );

    setColors(
      Array.isArray(product.colors)
        ? product.colors.join(', ')
        : ''
    );

    setImage(product.image || '');
    setImage2(product.image2 || '');
    setDescription(product.description || '');
    setTags(product.tags || '');
    setComingSoon(Boolean(product.comingSoon));
    setHidden(Boolean(product.hidden));
  }

  function buildProduct(): AdminProductInput {
    return {
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      collection: collection.trim(),
      stock: Number(stock || 0),
      lowStockThreshold: Number(
        lowStockThreshold || 3
      ),
      sizes: sizes
        .split(',')
        .map(item => item.trim())
        .filter(Boolean),
      colors: colors
        .split(',')
        .map(item => item.trim())
        .filter(Boolean),
      image: image.trim(),
      image2: image2.trim(),
      description: description.trim(),
      tags: tags.trim(),
      comingSoon,
      hidden,
    };
  }

  async function saveProduct() {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Enter a product name.');
      return;
    }

    if (!category.trim()) {
      Alert.alert(
        'Missing category',
        'Enter a product category.'
      );
      return;
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      Alert.alert(
        'Invalid price',
        'Enter a valid product price.'
      );
      return;
    }

    try {
      setSaving(true);

      const payload = buildProduct();

      if (editing) {
        await updateAdminProduct(
          String(editing.id),
          payload
        );
      } else {
        await createAdminProduct(payload);
      }

      Alert.alert(
        'Success',
        editing
          ? 'Product updated.'
          : 'Product created.'
      );

      resetForm();

      const list = await getAdminProducts();
      setProducts(list);
    } catch (error) {
      console.error('Admin save error:', error);

      Alert.alert(
        'Could not save',
        error instanceof Error
          ? error.message
          : 'Unable to save product.'
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#fff" />

        <Text style={styles.muted}>
          CHECKING ADMIN ACCESS...
        </Text>
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>
          ADMIN ACCESS
        </Text>

        <Text style={styles.muted}>
          You do not have permission to access this area.
        </Text>

        <Pressable
          style={styles.button}
          onPress={onBack}
        >
          <Text style={styles.buttonText}>
            BACK
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Pressable onPress={onBack}>
          <Text style={styles.back}>
            ← BACK
          </Text>
        </Pressable>

        <Text style={styles.title}>
          ADMIN PRODUCTS
        </Text>
      </View>

      <Text style={styles.subtitle}>
        {editing
          ? 'EDIT PRODUCT'
          : 'ADD NEW PRODUCT'}
      </Text>

      <Field
        label="PRODUCT NAME"
        value={name}
        onChangeText={setName}
        placeholder="Example: Unknown Hoodie"
      />

      <Field
        label="CATEGORY"
        value={category}
        onChangeText={setCategory}
        placeholder="Example: Hoodies"
      />

      <Field
        label="PRICE"
        value={price}
        onChangeText={setPrice}
        placeholder="25000"
        keyboardType="numeric"
      />

      <Field
        label="COLLECTION"
        value={collection}
        onChangeText={setCollection}
        placeholder="Example: Core"
      />

      <Field
        label="STOCK"
        value={stock}
        onChangeText={setStock}
        placeholder="10"
        keyboardType="numeric"
      />

      <Field
        label="LOW STOCK THRESHOLD"
        value={lowStockThreshold}
        onChangeText={setLowStockThreshold}
        placeholder="3"
        keyboardType="numeric"
      />

      <Field
        label="SIZES"
        value={sizes}
        onChangeText={setSizes}
        placeholder="S, M, L, XL"
      />

      <Field
        label="COLOURS"
        value={colors}
        onChangeText={setColors}
        placeholder="Black, White"
      />

      <Field
        label="IMAGE URL"
        value={image}
        onChangeText={setImage}
        placeholder="Add later when photos are ready"
        autoCapitalize="none"
      />

      <Field
        label="SECOND IMAGE URL"
        value={image2}
        onChangeText={setImage2}
        placeholder="Optional"
        autoCapitalize="none"
      />

      <Field
        label="DESCRIPTION"
        value={description}
        onChangeText={setDescription}
        placeholder="Product description"
        multiline
      />

      <Field
        label="TAGS"
        value={tags}
        onChangeText={setTags}
        placeholder="streetwear, hoodie, black"
      />

      <Toggle
        label="COMING SOON"
        value={comingSoon}
        onPress={() => setComingSoon(!comingSoon)}
      />

      <Toggle
        label="HIDDEN FROM STORE"
        value={hidden}
        onPress={() => setHidden(!hidden)}
      />

      <Pressable
        style={styles.button}
        onPress={saveProduct}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.buttonText}>
            {editing
              ? 'SAVE CHANGES'
              : 'CREATE PRODUCT'}
          </Text>
        )}
      </Pressable>

      {editing && (
        <Pressable
          style={styles.outlineButton}
          onPress={resetForm}
        >
          <Text style={styles.outlineText}>
            CANCEL EDIT
          </Text>
        </Pressable>
      )}

      <Text style={styles.listTitle}>
        ALL PRODUCTS
      </Text>

      {products.map(product => (
        <Pressable
          key={String(product.id)}
          style={styles.productRow}
          onPress={() => editProduct(product)}
        >
          <View style={styles.productInfo}>
            <Text style={styles.productName}>
              {product.name || 'Unnamed product'}
            </Text>

            <Text style={styles.productMeta}>
              ₦{Number(product.price || 0).toLocaleString(
                'en-NG'
              )}
              {'  •  '}
              Stock: {product.stock ?? 0}
            </Text>

            <Text style={styles.productStatus}>
              {product.hidden
                ? 'HIDDEN'
                : product.comingSoon
                ? 'COMING SOON'
                : 'LIVE'}
            </Text>
          </View>

          <Text style={styles.editText}>
            EDIT →
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: any;
  multiline?: boolean;
  autoCapitalize?: any;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#555"
        keyboardType={keyboardType}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        style={[
          styles.input,
          multiline && styles.multiline,
        ]}
      />
    </View>
  );
}

function Toggle({
  label,
  value,
  onPress,
}: {
  label: string;
  value: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.toggle}
      onPress={onPress}
    >
      <Text style={styles.toggleLabel}>
        {label}
      </Text>

      <Text style={styles.toggleValue}>
        {value ? 'ON' : 'OFF'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  content: {
    padding: 20,
    paddingBottom: 60,
  },

  center: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },

  header: {
    marginBottom: 30,
  },

  back: {
    color: '#888',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 20,
  },

  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
  },

  subtitle: {
    color: '#777',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 25,
  },

  muted: {
    color: '#777',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 25,
  },

  field: {
    marginBottom: 18,
  },

  label: {
    color: '#888',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: '#292929',
    backgroundColor: '#101010',
    color: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
  },

  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  toggle: {
    borderWidth: 1,
    borderColor: '#292929',
    paddingHorizontal: 14,
    paddingVertical: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  toggleLabel: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },

  toggleValue: {
    color: '#aaa',
    fontSize: 10,
    fontWeight: '900',
  },

  button: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
  },

  buttonText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },

  outlineButton: {
    borderWidth: 1,
    borderColor: '#fff',
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 25,
  },

  outlineText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },

  listTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 12,
  },

  productRow: {
    borderTopWidth: 1,
    borderTopColor: '#202020',
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  productInfo: {
    flex: 1,
    paddingRight: 15,
  },

  productName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  productMeta: {
    color: '#777',
    fontSize: 11,
    marginTop: 5,
  },

  productStatus: {
    color: '#555',
    fontSize: 9,
    fontWeight: '900',
    marginTop: 5,
    letterSpacing: 1,
  },

  editText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
