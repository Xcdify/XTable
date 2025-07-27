import { z } from "zod";

// User schema based on fakestoreapi.com/users
export const columnSchema = z.object({
  id: z.number(),
  email: z.string(),
  username: z.string(),
  password: z.string(),
  name: z.object({
    firstname: z.string(),
    lastname: z.string(),
  }),
  phone: z.string(),
  address: z.object({
    geolocation: z.object({
      lat: z.string(),
      long: z.string(),
    }),
    city: z.string(),
    street: z.string(),
    number: z.number(),
    zipcode: z.string(),
  }),
  __v: z.number(),
  // Additional fields for table functionality
  date: z.date().optional(),
  percentile: z.number().optional(),
});

export type ColumnSchema = z.infer<typeof columnSchema>;

// TODO: can we get rid of this in favor of nuqs search-params?
export const columnFilterSchema = z.object({
  id: z
    .string()
    .transform((val) => val.split(","))
    .pipe(z.coerce.number().array().max(2))
    .optional(),
  email: z.string().optional(),
  username: z.string().optional(),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  street: z.string().optional(),
  zipcode: z.string().optional(),
});

export type ColumnFilterSchema = z.infer<typeof columnFilterSchema>;

export const facetMetadataSchema = z.object({
  rows: z.array(z.object({ value: z.any(), total: z.number() })),
  total: z.number(),
  min: z.number().optional(),
  max: z.number().optional(),
});

export type FacetMetadataSchema = z.infer<typeof facetMetadataSchema>;

export type BaseChartSchema = { timestamp: number; [key: string]: number };

// Simple chart schema for user data over time
export const timelineChartSchema = z.object({
  timestamp: z.number(), // UNIX
  users: z.number().default(0),
  // REMINDER: make sure to have the `timestamp` field in the object
}) satisfies z.ZodType<BaseChartSchema>;

export type TimelineChartSchema = z.infer<typeof timelineChartSchema>;
