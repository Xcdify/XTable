import { useCallback, useEffect, useRef } from 'react';
import { Table } from '@tanstack/react-table';

interface UseKeyboardNavigationProps<T> {
  table: Table<T>;
  enabled?: boolean;
}

export function useKeyboardNavigation<T>({ table, enabled = true }: UseKeyboardNavigationProps<T>) {
  const tableRef = useRef<HTMLTableElement>(null);
  const currentCellRef = useRef<{ rowIndex: number; columnIndex: number }>({ rowIndex: 0, columnIndex: 0 });

  const getCellElement = useCallback((rowIndex: number, columnIndex: number): HTMLElement | null => {
    if (!tableRef.current) return null;
    
    const tbody = tableRef.current.querySelector('tbody');
    if (!tbody) return null;
    
    const row = tbody.children[rowIndex] as HTMLTableRowElement;
    if (!row) return null;
    
    const cell = row.children[columnIndex] as HTMLTableCellElement;
    if (!cell) return null;
    
    // Look for focusable element within the cell - prioritize editable elements
    const focusableElement = cell.querySelector('span[role="button"], input, select, button, [tabindex="0"]') as HTMLElement;
    return focusableElement || cell;
  }, []);

  const focusCell = useCallback((rowIndex: number, columnIndex: number) => {
    const cellElement = getCellElement(rowIndex, columnIndex);
    if (cellElement) {
      cellElement.focus();
      currentCellRef.current = { rowIndex, columnIndex };
    }
  }, [getCellElement]);

  const moveToCell = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    const { rowIndex, columnIndex } = currentCellRef.current;
    const rows = table.getRowModel().rows;
    const columns = table.getVisibleLeafColumns();
    
    let newRowIndex = rowIndex;
    let newColumnIndex = columnIndex;
    
    switch (direction) {
      case 'up':
        newRowIndex = Math.max(0, rowIndex - 1);
        break;
      case 'down':
        newRowIndex = Math.min(rows.length - 1, rowIndex + 1);
        break;
      case 'left':
        newColumnIndex = Math.max(0, columnIndex - 1);
        break;
      case 'right':
        newColumnIndex = Math.min(columns.length - 1, columnIndex + 1);
        break;
    }
    
    if (newRowIndex !== rowIndex || newColumnIndex !== columnIndex) {
      focusCell(newRowIndex, newColumnIndex);
    }
  }, [table, focusCell]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled || !tableRef.current) return;
    
    // Only handle navigation if focus is within the table
    if (!tableRef.current.contains(document.activeElement)) return;
    
    // Don't interfere with input editing
    if (document.activeElement?.tagName === 'INPUT' || 
        document.activeElement?.tagName === 'SELECT' ||
        document.activeElement?.tagName === 'TEXTAREA') {
      return;
    }
    
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        moveToCell('up');
        break;
      case 'ArrowDown':
        e.preventDefault();
        moveToCell('down');
        break;
      case 'ArrowLeft':
        e.preventDefault();
        moveToCell('left');
        break;
      case 'ArrowRight':
        e.preventDefault();
        moveToCell('right');
        break;
      case 'Home':
        e.preventDefault();
        if (e.ctrlKey) {
          // Ctrl+Home: Go to first cell
          focusCell(0, 0);
        } else {
          // Home: Go to first column of current row
          focusCell(currentCellRef.current.rowIndex, 0);
        }
        break;
      case 'End':
        e.preventDefault();
        if (e.ctrlKey) {
          // Ctrl+End: Go to last cell
          const rows = table.getRowModel().rows;
          const columns = table.getVisibleLeafColumns();
          focusCell(rows.length - 1, columns.length - 1);
        } else {
          // End: Go to last column of current row
          const columns = table.getVisibleLeafColumns();
          focusCell(currentCellRef.current.rowIndex, columns.length - 1);
        }
        break;
      case 'PageUp':
        e.preventDefault();
        moveToCell('up'); // Could be enhanced to move multiple rows
        break;
      case 'PageDown':
        e.preventDefault();
        moveToCell('down'); // Could be enhanced to move multiple rows
        break;
    }
  }, [enabled, moveToCell, focusCell, table]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);

  // Initialize focus on first cell when table loads
  useEffect(() => {
    if (enabled && table.getRowModel().rows.length > 0) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        focusCell(0, 0);
      }, 100);
    }
  }, [enabled, table.getRowModel().rows.length, focusCell]);

  return {
    tableRef,
    focusCell,
    currentCell: currentCellRef.current,
  };
}