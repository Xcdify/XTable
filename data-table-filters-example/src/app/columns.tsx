"use client";

import { EditableTextCell, EditableEmailCell, EditablePhoneCell } from "@data-table/filters";
import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import { DraggableColumnHeader } from "./draggable-column-header";
import type { ColumnSchema } from "./schema";

// Simple text with tooltip component
function TextWithTooltip({ text }: { text: string }) {
  return (
    <div className="truncate" title={text}>
      {text}
    </div>
  );
}

export const columns: ColumnDef<ColumnSchema>[] = [
  {
    accessorKey: "id",
    header: ({ column, table }) => (
      <DraggableColumnHeader
        column={column}
        title="ID"
        enableGrouping={table.options.meta?.enableGrouping || false}
      />
    ),
    cell: ({ row }) => {
      const value = row.getValue<ColumnSchema["id"]>("id");
      return <div className="font-mono">{value}</div>;
    },
    filterFn: "inNumberRange",
    enableResizing: false,
    size: 80,
    minSize: 80,
    meta: {
      headerClassName:
        "w-[--header-id-size] max-w-[--header-id-size] min-w-[--header-id-size]",
      cellClassName:
        "font-mono w-[--col-id-size] max-w-[--col-id-size] min-w-[--col-id-size]",
    },
  },
  {
    accessorKey: "username",
    header: ({ column, table }) => (
      <DraggableColumnHeader
        column={column}
        title="Username"
        enableGrouping={table.options.meta?.enableGrouping || false}
      />
    ),
    cell: ({ row, table }) => {
      const value = row.getValue<ColumnSchema["username"]>("username");
      const meta = table.options.meta;

      // Always show editable cell when editing is enabled, with immediate editing
      if (meta?.isEditingMode) {
        return (
          <EditableTextCell
            value={value}
            onChange={(newValue) => {
              if (meta?.updateData) {
                meta.updateData(row.index, "username", newValue);
              }
            }}
            onBlur={() => {}}
            // Remove click-to-edit requirement - cell is immediately editable when focused
            autoFocus={false}
          />
        );
      }

      return <TextWithTooltip text={value} />;
    },
    enableGrouping: true,
    size: 130,
    minSize: 130,
    meta: {
      enableEditing: true,
      cellClassName:
        "font-mono w-[--col-username-size] max-w-[--col-username-size] min-w-[--col-username-size]",
      headerClassName:
        "min-w-[--header-username-size] w-[--header-username-size] max-w-[--header-username-size]",
    },
  },
  {
    accessorKey: "email",
    header: ({ column, table }) => (
      <DraggableColumnHeader
        column={column}
        title="Email"
        enableGrouping={table.options.meta?.enableGrouping || false}
      />
    ),
    cell: ({ row, table }) => {
      const value = row.getValue<ColumnSchema["email"]>("email");
      const meta = table.options.meta;

      // Always show editable cell when editing is enabled, with immediate editing
      if (meta?.isEditingMode) {
        return (
          <EditableEmailCell
            value={value}
            onChange={(newValue) => {
              if (meta?.updateData) {
                meta.updateData(row.index, "email", newValue);
              }
            }}
            onBlur={() => {}}
            // Remove click-to-edit requirement - cell is immediately editable when focused
            autoFocus={false}
          />
        );
      }

      return <TextWithTooltip text={value} />;
    },
    enableGrouping: true,
    size: 200,
    minSize: 200,
    meta: {
      enableEditing: true,
      cellClassName:
        "font-mono w-[--col-email-size] max-w-[--col-email-size] min-w-[--col-email-size]",
      headerClassName:
        "min-w-[--header-email-size] w-[--header-email-size] max-w-[--header-email-size]",
    },
  },
  {
    id: "name",
    accessorFn: (row) => `${row.name.firstname} ${row.name.lastname}`,
    header: ({ column, table }) => (
      <DraggableColumnHeader
        column={column}
        title="Full Name"
        enableGrouping={table.options.meta?.enableGrouping || false}
      />
    ),
    cell: ({ row }) => {
      const firstname = row.original.name.firstname;
      const lastname = row.original.name.lastname;
      return <div className="capitalize">{`${firstname} ${lastname}`}</div>;
    },
    size: 150,
    minSize: 150,
    meta: {
      label: "Full Name",
      enableGrouping: true,
      cellClassName:
        "w-[--col-name-size] max-w-[--col-name-size] min-w-[--col-name-size]",
      headerClassName:
        "min-w-[--header-name-size] w-[--header-name-size] max-w-[--header-name-size]",
    },
  },
  {
    accessorKey: "phone",
    header: ({ column, table }) => (
      <DraggableColumnHeader
        column={column}
        title="Phone"
        enableGrouping={table.options.meta?.enableGrouping || false}
      />
    ),
    cell: ({ row, table }) => {
      const value = row.getValue<ColumnSchema["phone"]>("phone");
      const meta = table.options.meta;

      // Always show editable cell when editing is enabled, with immediate editing
      if (meta?.isEditingMode) {
        return (
          <EditablePhoneCell
            value={value}
            onChange={(newValue) => {
              if (meta?.updateData) {
                meta.updateData(row.index, "phone", newValue);
              }
            }}
            onBlur={() => {}}
            // Remove click-to-edit requirement - cell is immediately editable when focused
            autoFocus={false}
          />
        );
      }

      return <TextWithTooltip text={value} />;
    },
    enableGrouping: true,
    size: 150,
    minSize: 150,
    meta: {
      enableEditing: true,
      cellClassName: "font-mono w-[--col-phone-size] max-w-[--col-phone-size]",
      headerClassName: "min-w-[--header-phone-size] w-[--header-phone-size]",
    },
  },
  {
    id: "city",
    accessorFn: (row) => row.address.city,
    header: ({ column, table }) => (
      <DraggableColumnHeader
        column={column}
        title="City"
        enableGrouping={table.options.meta?.enableGrouping || false}
      />
    ),
    cell: ({ row }) => {
      const value = row.original.address.city;
      return <div className="capitalize">{value}</div>;
    },
    enableGrouping: true,
    aggregationFn: 'count',
    size: 130,
    minSize: 130,
    meta: {
      enableGrouping: true,
      cellClassName:
        "w-[--col-city-size] max-w-[--col-city-size]",
      headerClassName:
        "min-w-[--header-city-size] w-[--header-city-size]",
    },
  },
  {
    id: "street",
    accessorFn: (row) => `${row.address.number} ${row.address.street}`,
    header: ({ column, table }) => (
      <DraggableColumnHeader
        column={column}
        title="Street Address"
        enableGrouping={table.options.meta?.enableGrouping || false}
      />
    ),
    cell: ({ row }) => {
      const number = row.original.address.number;
      const street = row.original.address.street;
      return <TextWithTooltip text={`${number} ${street}`} />;
    },
    size: 180,
    minSize: 180,
    meta: {
      label: "Street Address",
      headerClassName:
        "w-[--header-street-size] max-w-[--header-street-size] min-w-[--header-street-size]",
      cellClassName:
        "w-[--col-street-size] max-w-[--col-street-size] min-w-[--col-street-size]",
    },
  },
  {
    id: "zipcode",
    accessorFn: (row) => row.address.zipcode,
    header: ({ column, table }) => (
      <DraggableColumnHeader
        column={column}
        title="Zipcode"
        enableGrouping={table.options.meta?.enableGrouping || false}
      />
    ),
    cell: ({ row }) => {
      const value = row.original.address.zipcode;
      return <div className="font-mono">{value}</div>;
    },
    size: 120,
    minSize: 120,
    meta: {
      headerClassName:
        "w-[--header-zipcode-size] max-w-[--header-zipcode-size] min-w-[--header-zipcode-size]",
      cellClassName:
        "font-mono w-[--col-zipcode-size] max-w-[--col-zipcode-size] min-w-[--col-zipcode-size]",
    },
  },
];
