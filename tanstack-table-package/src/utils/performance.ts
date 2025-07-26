import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import React from 'react';

/**
 * Debounce hook for delaying function execution
 * Useful for search inputs and filters to reduce computation frequency
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Debounced value hook for state values
 * Returns a debounced version of the input value
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Memoization utilities for table data and columns
 */
export class TableMemoization {
  /**
   * Memoize table columns with deep comparison
   * Prevents unnecessary re-renders when column definitions haven't changed
   */
  static useMemoizedColumns<T>(
    columns: ColumnDef<T>[],
    dependencies: any[] = []
  ): ColumnDef<T>[] {
    return useMemo(() => {
      return columns.map((col, index) => ({
        ...col,
        // Add stable id if not provided
        id: col.id || `column-${index}`,
      }));
    }, [columns, ...dependencies]);
  }

  /**
   * Memoize table data with row indexing
   * Adds stable row identifiers and prevents unnecessary re-computation
   */
  static useMemoizedData<T>(
    data: T[],
    keyExtractor?: (item: T, index: number) => string | number
  ): T[] {
    return useMemo(() => {
      return data.map((row, index) => {
        const rowKey = keyExtractor ? keyExtractor(row, index) : index;
        return {
          ...row,
          _tableRowId: rowKey,
          _tableRowIndex: index,
        };
      });
    }, [data, keyExtractor]);
  }

  /**
   * Memoize computed table state
   * Prevents recalculation of derived values
   */
  static useComputedTableState<T>(
    data: T[],
    columns: ColumnDef<T>[],
    features: Record<string, boolean>
  ) {
    return useMemo(() => {
      const enabledFeatures = Object.entries(features)
        .filter(([_, enabled]) => enabled)
        .map(([feature]) => feature);

      return {
        totalRows: data.length,
        totalColumns: columns.length,
        hasData: data.length > 0,
        enabledFeatures,
        featureCount: enabledFeatures.length,
        // Performance metrics
        isLargeDataset: data.length > 1000,
        shouldVirtualize: data.length > 5000,
      };
    }, [data.length, columns.length, features]);
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static measurements = new Map<string, number>();

  /**
   * Start performance measurement
   */
  static startMeasurement(name: string): void {
    this.measurements.set(name, performance.now());
  }

  /**
   * End performance measurement and return duration
   */
  static endMeasurement(name: string): number {
    const startTime = this.measurements.get(name);
    if (!startTime) {
      console.warn(`No measurement started for: ${name}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.measurements.delete(name);
    return duration;
  }

  /**
   * Measure function execution time
   */
  static measureFunction<T extends (...args: any[]) => any>(
    fn: T,
    name?: string
  ): T {
    return ((...args: Parameters<T>) => {
      const measurementName = name || fn.name || 'anonymous';
      this.startMeasurement(measurementName);

      try {
        const result = fn(...args);

        // Handle async functions
        if (result instanceof Promise) {
          return result.finally(() => {
            const duration = this.endMeasurement(measurementName);
            console.debug(`${measurementName} took ${duration.toFixed(2)}ms`);
          });
        }

        const duration = this.endMeasurement(measurementName);
        console.debug(`${measurementName} took ${duration.toFixed(2)}ms`);
        return result;
      } catch (error) {
        this.endMeasurement(measurementName);
        throw error;
      }
    }) as T;
  }

  /**
   * Memory usage monitoring
   */
  static getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * Log performance metrics
   */
  static logMetrics(context: string, metrics: Record<string, any>): void {
    console.group(`Performance Metrics - ${context}`);
    Object.entries(metrics).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
    console.groupEnd();
  }
}

/**
 * React component memoization utilities
 */
export const MemoizedComponents = {
  /**
   * Memoize table cell components
   */
  memoizeCell: <P extends object>(Component: React.ComponentType<P>) => {
    return React.memo(Component, (prevProps, nextProps) => {
      // Custom comparison for table cell props
      const prevKeys = Object.keys(prevProps);
      const nextKeys = Object.keys(nextProps);

      if (prevKeys.length !== nextKeys.length) {
        return false;
      }

      return prevKeys.every(key => {
        const prevValue = (prevProps as any)[key];
        const nextValue = (nextProps as any)[key];

        // Deep comparison for objects
        if (typeof prevValue === 'object' && typeof nextValue === 'object') {
          return JSON.stringify(prevValue) === JSON.stringify(nextValue);
        }

        return prevValue === nextValue;
      });
    });
  },

  /**
   * Memoize table row components
   */
  memoizeRow: <P extends object>(Component: React.ComponentType<P>) => {
    return React.memo(Component, (prevProps, nextProps) => {
      // Row-specific comparison logic
      const prevRow = (prevProps as any).row;
      const nextRow = (nextProps as any).row;

      if (!prevRow || !nextRow) {
        return prevProps === nextProps;
      }

      // Compare row data and state
      return (
        prevRow.id === nextRow.id &&
        prevRow.index === nextRow.index &&
        JSON.stringify(prevRow.original) === JSON.stringify(nextRow.original)
      );
    });
  },
};

/**
 * Optimization configuration
 */
export interface PerformanceConfig {
  debounceDelay: number;
  enableMemoization: boolean;
  enablePerformanceLogging: boolean;
  virtualizationThreshold: number;
}

export const defaultPerformanceConfig: PerformanceConfig = {
  debounceDelay: 300,
  enableMemoization: true,
  enablePerformanceLogging: false,
  virtualizationThreshold: 1000,
};

/**
 * Performance optimization hook
 * Combines all performance utilities for easy use
 */
export function useTablePerformance<T>(
  data: T[],
  columns: ColumnDef<T>[],
  features: Record<string, boolean>,
  config: Partial<PerformanceConfig> = {}
) {
  const performanceConfig = { ...defaultPerformanceConfig, ...config };

  // Memoized data and columns
  const memoizedData = TableMemoization.useMemoizedData(data);
  const memoizedColumns = TableMemoization.useMemoizedColumns(columns, [features]);

  // Computed state
  const computedState = TableMemoization.useComputedTableState(
    data,
    columns,
    features
  );

  // Performance monitoring
  useEffect(() => {
    if (performanceConfig.enablePerformanceLogging) {
      PerformanceMonitor.logMetrics('Table Performance', {
        'Data Size': data.length,
        'Column Count': columns.length,
        'Enabled Features': computedState.enabledFeatures.length,
        'Should Virtualize': computedState.shouldVirtualize,
        'Memory Usage': `${(PerformanceMonitor.getMemoryUsage() / 1024 / 1024).toFixed(2)} MB`,
      });
    }
  }, [data.length, columns.length, computedState, performanceConfig.enablePerformanceLogging]);

  return {
    memoizedData,
    memoizedColumns,
    computedState,
    performanceConfig,
  };
}