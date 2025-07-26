import { ColumnDef, Table } from '@tanstack/react-table';
/**
 * Export format types
 */
export type ExportFormat = 'csv' | 'excel' | 'json' | 'print';
/**
 * Export configuration for individual operations
 */
export interface ExportConfig {
    /** Filename for the exported file (without extension) */
    filename?: string;
    /** Whether to include column headers */
    includeHeaders?: boolean;
    /** Custom column headers (overrides default headers) */
    customHeaders?: Record<string, string>;
    /** Columns to include in export (by column id) */
    includeColumns?: string[];
    /** Columns to exclude from export (by column id) */
    excludeColumns?: string[];
    /** Custom data transformer function */
    dataTransformer?: (data: any[]) => any[];
    /** Date format for date columns */
    dateFormat?: string;
}
/**
 * CSV-specific export configuration
 */
export interface CSVExportConfig extends ExportConfig {
    /** CSV delimiter (default: ',') */
    delimiter?: string;
    /** Quote character for CSV fields */
    quote?: string;
    /** Whether to quote all fields */
    quoteAll?: boolean;
}
/**
 * Excel-specific export configuration
 */
export interface ExcelExportConfig extends ExportConfig {
    /** Excel sheet name */
    sheetName?: string;
    /** Whether to auto-fit column widths */
    autoFitColumns?: boolean;
    /** Custom column widths */
    columnWidths?: Record<string, number>;
}
/**
 * Print-specific export configuration
 */
export interface PrintExportConfig extends ExportConfig {
    /** Page orientation */
    orientation?: 'portrait' | 'landscape';
    /** Paper size */
    paperSize?: 'A4' | 'letter' | 'legal';
    /** Print title */
    title?: string;
    /** Whether to include page numbers */
    includePageNumbers?: boolean;
    /** Custom CSS for print styling */
    customCSS?: string;
}
/**
 * Export result interface
 */
export interface ExportResult {
    /** Whether the export was successful */
    success: boolean;
    /** Error message if export failed */
    error?: string;
    /** Generated filename */
    filename?: string;
    /** Export format used */
    format: ExportFormat;
    /** Number of rows exported */
    rowCount: number;
    /** Export timestamp */
    timestamp: Date;
}
/**
 * Main export utility class
 */
export declare class TableExportUtils {
    /**
     * Export table data to CSV format
     */
    static exportToCSV<T = any>(data: T[], columns: ColumnDef<T>[], config?: CSVExportConfig): Promise<ExportResult>;
    /**
     * Export table data to Excel format
     */
    static exportToExcel<T = any>(data: T[], columns: ColumnDef<T>[], config?: ExcelExportConfig): Promise<ExportResult>;
    /**
     * Export table data to JSON format
     */
    static exportToJSON<T = any>(data: T[], columns: ColumnDef<T>[], config?: ExportConfig): Promise<ExportResult>;
    /**
     * Generate print-optimized table layout
     */
    static generatePrintLayout<T = any>(data: T[], columns: ColumnDef<T>[], config?: PrintExportConfig): string;
    /**
     * Open print dialog with optimized layout
     */
    static printTable<T = any>(data: T[], columns: ColumnDef<T>[], config?: PrintExportConfig): Promise<ExportResult>;
    /**
     * Export data from TanStack Table instance
     */
    static exportFromTable<T = any>(table: Table<T>, format: ExportFormat, config?: ExportConfig): Promise<ExportResult>;
    private static filterColumns;
    private static filterDataByColumns;
    private static generateCSVContent;
    private static escapeCSVField;
    private static generateExcelWorkbook;
    private static generatePrintHTML;
    private static generateTableHTML;
    private static getCellValue;
    private static escapeHTML;
    private static downloadFile;
    private static downloadExcelFile;
    private static convertWorkbookToCSV;
}
/**
 * React hook for table export functionality
 */
export declare function useTableExport<T = any>(): {
    exportToCSV: (data: T[], columns: ColumnDef<T>[], config?: CSVExportConfig) => Promise<ExportResult>;
    exportToExcel: (data: T[], columns: ColumnDef<T>[], config?: ExcelExportConfig) => Promise<ExportResult>;
    exportToJSON: (data: T[], columns: ColumnDef<T>[], config?: ExportConfig) => Promise<ExportResult>;
    printTable: (data: T[], columns: ColumnDef<T>[], config?: PrintExportConfig) => Promise<ExportResult>;
    exportFromTable: (table: Table<T>, format: ExportFormat, config?: ExportConfig) => Promise<ExportResult>;
};
/**
 * Export configuration builder for fluent API
 */
export declare class ExportConfigBuilder {
    private config;
    static create(): ExportConfigBuilder;
    filename(filename: string): ExportConfigBuilder;
    includeHeaders(include?: boolean): ExportConfigBuilder;
    customHeaders(headers: Record<string, string>): ExportConfigBuilder;
    includeColumns(columns: string[]): ExportConfigBuilder;
    excludeColumns(columns: string[]): ExportConfigBuilder;
    dataTransformer(transformer: (data: any[]) => any[]): ExportConfigBuilder;
    build(): ExportConfig;
}
/**
 * CSV-specific configuration builder
 */
export declare class CSVExportConfigBuilder extends ExportConfigBuilder {
    private csvConfig;
    static create(): CSVExportConfigBuilder;
    filename(filename: string): CSVExportConfigBuilder;
    includeHeaders(include?: boolean): CSVExportConfigBuilder;
    customHeaders(headers: Record<string, string>): CSVExportConfigBuilder;
    includeColumns(columns: string[]): CSVExportConfigBuilder;
    excludeColumns(columns: string[]): CSVExportConfigBuilder;
    dataTransformer(transformer: (data: any[]) => any[]): CSVExportConfigBuilder;
    delimiter(delimiter: string): CSVExportConfigBuilder;
    quote(quote: string): CSVExportConfigBuilder;
    quoteAll(quoteAll?: boolean): CSVExportConfigBuilder;
    build(): CSVExportConfig;
}
/**
 * Excel-specific configuration builder
 */
export declare class ExcelExportConfigBuilder extends ExportConfigBuilder {
    private excelConfig;
    static create(): ExcelExportConfigBuilder;
    filename(filename: string): ExcelExportConfigBuilder;
    includeHeaders(include?: boolean): ExcelExportConfigBuilder;
    customHeaders(headers: Record<string, string>): ExcelExportConfigBuilder;
    includeColumns(columns: string[]): ExcelExportConfigBuilder;
    excludeColumns(columns: string[]): ExcelExportConfigBuilder;
    dataTransformer(transformer: (data: any[]) => any[]): ExcelExportConfigBuilder;
    sheetName(name: string): ExcelExportConfigBuilder;
    autoFitColumns(autoFit?: boolean): ExcelExportConfigBuilder;
    columnWidths(widths: Record<string, number>): ExcelExportConfigBuilder;
    build(): ExcelExportConfig;
}
/**
 * Print-specific configuration builder
 */
export declare class PrintExportConfigBuilder extends ExportConfigBuilder {
    private printConfig;
    static create(): PrintExportConfigBuilder;
    filename(filename: string): PrintExportConfigBuilder;
    includeHeaders(include?: boolean): PrintExportConfigBuilder;
    customHeaders(headers: Record<string, string>): PrintExportConfigBuilder;
    includeColumns(columns: string[]): PrintExportConfigBuilder;
    excludeColumns(columns: string[]): PrintExportConfigBuilder;
    dataTransformer(transformer: (data: any[]) => any[]): PrintExportConfigBuilder;
    orientation(orientation: 'portrait' | 'landscape'): PrintExportConfigBuilder;
    paperSize(size: 'A4' | 'letter' | 'legal'): PrintExportConfigBuilder;
    title(title: string): PrintExportConfigBuilder;
    includePageNumbers(include?: boolean): PrintExportConfigBuilder;
    customCSS(css: string): PrintExportConfigBuilder;
    build(): PrintExportConfig;
}
//# sourceMappingURL=export-utils.d.ts.map