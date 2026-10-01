import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  PALETTES, 
  DEFAULT_PALETTE_ID, 
  applyThemePalette,
  Palette 
} from '../services/themePalettes';
import { getUserPreferences, saveUserPreferences } from '../services/firebase';

interface ThemeContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  currentPalette: string;
  setAccountPalette: (id: string) => Promise<void>;
  availablePalettes: Palette[];
  isSavingPalette: boolean;
  defaultView: 'list' | 'table' | 'compact' | 'calendar';
  setDefaultView: (view: 'list' | 'table' | 'compact' | 'calendar') => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('zenith_theme') as 'dark' | 'light') || 'dark';
  });

  const [currentPalette, setCurrentPalette] = useState<string>(() => {
    return localStorage.getItem('zenith_current_palette') || DEFAULT_PALETTE_ID;
  });

  const [isSavingPalette, setIsSavingPalette] = useState(false);

  const [defaultView, setDefaultView] = useState<'list' | 'table' | 'compact' | 'calendar'>(() => {
    return (localStorage.getItem('zenith_default_view') as any) || 'list';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('ion-palette-dark', theme === 'dark');
    localStorage.setItem('zenith_theme', theme);
    applyThemePalette(currentPalette, theme);
  }, [theme, currentPalette]);

  useEffect(() => {
    if (!currentUser) {
      const general = localStorage.getItem('zenith_current_palette') || DEFAULT_PALETTE_ID;
      setCurrentPalette(general);
      applyThemePalette(general, theme);

      const generalView = (localStorage.getItem('zenith_default_view') as any) || 'list';
      setDefaultView(generalView);
      return;
    }

    const userKey = `zenith_palette_${currentUser.uid}`;
    const cachedUserPalette = localStorage.getItem(userKey);

    if (cachedUserPalette) {
      setCurrentPalette(cachedUserPalette);
      applyThemePalette(cachedUserPalette, theme);
    }

    const viewKey = `zenith_default_view_${currentUser.uid}`;
    const cachedUserView = localStorage.getItem(viewKey) as 'list' | 'table' | 'compact' | 'calendar';
    if (cachedUserView) {
      setDefaultView(cachedUserView);
    }

    let isCancelled = false;
    getUserPreferences(currentUser.uid).then((prefs) => {
      if (isCancelled || !prefs) return;
      if (prefs.palette && prefs.palette !== cachedUserPalette) {
        setCurrentPalette(prefs.palette);
        localStorage.setItem(userKey, prefs.palette);
        localStorage.setItem('zenith_current_palette', prefs.palette);
        applyThemePalette(prefs.palette, theme);
      }
      if (prefs.defaultView && prefs.defaultView !== cachedUserView) {
        setDefaultView(prefs.defaultView as any);
        localStorage.setItem(viewKey, prefs.defaultView);
        localStorage.setItem('zenith_default_view', prefs.defaultView);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [currentUser, theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setAccountPalette = useCallback(async (paletteId: string) => {
    if (!paletteId) return;

    setCurrentPalette(paletteId);
    localStorage.setItem('zenith_current_palette', paletteId);
    applyThemePalette(paletteId, theme);

    if (currentUser?.uid) {
      setIsSavingPalette(true);
      const userKey = `zenith_palette_${currentUser.uid}`;
      localStorage.setItem(userKey, paletteId);
      
      try {
        await saveUserPreferences(currentUser.uid, { palette: paletteId });
      } catch (err) {
        console.warn('Could not persist palette to Firestore:', err);
      } finally {
        setTimeout(() => setIsSavingPalette(false), 800);
      }
    }
  }, [currentUser, theme]);

  const setAccountDefaultView = useCallback(async (view: 'list' | 'table' | 'compact' | 'calendar') => {
    if (!view) return;

    setDefaultView(view);
    localStorage.setItem('zenith_default_view', view);

    if (currentUser?.uid) {
      const viewKey = `zenith_default_view_${currentUser.uid}`;
      localStorage.setItem(viewKey, view);
      
      try {
        await saveUserPreferences(currentUser.uid, { defaultView: view });
      } catch (err) {
        console.warn('Could not persist defaultView to Firestore:', err);
      }
    }
  }, [currentUser]);

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    currentPalette,
    setAccountPalette,
    availablePalettes: PALETTES,
    isSavingPalette,
    defaultView,
    setDefaultView: setAccountDefaultView
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
