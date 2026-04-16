import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BudgetHeader } from '../components/BudgetHeader';
import { AddItemForm } from '../components/AddItemForm';
import { WishlistItem } from '../components/WishlistItem';
import { Toast } from '../components/Toast';
import { FriendsPanel } from '../components/FriendsPanel';
import { NotificationsPanel } from '../components/NotificationsPanel';
import { PurchasedModal } from '../components/PurchasedModal';
import { WishlistsBar } from '../components/WishlistsBar';
import { SkeletonItem } from '../components/SkeletonItem';
import { useWishlist } from '../hooks/useWishList';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';
import { friendsApi, notificationsApi } from '../api/WishlistApi';
import type { Notification } from '../types';

export function HomePage() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();

  const [showFriends, setShowFriends] = useState(false);
  const [friendCount, setFriendCount] = useState(0);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifPage, setNotifPage] = useState(1);
  const [notifTotalPages, setNotifTotalPages] = useState(1);
  const [showNotifications, setShowNotifications] = useState(false);
  const [purchasedModal, setPurchasedModal] = useState<Notification | null>(null);

  const [activeWishlistId, setActiveWishlistId] = useState<string | undefined>(undefined);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationsApi.getAll(1);
      setNotifications(data.notifications);
      setNotifPage(data.page);
      setNotifTotalPages(data.totalPages);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    friendsApi.getFriends().then((f) => setFriendCount(f.length)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  useSocket({
    userId: user?.userId ?? null,
    onNotification: (n) => {
      setNotifications((prev) => {
        if (prev.some((x) => x._id === n._id)) return prev;
        return [n, ...prev];
      });
    },
  });

  const handleMarkAllRead = () => {
    notificationsApi.markAllRead().then(() => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }).catch(() => {});
  };

  const handleNotificationClick = (n: Notification) => {
    if (!n.read) {
      setNotifications((prev) =>
        prev.map((x) => (x._id === n._id ? { ...x, read: true } : x))
      );
    }
    if (n.type === 'purchased') {
      setPurchasedModal(n);
      setShowNotifications(false);
    }
  };

  const {
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
  } = useWishlist(activeWishlistId);

  return (
    <main className="app">
      <Toast message={error} />

      {purchasedModal && (
        <PurchasedModal
          itemName={purchasedModal.itemName}
          boughtBy={purchasedModal.boughtBy}
          onClose={() => setPurchasedModal(null)}
        />
      )}

      {/* Top bar */}
      <div className="top-bar">
        <span className="top-bar-username">{user?.username}</span>
        <div className="top-bar-actions">
          <button
            className="btn-bell"
            onClick={() => setShowNotifications((p) => !p)}
            title="Notificări"
          >
            <span className="btn-bell-icon">🔔</span>
            {unreadCount > 0 && (
              <span className="btn-friends-badge">{unreadCount}</span>
            )}
          </button>
          <button
            className="btn-friends"
            onClick={() => setShowFriends((p) => !p)}
            title="Prieteni"
          >
            <span className="btn-friends-icon">♟</span>
            {friendCount > 0 && (
              <span className="btn-friends-badge">{friendCount}</span>
            )}
          </button>
          <button className="btn-edit-budget" onClick={() => navigate('/stats')} title="Statistici">
            📊
          </button>
          <button className="btn-edit-budget" onClick={() => navigate('/profile')} title="Profil">
            👤
          </button>
          <button className="btn-edit-budget" onClick={toggleDarkMode} title="Comută tema">
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button className="btn-edit-budget" onClick={logout}>
            sign out
          </button>
        </div>
      </div>

      {showNotifications && (
        <NotificationsPanel
          notifications={notifications}
          page={notifPage}
          totalPages={notifTotalPages}
          onClose={() => setShowNotifications(false)}
          onMarkAllRead={handleMarkAllRead}
          onNotificationClick={handleNotificationClick}
          onPageChange={setNotifPage}
          onAppendNotifications={(more) => setNotifications((prev) => [...prev, ...more])}
        />
      )}

      {showFriends && (
        <FriendsPanel onClose={() => setShowFriends(false)} />
      )}

      <BudgetHeader
        budget={budget}
        totalSpent={totalSpent}
        remaining={remaining}
        budgetHistory={budgetHistory}
        onAdjust={adjustBudget}
        shareToken={user?.shareToken}
      />

      <WishlistsBar activeId={activeWishlistId} onChange={setActiveWishlistId} />

      <AddItemForm wishlistId={activeWishlistId} onAdd={addItem} />

      <section>
        <div className="section-header">
          <span className="section-label">wishes</span>
          {total > 0 && (
            <span className="section-count">{total} item{total !== 1 ? 's' : ''}</span>
          )}
        </div>

        {isLoading && (
          <>
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
          </>
        )}

        {!isLoading && items.length === 0 && (
          <p className="state-msg">no wishes added yet</p>
        )}

        {!isLoading && items.map((item) => (
          <WishlistItem
            key={item._id}
            item={item}
            remainingBudget={remaining}
            onToggle={togglePurchased}
            onToggleBreakdown={toggleBreakdownItem}
            onDelete={deleteItem}
            onImageUploaded={updateItemImage}
          />
        ))}

        {totalPages > 1 && !isLoading && (
          <div className="pagination">
            <button
              className="btn-page"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
            >
              ← prev
            </button>
            <span className="page-info">{page} / {totalPages}</span>
            <button
              className="btn-page"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
            >
              next →
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
