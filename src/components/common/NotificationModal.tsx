import React from 'react';
import { IonModal } from '@ionic/react';
import { Bell, CheckCheck, Trash2, X, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow, parseISO, isValid } from 'date-fns';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'overdue':
        return <AlertTriangle size={16} color="var(--priority-urgent)" />;
      case 'due':
        return <Clock size={16} color="#f59e0b" />;
      case 'completed':
        return <CheckCircle2 size={16} color="var(--success)" />;
      default:
        return <Bell size={16} color="var(--primary)" />;
    }
  };

  const formatTimestamp = (ts: string) => {
    try {
      const d = parseISO(ts);
      if (isValid(d)) {
        return formatDistanceToNow(d, { addSuffix: true });
      }
      return '';
    } catch {
      return '';
    }
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      breakpoints={[0, 0.6, 0.9]}
      initialBreakpoint={0.6}
      className="modal-bottom-sheet"
    >
      <div className="sheet-handle" />
      <div className="modal-sheet-content">
        <div className="modal-sheet-header">
          <h2 className="modal-sheet-title">
            <Bell size={20} color="var(--primary)" />
            Notifications ({notifications.length})
          </h2>
          <div style={{ display: 'flex', gap: 6 }}>
            {notifications.length > 0 && (
              <>
                <button 
                  className="icon-btn" 
                  onClick={markAllAsRead} 
                  title="Mark all as read"
                >
                  <CheckCheck size={16} />
                </button>
                <button 
                  className="icon-btn" 
                  onClick={clearNotifications} 
                  title="Clear all"
                  style={{ color: 'var(--priority-urgent)' }}
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
            <button className="icon-btn" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrap">
              <Bell size={26} />
            </div>
            <h4 style={{ margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>No notifications</h4>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>You're all caught up with your workspace reminders.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                style={{
                  background: n.read ? 'var(--bg-app)' : 'var(--bg-surface-elevated)',
                  border: `1px solid ${n.read ? 'var(--border-subtle)' : 'var(--primary-border)'}`,
                  borderRadius: 12,
                  padding: 12,
                  display: 'flex',
                  gap: 12,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ marginTop: 2 }}>{getIcon(n.type)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                    <h5 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {n.title}
                    </h5>
                    {!n.read && (
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
                    )}
                  </div>
                  <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                    {n.message}
                  </p>
                  <span style={{ display: 'block', marginTop: 4, fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    {formatTimestamp(n.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </IonModal>
  );
};
