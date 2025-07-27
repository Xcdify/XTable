"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@xcdify/xtable";
import { DataTableFilterControls } from "@xcdify/xtable";
import { GroupedRowHeader } from "@xcdify/xtable";
import { DataTableProvider } from "@xcdify/xtable";
import { DataTableResetButton } from "@xcdify/xtable";
import { DataTableToolbar } from "@xcdify/xtable";
import type {
  DataTableFilterField,
} from "@xcdify/xtable";
import { Button } from "@xcdify/xtable";
import { useLocalStorage } from "@xcdify/xtable";
import { useTableKeyboardNavigation } from "@xcdify/xtable";
import { KeyboardNavigableCell } from "@xcdify/xtable";
import { cn } from "@xcdify/xtable";
import { DragDropGrouping } from "./drag-drop-grouping";
import {
  type FetchNextPageOptions,
  type RefetchOptions,
} from "@tanstack/react-query";
import type {
  ColumnDef,
  ColumnFiltersState,
  Row,
  RowSelectionState,
  SortingState,
  TableOptions,
  Table as TTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  getFacetedMinMaxValues as getTTableFacetedMinMaxValues,
  getFacetedUniqueValues as getTTableFacetedUniqueValues,
  useReactTable,
  type ExpandedState,
  type GroupingState,
  type AggregationFn,
} from "@tanstack/react-table";
import { LoaderCircle } from "lucide-react";
import * as React from "react";

// Simple format function for compact numbers
function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// TODO: add a possible chartGroupBy
export interface DataTableInfiniteProps<TData, TValue, TMeta> {
  columns: ColumnDef<TData, TValue>[];
  getRowClassName?: (row: Row<TData>) => string;
  // REMINDER: make sure to pass the correct id to access the rows
  getRowId?: TableOptions<TData>["getRowId"];
  data: TData[];
  defaultColumnFilters?: ColumnFiltersState;
  defaultColumnSorting?: SortingState;
  defaultRowSelection?: RowSelectionState;
  defaultColumnVisibility?: VisibilityState;
  filterFields?: DataTableFilterField<TData>[];

  // Editing functionality
  enableEditing?: boolean;
  onDataUpdate?: (rowIndex: number, columnId: string, value: unknown) => void;
  onSaveChanges?: (changes: Record<string, any>[]) => Promise<void>;
  editableColumns?: string[];

  // Grouping functionality
  enableGrouping?: boolean;
  onGroupingChange?: (grouping: string[]) => void;
  initialGrouping?: string[];
  groupedColumnMode?: 'reorder' | 'remove' | false;
  aggregationFns?: Record<string, AggregationFn<TData>>;

  // Custom actions
  customActions?: React.ReactNode[];
  // REMINDER: close to the same signature as the `getFacetedUniqueValues` of the `useReactTable`
  getFacetedUniqueValues?: (
    table: TTable<TData>,
    columnId: string,
  ) => Map<string, number>;
  getFacetedMinMaxValues?: (
    table: TTable<TData>,
    columnId: string,
  ) => undefined | [number, number];
  totalRows?: number;
  filterRows?: number;
  totalRowsFetched?: number;
  meta: TMeta;
  chartData?: any[];
  chartDataColumnId: string;
  isFetching?: boolean;
  isLoading?: boolean;
  hasNextPage?: boolean;
  fetchNextPage: (
    options?: FetchNextPageOptions | undefined,
  ) => Promise<unknown>;
  fetchPreviousPage?: (
    options?: any | undefined,
  ) => Promise<unknown>;
  refetch: (options?: RefetchOptions | undefined) => void;
  renderLiveRow?: (props?: { row: Row<TData> }) => React.ReactNode;
  renderSheetTitle: (props: { row?: Row<TData> }) => React.ReactNode;
  // TODO:
  renderChart?: () => React.ReactNode;
  searchParamsParser: Record<string, any>;
}

export function DataTableInfinite<TData, TValue, TMeta>({
  columns,
  getRowClassName,
  getRowId,
  data,
  defaultColumnFilters = [],
  defaultColumnSorting = [],
  defaultRowSelection = {},
  defaultColumnVisibility = {},
  filterFields = [],
  isFetching,
  isLoading,
  fetchNextPage,
  hasNextPage,
  fetchPreviousPage,
  refetch,
  totalRows = 0,
  filterRows = 0,
  totalRowsFetched = 0,
  chartData = [],
  chartDataColumnId,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  meta,
  renderLiveRow,
  renderSheetTitle,
  searchParamsParser,
  // New editing props
  enableEditing = false,
  onDataUpdate,
  onSaveChanges,
  editableColumns = [],
  // New grouping props
  enableGrouping = false,
  onGroupingChange,
  initialGrouping = [],
  groupedColumnMode = 'reorder',
  aggregationFns = {},
  customActions = [],
}: DataTableInfiniteProps<TData, TValue, TMeta>) {

  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>(defaultColumnFilters);
  const [sorting, setSorting] =
    React.useState<SortingState>(defaultColumnSorting);
  const [rowSelection, setRowSelection] =
    React.useState<RowSelectionState>(defaultRowSelection);
  const [columnOrder, setColumnOrder] = useLocalStorage<string[]>(
    "data-table-column-order",
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    useLocalStorage<VisibilityState>(
      "data-table-visibility",
      defaultColumnVisibility,
    );

  // Editing state
  const [editingRows, setEditingRows] = React.useState<Set<string>>(new Set());
  const [pendingChanges, setPendingChanges] = React.useState<Map<string, Record<string, any>>>(new Map());

  // Grouping state
  const [grouping, setGrouping] = React.useState<GroupingState>(initialGrouping);
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  const topBarRef = React.useRef<HTMLDivElement>(null);
  const tableRef = React.useRef<HTMLTableElement>(null);

  // State for tracking which cell is being edited
  const [editingCell, setEditingCell] = React.useState<{rowIndex: number, columnIndex: number} | null>(null);
  const [topBarHeight, setTopBarHeight] = React.useState(0);

  // Editing handlers
  const updateData = React.useCallback((rowIndex: number, columnId: string, value: unknown) => {
    if (!enableEditing) return;

    try {
      const rowId = String(rowIndex);
      setPendingChanges(prev => {
        const newChanges = new Map(prev);
        const rowChanges = newChanges.get(rowId) || {};
        rowChanges[columnId] = value;
        newChanges.set(rowId, rowChanges);
        return newChanges;
      });

      // Call the external update handler if provided
      onDataUpdate?.(rowIndex, columnId, value);
    } catch (error) {
      console.error('Error updating data:', error);
    }
  }, [enableEditing, onDataUpdate]);

  const startEditing = React.useCallback((rowId: string) => {
    setEditingRows(prev => new Set(prev).add(rowId));
  }, []);

  const stopEditing = React.useCallback((rowId: string) => {
    setEditingRows(prev => {
      const newSet = new Set(prev);
      newSet.delete(rowId);
      return newSet;
    });
  }, []);

  const saveChanges = React.useCallback(async () => {
    if (!onSaveChanges || pendingChanges.size === 0) return;

    try {
      const changes = Array.from(pendingChanges.entries()).map(([rowId, changes]) => ({
        rowId,
        ...changes,
      }));

      await onSaveChanges(changes);
      setPendingChanges(new Map());
      setEditingRows(new Set());
    } catch (error) {
      console.error('Failed to save changes:', error);
      // Don't clear the changes if save failed
    }
  }, [onSaveChanges, pendingChanges]);

  const cancelChanges = React.useCallback(() => {
    setPendingChanges(new Map());
    setEditingRows(new Set());
  }, []);

  // Grouping handlers
  const handleGroupingChange = React.useCallback((updaterOrValue: any) => {
    const newGrouping = typeof updaterOrValue === 'function'
      ? updaterOrValue(grouping)
      : updaterOrValue;
    setGrouping(newGrouping);
    onGroupingChange?.(newGrouping);
  }, [grouping, onGroupingChange]);

  const onScroll = React.useCallback(
    (e: React.UIEvent<HTMLElement>) => {
      const onPageBottom =
        Math.ceil(e.currentTarget.scrollTop + e.currentTarget.clientHeight) >=
        e.currentTarget.scrollHeight;

      if (onPageBottom && !isFetching && totalRowsFetched < filterRows) {
        fetchNextPage();
      }
    },
    [fetchNextPage, isFetching, filterRows, totalRowsFetched],
  );

  React.useEffect(() => {
    const observer = new ResizeObserver(() => {
      const rect = topBarRef.current?.getBoundingClientRect();
      if (rect) {
        setTopBarHeight(rect.height);
      }
    });

    const topBar = topBarRef.current;
    if (!topBar) return;

    observer.observe(topBar);
    return () => observer.unobserve(topBar);
  }, [topBarRef]);

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      sorting,
      columnVisibility,
      rowSelection,
      columnOrder,
      ...(enableGrouping && { grouping, expanded }),
    },
    enableMultiRowSelection: false,
    enableHiding: true,
    columnResizeMode: "onChange",
    getRowId,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnOrderChange: setColumnOrder,
    ...(enableGrouping && {
      onGroupingChange: handleGroupingChange,
      onExpandedChange: setExpanded,
      groupedColumnMode,
      aggregationFns,
    }),
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    ...(enableGrouping && {
      getGroupedRowModel: getGroupedRowModel(),
      getExpandedRowModel: getExpandedRowModel(),
    }),
    getFacetedUniqueValues: getTTableFacetedUniqueValues(),
    getFacetedMinMaxValues: getTTableFacetedMinMaxValues(),
    debugAll: process.env.NEXT_PUBLIC_TABLE_DEBUG === "true",
    meta: {
      getRowClassName,
      isEditingMode: enableEditing, // Always set when editing is enabled
      enableGrouping: enableGrouping, // Pass grouping flag to columns
      ...(enableEditing && {
        updateData,
        isEditing: editingRows.size > 0, // Only true when actively editing rows
        editingRows,
        pendingChanges,
        startEditing,
        stopEditing,
        saveChanges,
        cancelChanges,
      }),
    },
  });

  // Force table re-render when column visibility changes to ensure proper data alignment
  React.useEffect(() => {
    // This effect ensures the table properly updates when columns are toggled
    const visibleColumns = table.getVisibleLeafColumns();
    const hiddenColumns = table.getAllColumns().filter(col => !col.getIsVisible());
    console.log('Column visibility changed.');
    console.log('Visible columns:', visibleColumns.map(col => col.id));
    console.log('Hidden columns:', hiddenColumns.map(col => col.id));
    console.log('Total visible columns:', visibleColumns.length);
  }, [table.getState().columnVisibility]);

  // Keyboard navigation setup
  const keyboardNavigation = useTableKeyboardNavigation({
    table,
    isEditingMode: enableEditing,
    onCellEdit: (position) => {
      setEditingCell(position);
    },
    onCellBlur: () => {
      setEditingCell(null);
    },
  });

  const selectedRow = React.useMemo(() => {
    if ((isLoading || isFetching) && !data.length) return;
    const selectedRowKey = Object.keys(rowSelection)?.[0];
    return table
      .getCoreRowModel()
      .flatRows.find((row) => row.id === selectedRowKey);
  }, [rowSelection, table, isLoading, isFetching, data]);

  /**
   * https://tanstack.com/table/v8/docs/guide/column-sizing#advanced-column-resizing-performance
   * Instead of calling `column.getSize()` on every render for every header
   * and especially every data cell (very expensive),
   * we will calculate all column sizes at once at the root table level in a useMemo
   * and pass the column sizes down as CSS variables to the <table> element.
   */
  const columnSizeVars = React.useMemo(() => {
    // Only calculate sizes for visible columns to avoid issues
    const headers = table.getFlatHeaders().filter(header => header.column.getIsVisible());
    const colSizes: { [key: string]: string } = {};

    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]!;
      // REMINDER: replace "." with "-" to avoid invalid CSS variable name (e.g. "timing.dns" -> "timing-dns")
      colSizes[`--header-${header.id.replace(".", "-")}-size`] =
        `${header.getSize()}px`;
      colSizes[`--col-${header.column.id.replace(".", "-")}-size`] =
        `${header.column.getSize()}px`;
    }
    return colSizes;
  }, [
    table.getState().columnSizingInfo,
    table.getState().columnSizing,
    table.getState().columnVisibility,
    // Add visible columns as dependency to ensure recalculation
    table.getVisibleLeafColumns().map(col => col.id).join(','),
  ]);

  return (
    <DataTableProvider
      table={table}
      columns={columns}
      filterFields={filterFields}
      columnFilters={columnFilters}
      sorting={sorting}
      rowSelection={rowSelection}
      columnOrder={columnOrder}
      columnVisibility={columnVisibility}
      enableColumnOrdering={true}
      isLoading={isFetching || isLoading}
      getFacetedUniqueValues={getFacetedUniqueValues}
      getFacetedMinMaxValues={getFacetedMinMaxValues}
    >
      <div
        className="flex h-full min-h-screen w-full flex-col sm:flex-row"
        style={
          {
            "--top-bar-height": `${topBarHeight}px`,
            ...columnSizeVars,
          } as React.CSSProperties
        }
      >
        <div
          className={cn(
            "h-full w-full flex-col sm:sticky sm:top-0 sm:max-h-screen sm:min-h-screen sm:min-w-52 sm:max-w-52 sm:self-start md:min-w-72 md:max-w-72",
            "group-data-[expanded=false]/controls:hidden",
            "hidden sm:flex",
          )}
        >
          <div className="border-b border-border bg-background p-2 md:sticky md:top-0">
            <div className="flex h-[46px] items-center justify-between gap-3">
              <p className="px-2 font-medium text-foreground">Filters</p>
              <div>
                {table.getState().columnFilters.length ? (
                  <DataTableResetButton />
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex-1 p-2 sm:overflow-y-scroll">
            <DataTableFilterControls />

            {/* Drag and Drop Grouping */}
            {enableGrouping && (
              <div className="mt-6 pt-4 border-t border-border">
                <div className="mb-3">
                  <p className="px-2 font-medium text-foreground text-sm">Grouping</p>
                </div>
                <DragDropGrouping table={table} onGroupingChange={handleGroupingChange} />
              </div>
            )}
          </div>
          <div className="border-t border-border bg-background p-4 md:sticky md:bottom-0">
            <div className="text-center text-xs text-muted-foreground">
              <div className="space-y-1">
                <div>Enhanced Data Table Demo</div>
                <div>Keyboard Navigation • Inline Editing • Grouping</div>
              </div>
            </div>
          </div>
        </div>
        <div
          className={cn(
            "flex max-w-full flex-1 flex-col border-border sm:border-l",
            // Chrome issue
            "group-data-[expanded=true]/controls:sm:max-w-[calc(100vw_-_208px)] group-data-[expanded=true]/controls:md:max-w-[calc(100vw_-_288px)]",
          )}
        >
          <div
            ref={topBarRef}
            className={cn(
              "flex flex-col gap-4 bg-background p-2",
              "sticky top-0 z-10 pb-4",
            )}
          >
            {/* TBD: better flexibility with compound components? */}
            <DataTableToolbar
              renderActions={() => [
                ...customActions,
                ...(enableEditing && pendingChanges.size > 0 ? [
                  <Button key="save" onClick={saveChanges} size="sm" variant="default">
                    Save Changes ({pendingChanges.size})
                  </Button>,
                  <Button key="cancel" onClick={cancelChanges} size="sm" variant="outline">
                    Cancel
                  </Button>
                ] : []),
              ]}
            />
          </div>
          <div className="z-0">
            <Table
              ref={keyboardNavigation.tableRef}
              role="grid"
              onScroll={onScroll}
              // Force re-render when column visibility changes
              key={`table-${Object.keys(table.getState().columnVisibility).filter(key => table.getState().columnVisibility[key] === false).join('-')}`}
              // REMINDER: https://stackoverflow.com/questions/50361698/border-style-do-not-work-with-sticky-position-element
              className={cn(
                "border-separate border-spacing-0",
                enableEditing && "ring-2 ring-blue-200 ring-offset-2" // Visual indicator for edit mode
              )}
              containerClassName="max-h-[calc(100vh_-_var(--top-bar-height))]"
            >
              <TableHeader className={cn("sticky top-0 z-20 bg-background")}>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className={cn(
                      "bg-muted/50 hover:bg-muted/50",
                      "[&>*]:border-t [&>:not(:last-child)]:border-r",
                    )}
                  >
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          className={cn(
                            "relative select-none truncate border-b border-border [&>.cursor-col-resize]:last:opacity-0",
                            header.column.columnDef.meta?.headerClassName,
                          )}
                          aria-sort={
                            header.column.getIsSorted() === "asc"
                              ? "ascending"
                              : header.column.getIsSorted() === "desc"
                                ? "descending"
                                : "none"
                          }
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                          {header.column.getCanResize() && (
                            <div
                              onDoubleClick={() => header.column.resetSize()}
                              onMouseDown={header.getResizeHandler()}
                              onTouchStart={header.getResizeHandler()}
                              className={cn(
                                "user-select-none absolute -right-2 top-0 z-10 flex h-full w-4 cursor-col-resize touch-none justify-center",
                                "before:absolute before:inset-y-0 before:w-px before:translate-x-px before:bg-border",
                              )}
                            />
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody
                id="content"
                tabIndex={-1}
                className="outline-1 -outline-offset-1 outline-primary transition-colors focus-visible:outline"
                // REMINDER: avoids scroll (skipping the table header) when using skip to content
                style={{
                  scrollMarginTop: "calc(var(--top-bar-height) + 40px)",
                }}
              >
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    // REMINDER: if we want to add arrow navigation https://github.com/TanStack/table/discussions/2752#discussioncomment-192558
                    <React.Fragment key={row.id}>
                      {renderLiveRow?.({ row })}
                      {enableGrouping && row.getIsGrouped() ? (
                        <TableRow>
                          <TableCell colSpan={table.getVisibleLeafColumns().length}>
                            <GroupedRowHeader row={row} />
                          </TableCell>
                        </TableRow>
                      ) : (
                        <MemoizedRow
                          row={row}
                          table={table}
                          selected={row.getIsSelected()}
                          keyboardNavigation={keyboardNavigation}
                        />
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <React.Fragment>
                    {renderLiveRow?.()}
                    <TableRow>
                      <TableCell
                        colSpan={table.getVisibleLeafColumns().length}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                )}
                <TableRow className="hover:bg-transparent data-[state=selected]:bg-transparent">
                  <TableCell colSpan={table.getVisibleLeafColumns().length} className="text-center">
                    {hasNextPage || isFetching || isLoading ? (
                      <Button
                        disabled={isFetching || isLoading}
                        onClick={() => fetchNextPage()}
                        size="sm"
                        variant="outline"
                      >
                        {isFetching ? (
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Load More
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No more data to load (
                        <span className="font-mono font-medium">
                          {formatCompactNumber(filterRows)}
                        </span>{" "}
                        of{" "}
                        <span className="font-mono font-medium">
                          {formatCompactNumber(totalRows)}
                        </span>{" "}
                        rows)
                      </p>
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </DataTableProvider>
  );
}

/**
 * REMINDER: this is the heaviest component in the table if lots of rows
 * Some other components are rendered more often necessary, but are fixed size (not like rows that can grow in height)
 * e.g. DataTableFilterControls, DataTableFilterCommand, DataTableToolbar, DataTableHeader
 */

function Row<TData>({
  row,
  table,
  selected,
  keyboardNavigation,
}: {
  row: Row<TData>;
  table: TTable<TData>;
  // REMINDER: row.getIsSelected(); - just for memoization
  selected?: boolean;
  keyboardNavigation?: ReturnType<typeof useTableKeyboardNavigation>;
}) {
  const isEditingMode = table.options.meta?.isEditingMode;
  const rowIndex = row.index;

  const handleRowClick = (event: React.MouseEvent) => {
    // Don't open sidebar in edit mode
    if (isEditingMode) {
      event.preventDefault();
      return;
    }
    row.toggleSelected();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      // Don't open sidebar in edit mode
      if (isEditingMode) {
        return;
      }
      row.toggleSelected();
    }
  };

  return (
    <TableRow
      id={row.id}
      role="row"
      data-row-index={rowIndex}
      data-state={selected && "selected"}
      onClick={!isEditingMode ? handleRowClick : undefined}
      onKeyDown={!isEditingMode ? handleKeyDown : undefined}
      className={cn(
        "[&>:not(:last-child)]:border-r",
        "outline-1 -outline-offset-1 outline-primary transition-colors focus-visible:bg-muted/50 focus-visible:outline data-[state=selected]:outline",
        isEditingMode && "cursor-default", // Change cursor in edit mode
        table.options.meta?.getRowClassName?.(row),
      )}
    >
      {row.getVisibleCells().map((cell, cellIndex) => {
        const position = { rowIndex, columnIndex: cellIndex };
        const isFocused = keyboardNavigation?.focusedCell?.rowIndex === rowIndex &&
                         keyboardNavigation?.focusedCell?.columnIndex === cellIndex;
        const isEditable = isEditingMode && (
          cell.column.id === 'username' ||
          cell.column.id === 'email' ||
          cell.column.id === 'phone'
        );

        return (
          <KeyboardNavigableCell
            key={cell.id}
            position={position}
            isFocused={isFocused}
            isEditable={isEditable}
            onCellClick={keyboardNavigation?.handleCellClick}
            onCellFocus={keyboardNavigation?.handleCellFocus}
            onCellBlur={keyboardNavigation?.handleCellBlur}
            className={cn(
              "truncate border-b border-border",
              cell.column.columnDef.meta?.cellClassName,
            )}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </KeyboardNavigableCell>
        );
      })}
    </TableRow>
  );
}

const MemoizedRow = React.memo(
  Row,
  (prev, next) => {
    // Check if basic row properties changed
    if (prev.row.id !== next.row.id || prev.selected !== next.selected) {
      return false;
    }

    // Check if keyboard navigation focus changed
    if (prev.keyboardNavigation?.focusedCell?.rowIndex !== next.keyboardNavigation?.focusedCell?.rowIndex ||
        prev.keyboardNavigation?.focusedCell?.columnIndex !== next.keyboardNavigation?.focusedCell?.columnIndex) {
      return false;
    }

    // Check if column visibility changed by comparing visible cells
    const prevVisibleCells = prev.row.getVisibleCells().map(cell => cell.column.id);
    const nextVisibleCells = next.row.getVisibleCells().map(cell => cell.column.id);

    if (prevVisibleCells.length !== nextVisibleCells.length ||
        !prevVisibleCells.every((id, index) => id === nextVisibleCells[index])) {
      return false;
    }

    return true;
  }
) as typeof Row;
