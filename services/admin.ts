import { auth } from './firebase';
import { Product } from './api';

const BACKEND_URL = 'https://stayunknown404-backend.onrender.com';

async function adminRequest<T = any>(path: string, options: RequestInit = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error('Please sign in first.');
  const token = await user.getIdToken();
  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || 'Admin request failed.');
  return data as T;
}

export type AdminRole = 'OWNER' | 'PRODUCT_MANAGER' | 'ORDER_MANAGER' | 'CUSTOMER_SUPPORT' | 'MARKETING';

export type AdminSession = {
  ok: boolean;
  isAdmin: boolean;
  email: string;
  role?: AdminRole;
  permissions?: string[];
};

export const ADMIN_PERMISSIONS: Record<AdminRole, string[]> = {
  OWNER: ['products','inventory','collections','orders','restock','promos','support','notifications'],
  PRODUCT_MANAGER: ['products','inventory','collections'],
  ORDER_MANAGER: ['orders','restock'],
  CUSTOMER_SUPPORT: ['support','orders'],
  MARKETING: ['promos','collections','notifications'],
};

export async function checkAdmin(): Promise<AdminSession> {
  const data = await adminRequest<AdminSession>('/api/admin/me');
  if (!data.role) {
    const tokenResult = await auth.currentUser?.getIdTokenResult();
    const claimRole = tokenResult?.claims?.role || tokenResult?.claims?.adminRole;
    if (typeof claimRole === 'string' && Object.prototype.hasOwnProperty.call(ADMIN_PERMISSIONS, claimRole)) {
      data.role = claimRole as AdminRole;
    }
  }
  if (!data.role && data.isAdmin) data.role = 'OWNER';
  return data;
}

export function hasAdminPermission(role: AdminRole | undefined, area: string) {
  return !!role && ADMIN_PERMISSIONS[role]?.includes(area);
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

export async function getAdminProducts() {
  const data = await adminRequest<{ products?: Product[] }>('/api/admin/products');
  return Array.isArray(data.products) ? data.products : [];
}

export async function createAdminProduct(product: AdminProductInput) {
  return adminRequest('/api/admin/products', { method: 'POST', body: JSON.stringify(product) });
}

export async function updateAdminProduct(productId: string, product: Partial<AdminProductInput>) {
  return adminRequest(`/api/admin/products/${encodeURIComponent(productId)}`, { method: 'PATCH', body: JSON.stringify(product) });
}

export async function deleteAdminProduct(productId: string) {
  return adminRequest(`/api/admin/products/${encodeURIComponent(productId)}`, { method: 'DELETE' });
}

export async function getAdminInventory() {
  const data = await adminRequest<{ inventory?: any[]; items?: any[] }>('/api/admin/inventory');
  return Array.isArray(data.inventory) ? data.inventory : Array.isArray(data.items) ? data.items : [];
}

export async function getAdminCollections() {
  const data = await adminRequest<{ collections?: any[] }>('/api/admin/collections');
  return Array.isArray(data.collections) ? data.collections : [];
}

export async function createAdminCollection(payload: { name: string; image?: string; description?: string; order?: number; limited?: boolean; productIds?: string[] }) {
  return adminRequest('/api/admin/collections', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateAdminCollection(id: string, payload: Partial<{ name: string; image: string; description: string; order: number; limited: boolean; hidden: boolean; productIds: string[] }>) {
  return adminRequest(`/api/admin/collections/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteAdminCollection(id: string) {
  return adminRequest(`/api/admin/collections/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function getAdminOrders() {
  const data = await adminRequest<{ orders?: any[] }>('/api/admin/orders');
  return Array.isArray(data.orders) ? data.orders : [];
}

export async function updateOrderDelivery(orderId: string, payload: any) {
  return adminRequest(`/api/admin/orders/${encodeURIComponent(orderId)}/delivery`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function getAdminPromos() {
  const data = await adminRequest<{ promos?: any[] }>('/api/admin/promos');
  return Array.isArray(data.promos) ? data.promos : [];
}

export async function createAdminPromo(payload: any) {
  return adminRequest('/api/admin/promos', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateAdminPromo(code: string, payload: any) {
  return adminRequest(`/api/admin/promos/${encodeURIComponent(code)}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteAdminPromo(code: string) {
  return adminRequest(`/api/admin/promos/${encodeURIComponent(code)}`, { method: 'DELETE' });
}

export async function getAdminRestockSubscriptions() {
  const data = await adminRequest<{ subscriptions?: any[]; subscribers?: any[] }>('/api/admin/restock-subscriptions');
  return Array.isArray(data.subscriptions) ? data.subscriptions : Array.isArray(data.subscribers) ? data.subscribers : [];
}

export async function getAdminSupport() {
  const data = await adminRequest<{ tickets?: any[]; support?: any[] }>('/api/admin/support');
  return Array.isArray(data.tickets) ? data.tickets : Array.isArray(data.support) ? data.support : [];
}

export async function replyToSupportTicket(ticketId: string, message: string) {
  return adminRequest(`/api/admin/support/${encodeURIComponent(ticketId)}/reply`, { method: 'POST', body: JSON.stringify({ message }) });
}

export async function updateSupportStatus(ticketId: string, status: 'OPEN' | 'CLOSED') {
  return adminRequest(`/api/admin/support/${encodeURIComponent(ticketId)}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

export async function getAdminNotifications() {
  const data = await adminRequest<{ notifications?: any[] }>('/api/admin/notifications');
  return Array.isArray(data.notifications) ? data.notifications : [];
}

export async function markAdminNotificationRead(id: string) {
  return adminRequest(`/api/admin/notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH' });
}

export async function createAdminNotification(payload: any) {
  return adminRequest('/api/admin/notifications', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateAdminNotification(id: string, payload: any) {
  return adminRequest(`/api/admin/notifications/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteAdminNotification(id: string) {
  return adminRequest(`/api/admin/notifications/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
