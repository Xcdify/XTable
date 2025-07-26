import { ColumnDef } from "@tanstack/react-table";
export type FeatureKey = "sorting" | "filtering" | "pagination" | "rowSelection" | "columnVisibility" | "columnResizing" | "columnPinning" | "rowExpansion" | "globalFiltering" | "grouping" | "inlineEditing" | "pivoting" | "virtualization" | "exporting";
/**
 * Creates utility columns for row selection and expansion.
 * These are generic and can be used with any data structure.
 */
export declare const createUtilityColumns: <T = any>(features: Record<FeatureKey, boolean>) => ColumnDef<T>[];
/**
 * Utility functions for creating common column types.
 * These are generic helpers that can be used with any data structure.
 */
/**
 * Creates a basic text column with optional inline editing
 */
export declare const createTextColumn: <T = any>(accessorKey: keyof T, header: string, options?: {
    enableEditing?: boolean;
    enableGrouping?: boolean;
    onUpdate?: (rowIndex: number, columnId: string, value: any) => void;
}) => ColumnDef<T>;
/**
 * Creates a number column with optional inline editing
 */
export declare const createNumberColumn: <T = any>(accessorKey: keyof T, header: string, options?: {
    enableEditing?: boolean;
    enableGrouping?: boolean;
    aggregationFn?: "sum" | "mean" | "min" | "max";
    onUpdate?: (rowIndex: number, columnId: string, value: any) => void;
}) => ColumnDef<T>;
/**
 * Creates a currency column with optional inline editing
 */
export declare const createCurrencyColumn: <T = any>(accessorKey: keyof T, header: string, options?: {
    enableEditing?: boolean;
    enableGrouping?: boolean;
    aggregationFn?: "sum" | "mean" | "min" | "max";
    onUpdate?: (rowIndex: number, columnId: string, value: any) => void;
}) => ColumnDef<T>;
/**
 * Creates a date column with optional inline editing
 */
export declare const createDateColumn: <T = any>(accessorKey: keyof T, header: string, options?: {
    enableEditing?: boolean;
    enableGrouping?: boolean;
    onUpdate?: (rowIndex: number, columnId: string, value: any) => void;
}) => ColumnDef<T>;
/**
 * Creates a select column with predefined options
 */
export declare const createSelectColumn: <T = any>(accessorKey: keyof T, header: string, options: {
    enableEditing?: boolean;
    enableGrouping?: boolean;
    selectOptions: string[];
    getOptionStyles?: (value: string) => string;
    onUpdate?: (rowIndex: number, columnId: string, value: any) => void;
}) => ColumnDef<T>;
//# sourceMappingURL=column-definitions.d.ts.map