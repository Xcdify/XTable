# Table Export Utilities

This module provides comprehensive export functionality for TanStack Table data, supporting multiple formats including CSV, Excel, JSON, and print-optimized layouts.

## Features

- **CSV Export**: Customizable delimiter, headers, and field quoting
- **Excel Export**: Multi-sheet support with custom formatting
- **JSON Export**: Pretty-printed or compact JSON output
- **Print Export**: Print-optimized HTML layouts with custom styling
- **Data Transformation**: Filter and transform data before export
- **Column Selection**: Include/exclude specific columns
- **Configuration Builders**: Fluent API for building export configurations
- **TypeScript Support**: Full type safety and IntelliSense support

## Quick Start

```typescript
import { TableExportUtils, CSVExportConfigBuilder } from './export-utils';

// Basic CSV export
const result = await TableExportUtils.exportToCSV(data, columns, {
  filename: 'my-export',
  includeHeaders: true
});

// Using configuration builder
const config = CSVExportConfigBuilder.create()
  .filename('employees')
  .delimiter(';')
  .customHeaders({ firstName: 'First Name' })
  .build();

const result = await TableExportUtils.exportToCSV(data, columns, config);
```

## Export Formats

### CSV Export

Export data as comma-separated values with customizable formatting.

```typescript
import { TableExportUtils, CSVExportConfigBuilder } from './export-utils';

// Basic CSV export
await TableExportUtils.exportToCSV(data, columns, {
  filename: 'data-export',
  includeHeaders: true,
  delimiter: ',',
});

// Advanced CSV export with builder
const config = CSVExportConfigBuilder.create()
  .filename('advanced-export')
  .delimiter(';')
  .quote('"')
  .quoteAll(false)
  .includeHeaders(true)
  .customHeaders({
    firstName: 'Given Name',
    lastName: 'Family Name',
    email: 'Email Address'
  })
  .includeColumns(['firstName', 'lastName', 'email'])
  .dataTransformer(data => data.filter(item => item.active))
  .build();

await TableExportUtils.exportToCSV(data, columns, config);
```

**CSV Configuration Options:**
- `filename`: Output filename (without extension)
- `delimiter`: Field separator (default: ',')
- `quote`: Quote character (default: '"')
- `quoteAll`: Whether to quote all fields
- `includeHeaders`: Include column headers
- `customHeaders`: Custom header names
- `includeColumns`: Specific columns to include
- `excludeColumns`: Columns to exclude
- `dataTransformer`: Function to transform data before export

### Excel Export

Export data as Excel spreadsheets with formatting options.

```typescript
import { TableExportUtils, ExcelExportConfigBuilder } from './export-utils';

// Basic Excel export
await TableExportUtils.exportToExcel(data, columns, {
  filename: 'spreadsheet',
  sheetName: 'Data',
  includeHeaders: true,
});

// Advanced Excel export
const config = ExcelExportConfigBuilder.create()
  .filename('employee-data')
  .sheetName('Employee Information')
  .includeHeaders(true)
  .autoFitColumns(true)
  .columnWidths({
    firstName: 150,
    lastName: 150,
    email: 200
  })
  .customHeaders({
    firstName: 'First Name',
    lastName: 'Last Name'
  })
  .build();

await TableExportUtils.exportToExcel(data, columns, config);
```

**Excel Configuration Options:**
- `filename`: Output filename (without extension)
- `sheetName`: Excel sheet name
- `includeHeaders`: Include column headers
- `autoFitColumns`: Auto-fit column widths
- `columnWidths`: Custom column widths in pixels
- `customHeaders`: Custom header names
- `includeColumns`: Specific columns to include
- `excludeColumns`: Columns to exclude
- `dataTransformer`: Function to transform data before export

### JSON Export

Export data as JSON with optional formatting.

```typescript
import { TableExportUtils, ExportConfigBuilder } from './export-utils';

// Basic JSON export
await TableExportUtils.exportToJSON(data, columns, {
  filename: 'data',
  pretty: true,
});

// Advanced JSON export with transformation
const config = ExportConfigBuilder.create()
  .filename('transformed-data')
  .includeColumns(['id', 'name', 'email'])
  .dataTransformer(data => 
    data.map(item => ({
      ...item,
      fullName: `${item.firstName} ${item.lastName}`,
      timestamp: new Date().toISOString()
    }))
  )
  .build();

await TableExportUtils.exportToJSON(data, columns, config);
```

**JSON Configuration Options:**
- `filename`: Output filename (without extension)
- `pretty`: Pretty-print JSON (default: true)
- `includeColumns`: Specific columns to include
- `excludeColumns`: Columns to exclude
- `dataTransformer`: Function to transform data before export

### Print Export

Generate print-optimized HTML layouts.

```typescript
import { TableExportUtils, PrintExportConfigBuilder } from './export-utils';

// Basic print
await TableExportUtils.printTable(data, columns, {
  title: 'Employee Report',
  orientation: 'landscape',
});

// Advanced print configuration
const config = PrintExportConfigBuilder.create()
  .title('Quarterly Sales Report')
  .orientation('landscape')
  .paperSize('A4')
  .includePageNumbers(true)
  .customCSS(`
    .print-table th { 
      background-color: #4f46e5 !important; 
      color: white !important; 
    }
    .print-table td { 
      font-size: 10px !important; 
    }
  `)
  .includeHeaders(true)
  .customHeaders({
    firstName: 'Employee Name',
    department: 'Dept.'
  })
  .build();

await TableExportUtils.printTable(data, columns, config);

// Generate HTML without printing
const htmlContent = TableExportUtils.generatePrintLayout(data, columns, config);
```

**Print Configuration Options:**
- `title`: Report title
- `orientation`: 'portrait' or 'landscape'
- `paperSize`: 'A4', 'letter', or 'legal'
- `includePageNumbers`: Include page numbers
- `customCSS`: Custom CSS styles
- `includeHeaders`: Include column headers
- `customHeaders`: Custom header names
- `includeColumns`: Specific columns to include
- `excludeColumns`: Columns to exclude

## React Hook

Use the `useTableExport` hook for easy integration with React components.

```typescript
import { useTableExport } from './export-utils';

function MyTableComponent() {
  const { exportToCSV, exportToExcel, exportToJSON, printTable } = useTableExport();

  const handleExport = async (format: 'csv' | 'excel' | 'json' | 'print') => {
    const config = { filename: 'my-export', includeHeaders: true };
    
    switch (format) {
      case 'csv':
        await exportToCSV(data, columns, config);
        break;
      case 'excel':
        await exportToExcel(data, columns, config);
        break;
      case 'json':
        await exportToJSON(data, columns, config);
        break;
      case 'print':
        await printTable(data, columns, config);
        break;
    }
  };

  return (
    <div>
      <button onClick={() => handleExport('csv')}>Export CSV</button>
      <button onClick={() => handleExport('excel')}>Export Excel</button>
      <button onClick={() => handleExport('json')}>Export JSON</button>
      <button onClick={() => handleExport('print')}>Print</button>
    </div>
  );
}
```

## Export from Table Instance

Export directly from a TanStack Table instance.

```typescript
import { useReactTable } from '@tanstack/react-table';
import { TableExportUtils } from './export-utils';

function MyComponent() {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleExport = async () => {
    const result = await TableExportUtils.exportFromTable(
      table,
      'csv',
      { filename: 'table-data' }
    );
    
    if (result.success) {
      console.log(`Exported ${result.rowCount} rows to ${result.filename}`);
    } else {
      console.error('Export failed:', result.error);
    }
  };

  return <button onClick={handleExport}>Export Table</button>;
}
```

## Configuration Builders

Use fluent configuration builders for complex export setups.

```typescript
import { 
  CSVExportConfigBuilder,
  ExcelExportConfigBuilder,
  PrintExportConfigBuilder 
} from './export-utils';

// CSV Builder
const csvConfig = CSVExportConfigBuilder.create()
  .filename('sales-data')
  .delimiter(';')
  .includeHeaders(true)
  .customHeaders({ amount: 'Sales Amount' })
  .dataTransformer(data => data.filter(item => item.amount > 1000))
  .build();

// Excel Builder
const excelConfig = ExcelExportConfigBuilder.create()
  .filename('quarterly-report')
  .sheetName('Q1 2024')
  .autoFitColumns(true)
  .columnWidths({ name: 200, amount: 100 })
  .build();

// Print Builder
const printConfig = PrintExportConfigBuilder.create()
  .title('Sales Report')
  .orientation('landscape')
  .paperSize('A4')
  .includePageNumbers(true)
  .customCSS('.print-table { font-size: 12px; }')
  .build();
```

## Error Handling

All export methods return an `ExportResult` object with success status and error information.

```typescript
interface ExportResult {
  success: boolean;
  error?: string;
  filename?: string;
  format: ExportFormat;
  rowCount: number;
  timestamp: Date;
}

// Handle export results
const result = await TableExportUtils.exportToCSV(data, columns, config);

if (result.success) {
  console.log(`Successfully exported ${result.rowCount} rows to ${result.filename}`);
} else {
  console.error(`Export failed: ${result.error}`);
}
```

## Data Transformation

Transform data before export using the `dataTransformer` option.

```typescript
const config = CSVExportConfigBuilder.create()
  .filename('processed-data')
  .dataTransformer(data => 
    data
      .filter(item => item.status === 'active')
      .map(item => ({
        ...item,
        fullName: `${item.firstName} ${item.lastName}`,
        formattedSalary: `$${item.salary.toLocaleString()}`,
        joinYear: new Date(item.joinDate).getFullYear()
      }))
      .sort((a, b) => b.salary - a.salary)
  )
  .build();
```

## Column Selection

Control which columns are included in the export.

```typescript
// Include only specific columns
const config = ExportConfigBuilder.create()
  .includeColumns(['firstName', 'lastName', 'email', 'department'])
  .build();

// Exclude sensitive columns
const config = ExportConfigBuilder.create()
  .excludeColumns(['password', 'ssn', 'internalNotes'])
  .build();

// Custom headers for included columns
const config = CSVExportConfigBuilder.create()
  .includeColumns(['firstName', 'lastName', 'salary'])
  .customHeaders({
    firstName: 'First Name',
    lastName: 'Last Name',
    salary: 'Annual Salary (USD)'
  })
  .build();
```

## TypeScript Support

The export utilities are fully typed for TypeScript projects.

```typescript
import { ColumnDef } from '@tanstack/react-table';
import { TableExportUtils, CSVExportConfig } from './export-utils';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  salary: number;
}

const columns: ColumnDef<Employee>[] = [
  { id: 'firstName', header: 'First Name', accessorKey: 'firstName' },
  { id: 'lastName', header: 'Last Name', accessorKey: 'lastName' },
  // ... more columns
];

const data: Employee[] = [
  // ... employee data
];

// Type-safe configuration
const config: CSVExportConfig = {
  filename: 'employees',
  includeHeaders: true,
  delimiter: ',',
  customHeaders: {
    firstName: 'Given Name',
    lastName: 'Family Name'
  }
};

await TableExportUtils.exportToCSV<Employee>(data, columns, config);
```

## Browser Compatibility

The export utilities work in all modern browsers that support:
- Blob API
- URL.createObjectURL
- File download via anchor elements
- Window.open for print functionality

For older browsers, consider using polyfills for missing APIs.

## Performance Considerations

- **Large Datasets**: Use data transformation to filter data before export
- **Memory Usage**: Avoid keeping large export results in memory
- **User Experience**: Show loading indicators for large exports
- **File Size**: Consider splitting very large exports into multiple files

```typescript
// Example: Handle large dataset export
const config = CSVExportConfigBuilder.create()
  .filename('large-dataset')
  .dataTransformer(data => {
    // Filter and paginate large datasets
    return data
      .filter(item => item.isActive)
      .slice(0, 10000); // Limit to 10k rows
  })
  .build();
```

## Examples

See the `export-example.tsx` file for a complete React component demonstrating all export features with a working table interface.