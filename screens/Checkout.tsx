import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { auth } from '../services/firebase';
import { clearCart, getCart, getCartTotal } from '../services/store';
import {
  getProfile,
  initializePayment,
  saveProfile,
  validatePromo,
  verifyPayment,
} from '../services/api';

type Props = { onBack: () => void; onComplete: () => void };

type CheckoutStatus = 'idle' | 'preparing' | 'opening' | 'verifying' | 'confirmed' | 'error';

export default function Checkout({ onBack, onComplete }: Props) {
  const cart = getCart();
  const subtotal = getCartTotal();
  const [email, setEmail] = useState(auth.currentUser?.email || '');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [promo, setPromo] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [discount, setDiscount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<CheckoutStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const paymentStartedRef = useRef(false);
  const verifyingRef = useRef<string | null>(null);

  const total = useMemo(() => Math.max(0, subtotal - discount), [subtotal, discount]);
  const itemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  useEffect(() => {
    if (!auth.currentUser) return;
    void getProfile()
      .then(profile => {
        setPhone(profile.phone || '');
        setAddress(profile.address || '');
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleUrl = (url: string | null) => {
      if (!url) return;
      const match = url.match(/[?&](?:reference|trxref)=([^&]+)/i);
      if (match) void finishPayment(decodeURIComponent(match[1]));
    };

    const subscription = Linking.addEventListener('url', event => handleUrl(event.url));
    void Linking.getInitialURL().then(handleUrl);
    return () => subscription.remove();
  }, []);

  async function finishPayment(reference: string) {
    if (!reference || verifyingRef.current === reference) return;
    verifyingRef.current = reference;
    setBusy(true);
    setStatus('verifying');
    setStatusMessage('VERIFYING PAYMENT…');

    try {
      const result = await verifyPayment(reference);
      if (result.paid) {
        clearCart();
        setStatus('confirmed');
        setStatusMessage('PAYMENT CONFIRMED');
        Alert.alert('Order confirmed', 'Your STAYUNKNOWN order has been received.', [
          { text: 'VIEW ORDERS', onPress: onComplete },
        ]);
      } else {
        paymentStartedRef.current = false;
        setStatus('error');
        setStatusMessage(`Payment status: ${result.status || 'not confirmed'}.`);
      }
    } catch (error: any) {
      paymentStartedRef.current = false;
      setStatus('error');
      setStatusMessage(error?.message || 'Unable to verify payment. Please try again.');
    } finally {
      verifyingRef.current = null;
      setBusy(false);
    }
  }

  async function applyPromo() {
    const code = promo.trim();
    if (!code) {
      setDiscount(0);
      setPromoMessage('');
      return;
    }

    try {
      setBusy(true);
      const result = await validatePromo(
        code,
        cart.map(item => ({
          id: item.product.id,
          price: item.product.price,
          quantity: item.quantity,
          collection: item.product.collection,
          category: item.product.category,
        })),
      );

      if (result.valid) {
        const amount = Math.max(0, Number(result.discount || 0));
        setDiscount(Math.min(amount, subtotal));
        setPromoMessage(`PROMO APPLIED — ₦${amount.toLocaleString('en-NG')} OFF`);
      } else {
        setDiscount(0);
        setPromoMessage(result.error || 'Invalid promo code.');
      }
    } catch (error: any) {
      setDiscount(0);
      setPromoMessage(error?.message || 'Unable to validate promo code.');
    } finally {
      setBusy(false);
    }
  }

  async function pay() {
    if (paymentStartedRef.current || busy) return;

    if (!cart.length) {
      Alert.alert('Your bag is empty', 'Add an item to your 404 BAG before checking out.');
      return;
    }

    if (!email.trim() || !email.includes('@') || !name.trim() || !phone.trim() || !address.trim()) {
      Alert.alert('Missing checkout details', 'Enter your name, email, phone number and delivery address.');
      return;
    }

    paymentStartedRef.current = true;
    setBusy(true);
    setStatus('preparing');
    setStatusMessage('PREPARING PAYMENT…');

    try {
      if (auth.currentUser) await saveProfile({ phone: phone.trim(), address: address.trim() });

      const callbackUrl = 'stayunknown://payment-complete';
      const result = await initializePayment({
        email: email.trim(),
        phone: phone.trim(),
        name: name.trim(),
        address: address.trim(),
        note: note.trim(),
        promoCode: promo.trim() || undefined,
        userId: auth.currentUser?.uid || '',
        callbackUrl,
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
      });

      if (!result.authorization_url) throw new Error('Paystack payment link was not returned.');

      setStatus('opening');
      setStatusMessage('OPENING PAYSTACK…');
      await Linking.openURL(result.authorization_url);
    } catch (error: any) {
      paymentStartedRef.current = false;
      setStatus('error');
      setStatusMessage(error?.message || 'Unable to start payment. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Pressable onPress={onBack} hitSlop={10} disabled={busy}>
            <Text style={styles.back}>← 404 BAG</Text>
          </Pressable>
          <Text style={styles.title}>CHECKOUT</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.stepRow}>
          <Text style={styles.stepActive}>01 DETAILS</Text>
          <Text style={styles.step}>02 PAYMENT</Text>
        </View>

        <Text style={styles.heading}>DELIVERY DETAILS</Text>
        <Field label="NAME" value={name} onChangeText={setName} placeholder="Full name" />
        <Field label="EMAIL" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />
        <Field label="PHONE" value={phone} onChangeText={setPhone} placeholder="Phone number" keyboardType="phone-pad" />
        <Field label="ADDRESS" value={address} onChangeText={setAddress} placeholder="Delivery address" multiline />
        <Field label="ORDER NOTE" value={note} onChangeText={setNote} placeholder="Optional note" multiline />

        <Text style={styles.heading}>PROMO</Text>
        <View style={styles.promoRow}>
          <TextInput
            style={styles.promoInput}
            value={promo}
            onChangeText={setPromo}
            placeholder="CODE"
            placeholderTextColor="#555"
            autoCapitalize="characters"
            editable={!busy}
          />
          <Pressable style={styles.promoButton} onPress={applyPromo} disabled={busy}>
            <Text style={styles.promoText}>APPLY</Text>
          </Pressable>
        </View>
        {promoMessage ? <Text style={styles.message}>{promoMessage}</Text> : null}

        <Text style={styles.heading}>ORDER SUMMARY</Text>
        <View style={styles.itemsCard}>
          {cart.map(item => (
            <View key={`${item.product.id}-${item.size}-${item.color}`} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{item.product.name}</Text>
                <Text style={styles.itemMeta}>{item.size} · {item.color} · QTY {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>₦{(Number(item.product.price || 0) * item.quantity).toLocaleString('en-NG')}</Text>
            </View>
          ))}
        </View>

        <View style={styles.summary}>
          <View style={styles.row}>
            <Text style={styles.label}>ITEMS</Text>
            <Text style={styles.value}>{itemCount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>SUBTOTAL</Text>
            <Text style={styles.value}>₦{subtotal.toLocaleString('en-NG')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>DISCOUNT</Text>
            <Text style={styles.value}>− ₦{discount.toLocaleString('en-NG')}</Text>
          </View>
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>₦{total.toLocaleString('en-NG')}</Text>
          </View>
        </View>

        {statusMessage ? (
          <View style={[styles.statusBox, status === 'confirmed' && styles.statusSuccess]}>
            {busy ? <ActivityIndicator size="small" color="#fff" /> : null}
            <Text style={styles.status}>{statusMessage}</Text>
          </View>
        ) : null}

        <Pressable style={[styles.pay, (busy || status === 'confirmed') && styles.payDisabled]} onPress={pay} disabled={busy || status === 'confirmed'}>
          {busy ? <ActivityIndicator color="#000" /> : <Text style={styles.payText}>PAY ₦{total.toLocaleString('en-NG')} WITH PAYSTACK →</Text>}
        </Pressable>
        <Text style={styles.security}>Payment is processed securely by Paystack. Your payment details are not stored by this app.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, value, onChangeText, placeholder, multiline = false, keyboardType = 'default' }: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: any;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#555"
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={label === 'EMAIL' ? 'none' : 'sentences'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { padding: 20, paddingBottom: 60 },
  header: { height: 55, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerSpacer: { width: 45 },
  back: { color: '#fff', fontSize: 10, fontWeight: '900' },
  title: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  stepRow: { flexDirection: 'row', gap: 18, borderBottomWidth: 1, borderBottomColor: '#222', paddingBottom: 14 },
  stepActive: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  step: { color: '#555', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  heading: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 1, marginTop: 25, marginBottom: 15 },
  field: { marginBottom: 14 },
  fieldLabel: { color: '#888', fontSize: 9, fontWeight: '900', letterSpacing: 1, marginBottom: 7 },
  input: { backgroundColor: '#151515', borderWidth: 1, borderColor: '#333', color: '#fff', padding: 14, fontSize: 14 },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  promoRow: { flexDirection: 'row', gap: 8 },
  promoInput: { flex: 1, backgroundColor: '#151515', borderWidth: 1, borderColor: '#333', color: '#fff', padding: 14 },
  promoButton: { backgroundColor: '#fff', paddingHorizontal: 18, justifyContent: 'center' },
  promoText: { color: '#000', fontSize: 10, fontWeight: '900' },
  message: { color: '#aaa', fontSize: 11, marginTop: 8 },
  itemsCard: { backgroundColor: '#0e0e0e', borderWidth: 1, borderColor: '#222', padding: 14 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1d1d1d' },
  itemInfo: { flex: 1 },
  itemName: { color: '#fff', fontSize: 11, fontWeight: '800' },
  itemMeta: { color: '#666', fontSize: 9, marginTop: 5 },
  itemPrice: { color: '#fff', fontSize: 11, fontWeight: '800' },
  summary: { marginTop: 25, borderTopWidth: 1, borderTopColor: '#222', paddingTop: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  label: { color: '#888', fontSize: 10, fontWeight: '800' },
  value: { color: '#fff', fontSize: 12, fontWeight: '800' },
  totalRow: { marginTop: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#222' },
  totalLabel: { color: '#fff', fontSize: 13, fontWeight: '900' },
  totalValue: { color: '#fff', fontSize: 18, fontWeight: '900' },
  statusBox: { marginTop: 20, padding: 12, backgroundColor: '#151515', borderWidth: 1, borderColor: '#292929', flexDirection: 'row', alignItems: 'center', gap: 9 },
  statusSuccess: { borderColor: '#fff' },
  status: { color: '#aaa', fontSize: 11, flex: 1 },
  pay: { backgroundColor: '#fff', paddingVertical: 18, alignItems: 'center', marginTop: 22 },
  payDisabled: { opacity: 0.55 },
  payText: { color: '#000', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  security: { color: '#555', fontSize: 10, lineHeight: 16, textAlign: 'center', marginTop: 14 },
});
