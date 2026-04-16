import { useState, useEffect, useCallback, useRef } from 'react';
import { wishlistApi } from '../api/WishlistApi';
import type { WishlistItem, NewWishlistItem, BudgetAdjustment, AdjustType } from '../types';
import { getTotalSpent, formatCurrency } from '../utils/BugetUtils';

const DEFAULT_BUDGET = 5000;
const PAGE_SIZE = 10;

export const useWishlist = (wishlistId?: string) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [budget, setBudget] = useState(DEFAULT_BUDGET);
  const [budgetHistory, setBudgetHistory] = useState<BudgetAdjustment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pending = useRef(new Set<string>());

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(timer);
  }, [error]);

  const fetchItems = useCallback(async (p: number) => {
    try {
      setIsLoading(true);
      const data = await wishlistApi.getItems(p, PAGE_SIZE, wishlistId);
      setItems(data.items);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch {
      setError('Failed to load items.');
    } finally {
      setIsLoading(false);
    }
  }, [wishlistId]);

  const fetchBudget = useCallback(async () => {
    try {
      const data = await wishlistApi.getBudget();
      setBudget(data.amount);
      setBudgetHistory(data.history);
    } catch {
      // fallback to default
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchItems(1);
    fetchBudget();
  }, [fetchItems, fetchBudget]);

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    fetchItems(p);
  };

  const addItem = async (item: NewWishlistItem & { wishlistId?: string }) => {
    try {
      await wishlistApi.addItem(item);
      // Refresh current page to reflect new item
      fetchItems(page);
    } catch {
      setError('Failed to add item.');
    }
  };

  const togglePurchased = async (id: string) => {
    if (pending.current.has(id)) return;
    pending.current.add(id);

    try {
      const item = items.find((i) => i._id === id);
      if (!item) return;

      if (item.breakdown) {
        const allDone = item.breakdown.every((b) => b.purchased);
        const newPurchased = !allDone;

        if (newPurchased) {
          const unpaidCost = item.breakdown.reduce((sum, b) => sum + (b.purchased ? 0 : b.amount), 0);
          if (unpaidCost > remaining) {
            setError(`You can't afford "${item.name}" right now. You need ${formatCurrency(unpaidCost - remaining)} more.`);
            return;
          }
        }

        await Promise.all(
          item.breakdown
            .filter((b) => b.purchased !== newPurchased)
            .map((b) => wishlistApi.toggleBreakdownItem(id, b.key, newPurchased))
        );
        const updated = await wishlistApi.togglePurchased(id, newPurchased);
        setItems((prev) => prev.map((i) => (i._id === id ? updated : i)));
      } else {
        if (!item.purchased && item.price > remaining) {
          setError(`You can't afford "${item.name}" right now. You need ${formatCurrency(item.price - remaining)} more.`);
          return;
        }
        const updated = await wishlistApi.togglePurchased(id, !item.purchased);
        setItems((prev) => prev.map((i) => (i._id === id ? updated : i)));
      }
    } finally {
      pending.current.delete(id);
    }
  };

  const toggleBreakdownItem = async (itemId: string, key: string) => {
    const lockKey = `${itemId}:${key}`;
    if (pending.current.has(lockKey)) return;
    pending.current.add(lockKey);

    try {
      const item = items.find((i) => i._id === itemId);
      if (!item?.breakdown) return;

      const bd = item.breakdown.find((b) => b.key === key);
      if (!bd) return;

      const newBdPurchased = !bd.purchased;

      if (newBdPurchased && bd.amount > remaining) {
        setError(`Not enough budget for this. You need ${formatCurrency(bd.amount - remaining)} more.`);
        return;
      }

      await wishlistApi.toggleBreakdownItem(itemId, key, newBdPurchased);

      const newBreakdown = item.breakdown.map((b) =>
        b.key === key ? { ...b, purchased: newBdPurchased } : b
      );
      const allDone = newBreakdown.every((b) => b.purchased);

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
      setTotal((prev) => prev - 1);
      // If we deleted the last item on this page, go to previous
      if (items.length === 1 && page > 1) {
        fetchItems(page - 1);
      }
    } catch {
      setError('Failed to delete item.');
    }
  };

  const updateItemImage = (id: string, imageUrl: string) => {
    setItems((prev) => prev.map((i) => (i._id === id ? { ...i, imageUrl } : i)));
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
    page,
    totalPages,
    total,
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
    updateItemImage,
    adjustBudget,
    goToPage,
  };
};
