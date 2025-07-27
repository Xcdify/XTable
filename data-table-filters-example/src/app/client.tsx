"use client";

import { Button } from "@data-table/filters";
import { useLocalStorage } from "@data-table/filters";
import { cn } from "@data-table/filters";
import { useQuery } from "@tanstack/react-query";
import { Edit3, Group } from "lucide-react";
import * as React from "react";
import { columns } from "./columns";
import { filterFields as defaultFilterFields } from "./constants";
import { DataTableInfinite } from "./data-table-infinite";
import { dataOptions } from "./query-options";
import type { ColumnSchema } from "./schema";

export function Client() {
  const {
    data,
    isFetching,
    isLoading,
    refetch,
  } = useQuery(dataOptions());

  // Editing and grouping state - now persisted in localStorage
  const [enableEditing, setEnableEditing] = useLocalStorage("data-table-editing-enabled", false);
  const [enableGrouping, setEnableGrouping] = useLocalStorage("data-table-grouping-enabled", false);

  const flatData = React.useMemo(
    () => data?.data ?? [],
    [data?.data],
  );

  // REMINDER: meta data is always the same for all pages as filters do not change(!)
  const totalDBRowCount = data?.meta?.totalRowCount;
  const filterDBRowCount = data?.meta?.filterRowCount;
  const metadata = data?.meta?.metadata;
  const totalFetched = flatData?.length;

  // Filter fields for the data table
  const filterFields = React.useMemo(() => {
    return defaultFilterFields;
  }, []);

  // Editing handlers
  const handleDataUpdate = React.useCallback((rowIndex: number, columnId: string, value: unknown) => {
    console.log('Data update:', { rowIndex, columnId, value });
    // In a real app, you might update local state or make an API call
  }, []);

  const handleSaveChanges = React.useCallback(async (changes: Record<string, any>[]) => {
    console.log('Saving changes:', changes);
    // In a real app, you would make API calls to save the changes
    // For now, we'll just simulate a successful save
    await new Promise(resolve => setTimeout(resolve, 1000));
  }, []);

  // Grouping handlers
  const handleGroupingChange = React.useCallback((grouping: string[]) => {
    console.log('Grouping changed:', grouping);
  }, []);

  return (
    <DataTableInfinite
      columns={columns}
      data={flatData}
      totalRows={totalDBRowCount}
      filterRows={filterDBRowCount}
      totalRowsFetched={totalFetched}
      defaultColumnFilters={[]}
      defaultColumnSorting={[]}
      defaultRowSelection={{}}
      // FIXME: make it configurable - TODO: use `columnHidden: boolean` in `filterFields`
      defaultColumnVisibility={{
        id: false, // Hide ID column by default
      }}
      meta={metadata}
      filterFields={filterFields}
      isFetching={isFetching}
      isLoading={isLoading}
      fetchNextPage={() => Promise.resolve()}
      hasNextPage={false}
      fetchPreviousPage={undefined}
      refetch={refetch}
      chartData={[]}
      chartDataColumnId="date"
      getRowClassName={() => ""}
      getRowId={(row) => String(row.id)}
      getFacetedUniqueValues={() => () => new Map()}
      getFacetedMinMaxValues={() => () => undefined}
      renderLiveRow={() => null}
      renderSheetTitle={() => "User Details"}
      searchParamsParser={{}}
      // Editing props - re-enabling
      enableEditing={enableEditing}
      onDataUpdate={handleDataUpdate}
      onSaveChanges={handleSaveChanges}
      editableColumns={['username', 'email', 'phone']}
      // Grouping props - now enabled
      enableGrouping={enableGrouping}
      onGroupingChange={handleGroupingChange}
      initialGrouping={[]}
      groupedColumnMode="reorder"
      // Custom actions
      customActions={[
        <Button
          key="toggle-editing"
          onClick={() => setEnableEditing(!enableEditing)}
          size="sm"
          variant={enableEditing ? "default" : "outline"}
          className={enableEditing ? "bg-blue-600 hover:bg-blue-700" : ""}
        >
          <Edit3 className="mr-2 h-4 w-4" />
          {enableEditing ? "Exit Edit Mode" : "Edit Mode"}
        </Button>,
        <Button
          key="toggle-grouping"
          onClick={() => setEnableGrouping(!enableGrouping)}
          size="sm"
          variant={enableGrouping ? "default" : "outline"}
          className={enableGrouping ? "bg-green-600 hover:bg-green-700" : ""}
        >
          <Group className="mr-2 h-4 w-4" />
          {enableGrouping ? "Disable Grouping" : "Enable Grouping"}
        </Button>,
      ]}
    />
  );
}
