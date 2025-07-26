import React from "react";
interface BaseEditableCellProps {
    initialValue: any;
    depth: number;
    onUpdate?: (value: any) => void;
    onKeyDown?: (e: React.KeyboardEvent) => void;
}
export declare const EditableTextCell: React.FC<BaseEditableCellProps>;
export declare const EditableNumberCell: React.FC<BaseEditableCellProps>;
export declare const EditableDateCell: React.FC<BaseEditableCellProps>;
export declare const EditableSelectCell: React.FC<BaseEditableCellProps & {
    options: string[];
    getOptionStyles?: (option: string) => string;
}>;
export declare const EditableCurrencyCell: React.FC<BaseEditableCellProps>;
export {};
//# sourceMappingURL=EnhancedEditableCell.d.ts.map