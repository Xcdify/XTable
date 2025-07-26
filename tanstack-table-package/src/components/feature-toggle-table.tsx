"use client";

import React, { useState } from "react";
import { defaultData } from "./table-columns";
import { TableControls } from "./table-controls";
import { EnhancedTableView } from "./enhanced-table-view";
import { VirtualizedTableView } from "./virtualized-table-view";
import { DragDropArea } from "./drag-drop-area";
import { useAdvancedTable } from "../hooks/useAdvancedTable";
import { ThemeSelector } from "./theme-selector";
import { EnhancedThemeOptions, ThemeVariant, ColorScheme } from "../types/theme";

export function FeatureToggleTable() {
  // Theme state
  const [themeVariant, setThemeVariant] = useState<ThemeVariant>('default');
  const [colorScheme, setColorScheme] = useState<ColorScheme>('auto');
  
  const themeOptions: Partial<EnhancedThemeOptions> = {
    variant: themeVariant,
    colorScheme: colorScheme,
    enableTransitions: true,
    enableHoverEffects: true,
    enableFocusIndicators: true,
  };

  // Use the new hook with default data to maintain backward compatibility
  const {
    table,
    features: enabled,
    toggleFeature,
    grouping,
    handleGroupChange,
    handleRemoveGroup,
    globalFilter,
    setGlobalFilter,
    debouncedSetGlobalFilter,
    rowSelection,
  } = useAdvancedTable({
    data: defaultData,
    performanceConfig: {
      debounceDelay: 300,
      enableMemoization: true,
      enablePerformanceLogging: false,
    },
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Theme Selector */}
      <ThemeSelector
        variant={themeVariant}
        colorScheme={colorScheme}
        onVariantChange={setThemeVariant}
        onColorSchemeChange={setColorScheme}
        className="mb-4"
      />

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

      {enabled.grouping && (
        <DragDropArea
          groupedColumns={grouping}
          onGroupChange={handleGroupChange}
          onRemoveGroup={handleRemoveGroup}
          allColumns={table.getAllColumns()}
        />
      )}

      {enabled.virtualization ? (
        <VirtualizedTableView 
          table={table} 
          features={enabled}
          height={400}
          rowHeight={35}
          overscan={5}
          theme={themeOptions}
        />
      ) : (
        <EnhancedTableView table={table} features={enabled} theme={themeOptions} />
      )}

      {enabled.pagination && (
        <div className="flex items-center gap-2">
          <button
            className="border rounded px-2 py-1 disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Prev
          </button>
          <button
            className="border rounded px-2 py-1 disabled:opacity-50"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
          <span className="text-sm">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
        </div>
      )}
    </div>
  );
}
