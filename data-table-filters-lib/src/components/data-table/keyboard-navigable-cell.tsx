"use client";

import { cn } from "../../lib/utils";
import * as React from "react";
import type { CellPosition } from "../../hooks/use-table-keyboard-navigation";

export interface KeyboardNavigableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  position: CellPosition;
  isFocused?: boolean;
  isEditable?: boolean;
  onCellClick?: (position: CellPosition) => void;
  onCellFocus?: (position: CellPosition) => void;
  onCellBlur?: () => void;
  children?: React.ReactNode;
}

export const KeyboardNavigableCell = React.forwardRef<
  HTMLTableCellElement,
  KeyboardNavigableCellProps
>(({
  position,
  isFocused = false,
  isEditable = false,
  onCellClick,
  onCellFocus,
  onCellBlur,
  className,
  children,
  ...props
}, ref) => {
  const cellRef = React.useRef<HTMLTableCellElement>(null);

  // Combine refs
  React.useImperativeHandle(ref, () => cellRef.current!);

  const handleClick = React.useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    onCellClick?.(position);
    cellRef.current?.focus();
  }, [position, onCellClick]);

  const handleFocus = React.useCallback(() => {
    onCellFocus?.(position);
  }, [position, onCellFocus]);

  const handleBlur = React.useCallback(() => {
    onCellBlur?.();
  }, [onCellBlur]);

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    // Let the parent keyboard navigation handle most keys
    // This is mainly for cell-specific behavior
    if (event.key === 'Enter' && isEditable) {
      // The parent navigation hook will handle this
      return;
    }
  }, [isEditable]);

  return (
    <td
      ref={cellRef}
      role="gridcell"
      tabIndex={isFocused ? 0 : -1}
      data-row-index={position.rowIndex}
      data-cell-index={position.columnIndex}
      data-cell-navigation="true"
      aria-selected={isFocused}
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={cn(
        "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        "outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
        isFocused && "ring-2 ring-primary ring-offset-1 bg-muted/50",
        isEditable && "cursor-pointer hover:bg-muted/30",
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
});

KeyboardNavigableCell.displayName = "KeyboardNavigableCell";
