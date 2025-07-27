"use client";

import type {
  DataTableFilterField,
} from "@data-table/filters";
import { type ColumnSchema } from "./schema";

// instead of filterFields, maybe just 'fields' with a filterDisabled prop?
// that way, we could have 'message' or 'headers' field with label and value as well as type!
export const filterFields = [
  {
    label: "User ID",
    value: "id",
    type: "slider",
    min: 1,
    max: 10,
  },
  {
    label: "Email",
    value: "email",
    type: "input",
    placeholder: "Search emails...",
  },
  {
    label: "Username",
    value: "username",
    type: "input",
    placeholder: "Search usernames...",
  },
  {
    label: "Phone",
    value: "phone",
    type: "input",
    placeholder: "Search phone numbers...",
  },
  {
    label: "City",
    value: "city",
    type: "checkbox",
    options: [
      { label: "Kilcoole", value: "kilcoole" },
      { label: "Cullman", value: "cullman" },
      { label: "San Antonio", value: "san antonio" },
      { label: "El Paso", value: "el paso" },
      { label: "Fresno", value: "fresno" },
      { label: "Mesa", value: "mesa" },
      { label: "Miami", value: "miami" },
      { label: "Fort Wayne", value: "fort wayne" },
    ],
  },
] satisfies DataTableFilterField<ColumnSchema>[];
