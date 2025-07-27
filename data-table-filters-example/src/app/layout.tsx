'use client'

import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import './globals.css'

// Note: We can't export metadata from a client component, so we'll handle this differently
// export const metadata: Metadata = {
//   title: 'Data Table Filters Example',
//   description: 'Example application demonstrating @data-table/filters package',
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Create a stable query client instance
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <html lang="en">
      <head>
        <title>Data Table Filters Example</title>
        <meta name="description" content="Example application demonstrating @data-table/filters package" />
      </head>
      <body className={GeistSans.className}>
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  )
}