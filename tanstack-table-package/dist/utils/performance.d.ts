import { ColumnDef } from '@tanstack/react-table';
import React from 'react';
/**
 * Debounce hook for delaying function execution
 * Useful for search inputs and filters to reduce computation frequency
 */
export declare function useDebounce<T extends (...args: any[]) => any>(callback: T, delay: number): T;
/**
 * Debounced value hook for state values
 * Returns a debounced version of the input value
 */
export declare function useDebouncedValue<T>(value: T, delay: number): T;
/**
 * Memoization utilities for table data and columns
 */
export declare class TableMemoization {
    /**
     * Memoize table columns with deep comparison
     * Prevents unnecessary re-renders when column definitions haven't changed
     */
    static useMemoizedColumns<T>(columns: ColumnDef<T>[], dependencies?: any[]): ColumnDef<T>[];
    /**
     * Memoize table data with row indexing
     * Adds stable row identifiers and prevents unnecessary re-computation
     */
    static useMemoizedData<T>(data: T[], keyExtractor?: (item: T, index: number) => string | number): T[];
    /**
     * Memoize computed table state
     * Prevents recalculation of derived values
     */
    static useComputedTableState<T>(data: T[], columns: ColumnDef<T>[], features: Record<string, boolean>): {
        totalRows: number;
        totalColumns: number;
        hasData: boolean;
        enabledFeatures: string[];
        featureCount: number;
        isLargeDataset: boolean;
        shouldVirtualize: boolean;
    };
}
/**
 * Performance monitoring utilities
 */
export declare class PerformanceMonitor {
    private static measurements;
    /**
     * Start performance measurement
     */
    static startMeasurement(name: string): void;
    /**
     * End performance measurement and return duration
     */
    static endMeasurement(name: string): number;
    /**
     * Measure function execution time
     */
    static measureFunction<T extends (...args: any[]) => any>(fn: T, name?: string): T;
    /**
     * Memory usage monitoring
     */
    static getMemoryUsage(): number;
    /**
     * Log performance metrics
     */
    static logMetrics(context: string, metrics: Record<string, any>): void;
}
/**
 * React component memoization utilities
 */
export declare const MemoizedComponents: {
    /**
     * Memoize table cell components
     */
    memoizeCell: <P extends object>(Component: React.ComponentType<P>) => React.MemoExoticComponent<React.ComponentType<P>>;
    /**
     * Memoize table row components
     */
    memoizeRow: <P extends object>(Component: React.ComponentType<P>) => React.MemoExoticComponent<React.ComponentType<P>>;
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
export declare const defaultPerformanceConfig: PerformanceConfig;
/**
 * Performance optimization hook
 * Combines all performance utilities for easy use
 */
export declare function useTablePerformance<T>(data: T[], columns: ColumnDef<T>[], features: Record<string, boolean>, config?: Partial<PerformanceConfig>): {
    memoizedData: T[];
    memoizedColumns: ColumnDef<T>[];
    computedState: {
        totalRows: number;
        totalColumns: number;
        hasData: boolean;
        enabledFeatures: string[];
        featureCount: number;
        isLargeDataset: boolean;
        shouldVirtualize: boolean;
    };
    performanceConfig: {
        debounceDelay: number;
        enableMemoization: boolean;
        enablePerformanceLogging: boolean;
        virtualizationThreshold: number;
    };
};
//# sourceMappingURL=performance.d.ts.map