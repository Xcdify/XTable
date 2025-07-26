import { Table } from '@tanstack/react-table';
interface UseKeyboardNavigationProps<T> {
    table: Table<T>;
    enabled?: boolean;
}
export declare function useKeyboardNavigation<T>({ table, enabled }: UseKeyboardNavigationProps<T>): {
    tableRef: import("react").RefObject<HTMLTableElement | null>;
    focusCell: (rowIndex: number, columnIndex: number) => void;
    currentCell: {
        rowIndex: number;
        columnIndex: number;
    };
};
export {};
//# sourceMappingURL=useKeyboardNavigation.d.ts.map