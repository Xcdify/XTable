import { ColumnDef } from "@tanstack/react-table";
import { FeatureKey } from "../components/column-definitions";
/**
 * Performance optimization options for table rendering and interactions
 */
export interface PerformanceOptions {
    /** Debounce delay in milliseconds for search and filter inputs */
    debounceDelay?: number;
    /** Enable React.memo and useMemo optimizations */
    enableMemoization?: boolean;
    /** Enable performance logging for debugging */
    enablePerformanceLogging?: boolean;
    /** Threshold for automatically enabling virtualization */
    virtualizationThreshold?: number;
    /** Virtualization-specific settings */
    virtualization?: {
        /** Enable virtual scrolling */
        enabled: boolean;
        /** Height of each row in pixels */
        rowHeight: number;
        /** Number of rows to render outside visible area */
        overscan?: number;
        /** Container height for virtualized table */
        containerHeight?: number;
    };
    /** Memory optimization settings */
    memory?: {
        /** Enable garbage collection hints */
        enableGCHints?: boolean;
        /** Maximum number of cached rows */
        maxCachedRows?: number;
    };
    /** Rendering optimization settings */
    rendering?: {
        /** Enable batch updates */
        enableBatchUpdates?: boolean;
        /** Throttle render updates in milliseconds */
        renderThrottle?: number;
    };
}
/**
 * Table preset configuration interface
 */
export interface TablePreset {
    /** Unique identifier for the preset */
    name: string;
    /** Human-readable description of the preset */
    description: string;
    /** Feature configuration for this preset */
    features: Record<FeatureKey, boolean>;
    /** Optional performance settings for this preset */
    performance?: Partial<PerformanceOptions>;
    /** Optional default column configurations */
    columnDefaults?: Partial<ColumnDef<any>>;
    /** Preset category for organization */
    category?: 'basic' | 'advanced' | 'specialized' | 'performance';
    /** Tags for filtering and searching presets */
    tags?: string[];
    /** Minimum/maximum recommended data size for this preset */
    recommendedDataSize?: {
        min?: number;
        max?: number;
    };
}
/**
 * Theme configuration options
 */
export interface ThemeOptions {
    /** Theme variant */
    variant?: 'default' | 'minimal' | 'enterprise' | 'compact' | 'spacious';
    /** Color scheme */
    colorScheme?: 'light' | 'dark' | 'auto';
    /** Custom CSS properties */
    customProperties?: Record<string, string>;
    /** Component-specific styling overrides */
    components?: {
        table?: React.CSSProperties;
        header?: React.CSSProperties;
        cell?: React.CSSProperties;
        pagination?: React.CSSProperties;
        controls?: React.CSSProperties;
    };
}
/**
 * Data management configuration
 */
export interface DataManagementOptions<T = any> {
    /** Async data loading configuration */
    loading?: {
        /** Show loading state */
        enabled: boolean;
        /** Custom loading component */
        component?: React.ComponentType;
        /** Loading message */
        message?: string;
    };
    /** Error handling configuration */
    error?: {
        /** Show error boundary */
        enabled: boolean;
        /** Custom error component */
        component?: React.ComponentType<{
            error: Error;
            retry: () => void;
        }>;
        /** Enable retry mechanism */
        enableRetry?: boolean;
        /** Maximum retry attempts */
        maxRetries?: number;
    };
    /** Data validation settings */
    validation?: {
        /** Enable runtime validation */
        enabled: boolean;
        /** Custom validator function */
        validator?: (data: T[]) => {
            isValid: boolean;
            errors: string[];
        };
        /** Validation mode */
        mode?: 'strict' | 'warn' | 'silent';
    };
    /** Caching configuration */
    caching?: {
        /** Enable client-side caching */
        enabled: boolean;
        /** Cache key generator */
        keyGenerator?: (data: T[]) => string;
        /** Cache TTL in milliseconds */
        ttl?: number;
    };
}
/**
 * Export configuration options
 */
export interface ExportOptions {
    /** CSV export settings */
    csv?: {
        enabled: boolean;
        filename?: string;
        delimiter?: string;
        includeHeaders?: boolean;
    };
    /** Excel export settings */
    excel?: {
        enabled: boolean;
        filename?: string;
        sheetName?: string;
        includeHeaders?: boolean;
    };
    /** JSON export settings */
    json?: {
        enabled: boolean;
        filename?: string;
        pretty?: boolean;
    };
    /** Print settings */
    print?: {
        enabled: boolean;
        orientation?: 'portrait' | 'landscape';
        paperSize?: 'A4' | 'letter' | 'legal';
    };
}
/**
 * Accessibility configuration options
 */
export interface AccessibilityOptions {
    /** ARIA label for the table */
    ariaLabel?: string;
    /** ARIA description for the table */
    ariaDescription?: string;
    /** Enable keyboard navigation */
    keyboardNavigation?: boolean;
    /** Enable screen reader announcements */
    screenReaderAnnouncements?: boolean;
    /** Focus management settings */
    focusManagement?: {
        /** Enable focus trapping */
        trapFocus?: boolean;
        /** Focus return element selector */
        returnFocusTo?: string;
    };
    /** High contrast mode support */
    highContrast?: boolean;
    /** Reduced motion support */
    reducedMotion?: boolean;
}
/**
 * Advanced table configuration interface
 * This is the main configuration object that combines all options
 */
export interface AdvancedTableConfig<T = any> {
    /** Table data */
    data: T[];
    /** Column definitions */
    columns: ColumnDef<T>[];
    /** Preset configuration name */
    preset?: string;
    /** Feature toggles - overrides preset settings */
    features?: Partial<Record<FeatureKey, boolean>>;
    /** Performance optimization settings */
    performance?: Partial<PerformanceOptions>;
    /** Theme and styling options */
    theme?: ThemeOptions;
    /** Data management options */
    dataManagement?: DataManagementOptions<T>;
    /** Export functionality options */
    export?: ExportOptions;
    /** Accessibility options */
    accessibility?: AccessibilityOptions;
    /** Initial table state */
    initialState?: {
        sorting?: any[];
        columnFilters?: any[];
        rowSelection?: Record<string, boolean>;
        columnVisibility?: Record<string, boolean>;
        columnPinning?: {
            left?: string[];
            right?: string[];
        };
        grouping?: string[];
        expanded?: Record<string, boolean>;
        globalFilter?: string;
        pagination?: {
            pageIndex: number;
            pageSize: number;
        };
    };
    /** Event handlers */
    onStateChange?: (state: any) => void;
    onError?: (error: Error) => void;
    onDataChange?: (data: T[]) => void;
    /** Custom components */
    components?: {
        LoadingComponent?: React.ComponentType;
        ErrorComponent?: React.ComponentType<{
            error: Error;
            retry: () => void;
        }>;
        EmptyStateComponent?: React.ComponentType;
        PaginationComponent?: React.ComponentType<any>;
    };
    /** Debug options */
    debug?: {
        enabled?: boolean;
        logLevel?: 'error' | 'warn' | 'info' | 'debug';
        logPerformance?: boolean;
    };
}
/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
    /** Whether the configuration is valid */
    isValid: boolean;
    /** Validation errors that prevent table from working */
    errors: ConfigValidationError[];
    /** Validation warnings that may affect performance or UX */
    warnings: ConfigValidationWarning[];
    /** Suggested improvements */
    suggestions: ConfigValidationSuggestion[];
}
/**
 * Configuration validation error
 */
export interface ConfigValidationError {
    /** Error code for programmatic handling */
    code: string;
    /** Human-readable error message */
    message: string;
    /** Path to the configuration property that caused the error */
    path: string;
    /** Suggested fix for the error */
    fix?: string;
}
/**
 * Configuration validation warning
 */
export interface ConfigValidationWarning {
    /** Warning code for programmatic handling */
    code: string;
    /** Human-readable warning message */
    message: string;
    /** Path to the configuration property that caused the warning */
    path: string;
    /** Suggested improvement */
    suggestion?: string;
}
/**
 * Configuration validation suggestion
 */
export interface ConfigValidationSuggestion {
    /** Suggestion type */
    type: 'performance' | 'accessibility' | 'usability' | 'best-practice';
    /** Human-readable suggestion message */
    message: string;
    /** Configuration path this suggestion applies to */
    path?: string;
    /** Priority level of the suggestion */
    priority: 'low' | 'medium' | 'high';
}
/**
 * Type-safe preset configuration builder
 */
export interface PresetBuilder<T = any> {
    /** Set the preset name */
    name(name: string): PresetBuilder<T>;
    /** Set the preset description */
    description(description: string): PresetBuilder<T>;
    /** Configure features */
    features(features: Partial<Record<FeatureKey, boolean>>): PresetBuilder<T>;
    /** Configure performance options */
    performance(options: Partial<PerformanceOptions>): PresetBuilder<T>;
    /** Set preset category */
    category(category: TablePreset['category']): PresetBuilder<T>;
    /** Add tags */
    tags(tags: string[]): PresetBuilder<T>;
    /** Set recommended data size */
    recommendedDataSize(size: {
        min?: number;
        max?: number;
    }): PresetBuilder<T>;
    /** Build the preset */
    build(): TablePreset;
}
/**
 * Default configuration values
 */
export declare const DEFAULT_PERFORMANCE_OPTIONS: PerformanceOptions;
export declare const DEFAULT_THEME_OPTIONS: ThemeOptions;
export declare const DEFAULT_ACCESSIBILITY_OPTIONS: AccessibilityOptions;
//# sourceMappingURL=table-config.d.ts.map