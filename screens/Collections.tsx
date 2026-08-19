import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Pressable, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Collection, getCatalog, getCollections, Product } from '../services/api';

type Props={onBack:()=>void;onProduct:(product:Product)=>void;initialCollectionId?:string};
const COLLECTION_CACHE='stayunknown_collections_cache_v1';
const CATALOG_CACHE='stayunknown_catalog_cache_v1';

export default function Collections({onBack,onProduct,initialCollectionId}:Props){
 const [collections,setCollections]=useState<Collection[]>([]);
 const [products,setProducts]=useState<Product[]>([]);
 const [selected,setSelected]=useState<Collection|null>(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 useEffect(()=>{void load();},[]);
 useEffect(()=>{if(initialCollectionId&&collections.length){setSelected(collections.find(c=>c.id===initialCollectionId)||null);}},[initialCollectionId,collections]);
 async function load(){
  setError('');
  try{
   const cached=await AsyncStorage.multiGet([COLLECTION_CACHE,CATALOG_CACHE]);
   const cachedCollections=cached[0][1]?JSON.parse(cached[0][1]):null;
   const cachedProducts=cached[1][1]?JSON.parse(cached[1][1]):null;
   if(Array.isArray(cachedCollections)) setCollections(cachedCollections);
   if(Array.isArray(cachedProducts)) setProducts(cachedProducts);
  }catch{}
  setLoading(true);
  try{
   const [c,p]=await Promise.all([getCollections(),getCatalog()]);
   setCollections(c);setProducts(p);
   await AsyncStorage.multiSet([[COLLECTION_CACHE,JSON.stringify(c)],[CATALOG_CACHE,JSON.stringify(p)]]);
  }catch(e:any){
   if(collections.length===0) setError(e?.message||'Unable to load collections.');
  }finally{setLoading(false);}
 }
 const selectedProducts=useMemo(()=>{
  if(!selected)return[];
  const ids=new Set((selected.productIds||[]).map(String));
  const byId=products.filter(p=>ids.has(p.id));
  if(byId.length)return byId;
  return products.filter(p=>String(p.collection||'').trim().toLowerCase()===selected.name.trim().toLowerCase());
 },[selected,products]);
 if(selected)return <SafeAreaView style={styles.container}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
  <View style={styles.header}><Pressable onPress={()=>setSelected(null)} hitSlop={10}><Text style={styles.back}>← ALL COLLECTIONS</Text></Pressable></View>
  <Text style={styles.title}>{selected.name}</Text>
  {selected.description?<Text style={styles.description}>{selected.description}</Text>:null}
  <View style={styles.hero}>{selected.image?<Image source={{uri:selected.image}} style={styles.heroImage}/>:<Text style={styles.heroText}>{selected.name}</Text>}</View>
  <Text style={styles.count}>{selectedProducts.length} {selectedProducts.length===1?'PIECE':'PIECES'}</Text>
  {selectedProducts.length===0?<View style={styles.center}><Text style={styles.muted}>NO PRODUCTS IN THIS COLLECTION YET.</Text>{loading?<ActivityIndicator color="#fff"/>:null}</View>:<View style={styles.grid}>{selectedProducts.filter(p=>!p.hidden).map(p=><Pressable key={p.id} style={styles.product} onPress={()=>onProduct(p)}>
   <View style={styles.productImage}>{p.image?<Image source={{uri:p.image}} style={styles.image}/>:<Text style={styles.placeholder}>STAYUNKNOWN</Text>}{p.comingSoon?<View style={styles.badge}><Text style={styles.badgeText}>COMING SOON</Text></View>:typeof p.stock==='number'&&p.stock<=0?<View style={styles.badge}><Text style={styles.badgeText}>SOLD OUT</Text></View>:null}</View>
   <Text style={styles.name}>{p.name}</Text><Text style={styles.price}>₦{Number(p.price).toLocaleString('en-NG')}</Text>
  </Pressable>)}</View>}
 </ScrollView></SafeAreaView>;
 return <SafeAreaView style={styles.container}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
  <View style={styles.header}><Pressable onPress={onBack} hitSlop={10}><Text style={styles.back}>← BACK</Text></Pressable></View>
  <Text style={styles.title}>COLLECTIONS</Text>
  {error?<View style={styles.center}><Text style={styles.error}>{error}</Text><Pressable style={styles.outline} onPress={load}><Text style={styles.outlineText}>TRY AGAIN</Text></Pressable></View>:collections.length===0&&loading?<View style={styles.center}><ActivityIndicator color="#fff"/><Text style={styles.muted}>LOADING COLLECTIONS…</Text></View>:collections.length===0?<View style={styles.center}><Text style={styles.muted}>NO COLLECTIONS YET.</Text></View>:<View style={styles.list}>{collections.filter(c=>!c.hidden).sort((a,b)=>(a.order??9999)-(b.order??9999)).map(c=><Pressable key={c.id} style={styles.card} onPress={()=>setSelected(c)}>
   <View style={styles.cardImage}>{c.image?<Image source={{uri:c.image}} style={styles.image}/>:<Text style={styles.cardName}>{c.name}</Text>}</View>
   <View style={styles.cardBottom}><Text style={styles.cardName}>{c.name}</Text><Text style={styles.arrow}>→</Text></View>
   {c.description?<Text style={styles.cardDescription} numberOfLines={2}>{c.description}</Text>:null}
   <Text style={styles.count}>{c.productCount||0} {(c.productCount||0)===1?'PIECE':'PIECES'}</Text>
  </Pressable>)}</View>}
 </ScrollView></SafeAreaView>;
}
const styles=StyleSheet.create({container:{flex:1,backgroundColor:'#000'},content:{padding:20,paddingBottom:60},header:{height:55,justifyContent:'center'},back:{color:'#fff',fontSize:10,fontWeight:'900',letterSpacing:1},title:{color:'#fff',fontSize:38,fontWeight:'900',letterSpacing:1,marginBottom:20},description:{color:'#888',fontSize:14,lineHeight:21,marginBottom:20},list:{gap:16},card:{borderWidth:1,borderColor:'#2b2b2b',paddingBottom:16},cardImage:{height:280,backgroundColor:'#111',alignItems:'center',justifyContent:'center'},image:{width:'100%',height:'100%'},cardBottom:{paddingHorizontal:16,paddingTop:14,flexDirection:'row',justifyContent:'space-between'},cardName:{color:'#fff',fontSize:18,fontWeight:'900',letterSpacing:1},arrow:{color:'#fff',fontSize:20},cardDescription:{color:'#777',fontSize:12,lineHeight:18,paddingHorizontal:16,marginTop:8},count:{color:'#777',fontSize:10,fontWeight:'800',letterSpacing:1,paddingHorizontal:16,marginTop:7},hero:{height:340,backgroundColor:'#111',alignItems:'center',justifyContent:'center'},heroImage:{width:'100%',height:'100%'},heroText:{color:'#fff',fontSize:32,fontWeight:'900'},grid:{flexDirection:'row',flexWrap:'wrap',marginHorizontal:-6},product:{width:'50%',padding:6,marginBottom:18},productImage:{height:230,backgroundColor:'#151515',alignItems:'center',justifyContent:'center',position:'relative'},name:{color:'#fff',fontSize:12,fontWeight:'800',marginTop:8},price:{color:'#888',fontSize:12,marginTop:4},placeholder:{color:'#555',fontSize:9,fontWeight:'900'},badge:{position:'absolute',bottom:9,left:9,backgroundColor:'#fff',paddingHorizontal:7,paddingVertical:5},badgeText:{color:'#000',fontSize:7,fontWeight:'900'},center:{minHeight:350,justifyContent:'center',alignItems:'center',gap:12},muted:{color:'#777',fontSize:11,fontWeight:'800',letterSpacing:1,textAlign:'center'},error:{color:'#fff',textAlign:'center'},outline:{borderWidth:1,borderColor:'#fff',paddingHorizontal:20,paddingVertical:14},outlineText:{color:'#fff',fontSize:10,fontWeight:'900'}});
