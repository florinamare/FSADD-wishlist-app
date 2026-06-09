import type { Notification } from '../types';

interface Props {
  notifications: Notification[];
  onClose: () => void;
  onMarkAllRead: () => void;
  onNotificationClick: (n: Notification) => void;
}

export const NotificationsPanel = ({ notifications, onClose, onMarkAllRead, onNotificationClick }: Props) => {
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="notifications-panel">
      <div className="notifications-panel-header">
        <span className="section-label" style={{ margin: 0 }}>notifications</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {hasUnread && (
            <button className="btn-mark-read" onClick={onMarkAllRead}>
              mark all read
            </button>
          )}
          <button className="btn-edit-budget" onClick={onClose}>✕ close</button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <p className="state-msg">no notifications yet</p>
      ) : (
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
      )}
    </div>
  );
};
