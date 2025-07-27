"use client";

import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "../../lib/utils";
import { Check, X } from "lucide-react";
import * as React from "react";

export interface EditCellProps {
  value: any;
  onChange: (value: any) => void;
  onBlur: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  type?: "text" | "email" | "number" | "tel" | "select";
  options?: Array<{ label: string; value: any }>;
}

export interface EditableCellProps extends EditCellProps {
  onStartEdit?: () => void;
  onStopEdit?: () => void;
  autoFocus?: boolean;
}

export function EditableCell({
  value,
  onChange,
  onBlur,
  onKeyDown,
  onStartEdit,
  onStopEdit,
  autoFocus = false,
  type = "text",
  options,
}: EditableCellProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setEditValue(value);
  }, [value]);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Auto-focus when requested (e.g., from keyboard navigation)
  React.useEffect(() => {
    if (autoFocus && !isEditing) {
      setIsEditing(true);
      onStartEdit?.();
    }
  }, [autoFocus, isEditing, onStartEdit]);

  const handleSave = React.useCallback(() => {
    setIsEditing(false);
    onStopEdit?.();
    // Only call onChange if the value actually changed
    if (editValue !== value) {
      // Use setTimeout to ensure this happens after render
      setTimeout(() => {
        onChange(editValue);
        onBlur();
      }, 0);
    } else {
      onBlur();
    }
  }, [editValue, value, onChange, onBlur, onStopEdit]);

  const handleCancel = React.useCallback(() => {
    setEditValue(value);
    setIsEditing(false);
    onStopEdit?.();
  }, [value, onStopEdit]);

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSave();
    } else if (event.key === "Escape") {
      event.preventDefault();
      handleCancel();
    } else if (event.key === "Tab") {
      // Let the parent handle Tab navigation
      handleSave();
    }
    onKeyDown?.(event);
  }, [handleSave, handleCancel, onKeyDown]);

  const handleStartEdit = React.useCallback(() => {
    setIsEditing(true);
    onStartEdit?.();
  }, [onStartEdit]);

  // Handle clicks within the editing container to prevent losing focus
  const handleContainerClick = React.useCallback((event: React.MouseEvent) => {
    // Prevent event bubbling to parent elements that might cause focus loss
    event.stopPropagation();
  }, []);

  // Handle blur events to detect when focus moves outside the editing area
  const handleInputBlur = React.useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    // Check if the new focus target is within our editing container
    const relatedTarget = event.relatedTarget as HTMLElement;
    const container = containerRef.current;

    if (container && relatedTarget && container.contains(relatedTarget)) {
      // Focus is moving to another element within our container (like save/cancel buttons)
      // Don't exit edit mode
      return;
    }

    // Focus is moving outside our container, save and exit edit mode
    handleSave();
  }, [handleSave]);

  if (!isEditing) {
    return (
      <div
        className={cn(
          "cursor-pointer hover:bg-muted/50 rounded px-2 py-1 min-h-[32px] flex items-center",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
        )}
        onClick={handleStartEdit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleStartEdit();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label="Click to edit"
        title="Click to edit"
      >
        {type === "select" && options
          ? options.find((opt) => opt.value === value)?.label || value
          : String(value || "")}
      </div>
    );
  }

  if (type === "select" && options) {
    return (
      <div
        ref={containerRef}
        className="flex items-center gap-1"
        onClick={handleContainerClick}
      >
        <Select
          value={String(editValue)}
          onValueChange={(newValue) => setEditValue(newValue)}
        >
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          onClick={handleSave}
          onMouseDown={(e) => e.preventDefault()} // Prevent focus loss when clicking save
          className="p-1 hover:bg-green-100 rounded"
          title="Save"
        >
          <Check className="h-3 w-3 text-green-600" />
        </button>
        <button
          onClick={handleCancel}
          onMouseDown={(e) => e.preventDefault()} // Prevent focus loss when clicking cancel
          className="p-1 hover:bg-red-100 rounded"
          title="Cancel"
        >
          <X className="h-3 w-3 text-red-600" />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex items-center gap-1"
      onClick={handleContainerClick}
    >
      <Input
        ref={inputRef}
        type={type}
        value={String(editValue || "")}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleInputBlur}
        className="h-8"
      />
      <button
        onClick={handleSave}
        onMouseDown={(e) => e.preventDefault()} // Prevent input blur when clicking save
        className="p-1 hover:bg-green-100 rounded"
        title="Save"
      >
        <Check className="h-3 w-3 text-green-600" />
      </button>
      <button
        onClick={handleCancel}
        onMouseDown={(e) => e.preventDefault()} // Prevent input blur when clicking cancel
        className="p-1 hover:bg-red-100 rounded"
        title="Cancel"
      >
        <X className="h-3 w-3 text-red-600" />
      </button>
    </div>
  );
}

// Specialized editable cells for different data types
export function EditableTextCell(props: Omit<EditableCellProps, "type">) {
  return <EditableCell {...props} type="text" />;
}

export function EditableEmailCell(props: Omit<EditableCellProps, "type">) {
  return <EditableCell {...props} type="email" />;
}

export function EditableNumberCell(props: Omit<EditableCellProps, "type">) {
  return <EditableCell {...props} type="number" />;
}

export function EditablePhoneCell(props: Omit<EditableCellProps, "type">) {
  return <EditableCell {...props} type="tel" />;
}

export function EditableSelectCell(
  props: Omit<EditableCellProps, "type"> & { options: Array<{ label: string; value: any }> }
) {
  return <EditableCell {...props} type="select" />;
}
