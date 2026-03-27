import { type HighlightColor, type WishlistItem } from '../types';

export const BD_LABELS: Record<string, string> = {
  accommodation: 'cazare',
  flights: 'zboruri',
  food: 'mâncare',
  activities: 'activități',
};

export const BD_ICONS: Record<string, string> = {
  accommodation: '🏨',
  flights: '✈️',
  food: '🍜',
  activities: '🎭',
};

export const formatCurrency = (amount: number): string =>
  Math.round(amount).toLocaleString('ro-RO') + ' RON';

export const getItemSpent = (item: WishlistItem): number => {
  if (!item.breakdown) return item.purchased ? item.price : 0;
  return item.breakdown.reduce((sum, b) => sum + (b.purchased ? b.amount : 0), 0);
};

export const getItemPurchasedState = (item: WishlistItem): 'none' | 'partial' | 'full' => {
  if (!item.breakdown) return item.purchased ? 'full' : 'none';
  const done = item.breakdown.filter((b) => b.purchased).length;
  if (done === 0) return 'none';
  if (done === item.breakdown.length) return 'full';
  return 'partial';
};

export const getTotalSpent = (items: WishlistItem[]): number =>
  items.reduce((sum, item) => sum + getItemSpent(item), 0);

export const getRemaining = (items: WishlistItem[], budget: number): number =>
  budget - getTotalSpent(items);

export const getHighlight = (price: number, remaining: number): HighlightColor => {
  if (price > remaining) return 'red';
  if (price > remaining * 0.7) return 'yellow';
  return 'green';
};

export const getItemHighlight = (item: WishlistItem, remaining: number): HighlightColor => {
  const state = getItemPurchasedState(item);
  if (state === 'full') return 'green';
  const spent = getItemSpent(item);
  return getHighlight(item.price - spent, remaining + spent);
};