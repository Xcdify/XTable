import { TableFeatures } from "../components/ReusableAdvancedTable";

export interface TablePreset {
  name: string;
  description: string;
  features: TableFeatures;
  performanceConfig?: {
    debounceDelay?: number;
    enableMemoization?: boolean;
    enablePerformanceLogging?: boolean;
    virtualizationThreshold?: number;
  };
  theme?: {
    variant?: 'default' | 'minimal' | 'enterprise' | 'compact' | 'spacious';
    colorScheme?: 'light' | 'dark' | 'auto';
  };
  initialState?: {
    pagination?: {
      pageIndex: number;
      pageSize: number;
    };
  };
}

/**
 * Predefined table presets for common use cases
 */
export const TABLE_PRESETS: Record<string, TablePreset> = {
  basic: {
    name: "Basic Table",
    description: "Simple table with sorting and pagination",
    features: {
      sorting: true,
      pagination: true,
      filtering: false,
      rowSelection: false,
      columnVisibility: false,
      columnResizing: false,
      columnPinning: false,
      rowExpansion: false,
      globalFiltering: false,
      grouping: false,
      inlineEditing: false,
      pivoting: false,
      virtualization: false,
      exporting: false,
    },
    theme: {
      variant: 'default',
      colorScheme: 'auto',
    },
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  },

  standard: {
    name: "Standard Table",
    description: "Full-featured table for most use cases",
    features: {
      sorting: true,
      pagination: true,
      filtering: true,
      rowSelection: true,
      columnVisibility: true,
      columnResizing: true,
      columnPinning: false,
      rowExpansion: false,
      globalFiltering: true,
      grouping: false,
      inlineEditing: false,
      pivoting: false,
      virtualization: false,
      exporting: true,
    },
    performanceConfig: {
      debounceDelay: 300,
      enableMemoization: true,
      enablePerformanceLogging: false,
    },
    theme: {
      variant: 'default',
      colorScheme: 'auto',
    },
    initialState: {
      pagination: { pageIndex: 0, pageSize: 20 },
    },
  },

  advanced: {
    name: "Advanced Table",
    description: "Table with all features enabled for power users",
    features: {
      sorting: true,
      pagination: true,
      filtering: true,
      rowSelection: true,
      columnVisibility: true,
      columnResizing: true,
      columnPinning: true,
      rowExpansion: true,
      globalFiltering: true,
      grouping: true,
      inlineEditing: false,
      pivoting: false,
      virtualization: false,
      exporting: true,
    },
    performanceConfig: {
      debounceDelay: 250,
      enableMemoization: true,
      enablePerformanceLogging: false,
    },
    theme: {
      variant: 'enterprise',
      colorScheme: 'auto',
    },
    initialState: {
      pagination: { pageIndex: 0, pageSize: 25 },
    },
  },

  dataEntry: {
    name: "Data Entry Table",
    description: "Table optimized for data entry and editing",
    features: {
      sorting: true,
      pagination: true,
      filtering: true,
      rowSelection: true,
      columnVisibility: false,
      columnResizing: true,
      columnPinning: false,
      rowExpansion: false,
      globalFiltering: true,
      grouping: false,
      inlineEditing: true,
      pivoting: false,
      virtualization: false,
      exporting: true,
    },
    performanceConfig: {
      debounceDelay: 200,
      enableMemoization: true,
      enablePerformanceLogging: false,
    },
    theme: {
      variant: 'compact',
      colorScheme: 'auto',
    },
    initialState: {
      pagination: { pageIndex: 0, pageSize: 15 },
    },
  },

  analytics: {
    name: "Analytics Table",
    description: "Table for data analysis with grouping and pivoting",
    features: {
      sorting: true,
      pagination: true,
      filtering: true,
      rowSelection: true,
      columnVisibility: true,
      columnResizing: true,
      columnPinning: true,
      rowExpansion: true,
      globalFiltering: true,
      grouping: true,
      inlineEditing: false,
      pivoting: true,
      virtualization: false,
      exporting: true,
    },
    performanceConfig: {
      debounceDelay: 300,
      enableMemoization: true,
      enablePerformanceLogging: false,
    },
    theme: {
      variant: 'spacious',
      colorScheme: 'auto',
    },
    initialState: {
      pagination: { pageIndex: 0, pageSize: 50 },
    },
  },

  minimal: {
    name: "Minimal Table",
    description: "Clean, minimal table for simple data display",
    features: {
      sorting: true,
      pagination: true,
      filtering: false,
      rowSelection: false,
      columnVisibility: false,
      columnResizing: false,
      columnPinning: false,
      rowExpansion: false,
      globalFiltering: false,
      grouping: false,
      inlineEditing: false,
      pivoting: false,
      virtualization: false,
      exporting: false,
    },
    theme: {
      variant: 'minimal',
      colorScheme: 'auto',
    },
    initialState: {
      pagination: { pageIndex: 0, pageSize: 15 },
    },
  },

  performance: {
    name: "High Performance Table",
    description: "Optimized for large datasets with virtualization",
    features: {
      sorting: true,
      pagination: false, // Disabled when virtualization is on
      filtering: true,
      rowSelection: true,
      columnVisibility: true,
      columnResizing: true,
      columnPinning: true,
      rowExpansion: false,
      globalFiltering: true,
      grouping: false,
      inlineEditing: false,
      pivoting: false,
      virtualization: true,
      exporting: true,
    },
    performanceConfig: {
      debounceDelay: 150,
      enableMemoization: true,
      enablePerformanceLogging: true,
      virtualizationThreshold: 100,
    },
    theme: {
      variant: 'default',
      colorScheme: 'auto',
    },
  },

  dashboard: {
    name: "Dashboard Table",
    description: "Table for dashboard displays with key metrics",
    features: {
      sorting: true,
      pagination: true,
      filtering: false,
      rowSelection: false,
      columnVisibility: true,
      columnResizing: false,
      columnPinning: false,
      rowExpansion: false,
      globalFiltering: true,
      grouping: true,
      inlineEditing: false,
      pivoting: false,
      virtualization: false,
      exporting: true,
    },
    performanceConfig: {
      debounceDelay: 300,
      enableMemoization: true,
      enablePerformanceLogging: false,
    },
    theme: {
      variant: 'enterprise',
      colorScheme: 'auto',
    },
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  },

  readonly: {
    name: "Read-Only Table",
    description: "Table for displaying data without editing capabilities",
    features: {
      sorting: true,
      pagination: true,
      filtering: true,
      rowSelection: false,
      columnVisibility: true,
      columnResizing: true,
      columnPinning: false,
      rowExpansion: true,
      globalFiltering: true,
      grouping: false,
      inlineEditing: false,
      pivoting: false,
      virtualization: false,
      exporting: true,
    },
    performanceConfig: {
      debounceDelay: 300,
      enableMemoization: true,
      enablePerformanceLogging: false,
    },
    theme: {
      variant: 'default',
      colorScheme: 'auto',
    },
    initialState: {
      pagination: { pageIndex: 0, pageSize: 20 },
    },
  },

  mobile: {
    name: "Mobile Optimized",
    description: "Table optimized for mobile and small screens",
    features: {
      sorting: true,
      pagination: true,
      filtering: false,
      rowSelection: false,
      columnVisibility: true,
      columnResizing: false,
      columnPinning: false,
      rowExpansion: true,
      globalFiltering: true,
      grouping: false,
      inlineEditing: false,
      pivoting: false,
      virtualization: false,
      exporting: false,
    },
    performanceConfig: {
      debounceDelay: 400,
      enableMemoization: true,
      enablePerformanceLogging: false,
    },
    theme: {
      variant: 'compact',
      colorScheme: 'auto',
    },
    initialState: {
      pagination: { pageIndex: 0, pageSize: 5 },
    },
  },
};

/**
 * Get a preset configuration by name
 */
export function getPreset(presetName: string): TablePreset | undefined {
  return TABLE_PRESETS[presetName];
}

/**
 * Get all available preset names
 */
export function getPresetNames(): string[] {
  return Object.keys(TABLE_PRESETS);
}

/**
 * Get presets filtered by category or feature
 */
export function getPresetsByFeature(feature: keyof TableFeatures): TablePreset[] {
  return Object.values(TABLE_PRESETS).filter(preset => preset.features[feature]);
}

/**
 * Create a custom preset
 */
export function createCustomPreset(
  name: string,
  description: string,
  config: Partial<TablePreset>
): TablePreset {
  return {
    name,
    description,
    features: {
      ...TABLE_PRESETS.standard.features,
      ...config.features,
    },
    performanceConfig: {
      ...TABLE_PRESETS.standard.performanceConfig,
      ...config.performanceConfig,
    },
    theme: {
      ...TABLE_PRESETS.standard.theme,
      ...config.theme,
    },
    initialState: {
      ...TABLE_PRESETS.standard.initialState,
      ...config.initialState,
    },
  };
}