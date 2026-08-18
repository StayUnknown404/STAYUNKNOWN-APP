import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Pressable, ActivityIndicator } from 'react-native';
import Home from './screens/Home';
import CreateProfile from './screens/CreateProfile';
import { auth, onAuthStateChanged, User } from './services/firebase';

export default function App(){
 const [ready,setReady]=useState(false);const [user,setUser]=useState<User|null>(auth.currentUser);const [profileDone,setProfileDone]=useState(false);
 useEffect(()=>onAuthStateChanged(auth,u=>{setUser(u);setReady(true);}),[]);
 if(!ready)return <SafeAreaView style={styles.container}><ActivityIndicator color="#fff"/></SafeAreaView>;
 if(!user&&!profileDone)return <Welcome onStart={()=>setProfileDone(true)} onGuest={()=>setProfileDone(true)}/>;
 if(!user&&profileDone)return <CreateProfile onComplete={()=>setProfileDone(true)} onSkip={()=>setProfileDone(true)}/>;
 return <Home/>;
}
function Welcome({onStart,onGuest}:{onStart:()=>void;onGuest:()=>void}){return <SafeAreaView style={styles.container}><View style={styles.welcome}><Text style={styles.brand}>STAYUNKNOWN</Text><View><Text style={styles.title}>WELCOME TO THE APP</Text><Text style={styles.subtitle}>Move in silence. Stay unknown.</Text></View><Pressable style={styles.button} onPress={onStart}><Text style={styles.buttonText}>GET STARTED</Text></Pressable><Pressable style={styles.guest} onPress={onGuest}><Text style={styles.guestText}>CONTINUE AS GUEST</Text></Pressable></View></SafeAreaView>}
const styles=StyleSheet.create({container:{flex:1,backgroundColor:'#000',alignItems:'stretch',justifyContent:'center'},welcome:{flex:1,justifyContent:'space-between',padding:24,paddingTop:80,paddingBottom:35},brand:{color:'#fff',fontSize:19,fontWeight:'900',letterSpacing:3},title:{color:'#fff',fontSize:32,fontWeight:'900',letterSpacing:1},subtitle:{color:'#888',fontSize:15,lineHeight:23,marginTop:12},button:{backgroundColor:'#fff',paddingVertical:18,alignItems:'center'},buttonText:{color:'#000',fontSize:11,fontWeight:'900',letterSpacing:1},guest:{alignItems:'center',padding:16},guestText:{color:'#888',fontSize:10,fontWeight:'900',letterSpacing:1}}
);
