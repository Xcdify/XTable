"use client";

import React from "react";
import { flexRender, Table } from "@tanstack/react-table";
import { FeatureKey } from "./table-columns";
import { DraggableColumnHeader } from "./drag-drop-area";
import { useTableTheme } from "../hooks/useTableTheme";
import { EnhancedThemeOptions } from "../types/theme";
import { useKeyboardNavigation } from "../hooks/useKeyboardNavigation";

interface EnhancedTableViewProps<T = any> {
  table: Table<T>;
  features: Record<FeatureKey, boolean>;
  theme?: Partial<EnhancedThemeOptions>;
}

export function EnhancedTableView<T = any>({ table, features, theme }: EnhancedTableViewProps<T>) {
  const { classNames, styles } = useTableTheme(theme);
  const { tableRef } = useKeyboardNavigation({ 
    table, 
    enabled: true  // Always enable keyboard navigation
  });
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-auto">
        <table 
          ref={tableRef}
          className="w-full border-collapse"
          style={{
            width: features.columnResizing ? table.getCenterTotalSize() : undefined,
          }}
        >
        <thead className="bg-gray-50 dark:bg-gray-700">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-gray-200 dark:border-gray-600">
              {headerGroup.headers.map((header) => (
                <th 
                  key={header.id} 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600 last:border-r-0"
                  style={{
                    width: features.columnResizing ? header.getSize() : undefined,
                    position: features.columnPinning && header.column.getIsPinned() ? 'sticky' : undefined,
                    left: features.columnPinning && header.column.getIsPinned() === 'left' ? header.column.getStart('left') : undefined,
                    right: features.columnPinning && header.column.getIsPinned() === 'right' ? header.column.getAfter('right') : undefined,
                    zIndex: features.columnPinning && header.column.getIsPinned() ? 1 : undefined,
                  }}
                >
                  {header.isPlaceholder ? null : (
                    <DraggableColumnHeader 
                      columnId={header.column.id}
                      canGroup={features.grouping && header.column.getCanGroup()}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          {...{
                            className: features.sorting ? "cursor-pointer select-none flex items-center" : "flex items-center",
                            onClick: features.sorting ? header.column.getToggleSortingHandler() : undefined,
                          }}
                        >
                          {features.grouping && header.column.getCanGroup() && (
                            <button
                              onClick={header.column.getToggleGroupingHandler()}
                              className="mr-2 px-1 py-0.5 text-xs border rounded"
                            >
                              {header.column.getIsGrouped() ? '🛑' : '👥'}
                            </button>
                          )}
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {features.sorting && ({
                            asc: " 🔼",
                            desc: " 🔽",
                          }[header.column.getIsSorted() as string] ?? null)}
                        </div>
                        {features.columnPinning && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => header.column.pin('left')}
                              className="text-xs px-1 hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                              📌L
                            </button>
                            <button
                              onClick={() => header.column.pin('right')}
                              className="text-xs px-1 hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                              📌R
                            </button>
                            <button
                              onClick={() => header.column.pin(false)}
                              className="text-xs px-1 hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                              ❌
                            </button>
                          </div>
                        )}
                      </div>
                    </DraggableColumnHeader>
                  )}
                  {/* Column Resizer */}
                  {features.columnResizing && (
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className="absolute right-0 top-0 h-full w-1 bg-gray-300 cursor-col-resize hover:bg-blue-500"
                    />
                  )}
                </th>
              ))}
            </tr>
          ))}
          {features.filtering && (
            <tr className="bg-gray-25 dark:bg-gray-750">
              {table.getHeaderGroups()[0].headers.map((header) => (
                <th key={header.id} className="px-4 py-2 border-r border-gray-200 dark:border-gray-600 last:border-r-0">
                  {header.column.getCanFilter() ? (
                    <input
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      value={(header.column.getFilterValue() ?? "") as string}
                      onChange={(e) => header.column.setFilterValue(e.target.value)}
                      placeholder={`Filter ${header.column.columnDef.header}...`}
                    />
                  ) : null}
                </th>
              ))}
            </tr>
          )}
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {table.getRowModel().rows.map((row, index) => (
            <tr
              key={row.id}
              className={`
                ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'}
                ${features.rowSelection && row.getIsSelected() ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''}
                hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150
              `}
            >
              {row.getVisibleCells().map((cell) => (
                <td 
                  key={cell.id} 
                  className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-600 last:border-r-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-blue-50 dark:focus:bg-blue-900/20"
                  tabIndex={0}
                  style={{
                    position: features.columnPinning && cell.column.getIsPinned() ? 'sticky' : undefined,
                    left: features.columnPinning && cell.column.getIsPinned() === 'left' ? cell.column.getStart('left') : undefined,
                    right: features.columnPinning && cell.column.getIsPinned() === 'right' ? cell.column.getAfter('right') : undefined,
                    zIndex: features.columnPinning && cell.column.getIsPinned() ? 1 : undefined,
                    backgroundColor: features.columnPinning && cell.column.getIsPinned() ? 'inherit' : undefined,
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
