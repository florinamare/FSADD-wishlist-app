import type { WishlistItem, NewWishlistItem } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  return res.json();
};

export const wishlistApi = {
  getItems: (): Promise<WishlistItem[]> =>
    fetch(`${BASE_URL}/items`).then(handleResponse),

  addItem: (item: NewWishlistItem): Promise<WishlistItem> =>
    fetch(`${BASE_URL}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    }).then(handleResponse),

  togglePurchased: (id: string, purchased: boolean): Promise<WishlistItem> =>
    fetch(`${BASE_URL}/items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ purchased }),
    }).then(handleResponse),

  toggleBreakdownItem: (
    id: string,
    key: string,
    purchased: boolean
  ): Promise<WishlistItem> =>
    fetch(`${BASE_URL}/items/${id}/breakdown/${key}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ purchased }),
    }).then(handleResponse),

  deleteItem: (id: string): Promise<void> =>
    fetch(`${BASE_URL}/items/${id}`, { method: 'DELETE' }).then(handleResponse),
};