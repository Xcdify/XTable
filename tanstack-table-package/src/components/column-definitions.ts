import React from "react";
import { ColumnDef, Table, Row } from "@tanstack/react-table";
import { 
  StatusCell, 
  ProgressCell, 
  DepartmentCell, 
  RegionCell 
} from "./cells";
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

export const createColumns = <T = any>(
  features: Record<FeatureKey, boolean>,
  onDataUpdate?: (rowIndex: number, columnId: string, value: any) => void
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
  // Main data columns
  {
    accessorKey: "firstName",
    header: "First Name",
    footer: (info) => info.column.id,
    enableGrouping: true,
    cell: ({ getValue, row }) => {
      const value = getValue() as string;
      const depth = row.depth;
      
      return features.inlineEditing 
        ? React.createElement(EditableTextCell, { 
            initialValue: value, 
            depth: 0, // Remove depth padding for structured table
            onUpdate: (newValue) => {
              onDataUpdate?.(row.index, 'firstName', newValue);
            }
          })
        : React.createElement('span', {}, value);
    },
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
    footer: (info) => info.column.id,
    enableGrouping: true,
    cell: ({ getValue, row }) => {
      const value = getValue() as string;
      
      return features.inlineEditing 
        ? React.createElement(EditableTextCell, { 
            initialValue: value, 
            depth: 0,
            onUpdate: (newValue) => {
              onDataUpdate?.(row.index, 'lastName', newValue);
            }
          })
        : React.createElement('span', {}, value);
    },
  },
  {
    accessorKey: "age",
    header: "Age",
    footer: (info) => info.column.id,
    aggregationFn: 'mean',
    enableGrouping: true,
    cell: ({ getValue, row }) => {
      const value = getValue() as number;
      
      return features.inlineEditing 
        ? React.createElement(EditableNumberCell, { 
            initialValue: value, 
            depth: 0,
            onUpdate: (newValue) => {
              onDataUpdate?.(row.index, 'age', newValue);
            }
          })
        : React.createElement('span', {}, value);
    },
  },
  {
    accessorKey: "visits",
    header: "Visits",
    footer: (info) => info.column.id,
    aggregationFn: 'sum',
    cell: ({ getValue, row }) => {
      const value = getValue() as number;
      
      return features.inlineEditing 
        ? React.createElement(EditableNumberCell, { 
            initialValue: value, 
            depth: 0,
            onUpdate: (newValue) => {
              onDataUpdate?.(row.index, 'visits', newValue);
            }
          })
        : React.createElement('span', {}, value);
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    footer: (info) => info.column.id,
    enableGrouping: true,
    cell: ({ getValue, row }) => {
      const value = getValue() as string;
      const depth = row.depth;
      const statusOptions = ['relationship', 'complicated', 'single'];
      
      const getStatusStyles = (status: string) => {
        switch (status) {
          case 'relationship':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
          case 'complicated':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
          case 'single':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
          default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
      };
      
      return features.inlineEditing 
        ? React.createElement(EditableSelectCell, { 
            initialValue: value, 
            depth: 0,
            options: statusOptions,
            getOptionStyles: getStatusStyles,
            onUpdate: (newValue) => {
              onDataUpdate?.(row.index, 'status', newValue);
            }
          })
        : React.createElement(StatusCell, {
            value: value,
            depth: 0
          });
    },
  },
  {
    accessorKey: "progress",
    header: "Profile Progress",
    footer: (info) => info.column.id,
    aggregationFn: 'mean',
    cell: ({ getValue, row }) => {
      const value = getValue() as number;
      
      return features.inlineEditing 
        ? React.createElement(EditableNumberCell, { 
            initialValue: value, 
            depth: 0,
            onUpdate: (newValue) => {
              onDataUpdate?.(row.index, 'progress', newValue);
            }
          })
        : React.createElement(ProgressCell, {
            value: value,
            depth: 0
          });
    },
  },
  {
    accessorKey: "department",
    header: "Department",
    footer: (info) => info.column.id,
    enableGrouping: true,
    cell: ({ getValue, row }) => {
      const value = getValue() as string;
      const depth = row.depth;
      const departmentOptions = ['Sales', 'Marketing', 'Engineering', 'HR', 'Finance'];
      
      const getDepartmentStyles = (dept: string) => {
        switch (dept) {
          case 'Sales':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
          case 'Marketing':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
          case 'Engineering':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
          case 'HR':
            return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
          case 'Finance':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
          default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
      };
      
      return features.inlineEditing 
        ? React.createElement(EditableSelectCell, { 
            initialValue: value, 
            depth: 0,
            options: departmentOptions,
            getOptionStyles: getDepartmentStyles,
            onUpdate: (newValue) => {
              onDataUpdate?.(row.index, 'department', newValue);
            }
          })
        : React.createElement(DepartmentCell, {
            value: value,
            depth: 0
          });
    },
  },
  {
    accessorKey: "region",
    header: "Region",
    footer: (info) => info.column.id,
    enableGrouping: true,
    cell: ({ getValue, row }) => {
      const value = getValue() as string;
      const depth = row.depth;
      const regionOptions = ['North', 'South', 'East', 'West'];
      
      const getRegionStyles = (region: string) => {
        switch (region) {
          case 'North':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
          case 'South':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
          case 'East':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
          case 'West':
            return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
          default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
      };
      
      return features.inlineEditing 
        ? React.createElement(EditableSelectCell, { 
            initialValue: value, 
            depth: 0,
            options: regionOptions,
            getOptionStyles: getRegionStyles,
            onUpdate: (newValue) => {
              onDataUpdate?.(row.index, 'region', newValue);
            }
          })
        : React.createElement(RegionCell, {
            value: value,
            depth: 0
          });
    },
  },
  {
    accessorKey: "salary",
    header: "Salary",
    footer: (info) => info.column.id,
    aggregationFn: 'mean',
    cell: ({ getValue, row }) => {
      const value = getValue() as number;
      
      return features.inlineEditing 
        ? React.createElement(EditableCurrencyCell, { 
            initialValue: value, 
            depth: 0,
            onUpdate: (newValue) => {
              onDataUpdate?.(row.index, 'salary', newValue);
            }
          })
        : React.createElement('span', {}, `$${(value)?.toLocaleString() || 'N/A'}`);
    },
  },
  {
    accessorKey: "performance",
    header: "Performance",
    footer: (info) => info.column.id,
    enableGrouping: true,
    cell: ({ getValue, row }) => {
      const value = getValue() as string;
      const depth = row.depth;
      const performanceOptions = ['Excellent', 'Good', 'Average', 'Poor'];
      
      const getPerformanceStyles = (performance: string) => {
        switch (performance) {
          case 'Excellent':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
          case 'Good':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
          case 'Average':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
          case 'Poor':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
          default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
      };

      return features.inlineEditing 
        ? React.createElement(EditableSelectCell, { 
            initialValue: value, 
            depth: 0,
            options: performanceOptions,
            getOptionStyles: getPerformanceStyles,
            onUpdate: (newValue) => {
              onDataUpdate?.(row.index, 'performance', newValue);
            }
          })
        : React.createElement('span', {
            className: `px-2 py-1 rounded text-xs ${getPerformanceStyles(value)}`
          }, value);
    },
  },
  {
    accessorKey: "joinDate",
    header: "Join Date",
    footer: (info) => info.column.id,
    cell: ({ getValue, row }) => {
      const value = getValue() as string;
      
      return features.inlineEditing 
        ? React.createElement(EditableDateCell, { 
            initialValue: value, 
            depth: 0,
            onUpdate: (newValue) => {
              onDataUpdate?.(row.index, 'joinDate', newValue);
            }
          })
        : React.createElement('span', {}, value ? new Date(value).toLocaleDateString() : 'N/A');
    },
  },
];