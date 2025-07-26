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
  ColumnResizeMode,
  ColumnPinningState,
  GroupingState,
  ExpandedState,
  ColumnDef,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { FeatureKey, createUtilityColumns } from "../components/table-columns";
import { getPresetFeatures } from "../config/presets";
import { TableMemoization, useTablePerformance, PerformanceConfig, useDebounce } from "../utils/performance";
import { AdvancedTableConfig, PerformanceOptions } from "../types/table-config";

interface UseAdvancedTableProps<T = any> {
  data: T[];
  columns?: ColumnDef<T>[];
  initialFeatures?: Partial<Record<FeatureKey, boolean>>;
  preset?: string;
  performanceConfig?: Partial<PerformanceConfig>;
  // New enhanced configuration support
  config?: Partial<AdvancedTableConfig<T>>;
}

// Backward compatibility type alias
type LegacyPerformanceConfig = PerformanceConfig;

export function useAdvancedTable<T = any>({
  data,
  columns: customColumns,
  initialFeatures = {},
  preset,
  performanceConfig,
  config,
}: UseAdvancedTableProps<T>) {
  // Enhanced configuration support - merge config with individual props
  const enhancedConfig = useMemo(() => {
    if (config) {
      return {
        data: config.data || data,
        columns: config.columns || customColumns,
        preset: config.preset || preset,
        features: config.features || initialFeatures,
        performance: config.performance || performanceConfig,
      };
    }
    return {
      data,
      columns: customColumns,
      preset,
      features: initialFeatures,
      performance: performanceConfig,
    };
  }, [config, data, customColumns, preset, initialFeatures, performanceConfig]);



  // Get preset features if preset is provided
  const presetFeatures = enhancedConfig.preset ? getPresetFeatures(enhancedConfig.preset) : {};
  
  // Feature toggles state - apply preset first, then features from config, then defaults
  const [enabled, setEnabled] = useState<Record<FeatureKey, boolean>>({
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
    ...presetFeatures,
    ...enhancedConfig.features,
  });

  // Table state management - support initial state from config
  const initialState = config?.initialState || {};
  const [sorting, setSorting] = useState<SortingState>(initialState.sorting || []);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialState.columnFilters || []);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(initialState.rowSelection || {});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialState.columnVisibility || {});
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(initialState.columnPinning || {});
  const [grouping, setGrouping] = useState<GroupingState>(initialState.grouping || []);
  const [expanded, setExpanded] = useState<ExpandedState>(initialState.expanded || {});
  const [globalFilter, setGlobalFilter] = useState(initialState.globalFilter || '');

  // Performance optimizations - use enhanced configuration data and performance settings
  const finalData = enhancedConfig.data;
  // Use provided columns or create utility columns (row selection, expansion) if needed
  const utilityColumns = createUtilityColumns<T>(enabled);
  const finalColumns = enhancedConfig.columns || utilityColumns;
  const finalPerformanceConfig = enhancedConfig.performance;

  const { memoizedData, memoizedColumns, computedState } = useTablePerformance(
    finalData,
    finalColumns,
    enabled,
    finalPerformanceConfig
  );

  // Use memoized columns for better performance
  const columns = memoizedColumns;

  // TanStack Table configuration - use memoized data for better performance
  const table = useReactTable({
    data: memoizedData,
    columns,
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
    getSubRows: (row: T) => (row as any).subRows,
  });

  // Feature toggle function - keep existing implementation
  function toggleFeature(feature: FeatureKey) {
    setEnabled((prev) => ({ ...prev, [feature]: !prev[feature] }));
  }

  // Debounced handlers for better performance - use enhanced config settings
  const debounceDelay = finalPerformanceConfig?.debounceDelay || performanceConfig?.debounceDelay || 300;
  const debouncedSetGlobalFilter = useDebounce(setGlobalFilter, debounceDelay);
  const debouncedSetColumnFilters = useDebounce(setColumnFilters, debounceDelay);

  // Grouping handlers - keep existing implementation
  const handleGroupChange = (columnId: string) => {
    setGrouping(prev => [...prev, columnId]);
  };

  const handleRemoveGroup = (columnId: string) => {
    setGrouping(prev => prev.filter(id => id !== columnId));
  };

  // Return all the state and handlers needed by the component
  return {
    table,
    features: enabled,
    toggleFeature,
    // Table state
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    rowSelection,
    setRowSelection,
    columnVisibility,
    setColumnVisibility,
    columnPinning,
    setColumnPinning,
    grouping,
    setGrouping,
    expanded,
    setExpanded,
    globalFilter,
    setGlobalFilter,
    // Debounced handlers for performance
    debouncedSetGlobalFilter,
    debouncedSetColumnFilters,
    // Grouping handlers
    handleGroupChange,
    handleRemoveGroup,
    // Performance state
    computedState,
  };
}