import { Table } from "@tanstack/react-table";
import { FeatureKey } from "./table-columns";
import { EnhancedThemeOptions } from "../types/theme";
interface VirtualizedTableViewProps<T = any> {
    table: Table<T>;
    features: Record<FeatureKey, boolean>;
    height?: number;
    rowHeight?: number;
    overscan?: number;
    theme?: Partial<EnhancedThemeOptions>;
}
export declare function VirtualizedTableView<T = any>({ table, features, height, rowHeight, overscan, theme }: VirtualizedTableViewProps<T>): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=virtualized-table-view.d.ts.map