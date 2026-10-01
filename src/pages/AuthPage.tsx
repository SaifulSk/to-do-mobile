import React, { useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { CheckSquare, Mail, Lock, User, Sun, Moon, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const AuthPage: React.FC = () => {
  const { login, register, authError, setAuthError } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setAuthError(null);

    try {
      if (mode === 'register') {
        await register(email, password, displayName);
        setSuccessMsg('Account created successfully! Welcome to Zenith.');
      } else {
        await login(email, password);
        setSuccessMsg('Welcome back! Logging you in...');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatErrorMessage = (errorStr: string | null) => {
    if (!errorStr) return null;
    if (errorStr.includes('auth/invalid-credential') || errorStr.includes('auth/wrong-password')) {
      return 'Invalid email or password. Please check your credentials.';
    }
    if (errorStr.includes('auth/email-already-in-use')) {
      return 'This email is already in use. Please sign in instead.';
    }
    if (errorStr.includes('auth/weak-password')) {
      return 'Password should be at least 6 characters.';
    }
    if (errorStr.includes('auth/invalid-email')) {
      return 'Please enter a valid email address.';
    }
    return errorStr;
  };

  return (
    <IonPage>
      <IonContent fullscreen className="ion-padding" style={{ '--background': 'var(--bg-app)' } as any}>
        {/* Top bar with theme toggle */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'env(safe-area-inset-top, 14px)' }}>
          <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>

        <div style={{ maxWidth: 420, margin: '20px auto 40px auto', padding: '0 8px' }}>
          {/* Brand Logo & Heading */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'var(--primary)',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px var(--primary-glow)',
              marginBottom: 12
            }}>
              <CheckSquare size={30} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.03em', color: 'var(--text-main)' }}>
              Zenith<span style={{ color: 'var(--primary)' }}>.</span> Mobile
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
              {mode === 'login' ? 'Sign in to sync your workspace tasks' : 'Create an account to get started'}
            </p>
          </div>

          {/* Mode Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 4,
            marginBottom: 20
          }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setAuthError(null); }}
              style={{
                background: mode === 'login' ? 'var(--primary)' : 'transparent',
                color: mode === 'login' ? '#fff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '9px 0',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setAuthError(null); }}
              style={{
                background: mode === 'register' ? 'var(--primary)' : 'transparent',
                color: mode === 'register' ? '#fff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '9px 0',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Create Account
            </button>
          </div>

          {/* Errors or Success Alert */}
          {authError && (
            <div style={{
              background: 'var(--priority-urgent-bg)',
              border: '1px solid var(--priority-urgent-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
              color: 'var(--priority-urgent)',
              fontSize: '0.82rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{formatErrorMessage(authError)}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              background: 'var(--success-bg)',
              border: '1px solid var(--success-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
              color: 'var(--success)',
              fontSize: '0.82rem'
            }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form Card */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 20,
            boxShadow: 'var(--shadow-md)'
          }}>
            <form onSubmit={handleSubmit}>
              {mode === 'register' && (
                <div className="form-group">
                  <label className="form-label">
                    <User size={13} style={{ display: 'inline', marginRight: 4 }} />
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Sarah Connor"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">
                  <Mail size={13} style={{ display: 'inline', marginRight: 4 }} />
                  Email Address
                </label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Lock size={13} style={{ display: 'inline', marginRight: 4 }} />
                  Password
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
                style={{ marginTop: 18 }}
              >
                <span>{loading ? 'Authenticating...' : mode === 'login' ? 'Sign In to Workspace' : 'Create Account'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AuthPage;
