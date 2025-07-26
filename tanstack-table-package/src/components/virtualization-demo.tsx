"use client";

import React, { useState, useMemo } from "react";
import { useAdvancedTable } from "../hooks/useAdvancedTable";
import { TableControls } from "./table-controls";
import { VirtualizedTableView } from "./virtualized-table-view";
import { EnhancedTableView } from "./enhanced-table-view";
// Generate large dataset for virtualization demo
function generateLargeDataset(count: number): any[] {
  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East'];
  const statuses = ['relationship', 'complicated', 'single'];
  const performances = ['Excellent', 'Good', 'Average', 'Needs Improvement'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    firstName: `FirstName${i + 1}`,
    lastName: `LastName${i + 1}`,
    age: Math.floor(Math.random() * 50) + 20,
    visits: Math.floor(Math.random() * 1000),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    progress: Math.floor(Math.random() * 100),
    department: departments[Math.floor(Math.random() * departments.length)],
    region: regions[Math.floor(Math.random() * regions.length)],
    salary: Math.floor(Math.random() * 100000) + 40000,
    performance: performances[Math.floor(Math.random() * performances.length)],
    joinDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
  }));
}

export function VirtualizationDemo() {
  const [datasetSize, setDatasetSize] = useState(1000);
  const [virtualizationConfig, setVirtualizationConfig] = useState({
    height: 400,
    rowHeight: 35,
    overscan: 5,
  });

  // Generate large dataset
  const largeDataset = useMemo(() => generateLargeDataset(datasetSize), [datasetSize]);

  // Use the advanced table hook with large dataset preset
  const {
    table,
    features: enabled,
    toggleFeature,
    globalFilter,
    setGlobalFilter,
    debouncedSetGlobalFilter,
    rowSelection,
    computedState,
  } = useAdvancedTable({
    data: largeDataset,
    preset: 'large-dataset', // Use the large dataset preset
    performanceConfig: {
      debounceDelay: 300,
      enableMemoization: true,
      enablePerformanceLogging: true, // Enable logging for demo
    },
  });

  const handleDatasetSizeChange = (newSize: number) => {
    setDatasetSize(newSize);
  };

  const handleVirtualizationConfigChange = (key: keyof typeof virtualizationConfig, value: number) => {
    setVirtualizationConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Virtualization Demo</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This demo shows how TanStack Table virtualization handles large datasets efficiently. 
          Toggle virtualization on/off to see the performance difference.
        </p>
      </div>

      {/* Dataset Configuration */}
      <div className="flex flex-wrap gap-4 items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Dataset Size:</label>
          <select
            value={datasetSize}
            onChange={(e) => handleDatasetSizeChange(Number(e.target.value))}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value={100}>100 rows</option>
            <option value={1000}>1,000 rows</option>
            <option value={5000}>5,000 rows</option>
            <option value={10000}>10,000 rows</option>
            <option value={50000}>50,000 rows</option>
          </select>
        </div>

        {enabled.virtualization && (
          <>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Table Height:</label>
              <input
                type="number"
                value={virtualizationConfig.height}
                onChange={(e) => handleVirtualizationConfigChange('height', Number(e.target.value))}
                className="px-2 py-1 border rounded text-sm w-20"
                min="200"
                max="800"
              />
              <span className="text-xs text-gray-500">px</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Row Height:</label>
              <input
                type="number"
                value={virtualizationConfig.rowHeight}
                onChange={(e) => handleVirtualizationConfigChange('rowHeight', Number(e.target.value))}
                className="px-2 py-1 border rounded text-sm w-16"
                min="25"
                max="100"
              />
              <span className="text-xs text-gray-500">px</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Overscan:</label>
              <input
                type="number"
                value={virtualizationConfig.overscan}
                onChange={(e) => handleVirtualizationConfigChange('overscan', Number(e.target.value))}
                className="px-2 py-1 border rounded text-sm w-16"
                min="0"
                max="20"
              />
              <span className="text-xs text-gray-500">rows</span>
            </div>
          </>
        )}
      </div>

      {/* Performance Stats */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded">
          <span className="font-medium">Total Rows:</span> {largeDataset.length.toLocaleString()}
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded">
          <span className="font-medium">Filtered Rows:</span> {table.getFilteredRowModel().rows.length.toLocaleString()}
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 px-3 py-2 rounded">
          <span className="font-medium">Mode:</span> {enabled.virtualization ? 'Virtualized' : 'Standard'}
        </div>
        {enabled.virtualization && (
          <div className="bg-orange-50 dark:bg-orange-900/20 px-3 py-2 rounded">
            <span className="font-medium">Rendered Rows:</span> ~{Math.ceil(virtualizationConfig.height / virtualizationConfig.rowHeight) + virtualizationConfig.overscan * 2}
          </div>
        )}
      </div>

      {/* Table Controls */}
      <TableControls
        enabled={enabled}
        onToggleFeature={toggleFeature}
        table={table}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        onDebouncedGlobalFilterChange={debouncedSetGlobalFilter}
        rowSelection={rowSelection}
      />

      {/* Performance Warning */}
      {!enabled.virtualization && datasetSize > 1000 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Performance Warning
            </span>
          </div>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            You're rendering {datasetSize.toLocaleString()} rows without virtualization. 
            Consider enabling virtualization for better performance with large datasets.
          </p>
        </div>
      )}

      {/* Table View */}
      {enabled.virtualization ? (
        <VirtualizedTableView 
          table={table} 
          features={enabled}
          height={virtualizationConfig.height}
          rowHeight={virtualizationConfig.rowHeight}
          overscan={virtualizationConfig.overscan}
        />
      ) : (
        <div className="max-h-96 overflow-auto">
          <EnhancedTableView table={table} features={enabled} />
        </div>
      )}

      {/* Pagination for non-virtualized mode */}
      {enabled.pagination && !enabled.virtualization && (
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

      {/* Documentation */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Virtualization Setup Guide</h3>
        <div className="text-sm space-y-2">
          <p><strong>1. Enable Virtualization:</strong> Toggle the "Virtualization" checkbox above</p>
          <p><strong>2. Configure Settings:</strong> Adjust table height, row height, and overscan for your needs</p>
          <p><strong>3. Performance Tips:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Use virtualization for datasets with 1000+ rows</li>
            <li>Disable pagination when using virtualization</li>
            <li>Consider disabling grouping for better performance</li>
            <li>Adjust overscan based on scroll speed requirements</li>
          </ul>
          <p><strong>4. Feature Compatibility:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>✅ Works with: Sorting, Filtering, Row Selection, Column Resizing, Column Pinning</li>
            <li>⚠️ Limited: Grouping (can impact performance)</li>
            <li>❌ Conflicts: Pagination (disable when using virtualization)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}