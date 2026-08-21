import { auth } from './firebase';

export const BACKEND_URL = 'https://stayunknown404-backend.onrender.com';

export type Product = {
  id: string;
  name: string;
  category?: string;
  price: number;
  image?: string;
  image2?: string;
  images?: string[];
  description?: string;
  sizes: string[];
  colors: string[];
  comingSoon?: boolean;
  stock?: number;
  lowStockThreshold?: number;
  collection?: string;
  restockNotify?: boolean;
  drop?: boolean;
  hidden?: boolean;
  visibleInStore?: boolean;
  tags?: string;
};

export type Collection = {
  id: string;
  name: string;
  image?: string;
  description?: string;
  order?: number;
  limited?: boolean;
  hidden?: boolean;
  derived?: boolean;
  productCount?: number;
  productIds?: string[];
};

export type Order = Record<string, any> & { id: string };
export type Notification = Record<string, any> & { id: string };
export type SupportTicket = Record<string, any> & { id: string };

async function request<T>(path: string, options: RequestInit = {}, authRequired = false): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  if (authRequired) {
    const user = auth.currentUser;
    if (!user) throw new Error('Please sign in first.');
    const token = await user.getIdToken();
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BACKEND_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || `Request failed (${response.status}).`);
  return data as T;
}

export async function registerPushToken(token: string) {
  const cleanToken = String(token || '').trim();
  if (!cleanToken) throw new Error('Push token is empty.');

  return request<{ ok: boolean }>('/api/push-token', {
    method: 'POST',
    body: JSON.stringify({ token: cleanToken }),
  }, true);
}

export async function getCatalog() {
  const data = await request<{ products?: Product[] }>('/api/catalog');
  return Array.isArray(data.products) ? data.products : [];
}

export async function getCollections() {
  const data = await request<{ collections?: Collection[] }>('/api/collections');
  return Array.isArray(data.collections) ? data.collections : [];
}

export async function getOrderHistory() {
  const data = await request<{ orders?: Order[] }>('/api/orders', {}, true);
  return Array.isArray(data.orders) ? data.orders : [];
}

export async function getOrder(orderId: string) {
  const data = await request<{ order: Order }>(`/api/orders/${encodeURIComponent(orderId)}`, {}, true);
  return data.order;
}

export async function getProfile() {
  const data = await request<{ profile?: { phone: string; address: string } }>('/api/profile', {}, true);
  return data.profile || { phone: '', address: '' };
}

export async function saveProfile(profile: { phone: string; address: string }) {
  const data = await request<{ profile: { phone: string; address: string } }>('/api/profile', {
    method: 'PUT',
    body: JSON.stringify(profile),
  }, true);
  return data.profile;
}

export async function getRemoteWishlistIds() {
  const data = await request<{ wishlistIds?: string[] }>('/api/wishlist', {}, true);
  return Array.isArray(data.wishlistIds) ? data.wishlistIds : [];
}

export async function saveRemoteWishlistIds(wishlistIds: string[]) {
  const data = await request<{ wishlistIds?: string[] }>('/api/wishlist', {
    method: 'PUT',
    body: JSON.stringify({ wishlistIds }),
  }, true);
  return Array.isArray(data.wishlistIds) ? data.wishlistIds : [];
}

export async function getNotifications() {
  const data = await request<{ notifications?: Notification[] }>('/api/notifications', {}, true);
  return Array.isArray(data.notifications) ? data.notifications : [];
}

export async function markNotificationRead(notificationId: string) {
  return request(`/api/notifications/${encodeURIComponent(notificationId)}/read`, { method: 'PATCH' }, true);
}

export async function createSupportTicket(payload: { subject: string; message: string; orderNumber?: string }) {
  return request<{ ticket: SupportTicket }>('/api/support', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true);
}

export async function getSupportTickets() {
  const data = await request<{ tickets?: SupportTicket[] }>('/api/support', {}, true);
  return Array.isArray(data.tickets) ? data.tickets : [];
}

export async function replyToSupportTicket(ticketId: string, message: string) {
  return request<{ ticket: SupportTicket }>(`/api/support/${encodeURIComponent(ticketId)}/reply`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  }, true);
}

export async function subscribeRestock(productId: string, email: string) {
  return request('/api/restock-subscriptions', {
    method: 'POST',
    body: JSON.stringify({ productId, email }),
  });
}

export async function validatePromo(code: string, items: Array<{ id: string; price: number; quantity: number; collection?: string; category?: string }>) {
  return request<{ valid: boolean; discount: number; error?: string }>('/api/promo/validate', {
    method: 'POST',
    body: JSON.stringify({ code, items }),
  });
}

export type CheckoutPayload = {
  email: string;
  phone?: string;
  name: string;
  address: string;
  note?: string;
  items: Array<{ productId: string; quantity: number; size: string; color: string }>;
  promoCode?: string;
  userId?: string;
  callbackUrl?: string;
};

export async function initializePayment(payload: CheckoutPayload) {
  return request<{
    ok: boolean;
    reference: string;
    authorization_url: string;
    access_code?: string;
    amount: number;
    currency: string;
  }>('/api/paystack/initialize', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function verifyPayment(reference: string) {
  return request<{ paid: boolean; status: string; order?: Order; reference: string }>('/api/paystack/verify', {
    method: 'POST',
    body: JSON.stringify({ reference }),
  });
}
