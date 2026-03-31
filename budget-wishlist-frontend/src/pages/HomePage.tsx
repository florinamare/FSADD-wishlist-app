import { useState, useEffect } from 'react';
import { BudgetHeader } from '../components/BudgetHeader';
import { AddItemForm } from '../components/AddItemForm';
import { WishlistItem } from '../components/WishlistItem';
import { Toast } from '../components/Toast';
import { FriendsPanel } from '../components/FriendsPanel';
import { NotificationsPanel } from '../components/NotificationsPanel';
import { PurchasedModal } from '../components/PurchasedModal';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../context/AuthContext';
import { friendsApi, notificationsApi } from '../api/WishlistApi';
import type { Notification } from '../types';

export function HomePage() {
  const { user, logout } = useAuth();
  const [showFriends, setShowFriends] = useState(false);
  const [friendCount, setFriendCount] = useState(0);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [purchasedModal, setPurchasedModal] = useState<Notification | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = () => {
    notificationsApi.getAll().then(setNotifications).catch(() => {});
  };

  useEffect(() => {
    friendsApi.getFriends().then((f) => setFriendCount(f.length)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(id);
  }, []);

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
  } = useWishlist();

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

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '0.75rem', gap: '8px' }}>
        <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
          {user?.username}
        </span>
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
        <button className="btn-edit-budget" onClick={logout}>
          Sign out
        </button>
      </div>

      {showNotifications && (
        <NotificationsPanel
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onMarkAllRead={handleMarkAllRead}
          onNotificationClick={handleNotificationClick}
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

      <AddItemForm onAdd={addItem} />

      <section>
        <span className="section-label">wishes</span>

        {isLoading && <p className="state-msg">loading...</p>}
        {!isLoading && items.length === 0 && (
          <p className="state-msg">no wishes added yet</p>
        )}

        {items.map((item) => (
          <WishlistItem
            key={item._id}
            item={item}
            remainingBudget={remaining}
            onToggle={togglePurchased}
            onToggleBreakdown={toggleBreakdownItem}
            onDelete={deleteItem}
          />
        ))}
      </section>
    </main>
  );
}
