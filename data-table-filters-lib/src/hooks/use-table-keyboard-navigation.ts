"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Table } from "@tanstack/react-table";

export interface CellPosition {
  rowIndex: number;
  columnIndex: number;
}

export interface UseTableKeyboardNavigationProps<TData> {
  table: Table<TData>;
  isEditingMode?: boolean;
  onCellEdit?: (position: CellPosition) => void;
  onCellBlur?: () => void;
}

export function useTableKeyboardNavigation<TData>({
  table,
  isEditingMode = false,
  onCellEdit,
  onCellBlur,
}: UseTableKeyboardNavigationProps<TData>) {
  const [focusedCell, setFocusedCell] = useState<CellPosition | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const tableRef = useRef<HTMLTableElement>(null);

  const rows = table.getRowModel().rows;
  const columns = table.getVisibleLeafColumns();

  // Get cell element by position
  const getCellElement = useCallback((position: CellPosition): HTMLElement | null => {
    if (!tableRef.current) return null;
    
    const row = tableRef.current.querySelector(`[data-row-index="${position.rowIndex}"]`);
    if (!row) return null;
    
    const cell = row.querySelector(`[data-cell-index="${position.columnIndex}"]`);
    return cell as HTMLElement;
  }, []);

  // Focus a specific cell
  const focusCell = useCallback((position: CellPosition) => {
    const cellElement = getCellElement(position);
    if (cellElement) {
      cellElement.focus();
      setFocusedCell(position);
    }
  }, [getCellElement]);

  // Move focus in a direction
  const moveFocus = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!focusedCell) return;

    let newPosition = { ...focusedCell };

    switch (direction) {
      case 'up':
        newPosition.rowIndex = Math.max(0, focusedCell.rowIndex - 1);
        break;
      case 'down':
        newPosition.rowIndex = Math.min(rows.length - 1, focusedCell.rowIndex + 1);
        break;
      case 'left':
        newPosition.columnIndex = Math.max(0, focusedCell.columnIndex - 1);
        break;
      case 'right':
        newPosition.columnIndex = Math.min(columns.length - 1, focusedCell.columnIndex + 1);
        break;
    }

    // Only move if position actually changed
    if (newPosition.rowIndex !== focusedCell.rowIndex || 
        newPosition.columnIndex !== focusedCell.columnIndex) {
      focusCell(newPosition);
    }
  }, [focusedCell, rows.length, columns.length, focusCell]);

  // Move to next/previous editable cell (for Tab navigation in edit mode)
  const moveToNextEditableCell = useCallback((direction: 'next' | 'previous') => {
    if (!focusedCell || !isEditingMode) return;

    const editableColumns = columns.filter(col => 
      col.columnDef.meta?.editable || col.id === 'username' || col.id === 'email' || col.id === 'phone'
    );

    if (editableColumns.length === 0) return;

    let currentEditableIndex = editableColumns.findIndex(col => 
      columns.indexOf(col) === focusedCell.columnIndex
    );

    if (currentEditableIndex === -1) return;

    let newPosition = { ...focusedCell };

    if (direction === 'next') {
      if (currentEditableIndex < editableColumns.length - 1) {
        // Move to next editable column in same row
        const nextEditableColumn = editableColumns[currentEditableIndex + 1];
        newPosition.columnIndex = columns.indexOf(nextEditableColumn);
      } else if (focusedCell.rowIndex < rows.length - 1) {
        // Move to first editable column in next row
        newPosition.rowIndex = focusedCell.rowIndex + 1;
        newPosition.columnIndex = columns.indexOf(editableColumns[0]);
      }
    } else {
      if (currentEditableIndex > 0) {
        // Move to previous editable column in same row
        const prevEditableColumn = editableColumns[currentEditableIndex - 1];
        newPosition.columnIndex = columns.indexOf(prevEditableColumn);
      } else if (focusedCell.rowIndex > 0) {
        // Move to last editable column in previous row
        newPosition.rowIndex = focusedCell.rowIndex - 1;
        newPosition.columnIndex = columns.indexOf(editableColumns[editableColumns.length - 1]);
      }
    }

    focusCell(newPosition);
  }, [focusedCell, isEditingMode, columns, rows.length, focusCell]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!focusedCell) return;

    // Don't handle navigation if user is typing in an input
    const activeElement = document.activeElement;
    const isInputActive = activeElement?.tagName === 'INPUT' || 
                         activeElement?.tagName === 'TEXTAREA' ||
                         activeElement?.contentEditable === 'true';

    // In edit mode, handle Tab differently
    if (isEditingMode && (event.key === 'Tab')) {
      event.preventDefault();
      moveToNextEditableCell(event.shiftKey ? 'previous' : 'next');
      return;
    }

    // Don't handle arrow keys if input is active (unless it's a cell navigation context)
    if (isInputActive && !event.target?.closest('[data-cell-navigation]')) {
      return;
    }

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        moveFocus('up');
        break;
      case 'ArrowDown':
        event.preventDefault();
        moveFocus('down');
        break;
      case 'ArrowLeft':
        event.preventDefault();
        moveFocus('left');
        break;
      case 'ArrowRight':
        event.preventDefault();
        moveFocus('right');
        break;
      case 'Tab':
        event.preventDefault();
        moveFocus(event.shiftKey ? 'left' : 'right');
        break;
      case 'Enter':
        if (isEditingMode && onCellEdit) {
          event.preventDefault();
          onCellEdit(focusedCell);
        }
        break;
      case 'Escape':
        if (onCellBlur) {
          event.preventDefault();
          onCellBlur();
        }
        break;
      case 'Home':
        event.preventDefault();
        if (event.ctrlKey) {
          // Ctrl+Home: Go to first cell
          focusCell({ rowIndex: 0, columnIndex: 0 });
        } else {
          // Home: Go to first column in current row
          focusCell({ ...focusedCell, columnIndex: 0 });
        }
        break;
      case 'End':
        event.preventDefault();
        if (event.ctrlKey) {
          // Ctrl+End: Go to last cell
          focusCell({ rowIndex: rows.length - 1, columnIndex: columns.length - 1 });
        } else {
          // End: Go to last column in current row
          focusCell({ ...focusedCell, columnIndex: columns.length - 1 });
        }
        break;
    }
  }, [focusedCell, isEditingMode, moveFocus, moveToNextEditableCell, onCellEdit, onCellBlur, rows.length, columns.length, focusCell]);

  // Set up keyboard event listeners
  useEffect(() => {
    if (isNavigating) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isNavigating, handleKeyDown]);

  // Handle cell click to set focus
  const handleCellClick = useCallback((position: CellPosition) => {
    setFocusedCell(position);
    setIsNavigating(true);
  }, []);

  // Handle cell focus
  const handleCellFocus = useCallback((position: CellPosition) => {
    setFocusedCell(position);
    setIsNavigating(true);
  }, []);

  // Handle cell blur
  const handleCellBlur = useCallback(() => {
    // Small delay to allow for focus to move to another cell
    setTimeout(() => {
      const activeElement = document.activeElement;
      const isStillInTable = activeElement?.closest('table') === tableRef.current;
      if (!isStillInTable) {
        setIsNavigating(false);
        setFocusedCell(null);
      }
    }, 0);
  }, []);

  return {
    focusedCell,
    tableRef,
    isNavigating,
    focusCell,
    handleCellClick,
    handleCellFocus,
    handleCellBlur,
    getCellElement,
  };
}
