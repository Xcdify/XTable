import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ColumnDef } from '@tanstack/react-table';
import {
  TableExportUtils,
  ExportConfigBuilder,
  CSVExportConfigBuilder,
  ExcelExportConfigBuilder,
  PrintExportConfigBuilder,
  ExportFormat,
  ExportResult,
} from '../export-utils';
import { Person } from '../../data/sample-data';

// Mock data for testing
const mockData: Person[] = [
  {
    firstName: 'John',
    lastName: 'Doe',
    age: 30,
    visits: 100,
    status: 'Single',
    progress: 75,
    department: 'Engineering',
    region: 'North',
    salary: 80000,
    performance: 'Good',
    joinDate: '2020-01-15',
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    age: 28,
    visits: 150,
    status: 'Married',
    progress: 90,
    department: 'Marketing',
    region: 'South',
    salary: 70000,
    performance: 'Excellent',
    joinDate: '2021-03-20',
  },
];

const mockColumns: ColumnDef<Person>[] = [
  {
    id: 'firstName',
    header: 'First Name',
    accessorKey: 'firstName',
  },
  {
    id: 'lastName',
    header: 'Last Name',
    accessorKey: 'lastName',
  },
  {
    id: 'age',
    header: 'Age',
    accessorKey: 'age',
  },
  {
    id: 'department',
    header: 'Department',
    accessorKey: 'department',
  },
  {
    id: 'salary',
    header: 'Salary',
    accessorKey: 'salary',
  },
];

// Mock DOM APIs
const mockCreateElement = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockClick = vi.fn();
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();

beforeEach(() => {
  // Mock document methods
  global.document = {
    createElement: mockCreateElement,
    body: {
      appendChild: mockAppendChild,
      removeChild: mockRemoveChild,
    },
  } as any;

  // Mock URL methods
  global.URL = {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  } as any;

  // Mock Blob
  global.Blob = vi.fn().mockImplementation((content, options) => ({
    content,
    options,
  })) as any;

  // Mock window.open
  global.window = {
    open: vi.fn().mockReturnValue({
      document: {
        write: vi.fn(),
        close: vi.fn(),
      },
      print: vi.fn(),
      close: vi.fn(),
      onload: null,
    }),
  } as any;

  // Setup createElement mock
  mockCreateElement.mockImplementation((tagName: string) => {
    const element = {
      tagName,
      href: '',
      download: '',
      style: { display: '' },
      click: mockClick,
      textContent: '',
      innerHTML: '',
      setAttribute: vi.fn(),
      getAttribute: vi.fn(),
    };
    return element;
  });

  mockCreateObjectURL.mockReturnValue('blob:mock-url');
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('TableExportUtils', () => {
  describe('CSV Export', () => {
    it('should export data to CSV format', async () => {
      const result = await TableExportUtils.exportToCSV(mockData, mockColumns);

      expect(result.success).toBe(true);
      expect(result.format).toBe('csv');
      expect(result.rowCount).toBe(2);
      expect(result.filename).toBe('table-export.csv');
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockClick).toHaveBeenCalled();
    });

    it('should handle CSV export with custom configuration', async () => {
      const config = {
        filename: 'custom-export',
        delimiter: ';',
        includeHeaders: true,
        customHeaders: {
          firstName: 'Given Name',
          lastName: 'Family Name',
        },
      };

      const result = await TableExportUtils.exportToCSV(mockData, mockColumns, config);

      expect(result.success).toBe(true);
      expect(result.filename).toBe('custom-export.csv');
    });

    it('should handle CSV export with column filtering', async () => {
      const config = {
        includeColumns: ['firstName', 'lastName'],
      };

      const result = await TableExportUtils.exportToCSV(mockData, mockColumns, config);

      expect(result.success).toBe(true);
      expect(result.rowCount).toBe(2);
    });

    it('should handle CSV export with data transformation', async () => {
      const config = {
        dataTransformer: (data: Person[]) => 
          data.filter(person => person.department === 'Engineering'),
      };

      const result = await TableExportUtils.exportToCSV(mockData, mockColumns, config);

      expect(result.success).toBe(true);
      expect(result.rowCount).toBe(1); // Only one engineering employee
    });

    it('should handle CSV export errors gracefully', async () => {
      // Mock an error in the download process
      mockCreateElement.mockImplementation(() => {
        throw new Error('DOM error');
      });

      const result = await TableExportUtils.exportToCSV(mockData, mockColumns);

      expect(result.success).toBe(false);
      expect(result.error).toBe('DOM error');
    });
  });

  describe('Excel Export', () => {
    it('should export data to Excel format', async () => {
      const result = await TableExportUtils.exportToExcel(mockData, mockColumns);

      expect(result.success).toBe(true);
      expect(result.format).toBe('excel');
      expect(result.rowCount).toBe(2);
      expect(result.filename).toBe('table-export.xlsx');
    });

    it('should handle Excel export with custom configuration', async () => {
      const config = {
        filename: 'spreadsheet-export',
        sheetName: 'Employee Data',
        includeHeaders: true,
      };

      const result = await TableExportUtils.exportToExcel(mockData, mockColumns, config);

      expect(result.success).toBe(true);
      expect(result.filename).toBe('spreadsheet-export.xlsx');
    });
  });

  describe('JSON Export', () => {
    it('should export data to JSON format', async () => {
      const result = await TableExportUtils.exportToJSON(mockData, mockColumns);

      expect(result.success).toBe(true);
      expect(result.format).toBe('json');
      expect(result.rowCount).toBe(2);
      expect(result.filename).toBe('table-export.json');
    });

    it('should handle JSON export with data transformation', async () => {
      const config = {
        dataTransformer: (data: Person[]) => 
          data.map(person => ({
            ...person,
            fullName: `${person.firstName} ${person.lastName}`,
          })),
      };

      const result = await TableExportUtils.exportToJSON(mockData, mockColumns, config);

      expect(result.success).toBe(true);
      expect(result.rowCount).toBe(2);
    });
  });

  describe('Print Export', () => {
    it('should generate print layout', () => {
      const htmlContent = TableExportUtils.generatePrintLayout(mockData, mockColumns);

      expect(htmlContent).toContain('<!DOCTYPE html>');
      expect(htmlContent).toContain('<table class="print-table">');
      expect(htmlContent).toContain('John');
      expect(htmlContent).toContain('Jane');
    });

    it('should handle print with custom configuration', () => {
      const config = {
        title: 'Employee Report',
        orientation: 'landscape' as const,
        paperSize: 'A4' as const,
        includePageNumbers: true,
      };

      const htmlContent = TableExportUtils.generatePrintLayout(mockData, mockColumns, config);

      expect(htmlContent).toContain('Employee Report');
      expect(htmlContent).toContain('size: A4 landscape');
    });

    it('should open print dialog', async () => {
      const result = await TableExportUtils.printTable(mockData, mockColumns);

      expect(result.success).toBe(true);
      expect(result.format).toBe('print');
      expect(global.window.open).toHaveBeenCalled();
    });

    it('should handle print dialog blocked', async () => {
      // Mock window.open returning null (popup blocked)
      (global.window.open as any).mockReturnValue(null);

      const result = await TableExportUtils.printTable(mockData, mockColumns);

      expect(result.success).toBe(false);
      expect(result.error).toContain('popup blocker');
    });
  });

  describe('Helper Methods', () => {
    it('should escape CSV fields correctly', () => {
      // Access private method through any cast for testing
      const utils = TableExportUtils as any;
      
      expect(utils.escapeCSVField('simple', ',', '"', false)).toBe('simple');
      expect(utils.escapeCSVField('with,comma', ',', '"', false)).toBe('"with,comma"');
      expect(utils.escapeCSVField('with"quote', ',', '"', false)).toBe('"with""quote"');
      expect(utils.escapeCSVField('simple', ',', '"', true)).toBe('"simple"');
    });

    it('should escape HTML correctly', () => {
      // Mock document.createElement for HTML escaping
      const mockDiv = {
        textContent: '',
        innerHTML: '',
      };
      mockCreateElement.mockReturnValue(mockDiv);

      const utils = TableExportUtils as any;
      
      // Set textContent and simulate innerHTML behavior
      mockDiv.textContent = '<script>alert("xss")</script>';
      mockDiv.innerHTML = '&lt;script&gt;alert("xss")&lt;/script&gt;';
      
      const result = utils.escapeHTML('<script>alert("xss")</script>');
      expect(result).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
    });

    it('should get cell values correctly', () => {
      const utils = TableExportUtils as any;
      const testRow = { firstName: 'John', lastName: 'Doe' };
      
      // Test accessorKey
      const column1 = { accessorKey: 'firstName' };
      expect(utils.getCellValue(testRow, column1)).toBe('John');
      
      // Test accessorFn
      const column2 = { accessorFn: (row: any) => `${row.firstName} ${row.lastName}` };
      expect(utils.getCellValue(testRow, column2)).toBe('John Doe');
      
      // Test no accessor
      const column3 = {};
      expect(utils.getCellValue(testRow, column3)).toBe('');
    });
  });
});

describe('Configuration Builders', () => {
  describe('ExportConfigBuilder', () => {
    it('should build basic export configuration', () => {
      const config = ExportConfigBuilder.create()
        .filename('test-export')
        .includeHeaders(true)
        .customHeaders({ firstName: 'First Name' })
        .includeColumns(['firstName', 'lastName'])
        .build();

      expect(config.filename).toBe('test-export');
      expect(config.includeHeaders).toBe(true);
      expect(config.customHeaders).toEqual({ firstName: 'First Name' });
      expect(config.includeColumns).toEqual(['firstName', 'lastName']);
    });

    it('should support method chaining', () => {
      const config = ExportConfigBuilder.create()
        .filename('chained-export')
        .includeHeaders(false)
        .excludeColumns(['age'])
        .dataTransformer((data) => data.slice(0, 10))
        .build();

      expect(config.filename).toBe('chained-export');
      expect(config.includeHeaders).toBe(false);
      expect(config.excludeColumns).toEqual(['age']);
      expect(typeof config.dataTransformer).toBe('function');
    });
  });

  describe('CSVExportConfigBuilder', () => {
    it('should build CSV-specific configuration', () => {
      const config = CSVExportConfigBuilder.create()
        .filename('csv-export')
        .delimiter(';')
        .quote("'")
        .quoteAll(true)
        .build();

      expect(config.filename).toBe('csv-export');
      expect(config.delimiter).toBe(';');
      expect(config.quote).toBe("'");
      expect(config.quoteAll).toBe(true);
    });
  });

  describe('ExcelExportConfigBuilder', () => {
    it('should build Excel-specific configuration', () => {
      const config = ExcelExportConfigBuilder.create()
        .filename('excel-export')
        .sheetName('Data Sheet')
        .autoFitColumns(true)
        .columnWidths({ firstName: 150, lastName: 150 })
        .build();

      expect(config.filename).toBe('excel-export');
      expect(config.sheetName).toBe('Data Sheet');
      expect(config.autoFitColumns).toBe(true);
      expect(config.columnWidths).toEqual({ firstName: 150, lastName: 150 });
    });
  });

  describe('PrintExportConfigBuilder', () => {
    it('should build print-specific configuration', () => {
      const config = PrintExportConfigBuilder.create()
        .title('Print Report')
        .orientation('landscape')
        .paperSize('letter')
        .includePageNumbers(true)
        .customCSS('.table { font-size: 12px; }')
        .build();

      expect(config.title).toBe('Print Report');
      expect(config.orientation).toBe('landscape');
      expect(config.paperSize).toBe('letter');
      expect(config.includePageNumbers).toBe(true);
      expect(config.customCSS).toBe('.table { font-size: 12px; }');
    });
  });
});

describe('Error Handling', () => {
  it('should handle invalid export format', async () => {
    const mockTable = {
      getRowModel: () => ({ rows: [] }),
      getAllColumns: () => [],
    } as any;

    const result = await TableExportUtils.exportFromTable(
      mockTable,
      'invalid-format' as ExportFormat,
      {}
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Unsupported export format');
  });

  it('should handle empty data gracefully', async () => {
    const result = await TableExportUtils.exportToCSV([], mockColumns);

    expect(result.success).toBe(true);
    expect(result.rowCount).toBe(0);
  });

  it('should handle empty columns gracefully', async () => {
    const result = await TableExportUtils.exportToCSV(mockData, []);

    expect(result.success).toBe(true);
    expect(result.rowCount).toBe(2);
  });
});

describe('Integration Tests', () => {
  it('should export from table instance', async () => {
    const mockTable = {
      getRowModel: () => ({
        rows: mockData.map((data, index) => ({
          id: index.toString(),
          original: data,
        })),
      }),
      getAllColumns: () => mockColumns.map(col => ({ columnDef: col })),
    } as any;

    const result = await TableExportUtils.exportFromTable(mockTable, 'csv', {
      filename: 'table-instance-export',
    });

    expect(result.success).toBe(true);
    expect(result.format).toBe('csv');
    expect(result.filename).toBe('table-instance-export.csv');
    expect(result.rowCount).toBe(2);
  });

  it('should handle complex data transformations', async () => {
    const complexTransformer = (data: Person[]) => 
      data
        .filter(person => person.salary && person.salary > 75000)
        .map(person => ({
          ...person,
          salaryCategory: person.salary! > 80000 ? 'High' : 'Medium',
          fullName: `${person.firstName} ${person.lastName}`,
        }));

    const config = ExportConfigBuilder.create()
      .filename('complex-export')
      .dataTransformer(complexTransformer)
      .build();

    const result = await TableExportUtils.exportToJSON(mockData, mockColumns, config);

    expect(result.success).toBe(true);
    expect(result.rowCount).toBe(1); // Only John Doe has salary > 75000
  });
});