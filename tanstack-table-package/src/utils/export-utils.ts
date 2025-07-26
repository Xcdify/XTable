import { ColumnDef, Table } from '@tanstack/react-table';
import { ExportOptions } from '../types/table-config';

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
export class TableExportUtils {
  /**
   * Export table data to CSV format
   */
  static async exportToCSV<T = any>(
    data: T[],
    columns: ColumnDef<T>[],
    config: CSVExportConfig = {}
  ): Promise<ExportResult> {
    try {
      const {
        filename = 'table-export',
        includeHeaders = true,
        delimiter = ',',
        quote = '"',
        quoteAll = false,
        customHeaders,
        includeColumns,
        excludeColumns,
        dataTransformer,
      } = config;

      // Filter columns based on include/exclude lists
      const filteredColumns = this.filterColumns(columns, includeColumns, excludeColumns);
      
      // Transform data if transformer provided
      const processedData = dataTransformer ? dataTransformer(data) : data;
      
      // Generate CSV content
      const csvContent = this.generateCSVContent(
        processedData,
        filteredColumns,
        {
          includeHeaders,
          delimiter,
          quote,
          quoteAll,
          customHeaders,
        }
      );

      // Download the file
      const finalFilename = `${filename}.csv`;
      this.downloadFile(csvContent, finalFilename, 'text/csv');

      return {
        success: true,
        filename: finalFilename,
        format: 'csv',
        rowCount: processedData.length,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        format: 'csv',
        rowCount: 0,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Export table data to Excel format
   */
  static async exportToExcel<T = any>(
    data: T[],
    columns: ColumnDef<T>[],
    config: ExcelExportConfig = {}
  ): Promise<ExportResult> {
    try {
      const {
        filename = 'table-export',
        sheetName = 'Sheet1',
        includeHeaders = true,
        customHeaders,
        includeColumns,
        excludeColumns,
        dataTransformer,
      } = config;

      // Filter columns based on include/exclude lists
      const filteredColumns = this.filterColumns(columns, includeColumns, excludeColumns);
      
      // Transform data if transformer provided
      const processedData = dataTransformer ? dataTransformer(data) : data;

      // Generate Excel workbook
      const workbook = this.generateExcelWorkbook(
        processedData,
        filteredColumns,
        {
          sheetName,
          includeHeaders,
          customHeaders,
        }
      );

      // Download the file
      const finalFilename = `${filename}.xlsx`;
      this.downloadExcelFile(workbook, finalFilename);

      return {
        success: true,
        filename: finalFilename,
        format: 'excel',
        rowCount: processedData.length,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        format: 'excel',
        rowCount: 0,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Export table data to JSON format
   */
  static async exportToJSON<T = any>(
    data: T[],
    columns: ColumnDef<T>[],
    config: ExportConfig = {}
  ): Promise<ExportResult> {
    try {
      const {
        filename = 'table-export',
        includeColumns,
        excludeColumns,
        dataTransformer,
      } = config;

      // Transform data if transformer provided
      let processedData = dataTransformer ? dataTransformer(data) : data;

      // Filter data based on column selection
      if (includeColumns || excludeColumns) {
        processedData = this.filterDataByColumns(processedData, columns, includeColumns, excludeColumns);
      }

      // Generate JSON content
      const jsonContent = JSON.stringify(processedData, null, 2);

      // Download the file
      const finalFilename = `${filename}.json`;
      this.downloadFile(jsonContent, finalFilename, 'application/json');

      return {
        success: true,
        filename: finalFilename,
        format: 'json',
        rowCount: processedData.length,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        format: 'json',
        rowCount: 0,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Generate print-optimized table layout
   */
  static generatePrintLayout<T = any>(
    data: T[],
    columns: ColumnDef<T>[],
    config: PrintExportConfig = {}
  ): string {
    const {
      title = 'Table Export',
      orientation = 'portrait',
      paperSize = 'A4',
      includeHeaders = true,
      includePageNumbers = true,
      customCSS = '',
      customHeaders,
      includeColumns,
      excludeColumns,
    } = config;

    // Filter columns based on include/exclude lists
    const filteredColumns = this.filterColumns(columns, includeColumns, excludeColumns);

    // Generate HTML content for printing
    const htmlContent = this.generatePrintHTML(
      data,
      filteredColumns,
      {
        title,
        orientation,
        paperSize,
        includeHeaders,
        includePageNumbers,
        customCSS,
        customHeaders,
      }
    );

    return htmlContent;
  }

  /**
   * Open print dialog with optimized layout
   */
  static async printTable<T = any>(
    data: T[],
    columns: ColumnDef<T>[],
    config: PrintExportConfig = {}
  ): Promise<ExportResult> {
    try {
      const htmlContent = this.generatePrintLayout(data, columns, config);
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Unable to open print window. Please check popup blocker settings.');
      }

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load, then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };

      return {
        success: true,
        format: 'print',
        rowCount: data.length,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        format: 'print',
        rowCount: 0,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Export data from TanStack Table instance
   */
  static async exportFromTable<T = any>(
    table: Table<T>,
    format: ExportFormat,
    config: ExportConfig = {}
  ): Promise<ExportResult> {
    const data = table.getRowModel().rows.map(row => row.original);
    const columns = table.getAllColumns().map(col => col.columnDef);

    switch (format) {
      case 'csv':
        return this.exportToCSV(data, columns, config as CSVExportConfig);
      case 'excel':
        return this.exportToExcel(data, columns, config as ExcelExportConfig);
      case 'json':
        return this.exportToJSON(data, columns, config);
      case 'print':
        return this.printTable(data, columns, config as PrintExportConfig);
      default:
        return {
          success: false,
          error: `Unsupported export format: ${format}`,
          format,
          rowCount: 0,
          timestamp: new Date(),
        };
    }
  }

  // Private helper methods

  private static filterColumns<T>(
    columns: ColumnDef<T>[],
    includeColumns?: string[],
    excludeColumns?: string[]
  ): ColumnDef<T>[] {
    let filteredColumns = columns;

    if (includeColumns) {
      filteredColumns = filteredColumns.filter(col => 
        includeColumns.includes(col.id || '')
      );
    }

    if (excludeColumns) {
      filteredColumns = filteredColumns.filter(col => 
        !excludeColumns.includes(col.id || '')
      );
    }

    return filteredColumns;
  }

  private static filterDataByColumns<T extends Record<string, any>>(
    data: T[],
    columns: ColumnDef<T>[],
    includeColumns?: string[],
    excludeColumns?: string[]
  ): Partial<T>[] {
    const filteredColumns = this.filterColumns(columns, includeColumns, excludeColumns);
    const columnIds = filteredColumns.map(col => col.id).filter(Boolean);

    return data.map(row => {
      const filteredRow: Partial<T> = {};
      columnIds.forEach(id => {
        if (id && id in row) {
          (filteredRow as any)[id] = (row as any)[id];
        }
      });
      return filteredRow;
    });
  }

  private static generateCSVContent<T>(
    data: T[],
    columns: ColumnDef<T>[],
    options: {
      includeHeaders: boolean;
      delimiter: string;
      quote: string;
      quoteAll: boolean;
      customHeaders?: Record<string, string>;
    }
  ): string {
    const { includeHeaders, delimiter, quote, quoteAll, customHeaders } = options;
    const lines: string[] = [];

    // Add headers if requested
    if (includeHeaders) {
      const headers = columns.map(col => {
        const headerId = col.id || '';
        const headerText = customHeaders?.[headerId] || 
                          (typeof col.header === 'string' ? col.header : headerId);
        return this.escapeCSVField(headerText, delimiter, quote, quoteAll);
      });
      lines.push(headers.join(delimiter));
    }

    // Add data rows
    data.forEach(row => {
      const values = columns.map(col => {
        const value = this.getCellValue(row, col);
        return this.escapeCSVField(String(value || ''), delimiter, quote, quoteAll);
      });
      lines.push(values.join(delimiter));
    });

    return lines.join('\n');
  }

  private static escapeCSVField(
    field: string,
    delimiter: string,
    quote: string,
    quoteAll: boolean
  ): string {
    const needsQuoting = quoteAll || 
                        field.includes(delimiter) || 
                        field.includes(quote) || 
                        field.includes('\n') || 
                        field.includes('\r');

    if (needsQuoting) {
      const escapedField = field.replace(new RegExp(quote, 'g'), quote + quote);
      return quote + escapedField + quote;
    }

    return field;
  }

  private static generateExcelWorkbook<T>(
    data: T[],
    columns: ColumnDef<T>[],
    options: {
      sheetName: string;
      includeHeaders: boolean;
      customHeaders?: Record<string, string>;
    }
  ): any {
    // This is a simplified Excel generation
    // In a real implementation, you would use a library like xlsx or exceljs
    const { sheetName, includeHeaders, customHeaders } = options;
    
    const worksheetData: any[][] = [];

    // Add headers if requested
    if (includeHeaders) {
      const headers = columns.map(col => {
        const headerId = col.id || '';
        return customHeaders?.[headerId] || 
               (typeof col.header === 'string' ? col.header : headerId);
      });
      worksheetData.push(headers);
    }

    // Add data rows
    data.forEach(row => {
      const values = columns.map(col => this.getCellValue(row, col));
      worksheetData.push(values);
    });

    // Return a simple workbook structure
    // In a real implementation, this would be a proper Excel workbook
    return {
      SheetNames: [sheetName],
      Sheets: {
        [sheetName]: worksheetData
      }
    };
  }

  private static generatePrintHTML<T>(
    data: T[],
    columns: ColumnDef<T>[],
    options: {
      title: string;
      orientation: 'portrait' | 'landscape';
      paperSize: string;
      includeHeaders: boolean;
      includePageNumbers: boolean;
      customCSS: string;
      customHeaders?: Record<string, string>;
    }
  ): string {
    const { title, orientation, paperSize, includeHeaders, includePageNumbers, customCSS, customHeaders } = options;

    const printCSS = `
      <style>
        @page {
          size: ${paperSize} ${orientation};
          margin: 1in;
        }
        
        body {
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          margin: 0;
          padding: 0;
        }
        
        .print-header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
        }
        
        .print-title {
          font-size: 18px;
          font-weight: bold;
          margin: 0;
        }
        
        .print-date {
          font-size: 10px;
          color: #666;
          margin: 5px 0 0 0;
        }
        
        .print-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        .print-table th,
        .print-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          font-size: 11px;
        }
        
        .print-table th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        
        .print-table tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        
        .print-footer {
          position: fixed;
          bottom: 0;
          width: 100%;
          text-align: center;
          font-size: 10px;
          color: #666;
        }
        
        @media print {
          .print-table {
            page-break-inside: auto;
          }
          
          .print-table tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          .print-table thead {
            display: table-header-group;
          }
          
          .print-table tfoot {
            display: table-footer-group;
          }
        }
        
        ${customCSS}
      </style>
    `;

    const headerHTML = `
      <div class="print-header">
        <h1 class="print-title">${title}</h1>
        <p class="print-date">Generated on ${new Date().toLocaleString()}</p>
      </div>
    `;

    const tableHTML = this.generateTableHTML(data, columns, includeHeaders, customHeaders);

    const footerHTML = includePageNumbers ? `
      <div class="print-footer">
        Page <span class="page-number"></span>
      </div>
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          ${printCSS}
        </head>
        <body>
          ${headerHTML}
          ${tableHTML}
          ${footerHTML}
        </body>
      </html>
    `;
  }

  private static generateTableHTML<T>(
    data: T[],
    columns: ColumnDef<T>[],
    includeHeaders: boolean,
    customHeaders?: Record<string, string>
  ): string {
    let html = '<table class="print-table">';

    // Add headers if requested
    if (includeHeaders) {
      html += '<thead><tr>';
      columns.forEach(col => {
        const headerId = col.id || '';
        const headerText = customHeaders?.[headerId] || 
                          (typeof col.header === 'string' ? col.header : headerId);
        html += `<th>${this.escapeHTML(headerText)}</th>`;
      });
      html += '</tr></thead>';
    }

    // Add data rows
    html += '<tbody>';
    data.forEach(row => {
      html += '<tr>';
      columns.forEach(col => {
        const value = this.getCellValue(row, col);
        html += `<td>${this.escapeHTML(String(value || ''))}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody>';

    html += '</table>';
    return html;
  }

  private static getCellValue<T>(row: T, column: ColumnDef<T>): any {
    // Handle accessor function
    if ('accessorFn' in column && typeof column.accessorFn === 'function') {
      return column.accessorFn(row, 0);
    }
    
    // Handle accessor key
    if ('accessorKey' in column && column.accessorKey) {
      const key = column.accessorKey as keyof T;
      return row[key];
    }
    
    // Handle direct property access via id
    if (column.id && typeof row === 'object' && row !== null) {
      const value = (row as any)[column.id];
      if (value !== undefined) {
        return value;
      }
    }
    
    return '';
  }

  private static escapeHTML(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  private static downloadExcelFile(workbook: any, filename: string): void {
    // This is a simplified implementation
    // In a real implementation, you would use a library like xlsx to generate proper Excel files
    const csvContent = this.convertWorkbookToCSV(workbook);
    this.downloadFile(csvContent, filename.replace('.xlsx', '.csv'), 'text/csv');
  }

  private static convertWorkbookToCSV(workbook: any): string {
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    return worksheet.map((row: any[]) => 
      row.map((cell: any) => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  }
}

/**
 * React hook for table export functionality
 */
export function useTableExport<T = any>() {
  const exportToCSV = async (
    data: T[],
    columns: ColumnDef<T>[],
    config?: CSVExportConfig
  ) => {
    return TableExportUtils.exportToCSV(data, columns, config);
  };

  const exportToExcel = async (
    data: T[],
    columns: ColumnDef<T>[],
    config?: ExcelExportConfig
  ) => {
    return TableExportUtils.exportToExcel(data, columns, config);
  };

  const exportToJSON = async (
    data: T[],
    columns: ColumnDef<T>[],
    config?: ExportConfig
  ) => {
    return TableExportUtils.exportToJSON(data, columns, config);
  };

  const printTable = async (
    data: T[],
    columns: ColumnDef<T>[],
    config?: PrintExportConfig
  ) => {
    return TableExportUtils.printTable(data, columns, config);
  };

  const exportFromTable = async (
    table: Table<T>,
    format: ExportFormat,
    config?: ExportConfig
  ) => {
    return TableExportUtils.exportFromTable(table, format, config);
  };

  return {
    exportToCSV,
    exportToExcel,
    exportToJSON,
    printTable,
    exportFromTable,
  };
}

/**
 * Export configuration builder for fluent API
 */
export class ExportConfigBuilder {
  private config: ExportConfig = {};

  static create(): ExportConfigBuilder {
    return new ExportConfigBuilder();
  }

  filename(filename: string): ExportConfigBuilder {
    this.config.filename = filename;
    return this;
  }

  includeHeaders(include: boolean = true): ExportConfigBuilder {
    this.config.includeHeaders = include;
    return this;
  }

  customHeaders(headers: Record<string, string>): ExportConfigBuilder {
    this.config.customHeaders = headers;
    return this;
  }

  includeColumns(columns: string[]): ExportConfigBuilder {
    this.config.includeColumns = columns;
    return this;
  }

  excludeColumns(columns: string[]): ExportConfigBuilder {
    this.config.excludeColumns = columns;
    return this;
  }

  dataTransformer(transformer: (data: any[]) => any[]): ExportConfigBuilder {
    this.config.dataTransformer = transformer;
    return this;
  }

  build(): ExportConfig {
    return { ...this.config };
  }
}

/**
 * CSV-specific configuration builder
 */
export class CSVExportConfigBuilder extends ExportConfigBuilder {
  private csvConfig: Partial<CSVExportConfig> = {};

  static create(): CSVExportConfigBuilder {
    return new CSVExportConfigBuilder();
  }

  filename(filename: string): CSVExportConfigBuilder {
    super.filename(filename);
    return this;
  }

  includeHeaders(include: boolean = true): CSVExportConfigBuilder {
    super.includeHeaders(include);
    return this;
  }

  customHeaders(headers: Record<string, string>): CSVExportConfigBuilder {
    super.customHeaders(headers);
    return this;
  }

  includeColumns(columns: string[]): CSVExportConfigBuilder {
    super.includeColumns(columns);
    return this;
  }

  excludeColumns(columns: string[]): CSVExportConfigBuilder {
    super.excludeColumns(columns);
    return this;
  }

  dataTransformer(transformer: (data: any[]) => any[]): CSVExportConfigBuilder {
    super.dataTransformer(transformer);
    return this;
  }

  delimiter(delimiter: string): CSVExportConfigBuilder {
    this.csvConfig.delimiter = delimiter;
    return this;
  }

  quote(quote: string): CSVExportConfigBuilder {
    this.csvConfig.quote = quote;
    return this;
  }

  quoteAll(quoteAll: boolean = true): CSVExportConfigBuilder {
    this.csvConfig.quoteAll = quoteAll;
    return this;
  }

  build(): CSVExportConfig {
    return { ...super.build(), ...this.csvConfig };
  }
}

/**
 * Excel-specific configuration builder
 */
export class ExcelExportConfigBuilder extends ExportConfigBuilder {
  private excelConfig: Partial<ExcelExportConfig> = {};

  static create(): ExcelExportConfigBuilder {
    return new ExcelExportConfigBuilder();
  }

  filename(filename: string): ExcelExportConfigBuilder {
    super.filename(filename);
    return this;
  }

  includeHeaders(include: boolean = true): ExcelExportConfigBuilder {
    super.includeHeaders(include);
    return this;
  }

  customHeaders(headers: Record<string, string>): ExcelExportConfigBuilder {
    super.customHeaders(headers);
    return this;
  }

  includeColumns(columns: string[]): ExcelExportConfigBuilder {
    super.includeColumns(columns);
    return this;
  }

  excludeColumns(columns: string[]): ExcelExportConfigBuilder {
    super.excludeColumns(columns);
    return this;
  }

  dataTransformer(transformer: (data: any[]) => any[]): ExcelExportConfigBuilder {
    super.dataTransformer(transformer);
    return this;
  }

  sheetName(name: string): ExcelExportConfigBuilder {
    this.excelConfig.sheetName = name;
    return this;
  }

  autoFitColumns(autoFit: boolean = true): ExcelExportConfigBuilder {
    this.excelConfig.autoFitColumns = autoFit;
    return this;
  }

  columnWidths(widths: Record<string, number>): ExcelExportConfigBuilder {
    this.excelConfig.columnWidths = widths;
    return this;
  }

  build(): ExcelExportConfig {
    return { ...super.build(), ...this.excelConfig };
  }
}

/**
 * Print-specific configuration builder
 */
export class PrintExportConfigBuilder extends ExportConfigBuilder {
  private printConfig: Partial<PrintExportConfig> = {};

  static create(): PrintExportConfigBuilder {
    return new PrintExportConfigBuilder();
  }

  filename(filename: string): PrintExportConfigBuilder {
    super.filename(filename);
    return this;
  }

  includeHeaders(include: boolean = true): PrintExportConfigBuilder {
    super.includeHeaders(include);
    return this;
  }

  customHeaders(headers: Record<string, string>): PrintExportConfigBuilder {
    super.customHeaders(headers);
    return this;
  }

  includeColumns(columns: string[]): PrintExportConfigBuilder {
    super.includeColumns(columns);
    return this;
  }

  excludeColumns(columns: string[]): PrintExportConfigBuilder {
    super.excludeColumns(columns);
    return this;
  }

  dataTransformer(transformer: (data: any[]) => any[]): PrintExportConfigBuilder {
    super.dataTransformer(transformer);
    return this;
  }

  orientation(orientation: 'portrait' | 'landscape'): PrintExportConfigBuilder {
    this.printConfig.orientation = orientation;
    return this;
  }

  paperSize(size: 'A4' | 'letter' | 'legal'): PrintExportConfigBuilder {
    this.printConfig.paperSize = size;
    return this;
  }

  title(title: string): PrintExportConfigBuilder {
    this.printConfig.title = title;
    return this;
  }

  includePageNumbers(include: boolean = true): PrintExportConfigBuilder {
    this.printConfig.includePageNumbers = include;
    return this;
  }

  customCSS(css: string): PrintExportConfigBuilder {
    this.printConfig.customCSS = css;
    return this;
  }

  build(): PrintExportConfig {
    return { ...super.build(), ...this.printConfig };
  }
}