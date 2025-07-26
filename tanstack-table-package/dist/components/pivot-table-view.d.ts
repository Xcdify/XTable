interface PivotState {
    rowFields: string[];
    columnFields: string[];
    valueFields: {
        field: string;
        aggregation: 'sum' | 'avg' | 'count';
    }[];
}
interface PivotTableViewProps<T = any> {
    data: T[];
    pivotState: PivotState;
}
export declare function PivotTableView<T = any>({ data, pivotState }: PivotTableViewProps<T>): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=pivot-table-view.d.ts.map