"use client";

import { Button } from "@data-table/filters";
import { cn } from "@data-table/filters";
import { X, GripVertical } from "lucide-react";
import * as React from "react";
import type { Table } from "@tanstack/react-table";

interface DragDropGroupingProps<TData> {
  table: Table<TData>;
  onGroupingChange?: (grouping: string[]) => void;
}

interface DraggedColumn {
  id: string;
  label: string;
}

export function DragDropGrouping<TData>({ table, onGroupingChange }: DragDropGroupingProps<TData>) {
  const [draggedOver, setDraggedOver] = React.useState(false);
  const [draggedColumn, setDraggedColumn] = React.useState<DraggedColumn | null>(null);
  const grouping = table.getState().grouping;

  // Get groupable columns
  const groupableColumns = React.useMemo(() => {
    return table.getAllColumns().filter(column => 
      column.getCanGroup() && 
      column.columnDef.meta?.enableGrouping !== false
    );
  }, [table]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(false);

    const columnId = e.dataTransfer.getData("text/plain");
    if (columnId && !grouping.includes(columnId)) {
      const newGrouping = [...grouping, columnId];
      table.setGrouping(newGrouping);
      onGroupingChange?.(newGrouping);
    }
  };

  const removeGrouping = (columnId: string) => {
    const newGrouping = grouping.filter(id => id !== columnId);
    table.setGrouping(newGrouping);
    onGroupingChange?.(newGrouping);
  };

  const clearAllGrouping = () => {
    table.setGrouping([]);
    onGroupingChange?.([]);
  };

  const reorderGrouping = (fromIndex: number, toIndex: number) => {
    const newGrouping = [...grouping];
    const [removed] = newGrouping.splice(fromIndex, 1);
    newGrouping.splice(toIndex, 0, removed);
    table.setGrouping(newGrouping);
    onGroupingChange?.(newGrouping);
  };

  const handleGroupingItemDragStart = (e: React.DragEvent, columnId: string, index: number) => {
    e.dataTransfer.setData("text/plain", columnId);
    e.dataTransfer.setData("application/json", JSON.stringify({ columnId, index, source: "grouping" }));
  };

  const handleGroupingItemDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleGroupingItemDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (data.source === "grouping" && data.index !== targetIndex) {
        reorderGrouping(data.index, targetIndex);
      }
    } catch {
      // Handle regular column drop
      const columnId = e.dataTransfer.getData("text/plain");
      if (columnId && !grouping.includes(columnId)) {
        const newGrouping = [...grouping];
        newGrouping.splice(targetIndex, 0, columnId);
        table.setGrouping(newGrouping);
        onGroupingChange?.(newGrouping);
      }
    }
  };

  const getColumnLabel = (columnId: string) => {
    const column = table.getColumn(columnId);
    return column?.columnDef.meta?.label || 
           (typeof column?.columnDef.header === 'string' ? column.columnDef.header : columnId);
  };

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        className={cn(
          "min-h-[60px] border-2 border-dashed rounded-lg p-4 transition-colors",
          draggedOver 
            ? "border-primary bg-primary/5 border-solid" 
            : "border-muted-foreground/25 bg-muted/20",
          grouping.length === 0 && "flex items-center justify-center"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {grouping.length === 0 ? (
          <div className="text-center text-muted-foreground">
            <div className="text-sm font-medium">Drag columns here to group</div>
            <div className="text-xs mt-1">Drag column headers from the table to create groups</div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {grouping.map((columnId, index) => (
              <div
                key={columnId}
                draggable
                onDragStart={(e) => handleGroupingItemDragStart(e, columnId, index)}
                onDragOver={handleGroupingItemDragOver}
                onDrop={(e) => handleGroupingItemDrop(e, index)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-md",
                  "cursor-move hover:bg-primary/15 transition-colors"
                )}
              >
                <GripVertical className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm font-medium">{getColumnLabel(columnId)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive/20"
                  onClick={() => removeGrouping(columnId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {grouping.length > 0 
            ? `Grouped by ${grouping.length} column${grouping.length > 1 ? 's' : ''}`
            : "No grouping applied"
          }
        </div>
        {grouping.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllGrouping}
            className="h-7 text-xs"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Available Columns Hint */}
      {groupableColumns.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <div className="font-medium mb-1">Available for grouping:</div>
          <div className="flex flex-wrap gap-1">
            {groupableColumns
              .filter(col => !grouping.includes(col.id))
              .map(col => (
                <span key={col.id} className="px-2 py-1 bg-muted rounded text-xs">
                  {getColumnLabel(col.id)}
                </span>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}
