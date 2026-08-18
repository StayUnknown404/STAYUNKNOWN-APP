import { Product } from './api';

export type CartItem = {
  product: Product;
  size: string;
  color: string;
  quantity: number;
};

let cart: CartItem[] = [];
let wishlist: Product[] = [];

export function getCart(): CartItem[] {
  return cart;
}

export function addToCart(
  product: Product,
  size: string,
  color: string,
  quantity = 1
) {
  const existing = cart.find(
    item =>
      item.product.id === product.id &&
      item.size === size &&
      item.color === color
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      product,
      size,
      color,
      quantity,
    });
  }

  return cart;
}

export function updateCartQuantity(
  productId: string,
  size: string,
  color: string,
  quantity: number
) {
  const item = cart.find(
    item =>
      item.product.id === productId &&
      item.size === size &&
      item.color === color
  );

  if (!item) return cart;

  if (quantity <= 0) {
    cart = cart.filter(
      cartItem =>
        !(
          cartItem.product.id === productId &&
          cartItem.size === size &&
          cartItem.color === color
        )
    );
  } else {
    item.quantity = quantity;
  }

  return cart;
}

export function removeFromCart(
  productId: string,
  size: string,
  color: string
) {
  cart = cart.filter(
    item =>
      !(
        item.product.id === productId &&
        item.size === size &&
        item.color === color
      )
  );

  return cart;
}

export function clearCart() {
  cart = [];
}

export function getCartTotal() {
  return cart.reduce(
    (total, item) =>
      total + item.product.price * item.quantity,
    0
  );
}

export function getCartCount() {
  return cart.reduce(
    (total, item) => total + item.quantity,
    0
  );
}

export function getWishlist(): Product[] {
  return wishlist;
}

export function isWishlisted(productId: string) {
  return wishlist.some(product => product.id === productId);
}

export function toggleWishlist(product: Product) {
  if (isWishlisted(product.id)) {
    wishlist = wishlist.filter(
      item => item.id !== product.id
    );
  } else {
    wishlist.push(product);
  }

  return wishlist;
}
