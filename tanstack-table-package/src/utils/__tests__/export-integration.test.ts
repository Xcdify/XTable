import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ColumnDef } from '@tanstack/react-table';
import {
  TableExportUtils,
  CSVExportConfigBuilder,
  ExcelExportConfigBuilder,
  PrintExportConfigBuilder,
} from '../export-utils';

// Simple test data
const testData = [
  { id: 1, name: 'John Doe', age: 30, department: 'Engineering' },
  { id: 2, name: 'Jane Smith', age: 25, department: 'Marketing' },
];

const testColumns: ColumnDef<typeof testData[0]>[] = [
  { id: 'id', header: 'ID', accessorKey: 'id' },
  { id: 'name', header: 'Name', accessorKey: 'name' },
  { id: 'age', header: 'Age', accessorKey: 'age' },
  { id: 'department', header: 'Department', accessorKey: 'department' },
];

// Mock DOM APIs
beforeEach(() => {
  global.document = {
    createElement: vi.fn().mockReturnValue({
      href: '',
      download: '',
      style: { display: '' },
      click: vi.fn(),
      textContent: '',
      innerHTML: '',
    }),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    },
  } as any;

  global.URL = {
    createObjectURL: vi.fn().mockReturnValue('blob:mock-url'),
    revokeObjectURL: vi.fn(),
  } as any;

  global.Blob = vi.fn() as any;
  global.window = {
    open: vi.fn().mockReturnValue({
      document: { write: vi.fn(), close: vi.fn() },
      print: vi.fn(),
      close: vi.fn(),
      onload: null,
    }),
  } as any;
});

describe('Export Integration Tests', () => {
  it('should export CSV with basic configuration', async () => {
    const result = await TableExportUtils.exportToCSV(testData, testColumns, {
      filename: 'test-export',
      includeHeaders: true,
    });

    expect(result.success).toBe(true);
    expect(result.format).toBe('csv');
    expect(result.rowCount).toBe(2);
    expect(result.filename).toBe('test-export.csv');
  });

  it('should build CSV configuration using builder pattern', () => {
    const config = CSVExportConfigBuilder.create()
      .filename('csv-test')
      .delimiter(';')
      .includeHeaders(true)
      .customHeaders({ name: 'Full Name' })
      .build();

    expect(config.filename).toBe('csv-test');
    expect(config.delimiter).toBe(';');
    expect(config.includeHeaders).toBe(true);
    expect(config.customHeaders).toEqual({ name: 'Full Name' });
  });

  it('should build Excel configuration using builder pattern', () => {
    const config = ExcelExportConfigBuilder.create()
      .filename('excel-test')
      .sheetName('Test Data')
      .includeHeaders(true)
      .autoFitColumns(true)
      .build();

    expect(config.filename).toBe('excel-test');
    expect(config.sheetName).toBe('Test Data');
    expect(config.includeHeaders).toBe(true);
    expect(config.autoFitColumns).toBe(true);
  });

  it('should build print configuration using builder pattern', () => {
    const config = PrintExportConfigBuilder.create()
      .title('Test Report')
      .orientation('landscape')
      .paperSize('A4')
      .includePageNumbers(true)
      .build();

    expect(config.title).toBe('Test Report');
    expect(config.orientation).toBe('landscape');
    expect(config.paperSize).toBe('A4');
    expect(config.includePageNumbers).toBe(true);
  });

  it('should generate print HTML layout', () => {
    const htmlContent = TableExportUtils.generatePrintLayout(testData, testColumns, {
      title: 'Test Report',
      orientation: 'portrait',
      paperSize: 'A4',
      includeHeaders: true,
    });

    expect(htmlContent).toContain('<!DOCTYPE html>');
    expect(htmlContent).toContain('Test Report');
    expect(htmlContent).toContain('<table class="print-table">');
    expect(htmlContent).toContain('<thead>');
    expect(htmlContent).toContain('<tbody>');
    expect(htmlContent).toContain('<th>');
    expect(htmlContent).toContain('<td>');
  });

  it('should handle data transformation', async () => {
    const config = CSVExportConfigBuilder.create()
      .filename('transformed-data')
      .dataTransformer((data) => data.filter(item => item.age > 25))
      .build();

    const result = await TableExportUtils.exportToCSV(testData, testColumns, config);

    expect(result.success).toBe(true);
    expect(result.rowCount).toBe(1); // Only John Doe (age 30) should remain
  });

  it('should handle column filtering', async () => {
    const config = CSVExportConfigBuilder.create()
      .filename('filtered-columns')
      .includeColumns(['name', 'department'])
      .build();

    const result = await TableExportUtils.exportToCSV(testData, testColumns, config);

    expect(result.success).toBe(true);
    expect(result.rowCount).toBe(2);
  });
});