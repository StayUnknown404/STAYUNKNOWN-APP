import React, { useEffect, useState, type ReactNode } from 'react';
import { Alert, ActivityIndicator, Image, Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { checkAdmin, createAdminCollection, createAdminPromo, deleteAdminCollection, deleteAdminPromo, getAdminCollections, getAdminInventory, getAdminNotifications, getAdminOrders, getAdminProducts, getAdminPromos, getAdminRestockSubscriptions, getAdminSupport, markAdminNotificationRead, createAdminNotification, updateAdminNotification, deleteAdminNotification, replyToSupportTicket, updateAdminCollection, updateAdminPromo, updateOrderDelivery, updateSupportStatus } from '../services/admin';
import AdminProducts from './AdminProducts';

type Props={onBack:()=>void};
type Tab='overview'|'products'|'collections'|'orders'|'inventory'|'promos'|'restock'|'support'|'notifications';

export default function AdminDashboard({onBack}:Props){
 const [tab,setTab]=useState<Tab>('overview');const [admin,setAdmin]=useState<boolean|null>(null);const [adminRole,setAdminRole]=useState<string>('OWNER');const [error,setError]=useState('');
 useEffect(()=>{void checkAdmin().then(r=>{setAdmin(r.isAdmin);setAdminRole(String(r.role||'OWNER'));}).catch(e=>{setAdmin(false);setError(e?.message||'Unable to verify admin access.');});},[]);
 if(admin===null)return <View style={styles.center}><ActivityIndicator color="#fff"/><Text style={styles.muted}>VERIFYING ADMIN ACCESS…</Text></View>;
 if(!admin)return <View style={styles.center}><Text style={styles.denied}>ADMIN ACCESS DENIED</Text><Text style={styles.muted}>{error||'Your Firebase account is not authorized as an admin.'}</Text><Pressable style={styles.outline} onPress={onBack}><Text style={styles.outlineText}>←</Text></Pressable></View>;
 if(tab==='products')return <AdminPage title="PRODUCTS" onBack={()=>setTab('overview')}><AdminProducts onBack={()=>setTab('overview')}/></AdminPage>;
 if(tab==='collections')return <AdminPage title="COLLECTIONS" onBack={()=>setTab('overview')}><CollectionsAdmin/></AdminPage>;
 if(tab==='orders')return <AdminPage title="ORDERS" onBack={()=>setTab('overview')}><OrdersAdmin/></AdminPage>;
 if(tab==='inventory')return <AdminPage title="INVENTORY" onBack={()=>setTab('overview')}><InventoryAdmin/></AdminPage>;
 if(tab==='promos')return <AdminPage title="PROMOTIONS" onBack={()=>setTab('overview')}><PromosAdmin/></AdminPage>;
 if(tab==='restock')return <AdminPage title="RESTOCK" onBack={()=>setTab('overview')}><RestockAdmin/></AdminPage>;
 if(tab==='support')return <AdminPage title="SUPPORT" onBack={()=>setTab('overview')}><NotificationsOrSupport mode="support"/></AdminPage>;
 if(tab==='notifications')return <AdminPage title="NOTIFICATIONS" onBack={()=>setTab('overview')}><NotificationsOrSupport mode="notifications"/></AdminPage>;
 return <ScrollView style={styles.container} contentContainerStyle={styles.content}><View style={styles.header}><Pressable onPress={onBack}><Text style={styles.back}>←</Text></Pressable><Text style={styles.title}>ADMIN</Text></View><Text style={styles.muted}>ROLE · {adminRole.replace(/_/g,' ')}</Text><Overview onTab={setTab}/></ScrollView>
}
function AdminPage({title,onBack,children}:{title:string;onBack:()=>void;children?:ReactNode}){return <SafeAreaView style={styles.container}><ScrollView contentContainerStyle={styles.content}><View style={styles.header}><Pressable onPress={onBack}><Text style={styles.back}>←</Text></Pressable><Text style={styles.title}>{title}</Text></View>{children}</ScrollView></SafeAreaView>}
function Overview({onTab}:{onTab:(t:Tab)=>void}){return <View><Text style={styles.big}>STAYUNKNOWN CONTROL</Text><Text style={styles.muted}>Manage the storefront, inventory, collections, orders and customer operations from one place.</Text><View style={styles.tiles}>{[['PRODUCTS','products'],['COLLECTIONS','collections'],['ORDERS','orders'],['INVENTORY','inventory'],['PROMOS','promos'],['SUPPORT','support'],['NOTIFICATIONS','notifications'],['RESTOCK','restock']].map(([a,b])=><Pressable key={b} style={styles.tile} onPress={()=>onTab(b as Tab)}><Text style={styles.tileTitle}>{a}</Text><Text style={styles.arrow}>→</Text></Pressable>)}</View></View>}

function CollectionsAdmin(){
 const [list,setList]=useState<any[]>([]);const [products,setProducts]=useState<any[]>([]);const [editing,setEditing]=useState<any|null>(null);const [screen,setScreen]=useState<'list'|'editor'>('list');const [name,setName]=useState('');const [description,setDescription]=useState('');const [image,setImage]=useState('');const [order,setOrder]=useState('0');const [selectedIds,setSelectedIds]=useState<string[]>([]);const [limited,setLimited]=useState(false);const [hidden,setHidden]=useState(false);const [loading,setLoading]=useState(true);const [saving,setSaving]=useState(false);
 const load=async()=>{try{setLoading(true);const [c,p]=await Promise.all([getAdminCollections(),(async()=>{const {getAdminProducts}=await import('../services/admin');return getAdminProducts();})()]);setList(c);setProducts(p);}catch(e:any){Alert.alert('Could not load',e?.message||'Please try again.');}finally{setLoading(false);}};
 useEffect(()=>{void load();},[]);
 function openCreate(){setEditing(null);setName('');setDescription('');setImage('');setOrder('0');setSelectedIds([]);setLimited(false);setHidden(false);setScreen('editor');}
 function edit(c:any){setEditing(c);setName(c.name||'');setDescription(c.description||'');setImage(c.image||'');setOrder(String(c.order||0));setSelectedIds(Array.isArray(c.productIds)?c.productIds.map(String):[]);setLimited(Boolean(c.limited));setHidden(Boolean(c.hidden));setScreen('editor');}
 function backToList(){setScreen('list');setEditing(null);}
 async function pick(){try{const r=await ImagePicker.launchImageLibraryAsync({mediaTypes:ImagePicker.MediaTypeOptions.Images,allowsEditing:true,aspect:[4,3],quality:.82});if(r.canceled||!r.assets?.[0])return;const out=await ImageManipulator.manipulateAsync(r.assets[0].uri,[{resize:{width:1200}}],{compress:.8,format:ImageManipulator.SaveFormat.JPEG});const b=await FileSystem.readAsStringAsync(out.uri,{encoding:FileSystem.EncodingType.Base64});setImage(`data:image/jpeg;base64,${b}`);}catch(e:any){Alert.alert('Image error',e?.message||'Unable to process image.');}}
 async function save(){if(!name.trim())return Alert.alert('Name required');try{setSaving(true);const payload={name:name.trim(),description,image,order:Number(order||0),productIds:selectedIds,limited,hidden};if(editing)await updateAdminCollection(editing.id,payload);else await createAdminCollection(payload);await load();Alert.alert('Saved','Collection saved successfully.');backToList();}catch(e:any){Alert.alert('Save failed',e?.message||'Please try again.');}finally{setSaving(false);}}
 async function remove(c:any){Alert.alert('Delete collection?',c.name,[{text:'CANCEL',style:'cancel'},{text:'DELETE',style:'destructive',onPress:async()=>{try{await deleteAdminCollection(c.id);await load();}catch(e:any){Alert.alert('Delete failed',e?.message||'Please try again.');}}}]);}
 if(loading)return <View style={styles.center}><ActivityIndicator color="#fff"/><Text style={styles.muted}>LOADING COLLECTIONS…</Text></View>;
 if(screen==='editor')return <View>
   <View style={styles.editorHeader}><Pressable onPress={backToList}><Text style={styles.back}>← COLLECTIONS</Text></Pressable><Text style={styles.editorPageTitle}>{editing?'EDIT COLLECTION':'CREATE COLLECTION'}</Text><View style={styles.headerSpacer}/></View>
   <View style={styles.editor}>
    <Text style={styles.editorTitle}>{editing?'EDIT COLLECTION':'CREATE COLLECTION'}</Text>
    <Text style={styles.label}>NAME</Text><TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Collection name" placeholderTextColor="#555"/>
    <Text style={styles.label}>DESCRIPTION</Text><TextInput style={[styles.input,styles.multiline]} value={description} onChangeText={setDescription} placeholder="Description" placeholderTextColor="#555" multiline/>
    <Text style={styles.label}>ORDER</Text><TextInput style={styles.input} value={order} onChangeText={setOrder} placeholder="0" placeholderTextColor="#555" keyboardType="numeric"/>
    <View style={styles.statusRow}><Pressable style={[styles.smallButton,limited&&styles.smallActive]} onPress={()=>setLimited(v=>!v)}><Text style={styles.smallText}>{limited?'LIMITED COLLECTION ✓':'LIMITED COLLECTION'}</Text></Pressable><Pressable style={[styles.smallButton,hidden&&styles.smallActive]} onPress={()=>setHidden(v=>!v)}><Text style={styles.smallText}>{hidden?'HIDDEN ✓':'VISIBLE'}</Text></Pressable></View>
    <Pressable style={styles.outline} onPress={pick}><Text style={styles.outlineText}>{image?'CHANGE COLLECTION IMAGE':'CHOOSE COLLECTION IMAGE'}</Text></Pressable>{image?<Image source={{uri:image}} style={styles.collectionPreview}/>:null}
    <Text style={styles.label}>PRODUCTS IN COLLECTION</Text><View style={styles.productPicker}>{products.map(p=><Pressable key={p.id} style={[styles.pickRow,selectedIds.includes(String(p.id))&&styles.pickSelected]} onPress={()=>setSelectedIds(ids=>ids.includes(String(p.id))?ids.filter(id=>id!==String(p.id)):[...ids,String(p.id)])}><Text style={[styles.pickName,selectedIds.includes(String(p.id))&&styles.pickNameSelected]}>{p.name}</Text><Text style={[styles.pickMark,selectedIds.includes(String(p.id))&&styles.pickMarkSelected]}>{selectedIds.includes(String(p.id))?'✓':''}</Text></Pressable>)}</View>
    <Pressable style={styles.collectionSave} onPress={save} disabled={saving}>{saving?<ActivityIndicator color="#000"/>:<Text style={styles.collectionSaveText}>{editing?'SAVE CHANGES':'CREATE COLLECTION'}</Text>}</Pressable>
    <Pressable style={styles.cancel} onPress={backToList}><Text style={styles.cancelText}>CANCEL</Text></Pressable>
    {editing?<Pressable style={styles.delete} onPress={()=>remove(editing)}><Text style={styles.deleteText}>DELETE COLLECTION</Text></Pressable>:null}
   </View>
 </View>;
 return <View>
  <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>COLLECTIONS</Text><Text style={styles.muted}>{list.length} COLLECTIONS</Text></View><Pressable style={styles.collectionCreateButton} onPress={openCreate}><Text style={styles.collectionCreateText}>+ CREATE COLLECTION</Text></Pressable></View>
  <View style={styles.collectionList}>{list.length===0?<Text style={styles.muted}>No collections yet.</Text>:list.map(c=><Pressable key={c.id} style={styles.collectionCard} onPress={()=>edit(c)}><View style={styles.collectionThumbWrap}>{c.image?<Image source={{uri:c.image}} style={styles.collectionThumbLarge}/>:<View style={styles.collectionThumbLarge}/>}</View><View style={styles.collectionInfo}><Text style={styles.rowTitle}>{c.name||'UNTITLED COLLECTION'}</Text><Text style={styles.rowMeta}>{c.productIds?.length||c.productCount||0} products · order {c.order||0}</Text><Text style={styles.rowMeta}>{c.limited?'LIMITED · ':''}{c.hidden?'HIDDEN':'VISIBLE'}</Text></View><Text style={styles.collectionChevron}>›</Text></Pressable>)}</View>
 </View>
}

function OrdersAdmin(){
 const [orders,setOrders]=useState<any[]>([]);const [loading,setLoading]=useState(true);const [query,setQuery]=useState('');const [selected,setSelected]=useState<any|null>(null);const [saving,setSaving]=useState(false);const [courier,setCourier]=useState('');const [tracking,setTracking]=useState('');const [note,setNote]=useState('');const [estimated,setEstimated]=useState('');const [status,setStatus]=useState('PAID');
 const load=async()=>{try{setLoading(true);setOrders(await getAdminOrders());}catch(e:any){Alert.alert('Orders failed',e?.message||'Please try again.');}finally{setLoading(false);}};
 useEffect(()=>{void load();},[]);
 function openOrder(o:any){
   const current=String(o.deliveryStatus||o.paymentStatus||'PAID').toUpperCase();
   setSelected(o);setStatus(current);setCourier(o.courier||'');setTracking(o.trackingNumber||o.tracking||o.trackingUrl||'');setNote(o.note||o.deliveryNote||o.deliveryNotes||'');setEstimated(o.estimatedDelivery||'');
 }
 function closeOrder(){setSelected(null);}
 async function saveOrder(){if(!selected)return;try{setSaving(true);await updateOrderDelivery(selected.id,{deliveryStatus:status,courier:courier.trim(),trackingNumber:tracking.trim(),deliveryNote:note.trim(),estimatedDelivery:estimated.trim()});await load();Alert.alert('Saved','Order updated successfully.');closeOrder();}catch(e:any){Alert.alert('Save failed',e?.message||'Please try again.');}finally{setSaving(false);}}
 if(loading)return <ActivityIndicator color="#fff"/>;
 if(selected){
   const customer=selected.customer||{};const items=Array.isArray(selected.items)?selected.items:[];const current=String(status||'PAID').toUpperCase();
   return <View>
    <View style={styles.editorHeader}><Pressable onPress={closeOrder}><Text style={styles.back}>← ORDERS</Text></Pressable><Text style={styles.editorPageTitle}>ORDER DETAILS</Text><View style={styles.headerSpacer}/></View>
    <View style={styles.editor}>
      <Text style={styles.editorTitle}>{selected.orderNumber||selected.paymentReference||selected.id}</Text>
      <Text style={styles.rowMeta}>{customer.name||selected.name||'Customer'}</Text>
      <Text style={styles.rowMeta}>{customer.email||selected.email||'No email'}</Text>
      {customer.phone||selected.phone?<Text style={styles.rowMeta}>{customer.phone||selected.phone}</Text>:null}
      <Text style={styles.label}>ORDER STATUS</Text>
      <View style={styles.statusRow}>{['PAID','PROCESSING','PACKED','SHIPPED','DELIVERED','FAILED'].map(st=><Pressable key={st} style={[styles.smallButton,current===st&&styles.smallActive]} onPress={()=>setStatus(st)}><Text style={[styles.smallText,current===st&&styles.smallTextActive]}>{st}</Text></Pressable>)}</View>
      <Text style={styles.label}>ORDER ITEMS</Text>
      {items.length?items.map((item:any,i:number)=><View key={`${item.id||item.name||'item'}-${i}`} style={styles.itemRow}><View style={styles.flex}><Text style={styles.detail}>{item.name||item.productName||item.productId||'Product'}</Text><Text style={styles.rowMeta}>Qty {item.quantity??item.qty??1}{item.size?` · ${item.size}`:''}{item.color?` · ${item.color}`:''}</Text></View><Text style={styles.detail}>₦{Number(item.price||item.amount||0).toLocaleString('en-NG')}</Text></View>):<Text style={styles.detail}>No item details returned.</Text>}
      <Text style={styles.label}>TOTAL</Text><Text style={styles.total}>₦{Number(selected.total||selected.amount||0).toLocaleString('en-NG')}</Text>
      {selected.deliveryAddress?<><Text style={styles.label}>DELIVERY ADDRESS</Text><Text style={styles.detail}>{typeof selected.deliveryAddress==='string'?selected.deliveryAddress:[selected.deliveryAddress.name,selected.deliveryAddress.address,selected.deliveryAddress.city,selected.deliveryAddress.state].filter(Boolean).join(' · ')||'—'}</Text></>:null}
      <Text style={styles.label}>COURIER</Text><TextInput style={styles.input} value={courier} onChangeText={setCourier} placeholder="DHL, GIG, etc." placeholderTextColor="#555"/>
      <Text style={styles.label}>TRACKING NUMBER / LINK</Text><TextInput style={styles.input} value={tracking} onChangeText={setTracking} placeholder="Tracking number or URL" placeholderTextColor="#555" autoCapitalize="none"/>
      {tracking.startsWith('http')?<Pressable style={styles.outline} onPress={()=>void Linking.openURL(tracking)}><Text style={styles.outlineText}>OPEN TRACKING LINK</Text></Pressable>:null}
      <Text style={styles.label}>ESTIMATED DELIVERY</Text><TextInput style={styles.input} value={estimated} onChangeText={setEstimated} placeholder="e.g. Aug 25" placeholderTextColor="#555"/>
      <Text style={styles.label}>NOTE</Text><TextInput style={[styles.input,styles.multiline]} value={note} onChangeText={setNote} placeholder="Delivery/internal note" placeholderTextColor="#555" multiline/>
      <Pressable style={styles.collectionSave} onPress={()=>void saveOrder()} disabled={saving}>{saving?<ActivityIndicator color="#000"/>:<Text style={styles.collectionSaveText}>SAVE ORDER</Text>}</Pressable>
      <Pressable style={styles.cancel} onPress={closeOrder}><Text style={styles.cancelText}>BACK TO ORDERS</Text></Pressable>
    </View>
   </View>;
 }
 const q=query.trim().toLowerCase();const filtered=orders.filter(o=>[o.id,o.orderNumber,o.paymentReference,o.email,o.name,o.phone,o.customer?.email,o.customer?.name,o.customer?.phone,o.deliveryAddress?.name,o.deliveryAddress?.phone,o.deliveryAddress?.address,...(Array.isArray(o.items)?o.items.map((i:any)=>i.name):[])].filter(Boolean).join(' ').toLowerCase().includes(q));
 return <View>
  <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>ORDERS</Text><Text style={styles.muted}>{filtered.length} OF {orders.length} ORDERS</Text></View><Pressable onPress={()=>void load()}><Text style={styles.add}>REFRESH</Text></Pressable></View>
  <TextInput style={styles.input} value={query} onChangeText={setQuery} placeholder="SEARCH ORDER, CUSTOMER, EMAIL, PRODUCT..." placeholderTextColor="#555" autoCapitalize="none"/>
  {filtered.length===0?<Text style={styles.muted}>No matching orders.</Text>:<View>{filtered.map(o=>{const current=String(o.deliveryStatus||o.paymentStatus||'PAID').toUpperCase();const customer=o.customer||{};const items=Array.isArray(o.items)?o.items:[];return <Pressable key={o.id} style={styles.card} onPress={()=>openOrder(o)}>
    <View style={styles.sectionHeader}><View style={styles.flex}><Text style={styles.rowTitle}>{o.orderNumber||o.paymentReference||o.id}</Text><Text style={styles.rowMeta}>{customer.name||o.name||'Customer'} · {customer.email||o.email||'No email'}</Text></View><Text style={styles.statusBadge}>{current}</Text></View>
    <Text style={styles.rowMeta}>₦{Number(o.total||o.amount||0).toLocaleString('en-NG')} · {items.length} item{items.length===1?'':'s'}{customer.phone||o.phone?` · ${customer.phone||o.phone}`:''}</Text>
    <Text style={styles.openOrder}>VIEW ORDER →</Text>
  </Pressable>})}</View>}
 </View>;
}
function InventoryAdmin(){
 const [items,setItems]=useState<any[]>([]);const [products,setProducts]=useState<any[]>([]);const [query,setQuery]=useState('');const [lowOnly,setLowOnly]=useState(false);const [loading,setLoading]=useState(true);const [saving,setSaving]=useState<string|null>(null);const [draft,setDraft]=useState<Record<string,string>>({});
 const load=async()=>{try{setLoading(true);const [inventory,allProducts]=await Promise.all([getAdminInventory(),(async()=>{const {getAdminProducts}=await import('../services/admin');return getAdminProducts();})()]);setItems(inventory);setProducts(allProducts);}catch(e:any){Alert.alert('Inventory failed',e?.message||'Please try again.');}finally{setLoading(false);}};
 useEffect(()=>{void load();},[]);
 const rows=(items.length?items:products).map((i:any)=>{const id=String(i.productId||i.id||'');const p=products.find(x=>String(x.id)===id)||i;return {...p,...i,id:id||p.id,productId:id||p.id,name:i.name||i.productName||p.name,stock:Number(i.stock??i.quantity??p.stock??0),lowStockThreshold:Number(i.lowStockThreshold??p.lowStockThreshold??3)};});
 const filtered=rows.filter(i=>{const q=query.trim().toLowerCase();const match=!q||[i.name,i.category,i.id].some((v:any)=>String(v||'').toLowerCase().includes(q));return match&&(!lowOnly||i.stock<=i.lowStockThreshold);});
 async function adjust(i:any,delta:number){const next=Math.max(0,i.stock+delta);if(!i.id)return Alert.alert('Missing product','This inventory record is not linked to a product.');try{setSaving(i.id);const {updateAdminProduct}=await import('../services/admin');await updateAdminProduct(String(i.id),{stock:next});await load();}catch(e:any){Alert.alert('Stock update failed',e?.message||'Please try again.');}finally{setSaving(null);}}
 async function setStock(i:any){const raw=draft[i.id];const next=Number(raw);if(!Number.isFinite(next)||next<0)return Alert.alert('Invalid stock','Enter a number of 0 or more.');try{setSaving(i.id);const {updateAdminProduct}=await import('../services/admin');await updateAdminProduct(String(i.id),{stock:Math.floor(next)});setDraft(d=>({...d,[i.id]:''}));await load();}catch(e:any){Alert.alert('Stock update failed',e?.message||'Please try again.');}finally{setSaving(null);}}
 if(loading)return <ActivityIndicator color="#fff"/>;
 return <View><View style={styles.sectionHeader}><Text style={styles.sectionTitle}>INVENTORY · {filtered.length}</Text><Pressable onPress={()=>void load()}><Text style={styles.add}>REFRESH</Text></Pressable></View><TextInput style={styles.input} value={query} onChangeText={setQuery} placeholder="SEARCH PRODUCT / CATEGORY / ID" placeholderTextColor="#555" autoCapitalize="none"/><Pressable style={[styles.smallButton,lowOnly&&styles.smallActive]} onPress={()=>setLowOnly(v=>!v)}><Text style={styles.smallText}>{lowOnly?'LOW STOCK ONLY ✓':'SHOW LOW STOCK ONLY'}</Text></Pressable>{filtered.length===0?<Text style={styles.muted}>No inventory records match this view.</Text>:filtered.map(i=><View key={i.id} style={styles.card}><View style={styles.sectionHeader}><View style={styles.flex}><Text style={styles.rowTitle}>{i.name||i.id}</Text><Text style={styles.rowMeta}>{i.category||'—'} · threshold {i.lowStockThreshold}</Text></View><Text style={[styles.stockNumber,i.stock<=i.lowStockThreshold&&styles.lowStock]}>{i.stock}</Text></View><View style={styles.statusRow}><Pressable style={styles.smallButton} disabled={saving===i.id} onPress={()=>void adjust(i,-1)}><Text style={styles.smallText}>−1</Text></Pressable><Pressable style={styles.smallButton} disabled={saving===i.id} onPress={()=>void adjust(i,1)}><Text style={styles.smallText}>+1</Text></Pressable><TextInput style={[styles.input,styles.stockInput]} value={draft[i.id]||''} onChangeText={v=>setDraft(d=>({...d,[i.id]:v.replace(/\D/g,'')}))} placeholder="SET" placeholderTextColor="#555" keyboardType="numeric"/><Pressable style={styles.smallButton} disabled={saving===i.id} onPress={()=>void setStock(i)}><Text style={styles.smallText}>{saving===i.id?'SAVING':'SET STOCK'}</Text></Pressable></View></View>)}</View>}

function PromosAdmin(){
 const [list,setList]=useState<any[]>([]);
 const [products,setProducts]=useState<any[]>([]);
 const [collections,setCollections]=useState<any[]>([]);
 const [screen,setScreen]=useState<'list'|'editor'>('list');
 const [editing,setEditing]=useState<any|null>(null);
 const [code,setCode]=useState('');
 const [value,setValue]=useState('10');
 const [type,setType]=useState<'percent'|'fixed'>('percent');
 const [minOrder,setMinOrder]=useState('0');
 const [starts,setStarts]=useState('');
 const [ends,setEnds]=useState('');
 const [active,setActive]=useState(true);
 const [scope,setScope]=useState<'shop'|'product'|'collection'>('shop');
 const [targetIds,setTargetIds]=useState<string[]>([]);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);

 const load=async()=>{try{
   setLoading(true);
   const [promos,allProducts,allCollections]=await Promise.all([getAdminPromos(),getAdminProducts(),getAdminCollections()]);
   setList(promos);setProducts(allProducts);setCollections(allCollections);
 }catch(e:any){Alert.alert('Promos failed',e?.message||'Please try again.');}
 finally{setLoading(false);}};
 useEffect(()=>{void load();},[]);

 function openCreate(){
   setEditing(null);setCode('');setValue('10');setType('percent');setMinOrder('0');setStarts('');setEnds('');
   setActive(true);setScope('shop');setTargetIds([]);setScreen('editor');
 }
 function edit(c:any){
   const targetType=String(c.targetType||c.applyTo||c.scope||'shop').toLowerCase();
   const normalizedScope=targetType.includes('product')?'product':targetType.includes('collection')?'collection':'shop';
   const ids=c.targetIds||c.productIds||c.collectionIds||c.targets||[];
   setEditing(c);setCode(c.code||'');setValue(String(c.value??10));setType(c.type==='fixed'?'fixed':'percent');
   setMinOrder(String(c.minOrder??0));setStarts(c.startsAt||c.startDate||'');setEnds(c.endsAt||c.endDate||'');
   setActive(c.active!==false);setScope(normalizedScope as 'shop'|'product'|'collection');setTargetIds(Array.isArray(ids)?ids.map(String):[]);setScreen('editor');
 }
 function backToList(){setScreen('list');setEditing(null);}
 function toggleTarget(id:string){setTargetIds(current=>current.includes(id)?current.filter(x=>x!==id):[...current,id]);}
 async function save(){
   if(!code.trim())return Alert.alert('Code required');
   const n=Number(value),min=Number(minOrder);
   if(!Number.isFinite(n)||n<0)return Alert.alert('Invalid discount');
   if(!Number.isFinite(min)||min<0)return Alert.alert('Invalid minimum order');
   if(scope!=='shop'&&targetIds.length===0)return Alert.alert('Choose a target',`Select at least one ${scope}.`);
   try{
     setSaving(true);
     const payload={
       code:code.trim().toUpperCase(),type,value:n,active,minOrder:min,
       startsAt:starts.trim()||null,endsAt:ends.trim()||null,
       targetType:scope,applyTo:scope,
       targetIds:scope==='shop'?[]:targetIds,
       productIds:scope==='product'?targetIds:[],
       collectionIds:scope==='collection'?targetIds:[]
     };
     if(editing)await updateAdminPromo(editing.code,payload);else await createAdminPromo(payload);
     await load();backToList();Alert.alert('Saved','Promotion saved successfully.');
   }catch(e:any){Alert.alert('Save failed',e?.message||'Please try again.');}
   finally{setSaving(false);}
 }
 async function toggle(c:any){try{await updateAdminPromo(c.code,{active:c.active===false});await load();}catch(e:any){Alert.alert('Update failed',e?.message||'Please try again.');}}
 async function remove(c:any){Alert.alert('Delete promotion?',c.code,[{text:'CANCEL',style:'cancel'},{text:'DELETE',style:'destructive',onPress:async()=>{try{await deleteAdminPromo(c.code);await load();}catch(e:any){Alert.alert('Delete failed',e?.message||'Please try again.');}}}]);}

 if(loading)return <View style={styles.center}><ActivityIndicator color="#fff"/><Text style={styles.muted}>LOADING PROMOTIONS…</Text></View>;
 if(screen==='editor')return <View>
   <View style={styles.editorHeader}><Pressable onPress={backToList}><Text style={styles.back}>←</Text></Pressable><Text style={styles.editorPageTitle}>{editing?'EDIT PROMOTION':'CREATE PROMOTION'}</Text><View style={styles.headerSpacer}/></View>
   <View style={styles.editor}>
    <Text style={styles.editorTitle}>{editing?'EDIT PROMOTION':'NEW PROMOTION'}</Text>
    <TextInput style={styles.input} value={code} onChangeText={setCode} placeholder="PROMO CODE" placeholderTextColor="#555" autoCapitalize="characters"/>
    <Text style={styles.label}>DISCOUNT TYPE</Text>
    <View style={styles.statusRow}><Pressable style={[styles.smallButton,type==='percent'&&styles.smallActive]} onPress={()=>setType('percent')}><Text style={[styles.smallText,type==='percent'&&styles.smallTextActive]}>PERCENT %</Text></Pressable><Pressable style={[styles.smallButton,type==='fixed'&&styles.smallActive]} onPress={()=>setType('fixed')}><Text style={[styles.smallText,type==='fixed'&&styles.smallTextActive]}>FIXED ₦</Text></Pressable></View>
    <TextInput style={styles.input} value={value} onChangeText={setValue} placeholder="DISCOUNT" placeholderTextColor="#555" keyboardType="numeric"/>
    <TextInput style={styles.input} value={minOrder} onChangeText={setMinOrder} placeholder="MIN ORDER (NGN)" placeholderTextColor="#555" keyboardType="numeric"/>
    <Text style={styles.label}>PROMOTION APPLIES TO</Text>
    <View style={styles.statusRow}>
      {([['shop','WHOLE SHOP'],['product','SPECIFIC PRODUCTS'],['collection','SPECIFIC COLLECTIONS']] as const).map(([key,label])=><Pressable key={key} style={[styles.smallButton,scope===key&&styles.smallActive]} onPress={()=>{setScope(key);if(key==='shop')setTargetIds([]);}}><Text style={[styles.smallText,scope===key&&styles.smallTextActive]}>{label}</Text></Pressable>)}
    </View>
    {scope==='product'?<View style={styles.productPicker}>{products.map((item:any)=><Pressable key={item.id} style={[styles.pickRow,targetIds.includes(String(item.id))&&styles.pickSelected]} onPress={()=>toggleTarget(String(item.id))}><Text style={[styles.pickName,targetIds.includes(String(item.id))&&styles.pickNameSelected]}>{item.name||item.id}</Text><Text style={[styles.pickMark,targetIds.includes(String(item.id))&&styles.pickMarkSelected]}>{targetIds.includes(String(item.id))?'✓':''}</Text></Pressable>)}</View>:null}
    {scope==='collection'?<View style={styles.productPicker}>{collections.map((item:any)=><Pressable key={item.id} style={[styles.pickRow,targetIds.includes(String(item.id))&&styles.pickSelected]} onPress={()=>toggleTarget(String(item.id))}><Text style={[styles.pickName,targetIds.includes(String(item.id))&&styles.pickNameSelected]}>{item.name||item.id}</Text><Text style={[styles.pickMark,targetIds.includes(String(item.id))&&styles.pickMarkSelected]}>{targetIds.includes(String(item.id))?'✓':''}</Text></Pressable>)}</View>:null}
    <TextInput style={styles.input} value={starts} onChangeText={setStarts} placeholder="START DATE / ISO (OPTIONAL)" placeholderTextColor="#555"/>
    <TextInput style={styles.input} value={ends} onChangeText={setEnds} placeholder="END DATE / ISO (OPTIONAL)" placeholderTextColor="#555"/>
    <Pressable style={[styles.smallButton,active&&styles.smallActive]} onPress={()=>setActive(v=>!v)}><Text style={[styles.smallText,active&&styles.smallTextActive]}>{active?'ENABLED ✓':'DISABLED'}</Text></Pressable>
    <Pressable style={styles.collectionSave} onPress={()=>void save()} disabled={saving}>{saving?<ActivityIndicator color="#000"/>:<Text style={styles.collectionSaveText}>{editing?'SAVE PROMOTION':'CREATE PROMOTION'}</Text>}</Pressable>
    <Pressable style={styles.cancel} onPress={backToList}><Text style={styles.cancelText}>BACK TO PROMOTIONS</Text></Pressable>
    {editing?<Pressable style={styles.delete} onPress={()=>void remove(editing)}><Text style={styles.deleteText}>DELETE PROMOTION</Text></Pressable>:null}
   </View>
  </View>;

 return <View>
  <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>PROMOTIONS</Text><Text style={styles.muted}>{list.length} PROMOTION{list.length===1?'':'S'}</Text></View><View style={styles.statusRow}><Pressable style={styles.collectionCreateButton} onPress={openCreate}><Text style={styles.collectionCreateText}>+ CREATE</Text></Pressable><Pressable onPress={()=>void load()}><Text style={styles.add}>REFRESH</Text></Pressable></View></View>
  {list.length===0?<Text style={styles.muted}>No promotions.</Text>:list.map(c=>{
    const targetType=String(c.targetType||c.applyTo||c.scope||'shop').toLowerCase();
    const targetLabel=targetType.includes('product')?'PRODUCTS':targetType.includes('collection')?'COLLECTIONS':'WHOLE SHOP';
    return <View key={c.code} style={styles.card}>
      <Pressable onPress={()=>edit(c)}><View style={styles.sectionHeader}><View style={styles.flex}><Text style={styles.rowTitle}>{c.code}</Text><Text style={styles.rowMeta}>{c.type} · {c.value}{c.type==='percent'?'%':' NGN'} · {targetLabel}</Text><Text style={styles.rowMeta}>{c.minOrder?'MIN ₦'+Number(c.minOrder).toLocaleString('en-NG')+' · ':''}{c.active?'ACTIVE':'INACTIVE'}{c.startsAt||c.startDate?' · STARTS '+(c.startsAt||c.startDate):''}{c.endsAt||c.endDate?' · ENDS '+(c.endsAt||c.endDate):''}</Text></View><Text style={styles.collectionChevron}>›</Text></View></Pressable>
      <View style={styles.statusRow}><Pressable style={[styles.smallButton,c.active&&styles.smallActive]} onPress={()=>void toggle(c)}><Text style={[styles.smallText,c.active&&styles.smallTextActive]}>{c.active?'ENABLED ✓':'DISABLED'}</Text></Pressable><Pressable onPress={()=>edit(c)}><Text style={styles.edit}>EDIT</Text></Pressable><Pressable onPress={()=>void remove(c)}><Text style={styles.remove}>DELETE</Text></Pressable></View>
    </View>;
  })}
 </View>;
}

function RestockAdmin(){
 const [list,setList]=useState<any[]>([]);const [products,setProducts]=useState<any[]>([]);const [query,setQuery]=useState('');const [loading,setLoading]=useState(true);
 const load=async()=>{try{setLoading(true);const [subs,allProducts]=await Promise.all([getAdminRestockSubscriptions(),(async()=>{const {getAdminProducts}=await import('../services/admin');return getAdminProducts();})()]);setList(subs);setProducts(allProducts);}catch(e:any){Alert.alert('Restock failed',e?.message||'Please try again.');}finally{setLoading(false);}};useEffect(()=>{void load();},[]);
 const filtered=list.filter(i=>{const p=products.find(x=>String(x.id)===String(i.productId));const text=[i.productId,i.email,i.userId,p?.name].join(' ').toLowerCase();return !query.trim()||text.includes(query.toLowerCase());});
 if(loading)return <ActivityIndicator color="#fff"/>;return <View><View style={styles.sectionHeader}><Text style={styles.sectionTitle}>RESTOCK REQUESTS · {list.length}</Text><Pressable onPress={()=>void load()}><Text style={styles.add}>REFRESH</Text></Pressable></View><TextInput style={styles.input} value={query} onChangeText={setQuery} placeholder="SEARCH PRODUCT / EMAIL / USER" placeholderTextColor="#555" autoCapitalize="none"/>{filtered.length===0?<Text style={styles.muted}>No restock requests.</Text>:filtered.map((i,index)=>{const p=products.find(x=>String(x.id)===String(i.productId));return <View key={i.id||index} style={styles.row}><Text style={styles.rowTitle}>{p?.name||i.productId||i.id}</Text><Text style={styles.rowMeta}>{i.email||i.userEmail||i.userId||'Customer'} · {i.createdAt||i.created_at||'—'}</Text><Text style={styles.rowMeta}>{i.size||i.variant||'Any size'}{i.color||i.colour?' · '+(i.color||i.colour):''}</Text></View>})}</View>}

function NotificationsOrSupport({mode}:{mode:'support'|'notifications'}){
 const [list,setList]=useState<any[]>([]);const [loading,setLoading]=useState(true);const [reply,setReply]=useState<Record<string,string>>({});
 const [editing,setEditing]=useState<any|null>(null);const [title,setTitle]=useState('');const [message,setMessage]=useState('');const [type,setType]=useState('important');const [target,setTarget]=useState('ALL');const [deepLink,setDeepLink]=useState('');const [published,setPublished]=useState(true);const [saving,setSaving]=useState(false);
 const load=async()=>{try{setLoading(true);setList(await (mode==='support'?getAdminSupport():getAdminNotifications()));}catch(e:any){Alert.alert('Load failed',e?.message||'');}finally{setLoading(false);}};
 useEffect(()=>{void load();},[mode]);
 function reset(){setEditing(null);setTitle('');setMessage('');setType('important');setTarget('ALL');setDeepLink('');setPublished(true);}
 function edit(n:any){setEditing(n);setTitle(n.title||'');setMessage(n.message||'');setType(n.type||'important');setTarget(n.targetAudience||n.target||'ALL');setDeepLink(n.deepLink||n.link||'');setPublished(n.published!==false);}
 async function send(t:any){if(!reply[t.id]?.trim())return;try{await replyToSupportTicket(t.id,reply[t.id].trim());setReply(r=>({...r,[t.id]:''}));await load();Alert.alert('Sent','Reply sent.');}catch(e:any){Alert.alert('Reply failed',e?.message||'');}}
 async function close(t:any){try{await updateSupportStatus(t.id,'CLOSED');await load();}catch(e:any){Alert.alert('Status update failed',e?.message||'');}}
 async function read(n:any){try{await markAdminNotificationRead(n.id);await load();}catch(e:any){Alert.alert('Read update failed',e?.message||'');}}
 async function saveNotification(){if(!title.trim()||!message.trim())return Alert.alert('Title and message are required.');try{setSaving(true);const payload={title:title.trim(),message:message.trim(),type,targetAudience:target.trim()||'ALL',deepLink:deepLink.trim()||undefined,published};if(editing)await updateAdminNotification(editing.id,payload);else await createAdminNotification(payload);reset();await load();Alert.alert('Saved','Notification saved.');}catch(e:any){Alert.alert('Save failed',e?.message||'');}finally{setSaving(false);}}
 async function removeNotification(n:any){Alert.alert('Delete notification?',n.title||'Notification',[{text:'CANCEL',style:'cancel'},{text:'DELETE',style:'destructive',onPress:async()=>{try{await deleteAdminNotification(n.id);await load();}catch(e:any){Alert.alert('Delete failed',e?.message||'');}}}]);}
 if(loading)return <ActivityIndicator color="#fff"/>;
 if(mode==='support')return <View><View style={styles.sectionHeader}><Text style={styles.sectionTitle}>SUPPORT · {list.length}</Text><Pressable onPress={()=>void load()}><Text style={styles.add}>REFRESH</Text></Pressable></View>{list.length===0?<Text style={styles.muted}>Nothing here.</Text>:list.map(item=><View key={item.id} style={styles.card}><Text style={styles.rowTitle}>{item.subject||'SUPPORT TICKET'}</Text><Text style={styles.rowMeta}>{item.email||item.userEmail||item.userId||'Customer'} · {item.status||'OPEN'}</Text>{item.orderId||item.orderNumber?<Text style={styles.rowMeta}>Order: {item.orderNumber||item.orderId}</Text>:null}<Text style={styles.supportMessage}>{item.message||item.body||''}</Text>{Array.isArray(item.messages)&&item.messages.map((r:any,i:number)=><View key={i} style={styles.chatBubble}><Text style={styles.chatFrom}>{r.from||r.sender||'SUPPORT'}</Text><Text style={styles.reply}>{r.message||r.text||''}</Text></View>)}{Array.isArray(item.replies)&&item.replies.map((r:any,i:number)=><View key={'r'+i} style={styles.chatBubble}><Text style={styles.chatFrom}>{r.from||'SUPPORT'}</Text><Text style={styles.reply}>{r.message||''}</Text></View>)}<TextInput style={styles.input} value={reply[item.id]||''} onChangeText={v=>setReply(r=>({...r,[item.id]:v}))} placeholder="Reply to customer" placeholderTextColor="#555" multiline/><View style={styles.statusRow}><Pressable style={styles.smallButton} onPress={()=>void send(item)}><Text style={styles.smallText}>REPLY</Text></Pressable><Pressable style={styles.smallButton} onPress={()=>void close(item)}><Text style={styles.smallText}>CLOSE</Text></Pressable></View></View>)}</View>;
 return <View><View style={styles.sectionHeader}><Text style={styles.sectionTitle}>NOTIFICATIONS · {list.length}</Text><View style={styles.statusRow}><Pressable onPress={reset}><Text style={styles.add}>+ NEW</Text></Pressable><Pressable onPress={()=>void load()}><Text style={styles.add}>REFRESH</Text></Pressable></View></View><View style={styles.editor}><TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Notification title" placeholderTextColor="#555"/><TextInput style={[styles.input,styles.multiline]} value={message} onChangeText={setMessage} placeholder="Notification message" placeholderTextColor="#555" multiline/><TextInput style={styles.input} value={type} onChangeText={setType} placeholder="Type: drop / collection / promotion / restock / order / support" placeholderTextColor="#555"/><TextInput style={styles.input} value={target} onChangeText={setTarget} placeholder="Target audience" placeholderTextColor="#555"/><TextInput style={styles.input} value={deepLink} onChangeText={setDeepLink} placeholder="Deep link (optional)" placeholderTextColor="#555" autoCapitalize="none"/><Pressable style={[styles.smallButton,published&&styles.smallActive]} onPress={()=>setPublished(v=>!v)}><Text style={styles.smallText}>{published?'PUBLISHED ✓':'DRAFT'}</Text></Pressable><Pressable style={styles.white} onPress={()=>void saveNotification()} disabled={saving}>{saving?<ActivityIndicator color="#000"/>:<Text style={styles.black}>{editing?'SAVE NOTIFICATION':'PUBLISH NOTIFICATION'}</Text>}</Pressable><Pressable style={styles.cancel} onPress={reset}><Text style={styles.cancelText}>RESET</Text></Pressable></View>{list.length===0?<Text style={styles.muted}>No notifications.</Text>:list.map(item=><View key={item.id} style={[styles.card,!item.read&&styles.unread]}><Text style={styles.rowTitle}>{item.title||'NOTIFICATION'}</Text><Text style={styles.rowMeta}>{item.message||''}</Text><Text style={styles.rowMeta}>{item.type||'important'} · {item.targetAudience||item.target||'ALL'} · {item.published===false?'DRAFT':'PUBLISHED'}</Text><Text style={styles.rowMeta}>{item.deepLink||item.link||''}</Text><View style={styles.statusRow}><Pressable onPress={()=>edit(item)}><Text style={styles.edit}>EDIT</Text></Pressable><Pressable onPress={()=>void removeNotification(item)}><Text style={styles.remove}>DELETE</Text></Pressable><Pressable onPress={()=>void read(item)}><Text style={styles.edit}>{item.read?'READ':'MARK READ'}</Text></Pressable></View></View>)}</View>
}

const styles=StyleSheet.create({container:{flex:1,backgroundColor:'#000'},content:{padding:16,paddingBottom:80},center:{flex:1,backgroundColor:'#000',alignItems:'center',justifyContent:'center',padding:25,gap:12},denied:{color:'#fff',fontSize:18,fontWeight:'900'},header:{height:58,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},back:{color:'#fff',fontSize:10,fontWeight:'900'},title:{color:'#fff',fontSize:18,fontWeight:'900',letterSpacing:1},tabs:{gap:7,paddingBottom:16},tab:{borderWidth:1,borderColor:'#333',paddingHorizontal:10,paddingVertical:9},tabActive:{backgroundColor:'#fff',borderColor:'#fff'},tabText:{color:'#888',fontSize:8,fontWeight:'900'},tabTextActive:{color:'#000'},big:{color:'#fff',fontSize:30,fontWeight:'900',letterSpacing:1,marginTop:15},muted:{color:'#666',fontSize:11,lineHeight:18},stockNumber:{color:'#fff',fontSize:24,fontWeight:'900'},lowStock:{color:'#f55'},stockInput:{flex:1,minWidth:70,marginBottom:0},tiles:{flexDirection:'row',flexWrap:'wrap',gap:10,marginTop:25},tile:{width:'47%',minHeight:100,borderWidth:1,borderColor:'#292929',padding:14,justifyContent:'space-between'},tileTitle:{color:'#fff',fontSize:11,fontWeight:'900',letterSpacing:1},arrow:{color:'#fff',fontSize:20},sectionHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},sectionTitle:{color:'#fff',fontSize:14,fontWeight:'900',letterSpacing:1,marginTop:10,marginBottom:15},add:{color:'#fff',fontSize:10,fontWeight:'900'},editor:{borderWidth:1,borderColor:'#292929',padding:14,marginBottom:18},input:{backgroundColor:'#151515',borderWidth:1,borderColor:'#333',color:'#fff',padding:13,marginBottom:10},multiline:{minHeight:85,textAlignVertical:'top'},outline:{borderWidth:1,borderColor:'#fff',paddingVertical:14,alignItems:'center',marginBottom:10},outlineText:{color:'#fff',fontSize:10,fontWeight:'900'},white:{backgroundColor:'#fff',paddingVertical:16,alignItems:'center',marginTop:4},black:{color:'#000',fontSize:10,fontWeight:'900'},editorHeader:{height:48,flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:6},editorPageTitle:{color:'#fff',fontSize:12,fontWeight:'900',letterSpacing:1},headerSpacer:{width:80},collectionCreateButton:{backgroundColor:'#fff',paddingHorizontal:12,paddingVertical:11,borderRadius:8},collectionCreateText:{color:'#000',fontSize:9,fontWeight:'900',letterSpacing:.5},editorTitle:{color:'#fff',fontSize:14,fontWeight:'900',letterSpacing:1,marginBottom:14},delete:{borderWidth:1,borderColor:'#7a2222',paddingVertical:14,alignItems:'center',marginTop:12,borderRadius:8},deleteText:{color:'#d66',fontSize:9,fontWeight:'900',letterSpacing:1},collectionList:{marginTop:4},collectionCard:{flexDirection:'row',alignItems:'center',borderTopWidth:1,borderTopColor:'#222',paddingVertical:13,gap:12},collectionThumbWrap:{width:64,height:64,backgroundColor:'#151515'},collectionThumbLarge:{width:'100%',height:'100%'},collectionInfo:{flex:1},collectionChevron:{color:'#fff',fontSize:25,fontWeight:'300'},pickNameSelected:{color:'#000'},pickMarkSelected:{color:'#000'},collectionSave:{backgroundColor:'#fff',paddingVertical:17,alignItems:'center',marginTop:15,borderRadius:8},collectionSaveText:{color:'#000',fontSize:10,fontWeight:'900',letterSpacing:1},openOrder:{color:'#fff',fontSize:9,fontWeight:'900',marginTop:10},collectionPreview:{width:'100%',height:220,marginBottom:12},label:{color:'#888',fontSize:9,fontWeight:'900',letterSpacing:1,marginTop:8,marginBottom:8},productPicker:{maxHeight:260,borderWidth:1,borderColor:'#222'},pickRow:{padding:10,borderBottomWidth:1,borderBottomColor:'#222',flexDirection:'row',justifyContent:'space-between'},pickSelected:{backgroundColor:'#fff'},pickName:{color:'#fff',fontSize:10},pickMark:{color:'#fff',fontWeight:'900'},collectionRow:{flexDirection:'row',alignItems:'center',gap:9,borderTopWidth:1,borderTopColor:'#222',paddingVertical:10},collectionThumb:{width:58,height:58,backgroundColor:'#151515'},flex:{flex:1},row:{borderTopWidth:1,borderTopColor:'#222',paddingVertical:13},rowTitle:{color:'#fff',fontSize:12,fontWeight:'900'},rowMeta:{color:'#777',fontSize:10,lineHeight:16,marginTop:4},edit:{color:'#fff',fontSize:8,fontWeight:'900'},remove:{color:'#a66',fontSize:8,fontWeight:'900'},cancel:{borderWidth:1,borderColor:'#333',paddingVertical:14,alignItems:'center',marginTop:8},cancelText:{color:'#777',fontSize:10,fontWeight:'900'},card:{borderWidth:1,borderColor:'#292929',padding:14,marginBottom:10},statusRow:{flexDirection:'row',gap:6,flexWrap:'wrap',marginTop:10},smallButton:{borderWidth:1,borderColor:'#444',paddingHorizontal:10,paddingVertical:8},smallActive:{backgroundColor:'#fff'},smallText:{color:'#fff',fontSize:8,fontWeight:'900'},smallTextActive:{color:'#000'},statusBadge:{color:'#fff',fontSize:8,fontWeight:'900',borderWidth:1,borderColor:'#555',paddingHorizontal:7,paddingVertical:5},detail:{color:'#bbb',fontSize:11,lineHeight:17,marginBottom:3},itemRow:{flexDirection:'row',justifyContent:'space-between',borderTopWidth:1,borderTopColor:'#222',paddingVertical:8},supportMessage:{color:'#aaa',fontSize:12,lineHeight:18,marginTop:10},reply:{color:'#777',fontSize:11,lineHeight:17,marginTop:7},unread:{borderColor:'#fff'},chatBubble:{backgroundColor:'#111',borderWidth:1,borderColor:'#222',padding:10,marginTop:8,borderRadius:10},total:{color:'#fff',fontSize:24,fontWeight:'900'},chatFrom:{color:'#fff',fontSize:8,fontWeight:'900',marginBottom:3}}
);
