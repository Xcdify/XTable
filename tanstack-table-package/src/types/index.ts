// Main configuration interfaces
export type {
  AdvancedTableConfig,
  PerformanceOptions,
  TablePreset,
  ThemeOptions,
  DataManagementOptions,
  ExportOptions,
  AccessibilityOptions,
  ConfigValidationResult,
  ConfigValidationError,
  ConfigValidationWarning,
  ConfigValidationSuggestion,
  PresetBuilder,
} from './table-config';



// Default configurations
export {
  DEFAULT_PERFORMANCE_OPTIONS,
  DEFAULT_THEME_OPTIONS,
  DEFAULT_ACCESSIBILITY_OPTIONS,
} from './table-config';



// Validation utilities
export {
  ConfigValidator,
  ValidationErrorCode,
  ValidationWarningCode,
  ValidationUtils,
  BuiltInValidationRules,
} from '../utils/validation';
export type {
  ValidationResult,
  ValidationRule,
} from '../utils/validation';

// Preset configurations
export {
  TABLE_PRESETS,
  getPreset,
  getPresetNames,
  getPresetFeatures,
} from '../config/presets';

// Export utilities
export {
  TableExportUtils,
  useTableExport,
  ExportConfigBuilder,
  CSVExportConfigBuilder,
  ExcelExportConfigBuilder,
  PrintExportConfigBuilder,
} from '../utils/export-utils';
export type {
  ExportFormat,
  ExportConfig,
  CSVExportConfig,
  ExcelExportConfig,
  PrintExportConfig,
  ExportResult,
} from '../utils/export-utils';

// Theme system types
export type {
  ThemeVariant,
  ColorScheme,
  ThemeCSSProperties,
  EnhancedThemeOptions,
  ComponentThemeOverrides,
  ThemePreset,
  ThemeContextValue,
  ThemeProviderProps,
} from './theme';

// Theme utilities
export {
  THEME_PRESETS,
  DEFAULT_THEME_PRESET,
  MINIMAL_THEME_PRESET,
  ENTERPRISE_THEME_PRESET,
  getThemePreset,
  getThemePresetNames,
  getThemeProperties,
  createCustomTheme,
} from '../config/theme-presets';

// Theme hooks
export {
  useTableTheme,
  useThemeProperties,
  useThemedStyles,
} from '../hooks/useTableTheme';

// Theme components
export {
  TableThemeProvider,
} from '../components/theme-provider';

export {
  ThemeSelector,
  CompactThemeSelector,
} from '../components/theme-selector';



// Re-export existing types for backward compatibility
export type { FeatureKey } from '../components/column-definitions';