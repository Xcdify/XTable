import React from "react";
import { Column } from "@tanstack/react-table";
interface DragDropAreaProps<T = any> {
    groupedColumns: string[];
    onGroupChange: (columnId: string) => void;
    onRemoveGroup: (columnId: string) => void;
    allColumns: Column<T, unknown>[];
}
export declare function DragDropArea<T = any>({ groupedColumns, onGroupChange, onRemoveGroup, allColumns }: DragDropAreaProps<T>): import("react/jsx-runtime").JSX.Element;
interface DraggableColumnHeaderProps {
    children: React.ReactNode;
    columnId: string;
    canGroup: boolean;
}
export declare function DraggableColumnHeader({ children, columnId, canGroup }: DraggableColumnHeaderProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=drag-drop-area.d.ts.map