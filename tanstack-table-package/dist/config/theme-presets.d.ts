import { ThemePreset, ThemeCSSProperties } from '../types/theme';
/**
 * Default theme preset
 */
export declare const DEFAULT_THEME_PRESET: ThemePreset;
/**
 * Minimal theme preset
 */
export declare const MINIMAL_THEME_PRESET: ThemePreset;
/**
 * Enterprise theme preset
 */
export declare const ENTERPRISE_THEME_PRESET: ThemePreset;
/**
 * All available theme presets
 */
export declare const THEME_PRESETS: Record<string, ThemePreset>;
/**
 * Get theme preset by name
 */
export declare function getThemePreset(name: string): ThemePreset | undefined;
/**
 * Get all available theme preset names
 */
export declare function getThemePresetNames(): string[];
/**
 * Get theme properties with dark mode support
 */
export declare function getThemeProperties(presetName: string, colorScheme?: 'light' | 'dark'): ThemeCSSProperties;
/**
 * Create custom theme properties by merging preset with overrides
 */
export declare function createCustomTheme(basePreset: string, overrides: Partial<ThemeCSSProperties>, colorScheme?: 'light' | 'dark'): ThemeCSSProperties;
//# sourceMappingURL=theme-presets.d.ts.map