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
import { auth, createAccount, login, logout, onAuthStateChanged, User } from '../services/firebase';
import {
  getNotifications,
  getOrderHistory,
  getProfile,
  saveProfile,
  getSupportTickets,
  createSupportTicket,
} from '../services/api';
import { checkAdmin } from '../services/admin';

type Props = {
  onShop: () => void;
  onAdmin: () => void;
  onSupport?: () => void;
  onNotifications?: () => void;
};

type Page =
  | 'menu'
  | 'profile'
  | 'orders'
  | 'wishlist'
  | 'notifications'
  | 'support'
  | 'addresses'
  | 'settings'
  | 'about';

type RowProps = {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
};

export default function Account({ onShop, onAdmin }: Props) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [page, setPage] = useState<Page>('menu');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      if (!currentUser) {
        setAdmin(false);
        setPage('menu');
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) void loadPrivate();
  }, [user]);

  async function loadPrivate() {
    try {
      const [adminResult, orderResult, notificationResult, profileResult, ticketResult] =
        await Promise.all([
          checkAdmin(),
          getOrderHistory(),
          getNotifications(),
          getProfile(),
          getSupportTickets(),
        ]);
      setAdmin(adminResult.isAdmin);
      setOrders(orderResult || []);
      setNotifications(notificationResult || []);
      setPhone(profileResult?.phone || '');
      setAddress(profileResult?.address || '');
      setTickets(ticketResult || []);
    } catch (error) {
      console.warn('Account load:', error);
    }
  }

  async function submitAuth() {
    if (!email.trim() || !password) {
      setMessage('Enter your email and password.');
      return;
    }
    try {
      setLoading(true);
      setMessage('');
      if (mode === 'login') await login(email.trim(), password);
      else await createAccount(email.trim(), password);
      setPassword('');
      setMessage('Welcome to STAYUNKNOWN.');
    } catch (error: any) {
      setMessage(
        error?.code === 'auth/invalid-credential'
          ? 'Email or password is incorrect.'
          : error?.message || 'Authentication failed.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    try {
      setSaving(true);
      await saveProfile({ phone, address });
      Alert.alert('Saved', 'Your account details have been updated.');
    } catch (error: any) {
      Alert.alert('Could not save', error?.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function sendSupport() {
    if (!supportMessage.trim()) {
      Alert.alert('Message required');
      return;
    }
    try {
      await createSupportTicket({ subject: supportSubject.trim() || 'Support request', message: supportMessage.trim() });
      setSupportSubject('');
      setSupportMessage('');
      Alert.alert('Sent', 'Your support request has been created.');
      await loadPrivate();
    } catch (error: any) {
      Alert.alert('Could not send', error?.message || 'Please try again.');
    }
  }

  if (!user) {
    return (
      <ScrollView contentContainerStyle={styles.authContent}>
        <Text style={styles.eyebrow}>STAYUNKNOWN</Text>
        <Text style={styles.title}>{mode === 'login' ? 'ACCOUNT' : 'CREATE ACCOUNT'}</Text>
        <Text style={styles.authIntro}>
          Sign in to view your orders, saved pieces and account activity.
        </Text>
        <View style={styles.card}>
          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#555"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Text style={styles.label}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#555"
            secureTextEntry
          />
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <Pressable style={styles.primaryButton} onPress={submitAuth} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.primaryText}>{mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}</Text>}
          </Pressable>
          <Pressable onPress={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(''); }}>
            <Text style={styles.switchText}>
              {mode === 'login' ? 'CREATE A NEW ACCOUNT' : 'ALREADY HAVE AN ACCOUNT? SIGN IN'}
            </Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={onShop}>
            <Text style={styles.secondaryText}>CONTINUE AS GUEST</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  if (page !== 'menu') return <SubPage page={page} setPage={setPage} user={user} orders={orders} notifications={notifications} tickets={tickets} phone={phone} setPhone={setPhone} address={address} setAddress={setAddress} saving={saving} save={save} supportSubject={supportSubject} setSupportSubject={setSupportSubject} supportMessage={supportMessage} setSupportMessage={setSupportMessage} sendSupport={sendSupport} onShop={onShop} />;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>STAYUNKNOWN</Text>
          <Text style={styles.title}>ACCOUNT</Text>
        </View>
        <View style={styles.avatar}><Text style={styles.avatarText}>{(user.email?.[0] || 'U').toUpperCase()}</Text></View>
      </View>
      <Text style={styles.email}>{user.email}</Text>

      {admin ? (
        <Pressable style={styles.adminButton} onPress={onAdmin}>
          <View><Text style={styles.adminKicker}>STAFF ACCESS</Text><Text style={styles.adminTitle}>ADMIN DASHBOARD</Text></View>
          <Text style={styles.arrow}>→</Text>
        </Pressable>
      ) : null}

      <Text style={styles.sectionTitle}>YOUR ACCOUNT</Text>
      <View style={styles.menuCard}>
        <Row icon="◉" title="Profile" subtitle="Personal information" onPress={() => setPage('profile')} />
        <Row icon="▣" title="Orders" subtitle={`${orders.length} order${orders.length === 1 ? '' : 's'}`} onPress={() => setPage('orders')} />
        <Row icon="♡" title="Wishlist" subtitle="Saved products" onPress={() => setPage('wishlist')} />
        <Row icon="◌" title="Notifications" subtitle={`${notifications.filter(n => !n.read).length} unread`} onPress={() => setPage('notifications')} />
        <Row icon="◇" title="Support" subtitle="Support tickets and help" onPress={() => setPage('support')} />
        <Row icon="⌖" title="Addresses" subtitle="Delivery addresses" onPress={() => setPage('addresses')} />
        <Row icon="⚙" title="Settings" subtitle="App and account settings" onPress={() => setPage('settings')} />
        <Row icon="i" title="About STAYUNKNOWN" subtitle="Brand information" onPress={() => setPage('about')} last />
      </View>

      <Pressable style={styles.logout} onPress={() => void logout()}>
        <Text style={styles.logoutText}>LOG OUT</Text>
      </Pressable>
    </ScrollView>
  );
}

function Row({ icon, title, subtitle, onPress, last }: RowProps & { last?: boolean }) {
  return (
    <Pressable style={[styles.row, last && styles.lastRow]} onPress={onPress}>
      <View style={styles.rowIcon}><Text style={styles.rowIconText}>{icon}</Text></View>
      <View style={styles.rowCopy}><Text style={styles.rowTitle}>{title}</Text>{subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}</View>
      <Text style={styles.rowArrow}>›</Text>
    </Pressable>
  );
}

function SubPage({ page, setPage, user, orders, notifications, tickets, phone, setPhone, address, setAddress, saving, save, supportSubject, setSupportSubject, supportMessage, setSupportMessage, sendSupport, onShop }: any) {
  const titles: Record<Page, string> = { menu: 'ACCOUNT', profile: 'PROFILE', orders: 'ORDERS', wishlist: 'WISHLIST', notifications: 'NOTIFICATIONS', support: 'SUPPORT', addresses: 'ADDRESSES', settings: 'SETTINGS', about: 'ABOUT' };
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Pressable style={styles.back} onPress={() => setPage('menu')}><Text style={styles.backText}>‹  ACCOUNT</Text></Pressable>
      <Text style={styles.title}>{titles[page as Page]}</Text>

      {page === 'profile' && <View style={styles.card}><Text style={styles.label}>EMAIL</Text><Text style={styles.readonly}>{user.email}</Text><Text style={styles.label}>PHONE</Text><TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone" placeholderTextColor="#555" keyboardType="phone-pad"/><Pressable style={styles.primaryButton} onPress={() => void save()} disabled={saving}>{saving ? <ActivityIndicator color="#000" /> : <Text style={styles.primaryText}>SAVE PROFILE</Text>}</Pressable></View>}

      {page === 'orders' && (orders.length ? orders.map((o: any) => <View style={styles.listCard} key={o.id}><Text style={styles.rowTitle}>{o.orderNumber || o.paymentReference || o.id}</Text><Text style={styles.rowSubtitle}>{o.deliveryStatus || o.paymentStatus || 'PENDING'} · ₦{Number(o.total || 0).toLocaleString('en-NG')}</Text></View>) : <Empty title="NO ORDERS YET" copy="Your order history will appear here." />)}

      {page === 'wishlist' && <Empty title="WISHLIST" copy="Your saved products are available from the heart icon on products. Use the SHOP tab to explore and save pieces." button="EXPLORE SHOP" onPress={onShop} />}

      {page === 'notifications' && (notifications.length ? notifications.map((n: any) => <View style={styles.listCard} key={n.id}><Text style={styles.rowTitle}>{n.title || 'STAYUNKNOWN'}</Text><Text style={styles.rowSubtitle}>{n.message || ''}</Text></View>) : <Empty title="ALL CLEAR" copy="You don't have any notifications yet." />)}

      {page === 'support' && <><View style={styles.card}><Text style={styles.label}>SUBJECT</Text><TextInput style={styles.input} value={supportSubject} onChangeText={setSupportSubject} placeholder="How can we help?" placeholderTextColor="#555"/><Text style={styles.label}>MESSAGE</Text><TextInput style={[styles.input, styles.multiline]} value={supportMessage} onChangeText={setSupportMessage} placeholder="Tell us what you need..." placeholderTextColor="#555" multiline/><Pressable style={styles.primaryButton} onPress={() => void sendSupport()}><Text style={styles.primaryText}>SEND REQUEST</Text></Pressable></View>{tickets.length ? tickets.map((t: any) => <View style={styles.listCard} key={t.id}><Text style={styles.rowTitle}>{t.subject || 'Support ticket'}</Text><Text style={styles.rowSubtitle}>{t.status || 'OPEN'}</Text></View>) : null}</>}

      {page === 'addresses' && <View style={styles.card}><Text style={styles.label}>DELIVERY ADDRESS</Text><TextInput style={[styles.input, styles.multiline]} value={address} onChangeText={setAddress} placeholder="Enter your delivery address" placeholderTextColor="#555" multiline/><Pressable style={styles.primaryButton} onPress={() => void save()} disabled={saving}>{saving ? <ActivityIndicator color="#000" /> : <Text style={styles.primaryText}>SAVE ADDRESS</Text>}</Pressable></View>}

      {page === 'settings' && <View style={styles.menuCard}><View style={styles.setting}><Text style={styles.rowTitle}>Account email</Text><Text style={styles.rowSubtitle}>{user.email}</Text></View><View style={styles.setting}><Text style={styles.rowTitle}>App version</Text><Text style={styles.rowSubtitle}>STAYUNKNOWN</Text></View></View>}

      {page === 'about' && <View style={styles.about}><Text style={styles.aboutBrand}>STAYUNKNOWN</Text><Text style={styles.aboutTitle}>MOVE IN SILENCE.</Text><Text style={styles.aboutCopy}>Independent streetwear from Lagos. Limited drops, considered pieces, and a community that doesn't need to be seen.</Text></View>}
    </ScrollView>
  );
}

function Empty({ title, copy, button, onPress }: { title: string; copy: string; button?: string; onPress?: () => void }) {
  return <View style={styles.empty}><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyCopy}>{copy}</Text>{button && onPress ? <Pressable style={styles.primaryButton} onPress={onPress}><Text style={styles.primaryText}>{button}</Text></Pressable> : null}</View>;
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 100 },
  authContent: { padding: 20, paddingBottom: 100, flexGrow: 1, justifyContent: 'center' },
  eyebrow: { color: '#666', fontSize: 9, fontWeight: '900', letterSpacing: 2.5, marginBottom: 5 },
  title: { color: '#fff', fontSize: 38, fontWeight: '900', letterSpacing: 1, marginBottom: 10 },
  authIntro: { color: '#777', fontSize: 12, lineHeight: 19, marginBottom: 18, maxWidth: 330 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  avatar: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: '#444', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 13, fontWeight: '900' },
  email: { color: '#777', fontSize: 12, marginBottom: 22 },
  adminButton: { backgroundColor: '#fff', padding: 16, marginBottom: 28, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  adminKicker: { color: '#666', fontSize: 8, fontWeight: '900', letterSpacing: 1.5 },
  adminTitle: { color: '#000', fontSize: 11, fontWeight: '900', letterSpacing: 1, marginTop: 3 },
  arrow: { color: '#000', fontSize: 22 },
  sectionTitle: { color: '#888', fontSize: 9, fontWeight: '900', letterSpacing: 1.5, marginBottom: 10 },
  menuCard: { borderWidth: 1, borderColor: '#242424', backgroundColor: '#080808' },
  row: { minHeight: 68, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: '#202020', flexDirection: 'row', alignItems: 'center' },
  lastRow: { borderBottomWidth: 0 },
  rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#151515', alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  rowIconText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  rowCopy: { flex: 1 },
  rowTitle: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: .2 },
  rowSubtitle: { color: '#666', fontSize: 10, lineHeight: 15, marginTop: 4 },
  rowArrow: { color: '#666', fontSize: 25, marginLeft: 8 },
  logout: { alignItems: 'center', padding: 22 },
  logoutText: { color: '#777', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  back: { paddingVertical: 4, marginBottom: 16 },
  backText: { color: '#aaa', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  card: { borderWidth: 1, borderColor: '#292929', backgroundColor: '#080808', padding: 18 },
  listCard: { borderWidth: 1, borderColor: '#242424', padding: 16, marginBottom: 10, backgroundColor: '#080808' },
  label: { color: '#777', fontSize: 8, fontWeight: '900', letterSpacing: 1.4, marginBottom: 7, marginTop: 4 },
  input: { backgroundColor: '#151515', borderWidth: 1, borderColor: '#333', color: '#fff', padding: 14, marginBottom: 13, fontSize: 12 },
  readonly: { color: '#aaa', backgroundColor: '#111', borderWidth: 1, borderColor: '#222', padding: 14, marginBottom: 13, fontSize: 12 },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  primaryButton: { backgroundColor: '#fff', paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  primaryText: { color: '#000', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  secondaryButton: { borderWidth: 1, borderColor: '#444', paddingVertical: 15, alignItems: 'center', marginTop: 10 },
  secondaryText: { color: '#aaa', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  switchText: { color: '#aaa', fontSize: 9, fontWeight: '900', letterSpacing: 1, textAlign: 'center', padding: 18 },
  message: { color: '#aaa', fontSize: 11, lineHeight: 17, marginBottom: 10 },
  empty: { minHeight: 350, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  emptyTitle: { color: '#fff', fontSize: 21, fontWeight: '900', letterSpacing: 1, textAlign: 'center' },
  emptyCopy: { color: '#666', fontSize: 12, lineHeight: 19, textAlign: 'center', marginTop: 9, marginBottom: 18 },
  setting: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#222' },
  about: { padding: 25, borderWidth: 1, borderColor: '#292929', backgroundColor: '#080808' },
  aboutBrand: { color: '#777', fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  aboutTitle: { color: '#fff', fontSize: 28, fontWeight: '900', marginTop: 15 },
  aboutCopy: { color: '#888', fontSize: 13, lineHeight: 21, marginTop: 12 },
});
