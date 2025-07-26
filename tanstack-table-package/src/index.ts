// Main component export
export { ReusableAdvancedTable } from './components/ReusableAdvancedTable';
export type { ReusableAdvancedTableProps, TableFeatures, FeatureKey, PerformanceConfig } from './components/ReusableAdvancedTable';

// Component exports
export { TableControls } from './components/table-controls';
export { EnhancedTableView } from './components/enhanced-table-view';
export { VirtualizedTableView } from './components/virtualized-table-view';
export { DragDropArea } from './components/drag-drop-area';
export { ThemeSelector } from './components/theme-selector';
export { PresetSelector } from './components/PresetSelector';

// Cell components
export * from './components/cells';

// Column utilities
export {
  createUtilityColumns,
  createTextColumn,
  createNumberColumn,
  createCurrencyColumn,
  createDateColumn,
  createSelectColumn
} from './components/column-definitions';

// Hooks
export { useTablePerformance, useDebounce } from './utils/performance';
export { useTableTheme } from './hooks/useTableTheme';
export { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
export { useTablePresets } from './hooks/useTablePresets';
export { useAdvancedTable } from './hooks/useAdvancedTable';

// Types
export type * from './types/theme';
export type * from './types/table-config';
export type * from './types/index';

// Configuration
export { getPreset } from './config/table-presets';
export type { TablePreset } from './config/table-presets';

// Utils
export * from './utils/export-utils';
export * from './utils/validation';
export * from './utils/column-helpers';

// Sample data for testing (optional)
export { defaultData } from './data/sample-data';