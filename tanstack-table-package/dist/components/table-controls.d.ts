import { Table } from "@tanstack/react-table";
import { FeatureKey } from "./table-columns";
import { EnhancedThemeOptions } from "../types/theme";
export declare const featureList: Record<FeatureKey, string>;
interface TableControlsProps<T = any> {
    enabled: Record<FeatureKey, boolean>;
    onToggleFeature: (feature: FeatureKey) => void;
    table: Table<T>;
    globalFilter: string;
    onGlobalFilterChange: (value: string) => void;
    onDebouncedGlobalFilterChange?: (value: string) => void;
    rowSelection: Record<string, boolean>;
    theme?: Partial<EnhancedThemeOptions>;
}
export declare function TableControls<T = any>({ enabled, onToggleFeature, table, globalFilter, onGlobalFilterChange, onDebouncedGlobalFilterChange, rowSelection, theme, }: TableControlsProps<T>): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=table-controls.d.ts.map