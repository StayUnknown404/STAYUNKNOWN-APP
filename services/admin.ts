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

export async function checkAdmin() {
  return adminRequest('/api/admin/me');
}

export async function getAdminProducts(): Promise<Product[]> {
  const data = await adminRequest(
    '/api/admin/products'
  );

  return Array.isArray(data.products)
    ? data.products
    : [];
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
    `/api/admin/products/${encodeURIComponent(
      productId
    )}`,
    {
      method: 'PATCH',
      body: JSON.stringify(product),
    }
  );
}
