import type { Notification } from '../types';

interface Props {
  notifications: Notification[];
  onClose: () => void;
  onMarkAllRead: () => void;
  onNotificationClick: (n: Notification) => void;
}

export const NotificationsPanel = ({ notifications, onClose, onNotificationClick }: Props) => {
  return (
    <div className="notifications-panel">
      <div className="notifications-panel-header">
        <span className="section-label" style={{ margin: 0 }}>notificări</span>
        <button className="btn-edit-budget" onClick={onClose}>✕ închide</button>
      </div>

      {notifications.length === 0 ? (
        <p className="state-msg">nicio notificare</p>
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
                  {new Date(n.createdAt).toLocaleDateString('ro-RO')}
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
