const BACKEND_URL = 'https://stayunknown404-backend.onrender.com';

export type Product = {
  id: string;
  name: string;
  category?: string;
  price: number;
  sizes: string[];
  colors: string[];
  comingSoon?: boolean;
  stock?: number;
  lowStockThreshold?: number;
  collection?: string;
  restockNotify?: boolean;
};

export async function getCatalog(): Promise<Product[]> {
  const response = await fetch(`${BACKEND_URL}/api/catalog`);

  if (!response.ok) {
    throw new Error('Unable to load STAYUNKNOWN catalog.');
  }

  const data = await response.json();

  return Array.isArray(data.products) ? data.products : [];
}
