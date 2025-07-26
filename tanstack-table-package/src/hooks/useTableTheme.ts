import { useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { 
  EnhancedThemeOptions, 
  ThemeVariant, 
  ColorScheme,
  ThemeCSSProperties 
} from '../types/theme';
import { 
  getThemeProperties, 
  createCustomTheme,
  getThemePreset 
} from '../config/theme-presets';

/**
 * Hook for managing table theme with Next.js theme integration
 */
export function useTableTheme(options: Partial<EnhancedThemeOptions> = {}) {
  let systemTheme = 'light';
  let setSystemTheme: (theme: string) => void = () => {};
  
  try {
    const themeHook = useTheme();
    systemTheme = themeHook.theme || 'light';
    setSystemTheme = themeHook.setTheme || (() => {});
  } catch (error) {
    console.warn('next-themes not properly configured, falling back to light theme');
  }
  
  // Determine effective color scheme
  const effectiveColorScheme: ColorScheme = useMemo(() => {
    if (options.colorScheme === 'auto') {
      return systemTheme === 'dark' ? 'dark' : 'light';
    }
    return options.colorScheme || 'light';
  }, [options.colorScheme, systemTheme]);

  // Get theme properties
  const themeProperties = useMemo(() => {
    const variant = options.variant || 'default';
    const baseProperties = getThemeProperties(variant, effectiveColorScheme);
    
    // Merge with custom properties
    return {
      ...baseProperties,
      ...options.customProperties,
    };
  }, [options.variant, effectiveColorScheme, options.customProperties]);

  // Generate CSS class names
  const classNames = useMemo(() => {
    const variant = options.variant || 'default';
    const preset = getThemePreset(variant);
    const density = options.themeConfig?.density || preset?.config?.density || 'normal';
    
    return {
      table: [
        'table-themed',
        `table-theme-${variant}`,
        `table-density-${density}`,
        options.enableTransitions !== false && 'table-transitions',
        options.enableHoverEffects !== false && 'table-hover-effects',
        options.enableFocusIndicators !== false && 'table-focus-indicators',
        options.classNames?.table,
      ].filter(Boolean).join(' '),
      
      header: [
        'table-header',
        options.classNames?.header,
      ].filter(Boolean).join(' '),
      
      cell: [
        'table-cell',
        options.classNames?.cell,
      ].filter(Boolean).join(' '),
      
      row: [
        'table-row',
        options.classNames?.row,
      ].filter(Boolean).join(' '),
      
      pagination: [
        'table-pagination',
        options.classNames?.pagination,
      ].filter(Boolean).join(' '),
      
      controls: [
        'table-controls',
        options.classNames?.controls,
      ].filter(Boolean).join(' '),
    };
  }, [options]);

  // Generate inline styles for components
  const styles = useMemo(() => {
    return {
      table: {
        ...options.components?.table,
        // Apply theme properties as CSS custom properties
        ...Object.fromEntries(
          Object.entries(themeProperties).map(([key, value]) => [key, value])
        ),
      },
      header: options.components?.header || {},
      cell: options.components?.cell || {},
      row: options.components?.row || {},
      pagination: options.components?.pagination || {},
      controls: options.components?.controls || {},
    };
  }, [themeProperties, options.components]);

  // Apply global CSS custom properties
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      
      Object.entries(themeProperties).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });

      return () => {
        // Cleanup on unmount
        Object.keys(themeProperties).forEach(property => {
          root.style.removeProperty(property);
        });
      };
    }
  }, [themeProperties]);

  // Theme control functions
  const setVariant = (variant: ThemeVariant) => {
    // This would typically update a parent state or context
    // For now, we'll just log the change
    console.log('Theme variant changed to:', variant);
  };

  const setColorScheme = (scheme: ColorScheme) => {
    if (scheme === 'auto') {
      setSystemTheme('system');
    } else {
      setSystemTheme(scheme);
    }
  };

  const toggleColorScheme = () => {
    const newScheme = effectiveColorScheme === 'light' ? 'dark' : 'light';
    setColorScheme(newScheme);
  };

  return {
    // Current theme state
    variant: options.variant || 'default',
    colorScheme: effectiveColorScheme,
    properties: themeProperties,
    
    // CSS utilities
    classNames,
    styles,
    
    // Theme controls
    setVariant,
    setColorScheme,
    toggleColorScheme,
    
    // Utility functions
    getThemeProperty: (property: keyof ThemeCSSProperties) => themeProperties[property],
    createCustomTheme: (overrides: Partial<ThemeCSSProperties>) => 
      createCustomTheme(options.variant || 'default', overrides, effectiveColorScheme),
  };
}

/**
 * Hook for getting theme-aware CSS properties
 */
export function useThemeProperties(variant: ThemeVariant = 'default', colorScheme?: ColorScheme) {
  const { theme: systemTheme } = useTheme();
  
  return useMemo(() => {
    let effectiveScheme: 'light' | 'dark' = 'light';
    
    if (colorScheme === 'dark') {
      effectiveScheme = 'dark';
    } else if (colorScheme === 'light') {
      effectiveScheme = 'light';
    } else {
      // colorScheme is 'auto' or undefined
      effectiveScheme = systemTheme === 'dark' ? 'dark' : 'light';
    }
    
    return getThemeProperties(variant, effectiveScheme);
  }, [variant, colorScheme, systemTheme]);
}

/**
 * Hook for theme-aware component styling
 */
export function useThemedStyles(
  baseStyles: React.CSSProperties = {},
  themeOverrides: Partial<ThemeCSSProperties> = {}
) {
  const { properties } = useTableTheme();
  
  return useMemo(() => {
    const themedProperties = { ...properties, ...themeOverrides };
    
    // Convert CSS custom properties to actual values
    const resolvedStyles: React.CSSProperties = {};
    
    Object.entries(baseStyles).forEach(([key, value]) => {
      if (typeof value === 'string' && value.startsWith('var(--table-')) {
        const propertyName = value.slice(4, -1) as keyof ThemeCSSProperties;
        (resolvedStyles as any)[key] = themedProperties[propertyName];
      } else {
        (resolvedStyles as any)[key] = value;
      }
    });
    
    return resolvedStyles;
  }, [baseStyles, themeOverrides, properties]);
}