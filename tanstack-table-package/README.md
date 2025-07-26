# reusable-advanced-table

A comprehensive, fully generic and reusable advanced table component built on TanStack Table with extensive features and theming capabilities. Works with any data structure - no predefined interfaces required.

## Features

- 🚀 **High Performance**: Built on TanStack Table with virtualization support
- 🎨 **Theming**: Multiple theme variants with light/dark mode support
- 📱 **Responsive**: Mobile-friendly design with responsive layouts
- 🔧 **Configurable**: Extensive feature toggles and customization options
- 🎯 **TypeScript**: Full TypeScript support with comprehensive type definitions
- 🔄 **Fully Generic**: Works with any data structure - no predefined interfaces
- 📊 **Data Export**: Export table data in multiple formats
- 🔍 **Advanced Filtering**: Global search, column filters, and custom filter types
- 📄 **Pagination**: Built-in pagination with customizable page sizes
- 🏷️ **Row Selection**: Single and multi-row selection support
- 📐 **Column Features**: Resizing, pinning, sorting, and visibility controls
- 🌳 **Hierarchical Data**: Support for grouped and nested data
- ✏️ **Inline Editing**: Editable cells with validation
- 🎛️ **Presets**: Pre-configured table setups for common use cases

## Installation

```bash
npm install reusable-advanced-table
```

## Quick Start

```tsx
import React from 'react';
import { ReusableAdvancedTable } from 'reusable-advanced-table';

const data = [
  { id: 1, name: 'John Doe', email: 'john@example.com', age: 30 },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25 },
];

const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'age', header: 'Age' },
];

function MyTable() {
  return (
    <ReusableAdvancedTable
      data={data}
      columns={columns}
      features={{
        sorting: true,
        filtering: true,
        pagination: true,
      }}
    />
  );
}
```

## Advanced Usage

### Using Presets

```tsx
<ReusableAdvancedTable
  data={data}
  columns={columns}
  preset="enterprise"
  showPresetSelector={true}
  showThemeSelector={true}
/>
```

### Custom Theme

```tsx
<ReusableAdvancedTable
  data={data}
  columns={columns}
  theme={{
    variant: 'minimal',
    colorScheme: 'dark',
    enableTransitions: true,
  }}
/>
```

### Virtualization for Large Datasets

```tsx
<ReusableAdvancedTable
  data={largeDataset}
  columns={columns}
  features={{ virtualization: true }}
  virtualization={{
    height: 600,
    rowHeight: 40,
    overscan: 10,
  }}
/>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | - | Table data array |
| `columns` | `ColumnDef<T>[]` | - | Column definitions |
| `preset` | `string` | - | Preset configuration name |
| `features` | `TableFeatures` | `{}` | Feature configuration |
| `theme` | `ThemeOptions` | `{}` | Theme configuration |
| `virtualization` | `VirtualizationOptions` | `{}` | Virtualization settings |
| `onDataChange` | `(data: T[]) => void` | - | Data change handler |
| `onStateChange` | `(state: any) => void` | - | State change handler |

### Available Features

- `sorting`: Enable column sorting
- `filtering`: Enable column filtering
- `pagination`: Enable pagination
- `rowSelection`: Enable row selection
- `columnVisibility`: Enable column show/hide
- `columnResizing`: Enable column resizing
- `columnPinning`: Enable column pinning
- `rowExpansion`: Enable row expansion
- `globalFiltering`: Enable global search
- `grouping`: Enable column grouping
- `inlineEditing`: Enable inline editing
- `pivoting`: Enable data pivoting
- `virtualization`: Enable virtualization
- `exporting`: Enable data export

### Theme Variants

- `default`: Standard theme with balanced styling
- `minimal`: Clean, minimal design
- `enterprise`: Professional enterprise look
- `compact`: Compact design for dense data
- `spacious`: Generous spacing for readability

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run in development mode
npm run dev

# Type check
npm run type-check
```

## License

MIT