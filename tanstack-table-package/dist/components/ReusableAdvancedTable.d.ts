import React from "react";
import { SortingState, ColumnFiltersState, RowSelectionState, VisibilityState, ColumnPinningState, GroupingState, ExpandedState, ColumnDef } from "@tanstack/react-table";
import { ThemeVariant, ColorScheme } from "../types/theme";
export type FeatureKey = "sorting" | "filtering" | "pagination" | "rowSelection" | "columnVisibility" | "columnResizing" | "columnPinning" | "rowExpansion" | "globalFiltering" | "grouping" | "inlineEditing" | "pivoting" | "virtualization" | "exporting";
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
        ErrorComponent?: React.ComponentType<{
            error: Error;
            retry: () => void;
        }>;
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
export declare function ReusableAdvancedTable<T = any>({ data, columns: providedColumns, preset, features, performanceConfig, initialState, theme, virtualization, getSubRows, onDataChange, onStateChange, onFeatureToggle, components, className, showThemeSelector, showPresetSelector, allowFeatureToggling, meta, }: ReusableAdvancedTableProps<T>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=ReusableAdvancedTable.d.ts.map