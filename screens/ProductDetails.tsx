import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Pressable, Image, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Product, subscribeRestock } from '../services/api';
import { addToCart, isWishlisted, toggleWishlist } from '../services/store';

type Props = { product: Product; onBack: () => void; onBag: () => void; onWishlistChanged?: () => void };

export default function ProductDetails({ product, onBack, onBag, onWishlistChanged }: Props) {
  const [selectedSize,setSelectedSize]=useState(product.sizes?.[0]||'');
  const [selectedColor,setSelectedColor]=useState(product.colors?.[0]||'');
  const [saved,setSaved]=useState(isWishlisted(product.id));
  const [added,setAdded]=useState(false);
  const [restockEmail,setRestockEmail]=useState('');
  const [restockLoading,setRestockLoading]=useState(false);
  const soldOut=typeof product.stock==='number' && product.stock<=0;
  const lowStock=typeof product.stock==='number'&&typeof product.lowStockThreshold==='number'&&product.stock>0&&product.stock<=product.lowStockThreshold;
  const hasOptions=(product.sizes?.length||0)>0&&(product.colors?.length||0)>0;

  function wishlist(){toggleWishlist(product);setSaved(isWishlisted(product.id));onWishlistChanged?.();}
  function add(){if(soldOut)return;if(hasOptions&&(!selectedSize||!selectedColor)){Alert.alert('Choose your options','Select a size and colour first.');return;}addToCart(product,selectedSize,selectedColor,1);setAdded(true);}
  async function subscribe(){if(!restockEmail.includes('@')){Alert.alert('Enter your email','Use a valid email address.');return;}try{setRestockLoading(true);await subscribeRestock(product.id,restockEmail.trim());Alert.alert('You’re on the list','We’ll notify you when this piece is restocked.');setRestockEmail('');}catch(e:any){Alert.alert('Could not subscribe',e?.message||'Please try again.');}finally{setRestockLoading(false);}}

  return <SafeAreaView style={styles.container}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.top}><Pressable onPress={onBack}><Text style={styles.back}>← BACK</Text></Pressable><Pressable onPress={wishlist}><Text style={styles.heart}>{saved?'♥':'♡'}</Text></Pressable></View>
    <View style={styles.image}>{product.image?<Image source={{uri:product.image}} style={styles.imageActual}/>:<Text style={styles.placeholder}>STAYUNKNOWN</Text>}</View>
    {product.image2&&<View style={styles.image2}><Image source={{uri:product.image2}} style={styles.imageActual}/></View>}
    <View style={styles.details}>
      <Text style={styles.collection}>{product.collection||product.category||'STAYUNKNOWN'}</Text>
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>₦{Number(product.price||0).toLocaleString('en-NG')}</Text>
      {lowStock&&<Text style={styles.status}>LOW STOCK — {product.stock} LEFT</Text>}
      {soldOut&&<Text style={styles.status}>SOLD OUT</Text>}
      {product.comingSoon&&<Text style={styles.status}>COMING SOON</Text>}
      <View style={styles.divider}/>
      {!soldOut&&!product.comingSoon&&<>
        <Text style={styles.label}>COLOUR</Text><View style={styles.options}>{(product.colors||[]).map(c=><Pressable key={c} onPress={()=>setSelectedColor(c)} style={[styles.option,selectedColor===c&&styles.selected]}><Text style={[styles.optionText,selectedColor===c&&styles.selectedText]}>{c}</Text></Pressable>)}</View>
        <Text style={styles.label}>SIZE</Text><View style={styles.options}>{(product.sizes||[]).map(s=><Pressable key={s} onPress={()=>setSelectedSize(s)} style={[styles.option,selectedSize===s&&styles.selected]}><Text style={[styles.optionText,selectedSize===s&&styles.selectedText]}>{s}</Text></Pressable>)}</View>
        <Pressable style={styles.add} onPress={add}><Text style={styles.addText}>{added?'ADDED TO BAG':'ADD TO BAG'}</Text></Pressable>
        {added&&<Pressable style={styles.outline} onPress={onBag}><Text style={styles.outlineText}>VIEW BAG →</Text></Pressable>}
      </>}
      {(soldOut||product.comingSoon)&&<View style={styles.restockBox}><Text style={styles.restockTitle}>{product.comingSoon?'GET DROP ALERTS':'GET RESTOCK ALERT'}</Text><Text style={styles.restockCopy}>Leave your email and we’ll save your interest.</Text><TextInput style={styles.input} value={restockEmail} onChangeText={setRestockEmail} placeholder="you@example.com" placeholderTextColor="#555" autoCapitalize="none" keyboardType="email-address"/><Pressable style={styles.outline} onPress={subscribe} disabled={restockLoading}>{restockLoading?<ActivityIndicator color="#fff"/>:<Text style={styles.outlineText}>NOTIFY ME</Text>}</Pressable></View>}
      <View style={styles.info}><Text style={styles.infoTitle}>PRODUCT DETAILS</Text><Text style={styles.infoText}>{product.description||'Designed for the STAYUNKNOWN uniform. Select your preferred colour and size before adding to your bag.'}</Text></View>
    </View>
  </ScrollView></SafeAreaView>;
}

const styles=StyleSheet.create({container:{flex:1,backgroundColor:'#000'},content:{paddingBottom:60},top:{height:66,paddingHorizontal:20,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},back:{color:'#fff',fontSize:10,fontWeight:'900',letterSpacing:1},heart:{color:'#fff',fontSize:28},image:{height:440,marginHorizontal:12,backgroundColor:'#151515',alignItems:'center',justifyContent:'center'},image2:{height:300,marginHorizontal:12,marginTop:10,backgroundColor:'#151515'},imageActual:{width:'100%',height:'100%'},placeholder:{color:'#555',fontSize:10,fontWeight:'900',letterSpacing:2},details:{padding:22},collection:{color:'#777',fontSize:10,fontWeight:'800',letterSpacing:1.5},name:{color:'#fff',fontSize:27,fontWeight:'900',marginTop:7},price:{color:'#aaa',fontSize:16,marginTop:7},status:{color:'#fff',fontSize:10,fontWeight:'900',letterSpacing:1,marginTop:12},divider:{height:1,backgroundColor:'#222',marginVertical:25},label:{color:'#fff',fontSize:10,fontWeight:'900',letterSpacing:1.2,marginTop:12,marginBottom:12},options:{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:12},option:{minWidth:58,paddingHorizontal:15,paddingVertical:13,borderWidth:1,borderColor:'#333',alignItems:'center'},selected:{backgroundColor:'#fff',borderColor:'#fff'},optionText:{color:'#aaa',fontSize:11,fontWeight:'800'},selectedText:{color:'#000'},add:{backgroundColor:'#fff',paddingVertical:17,alignItems:'center',marginTop:25},addText:{color:'#000',fontSize:11,fontWeight:'900',letterSpacing:1},outline:{borderWidth:1,borderColor:'#fff',paddingVertical:16,alignItems:'center',marginTop:10},outlineText:{color:'#fff',fontSize:11,fontWeight:'900',letterSpacing:1},restockBox:{marginTop:20,borderTopWidth:1,borderTopColor:'#222',paddingTop:25},restockTitle:{color:'#fff',fontSize:13,fontWeight:'900',letterSpacing:1},restockCopy:{color:'#777',fontSize:13,lineHeight:20,marginTop:7},input:{borderWidth:1,borderColor:'#333',backgroundColor:'#151515',color:'#fff',padding:14,marginTop:15},info:{marginTop:35,paddingTop:25,borderTopWidth:1,borderTopColor:'#222'},infoTitle:{color:'#fff',fontSize:11,fontWeight:'900',letterSpacing:1},infoText:{color:'#777',fontSize:14,lineHeight:22,marginTop:10}}
);
