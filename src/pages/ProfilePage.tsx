import React, { useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { 
  User, 
  Moon, 
  Sun, 
  Palette, 
  Database, 
  LogOut, 
  Check, 
  Sliders, 
  ShieldCheck, 
  CheckSquare, 
  Sparkles 
} from 'lucide-react';
import { Header } from '../components/common/Header';
import { FirebaseConfigModal } from '../components/common/FirebaseConfigModal';
import { NotificationModal } from '../components/common/NotificationModal';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const ProfilePage: React.FC = () => {
  const { currentUser, logout, isFirebaseConnected } = useAuth();
  const { 
    theme, 
    toggleTheme, 
    currentPalette, 
    setAccountPalette, 
    availablePalettes, 
    isSavingPalette,
    defaultView,
    setDefaultView
  } = useTheme();

  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const initials = currentUser?.displayName
    ? currentUser.displayName.slice(0, 2).toUpperCase()
    : currentUser?.email?.slice(0, 2).toUpperCase() || 'ZU';

  return (
    <IonPage>
      <Header onOpenNotifications={() => setIsNotificationModalOpen(true)} title="Profile & Settings" />

      <IonContent fullscreen className="ion-padding">
        {/* User Card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: 18,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{
            width: 54,
            height: 54,
            borderRadius: '50%',
            background: 'var(--primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            fontWeight: 800,
            boxShadow: '0 4px 12px var(--primary-glow)',
            flexShrink: 0
          }}>
            {initials}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {currentUser?.displayName || 'Zenith User'}
            </h3>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser?.email || 'Authenticated User'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '0.72rem',
                color: 'var(--primary)',
                background: 'var(--primary-light)',
                padding: '2px 8px',
                borderRadius: 99,
                fontWeight: 600
              }}>
                <ShieldCheck size={11} />
                Firebase Cloud Sync
              </span>
            </div>
          </div>
        </div>

        {/* Theme Mode Toggle */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 16px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {theme === 'dark' ? <Moon size={18} color="var(--primary)" /> : <Sun size={18} color="var(--primary)" />}
            <div>
              <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Interface Mode
              </h4>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {theme === 'dark' ? 'Dark Mode (OLED Optimized)' : 'Light Mode (Clean Day)'}
              </p>
            </div>
          </div>

          <button
            className="submit-btn"
            style={{ width: 'auto', padding: '8px 14px', fontSize: '0.8rem', borderRadius: 8 }}
            onClick={toggleTheme}
          >
            Switch to {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>

        {/* Account Color Palette */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: 16,
          marginBottom: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Palette size={18} color="var(--primary)" />
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Account Accent Palette
              </h4>
            </div>
            {isSavingPalette && (
              <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600 }}>
                Syncing...
              </span>
            )}
          </div>

          <p style={{ margin: '0 0 14px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Choose an accent color. Syncs across all your devices in real-time.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {availablePalettes.map((p) => {
              const isSelected = currentPalette === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setAccountPalette(p.id)}
                  style={{
                    background: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-app)',
                    border: `2px solid ${isSelected ? p.primary : 'var(--border-subtle)'}`,
                    borderRadius: 10,
                    padding: '10px 6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? `0 0 10px ${p.primary}44` : 'none'
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: p.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff'
                    }}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {p.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Firebase & Data Sync Card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: 16,
          marginBottom: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Database size={18} color="var(--primary)" />
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Firebase Connection
            </h4>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-app)',
            padding: 10,
            borderRadius: 8,
            marginBottom: 12
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Project ID:</span>
              <p style={{ margin: '2px 0 0 0', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                todo-advanced-27e80
              </p>
            </div>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--success)'
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
              Live Connected
            </span>
          </div>

          <button
            type="button"
            className="submit-btn"
            style={{
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'none',
              padding: '10px'
            }}
            onClick={() => setIsFirebaseModalOpen(true)}
          >
            <Sliders size={15} />
            <span>Manage Firebase Credentials</span>
          </button>
        </div>

        {/* Sign Out Card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: 16,
          marginBottom: 80
        }}>
          {showLogoutConfirm ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Are you sure you want to sign out?
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="submit-btn"
                  style={{ background: 'var(--priority-urgent)', boxShadow: 'none', padding: '10px' }}
                  onClick={logout}
                >
                  Yes, Sign Out
                </button>
                <button
                  type="button"
                  className="submit-btn"
                  style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', boxShadow: 'none', padding: '10px' }}
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="submit-btn"
              style={{
                background: 'rgba(244, 63, 94, 0.12)',
                color: 'var(--priority-urgent)',
                border: '1px solid rgba(244, 63, 94, 0.25)',
                boxShadow: 'none',
                padding: '11px'
              }}
              onClick={() => setShowLogoutConfirm(true)}
            >
              <LogOut size={16} />
              <span>Sign Out of Zenith</span>
            </button>
          )}
        </div>

        {/* Modals */}
        <FirebaseConfigModal
          isOpen={isFirebaseModalOpen}
          onClose={() => setIsFirebaseModalOpen(false)}
        />

        <NotificationModal
          isOpen={isNotificationModalOpen}
          onClose={() => setIsNotificationModalOpen(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;
