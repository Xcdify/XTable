import { ColumnDef } from "@tanstack/react-table";
export type FeatureKey = "sorting" | "filtering" | "pagination" | "rowSelection" | "columnVisibility" | "columnResizing" | "columnPinning" | "rowExpansion" | "globalFiltering" | "grouping" | "inlineEditing" | "pivoting" | "virtualization" | "exporting";
export declare const createColumns: <T = any>(features: Record<FeatureKey, boolean>, onDataUpdate?: (rowIndex: number, columnId: string, value: any) => void) => ColumnDef<T>[];
//# sourceMappingURL=column-definitions.d.ts.map