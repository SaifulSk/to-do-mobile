// Zenith Mobile — Theme Color Palettes Definition & Dynamic Runtime Engine

export interface Palette {
  id: string;
  name: string;
  label: string;
  primary: string;
  primaryHover: string;
  dark: {
    bgApp: string;
    bgSurface: string;
    bgSurfaceElevated: string;
  };
  light: {
    bgApp: string;
    bgSurface: string;
    bgSurfaceElevated: string;
  };
}

export const PALETTES: Palette[] = [
  {
    id: 'emerald',
    name: 'Emerald',
    label: 'Emerald Green',
    primary: '#10b981',
    primaryHover: '#059669',
    dark: {
      bgApp: '#080f0a',
      bgSurface: '#101a13',
      bgSurfaceElevated: '#16241b',
    },
    light: {
      bgApp: '#f0fdf4',
      bgSurface: '#ffffff',
      bgSurfaceElevated: '#f4fbf6',
    }
  },
  {
    id: 'forest',
    name: 'Forest',
    label: 'Forest Pine',
    primary: '#059669',
    primaryHover: '#047857',
    dark: {
      bgApp: '#070e0a',
      bgSurface: '#0d1912',
      bgSurfaceElevated: '#14251b',
    },
    light: {
      bgApp: '#ecfdf5',
      bgSurface: '#ffffff',
      bgSurfaceElevated: '#e6fcf2',
    }
  },
  {
    id: 'sapphire',
    name: 'Sapphire',
    label: 'Sapphire Blue',
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    dark: {
      bgApp: '#080d1a',
      bgSurface: '#0f172a',
      bgSurfaceElevated: '#1e293b',
    },
    light: {
      bgApp: '#eff6ff',
      bgSurface: '#ffffff',
      bgSurfaceElevated: '#f0f7ff',
    }
  },
  {
    id: 'cobalt',
    name: 'Cobalt',
    label: 'Cobalt Sky',
    primary: '#0284c7',
    primaryHover: '#0369a1',
    dark: {
      bgApp: '#070e17',
      bgSurface: '#0c1a29',
      bgSurfaceElevated: '#13273c',
    },
    light: {
      bgApp: '#f0f9ff',
      bgSurface: '#ffffff',
      bgSurfaceElevated: '#e0f2fe',
    }
  },
  {
    id: 'amethyst',
    name: 'Amethyst',
    label: 'Amethyst Purple',
    primary: '#8b5cf6',
    primaryHover: '#7c3aed',
    dark: {
      bgApp: '#0f0a1a',
      bgSurface: '#1a102a',
      bgSurfaceElevated: '#26173d',
    },
    light: {
      bgApp: '#faf5ff',
      bgSurface: '#ffffff',
      bgSurfaceElevated: '#f6efff',
    }
  },
  {
    id: 'rose',
    name: 'Rose',
    label: 'Rose Crimson',
    primary: '#f43f5e',
    primaryHover: '#e11d48',
    dark: {
      bgApp: '#14080c',
      bgSurface: '#200e14',
      bgSurfaceElevated: '#2d141d',
    },
    light: {
      bgApp: '#fff1f2',
      bgSurface: '#ffffff',
      bgSurfaceElevated: '#ffe7e9',
    }
  },
  {
    id: 'amber',
    name: 'Amber',
    label: 'Amber Gold',
    primary: '#f59e0b',
    primaryHover: '#d97706',
    dark: {
      bgApp: '#140e08',
      bgSurface: '#20160d',
      bgSurfaceElevated: '#2d1f13',
    },
    light: {
      bgApp: '#fffbeb',
      bgSurface: '#ffffff',
      bgSurfaceElevated: '#fef3c7',
    }
  },
  {
    id: 'indigo',
    name: 'Indigo',
    label: 'Midnight Indigo',
    primary: '#6366f1',
    primaryHover: '#4f46e5',
    dark: {
      bgApp: '#0a0a16',
      bgSurface: '#121226',
      bgSurfaceElevated: '#1b1b38',
    },
    light: {
      bgApp: '#eef2ff',
      bgSurface: '#ffffff',
      bgSurfaceElevated: '#f5f7ff',
    }
  }
];

export const DEFAULT_PALETTE_ID = 'emerald';

export function hexToRgb(hex: string) {
  if (!hex || typeof hex !== 'string') return { r: 16, g: 185, b: 129 };
  let c = hex.replace('#', '').trim();
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return { r: 16, g: 185, b: 129 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

export function shadeColor(color: string, percent: number) {
  const { r, g, b } = hexToRgb(color);
  const factor = (100 + percent) / 100;
  const newR = Math.min(255, Math.max(0, Math.round(r * factor)));
  const newG = Math.min(255, Math.max(0, Math.round(g * factor)));
  const newB = Math.min(255, Math.max(0, Math.round(b * factor)));
  return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1)}`;
}

export function applyThemePalette(paletteOrHex: string, currentTheme: 'dark' | 'light' = 'dark') {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  const preset = PALETTES.find(p => p.id === paletteOrHex);
  let primary: string, primaryHover: string, r: number, g: number, b: number;
  let bgApp: string, bgSurface: string, bgSurfaceElevated: string;

  if (preset) {
    primary = preset.primary;
    primaryHover = preset.primaryHover;
    const rgb = hexToRgb(primary);
    r = rgb.r;
    g = rgb.g;
    b = rgb.b;
    const modeColors = currentTheme === 'dark' ? preset.dark : preset.light;
    bgApp = modeColors.bgApp;
    bgSurface = modeColors.bgSurface;
    bgSurfaceElevated = modeColors.bgSurfaceElevated;
  } else {
    primary = paletteOrHex.startsWith('#') ? paletteOrHex : `#${paletteOrHex}`;
    const rgb = hexToRgb(primary);
    r = rgb.r;
    g = rgb.g;
    b = rgb.b;
    primaryHover = shadeColor(primary, -15);

    if (currentTheme === 'dark') {
      bgApp = `rgb(${Math.max(8, Math.round(r * 0.06))}, ${Math.max(10, Math.round(g * 0.06))}, ${Math.max(14, Math.round(b * 0.06))})`;
      bgSurface = `rgb(${Math.max(16, Math.round(r * 0.11))}, ${Math.max(20, Math.round(g * 0.11))}, ${Math.max(26, Math.round(b * 0.11))})`;
      bgSurfaceElevated = `rgb(${Math.max(24, Math.round(r * 0.16))}, ${Math.max(30, Math.round(g * 0.16))}, ${Math.max(40, Math.round(b * 0.16))})`;
    } else {
      bgApp = `rgb(${Math.min(255, 246 + Math.round(r * 0.03))}, ${Math.min(255, 248 + Math.round(g * 0.03))}, ${Math.min(255, 250 + Math.round(b * 0.03))})`;
      bgSurface = '#ffffff';
      bgSurfaceElevated = `rgb(${Math.min(255, 242 + Math.round(r * 0.04))}, ${Math.min(255, 244 + Math.round(g * 0.04))}, ${Math.min(255, 248 + Math.round(b * 0.04))})`;
    }
  }

  // Set CSS Variables on document root
  root.style.setProperty('--primary', primary);
  root.style.setProperty('--primary-hover', primaryHover);
  root.style.setProperty('--primary-light', `rgba(${r}, ${g}, ${b}, 0.16)`);
  root.style.setProperty('--primary-glow', `rgba(${r}, ${g}, ${b}, 0.25)`);
  root.style.setProperty('--primary-border', `rgba(${r}, ${g}, ${b}, 0.35)`);
  root.style.setProperty('--border-focus', primary);

  // Ionic specific theme variable injection
  root.style.setProperty('--ion-color-primary', primary);
  root.style.setProperty('--ion-color-primary-rgb', `${r},${g},${b}`);
  root.style.setProperty('--ion-color-primary-contrast', '#ffffff');
  root.style.setProperty('--ion-color-primary-shade', primaryHover);
  root.style.setProperty('--ion-color-primary-tint', `rgba(${r},${g},${b}, 0.8)`);

  root.style.setProperty('--bg-hover', `rgba(${r}, ${g}, ${b}, 0.08)`);
  root.style.setProperty('--bg-active', `rgba(${r}, ${g}, ${b}, 0.16)`);

  root.style.setProperty('--assignee-accent', primary);
  root.style.setProperty('--assignee-accent-bg', `rgba(${r}, ${g}, ${b}, 0.14)`);

  root.style.setProperty('--marker-created', primary);
  root.style.setProperty('--marker-created-bg', `rgba(${r}, ${g}, ${b}, 0.18)`);

  if (bgApp) {
    root.style.setProperty('--bg-app', bgApp);
    root.style.setProperty('--ion-background-color', bgApp);
  }
  if (bgSurface) {
    root.style.setProperty('--bg-surface', bgSurface);
    root.style.setProperty('--bg-glass', bgSurface);
    root.style.setProperty('--bg-glass-card', bgSurface);
    root.style.setProperty('--ion-card-background', bgSurface);
    root.style.setProperty('--ion-toolbar-background', bgSurface);
    root.style.setProperty('--ion-item-background', bgSurface);
  }
  if (bgSurfaceElevated) {
    root.style.setProperty('--bg-surface-elevated', bgSurfaceElevated);
  }
}
