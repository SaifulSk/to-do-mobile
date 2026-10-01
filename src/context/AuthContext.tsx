import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  isConfigured as isFirebaseLive, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from '../services/firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  isFirebaseConnected: boolean;
  loading: boolean;
  authError: string | null;
  setAuthError: (err: string | null) => void;
  login: (email: string, pass: string) => Promise<any>;
  register: (email: string, pass: string, displayName?: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseLive || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'Zenith User',
          photoURL: user.photoURL
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithFirebase = async (email: string, pass: string) => {
    setAuthError(null);
    if (!isFirebaseLive || !auth) {
      throw new Error('Firebase is not initialized.');
    }
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      return res.user;
    } catch (err: any) {
      setAuthError(err.message);
      throw err;
    }
  };

  const registerWithFirebase = async (email: string, pass: string, displayName?: string) => {
    setAuthError(null);
    if (!isFirebaseLive || !auth) {
      throw new Error('Firebase is not initialized.');
    }
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (displayName && res.user) {
        await updateProfile(res.user, { displayName });
      }
      return res.user;
    } catch (err: any) {
      setAuthError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    setAuthError(null);
    if (isFirebaseLive && auth) {
      await signOut(auth);
    }
    setCurrentUser(null);
  };

  const value: AuthContextType = {
    currentUser,
    isFirebaseConnected: isFirebaseLive,
    loading,
    authError,
    setAuthError,
    login: loginWithFirebase,
    register: registerWithFirebase,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
