import { useState, useEffect, useCallback } from 'react';
import { wishlistApi } from '../api/WishlistApi';
import type { WishlistItem, NewWishlistItem, BudgetAdjustment, AdjustType } from '../types';
import { getTotalSpent } from '../utils/BugetUtils';

const DEFAULT_BUDGET = 5000;

export const useWishlist = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [budget, setBudget] = useState(DEFAULT_BUDGET);
  const [budgetHistory, setBudgetHistory] = useState<BudgetAdjustment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await wishlistApi.getItems();
      setItems(data);
    } catch {
      setError('Nu s-au putut încărca itemele.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = async (item: NewWishlistItem) => {
    const newItem = await wishlistApi.addItem(item);
    setItems((prev) => [...prev, newItem]);
  };

  const togglePurchased = async (id: string) => {
    const item = items.find((i) => i._id === id);
    if (!item) return;

    if (item.breakdown) {
      const allDone = item.breakdown.every((b) => b.purchased);
      const updated = {
        ...item,
        breakdown: item.breakdown.map((b) => ({ ...b, purchased: !allDone })),
      };
      setItems((prev) => prev.map((i) => (i._id === id ? updated : i)));
      await wishlistApi.togglePurchased(id, !allDone);
    } else {
      const updated = await wishlistApi.togglePurchased(id, !item.purchased);
      setItems((prev) => prev.map((i) => (i._id === id ? updated : i)));
    }
  };

  const toggleBreakdownItem = async (itemId: string, key: string) => {
    const item = items.find((i) => i._id === itemId);
    if (!item?.breakdown) return;

    const bd = item.breakdown.find((b) => b.key === key);
    if (!bd) return;

    const updated = {
      ...item,
      breakdown: item.breakdown.map((b) =>
        b.key === key ? { ...b, purchased: !b.purchased } : b
      ),
    };
    setItems((prev) => prev.map((i) => (i._id === itemId ? updated : i)));
    await wishlistApi.toggleBreakdownItem(itemId, key, !bd.purchased);
  };

  const deleteItem = async (id: string) => {
    await wishlistApi.deleteItem(id);
    setItems((prev) => prev.filter((i) => i._id !== id));
  };

  const adjustBudget = (type: AdjustType, amount: number, note?: string) => {
    if (amount <= 0) return;
    if (type === 'subtract' && amount > budget) return;

    const delta = type === 'add' ? amount : -amount;
    setBudget((prev) => prev + delta);
    setBudgetHistory((prev) => [
      ...prev,
      { type, amount, note, createdAt: new Date().toISOString() },
    ]);
  };

  const totalSpent = getTotalSpent(items);
  const remaining = budget - totalSpent;

  return {
    items,
    budget,
    budgetHistory,
    totalSpent,
    remaining,
    isLoading,
    error,
    addItem,
    togglePurchased,
    toggleBreakdownItem,
    deleteItem,
    adjustBudget,
  };
};