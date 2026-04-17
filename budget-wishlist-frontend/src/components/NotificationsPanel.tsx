import { useState } from 'react';
import type { Notification } from '../types';
import { notificationsApi } from '../api/WishlistApi';

interface Props {
  notifications: Notification[];
  page: number;
  totalPages: number;
  onClose: () => void;
  onMarkAllRead: () => void;
  onNotificationClick: (n: Notification) => void;
  onPageChange: (page: number) => void;
  onAppendNotifications: (notifications: Notification[]) => void;
}

export const NotificationsPanel = ({
  notifications,
  page,
  totalPages,
  onClose,
  onMarkAllRead,
  onNotificationClick,
  onPageChange,
  onAppendNotifications,
}: Props) => {
  const hasUnread = notifications.some((n) => !n.read);
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    if (page >= totalPages || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await notificationsApi.getAll(page + 1);
      onAppendNotifications(data.notifications);
      onPageChange(page + 1);
    } catch {
      // ignore
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="notifications-panel">
      <div className="notifications-panel-header">
        <span className="section-label" style={{ margin: 0 }}>notificări</span>
        <button className="btn-edit-budget" onClick={onClose}>✕ închide</button>
      </div>

      {notifications.length === 0 ? (
        <p className="state-msg">nicio notificare</p>
      ) : (
        <>
          <div className="notifications-list">
            {notifications.map((n) => (
              <button
                key={n._id}
                className={`notification-row${!n.read ? ' notification-unread' : ''}`}
                onClick={() => onNotificationClick(n)}
              >
                <span className="notification-icon">
                  {n.type === 'purchased' ? '🎁' : '👀'}
                </span>
                <span className="notification-content">
                  <span className="notification-message">{n.message}</span>
                  <span className="notification-time">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </span>
                {!n.read && <span className="notification-dot" />}
              </button>
            ))}
          </div>
          {page < totalPages && (
            <button className="btn-load-more" onClick={handleLoadMore} disabled={loadingMore}>
              {loadingMore ? 'loading...' : 'load more'}
            </button>
          )}
        </>
      )}
    </div>
  );
};
