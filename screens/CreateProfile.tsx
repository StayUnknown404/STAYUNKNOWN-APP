import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';

type Props = { onComplete: (username: string) => void; onSkip: () => void };

export default function CreateProfile({ onComplete, onSkip }: Props) {
  const [username, setUsername] = useState('');
  const valid = username.trim().length >= 3;
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.brand}>STAYUNKNOWN</Text>
        <Text style={styles.title}>CREATE YOUR PROFILE</Text>
        <Text style={styles.subtitle}>Choose a username and make STAYUNKNOWN yours.</Text>
        <Text style={styles.label}>USERNAME</Text>
        <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="Enter username" placeholderTextColor="#666" autoCapitalize="none" autoCorrect={false} />
        <Pressable style={[styles.primary, !valid && styles.disabled]} disabled={!valid} onPress={() => onComplete(username.trim())}>
          <Text style={styles.primaryText}>CREATE PROFILE</Text>
        </Pressable>
        <Pressable style={styles.skip} onPress={onSkip}><Text style={styles.skipText}>SKIP FOR NOW</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#000'}, content:{flex:1,justifyContent:'center',padding:24}, brand:{color:'#fff',fontSize:18,fontWeight:'900',letterSpacing:3,marginBottom:48}, title:{color:'#fff',fontSize:30,fontWeight:'900',marginBottom:12}, subtitle:{color:'#888',fontSize:15,lineHeight:22,marginBottom:34}, label:{color:'#fff',fontSize:11,fontWeight:'800',letterSpacing:1.5,marginBottom:9}, input:{backgroundColor:'#151515',borderWidth:1,borderColor:'#333',color:'#fff',padding:15,fontSize:16,marginBottom:18}, primary:{backgroundColor:'#fff',paddingVertical:17,alignItems:'center'}, disabled:{opacity:.35}, primaryText:{color:'#000',fontSize:11,fontWeight:'900',letterSpacing:1}, skip:{alignItems:'center',padding:18}, skipText:{color:'#888',fontSize:11,fontWeight:'800',letterSpacing:1}
});
