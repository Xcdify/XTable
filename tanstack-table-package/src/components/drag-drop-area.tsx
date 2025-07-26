"use client";

import React from "react";
import { Column } from "@tanstack/react-table";

interface DragDropAreaProps<T = any> {
  groupedColumns: string[];
  onGroupChange: (columnId: string) => void;
  onRemoveGroup: (columnId: string) => void;
  allColumns: Column<T, unknown>[];
}

export function DragDropArea<T = any>({ groupedColumns, onGroupChange, onRemoveGroup, allColumns }: DragDropAreaProps<T>) {
  const [dragOver, setDragOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const columnId = e.dataTransfer.getData("text/plain");
    if (columnId && !groupedColumns.includes(columnId)) {
      onGroupChange(columnId);
    }
  };

  return (
    <div className="mb-4">
      <div className="text-sm font-medium mb-2">Grouping Area</div>
      <div
        className={`min-h-16 border-2 border-dashed rounded-lg p-4 transition-colors ${
          dragOver 
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
            : "border-gray-300 dark:border-gray-600"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {groupedColumns.length === 0 ? (
          <div className="text-gray-500 text-sm text-center">
            Drag column headers here to group by them
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {groupedColumns.map((columnId) => {
              const column = allColumns.find(col => col.id === columnId);
              const headerText = typeof column?.columnDef.header === 'string' 
                ? column.columnDef.header 
                : columnId;
              
              return (
                <div
                  key={columnId}
                  className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                >
                  <span>{headerText}</span>
                  <button
                    onClick={() => onRemoveGroup(columnId)}
                    className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

interface DraggableColumnHeaderProps {
  children: React.ReactNode;
  columnId: string;
  canGroup: boolean;
}

export function DraggableColumnHeader({ children, columnId, canGroup }: DraggableColumnHeaderProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", columnId);
  };

  return (
    <div
      draggable={canGroup}
      onDragStart={handleDragStart}
      className={canGroup ? "cursor-grab active:cursor-grabbing" : ""}
    >
      {children}
    </div>
  );
}
