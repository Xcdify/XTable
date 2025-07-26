/**
 * Enhanced theme system types for the table library
 */
/**
 * CSS custom properties for theming
 */
export interface ThemeCSSProperties {
    '--table-bg-primary': string;
    '--table-bg-secondary': string;
    '--table-bg-accent': string;
    '--table-text-primary': string;
    '--table-text-secondary': string;
    '--table-text-muted': string;
    '--table-border-color': string;
    '--table-border-hover': string;
    '--table-hover-bg': string;
    '--table-selected-bg': string;
    '--table-focus-ring': string;
    '--table-active-bg': string;
    '--table-header-bg': string;
    '--table-header-text': string;
    '--table-header-border': string;
    '--table-cell-padding': string;
    '--table-cell-border': string;
    '--table-button-bg': string;
    '--table-button-text': string;
    '--table-button-hover-bg': string;
    '--table-button-border': string;
    '--table-success-color': string;
    '--table-warning-color': string;
    '--table-error-color': string;
    '--table-info-color': string;
    '--table-font-family': string;
    '--table-font-size': string;
    '--table-font-weight': string;
    '--table-line-height': string;
    '--table-spacing-xs': string;
    '--table-spacing-sm': string;
    '--table-spacing-md': string;
    '--table-spacing-lg': string;
    '--table-spacing-xl': string;
    '--table-border-radius': string;
    '--table-border-radius-sm': string;
    '--table-border-radius-lg': string;
    '--table-shadow-sm': string;
    '--table-shadow-md': string;
    '--table-shadow-lg': string;
}
/**
 * Theme variant definitions
 */
export type ThemeVariant = 'default' | 'minimal' | 'enterprise' | 'compact' | 'spacious';
/**
 * Color scheme options
 */
export type ColorScheme = 'light' | 'dark' | 'auto';
/**
 * Component-specific theme overrides
 */
export interface ComponentThemeOverrides {
    table?: React.CSSProperties & Partial<ThemeCSSProperties>;
    header?: React.CSSProperties & Partial<ThemeCSSProperties>;
    cell?: React.CSSProperties & Partial<ThemeCSSProperties>;
    row?: React.CSSProperties & Partial<ThemeCSSProperties>;
    pagination?: React.CSSProperties & Partial<ThemeCSSProperties>;
    controls?: React.CSSProperties & Partial<ThemeCSSProperties>;
    filters?: React.CSSProperties & Partial<ThemeCSSProperties>;
    toolbar?: React.CSSProperties & Partial<ThemeCSSProperties>;
}
/**
 * Enhanced theme configuration
 */
export interface EnhancedThemeOptions {
    /** Theme variant */
    variant?: ThemeVariant;
    /** Color scheme */
    colorScheme?: ColorScheme;
    /** Custom CSS properties */
    customProperties?: Partial<ThemeCSSProperties>;
    /** Component-specific styling overrides */
    components?: ComponentThemeOverrides;
    /** Enable CSS transitions */
    enableTransitions?: boolean;
    /** Enable hover effects */
    enableHoverEffects?: boolean;
    /** Enable focus indicators */
    enableFocusIndicators?: boolean;
    /** Custom CSS class names */
    classNames?: {
        table?: string;
        header?: string;
        cell?: string;
        row?: string;
        pagination?: string;
        controls?: string;
    };
    /** Theme-specific configuration */
    themeConfig?: {
        /** Density setting for compact/spacious variants */
        density?: 'compact' | 'normal' | 'spacious';
        /** Border style preference */
        borderStyle?: 'none' | 'subtle' | 'prominent';
        /** Corner radius preference */
        cornerRadius?: 'none' | 'small' | 'medium' | 'large';
        /** Shadow preference */
        shadows?: 'none' | 'subtle' | 'prominent';
    };
}
/**
 * Theme preset definition
 */
export interface ThemePreset {
    /** Preset name */
    name: ThemeVariant;
    /** Preset description */
    description: string;
    /** CSS properties for this preset */
    properties: ThemeCSSProperties;
    /** Theme configuration */
    config: Partial<EnhancedThemeOptions['themeConfig']>;
    /** Recommended use cases */
    useCases?: string[];
    /** Compatible color schemes */
    compatibleSchemes?: ColorScheme[];
}
/**
 * Theme context value
 */
export interface ThemeContextValue {
    /** Current theme options */
    theme: EnhancedThemeOptions;
    /** Update theme options */
    updateTheme: (options: Partial<EnhancedThemeOptions>) => void;
    /** Set theme variant */
    setVariant: (variant: ThemeVariant) => void;
    /** Set color scheme */
    setColorScheme: (scheme: ColorScheme) => void;
    /** Get computed CSS properties */
    getCSSProperties: () => ThemeCSSProperties;
    /** Get theme preset */
    getPreset: (variant: ThemeVariant) => ThemePreset | undefined;
    /** Available theme presets */
    availablePresets: ThemePreset[];
}
/**
 * Theme provider props
 */
export interface ThemeProviderProps {
    /** Child components */
    children: React.ReactNode;
    /** Initial theme options */
    initialTheme?: Partial<EnhancedThemeOptions>;
    /** Available theme presets */
    presets?: ThemePreset[];
    /** Enable system theme detection */
    enableSystemTheme?: boolean;
    /** Storage key for persisting theme */
    storageKey?: string;
}
//# sourceMappingURL=theme.d.ts.map