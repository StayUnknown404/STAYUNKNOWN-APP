import { auth } from './firebase';
import { Product } from './api';

const BACKEND_URL =
  'https://stayunknown404-backend.onrender.com';

async function adminRequest(
  path: string,
  options: RequestInit = {}
) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('Please sign in first.');
  }

  const token = await user.getIdToken();

  const response = await fetch(
    `${BACKEND_URL}${path}`,
    {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.error || 'Admin request failed.'
    );
  }

  return data;
}

/* Admin identity check */
export async function checkAdmin() {
  return adminRequest('/api/admin/me');
}

/* PRODUCTS */
export async function getAdminProducts(): Promise<Product[]> {
  const data = await adminRequest('/api/admin/products');
  return Array.isArray(data.products) ? data.products : [];
}

export type AdminProductInput = {
  id?: string;
  name: string;
  category: string;
  price: number;
  image?: string;
  image2?: string;
  images?: string[];
  description?: string;
  collection?: string;
  stock?: number;
  lowStockThreshold?: number;
  sizes?: string[];
  colors?: string[];
  tags?: string;
  drop?: boolean;
  comingSoon?: boolean;
  hidden?: boolean;
};

export async function createAdminProduct(
  product: AdminProductInput
) {
  return adminRequest('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify(product),
  });
}

export async function updateAdminProduct(
  productId: string,
  product: Partial<AdminProductInput>
) {
  return adminRequest(
    `/api/admin/products/${encodeURIComponent(productId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(product),
    }
  );
}

/* INVENTORY */
export async function getAdminInventory(): Promise<any[]> {
  const data = await adminRequest('/api/admin/inventory');
  // backend may return inventory or items; normalize
  return Array.isArray(data.inventory)
    ? data.inventory
    : Array.isArray(data.items)
    ? data.items
    : [];
}

/* COLLECTIONS */
export async function getAdminCollections(): Promise<any[]> {
  const data = await adminRequest('/api/admin/collections');
  return Array.isArray(data.collections) ? data.collections : [];
}

export async function createAdminCollection(payload: { name: string; slug?: string }) {
  return adminRequest('/api/admin/collections', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAdminCollection(collectionId: string, payload: Partial<{ name: string; slug?: string }>) {
  return adminRequest(`/api/admin/collections/${encodeURIComponent(collectionId)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminCollection(collectionId: string) {
  return adminRequest(`/api/admin/collections/${encodeURIComponent(collectionId)}`, {
    method: 'DELETE',
  });
}

/* ORDERS */
export async function getAdminOrders(): Promise<any[]> {
  const data = await adminRequest('/api/admin/orders');
  return Array.isArray(data.orders) ? data.orders : [];
}

export async function updateOrderDelivery(orderId: string, payload: any) {
  return adminRequest(`/api/admin/orders/${encodeURIComponent(orderId)}/delivery`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

/* PROMOS */
export async function getAdminPromos(): Promise<any[]> {
  const data = await adminRequest('/api/admin/promos');
  return Array.isArray(data.promos) ? data.promos : [];
}

export async function createAdminPromo(payload: any) {
  return adminRequest('/api/admin/promos', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAdminPromo(code: string, payload: any) {
  return adminRequest(`/api/admin/promos/${encodeURIComponent(code)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminPromo(code: string) {
  return adminRequest(`/api/admin/promos/${encodeURIComponent(code)}`, {
    method: 'DELETE',
  });
}

/* RESTOCK SUBSCRIPTIONS */
export async function getAdminRestockSubscriptions(): Promise<any[]> {
  const data = await adminRequest('/api/admin/restock-subscriptions');
  // normalize
  return Array.isArray(data.subscriptions) ? data.subscriptions : data.subscribers || [];
}

/* SUPPORT */
export async function getAdminSupport(): Promise<any[]> {
  const data = await adminRequest('/api/admin/support');
  return Array.isArray(data.tickets) ? data.tickets : data.support || [];
}

export async function replyToSupportTicket(ticketId: string, message: string) {
  return adminRequest(`/api/admin/support/${encodeURIComponent(ticketId)}/reply`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

export async function updateSupportStatus(ticketId: string, status: 'OPEN' | 'CLOSED') {
  return adminRequest(`/api/admin/support/${encodeURIComponent(ticketId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

/* NOTIFICATIONS */
export async function getAdminNotifications(): Promise<any[]> {
  const data = await adminRequest('/api/admin/notifications');
  return Array.isArray(data.notifications) ? data.notifications : [];
}

export async function markNotificationRead(notificationId: string) {
  return adminRequest(`/api/admin/notifications/${encodeURIComponent(notificationId)}/read`, {
    method: 'PATCH',
  });
}
