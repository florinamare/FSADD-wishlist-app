export type Priority = 'low' | 'medium' | 'high';
export type HighlightColor = 'green' | 'yellow' | 'red';
export type AdjustType = 'add' | 'subtract';

export interface BreakdownItem {
  key: string;
  amount: number;
  purchased: boolean;
}

export interface WishlistItem {
  _id: string;
  name: string;
  price: number;
  priority: Priority;
  purchased: boolean;
  breakdown: BreakdownItem[] | null;
  boughtBy?: string | null;
  imageUrl?: string | null;
  createdAt: string;
}

export type NewWishlistItem = Omit<WishlistItem, '_id' | 'createdAt' | 'purchased'>;

export interface BudgetAdjustment {
  type: AdjustType;
  amount: number;
  note?: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  type: 'purchased' | 'visited';
  message: string;
  itemName: string | null;
  boughtBy: string | null;
  read: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items?: T[];
  notifications?: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Wishlist {
  _id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  shareToken?: string;
  createdAt: string;
}

export interface StatsData {
  summary: {
    totalItems: number;
    purchasedItems: number;
    pendingItems: number;
    activeFriends: number;
    unreadNotifications: number;
  };
  itemsByPriority: Array<{
    _id: string;
    count: number;
    totalValue: number;
    purchasedCount: number;
  }>;
  spentPerMonth: Array<{
    _id: { year: number; month: number };
    totalSpent: number;
    count: number;
  }>;
}
