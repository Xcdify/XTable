import React from "react";
import { ColumnDef } from "@tanstack/react-table";
export type ColumnType = "text" | "number" | "date" | "boolean" | "currency" | "percentage" | "email" | "url" | "select" | "multiselect" | "custom";
export interface ColumnConfig<T = any> {
    /** Column key/accessor */
    key: keyof T | string;
    /** Column header display name */
    header: string;
    /** Column type for automatic formatting */
    type?: ColumnType;
    /** Whether column is sortable */
    sortable?: boolean;
    /** Whether column is filterable */
    filterable?: boolean;
    /** Whether column is resizable */
    resizable?: boolean;
    /** Whether column can be hidden */
    hideable?: boolean;
    /** Initial column width */
    width?: number;
    /** Minimum column width */
    minWidth?: number;
    /** Maximum column width */
    maxWidth?: number;
    /** Aggregation function for grouping */
    aggregationFn?: 'sum' | 'count' | 'min' | 'max' | 'mean' | 'median';
    /** Custom cell renderer */
    cell?: (props: {
        value: any;
        row: T;
        column: any;
    }) => React.ReactNode;
    /** Custom header renderer */
    headerCell?: (props: {
        column: any;
    }) => React.ReactNode;
    /** Options for select/multiselect columns */
    options?: Array<{
        value: any;
        label: string;
        color?: string;
    }>;
    /** Format function for display */
    format?: (value: any) => string;
    /** CSS classes for the column */
    className?: string;
    /** Whether column should be pinned */
    pinned?: 'left' | 'right';
    /** Custom styles */
    style?: React.CSSProperties;
}
/**
 * Helper function to create TanStack Table columns from simplified configuration
 */
export declare function createColumnDef<T = any>(config: ColumnConfig<T>): ColumnDef<T>;
/**
 * Helper to create multiple columns at once
 */
export declare function createColumns<T = any>(configs: ColumnConfig<T>[]): ColumnDef<T>[];
/**
 * Predefined column configurations for common data types
 */
export declare const ColumnPresets: {
    id: (key?: string) => ColumnConfig;
    name: (key?: string) => ColumnConfig;
    email: (key?: string) => ColumnConfig;
    date: (key: string, header: string) => ColumnConfig;
    currency: (key: string, header: string) => ColumnConfig;
    status: (key?: string, options?: Array<{
        value: any;
        label: string;
        color?: string;
    }>) => ColumnConfig;
    boolean: (key: string, header: string) => ColumnConfig;
    actions: (cell: (props: {
        value: any;
        row: any;
        column: any;
    }) => React.ReactNode) => ColumnConfig;
};
/**
 * Helper to infer column types from data
 */
export declare function inferColumnTypes<T extends Record<string, any>>(data: T[], sampleSize?: number): ColumnConfig<T>[];
//# sourceMappingURL=column-helpers.d.ts.map