import { queryOptions } from "@tanstack/react-query";
import type { ColumnSchema } from "./schema";

export interface LogsMeta {
  totalRowCount: number;
  filterRowCount: number;
  metadata: any;
}

export interface ApiResponse {
  data: ColumnSchema[];
  meta: LogsMeta;
}

async function fetchUsers(): Promise<ApiResponse> {
  try {
    const response = await fetch('https://fakestoreapi.com/users');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
    }

    const users = await response.json();
    
    // Transform the data to match our schema
    const transformedUsers: ColumnSchema[] = users.map((user: any) => ({
      ...user,
      date: new Date(), // Add current date since API doesn't provide it
      percentile: Math.random() * 100, // Add random percentile for demo
    }));

    return {
      data: transformedUsers,
      meta: {
        totalRowCount: transformedUsers.length,
        filterRowCount: transformedUsers.length,
        metadata: {},
      },
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export function dataOptions() {
  return queryOptions({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
