import type { WishlistItem, NewWishlistItem, BudgetAdjustment, AdjustType, Notification, Wishlist, StatsData } from '../types';

export interface BudgetState {
  amount: number;
  history: BudgetAdjustment[];
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

import { getToken } from '../hooks/useAuth';

const authHeaders = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const text = await res.text();
    let message = `HTTP ${res.status}`;
    if (text) {
      try {
        const json = JSON.parse(text);
        message = json.error || text;
      } catch {
        message = text;
      }
    }
    throw new Error(message);
  }
  return res.json();
};

export interface PaginatedItems {
  items: WishlistItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const wishlistApi = {
  getItems: (page = 1, limit = 10, wishlistId?: string): Promise<PaginatedItems> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (wishlistId) params.set('wishlistId', wishlistId);
    return fetch(`${BASE_URL}/items?${params}`, { headers: authHeaders() }).then(handleResponse);
  },

  addItem: (item: NewWishlistItem & { wishlistId?: string }): Promise<WishlistItem> =>
    fetch(`${BASE_URL}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(item),
    }).then(handleResponse),

  togglePurchased: (id: string, purchased: boolean): Promise<WishlistItem> =>
    fetch(`${BASE_URL}/items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ purchased }),
    }).then(handleResponse),

  toggleBreakdownItem: (
    id: string,
    key: string,
    purchased: boolean
  ): Promise<WishlistItem> =>
    fetch(`${BASE_URL}/items/${id}/breakdown/${key}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ purchased }),
    }).then(handleResponse),

  deleteItem: (id: string): Promise<void> =>
    fetch(`${BASE_URL}/items/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then(handleResponse),

  getBudget: (): Promise<BudgetState> =>
    fetch(`${BASE_URL}/budget`, { headers: authHeaders() }).then(handleResponse),

  adjustBudget: (type: AdjustType, amount: number, note?: string): Promise<BudgetState> =>
    fetch(`${BASE_URL}/budget`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ type, amount, note }),
    }).then(handleResponse),

  uploadImage: (id: string, file: File): Promise<WishlistItem> => {
    const form = new FormData();
    form.append('image', file);
    return fetch(`${BASE_URL}/items/${id}/image`, {
      method: 'POST',
      headers: authHeaders(),
      body: form,
    }).then(handleResponse);
  },
};

export interface Friend {
  visitorId: string;
  visitorName: string;
  visitedAt: string;
  hasNewItems: boolean;
  shareToken: string | null;
}

export const friendsApi = {
  getFriends: (): Promise<Friend[]> =>
    fetch(`${BASE_URL}/friends`, { headers: authHeaders() }).then(handleResponse),

  addFriend: (shareToken: string): Promise<void> =>
    fetch(`${BASE_URL}/friends`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ shareToken }),
    }).then(handleResponse),
};

export interface UserSearchResult {
  username: string;
  shareToken: string;
}

export const usersApi = {
  search: (q: string): Promise<UserSearchResult[]> =>
    fetch(`${BASE_URL}/users/search?q=${encodeURIComponent(q)}`, { headers: authHeaders() }).then(handleResponse),
};

export interface PaginatedNotifications {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const notificationsApi = {
  getAll: (page = 1, limit = 20): Promise<PaginatedNotifications> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    return fetch(`${BASE_URL}/notifications?${params}`, { headers: authHeaders() }).then(handleResponse);
  },

  markAllRead: (): Promise<void> =>
    fetch(`${BASE_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: authHeaders(),
    }).then(handleResponse),
};

export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  shareToken: string;
  createdAt: string;
}

export const profileApi = {
  get: (): Promise<UserProfile> =>
    fetch(`${BASE_URL}/profile`, { headers: authHeaders() }).then(handleResponse),

  updatePassword: (oldPassword: string, newPassword: string): Promise<{ message: string }> =>
    fetch(`${BASE_URL}/profile/password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ oldPassword, newPassword }),
    }).then(handleResponse),
};

export interface SharedWishlist {
  username: string;
  items: WishlistItem[];
}

export const sharedApi = {
  // visitorToken = shareToken-ul vizitatorului (pentru notificări de tip visited)
  getWishlist: async (shareToken: string, visitorToken?: string): Promise<SharedWishlist> => {
    const url = visitorToken
      ? `${BASE_URL}/shared/${shareToken}?visitorToken=${encodeURIComponent(visitorToken)}`
      : `${BASE_URL}/shared/${shareToken}`;
    return fetch(url).then(handleResponse);
  },

  updateItem: (
    shareToken: string,
    itemId: string,
    purchased: boolean,
    boughtBy?: string
  ): Promise<WishlistItem> =>
    fetch(`${BASE_URL}/shared/${shareToken}/items/${itemId}`, {
      method: 'PATCH',
      // Auth headers opționale: dacă e logat, backend-ul îi scade din buget
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ purchased, boughtBy }),
    }).then(handleResponse),

  updateBreakdownItem: (
    shareToken: string,
    itemId: string,
    key: string,
    purchased: boolean,
    boughtBy?: string
  ): Promise<WishlistItem> =>
    fetch(`${BASE_URL}/shared/${shareToken}/items/${itemId}/breakdown/${key}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ purchased, boughtBy }),
    }).then(handleResponse),
};

export const wishlistsApi = {
  getAll: (): Promise<Wishlist[]> =>
    fetch(`${BASE_URL}/wishlists`, { headers: authHeaders() }).then(handleResponse),

  create: (name: string, description?: string): Promise<Wishlist> =>
    fetch(`${BASE_URL}/wishlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ name, description }),
    }).then(handleResponse),

  delete: (id: string): Promise<void> =>
    fetch(`${BASE_URL}/wishlists/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then(handleResponse),
};

export const statsApi = {
  get: (): Promise<StatsData> =>
    fetch(`${BASE_URL}/stats`, { headers: authHeaders() }).then(handleResponse),
};

export interface ProfileData {
  username: string;
  email: string;
  shareToken: string;
}

export const profileApi = {
  get: (): Promise<ProfileData> =>
    fetch(`${BASE_URL}/profile`, { headers: authHeaders() }).then(handleResponse),

  updateUsername: (username: string): Promise<ProfileData> =>
    fetch(`${BASE_URL}/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ username }),
    }).then(handleResponse),

  updatePassword: (oldPassword: string, newPassword: string): Promise<{ message: string }> =>
    fetch(`${BASE_URL}/profile/password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ oldPassword, newPassword }),
    }).then(handleResponse),
};
