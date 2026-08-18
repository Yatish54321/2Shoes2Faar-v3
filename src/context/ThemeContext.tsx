import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode } from '../types';

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const THEME_MODE_KEY = '2shoes_theme_mode';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_MODE_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
      // Optional check for system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // ignore
    }
    return 'light';
  });

  // Apply theme classes and CSS variables directly to DOM
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.setProperty('--bg-canvas', '#12100E');
      root.style.setProperty('--bg-card', '#1C1917');
      root.style.setProperty('--text-primary', '#FAF8F5');
      root.style.setProperty('--text-secondary', '#E7E5E4');
      root.style.setProperty('--text-muted', '#A8A29E');
      root.style.setProperty('--accent-color', '#F97316');
      root.style.setProperty('--accent-secondary', '#FBBF24');
      root.style.setProperty('--border-color', '#2E2A27');
      root.style.backgroundColor = '#12100E';
      root.style.color = '#FAF8F5';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.setProperty('--bg-canvas', '#FAF8F5');
      root.style.setProperty('--bg-card', '#FFFFFF');
      root.style.setProperty('--text-primary', '#1C1917');
      root.style.setProperty('--text-secondary', '#44403C');
      root.style.setProperty('--text-muted', '#78716C');
      root.style.setProperty('--accent-color', '#C2410C');
      root.style.setProperty('--accent-secondary', '#D97706');
      root.style.setProperty('--border-color', '#E7E2DA');
      root.style.backgroundColor = '#FAF8F5';
      root.style.color = '#1C1917';
    }

    try {
      localStorage.setItem(THEME_MODE_KEY, theme);
    } catch (e) {
      console.warn('Failed to persist theme state', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        toggleTheme,
        setTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

