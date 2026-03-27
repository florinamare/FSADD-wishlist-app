import { useState, useEffect, useCallback, useRef } from 'react';
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

  // Fix #3: track in-flight item IDs to prevent double-clicks
  const pending = useRef(new Set<string>());

  // Fix #2: auto-clear error after 4 seconds
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(timer);
  }, [error]);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await wishlistApi.getItems();
      setItems(data);
    } catch {
      setError('Failed to load items.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBudget = useCallback(async () => {
    try {
      const data = await wishlistApi.getBudget();
      setBudget(data.amount);
      setBudgetHistory(data.history);
    } catch {
      // fallback to default if budget fetch fails
    }
  }, []);

  useEffect(() => {
    fetchItems();
    fetchBudget();
  }, [fetchItems, fetchBudget]);

  const addItem = async (item: NewWishlistItem) => {
    try {
      const newItem = await wishlistApi.addItem(item);
      setItems((prev) => [...prev, newItem]);
    } catch {
      setError('Failed to add item.');
    }
  };

  const togglePurchased = async (id: string) => {
    // Fix #3: block if already in flight
    if (pending.current.has(id)) return;
    pending.current.add(id);

    try {
      const item = items.find((i) => i._id === id);
      if (!item) return;

      if (item.breakdown) {
        const allDone = item.breakdown.every((b) => b.purchased);
        const newPurchased = !allDone;

        await Promise.all(
          item.breakdown
            .filter((b) => b.purchased !== newPurchased)
            .map((b) => wishlistApi.toggleBreakdownItem(id, b.key, newPurchased))
        );
        const updated = await wishlistApi.togglePurchased(id, newPurchased);
        setItems((prev) => prev.map((i) => (i._id === id ? updated : i)));
      } else {
        const updated = await wishlistApi.togglePurchased(id, !item.purchased);
        setItems((prev) => prev.map((i) => (i._id === id ? updated : i)));
      }
    } finally {
      pending.current.delete(id);
    }
  };

  const toggleBreakdownItem = async (itemId: string, key: string) => {
    const lockKey = `${itemId}:${key}`;
    // Fix #3: block if already in flight
    if (pending.current.has(lockKey)) return;
    pending.current.add(lockKey);

    try {
      const item = items.find((i) => i._id === itemId);
      if (!item?.breakdown) return;

      const bd = item.breakdown.find((b) => b.key === key);
      if (!bd) return;

      const newBdPurchased = !bd.purchased;
      await wishlistApi.toggleBreakdownItem(itemId, key, newBdPurchased);

      const newBreakdown = item.breakdown.map((b) =>
        b.key === key ? { ...b, purchased: newBdPurchased } : b
      );
      const allDone = newBreakdown.every((b) => b.purchased);

      // Fix #1: sync parent purchased state when all breakdown items change
      if (allDone !== item.purchased) {
        const updated = await wishlistApi.togglePurchased(itemId, allDone);
        setItems((prev) => prev.map((i) => (i._id === itemId ? updated : i)));
      } else {
        setItems((prev) =>
          prev.map((i) => (i._id === itemId ? { ...i, breakdown: newBreakdown } : i))
        );
      }
    } finally {
      pending.current.delete(lockKey);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await wishlistApi.deleteItem(id);
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch {
      setError('Failed to delete item.');
    }
  };

  const adjustBudget = async (type: AdjustType, amount: number, note?: string) => {
    if (amount <= 0) return;
    if (type === 'subtract' && amount > budget) return;

    try {
      const data = await wishlistApi.adjustBudget(type, amount, note);
      setBudget(data.amount);
      setBudgetHistory(data.history);
    } catch {
      setError('Failed to adjust budget.');
    }
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
