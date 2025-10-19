'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // If no saved theme, default to system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    // Save theme to localStorage
    localStorage.setItem('theme', theme);

    // Determine resolved theme
    let resolved: 'light' | 'dark' = 'light';
    
    if (theme === 'dark') {
      resolved = 'dark';
    } else if (theme === 'light') {
      resolved = 'light';
    } else {
      // System theme
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    setResolvedTheme(resolved);

    // Apply theme to document
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolved);

    // Update CSS variables
    if (resolved === 'dark') {
      root.style.setProperty('--background', '#0a0a0a');
      root.style.setProperty('--foreground', '#ededed');
      root.style.setProperty('--card', '#1a1a1a');
      root.style.setProperty('--card-foreground', '#ededed');
      root.style.setProperty('--primary', '#3b82f6');
      root.style.setProperty('--primary-foreground', '#ffffff');
      root.style.setProperty('--secondary', '#262626');
      root.style.setProperty('--secondary-foreground', '#fafafa');
      root.style.setProperty('--muted', '#171717');
      root.style.setProperty('--muted-foreground', '#a3a3a3');
      root.style.setProperty('--border', '#404040');
      root.style.setProperty('--input', '#404040');
      root.style.setProperty('--ring', '#3b82f6');
    } else {
      root.style.setProperty('--background', '#ffffff');
      root.style.setProperty('--foreground', '#171717');
      root.style.setProperty('--card', '#ffffff');
      root.style.setProperty('--card-foreground', '#171717');
      root.style.setProperty('--primary', '#3b82f6');
      root.style.setProperty('--primary-foreground', '#ffffff');
      root.style.setProperty('--secondary', '#f1f5f9');
      root.style.setProperty('--secondary-foreground', '#0f172a');
      root.style.setProperty('--muted', '#f8fafc');
      root.style.setProperty('--muted-foreground', '#64748b');
      root.style.setProperty('--border', '#e2e8f0');
      root.style.setProperty('--input', '#e2e8f0');
      root.style.setProperty('--ring', '#3b82f6');
    }
  }, [theme]);

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const resolved = mediaQuery.matches ? 'dark' : 'light';
        setResolvedTheme(resolved);
        
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(resolved);

        if (resolved === 'dark') {
          root.style.setProperty('--background', '#0a0a0a');
          root.style.setProperty('--foreground', '#ededed');
          root.style.setProperty('--card', '#1a1a1a');
          root.style.setProperty('--card-foreground', '#ededed');
          root.style.setProperty('--primary', '#3b82f6');
          root.style.setProperty('--primary-foreground', '#ffffff');
          root.style.setProperty('--secondary', '#262626');
          root.style.setProperty('--secondary-foreground', '#fafafa');
          root.style.setProperty('--muted', '#171717');
          root.style.setProperty('--muted-foreground', '#a3a3a3');
          root.style.setProperty('--border', '#404040');
          root.style.setProperty('--input', '#404040');
          root.style.setProperty('--ring', '#3b82f6');
        } else {
          root.style.setProperty('--background', '#ffffff');
          root.style.setProperty('--foreground', '#171717');
          root.style.setProperty('--card', '#ffffff');
          root.style.setProperty('--card-foreground', '#171717');
          root.style.setProperty('--primary', '#3b82f6');
          root.style.setProperty('--primary-foreground', '#ffffff');
          root.style.setProperty('--secondary', '#f1f5f9');
          root.style.setProperty('--secondary-foreground', '#0f172a');
          root.style.setProperty('--muted', '#f8fafc');
          root.style.setProperty('--muted-foreground', '#64748b');
          root.style.setProperty('--border', '#e2e8f0');
          root.style.setProperty('--input', '#e2e8f0');
          root.style.setProperty('--ring', '#3b82f6');
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}