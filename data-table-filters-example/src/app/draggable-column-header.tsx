"use client";

import type { Column } from "@tanstack/react-table";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { Button, type ButtonProps } from "@data-table/filters";
import { cn } from "@data-table/filters";
import * as React from "react";

interface DraggableColumnHeaderProps<TData, TValue> extends ButtonProps {
  column: Column<TData, TValue>;
  title: string;
  enableGrouping?: boolean;
}

export function DraggableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  enableGrouping = false,
  ...props
}: DraggableColumnHeaderProps<TData, TValue>) {
  const [isDragging, setIsDragging] = React.useState(false);
  const canGroup = column.getCanGroup() && column.columnDef.meta?.enableGrouping !== false;

  const handleDragStart = (e: React.DragEvent) => {
    if (!canGroup || !enableGrouping) return;
    
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", column.id);
    e.dataTransfer.effectAllowed = "copy";
    
    // Create a custom drag image
    const dragImage = document.createElement("div");
    dragImage.textContent = title;
    dragImage.className = "px-3 py-2 bg-primary text-primary-foreground rounded shadow-lg text-sm font-medium";
    dragImage.style.position = "absolute";
    dragImage.style.top = "-1000px";
    document.body.appendChild(dragImage);
    
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    
    // Clean up drag image after drag starts
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only handle sorting if not dragging and column can sort
    if (!isDragging && column.getCanSort()) {
      column.toggleSorting(undefined);
    }
  };

  if (!column.getCanSort() && !canGroup) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className="flex items-center w-full">
      {/* Drag Handle - only show if grouping is enabled and column can be grouped */}
      {enableGrouping && canGroup && (
        <div
          className="flex items-center justify-center w-6 h-6 cursor-grab hover:bg-muted/50 rounded mr-1"
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          title={`Drag to group by ${title}`}
        >
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>
      )}

      {/* Column Header Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className={cn(
          "py-0 px-2 h-7 hover:bg-transparent flex gap-2 items-center justify-between flex-1",
          isDragging && "opacity-50",
          className
        )}
        {...props}
      >
        <span className="truncate">{title}</span>
        
        {/* Sort Indicators - only show if column can sort */}
        {column.getCanSort() && (
          <span className="flex flex-col flex-shrink-0">
            <ChevronUp
              className={cn(
                "-mb-0.5 h-3 w-3",
                column.getIsSorted() === "asc"
                  ? "text-accent-foreground"
                  : "text-muted-foreground"
              )}
            />
            <ChevronDown
              className={cn(
                "-mt-0.5 h-3 w-3",
                column.getIsSorted() === "desc"
                  ? "text-accent-foreground"
                  : "text-muted-foreground"
              )}
            />
          </span>
        )}
      </Button>
    </div>
  );
}
