"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  EnhancedThemeOptions, 
  ThemeContextValue, 
  ThemeVariant, 
  ColorScheme,
  ThemeCSSProperties,
  ThemePreset
} from "../types/theme";
import { 
  THEME_PRESETS, 
  getThemePreset, 
  getThemeProperties, 
  getThemePresetNames 
} from "../config/theme-presets";

// Create theme context
const TableThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface TableThemeProviderProps {
  children: ReactNode;
  initialTheme?: Partial<EnhancedThemeOptions>;
  enableSystemTheme?: boolean;
  storageKey?: string;
}

/**
 * Enhanced table theme provider that works alongside Next.js theme provider
 */
export function TableThemeProvider({ 
  children, 
  initialTheme = {},
  enableSystemTheme = true,
  storageKey = 'table-theme'
}: TableThemeProviderProps) {
  const [theme, setTheme] = useState<EnhancedThemeOptions>({
    variant: 'default',
    colorScheme: 'auto',
    enableTransitions: true,
    enableHoverEffects: true,
    enableFocusIndicators: true,
    ...initialTheme,
  });

  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsedTheme = JSON.parse(stored);
          setTheme(prev => ({ ...prev, ...parsedTheme }));
        } catch (error) {
          console.warn('Failed to parse stored theme:', error);
        }
      }
    }
  }, [storageKey]);

  // Save theme to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(theme));
    }
  }, [theme, storageKey]);

  // Apply CSS custom properties to document root
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      const cssProperties = getCSSProperties();
      
      Object.entries(cssProperties).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });

      // Apply theme classes
      if (theme.classNames?.table) {
        root.classList.add(`table-theme-${theme.variant}`);
      }

      return () => {
        // Cleanup on unmount
        Object.keys(cssProperties).forEach(property => {
          root.style.removeProperty(property);
        });
        root.classList.remove(`table-theme-${theme.variant}`);
      };
    }
  }, [theme]);

  const updateTheme = (options: Partial<EnhancedThemeOptions>) => {
    setTheme(prev => ({ ...prev, ...options }));
  };

  const setVariant = (variant: ThemeVariant) => {
    updateTheme({ variant });
  };

  const setColorScheme = (colorScheme: ColorScheme) => {
    updateTheme({ colorScheme });
  };

  const getCSSProperties = (): ThemeCSSProperties => {
    const preset = getThemePreset(theme.variant || 'default');
    if (!preset) {
      return getThemeProperties('default', theme.colorScheme === 'dark' ? 'dark' : 'light');
    }

    const baseProperties = getThemeProperties(
      theme.variant || 'default', 
      theme.colorScheme === 'dark' ? 'dark' : 'light'
    );

    // Merge with custom properties
    return {
      ...baseProperties,
      ...theme.customProperties,
    };
  };

  const getPreset = (variant: ThemeVariant): ThemePreset | undefined => {
    return getThemePreset(variant);
  };

  const contextValue: ThemeContextValue = {
    theme,
    updateTheme,
    setVariant,
    setColorScheme,
    getCSSProperties,
    getPreset,
    availablePresets: Object.values(THEME_PRESETS),
  };

  return (
    <TableThemeContext.Provider value={contextValue}>
      {children}
    </TableThemeContext.Provider>
  );
}

/**
 * Hook to use table theme context
 */
export function useTableTheme(): ThemeContextValue {
  const context = useContext(TableThemeContext);
  if (!context) {
    throw new Error('useTableTheme must be used within a TableThemeProvider');
  }
  return context;
}

/**
 * Combined theme provider that includes both Next.js and table themes
 */
interface Props {
  children: ReactNode;
  tableTheme?: Partial<EnhancedThemeOptions>;
}

export function ThemeProvider({ children, tableTheme }: Props) {
  return (
    <NextThemeProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem
      disableTransitionOnChange
    >
      <TableThemeProvider initialTheme={tableTheme}>
        {children}
      </TableThemeProvider>
    </NextThemeProvider>
  );
}
