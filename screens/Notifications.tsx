import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getNotifications, markNotificationRead, Notification } from '../services/api';

type Props = { onBack: () => void; onOpen?: (notification: Notification) => void };

export default function Notifications({ onBack, onOpen }: Props) {
  const [list, setList] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async (refresh = false) => {
    setError('');
    if (refresh) setRefreshing(true); else setLoading(true);
    try { setList(await getNotifications()); }
    catch (e: any) { setError(e?.message || 'Unable to load notifications.'); }
    finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { void load(); }, []);

  const grouped = useMemo(() => {
    const unread = list.filter(n => !n.read);
    const read = list.filter(n => n.read);
    return { unread, read };
  }, [list]);

  async function open(n: Notification) {
    setList(x => x.map(i => i.id === n.id ? { ...i, read: true } : i));
    try { await markNotificationRead(n.id); } catch { /* optimistic UI */ }
    if (onOpen) onOpen(n);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#fff" />}>
        <Pressable onPress={onBack} hitSlop={12}><Text style={styles.back}>‹  BACK</Text></Pressable>
        <View style={styles.titleRow}><View><Text style={styles.title}>ACTIVITY</Text><Text style={styles.subtitle}>STAYUNKNOWN</Text></View>{grouped.unread.length > 0 ? <View style={styles.unreadPill}><Text style={styles.unreadText}>{grouped.unread.length} NEW</Text></View> : null}</View>
        {loading ? <ActivityIndicator color="#fff" style={styles.loader} /> : error ? <View style={styles.errorBox}><Text style={styles.error}>{error}</Text><Pressable onPress={() => load()}><Text style={styles.retry}>TRY AGAIN</Text></Pressable></View> : list.length === 0 ? <View style={styles.empty}><Text style={styles.emptyTitle}>NO ACTIVITY YET</Text><Text style={styles.muted}>Drops, restocks, order updates and support replies will appear here.</Text></View> : <>
          {grouped.unread.length > 0 ? <Text style={styles.section}>NEW</Text> : null}
          {grouped.unread.map(n => <NotificationCard key={n.id} notification={n} onPress={() => open(n)} />)}
          {grouped.read.length > 0 ? <Text style={[styles.section, grouped.unread.length > 0 && styles.readSection]}>EARLIER</Text> : null}
          {grouped.read.map(n => <NotificationCard key={n.id} notification={n} onPress={() => open(n)} />)}
        </>}
      </ScrollView>
    </SafeAreaView>
  );
}

function NotificationCard({ notification:n, onPress }: { notification: Notification; onPress: () => void }) {
  const type = String(n.type || n.kind || '').toLowerCase();
  const icon = type.includes('order') ? '▣' : type.includes('support') ? '◌' : type.includes('promo') ? '%' : type.includes('restock') ? '↻' : type.includes('collection') ? '◇' : '✦';
  return <Pressable onPress={onPress} style={[styles.card, !n.read && styles.unreadCard]}>
    <View style={[styles.icon, !n.read && styles.iconUnread]}><Text style={styles.iconText}>{icon}</Text></View>
    <View style={styles.cardBody}><View style={styles.brandRow}><Text style={styles.brand}>STAYUNKNOWN</Text>{!n.read ? <View style={styles.dot} /> : null}</View><Text style={styles.heading}>{n.title || 'STAYUNKNOWN UPDATE'}</Text><Text style={styles.message}>{n.message || ''}</Text><Text style={styles.time}>{formatTime(n.createdAt || n.date)}</Text></View>
    <Text style={styles.chevron}>›</Text>
  </Pressable>;
}

function formatTime(value: unknown) {
  if (!value) return '';
  const raw = String(value);
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  const diff = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({container:{flex:1,backgroundColor:'#000'},content:{padding:18,paddingBottom:80},back:{color:'#fff',fontSize:10,fontWeight:'900',letterSpacing:1},titleRow:{marginTop:22,marginBottom:20,flexDirection:'row',justifyContent:'space-between',alignItems:'flex-end'},title:{color:'#fff',fontSize:32,fontWeight:'900'},subtitle:{color:'#666',fontSize:8,fontWeight:'900',letterSpacing:2,marginTop:3},unreadPill:{borderWidth:1,borderColor:'#333',paddingHorizontal:8,paddingVertical:5},unreadText:{color:'#fff',fontSize:8,fontWeight:'900'},section:{color:'#666',fontSize:9,fontWeight:'900',letterSpacing:1,marginBottom:10},readSection:{marginTop:24},loader:{marginVertical:30},card:{flexDirection:'row',alignItems:'flex-start',paddingVertical:15,borderTopWidth:1,borderTopColor:'#202020',gap:12},unreadCard:{backgroundColor:'#050505'},icon:{width:42,height:42,borderRadius:21,borderWidth:1,borderColor:'#292929,',alignItems:'center',justifyContent:'center'},iconUnread:{borderColor:'#fff'},iconText:{color:'#fff',fontSize:17,fontWeight:'700'},cardBody:{flex:1},brandRow:{flexDirection:'row',alignItems:'center',gap:6},brand:{color:'#777',fontSize:8,fontWeight:'900',letterSpacing:1},dot:{width:6,height:6,borderRadius:3,backgroundColor:'#fff'},heading:{color:'#fff',fontSize:12,fontWeight:'900',marginTop:6},message:{color:'#999',fontSize:11,lineHeight:17,marginTop:4},time:{color:'#555',fontSize:9,marginTop:6},chevron:{color:'#555',fontSize:22,paddingTop:7},empty:{borderWidth:1,borderColor:'#222',padding:22,marginTop:10},emptyTitle:{color:'#fff',fontSize:12,fontWeight:'900',marginBottom:7},muted:{color:'#666',fontSize:11,lineHeight:18},errorBox:{borderWidth:1,borderColor:'#332222',padding:18},error:{color:'#ff9999',fontSize:10,lineHeight:16},retry:{color:'#fff',fontSize:9,fontWeight:'900',marginTop:12,letterSpacing:1}});
