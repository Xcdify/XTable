import React from "react";
import { ColumnDef, Table, Row } from "@tanstack/react-table";
import {
  EditableTextCell,
  EditableNumberCell,
  EditableDateCell,
  EditableSelectCell,
  EditableCurrencyCell
} from "./cells/EnhancedEditableCell";

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

/**
 * Creates utility columns for row selection and expansion.
 * These are generic and can be used with any data structure.
 */
export const createUtilityColumns = <T = any>(
  features: Record<FeatureKey, boolean>
): ColumnDef<T>[] => [
  // Row selection column
  ...(features.rowSelection ? [{
    id: 'select',
    header: ({ table }: { table: Table<T> }) => (
      React.createElement('input', {
        type: 'checkbox',
        checked: table.getIsAllRowsSelected(),
        onChange: table.getToggleAllRowsSelectedHandler()
      })
    ),
    cell: ({ row }: { row: Row<T> }) => (
      React.createElement('input', {
        type: 'checkbox',
        checked: row.getIsSelected(),
        onChange: row.getToggleSelectedHandler()
      })
    ),
  }] : []),
  // Expand column
  ...(features.rowExpansion ? [{
    id: 'expand',
    header: 'Expand',
    cell: ({ row }: { row: Row<T> }) => (
      row.getCanExpand() ? (
        React.createElement('button', {
          onClick: row.getToggleExpandedHandler(),
          className: 'px-2 py-1 text-xs border rounded'
        }, row.getIsExpanded() ? '▼' : '▶')
      ) : null
    ),
  }] : []),
];

/**
 * Utility functions for creating common column types.
 * These are generic helpers that can be used with any data structure.
 */

/**
 * Creates a basic text column with optional inline editing
 */
export const createTextColumn = <T = any>(
  accessorKey: keyof T,
  header: string,
  options: {
    enableEditing?: boolean;
    enableGrouping?: boolean;
    onUpdate?: (rowIndex: number, columnId: string, value: any) => void;
  } = {}
): ColumnDef<T> => ({
  accessorKey: accessorKey as string,
  header,
  footer: (info) => info.column.id,
  enableGrouping: options.enableGrouping,
  cell: ({ getValue, row }) => {
    const value = getValue() as string;

    return options.enableEditing
      ? React.createElement(EditableTextCell, {
          initialValue: value,
          depth: 0,
          onUpdate: (newValue) => {
            options.onUpdate?.(row.index, accessorKey as string, newValue);
          }
        })
      : React.createElement('span', {}, value);
  },
});

/**
 * Creates a number column with optional inline editing
 */
export const createNumberColumn = <T = any>(
  accessorKey: keyof T,
  header: string,
  options: {
    enableEditing?: boolean;
    enableGrouping?: boolean;
    aggregationFn?: 'sum' | 'mean' | 'min' | 'max';
    onUpdate?: (rowIndex: number, columnId: string, value: any) => void;
  } = {}
): ColumnDef<T> => ({
  accessorKey: accessorKey as string,
  header,
  footer: (info) => info.column.id,
  enableGrouping: options.enableGrouping,
  aggregationFn: options.aggregationFn,
  cell: ({ getValue, row }) => {
    const value = getValue() as number;

    return options.enableEditing
      ? React.createElement(EditableNumberCell, {
          initialValue: value,
          depth: 0,
          onUpdate: (newValue) => {
            options.onUpdate?.(row.index, accessorKey as string, newValue);
          }
        })
      : React.createElement('span', {}, value);
  },
});

/**
 * Creates a currency column with optional inline editing
 */
export const createCurrencyColumn = <T = any>(
  accessorKey: keyof T,
  header: string,
  options: {
    enableEditing?: boolean;
    enableGrouping?: boolean;
    aggregationFn?: 'sum' | 'mean' | 'min' | 'max';
    onUpdate?: (rowIndex: number, columnId: string, value: any) => void;
  } = {}
): ColumnDef<T> => ({
  accessorKey: accessorKey as string,
  header,
  footer: (info) => info.column.id,
  enableGrouping: options.enableGrouping,
  aggregationFn: options.aggregationFn,
  cell: ({ getValue, row }) => {
    const value = getValue() as number;

    return options.enableEditing
      ? React.createElement(EditableCurrencyCell, {
          initialValue: value,
          depth: 0,
          onUpdate: (newValue) => {
            options.onUpdate?.(row.index, accessorKey as string, newValue);
          }
        })
      : React.createElement('span', {}, `$${(value)?.toLocaleString() || 'N/A'}`);
  },
});

/**
 * Creates a date column with optional inline editing
 */
export const createDateColumn = <T = any>(
  accessorKey: keyof T,
  header: string,
  options: {
    enableEditing?: boolean;
    enableGrouping?: boolean;
    onUpdate?: (rowIndex: number, columnId: string, value: any) => void;
  } = {}
): ColumnDef<T> => ({
  accessorKey: accessorKey as string,
  header,
  footer: (info) => info.column.id,
  enableGrouping: options.enableGrouping,
  cell: ({ getValue, row }) => {
    const value = getValue() as string;

    return options.enableEditing
      ? React.createElement(EditableDateCell, {
          initialValue: value,
          depth: 0,
          onUpdate: (newValue) => {
            options.onUpdate?.(row.index, accessorKey as string, newValue);
          }
        })
      : React.createElement('span', {}, value ? new Date(value).toLocaleDateString() : 'N/A');
  },
});

/**
 * Creates a select column with predefined options
 */
export const createSelectColumn = <T = any>(
  accessorKey: keyof T,
  header: string,
  options: {
    enableEditing?: boolean;
    enableGrouping?: boolean;
    selectOptions: string[];
    getOptionStyles?: (value: string) => string;
    onUpdate?: (rowIndex: number, columnId: string, value: any) => void;
  }
): ColumnDef<T> => ({
  accessorKey: accessorKey as string,
  header,
  footer: (info) => info.column.id,
  enableGrouping: options.enableGrouping,
  cell: ({ getValue, row }) => {
    const value = getValue() as string;

    return options.enableEditing
      ? React.createElement(EditableSelectCell, {
          initialValue: value,
          depth: 0,
          options: options.selectOptions,
          getOptionStyles: options.getOptionStyles,
          onUpdate: (newValue) => {
            options.onUpdate?.(row.index, accessorKey as string, newValue);
          }
        })
      : React.createElement('span', {
          className: options.getOptionStyles ? `px-2 py-1 rounded text-xs ${options.getOptionStyles(value)}` : ''
        }, value);
  },
});