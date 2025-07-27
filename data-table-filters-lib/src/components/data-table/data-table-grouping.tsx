"use client";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { Group, X } from "lucide-react";
import * as React from "react";
import { useDataTable } from "./data-table-provider";

export function DataTableGrouping() {
  const { table } = useDataTable();
  const grouping = table.getState().grouping;
  const columns = table.getAllColumns().filter((column) => 
    column.getCanGroup() && column.columnDef.meta?.enableGrouping !== false
  );

  const handleGroupingChange = (columnId: string, isGrouped: boolean) => {
    if (isGrouped) {
      table.setGrouping([...grouping, columnId]);
    } else {
      table.setGrouping(grouping.filter((id) => id !== columnId));
    }
  };

  const removeGrouping = (columnId: string) => {
    table.setGrouping(grouping.filter((id) => id !== columnId));
  };

  const clearAllGrouping = () => {
    table.setGrouping([]);
  };

  if (columns.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Group className="mr-2 h-4 w-4" />
            Group
            {grouping.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {grouping.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px]">
          <DropdownMenuLabel>Group by columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {columns.map((column) => {
            const isGrouped = grouping.includes(column.id);
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={isGrouped}
                onCheckedChange={(checked) => handleGroupingChange(column.id, checked)}
              >
                {column.columnDef.meta?.label || column.id}
              </DropdownMenuCheckboxItem>
            );
          })}
          {grouping.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-8 px-2"
                onClick={clearAllGrouping}
              >
                Clear all grouping
              </Button>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Show active grouping badges */}
      {grouping.length > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">Grouped by:</span>
          {grouping.map((columnId) => {
            const column = table.getColumn(columnId);
            const label = column?.columnDef.meta?.label || columnId;
            return (
              <Badge key={columnId} variant="secondary" className="text-xs">
                {label}
                <button
                  onClick={() => removeGrouping(columnId)}
                  className="ml-1 hover:bg-muted rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Component to render grouped row headers
export function GroupedRowHeader<TData>({ 
  row, 
  depth = 0 
}: { 
  row: any; 
  depth?: number;
}) {
  const isExpanded = row.getIsExpanded();
  const groupingValue = row.getGroupingValue(row.groupingColumnId);
  const subRowsCount = row.subRows?.length || 0;

  return (
    <div 
      className="flex items-center gap-2 py-2 px-4 bg-muted/30 border-b"
      style={{ paddingLeft: `${depth * 20 + 16}px` }}
    >
      <button
        onClick={() => row.toggleExpanded()}
        className="flex items-center gap-1 hover:bg-muted rounded p-1"
      >
        <span className="text-sm">
          {isExpanded ? "▼" : "▶"}
        </span>
        <span className="font-medium">
          {String(groupingValue)} ({subRowsCount} items)
        </span>
      </button>
    </div>
  );
}
