'use client';

import React, { useState } from 'react';
import { Table } from '@tanstack/react-table';
import { 
  useTableExport,
  CSVExportConfigBuilder,
  ExcelExportConfigBuilder,
  PrintExportConfigBuilder,
  ExportResult,
  ExportFormat 
} from '../utils/export-utils';

interface ExportControlsProps<T = any> {
  table: Table<T>;
  enabled?: boolean;
}

export function ExportControls<T = any>({ table, enabled = true }: ExportControlsProps<T>) {
  const [isExporting, setIsExporting] = useState(false);
  const [lastExportResult, setLastExportResult] = useState<ExportResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { exportToCSV, exportToExcel, exportToJSON, printTable, exportFromTable } = useTableExport<T>();

  if (!enabled) return null;

  const handleQuickExport = async (format: ExportFormat) => {
    setIsExporting(true);
    setLastExportResult(null);

    try {
      const result = await exportFromTable(table, format, {
        filename: `table-export-${new Date().toISOString().split('T')[0]}`,
        includeHeaders: true,
      });
      
      setLastExportResult(result);
    } catch (error) {
      setLastExportResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        format,
        rowCount: 0,
        timestamp: new Date(),
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleAdvancedCSVExport = async () => {
    setIsExporting(true);
    setLastExportResult(null);

    try {
      const data = table.getRowModel().rows.map(row => row.original);
      const columns = table.getAllColumns().map(col => col.columnDef);

      const config = CSVExportConfigBuilder.create()
        .filename(`detailed-export-${new Date().toISOString().split('T')[0]}`)
        .delimiter(',')
        .includeHeaders(true)
        .customHeaders({
          firstName: 'First Name',
          lastName: 'Last Name',
          department: 'Department',
          salary: 'Annual Salary (USD)',
          performance: 'Performance Rating',
          joinDate: 'Date Joined',
        })
        .dataTransformer((data) => 
          data.map(item => ({
            ...item,
            // Generic data transformation - users can override this
            ...(typeof item === 'object' && item !== null ? item : {})
          }))
        )
        .build();

      const result = await exportToCSV(data, columns, config);
      setLastExportResult(result);
    } catch (error) {
      setLastExportResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        format: 'csv',
        rowCount: 0,
        timestamp: new Date(),
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleAdvancedExcelExport = async () => {
    setIsExporting(true);
    setLastExportResult(null);

    try {
      const data = table.getRowModel().rows.map(row => row.original);
      const columns = table.getAllColumns().map(col => col.columnDef);

      const config = ExcelExportConfigBuilder.create()
        .filename(`employee-spreadsheet-${new Date().toISOString().split('T')[0]}`)
        .sheetName('Employee Data')
        .includeHeaders(true)
        .autoFitColumns(true)
        .customHeaders({
          firstName: 'First Name',
          lastName: 'Last Name',
          department: 'Department',
          salary: 'Annual Salary',
          performance: 'Performance Rating',
        })
        .build();

      const result = await exportToExcel(data, columns, config);
      setLastExportResult(result);
    } catch (error) {
      setLastExportResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        format: 'excel',
        rowCount: 0,
        timestamp: new Date(),
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintExport = async () => {
    setIsExporting(true);
    setLastExportResult(null);

    try {
      const data = table.getRowModel().rows.map(row => row.original);
      const columns = table.getAllColumns().map(col => col.columnDef);

      const config = PrintExportConfigBuilder.create()
        .title('Employee Directory')
        .orientation('landscape')
        .paperSize('A4')
        .includePageNumbers(true)
        .includeHeaders(true)
        .customCSS(`
          .print-table th { 
            background-color: #4f46e5 !important; 
            color: white !important; 
          }
          .print-table td { 
            font-size: 11px !important; 
          }
          .print-table tr:nth-child(even) {
            background-color: #f8f9fa !important;
          }
        `)
        .customHeaders({
          firstName: 'First Name',
          lastName: 'Last Name',
          department: 'Dept.',
          salary: 'Salary',
        })
        .build();

      const result = await printTable(data, columns, config);
      setLastExportResult(result);
    } catch (error) {
      setLastExportResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        format: 'print',
        rowCount: 0,
        timestamp: new Date(),
      });
    } finally {
      setIsExporting(false);
    }
  };

  const selectedRowCount = Object.keys(table.getState().rowSelection || {}).length;
  const totalRowCount = table.getRowModel().rows.length;

  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Export Data
        </h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Options
        </button>
      </div>

      {/* Export Info */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        {selectedRowCount > 0 ? (
          <span>Exporting {selectedRowCount} selected rows of {totalRowCount} total</span>
        ) : (
          <span>Exporting all {totalRowCount} rows</span>
        )}
      </div>

      {/* Quick Export Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <button
          onClick={() => handleQuickExport('csv')}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isExporting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <span>📄</span>
          )}
          CSV
        </button>

        <button
          onClick={() => handleQuickExport('excel')}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isExporting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <span>📊</span>
          )}
          Excel
        </button>

        <button
          onClick={() => handleQuickExport('json')}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isExporting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <span>🔧</span>
          )}
          JSON
        </button>

        <button
          onClick={handlePrintExport}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isExporting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <span>🖨️</span>
          )}
          Print
        </button>
      </div>

      {/* Advanced Export Options */}
      {showAdvanced && (
        <div className="border-t pt-4">
          <h4 className="text-md font-medium mb-3 text-gray-900 dark:text-gray-100">
            Advanced Export Options
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={handleAdvancedCSVExport}
              disabled={isExporting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Enhanced CSV
            </button>

            <button
              onClick={handleAdvancedExcelExport}
              disabled={isExporting}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Formatted Excel
            </button>

            <button
              onClick={() => handleQuickExport('print')}
              disabled={isExporting}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Custom Print Layout
            </button>
          </div>

          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            <p><strong>Enhanced CSV:</strong> Includes formatted salary values and custom headers</p>
            <p><strong>Formatted Excel:</strong> Auto-fit columns with professional formatting</p>
            <p><strong>Custom Print:</strong> Landscape layout with custom styling</p>
          </div>
        </div>
      )}

      {/* Export Result */}
      {lastExportResult && (
        <div className={`mt-4 p-3 rounded-md border ${
          lastExportResult.success 
            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
            : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full ${
                lastExportResult.success ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
              <span className={`text-sm font-medium ${
                lastExportResult.success 
                  ? 'text-green-800 dark:text-green-200' 
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {lastExportResult.format.toUpperCase()} Export
              </span>
              {lastExportResult.filename && (
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  ({lastExportResult.filename})
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {lastExportResult.timestamp.toLocaleTimeString()}
            </span>
          </div>
          
          {lastExportResult.success ? (
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Successfully exported {lastExportResult.rowCount} rows
            </p>
          ) : (
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              Error: {lastExportResult.error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}