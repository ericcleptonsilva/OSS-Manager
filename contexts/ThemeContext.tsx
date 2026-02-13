import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // 1. Check new key first
    const savedTheme = localStorage.getItem('oss_theme');
    if (savedTheme) {
      return JSON.parse(savedTheme);
    }

    // 2. Migration: Check old key
    const oldPrefs = localStorage.getItem('oss_manager_ui_prefs');
    if (oldPrefs) {
      try {
        const parsed = JSON.parse(oldPrefs);
        // Only return if it explicitly had darkMode property
        if (typeof parsed.darkMode === 'boolean') {
          return parsed.darkMode;
        }
      } catch (e) {
        console.error("Error migrating theme preference", e);
      }
    }

    // 3. Default
    return false;
  });

  useEffect(() => {
    localStorage.setItem('oss_theme', JSON.stringify(darkMode));

    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
