import React from 'react';
import { Bell, AlertTriangle, CheckCircle2, Clock, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const NotificationToast: React.FC = () => {
  const { activeToast, clearActiveToast } = useNotifications();

  if (!activeToast) return null;

  const getIcon = () => {
    switch (activeToast.type) {
      case 'overdue':
        return <AlertTriangle size={18} color="var(--priority-urgent)" />;
      case 'due':
        return <Clock size={18} color="#f59e0b" />;
      case 'completed':
        return <CheckCircle2 size={18} color="var(--success)" />;
      default:
        return <Bell size={18} color="var(--primary)" />;
    }
  };

  return (
    <div className="notification-banner" onClick={clearActiveToast}>
      <div className="banner-content">
        <div style={{ flexShrink: 0 }}>{getIcon()}</div>
        <div style={{ minWidth: 0 }}>
          <p className="banner-title">{activeToast.title}</p>
          <p className="banner-desc">{activeToast.message}</p>
        </div>
      </div>
      <button 
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: 4,
          display: 'flex',
          alignItems: 'center'
        }}
        onClick={(e) => {
          e.stopPropagation();
          clearActiveToast();
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
};
