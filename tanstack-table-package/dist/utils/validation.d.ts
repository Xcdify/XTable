import { AdvancedTableConfig, ConfigValidationResult, ConfigValidationError, ConfigValidationWarning, ConfigValidationSuggestion } from "../types/table-config";
/**
 * Validation error codes for programmatic handling
 */
export declare enum ValidationErrorCode {
    MISSING_DATA = "MISSING_DATA",
    MISSING_COLUMNS = "MISSING_COLUMNS",
    INVALID_DATA_TYPE = "INVALID_DATA_TYPE",
    INVALID_COLUMNS_TYPE = "INVALID_COLUMNS_TYPE",
    MISSING_COLUMN_ID = "MISSING_COLUMN_ID",
    INVALID_PRESET = "INVALID_PRESET",
    INVALID_PERFORMANCE_CONFIG = "INVALID_PERFORMANCE_CONFIG",
    CONFLICTING_FEATURES = "CONFLICTING_FEATURES",
    INVALID_VIRTUALIZATION_CONFIG = "INVALID_VIRTUALIZATION_CONFIG",
    INVALID_THEME_CONFIG = "INVALID_THEME_CONFIG",
    INVALID_ACCESSIBILITY_CONFIG = "INVALID_ACCESSIBILITY_CONFIG",
    INVALID_EXPORT_CONFIG = "INVALID_EXPORT_CONFIG",
    CIRCULAR_DEPENDENCY = "CIRCULAR_DEPENDENCY"
}
/**
 * Validation warning codes for programmatic handling
 */
export declare enum ValidationWarningCode {
    EMPTY_DATA = "EMPTY_DATA",
    MISSING_COLUMN_HEADER = "MISSING_COLUMN_HEADER",
    LARGE_DATASET_WITHOUT_VIRTUALIZATION = "LARGE_DATASET_WITHOUT_VIRTUALIZATION",
    CONFLICTING_FEATURE_COMBINATION = "CONFLICTING_FEATURE_COMBINATION",
    PERFORMANCE_CONCERN = "PERFORMANCE_CONCERN",
    ACCESSIBILITY_CONCERN = "ACCESSIBILITY_CONCERN",
    DEPRECATED_CONFIG = "DEPRECATED_CONFIG",
    SUBOPTIMAL_CONFIG = "SUBOPTIMAL_CONFIG"
}
/**
 * Configuration validation result interface
 */
export interface ValidationResult extends ConfigValidationResult {
    /** Validation timestamp */
    timestamp: Date;
    /** Configuration hash for caching */
    configHash?: string;
    /** Validation performance metrics */
    metrics?: {
        validationTime: number;
        rulesExecuted: number;
    };
}
/**
 * Validation rule interface for extensible validation
 */
export interface ValidationRule<T = any> {
    /** Rule identifier */
    id: string;
    /** Rule description */
    description: string;
    /** Rule category */
    category: 'error' | 'warning' | 'suggestion';
    /** Rule priority */
    priority: 'low' | 'medium' | 'high' | 'critical';
    /** Rule execution function */
    validate: (config: AdvancedTableConfig<T>) => ValidationResult | null;
    /** Rule dependencies (other rules that must pass first) */
    dependencies?: string[];
    /** Rule applicability condition */
    condition?: (config: AdvancedTableConfig<T>) => boolean;
}
/**
 * Comprehensive configuration validator with extensible rule system
 */
export declare class ConfigValidator {
    private static rules;
    private static cache;
    /**
     * Register a custom validation rule
     */
    static registerRule(rule: ValidationRule): void;
    /**
     * Unregister a validation rule
     */
    static unregisterRule(ruleId: string): void;
    /**
     * Get all registered rules
     */
    static getRules(): ValidationRule[];
    /**
     * Clear validation cache
     */
    static clearCache(): void;
    /**
     * Validate a table configuration with comprehensive checks
     */
    static validate<T = any>(config: AdvancedTableConfig<T>, options?: {
        useCache?: boolean;
        includeMetrics?: boolean;
        ruleFilter?: (rule: ValidationRule) => boolean;
    }): ValidationResult;
    /**
     * Quick validation check - returns only boolean result
     */
    static isValid<T = any>(config: AdvancedTableConfig<T>): boolean;
    /**
     * Get only validation errors
     */
    static getErrors<T = any>(config: AdvancedTableConfig<T>): ConfigValidationError[];
    /**
     * Get only validation warnings
     */
    static getWarnings<T = any>(config: AdvancedTableConfig<T>): ConfigValidationWarning[];
    /**
     * Get only validation suggestions
     */
    static getSuggestions<T = any>(config: AdvancedTableConfig<T>): ConfigValidationSuggestion[];
    /**
     * Validate required fields
     */
    private static validateRequired;
    /**
     * Validate data structure and types
     */
    private static validateDataStructure;
    /**
     * Validate column definitions
     */
    private static validateColumns;
    /**
     * Validate feature configurations
     */
    private static validateFeatures;
    /**
     * Validate performance configuration
     */
    private static validatePerformance;
    /**
     * Validate accessibility configuration
     */
    private static validateAccessibility;
    /**
     * Validate theme configuration
     */
    private static validateTheme;
    /**
     * Validate export configuration
     */
    private static validateExport;
    /**
     * Validate preset configuration
     */
    private static validatePreset;
    /**
     * Generate a hash for configuration caching
     */
    private static generateConfigHash;
}
/**
 * Built-in validation rules that can be extended
 */
export declare const BuiltInValidationRules: {
    /**
     * Rule to check for required fields
     */
    readonly REQUIRED_FIELDS: {
        readonly id: "required-fields";
        readonly description: "Validates that required configuration fields are present";
        readonly category: "error";
        readonly priority: "critical";
        readonly validate: <T>(config: AdvancedTableConfig<T>) => {
            isValid: boolean;
            errors: ConfigValidationError[];
            warnings: never[];
            suggestions: never[];
            timestamp: Date;
        };
    };
    /**
     * Rule to check for performance optimizations
     */
    readonly PERFORMANCE_OPTIMIZATION: {
        readonly id: "performance-optimization";
        readonly description: "Suggests performance optimizations based on data size";
        readonly category: "suggestion";
        readonly priority: "medium";
        readonly validate: <T>(config: AdvancedTableConfig<T>) => {
            isValid: boolean;
            errors: never[];
            warnings: never[];
            suggestions: ConfigValidationSuggestion[];
            timestamp: Date;
        };
    };
};
/**
 * Utility functions for validation
 */
export declare const ValidationUtils: {
    /**
     * Create a validation error
     */
    createError(code: ValidationErrorCode | string, message: string, path: string, fix?: string): ConfigValidationError;
    /**
     * Create a validation warning
     */
    createWarning(code: ValidationWarningCode | string, message: string, path: string, suggestion?: string): ConfigValidationWarning;
    /**
     * Create a validation suggestion
     */
    createSuggestion(type: ConfigValidationSuggestion["type"], message: string, priority: ConfigValidationSuggestion["priority"], path?: string): ConfigValidationSuggestion;
    /**
     * Format validation results for display
     */
    formatResults(result: ValidationResult): string;
};
//# sourceMappingURL=validation.d.ts.map