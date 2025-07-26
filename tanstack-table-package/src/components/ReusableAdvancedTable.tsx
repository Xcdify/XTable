"use client";

import React, { useState, useMemo } from "react";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  RowSelectionState,
  VisibilityState,
  ColumnPinningState,
  GroupingState,
  ExpandedState,
  ColumnDef,
  Table,
  Row,
  ColumnResizeMode,
} from "@tanstack/react-table";
import { TableControls } from "./table-controls";
import { EnhancedTableView } from "./enhanced-table-view";
import { VirtualizedTableView } from "./virtualized-table-view";
import { DragDropArea } from "./drag-drop-area";
import { ThemeSelector } from "./theme-selector";
import { PresetSelector } from "./PresetSelector";
import { EnhancedThemeOptions, ThemeVariant, ColorScheme } from "../types/theme";
import { useTablePerformance, useDebounce } from "../utils/performance";
import { TablePreset, getPreset } from "../config/table-presets";

export type FeatureKey = 
  | "sorting"
  | "filtering"
  | "pagination"
  | "rowSelection"
  | "columnVisibility"
  | "columnResizing"
  | "columnPinning"
  | "rowExpansion"
  | "globalFiltering"
  | "grouping"
  | "inlineEditing"
  | "pivoting"
  | "virtualization"
  | "exporting";

export interface TableFeatures {
  sorting?: boolean;
  filtering?: boolean;
  pagination?: boolean;
  rowSelection?: boolean;
  columnVisibility?: boolean;
  columnResizing?: boolean;
  columnPinning?: boolean;
  rowExpansion?: boolean;
  globalFiltering?: boolean;
  grouping?: boolean;
  inlineEditing?: boolean;
  pivoting?: boolean;
  virtualization?: boolean;
  exporting?: boolean;
}

export interface PerformanceConfig {
  debounceDelay?: number;
  enableMemoization?: boolean;
  enablePerformanceLogging?: boolean;
  virtualizationThreshold?: number;
}

export interface ReusableAdvancedTableProps<T = any> {
  /** Table data array */
  data: T[];
  
  /** Column definitions for the table */
  columns: ColumnDef<T>[];
  
  /** Preset configuration name */
  preset?: string;
  
  /** Feature configuration - controls which features are enabled (overrides preset) */
  features?: TableFeatures;
  
  /** Performance optimization settings */
  performanceConfig?: PerformanceConfig;
  
  /** Initial table state */
  initialState?: {
    sorting?: SortingState;
    columnFilters?: ColumnFiltersState;
    rowSelection?: RowSelectionState;
    columnVisibility?: VisibilityState;
    columnPinning?: ColumnPinningState;
    grouping?: GroupingState;
    expanded?: ExpandedState;
    globalFilter?: string;
    pagination?: {
      pageIndex: number;
      pageSize: number;
    };
  };
  
  /** Theme configuration */
  theme?: {
    variant?: ThemeVariant;
    colorScheme?: ColorScheme;
    enableTransitions?: boolean;
    enableHoverEffects?: boolean;
    enableFocusIndicators?: boolean;
  };
  
  /** Virtualization settings (when virtualization is enabled) */
  virtualization?: {
    height?: number;
    rowHeight?: number;
    overscan?: number;
  };
  
  /** Function to get sub-rows for hierarchical data */
  getSubRows?: (row: T) => T[] | undefined;
  
  /** Event handlers */
  onDataChange?: (data: T[]) => void;
  onStateChange?: (state: any) => void;
  onFeatureToggle?: (feature: FeatureKey, enabled: boolean) => void;
  
  /** Custom components */
  components?: {
    LoadingComponent?: React.ComponentType;
    ErrorComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
    EmptyStateComponent?: React.ComponentType;
  };
  
  /** Additional CSS classes */
  className?: string;
  
  /** Show theme selector */
  showThemeSelector?: boolean;
  
  /** Show preset selector */
  showPresetSelector?: boolean;
  
  /** Allow feature toggling via UI */
  allowFeatureToggling?: boolean;

  /** Meta object for table (used for inline editing) */
  meta?: any;
}

export function ReusableAdvancedTable<T = any>({
  data,
  columns: providedColumns,
  preset,
  features = {},
  performanceConfig = {},
  initialState = {},
  theme = {},
  virtualization = {},
  getSubRows,
  onDataChange,
  onStateChange,
  onFeatureToggle,
  components,
  className = "",
  showThemeSelector = true,
  showPresetSelector = true,
  allowFeatureToggling = true,
  meta,
}: ReusableAdvancedTableProps<T>) {
  
  // Get preset configuration
  const presetConfig = preset ? getPreset(preset) : null;
  
  // Default feature configuration
  const defaultFeatures: Record<FeatureKey, boolean> = {
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
    exporting: true,
  };

  // Merge features: defaults -> preset -> props
  const [enabled, setEnabled] = useState<Record<FeatureKey, boolean>>({
    ...defaultFeatures,
    ...(presetConfig?.features || {}),
    ...features,
  });

  // Current preset state
  const [currentPreset, setCurrentPreset] = useState(preset || 'standard');

  // Theme state
  const [themeVariant, setThemeVariant] = useState<ThemeVariant>(
    presetConfig?.theme?.variant || theme.variant || 'default'
  );
  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    presetConfig?.theme?.colorScheme || theme.colorScheme || 'auto'
  );
  
  const themeOptions: Partial<EnhancedThemeOptions> = useMemo(() => ({
    variant: themeVariant,
    colorScheme: colorScheme,
    enableTransitions: theme.enableTransitions ?? true,
    enableHoverEffects: theme.enableHoverEffects ?? true,
    enableFocusIndicators: theme.enableFocusIndicators ?? true,
  }), [themeVariant, colorScheme, theme.enableTransitions, theme.enableHoverEffects, theme.enableFocusIndicators]);

  // Data state management
  const [tableData, setTableData] = useState<T[]>(data);
  
  // Table state management
  const [sorting, setSorting] = useState<SortingState>(initialState.sorting || []);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialState.columnFilters || []);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(initialState.rowSelection || {});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialState.columnVisibility || {});
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(initialState.columnPinning || {});
  const [grouping, setGrouping] = useState<GroupingState>(initialState.grouping || []);
  const [expanded, setExpanded] = useState<ExpandedState>(initialState.expanded || {});
  const [globalFilter, setGlobalFilter] = useState(initialState.globalFilter || '');

  // Update table data when props change
  React.useEffect(() => {
    setTableData(data);
  }, [data]);

  // Note: handleDataUpdate function moved inside useMemo for stability

  // Notify parent of data changes - use ref to avoid infinite loops
  const initialDataRef = React.useRef(data);
  const hasDataChangedRef = React.useRef(false);
  
  // Use ref for callback to avoid dependency issues
  const onDataChangeRef = React.useRef(onDataChange);
  onDataChangeRef.current = onDataChange;
  
  React.useEffect(() => {
    // Only call onDataChange if the data was actually changed by user interaction,
    // not by prop updates from parent
    if (onDataChangeRef.current && hasDataChangedRef.current && tableData !== initialDataRef.current) {
      onDataChangeRef.current(tableData);
    }
    // Reset the flag after handling
    hasDataChangedRef.current = false;
  }, [tableData]); // Remove onDataChange from dependencies

  // Track when data changes from props vs user interaction
  React.useEffect(() => {
    initialDataRef.current = data;
    hasDataChangedRef.current = false;
  }, [data]);

  // Create columns with editing support
  const columns = useMemo(() => {
    // Columns are required - this is a truly generic component
    if (!providedColumns || providedColumns.length === 0) {
      throw new Error('ReusableAdvancedTable: columns prop is required. Please provide column definitions for your data structure.');
    }
    
    return providedColumns;
  }, [providedColumns]); // Remove handleDataUpdate from dependencies

  // Performance optimizations
  const { memoizedData, memoizedColumns } = useTablePerformance(
    tableData,
    columns,
    enabled,
    performanceConfig
  );

  // TanStack Table configuration
  const table = useReactTable({
    data: memoizedData,
    columns: memoizedColumns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      columnVisibility,
      columnPinning,
      grouping,
      expanded,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: enabled.filtering ? getFilteredRowModel() : undefined,
    getSortedRowModel: enabled.sorting ? getSortedRowModel() : undefined,
    getPaginationRowModel: enabled.pagination ? getPaginationRowModel() : undefined,
    getGroupedRowModel: enabled.grouping ? getGroupedRowModel() : undefined,
    getExpandedRowModel: enabled.rowExpansion ? getExpandedRowModel() : undefined,
    enableSorting: enabled.sorting,
    enableColumnFilters: enabled.filtering,
    enableRowSelection: enabled.rowSelection,
    enableColumnResizing: enabled.columnResizing,
    enableColumnPinning: enabled.columnPinning,
    enableGrouping: enabled.grouping,
    enableExpanding: enabled.rowExpansion,
    enableGlobalFilter: enabled.globalFiltering,
    columnResizeMode: 'onChange' as ColumnResizeMode,
    getSubRows: getSubRows,
    meta: meta,
    initialState: {
      pagination: initialState.pagination || { pageIndex: 0, pageSize: 10 },
    },
  });

  // Feature toggle function
  function toggleFeature(feature: FeatureKey) {
    const newEnabled = { ...enabled, [feature]: !enabled[feature] };
    setEnabled(newEnabled);
    onFeatureToggle?.(feature, newEnabled[feature]);
  }

  // Handle preset changes
  const handlePresetChange = (newPreset: TablePreset) => {
    setCurrentPreset(newPreset.name.toLowerCase());
    setEnabled({
      ...defaultFeatures,
      ...newPreset.features,
      ...features, // Props override preset
    });
    
    if (newPreset.theme) {
      if (newPreset.theme.variant) {
        setThemeVariant(newPreset.theme.variant);
      }
      if (newPreset.theme.colorScheme) {
        setColorScheme(newPreset.theme.colorScheme);
      }
    }
  };

  // Debounced handlers for better performance
  const finalPerformanceConfig = presetConfig?.performanceConfig || performanceConfig;
  const debounceDelay = finalPerformanceConfig.debounceDelay || 300;
  const debouncedSetGlobalFilter = useDebounce(setGlobalFilter, debounceDelay);

  // Grouping handlers
  const handleGroupChange = (columnId: string) => {
    setGrouping(prev => [...prev, columnId]);
  };

  const handleRemoveGroup = (columnId: string) => {
    setGrouping(prev => prev.filter(id => id !== columnId));
  };

  // Use ref for state change callback to avoid dependency issues
  const onStateChangeRef = React.useRef(onStateChange);
  onStateChangeRef.current = onStateChange;
  
  // Notify parent of state changes
  React.useEffect(() => {
    if (onStateChangeRef.current) {
      onStateChangeRef.current({
        sorting,
        columnFilters,
        rowSelection,
        columnVisibility,
        columnPinning,
        grouping,
        expanded,
        globalFilter,
      });
    }
  }, [sorting, columnFilters, rowSelection, columnVisibility, columnPinning, grouping, expanded, globalFilter]); // Remove onStateChange from dependencies

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Controls Header */}
      {(showPresetSelector || showThemeSelector) && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Preset Selector */}
            {showPresetSelector && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Table Preset
                </label>
                <PresetSelector
                  currentPreset={currentPreset}
                  onPresetChange={handlePresetChange}
                />
              </div>
            )}

            {/* Theme Selector */}
            {showThemeSelector && (
              <div>
                <ThemeSelector
                  variant={themeVariant}
                  colorScheme={colorScheme}
                  onVariantChange={setThemeVariant}
                  onColorSchemeChange={setColorScheme}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table Controls */}
      {allowFeatureToggling && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <TableControls
            enabled={enabled}
            onToggleFeature={toggleFeature}
            table={table}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
            onDebouncedGlobalFilterChange={debouncedSetGlobalFilter}
            rowSelection={rowSelection}
            theme={themeOptions}
          />
        </div>
      )}

      {/* Grouping Controls */}
      {enabled.grouping && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <DragDropArea<T>
            groupedColumns={grouping}
            onGroupChange={handleGroupChange}
            onRemoveGroup={handleRemoveGroup}
            allColumns={table.getAllColumns()}
          />
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Table View */}
        <div className="overflow-hidden">
          {enabled.virtualization ? (
            <VirtualizedTableView
              table={table}
              features={enabled}
              height={virtualization.height || 400}
              rowHeight={virtualization.rowHeight || 35}
              overscan={virtualization.overscan || 5}
              theme={themeOptions}
            />
          ) : (
            <EnhancedTableView
              table={table}
              features={enabled}
              theme={themeOptions}
            />
          )}
        </div>

        {/* Pagination Footer */}
        {enabled.pagination && (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Navigation Buttons */}
              <div className="flex items-center gap-2">
                <button
                  className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  {'<<'}
                </button>
                <button
                  className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  {'<'}
                </button>
                <button
                  className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  {'>'}
                </button>
                <button
                  className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  {'>>'}
                </button>
              </div>

              {/* Page Info and Size Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Page {table.getState().pagination.pageIndex + 1} of{' '}
                    {table.getPageCount()}
                  </span>
                  <select
                    value={table.getState().pagination.pageSize}
                    onChange={e => {
                      table.setPageSize(Number(e.target.value))
                    }}
                    className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    {[10, 20, 30, 40, 50].map(pageSize => (
                      <option key={pageSize} value={pageSize}>
                        Show {pageSize}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Results Info */}
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {table.getRowModel().rows.length} of{' '}
                  {table.getFilteredRowModel().rows.length} results
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}