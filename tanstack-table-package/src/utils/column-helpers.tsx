import React from "react";
import { ColumnDef } from "@tanstack/react-table";

export type ColumnType = 
  | "text" 
  | "number" 
  | "date" 
  | "boolean" 
  | "currency" 
  | "percentage" 
  | "email" 
  | "url" 
  | "select" 
  | "multiselect"
  | "custom";

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
  cell?: (props: { value: any; row: T; column: any }) => React.ReactNode;
  
  /** Custom header renderer */
  headerCell?: (props: { column: any }) => React.ReactNode;
  
  /** Options for select/multiselect columns */
  options?: Array<{ value: any; label: string; color?: string }>;
  
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
export function createColumnDef<T = any>(config: ColumnConfig<T>): ColumnDef<T> {
  const {
    key,
    header,
    type = "text",
    sortable = true,
    filterable = true,
    resizable = true,
    width,
    minWidth,
    maxWidth,
    aggregationFn,
    cell,
    headerCell,
    options = [],
    format,
    className,
    style,
  } = config;

  const columnDef: ColumnDef<T> = {
    accessorKey: key as string,
    header: headerCell ? headerCell : header,
    enableSorting: sortable,
    enableColumnFilter: filterable,
    enableResizing: resizable,
    size: width,
    minSize: minWidth,
    maxSize: maxWidth,
    aggregationFn: aggregationFn as any,
  };

  // Custom cell renderer or auto-generate based on type
  if (cell) {
    columnDef.cell = ({ getValue, row, column }) => 
      cell({ value: getValue(), row: row.original, column });
  } else {
    columnDef.cell = ({ getValue }) => {
      const value = getValue();
      return createCellRenderer(type, value, options, format, className, style);
    };
  }

  return columnDef;
}

/**
 * Auto-generate cell renderer based on column type
 */
function createCellRenderer(
  type: ColumnType,
  value: any,
  options: Array<{ value: any; label: string; color?: string }>,
  format?: (value: any) => string,
  className?: string,
  style?: React.CSSProperties
): React.ReactNode {
  if (value == null) {
    return React.createElement('span', { className: 'text-gray-400' }, 'N/A');
  }

  // Use custom format function if provided
  if (format) {
    return React.createElement('span', { className, style }, format(value));
  }

  const baseProps = { className, style };

  switch (type) {
    case "text":
      return React.createElement('span', baseProps, String(value));

    case "number":
      return React.createElement('span', baseProps, Number(value).toLocaleString());

    case "currency":
      return React.createElement('span', baseProps, 
        new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD' 
        }).format(Number(value))
      );

    case "percentage":
      return React.createElement('span', baseProps, `${Number(value)}%`);

    case "date":
      const date = new Date(value);
      return React.createElement('span', baseProps, 
        isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString()
      );

    case "boolean":
      return React.createElement('span', {
        ...baseProps,
        className: `px-2 py-1 rounded text-xs ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} ${className || ''}`
      }, value ? 'Yes' : 'No');

    case "email":
      return React.createElement('a', {
        ...baseProps,
        href: `mailto:${value}`,
        className: `text-blue-600 hover:underline ${className || ''}`
      }, String(value));

    case "url":
      return React.createElement('a', {
        ...baseProps,
        href: String(value),
        target: '_blank',
        rel: 'noopener noreferrer',
        className: `text-blue-600 hover:underline ${className || ''}`
      }, String(value));

    case "select":
      const option = options.find(opt => opt.value === value);
      const optionLabel = option?.label || String(value);
      const optionColor = option?.color;
      
      return React.createElement('span', {
        ...baseProps,
        className: `px-2 py-1 rounded text-xs ${optionColor || 'bg-gray-100 text-gray-800'} ${className || ''}`
      }, optionLabel);

    case "multiselect":
      if (!Array.isArray(value)) return React.createElement('span', baseProps, 'N/A');
      
      return React.createElement('div', { className: 'flex flex-wrap gap-1' },
        value.map((item, index) => {
          const option = options.find(opt => opt.value === item);
          const optionLabel = option?.label || String(item);
          const optionColor = option?.color;
          
          return React.createElement('span', {
            key: index,
            className: `px-1 py-0.5 rounded text-xs ${optionColor || 'bg-gray-100 text-gray-800'}`
          }, optionLabel);
        })
      );

    default:
      return React.createElement('span', baseProps, String(value));
  }
}

/**
 * Helper to create multiple columns at once
 */
export function createColumns<T = any>(configs: ColumnConfig<T>[]): ColumnDef<T>[] {
  return configs.map(config => createColumnDef(config));
}

/**
 * Predefined column configurations for common data types
 */
export const ColumnPresets = {
  id: (key = 'id'): ColumnConfig => ({
    key,
    header: 'ID',
    type: 'number',
    width: 80,
    pinned: 'left',
  }),

  name: (key = 'name'): ColumnConfig => ({
    key,
    header: 'Name',
    type: 'text',
    sortable: true,
    filterable: true,
  }),

  email: (key = 'email'): ColumnConfig => ({
    key,
    header: 'Email',
    type: 'email',
    sortable: true,
    filterable: true,
  }),

  date: (key: string, header: string): ColumnConfig => ({
    key,
    header,
    type: 'date',
    sortable: true,
    filterable: true,
  }),

  currency: (key: string, header: string): ColumnConfig => ({
    key,
    header,
    type: 'currency',
    sortable: true,
    aggregationFn: 'sum',
  }),

  status: (key = 'status', options: Array<{ value: any; label: string; color?: string }> = []): ColumnConfig => ({
    key,
    header: 'Status',
    type: 'select',
    options,
    filterable: true,
  }),

  boolean: (key: string, header: string): ColumnConfig => ({
    key,
    header,
    type: 'boolean',
    filterable: true,
  }),

  actions: (cell: (props: { value: any; row: any; column: any }) => React.ReactNode): ColumnConfig => ({
    key: 'actions',
    header: 'Actions',
    type: 'custom',
    sortable: false,
    filterable: false,
    resizable: false,
    cell,
    pinned: 'right',
    width: 120,
  }),
};

/**
 * Helper to infer column types from data
 */
export function inferColumnTypes<T extends Record<string, any>>(
  data: T[], 
  sampleSize = 10
): ColumnConfig<T>[] {
  if (!data.length) return [];

  const sample = data.slice(0, sampleSize);
  const keys = Object.keys(sample[0]) as (keyof T)[];

  return keys.map(key => {
    const values = sample.map(row => row[key]).filter(val => val != null);
    
    let type: ColumnType = 'text';
    
    if (values.length > 0) {
      const firstValue = values[0];
      
      if (typeof firstValue === 'number') {
        type = 'number';
      } else if (typeof firstValue === 'boolean') {
        type = 'boolean';
      } else if ((firstValue as any) instanceof Date || 
                 (typeof firstValue === 'string' && !isNaN(Date.parse(firstValue)))) {
        type = 'date';
      } else if (typeof firstValue === 'string') {
        if (firstValue.includes('@')) {
          type = 'email';
        } else if (firstValue.startsWith('http')) {
          type = 'url';
        } else if (firstValue.startsWith('$') || key.toString().toLowerCase().includes('price') || key.toString().toLowerCase().includes('cost')) {
          type = 'currency';
        }
      }
    }

    return {
      key,
      header: String(key).replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      type,
    };
  });
}