import React from 'react';
import { IonHeader, IonToolbar, IonTitle } from '@ionic/react';
import { CheckSquare, Bell, Moon, Sun, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';

interface HeaderProps {
  title?: string;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title = 'Zenith', onOpenNotifications }) => {
  const { isFirebaseConnected } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();

  return (
    <IonHeader className="ion-no-border">
      <IonToolbar className="mobile-header-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          {/* Brand */}
          <div className="brand-title">
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px var(--primary-glow)'
            }}>
              <CheckSquare size={18} />
            </div>
            <span>
              {title}<span className="brand-dot">.</span>
            </span>
            {isFirebaseConnected && (
              <span 
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  boxShadow: '0 0 6px var(--primary)',
                  display: 'inline-block'
                }}
                title="Connected to Firebase Firestore"
              />
            )}
          </div>

          {/* Action buttons */}
          <div className="header-actions">
            {/* Theme Toggle */}
            <button className="icon-btn" onClick={toggleTheme} title="Toggle Dark/Light Mode">
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Notification Bell */}
            <button className="icon-btn" onClick={onOpenNotifications} title="Notifications">
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>
          </div>
        </div>
      </IonToolbar>
    </IonHeader>
  );
};
