"use client";

import React, { useMemo } from "react";
import { flexRender, Table } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { FeatureKey } from "./table-columns";
import { DraggableColumnHeader } from "./drag-drop-area";
import { useTableTheme } from "../hooks/useTableTheme";
import { EnhancedThemeOptions } from "../types/theme";

interface VirtualizedTableViewProps<T = any> {
  table: Table<T>;
  features: Record<FeatureKey, boolean>;
  height?: number;
  rowHeight?: number;
  overscan?: number;
  theme?: Partial<EnhancedThemeOptions>;
}

export function VirtualizedTableView<T = any>({ 
  table, 
  features, 
  height = 400,
  rowHeight = 35,
  overscan = 5,
  theme
}: VirtualizedTableViewProps<T>) {
  const { classNames, styles } = useTableTheme(theme);
  const { rows } = table.getRowModel();

  // Create a parent ref for the virtualizer
  const parentRef = React.useRef<HTMLDivElement>(null);

  // Create the virtualizer
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  // Get virtual items
  const virtualRows = rowVirtualizer.getVirtualItems();

  // Calculate total size for proper scrolling
  const totalSize = rowVirtualizer.getTotalSize();

  // Memoize header groups for performance
  const headerGroups = useMemo(() => table.getHeaderGroups(), [table]);

  return (
    <div className="overflow-auto border">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10" style={styles.header}>
        <table 
          className={classNames.table}
          style={{
            ...styles.table,
            width: features.columnResizing ? table.getCenterTotalSize() : undefined,
          }}
        >
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th 
                    key={header.id} 
                    className={classNames.header}
                    style={{
                      width: features.columnResizing ? header.getSize() : undefined,
                      position: features.columnPinning && header.column.getIsPinned() ? 'sticky' : undefined,
                      left: features.columnPinning && header.column.getIsPinned() === 'left' ? header.column.getStart('left') : undefined,
                      right: features.columnPinning && header.column.getIsPinned() === 'right' ? header.column.getAfter('right') : undefined,
                      zIndex: features.columnPinning && header.column.getIsPinned() ? 2 : 1,
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
              <tr>
                {headerGroups[0].headers.map((header) => (
                  <th key={header.id} className="border px-2 py-1">
                    {header.column.getCanFilter() ? (
                      <input
                        className="w-full border p-1 text-xs"
                        value={(header.column.getFilterValue() ?? "") as string}
                        onChange={(e) => header.column.setFilterValue(e.target.value)}
                        placeholder={`Filter...`}
                      />
                    ) : null}
                  </th>
                ))}
              </tr>
            )}
          </thead>
        </table>
      </div>

      {/* Virtualized Body */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{
          height: `${height}px`,
        }}
      >
        <div
          style={{
            height: `${totalSize}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          <table 
            className={classNames.table}
            style={{
              ...styles.table,
              width: features.columnResizing ? table.getCenterTotalSize() : undefined,
            }}
          >
            <tbody>
              {virtualRows.map((virtualRow) => {
                const row = rows[virtualRow.index];
                return (
                  <tr
                    key={row.id}
                    data-index={virtualRow.index}
                    ref={(node) => rowVirtualizer.measureElement(node)}
                    className={`${classNames.row} ${features.rowSelection && row.getIsSelected() ? "selected" : ""}`}
                    style={{
                      ...styles.row,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td 
                        key={cell.id} 
                        className={classNames.cell}
                        style={{
                          ...styles.cell,
                          height: `${rowHeight}px`,
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Virtualization Info */}
      <div className="text-xs text-gray-500 p-2 border-t">
        Showing {virtualRows.length} of {rows.length} rows (virtualized)
      </div>
    </div>
  );
}