import { SortingState, ColumnFiltersState, RowSelectionState, VisibilityState, ColumnPinningState, GroupingState, ExpandedState, ColumnDef } from "@tanstack/react-table";
import { FeatureKey } from "../components/table-columns";
import { PerformanceConfig } from "../utils/performance";
import { AdvancedTableConfig } from "../types/table-config";
interface UseAdvancedTableProps<T = any> {
    data: T[];
    columns?: ColumnDef<T>[];
    initialFeatures?: Partial<Record<FeatureKey, boolean>>;
    preset?: string;
    performanceConfig?: Partial<PerformanceConfig>;
    config?: Partial<AdvancedTableConfig<T>>;
}
export declare function useAdvancedTable<T = any>({ data, columns: customColumns, initialFeatures, preset, performanceConfig, config, }: UseAdvancedTableProps<T>): {
    table: import("@tanstack/react-table").Table<T>;
    features: Record<FeatureKey, boolean>;
    toggleFeature: (feature: FeatureKey) => void;
    sorting: SortingState;
    setSorting: import("react").Dispatch<import("react").SetStateAction<SortingState>>;
    columnFilters: ColumnFiltersState;
    setColumnFilters: import("react").Dispatch<import("react").SetStateAction<ColumnFiltersState>>;
    rowSelection: RowSelectionState;
    setRowSelection: import("react").Dispatch<import("react").SetStateAction<RowSelectionState>>;
    columnVisibility: VisibilityState;
    setColumnVisibility: import("react").Dispatch<import("react").SetStateAction<VisibilityState>>;
    columnPinning: ColumnPinningState;
    setColumnPinning: import("react").Dispatch<import("react").SetStateAction<ColumnPinningState>>;
    grouping: GroupingState;
    setGrouping: import("react").Dispatch<import("react").SetStateAction<GroupingState>>;
    expanded: ExpandedState;
    setExpanded: import("react").Dispatch<import("react").SetStateAction<ExpandedState>>;
    globalFilter: string;
    setGlobalFilter: import("react").Dispatch<import("react").SetStateAction<string>>;
    debouncedSetGlobalFilter: import("react").Dispatch<import("react").SetStateAction<string>>;
    debouncedSetColumnFilters: import("react").Dispatch<import("react").SetStateAction<ColumnFiltersState>>;
    handleGroupChange: (columnId: string) => void;
    handleRemoveGroup: (columnId: string) => void;
    computedState: {
        totalRows: number;
        totalColumns: number;
        hasData: boolean;
        enabledFeatures: string[];
        featureCount: number;
        isLargeDataset: boolean;
        shouldVirtualize: boolean;
    };
};
export {};
//# sourceMappingURL=useAdvancedTable.d.ts.map