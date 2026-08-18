import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from './api';

export type CartItem = {
  product: Product;
  size: string;
  color: string;
  quantity: number;
};

const CART_KEY = 'stayunknown_cart_v2';
const WISHLIST_KEY = 'stayunknown_wishlist_v2';

let cart: CartItem[] = [];
let wishlist: Product[] = [];

export async function hydrateStore() {
  try {
    const [savedCart, savedWishlist] = await Promise.all([
      AsyncStorage.getItem(CART_KEY),
      AsyncStorage.getItem(WISHLIST_KEY),
    ]);
    if (savedCart) cart = JSON.parse(savedCart);
    if (savedWishlist) wishlist = JSON.parse(savedWishlist);
  } catch (error) {
    console.warn('Store hydration failed:', error);
  }
}

async function persistCart() {
  try { await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch {}
}

async function persistWishlist() {
  try { await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist)); } catch {}
}

export function getCart() { return cart; }
export function getWishlist() { return wishlist; }

export function addToCart(product: Product, size: string, color: string, quantity = 1) {
  const existing = cart.find(i => i.product.id === product.id && i.size === size && i.color === color);
  if (existing) existing.quantity += quantity;
  else cart.push({ product, size, color, quantity });
  void persistCart();
  return cart;
}

export function updateCartQuantity(productId: string, size: string, color: string, quantity: number) {
  const item = cart.find(i => i.product.id === productId && i.size === size && i.color === color);
  if (!item) return cart;
  if (quantity <= 0) {
    cart = cart.filter(i => !(i.product.id === productId && i.size === size && i.color === color));
  } else {
    item.quantity = Math.min(quantity, 20);
  }
  void persistCart();
  return cart;
}

export function removeFromCart(productId: string, size: string, color: string) {
  cart = cart.filter(i => !(i.product.id === productId && i.size === size && i.color === color));
  void persistCart();
  return cart;
}

export function clearCart() {
  cart = [];
  void persistCart();
}

export function getCartTotal() {
  return cart.reduce((total, item) => total + Number(item.product.price || 0) * item.quantity, 0);
}

export function getCartCount() {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

export function isWishlisted(productId: string) {
  return wishlist.some(product => product.id === productId);
}

export function setWishlistProducts(products: Product[]) {
  wishlist = products;
  void persistWishlist();
  return wishlist;
}

export function toggleWishlist(product: Product) {
  if (isWishlisted(product.id)) wishlist = wishlist.filter(item => item.id !== product.id);
  else wishlist = [...wishlist, product];
  void persistWishlist();
  return wishlist;
}

export function replaceWishlistFromCatalog(ids: string[], products: Product[]) {
  const set = new Set(ids);
  wishlist = products.filter(product => set.has(product.id));
  void persistWishlist();
  return wishlist;
}
