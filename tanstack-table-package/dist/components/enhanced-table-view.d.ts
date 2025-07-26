import { Table } from "@tanstack/react-table";
import { FeatureKey } from "./table-columns";
import { EnhancedThemeOptions } from "../types/theme";
interface EnhancedTableViewProps<T = any> {
    table: Table<T>;
    features: Record<FeatureKey, boolean>;
    theme?: Partial<EnhancedThemeOptions>;
}
export declare function EnhancedTableView<T = any>({ table, features, theme }: EnhancedTableViewProps<T>): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=enhanced-table-view.d.ts.map