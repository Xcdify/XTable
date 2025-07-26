import { FeatureKey } from "../components/column-definitions";
import { TablePreset, PerformanceOptions } from "../types/table-config";

// Re-export for backward compatibility
export type { TablePreset };

export const TABLE_PRESETS: Record<string, TablePreset> = {
  'basic-table': {
    name: 'Basic Table',
    description: 'Essential features for most use cases - sorting, filtering, and pagination',
    category: 'basic',
    tags: ['sorting', 'filtering', 'pagination', 'beginner-friendly'],
    recommendedDataSize: { min: 0, max: 1000 },
    features: {
      sorting: true,
      filtering: true,
      pagination: true,
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
    performance: {
      debounceDelay: 300,
      enableMemoization: true,
      enablePerformanceLogging: false,
    }
  },
  
  'data-grid': {
    name: 'Data Grid',
    description: 'Full-featured data grid with all capabilities enabled',
    category: 'advanced',
    tags: ['full-featured', 'enterprise', 'advanced', 'all-features'],
    recommendedDataSize: { min: 100, max: 5000 },
    features: {
      sorting: true,
      filtering: true,
      pagination: true,
      rowSelection: true,
      columnVisibility: true,
      columnResizing: true,
      columnPinning: true,
      rowExpansion: true,
      globalFiltering: true,
      grouping: true,
      inlineEditing: true,
      pivoting: false, // Keep pivoting disabled as it's complex
      virtualization: false,
      exporting: true,
    },
    performance: {
      debounceDelay: 200,
      enableMemoization: true,
      enablePerformanceLogging: false,
      rendering: {
        enableBatchUpdates: true,
        renderThrottle: 16,
      }
    }
  },
  
  'simple-list': {
    name: 'Simple List',
    description: 'Minimal table for displaying simple data lists',
    category: 'basic',
    tags: ['minimal', 'simple', 'lightweight', 'read-only'],
    recommendedDataSize: { min: 0, max: 500 },
    features: {
      sorting: false,
      filtering: false,
      pagination: false,
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
    performance: {
      debounceDelay: 0,
      enableMemoization: false,
      enablePerformanceLogging: false,
    }
  },
  
  'analytics-dashboard': {
    name: 'Analytics Dashboard',
    description: 'Optimized for analytics with grouping and aggregation features',
    category: 'specialized',
    tags: ['analytics', 'grouping', 'aggregation', 'dashboard'],
    recommendedDataSize: { min: 500, max: 10000 },
    features: {
      sorting: true,
      filtering: true,
      pagination: true,
      rowSelection: false,
      columnVisibility: true,
      columnResizing: true,
      columnPinning: false,
      rowExpansion: true,
      globalFiltering: true,
      grouping: true,
      inlineEditing: false,
      pivoting: false,
      virtualization: false,
      exporting: true,
    },
    performance: {
      debounceDelay: 250,
      enableMemoization: true,
      enablePerformanceLogging: false,
      rendering: {
        enableBatchUpdates: true,
        renderThrottle: 16,
      }
    }
  },
  
  'editable-form': {
    name: 'Editable Form',
    description: 'Table optimized for inline editing and data entry',
    category: 'specialized',
    tags: ['editable', 'form', 'data-entry', 'inline-editing'],
    recommendedDataSize: { min: 10, max: 1000 },
    features: {
      sorting: true,
      filtering: true,
      pagination: true,
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
      exporting: false,
    },
    performance: {
      debounceDelay: 500, // Longer debounce for editing
      enableMemoization: true,
      enablePerformanceLogging: false,
    }
  },

  'large-dataset': {
    name: 'Large Dataset',
    description: 'Optimized for handling large datasets with virtualization and essential features',
    category: 'performance',
    tags: ['virtualization', 'large-data', 'performance', 'scalable'],
    recommendedDataSize: { min: 5000, max: 100000 },
    features: {
      sorting: true,
      filtering: true,
      pagination: false, // Disable pagination when using virtualization
      rowSelection: true,
      columnVisibility: true,
      columnResizing: true,
      columnPinning: true,
      rowExpansion: false,
      globalFiltering: true,
      grouping: false, // Disable grouping for better virtualization performance
      inlineEditing: false,
      pivoting: false,
      virtualization: true,
      exporting: true,
    },
    performance: {
      debounceDelay: 100, // Faster debounce for large datasets
      enableMemoization: true,
      enablePerformanceLogging: true,
      virtualizationThreshold: 1000,
      virtualization: {
        enabled: true,
        rowHeight: 35,
        overscan: 10,
        containerHeight: 600,
      },
      memory: {
        enableGCHints: true,
        maxCachedRows: 2000,
      },
      rendering: {
        enableBatchUpdates: true,
        renderThrottle: 8, // Higher frequency for smooth scrolling
      }
    }
  }
};

export const getPreset = (presetName: string): TablePreset | undefined => {
  return TABLE_PRESETS[presetName];
};

export const getPresetNames = (): string[] => {
  return Object.keys(TABLE_PRESETS);
};

export const getPresetFeatures = (presetName: string): Record<FeatureKey, boolean> | undefined => {
  const preset = getPreset(presetName);
  return preset?.features;
};