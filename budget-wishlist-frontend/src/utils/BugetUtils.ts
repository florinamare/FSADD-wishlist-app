import { type HighlightColor, type WishlistItem } from '../types';

// ─── Category Templates ───────────────────────────────────────

export type CategoryType = 'vacation' | 'event' | 'renovation' | 'fitness' | 'custom';

export interface FieldTemplate {
  key: string;
  label: string;
  icon: string;
}

export interface CategoryTemplate {
  label: string;
  icon: string;
  fields: FieldTemplate[];
}

export const CATEGORY_TEMPLATES: Record<CategoryType, CategoryTemplate> = {
  vacation: {
    label: 'Vacation',
    icon: '✈️',
    fields: [
      { key: 'flights',       label: 'Flights',        icon: '✈️' },
      { key: 'accommodation', label: 'Accommodation',   icon: '🏨' },
      { key: 'food',          label: 'Food',            icon: '🍜' },
      { key: 'activities',    label: 'Activities',      icon: '🎭' },
    ],
  },
  event: {
    label: 'Event',
    icon: '🎉',
    fields: [
      { key: 'venue',       label: 'Venue',         icon: '🏛️' },
      { key: 'food',        label: 'Food',          icon: '🍽️' },
      { key: 'outfit',      label: 'Outfit',        icon: '👗' },
      { key: 'photo_video', label: 'Photo / Video', icon: '📸' },
    ],
  },
  renovation: {
    label: 'Renovation',
    icon: '🔨',
    fields: [
      { key: 'materials',  label: 'Materials',       icon: '🧱' },
      { key: 'furniture',  label: 'Furniture',       icon: '🛋️' },
      { key: 'labor',      label: 'Labor',           icon: '👷' },
      { key: 'tools',      label: 'Tools & Equipment', icon: '🔧' },
    ],
  },
  fitness: {
    label: 'Fitness',
    icon: '💪',
    fields: [
      { key: 'gym',         label: 'Gym Membership',    icon: '🏋️' },
      { key: 'equipment',   label: 'Equipment',         icon: '🏃' },
      { key: 'supplements', label: 'Supplements',       icon: '💊' },
      { key: 'trainer',     label: 'Trainer / Classes', icon: '🧑‍🏫' },
    ],
  },
  custom: {
    label: 'Custom',
    icon: '✏️',
    fields: [],
  },
};

// Build a flat key → label/icon lookup from all predefined templates
const KEY_LABEL_MAP: Record<string, string> = {};
const KEY_ICON_MAP: Record<string, string> = {};
Object.values(CATEGORY_TEMPLATES).forEach((cat) => {
  cat.fields.forEach((f) => {
    KEY_LABEL_MAP[f.key] = f.label;
    KEY_ICON_MAP[f.key] = f.icon;
  });
});

export const getFieldLabel = (key: string): string =>
  KEY_LABEL_MAP[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const getFieldIcon = (key: string): string =>
  KEY_ICON_MAP[key] ?? '•';

// ─── Budget Utils ─────────────────────────────────────────────

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
