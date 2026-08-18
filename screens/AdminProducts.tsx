import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
  getAdminInventory,
  getAdminCollections,
  createAdminCollection,
  updateAdminCollection,
  deleteAdminCollection,
  getAdminOrders,
  updateOrderDelivery,
  getAdminPromos,
  createAdminPromo,
  updateAdminPromo,
  deleteAdminPromo,
  getAdminRestockSubscriptions,
  getAdminSupport,
  replyToSupportTicket,
  updateSupportStatus,
  getAdminNotifications,
  markNotificationRead,
} from '../services/admin';

/* Expo imports for image picking + processing */
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

type Props = {
  onBack: () => void;
};

type Section =
  | 'products'
  | 'inventory'
  | 'collections'
  | 'orders'
  | 'delivery'
  | 'promos'
  | 'restock'
  | 'support'
  | 'notifications';

export default function AdminProducts({ onBack }: Props) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [section, setSection] = useState<Section>('products');

  /* Products state (kept similar to previous implementation) */
  const [products, setProducts] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [collection, setCollection] = useState('');
  const [stock, setStock] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('3');
  const [sizes, setSizes] = useState('');
  const [colors, setColors] = useState('');
  const [image, setImage] = useState('');
  const [image2, setImage2] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [comingSoon, setComingSoon] = useState(false);
  const [hidden, setHidden] = useState(false);

  /* Other admin sections */
  const [inventory, setInventory] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [restocks, setRestocks] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  /* Inline edit states for collections and support replies */
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [editingCollectionName, setEditingCollectionName] = useState('');
  const [replyTicketId, setReplyTicketId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  async function loadAll() {
    try {
      setLoading(true);

      const admin = await checkAdmin();

      if (!admin?.isAdmin) {
        setIsAdmin(false);
        return;
      }

      setIsAdmin(true);

      // Load products
      const p = await getAdminProducts();
      setProducts(p || []);

      // load other sections in parallel (best-effort)
      const [
        inv,
        cols,
        ord,
        pr,
        rs,
        sup,
        nots,
      ] = await Promise.allSettled([
        getAdminInventory(),
        getAdminCollections(),
        getAdminOrders(),
        getAdminPromos(),
        getAdminRestockSubscriptions(),
        getAdminSupport(),
        getAdminNotifications(),
      ]);

      if (inv.status === 'fulfilled') setInventory(inv.value);
      if (cols.status === 'fulfilled') setCollections(cols.value);
      if (ord.status === 'fulfilled') setOrders(ord.value);
      if (pr.status === 'fulfilled') setPromos(pr.value);
      if (rs.status === 'fulfilled') setRestocks(rs.value);
      if (sup.status === 'fulfilled') setSupportTickets(sup.value);
      if (nots.status === 'fulfilled') setNotifications(nots.value);
    } catch (error) {
      console.error('Admin load error:', error);
      Alert.alert(
        'Admin',
        error instanceof Error ? error.message : 'Unable to load admin area.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  /* ---------- PRODUCTS UI (refactored from previous file) ---------- */
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
    setLowStockThreshold(String(product.lowStockThreshold ?? 3));

    setSizes(Array.isArray(product.sizes) ? product.sizes.join(', ') : '');
    setColors(Array.isArray(product.colors) ? product.colors.join(', ') : '');

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
      lowStockThreshold: Number(lowStockThreshold || 3),
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
      Alert.alert('Missing category', 'Enter a product category.');
      return;
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      Alert.alert('Invalid price', 'Enter a valid product price.');
      return;
    }

    try {
      setSaving(true);

      const payload = buildProduct();

      if (editing) {
        await updateAdminProduct(String(editing.id), payload);
      } else {
        await createAdminProduct(payload);
      }

      Alert.alert('Success', editing ? 'Product updated.' : 'Product created.');

      resetForm();

      const list = await getAdminProducts();
      setProducts(list);
    } catch (error) {
      console.error('Admin save error:', error);

      Alert.alert(
        'Could not save',
        error instanceof Error ? error.message : 'Unable to save product.'
      );
    } finally {
      setSaving(false);
    }
  }

  /* ---------- Image picking + processing ---------- */
  async function pickAndProcessImage(setter: (dataUrl: string) => void) {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Allow access to your photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
        base64: false,
      });

      if (result.cancelled) return;

      let { uri, width, height } = result as any;

      // Resize so max side is 1200
      const maxSide = 1200;
      const scale = Math.max(width, height) > maxSide ? maxSide / Math.max(width, height) : 1;
      const resizeWidth = Math.round(width * scale);
      const resizeHeight = Math.round(height * scale);

      // Attempt to encode as webp if available; fall back to jpeg
      let format: ImageManipulator.SaveFormat = ImageManipulator.SaveFormat.WEBP;
      let quality = 0.78;

      // do manipulation
      let manipulated = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: resizeWidth, height: resizeHeight } }],
        { compress: quality, format }
      );

      if (!manipulated || !manipulated.uri) {
        // fallback to jpeg
        format = ImageManipulator.SaveFormat.JPEG;
        manipulated = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: resizeWidth, height: resizeHeight } }],
          { compress: quality, format }
        );
      }

      if (!manipulated || !manipulated.uri) {
        Alert.alert('Image error', 'Could not process selected image.');
        return;
      }

      // Read file as base64
      const fileBase64 = await FileSystem.readAsStringAsync(manipulated.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const mime = format === ImageManipulator.SaveFormat.WEBP ? 'image/webp' : 'image/jpeg';
      let dataUrl = `data:${mime};base64,${fileBase64}`;

      // Reduce quality if still too large (approx target length)
      let currentQuality = quality;
      while (dataUrl.length > 220000 && currentQuality > 0.3) {
        currentQuality = Math.max(0.3, currentQuality - 0.12);
        const second = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: Math.round(resizeWidth * currentQuality), height: Math.round(resizeHeight * currentQuality) } }],
          { compress: currentQuality, format }
        );

        if (!second || !second.uri) break;

        const b = await FileSystem.readAsStringAsync(second.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        dataUrl = `data:${mime};base64,${b}`;
      }

      setter(dataUrl);
    } catch (err) {
      console.error('Image pick error', err);
      Alert.alert('Image error', 'Unable to pick or process image.');
    }
  }

  /* ---------- Collections management (inline edit) ---------- */
  async function createCollection(name: string) {
    try {
      await createAdminCollection({ name });
      const cols = await getAdminCollections();
      setCollections(cols);
      Alert.alert('Success', 'Collection created.');
    } catch (err) {
      console.error(err);
      Alert.alert('Could not create collection', err instanceof Error ? err.message : 'Unknown error');
    }
  }

  async function startEditCollection(col: any) {
    setEditingCollectionId(String(col.id || col._id || col.name));
    setEditingCollectionName(col.name || '');
  }

  async function saveEditedCollection() {
    if (!editingCollectionId) return;
    try {
      await updateAdminCollection(editingCollectionId, { name: editingCollectionName });
      const cols = await getAdminCollections();
      setCollections(cols);
      setEditingCollectionId(null);
      setEditingCollectionName('');
      Alert.alert('Updated', 'Collection updated.');
    } catch (err) {
      console.error(err);
      Alert.alert('Could not update', err instanceof Error ? err.message : 'Unknown error');
    }
  }

  async function removeCollection(id: string) {
    try {
      await deleteAdminCollection(id);
      const cols = await getAdminCollections();
      setCollections(cols);
      Alert.alert('Deleted', 'Collection removed.');
    } catch (err) {
      console.error(err);
      Alert.alert('Could not delete', err instanceof Error ? err.message : 'Unknown error');
    }
  }

  /* ---------- Orders / Delivery ---------- */
  async function patchOrderDelivery(orderId: string, payload: any) {
    try {
      await updateOrderDelivery(orderId, payload);
      const ord = await getAdminOrders();
      setOrders(ord);
      Alert.alert('Success', 'Order updated.');
    } catch (err) {
      console.error(err);
      Alert.alert('Could not update order', err instanceof Error ? err.message : 'Unknown error');
    }
  }

  /* ---------- Support ---------- */
  async function startReply(ticketId: string) {
    setReplyTicketId(ticketId);
    setReplyMessage('');
  }

  async function submitReply() {
    if (!replyTicketId || !replyMessage.trim()) {
      Alert.alert('Enter a reply', 'Please enter a message to send.');
      return;
    }

    try {
      await replyToSupportTicket(replyTicketId, replyMessage.trim());
      const sup = await getAdminSupport();
      setSupportTickets(sup);
      setReplyTicketId(null);
      setReplyMessage('');
      Alert.alert('Replied', 'Support ticket replied.');
    } catch (err) {
      console.error(err);
      Alert.alert('Could not reply', err instanceof Error ? err.message : 'Unknown error');
    }
  }

  async function setSupportStatus(ticketId: string, status: 'OPEN' | 'CLOSED') {
    try {
      await updateSupportStatus(ticketId, status);
      const sup = await getAdminSupport();
      setSupportTickets(sup);
      Alert.alert('Status updated', `Ticket ${status.toLowerCase()}.`);
    } catch (err) {
      console.error(err);
      Alert.alert('Could not update status', err instanceof Error ? err.message : 'Unknown error');
    }
  }

  async function markRead(notificationId: string) {
    try {
      await markNotificationRead(notificationId);
      const nots = await getAdminNotifications();
      setNotifications(nots);
    } catch (err) {
      console.error(err);
    }
  }

  /* Simple section nav bar */
  function SectionNav() {
    const items: { id: Section; label: string }[] = [
      { id: 'products', label: 'Products' },
      { id: 'inventory', label: 'Inventory' },
      { id: 'collections', label: 'Collections' },
      { id: 'orders', label: 'Orders' },
      { id: 'delivery', label: 'Delivery' },
      { id: 'promos', label: 'Promos' },
      { id: 'restock', label: 'Restock' },
      { id: 'support', label: 'Support' },
      { id: 'notifications', label: 'Notifications' },
    ];

    return (
      <ScrollView horizontal style={styles.sectionNav} contentContainerStyle={{ paddingHorizontal: 10 }}>
        {items.map(it => (
          <Pressable key={it.id} onPress={() => setSection(it.id)} style={[styles.sectionTab, section === it.id && styles.sectionTabActive]}>
            <Text style={section === it.id ? styles.sectionTabTextActive : styles.sectionTabText}>{it.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    );
  }

  /* ---------- Render sections ---------- */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#fff" />
        <Text style={styles.muted}>CHECKING ADMIN ACCESS...</Text>
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>ADMIN ACCESS</Text>
        <Text style={styles.muted}>You do not have permission to access this area.</Text>
        <Pressable style={styles.button} onPress={onBack}>
          <Text style={styles.buttonText}>BACK</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack}>
          <Text style={styles.back}>← BACK</Text>
        </Pressable>

        <Text style={styles.title}>ADMIN DASHBOARD</Text>
      </View>

      <SectionNav />

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* PRODUCTS */}
        {section === 'products' && (
          <>
            <Text style={styles.subtitle}>{editing ? 'EDIT PRODUCT' : 'ADD NEW PRODUCT'}</Text>

            <Field label="PRODUCT NAME" value={name} onChangeText={setName} placeholder="Example: Unknown Hoodie" />
            <Field label="CATEGORY" value={category} onChangeText={setCategory} placeholder="Example: Hoodies" />
            <Field label="PRICE" value={price} onChangeText={setPrice} placeholder="25000" keyboardType="numeric" />
            <Field label="COLLECTION" value={collection} onChangeText={setCollection} placeholder="Example: Core" />
            <Field label="STOCK" value={stock} onChangeText={setStock} placeholder="10" keyboardType="numeric" />
            <Field label="LOW STOCK THRESHOLD" value={lowStockThreshold} onChangeText={setLowStockThreshold} placeholder="3" keyboardType="numeric" />
            <Field label="SIZES" value={sizes} onChangeText={setSizes} placeholder="S, M, L, XL" />
            <Field label="COLOURS" value={colors} onChangeText={setColors} placeholder="Black, White" />

            <View style={{ marginBottom: 12 }}>
              <Text style={styles.label}>PRIMARY IMAGE</Text>
              {image ? <Image source={{ uri: image }} style={{ width: '100%', height: 180, marginBottom: 10 }} resizeMode="cover" /> : null}
              <Pressable style={styles.button} onPress={() => pickAndProcessImage(setImage)}>
                <Text style={styles.buttonText}>CHOOSE PRIMARY IMAGE</Text>
              </Pressable>
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={styles.label}>SECOND IMAGE</Text>
              {image2 ? <Image source={{ uri: image2 }} style={{ width: '100%', height: 180, marginBottom: 10 }} resizeMode="cover" /> : null}
              <Pressable style={styles.button} onPress={() => pickAndProcessImage(setImage2)}>
                <Text style={styles.buttonText}>CHOOSE SECOND IMAGE</Text>
              </Pressable>
            </View>

            <Field label="DESCRIPTION" value={description} onChangeText={setDescription} placeholder="Product description" multiline />
            <Field label="TAGS" value={tags} onChangeText={setTags} placeholder="streetwear, hoodie, black" />

            <Toggle label="COMING SOON" value={comingSoon} onPress={() => setComingSoon(!comingSoon)} />
            <Toggle label="HIDDEN FROM STORE" value={hidden} onPress={() => setHidden(!hidden)} />

            <Pressable style={styles.button} onPress={saveProduct} disabled={saving}>
              {saving ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>{editing ? 'SAVE CHANGES' : 'CREATE PRODUCT'}</Text>}
            </Pressable>

            {editing && (
              <Pressable style={styles.outlineButton} onPress={resetForm}>
                <Text style={styles.outlineText}>CANCEL EDIT</Text>
              </Pressable>
            )}

            <Text style={styles.listTitle}>ALL PRODUCTS</Text>

            {products.map(product => (
              <Pressable key={String(product.id)} style={styles.productRow} onPress={() => editProduct(product)}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name || 'Unnamed product'}</Text>
                  <Text style={styles.productMeta}>
                    ₦{Number(product.price || 0).toLocaleString('en-NG')}
                    {'  •  '}
                    Stock: {product.stock ?? 0}
                  </Text>
                  <Text style={styles.productStatus}>{product.hidden ? 'HIDDEN' : product.comingSoon ? 'COMING SOON' : 'LIVE'}</Text>
                </View>
                <Text style={styles.editText}>EDIT →</Text>
              </Pressable>
            ))}
          </>
        )}

        {/* rest of file omitted for brevity */}
