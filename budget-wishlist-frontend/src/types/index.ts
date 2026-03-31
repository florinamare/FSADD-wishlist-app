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
  createdAt: string;
}

export type NewWishlistItem = Omit<WishlistItem, '_id' | 'createdAt' | 'purchased'>;

export interface BudgetAdjustment {
  type: AdjustType;
  amount: number;
  note?: string;
  createdAt: string;
}