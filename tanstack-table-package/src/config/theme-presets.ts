import { ThemePreset, ThemeCSSProperties } from '../types/theme';

/**
 * Default theme preset - balanced design suitable for most applications
 */
const defaultThemeProperties: ThemeCSSProperties = {
  // Color system
  '--table-bg-primary': '#ffffff',
  '--table-bg-secondary': '#f8fafc',
  '--table-bg-accent': '#f1f5f9',
  '--table-text-primary': '#1e293b',
  '--table-text-secondary': '#475569',
  '--table-text-muted': '#64748b',
  '--table-border-color': '#e2e8f0',
  '--table-border-hover': '#cbd5e1',
  
  // Interactive states
  '--table-hover-bg': '#f8fafc',
  '--table-selected-bg': '#dbeafe',
  '--table-focus-ring': '#3b82f6',
  '--table-active-bg': '#e0e7ff',
  
  // Header styling
  '--table-header-bg': '#f1f5f9',
  '--table-header-text': '#374151',
  '--table-header-border': '#d1d5db',
  
  // Cell styling
  '--table-cell-padding': '0.75rem',
  '--table-cell-border': '#e5e7eb',
  
  // Controls and buttons
  '--table-button-bg': '#3b82f6',
  '--table-button-text': '#ffffff',
  '--table-button-hover-bg': '#2563eb',
  '--table-button-border': '#3b82f6',
  
  // Status colors
  '--table-success-color': '#10b981',
  '--table-warning-color': '#f59e0b',
  '--table-error-color': '#ef4444',
  '--table-info-color': '#3b82f6',
  
  // Typography
  '--table-font-family': 'system-ui, -apple-system, sans-serif',
  '--table-font-size': '0.875rem',
  '--table-font-weight': '400',
  '--table-line-height': '1.5',
  
  // Spacing
  '--table-spacing-xs': '0.25rem',
  '--table-spacing-sm': '0.5rem',
  '--table-spacing-md': '0.75rem',
  '--table-spacing-lg': '1rem',
  '--table-spacing-xl': '1.5rem',
  
  // Border radius
  '--table-border-radius': '0.375rem',
  '--table-border-radius-sm': '0.25rem',
  '--table-border-radius-lg': '0.5rem',
  
  // Shadows
  '--table-shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  '--table-shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  '--table-shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
};

/**
 * Minimal theme preset - clean and simple design with minimal visual elements
 */
const minimalThemeProperties: ThemeCSSProperties = {
  // Color system
  '--table-bg-primary': '#ffffff',
  '--table-bg-secondary': '#ffffff',
  '--table-bg-accent': '#fafafa',
  '--table-text-primary': '#000000',
  '--table-text-secondary': '#666666',
  '--table-text-muted': '#999999',
  '--table-border-color': '#e0e0e0',
  '--table-border-hover': '#d0d0d0',
  
  // Interactive states
  '--table-hover-bg': '#fafafa',
  '--table-selected-bg': '#f0f0f0',
  '--table-focus-ring': '#000000',
  '--table-active-bg': '#e8e8e8',
  
  // Header styling
  '--table-header-bg': '#ffffff',
  '--table-header-text': '#000000',
  '--table-header-border': '#e0e0e0',
  
  // Cell styling
  '--table-cell-padding': '0.5rem',
  '--table-cell-border': 'transparent',
  
  // Controls and buttons
  '--table-button-bg': '#000000',
  '--table-button-text': '#ffffff',
  '--table-button-hover-bg': '#333333',
  '--table-button-border': '#000000',
  
  // Status colors
  '--table-success-color': '#22c55e',
  '--table-warning-color': '#eab308',
  '--table-error-color': '#ef4444',
  '--table-info-color': '#3b82f6',
  
  // Typography
  '--table-font-family': 'system-ui, -apple-system, sans-serif',
  '--table-font-size': '0.875rem',
  '--table-font-weight': '400',
  '--table-line-height': '1.4',
  
  // Spacing
  '--table-spacing-xs': '0.25rem',
  '--table-spacing-sm': '0.5rem',
  '--table-spacing-md': '0.75rem',
  '--table-spacing-lg': '1rem',
  '--table-spacing-xl': '1.5rem',
  
  // Border radius
  '--table-border-radius': '0',
  '--table-border-radius-sm': '0',
  '--table-border-radius-lg': '0',
  
  // Shadows
  '--table-shadow-sm': 'none',
  '--table-shadow-md': 'none',
  '--table-shadow-lg': 'none',
};

/**
 * Enterprise theme preset - professional design suitable for business applications
 */
const enterpriseThemeProperties: ThemeCSSProperties = {
  // Color system
  '--table-bg-primary': '#ffffff',
  '--table-bg-secondary': '#f7f8fc',
  '--table-bg-accent': '#eef2ff',
  '--table-text-primary': '#1f2937',
  '--table-text-secondary': '#4b5563',
  '--table-text-muted': '#6b7280',
  '--table-border-color': '#d1d5db',
  '--table-border-hover': '#9ca3af',
  
  // Interactive states
  '--table-hover-bg': '#f9fafb',
  '--table-selected-bg': '#dbeafe',
  '--table-focus-ring': '#2563eb',
  '--table-active-bg': '#bfdbfe',
  
  // Header styling
  '--table-header-bg': '#f3f4f6',
  '--table-header-text': '#111827',
  '--table-header-border': '#d1d5db',
  
  // Cell styling
  '--table-cell-padding': '1rem',
  '--table-cell-border': '#e5e7eb',
  
  // Controls and buttons
  '--table-button-bg': '#1f2937',
  '--table-button-text': '#ffffff',
  '--table-button-hover-bg': '#374151',
  '--table-button-border': '#1f2937',
  
  // Status colors
  '--table-success-color': '#059669',
  '--table-warning-color': '#d97706',
  '--table-error-color': '#dc2626',
  '--table-info-color': '#2563eb',
  
  // Typography
  '--table-font-family': '"Inter", system-ui, -apple-system, sans-serif',
  '--table-font-size': '0.875rem',
  '--table-font-weight': '500',
  '--table-line-height': '1.5',
  
  // Spacing
  '--table-spacing-xs': '0.25rem',
  '--table-spacing-sm': '0.5rem',
  '--table-spacing-md': '1rem',
  '--table-spacing-lg': '1.25rem',
  '--table-spacing-xl': '2rem',
  
  // Border radius
  '--table-border-radius': '0.25rem',
  '--table-border-radius-sm': '0.125rem',
  '--table-border-radius-lg': '0.375rem',
  
  // Shadows
  '--table-shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  '--table-shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06)',
  '--table-shadow-lg': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)',
};

/**
 * Dark theme variations for each preset
 */
const darkThemeOverrides: Partial<ThemeCSSProperties> = {
  '--table-bg-primary': '#1f2937',
  '--table-bg-secondary': '#111827',
  '--table-bg-accent': '#374151',
  '--table-text-primary': '#f9fafb',
  '--table-text-secondary': '#d1d5db',
  '--table-text-muted': '#9ca3af',
  '--table-border-color': '#4b5563',
  '--table-border-hover': '#6b7280',
  '--table-hover-bg': '#374151',
  '--table-selected-bg': '#1e40af',
  '--table-header-bg': '#374151',
  '--table-header-text': '#f9fafb',
  '--table-header-border': '#4b5563',
  '--table-cell-border': '#4b5563',
};

/**
 * Create dark theme properties by merging base properties with dark overrides
 */
function createDarkTheme(baseProperties: ThemeCSSProperties): ThemeCSSProperties {
  return { ...baseProperties, ...darkThemeOverrides };
}

/**
 * Default theme preset
 */
export const DEFAULT_THEME_PRESET: ThemePreset = {
  name: 'default',
  description: 'Balanced design suitable for most applications with modern styling and good contrast',
  properties: defaultThemeProperties,
  config: {
    density: 'normal',
    borderStyle: 'subtle',
    cornerRadius: 'medium',
    shadows: 'subtle',
  },
  useCases: [
    'General purpose applications',
    'Admin dashboards',
    'Data visualization tools',
    'Content management systems',
  ],
  compatibleSchemes: ['light', 'dark', 'auto'],
};

/**
 * Minimal theme preset
 */
export const MINIMAL_THEME_PRESET: ThemePreset = {
  name: 'minimal',
  description: 'Clean and simple design with minimal visual elements, focusing on content',
  properties: minimalThemeProperties,
  config: {
    density: 'compact',
    borderStyle: 'none',
    cornerRadius: 'none',
    shadows: 'none',
  },
  useCases: [
    'Documentation sites',
    'Simple data displays',
    'Minimalist applications',
    'Print-friendly layouts',
  ],
  compatibleSchemes: ['light', 'dark'],
};

/**
 * Enterprise theme preset
 */
export const ENTERPRISE_THEME_PRESET: ThemePreset = {
  name: 'enterprise',
  description: 'Professional design suitable for business applications with enhanced spacing and typography',
  properties: enterpriseThemeProperties,
  config: {
    density: 'spacious',
    borderStyle: 'prominent',
    cornerRadius: 'small',
    shadows: 'prominent',
  },
  useCases: [
    'Business applications',
    'Financial dashboards',
    'Enterprise software',
    'Professional reporting tools',
  ],
  compatibleSchemes: ['light', 'dark', 'auto'],
};

/**
 * All available theme presets
 */
export const THEME_PRESETS: Record<string, ThemePreset> = {
  default: DEFAULT_THEME_PRESET,
  minimal: MINIMAL_THEME_PRESET,
  enterprise: ENTERPRISE_THEME_PRESET,
};

/**
 * Get theme preset by name
 */
export function getThemePreset(name: string): ThemePreset | undefined {
  return THEME_PRESETS[name];
}

/**
 * Get all available theme preset names
 */
export function getThemePresetNames(): string[] {
  return Object.keys(THEME_PRESETS);
}

/**
 * Get theme properties with dark mode support
 */
export function getThemeProperties(
  presetName: string,
  colorScheme: 'light' | 'dark' = 'light'
): ThemeCSSProperties {
  const preset = getThemePreset(presetName);
  if (!preset) {
    return defaultThemeProperties;
  }
  
  return colorScheme === 'dark' 
    ? createDarkTheme(preset.properties)
    : preset.properties;
}

/**
 * Create custom theme properties by merging preset with overrides
 */
export function createCustomTheme(
  basePreset: string,
  overrides: Partial<ThemeCSSProperties>,
  colorScheme: 'light' | 'dark' = 'light'
): ThemeCSSProperties {
  const baseProperties = getThemeProperties(basePreset, colorScheme);
  return { ...baseProperties, ...overrides };
}