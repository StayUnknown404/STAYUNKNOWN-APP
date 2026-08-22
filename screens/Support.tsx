import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { createSupportTicket, getSupportTickets, replyToSupportTicket, SupportTicket } from '../services/api';

type Props = { onBack: () => void; initialTicketId?: string };

type Reply = { message?: string; from?: string; sender?: string; createdAt?: string; date?: string };

export default function Support({ onBack, initialTicketId }: Props) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try { setTickets(await getSupportTickets()); }
    catch (e: any) { setError(e?.message || 'Unable to load support conversations.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  useEffect(() => { if (initialTicketId && tickets.length) { const match = tickets.find(t => String(t.id) === String(initialTicketId)); if (match) setSelected(match); } }, [initialTicketId, tickets.length]);

  async function create() {
    if (!subject.trim() || !message.trim() || sending) return;
    setSending(true); setError('');
    try {
      const result = await createSupportTicket({ subject: subject.trim(), message: message.trim() });
      setSubject(''); setMessage('');
      setSelected(result.ticket);
      await load();
    } catch (e: any) { setError(e?.message || 'Unable to start the conversation.'); }
    finally { setSending(false); }
  }

  async function sendReply() {
    if (!selected || !reply.trim() || sending) return;
    setSending(true); setError('');
    try {
      const result = await replyToSupportTicket(selected.id, reply.trim());
      setSelected(result.ticket); setReply('');
      await load();
    } catch (e: any) { setError(e?.message || 'Unable to send your reply.'); }
    finally { setSending(false); }
  }

  if (selected) {
    const replies = Array.isArray(selected.replies) ? (selected.replies as Reply[]) : [];
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={8}>
          <View style={styles.chatHeader}>
            <Pressable onPress={() => setSelected(null)} hitSlop={12}><Text style={styles.back}>←</Text></Pressable>
            <View style={styles.headerCenter}><Text style={styles.titleSmall}>{selected.subject || 'SUPPORT'}</Text><Text style={styles.status}>{String(selected.status || 'OPEN').toUpperCase()}</Text></View>
            <View style={styles.headerSpacer} />
          </View>
          <ScrollView contentContainerStyle={styles.chat} keyboardShouldPersistTaps="handled">
            <Text style={styles.dayLabel}>CONVERSATION</Text>
            <Bubble mine={false} text={selected.message || ''} time={String(selected.createdAt || selected.date || '')} />
            {replies.map((r, i) => {
              const sender = String(r.from || r.sender || '').toLowerCase();
              const mine = sender.includes('customer') || sender.includes('user') || sender.includes('you');
              return <Bubble key={`${i}-${r.message}`} mine={mine} text={r.message || ''} time={String(r.createdAt || r.date || '')} />;
            })}
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </ScrollView>
          <View style={styles.composer}>
            <TextInput value={reply} onChangeText={setReply} placeholder="iMessage" placeholderTextColor="#666" style={styles.replyInput} multiline maxLength={1000} />
            <Pressable disabled={!reply.trim() || sending} onPress={sendReply} style={[styles.send, (!reply.trim() || sending) && styles.sendDisabled]}><Text style={styles.sendText}>↑</Text></Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable onPress={onBack} hitSlop={12}><Text style={styles.back}>←</Text></Pressable>
        <Text style={styles.title}>SUPPORT</Text>
        <Text style={styles.muted}>Message STAYUNKNOWN support. Replies will appear here and in your activity notifications.</Text>
        <View style={styles.newTicket}>
          <Text style={styles.formLabel}>START A CONVERSATION</Text>
          <TextInput value={subject} onChangeText={setSubject} placeholder="Subject" placeholderTextColor="#666" style={styles.input} maxLength={120} />
          <TextInput value={message} onChangeText={setMessage} placeholder="How can we help?" placeholderTextColor="#666" style={[styles.input, styles.multi]} multiline maxLength={2000} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable disabled={!subject.trim() || !message.trim() || sending} onPress={create} style={[styles.white, (!subject.trim() || !message.trim() || sending) && styles.buttonDisabled]}>
            {sending ? <ActivityIndicator color="#000" /> : <Text style={styles.black}>START CONVERSATION</Text>}
          </Pressable>
        </View>
        <View style={styles.sectionRow}><Text style={styles.section}>YOUR CONVERSATIONS</Text><Pressable onPress={() => { setLoading(true); void load(); }}><Text style={styles.refresh}>REFRESH</Text></Pressable></View>
        {loading ? <ActivityIndicator color="#fff" style={styles.loader} /> : tickets.length === 0 ? <Text style={styles.muted}>NO SUPPORT CONVERSATIONS YET.</Text> : tickets.map(t => (
          <Pressable key={t.id} style={styles.ticket} onPress={() => setSelected(t)}>
            <View style={styles.ticketTop}><Text style={styles.ticketTitle}>{t.subject || 'SUPPORT'}</Text><Text style={styles.ticketStatus}>{String(t.status || 'OPEN').toUpperCase()}</Text></View>
            <Text numberOfLines={2} style={styles.preview}>{t.message || 'Open conversation'}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function Bubble({ mine, text, time }: { mine: boolean; text: string; time?: string }) {
  return <View style={[styles.bubbleWrap, mine ? styles.alignRight : styles.alignLeft]}><View style={[styles.bubble, mine ? styles.mine : styles.theirs]}><Text style={[styles.bubbleText, mine && styles.mineText]}>{text}</Text></View>{time ? <Text style={[styles.bubbleTime, mine && styles.timeRight]}>{time}</Text> : null}</View>;
}

const styles = StyleSheet.create({ flex:{flex:1}, container:{flex:1,backgroundColor:'#000'}, content:{padding:18,paddingBottom:80}, back:{color:'#fff',fontSize:26,fontWeight:'400',lineHeight:30,width:42}, title:{color:'#fff',fontSize:32,fontWeight:'900',marginVertical:20}, muted:{color:'#777',fontSize:11,lineHeight:18}, newTicket:{borderWidth:1,borderColor:'#262626',padding:15,marginTop:20,backgroundColor:'#070707'}, formLabel:{color:'#777',fontSize:9,fontWeight:'900',letterSpacing:1,marginBottom:12}, input:{backgroundColor:'#141414',borderWidth:1,borderColor:'#292929',color:'#fff',padding:13,marginBottom:10,fontSize:13}, multi:{minHeight:100,textAlignVertical:'top'}, white:{backgroundColor:'#fff',borderRadius:7,paddingVertical:16,alignItems:'center'}, buttonDisabled:{opacity:.45}, black:{color:'#000',fontSize:10,fontWeight:'900',letterSpacing:.5}, sectionRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:30,marginBottom:10}, section:{color:'#fff',fontSize:11,fontWeight:'900'}, refresh:{color:'#888',fontSize:9,fontWeight:'900'}, loader:{marginVertical:20}, ticket:{borderTopWidth:1,borderTopColor:'#222',paddingVertical:16}, ticketTop:{flexDirection:'row',justifyContent:'space-between',gap:12}, ticketTitle:{color:'#fff',fontSize:12,fontWeight:'900',flex:1}, ticketStatus:{color:'#777',fontSize:8,fontWeight:'900'}, preview:{color:'#777',fontSize:10,lineHeight:16,marginTop:6}, error:{color:'#ff8f8f',fontSize:10,lineHeight:15,marginTop:8}, chatHeader:{height:66,paddingHorizontal:18,borderBottomWidth:1,borderBottomColor:'#222',flexDirection:'row',alignItems:'center',justifyContent:'space-between'}, headerCenter:{alignItems:'center',maxWidth:'55%'}, headerSpacer:{width:65}, titleSmall:{color:'#fff',fontSize:12,fontWeight:'900'}, status:{color:'#666',fontSize:8,fontWeight:'900',marginTop:3}, chat:{padding:18,paddingBottom:30}, dayLabel:{color:'#555',fontSize:8,fontWeight:'900',textAlign:'center',letterSpacing:1,marginBottom:18}, bubbleWrap:{maxWidth:'82%',marginBottom:10}, alignRight:{alignSelf:'flex-end',alignItems:'flex-end'}, alignLeft:{alignSelf:'flex-start',alignItems:'flex-start'}, bubble:{paddingHorizontal:14,paddingVertical:10,borderRadius:19}, mine:{backgroundColor:'#fff',borderBottomRightRadius:5}, theirs:{backgroundColor:'#202020',borderBottomLeftRadius:5}, bubbleText:{color:'#fff',fontSize:13,lineHeight:18}, mineText:{color:'#000'}, bubbleTime:{color:'#555',fontSize:8,marginTop:3}, timeRight:{textAlign:'right'}, composer:{flexDirection:'row',padding:10,borderTopWidth:1,borderTopColor:'#222',gap:8,alignItems:'flex-end',backgroundColor:'#000'}, replyInput:{flex:1,maxHeight:100,minHeight:42,borderWidth:1,borderColor:'#333',backgroundColor:'#151515',color:'#fff',borderRadius:21,paddingHorizontal:16,paddingVertical:10,fontSize:13}, send:{width:42,height:42,borderRadius:7,backgroundColor:'#fff',alignItems:'center',justifyContent:'center'}, sendDisabled:{opacity:.35}, sendText:{color:'#000',fontSize:20,fontWeight:'900'} });
