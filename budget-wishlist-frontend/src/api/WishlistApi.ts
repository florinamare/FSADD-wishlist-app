import type { WishlistItem, NewWishlistItem, BudgetAdjustment, AdjustType, Notification } from '../types';

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
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  return res.json();
};

export const wishlistApi = {
  getItems: (): Promise<WishlistItem[]> =>
    fetch(`${BASE_URL}/items`, { headers: authHeaders() }).then(handleResponse),

  addItem: (item: NewWishlistItem): Promise<WishlistItem> =>
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

export const notificationsApi = {
  getAll: (): Promise<Notification[]> =>
    fetch(`${BASE_URL}/notifications`, { headers: authHeaders() }).then(handleResponse),

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
  getWishlist: (shareToken: string): Promise<SharedWishlist> =>
    fetch(`${BASE_URL}/shared/${shareToken}`).then(handleResponse),

  updateItem: (
    shareToken: string,
    itemId: string,
    purchased: boolean,
    boughtBy?: string
  ): Promise<WishlistItem> =>
    fetch(`${BASE_URL}/shared/${shareToken}/items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ purchased, boughtBy }),
    }).then(handleResponse),

  updateBreakdownItem: (
    shareToken: string,
    itemId: string,
    key: string,
    purchased: boolean
  ): Promise<WishlistItem> =>
    fetch(`${BASE_URL}/shared/${shareToken}/items/${itemId}/breakdown/${key}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ purchased }),
    }).then(handleResponse),
};