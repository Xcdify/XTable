import '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    // Row styling
    getRowClassName?: (row: Row<TData>) => string;
    
    // Editing functionality
    isEditingMode?: boolean;
    isEditing?: boolean;
    editingRows?: Set<string>;
    pendingChanges?: Map<string, Record<string, unknown>>;
    updateData?: (rowIndex: number, columnId: string, value: unknown) => void;
    startEditing?: (rowId: string) => void;
    stopEditing?: (rowId: string) => void;
    saveChanges?: () => void;
    cancelChanges?: () => void;
    
    // Grouping functionality
    enableGrouping?: boolean;
  }

  interface ColumnMeta<TData extends RowData, TValue> {
    // Column styling
    headerClassName?: string;
    cellClassName?: string;

    // Grouping
    enableGrouping?: boolean;

    // Editing
    editable?: boolean;
    enableEditing?: boolean;

    // Display
    label?: string;
  }
}
