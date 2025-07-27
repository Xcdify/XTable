# @xcdify/xtable

A comprehensive React data table component library with advanced filtering, sorting, and editing capabilities built on top of TanStack Table.

[![npm version](https://badge.fury.io/js/@xcdify%2Fxtable.svg)](https://badge.fury.io/js/@xcdify%2Fxtable)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🔍 **Advanced Filtering** - Multiple filter types including text, select, slider, date range, and checkbox filters
- 📝 **Inline Editing** - Edit cells directly with support for text, email, phone, and select inputs
- 🎨 **Modern UI** - Beautiful components built with Radix UI and styled with Tailwind CSS
- ⌨️ **Keyboard Navigation** - Full keyboard accessibility and navigation support
- 📱 **Responsive Design** - Mobile-friendly with drawer-based filter controls
- 🔄 **Real-time Updates** - Integrated with TanStack Query for data synchronization
- 🎯 **TypeScript First** - Full TypeScript support with comprehensive type definitions
- 🎨 **Customizable** - Highly customizable with CSS variables and component overrides
- 📊 **Grouping & Sorting** - Advanced data organization capabilities
- 🚀 **Performance** - Optimized for large datasets with virtualization support

## 📦 Installation

```bash
npm install @xcdify/xtable
# or
yarn add @xcdify/xtable
# or
pnpm add @xcdify/xtable
# or
bun add @xcdify/xtable
```

### Peer Dependencies

This package requires the following peer dependencies:

```bash
npm install react react-dom @tanstack/react-table @tanstack/react-query tailwindcss
```

## 🚀 Quick Start

```tsx
import {
  DataTableProvider,
  DataTableFilterControls,
  DataTableToolbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@xcdify/xtable';
import type { DataTableFilterField } from '@xcdify/xtable';

// Define your data structure
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

// Define filter fields
const filterFields: DataTableFilterField<User>[] = [
  {
    label: "Name",
    value: "name",
    type: "input",
    placeholder: "Search names...",
  },
  {
    label: "Role",
    value: "role",
    type: "select",
    options: [
      { label: "Admin", value: "admin" },
      { label: "User", value: "user" },
    ],
  },
];

// Define columns
const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
];

function DataTableExample() {
  const data = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "admin" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "user" },
  ];

  return (
    <DataTableProvider
      data={data}
      columns={columns}
      filterFields={filterFields}
    >
      <div className="space-y-4">
        <DataTableToolbar />
        <DataTableFilterControls />
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DataTableProvider>
  );
}
```

## 🎨 Styling

This package uses Tailwind CSS for styling. Make sure to include the package's styles in your Tailwind configuration:

```js
// tailwind.config.js
module.exports = {
  content: [
    // ... your content paths
    "./node_modules/@xcdify/xtable/**/*.{js,ts,jsx,tsx}",
  ],
  // ... rest of your config
};
```

## 📚 Components

### Core Components
- `DataTableProvider` - Main provider component that manages table state
- `DataTableToolbar` - Toolbar with search, view options, and actions
- `DataTableFilterControls` - Advanced filter controls panel
- `DataTablePagination` - Pagination controls
- `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow` - Table components

### Filter Components
- `DataTableFilterInput` - Text input filter
- `DataTableFilterSelect` - Select dropdown filter
- `DataTableFilterSlider` - Range slider filter
- `DataTableFilterCheckbox` - Checkbox filter
- `DataTableFilterTimerange` - Date range filter

### Editing Components
- `EditableCell` - Generic editable cell component
- `EditableTextCell` - Text input cell
- `EditableEmailCell` - Email input cell
- `EditablePhoneCell` - Phone input cell
- `EditableSelectCell` - Select dropdown cell

## 🔧 Advanced Usage

### Inline Editing

```tsx
const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row, column }) => (
      <EditableTextCell
        value={row.getValue(column.id)}
        onChange={(value) => updateData(row.index, column.id, value)}
      />
    ),
    meta: {
      editable: true,
    },
  },
];
```

### Custom Filters

```tsx
const filterFields: DataTableFilterField<User>[] = [
  {
    label: "Created Date",
    value: "createdAt",
    type: "timerange",
  },
  {
    label: "Status",
    value: "status",
    type: "checkbox",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
  },
];
```

## 📖 API Reference

### DataTableProvider Props

| Prop | Type | Description |
|------|------|-------------|
| `data` | `T[]` | Array of data objects |
| `columns` | `ColumnDef<T>[]` | TanStack Table column definitions |
| `filterFields` | `DataTableFilterField<T>[]` | Filter field configurations |
| `enableGrouping` | `boolean` | Enable column grouping (optional) |
| `enableSorting` | `boolean` | Enable column sorting (optional) |
| `enableFiltering` | `boolean` | Enable filtering (optional) |

### Filter Field Types

```tsx
interface DataTableFilterField<T> {
  label: string;
  value: keyof T;
  type: 'input' | 'select' | 'slider' | 'checkbox' | 'timerange';
  placeholder?: string; // for input type
  options?: Array<{ label: string; value: any }>; // for select/checkbox
  min?: number; // for slider
  max?: number; // for slider
}
```

### Editable Cell Props

```tsx
interface EditCellProps {
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  type?: 'text' | 'email' | 'number' | 'tel' | 'select';
  options?: Array<{ label: string; value: any }>; // for select type
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on top of [TanStack Table](https://tanstack.com/table)
- UI components from [Radix UI](https://radix-ui.com)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Originally based on work by the Data Table Filters Team

---

Made with ❤️ by [Xcdify](https://github.com/xcdify)
