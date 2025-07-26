"use client";

import React from "react";
import { Table } from "@tanstack/react-table";
import { FeatureKey } from "./table-columns";
import { PivotControls } from "./pivot-controls";
import { ExportControls } from "./export-controls";
import { useTableTheme } from "../hooks/useTableTheme";
import { EnhancedThemeOptions } from "../types/theme";

export const featureList: Record<FeatureKey, string> = {
  sorting: "Sorting",
  filtering: "Filtering",
  pagination: "Pagination",
  rowSelection: "Row Selection",
  columnVisibility: "Column Visibility",
  columnResizing: "Column Resizing",
  columnPinning: "Column Pinning",
  rowExpansion: "Row Expansion",
  globalFiltering: "Global Search",
  grouping: "Grouping",
  inlineEditing: "Inline Editing",
  pivoting: "Pivoting",
  virtualization: "Virtualization",
  exporting: "Data Export",
};

interface TableControlsProps<T = any> {
  enabled: Record<FeatureKey, boolean>;
  onToggleFeature: (feature: FeatureKey) => void;
  table: Table<T>;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  onDebouncedGlobalFilterChange?: (value: string) => void;
  rowSelection: Record<string, boolean>;
  theme?: Partial<EnhancedThemeOptions>;
}

export function TableControls<T = any>({
  enabled,
  onToggleFeature,
  table,
  globalFilter,
  onGlobalFilterChange,
  onDebouncedGlobalFilterChange,
  rowSelection,
  theme,
}: TableControlsProps<T>) {
  const { classNames, styles } = useTableTheme(theme);
  
  return (
    <div className={`${classNames.controls} space-y-4`} style={styles.controls}>
      {/* Feature Toggles */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Table Features</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(featureList).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={enabled[key as FeatureKey]}
                onChange={() => onToggleFeature(key as FeatureKey)}
                className="rounded"
              />
              <span className="text-gray-700 dark:text-gray-300">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Global Search */}
      {enabled.globalFiltering && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Global Search</h3>
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => {
              // Update UI immediately for responsiveness
              onGlobalFilterChange(e.target.value);
              // Use debounced handler for actual filtering if available
              if (onDebouncedGlobalFilterChange) {
                onDebouncedGlobalFilterChange(e.target.value);
              }
            }}
            placeholder="Search all columns..."
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded w-full max-w-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      )}

      {/* Column Visibility Controls */}
      {enabled.columnVisibility && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Show/Hide Columns</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {table.getAllLeafColumns().map((column) => (
              <label key={column.id} className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={column.getIsVisible()}
                  onChange={column.getToggleVisibilityHandler()}
                  className="rounded"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  {typeof column.columnDef.header === 'string'
                    ? column.columnDef.header
                    : column.id}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Selected Rows Info */}
      {enabled.rowSelection && Object.keys(rowSelection).length > 0 && (
        <div className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
          {Object.keys(rowSelection).length} row(s) selected
        </div>
      )}

      {/* Pivoting Controls */}
      {enabled.pivoting && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Pivot Controls</h3>
          <PivotControls table={table} />
        </div>
      )}

      {/* Export Controls */}
      {enabled.exporting && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Export Data</h3>
          <ExportControls table={table} enabled={enabled.exporting} />
        </div>
      )}
    </div>
  );
}
