import { ColumnDef } from "@tanstack/react-table";
import {
  AdvancedTableConfig,
  ConfigValidationResult,
  ConfigValidationError,
  ConfigValidationWarning,
  ConfigValidationSuggestion,
  PerformanceOptions,
  TablePreset,
} from "../types/table-config";
import { FeatureKey } from "../components/column-definitions";

/**
 * Validation error codes for programmatic handling
 */
export enum ValidationErrorCode {
  MISSING_DATA = 'MISSING_DATA',
  MISSING_COLUMNS = 'MISSING_COLUMNS',
  INVALID_DATA_TYPE = 'INVALID_DATA_TYPE',
  INVALID_COLUMNS_TYPE = 'INVALID_COLUMNS_TYPE',
  MISSING_COLUMN_ID = 'MISSING_COLUMN_ID',
  INVALID_PRESET = 'INVALID_PRESET',
  INVALID_PERFORMANCE_CONFIG = 'INVALID_PERFORMANCE_CONFIG',
  CONFLICTING_FEATURES = 'CONFLICTING_FEATURES',
  INVALID_VIRTUALIZATION_CONFIG = 'INVALID_VIRTUALIZATION_CONFIG',
  INVALID_THEME_CONFIG = 'INVALID_THEME_CONFIG',
  INVALID_ACCESSIBILITY_CONFIG = 'INVALID_ACCESSIBILITY_CONFIG',
  INVALID_EXPORT_CONFIG = 'INVALID_EXPORT_CONFIG',
  CIRCULAR_DEPENDENCY = 'CIRCULAR_DEPENDENCY',
}

/**
 * Validation warning codes for programmatic handling
 */
export enum ValidationWarningCode {
  EMPTY_DATA = 'EMPTY_DATA',
  MISSING_COLUMN_HEADER = 'MISSING_COLUMN_HEADER',
  LARGE_DATASET_WITHOUT_VIRTUALIZATION = 'LARGE_DATASET_WITHOUT_VIRTUALIZATION',
  CONFLICTING_FEATURE_COMBINATION = 'CONFLICTING_FEATURE_COMBINATION',
  PERFORMANCE_CONCERN = 'PERFORMANCE_CONCERN',
  ACCESSIBILITY_CONCERN = 'ACCESSIBILITY_CONCERN',
  DEPRECATED_CONFIG = 'DEPRECATED_CONFIG',
  SUBOPTIMAL_CONFIG = 'SUBOPTIMAL_CONFIG',
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
export class ConfigValidator {
  private static rules: Map<string, ValidationRule> = new Map();
  private static cache: Map<string, ValidationResult> = new Map();
  
  /**
   * Register a custom validation rule
   */
  static registerRule(rule: ValidationRule): void {
    this.rules.set(rule.id, rule);
  }
  
  /**
   * Unregister a validation rule
   */
  static unregisterRule(ruleId: string): void {
    this.rules.delete(ruleId);
  }
  
  /**
   * Get all registered rules
   */
  static getRules(): ValidationRule[] {
    return Array.from(this.rules.values());
  }
  
  /**
   * Clear validation cache
   */
  static clearCache(): void {
    this.cache.clear();
  }
  
  /**
   * Validate a table configuration with comprehensive checks
   */
  static validate<T = any>(config: AdvancedTableConfig<T>, options?: {
    useCache?: boolean;
    includeMetrics?: boolean;
    ruleFilter?: (rule: ValidationRule) => boolean;
  }): ValidationResult {
    const startTime = performance.now();
    const configHash = this.generateConfigHash(config);
    
    // Check cache if enabled
    if (options?.useCache && this.cache.has(configHash)) {
      const cached = this.cache.get(configHash)!;
      return { ...cached, timestamp: new Date() };
    }
    
    const errors: ConfigValidationError[] = [];
    const warnings: ConfigValidationWarning[] = [];
    const suggestions: ConfigValidationSuggestion[] = [];
    let rulesExecuted = 0;
    
    // Execute built-in validation rules
    this.validateRequired(config, errors);
    this.validateDataStructure(config, errors, warnings);
    this.validateColumns(config, errors, warnings);
    this.validateFeatures(config, errors, warnings, suggestions);
    this.validatePerformance(config, warnings, suggestions);
    this.validateAccessibility(config, warnings, suggestions);
    this.validateTheme(config, warnings);
    this.validateExport(config, warnings);
    this.validatePreset(config, errors, warnings);
    
    rulesExecuted += 9; // Built-in rules count
    
    // Execute custom rules
    const applicableRules = Array.from(this.rules.values())
      .filter(rule => !options?.ruleFilter || options.ruleFilter(rule))
      .filter(rule => !rule.condition || rule.condition(config));
    
    for (const rule of applicableRules) {
      try {
        const ruleResult = rule.validate(config);
        if (ruleResult) {
          errors.push(...ruleResult.errors);
          warnings.push(...ruleResult.warnings);
          suggestions.push(...ruleResult.suggestions);
        }
        rulesExecuted++;
      } catch (error) {
        console.warn(`Validation rule '${rule.id}' failed:`, error);
      }
    }
    
    const endTime = performance.now();
    const result: ValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      timestamp: new Date(),
      configHash,
      ...(options?.includeMetrics && {
        metrics: {
          validationTime: endTime - startTime,
          rulesExecuted,
        },
      }),
    };
    
    // Cache result if enabled
    if (options?.useCache) {
      this.cache.set(configHash, result);
    }
    
    return result;
  }
  
  /**
   * Quick validation check - returns only boolean result
   */
  static isValid<T = any>(config: AdvancedTableConfig<T>): boolean {
    return this.validate(config, { useCache: true }).isValid;
  }
  
  /**
   * Get only validation errors
   */
  static getErrors<T = any>(config: AdvancedTableConfig<T>): ConfigValidationError[] {
    return this.validate(config, { useCache: true }).errors;
  }
  
  /**
   * Get only validation warnings
   */
  static getWarnings<T = any>(config: AdvancedTableConfig<T>): ConfigValidationWarning[] {
    return this.validate(config, { useCache: true }).warnings;
  }
  
  /**
   * Get only validation suggestions
   */
  static getSuggestions<T = any>(config: AdvancedTableConfig<T>): ConfigValidationSuggestion[] {
    return this.validate(config, { useCache: true }).suggestions;
  }
  
  /**
   * Validate required fields
   */
  private static validateRequired<T>(
    config: AdvancedTableConfig<T>,
    errors: ConfigValidationError[]
  ): void {
    if (!config.data) {
      errors.push({
        code: ValidationErrorCode.MISSING_DATA,
        message: 'Data is required for table configuration',
        path: 'data',
        fix: 'Provide an array of data objects: { data: [{ ... }] }',
      });
    }
    
    if (!config.columns) {
      errors.push({
        code: ValidationErrorCode.MISSING_COLUMNS,
        message: 'Columns are required for table configuration',
        path: 'columns',
        fix: 'Provide an array of column definitions: { columns: [{ id: "...", header: "..." }] }',
      });
    }
  }
  
  /**
   * Validate data structure and types
   */
  private static validateDataStructure<T>(
    config: AdvancedTableConfig<T>,
    errors: ConfigValidationError[],
    warnings: ConfigValidationWarning[]
  ): void {
    if (config.data) {
      if (!Array.isArray(config.data)) {
        errors.push({
          code: ValidationErrorCode.INVALID_DATA_TYPE,
          message: 'Data must be an array',
          path: 'data',
          fix: 'Ensure data is an array: { data: [...] }',
        });
      } else if (config.data.length === 0) {
        warnings.push({
          code: ValidationWarningCode.EMPTY_DATA,
          message: 'Data array is empty - table will show no content',
          path: 'data',
          suggestion: 'Consider providing sample data or an empty state component',
        });
      }
    }
    
    if (config.columns) {
      if (!Array.isArray(config.columns)) {
        errors.push({
          code: ValidationErrorCode.INVALID_COLUMNS_TYPE,
          message: 'Columns must be an array',
          path: 'columns',
          fix: 'Ensure columns is an array: { columns: [...] }',
        });
      } else if (config.columns.length === 0) {
        errors.push({
          code: ValidationErrorCode.MISSING_COLUMNS,
          message: 'At least one column definition is required',
          path: 'columns',
          fix: 'Add at least one column definition',
        });
      }
    }
  }
  
  /**
   * Validate column definitions
   */
  private static validateColumns<T>(
    config: AdvancedTableConfig<T>,
    errors: ConfigValidationError[],
    warnings: ConfigValidationWarning[]
  ): void {
    if (!config.columns || !Array.isArray(config.columns)) return;
    
    config.columns.forEach((column, index) => {
      const columnPath = `columns[${index}]`;
      
      // Check for required identifiers
      if (!column.id && !(column as any).accessorKey && !(column as any).accessorFn) {
        errors.push({
          code: ValidationErrorCode.MISSING_COLUMN_ID,
          message: `Column at index ${index} is missing identifier`,
          path: columnPath,
          fix: 'Provide either id, accessorKey, or accessorFn: { id: "columnId" } or { accessorKey: "dataProperty" }',
        });
      }
      
      // Check for headers (UX warning)
      if (!column.header) {
        warnings.push({
          code: ValidationWarningCode.MISSING_COLUMN_HEADER,
          message: `Column at index ${index} is missing header`,
          path: `${columnPath}.header`,
          suggestion: 'Provide a header for better user experience: { header: "Column Title" }',
        });
      }
      
      // Check for duplicate IDs
      const columnId = column.id || (column as any).accessorKey;
      if (columnId) {
        const duplicates = config.columns.filter((col, idx) => 
          idx !== index && (col.id === columnId || (col as any).accessorKey === columnId)
        );
        
        if (duplicates.length > 0) {
          errors.push({
            code: ValidationErrorCode.MISSING_COLUMN_ID,
            message: `Duplicate column identifier '${columnId}' found`,
            path: columnPath,
            fix: 'Ensure all column identifiers are unique',
          });
        }
      }
    });
  }
  
  /**
   * Validate feature configurations
   */
  private static validateFeatures<T>(
    config: AdvancedTableConfig<T>,
    errors: ConfigValidationError[],
    warnings: ConfigValidationWarning[],
    suggestions: ConfigValidationSuggestion[]
  ): void {
    if (!config.features) return;
    
    // Check for conflicting features
    if (config.features.virtualization && config.features.pagination) {
      warnings.push({
        code: ValidationWarningCode.CONFLICTING_FEATURE_COMBINATION,
        message: 'Virtualization and pagination should not be used together',
        path: 'features',
        suggestion: 'Disable pagination when using virtualization for better performance',
      });
    }
    
    // Check for grouping with virtualization
    if (config.features.virtualization && config.features.grouping) {
      warnings.push({
        code: ValidationWarningCode.CONFLICTING_FEATURE_COMBINATION,
        message: 'Virtualization with grouping may cause performance issues',
        path: 'features',
        suggestion: 'Consider disabling grouping or virtualization for better performance',
      });
    }
    
    // Suggest features for large datasets
    if (config.data && config.data.length > 1000) {
      if (!config.features.virtualization) {
        suggestions.push({
          type: 'performance',
          message: 'Consider enabling virtualization for large datasets (>1000 rows)',
          path: 'features.virtualization',
          priority: 'high',
        });
      }
      
      if (!config.features.pagination) {
        suggestions.push({
          type: 'performance',
          message: 'Consider enabling pagination for large datasets',
          path: 'features.pagination',
          priority: 'medium',
        });
      }
    }
  }
  
  /**
   * Validate performance configuration
   */
  private static validatePerformance<T>(
    config: AdvancedTableConfig<T>,
    warnings: ConfigValidationWarning[],
    suggestions: ConfigValidationSuggestion[]
  ): void {
    const perf = config.performance;
    if (!perf) return;
    
    // Validate virtualization settings
    if (perf.virtualization?.enabled) {
      if (!perf.virtualization.rowHeight || perf.virtualization.rowHeight <= 0) {
        warnings.push({
          code: ValidationWarningCode.PERFORMANCE_CONCERN,
          message: 'Invalid row height for virtualization',
          path: 'performance.virtualization.rowHeight',
          suggestion: 'Provide a positive row height value (e.g., 35)',
        });
      }
      
      if (perf.virtualization.overscan && perf.virtualization.overscan < 0) {
        warnings.push({
          code: ValidationWarningCode.PERFORMANCE_CONCERN,
          message: 'Overscan value should be non-negative',
          path: 'performance.virtualization.overscan',
          suggestion: 'Use a non-negative overscan value (e.g., 5)',
        });
      }
    }
    
    // Validate debounce settings
    if (perf.debounceDelay && perf.debounceDelay < 0) {
      warnings.push({
        code: ValidationWarningCode.PERFORMANCE_CONCERN,
        message: 'Debounce delay should be non-negative',
        path: 'performance.debounceDelay',
        suggestion: 'Use a non-negative debounce delay (e.g., 300)',
      });
    }
    
    // Performance suggestions
    if (config.data && config.data.length > 500 && !perf.enableMemoization) {
      suggestions.push({
        type: 'performance',
        message: 'Consider enabling memoization for better performance with medium-large datasets',
        path: 'performance.enableMemoization',
        priority: 'medium',
      });
    }
  }
  
  /**
   * Validate accessibility configuration
   */
  private static validateAccessibility<T>(
    config: AdvancedTableConfig<T>,
    warnings: ConfigValidationWarning[],
    suggestions: ConfigValidationSuggestion[]
  ): void {
    const a11y = config.accessibility;
    
    if (!a11y?.ariaLabel && !a11y?.ariaDescription) {
      suggestions.push({
        type: 'accessibility',
        message: 'Consider adding ARIA labels for better screen reader support',
        path: 'accessibility.ariaLabel',
        priority: 'medium',
      });
    }
    
    if (a11y?.keyboardNavigation === false) {
      warnings.push({
        code: ValidationWarningCode.ACCESSIBILITY_CONCERN,
        message: 'Disabling keyboard navigation reduces accessibility',
        path: 'accessibility.keyboardNavigation',
        suggestion: 'Keep keyboard navigation enabled for better accessibility',
      });
    }
    
    if (a11y?.screenReaderAnnouncements === false) {
      suggestions.push({
        type: 'accessibility',
        message: 'Screen reader announcements improve accessibility for dynamic content',
        path: 'accessibility.screenReaderAnnouncements',
        priority: 'medium',
      });
    }
  }
  
  /**
   * Validate theme configuration
   */
  private static validateTheme<T>(
    config: AdvancedTableConfig<T>,
    warnings: ConfigValidationWarning[]
  ): void {
    const theme = config.theme;
    if (!theme) return;
    
    // Validate color scheme
    if (theme.colorScheme && !['light', 'dark', 'auto'].includes(theme.colorScheme)) {
      warnings.push({
        code: ValidationWarningCode.SUBOPTIMAL_CONFIG,
        message: 'Invalid color scheme value',
        path: 'theme.colorScheme',
        suggestion: 'Use "light", "dark", or "auto"',
      });
    }
    
    // Validate variant
    const validVariants = ['default', 'minimal', 'enterprise', 'compact', 'spacious'];
    if (theme.variant && !validVariants.includes(theme.variant)) {
      warnings.push({
        code: ValidationWarningCode.SUBOPTIMAL_CONFIG,
        message: 'Invalid theme variant',
        path: 'theme.variant',
        suggestion: `Use one of: ${validVariants.join(', ')}`,
      });
    }
  }
  
  /**
   * Validate export configuration
   */
  private static validateExport<T>(
    config: AdvancedTableConfig<T>,
    warnings: ConfigValidationWarning[]
  ): void {
    const exportConfig = config.export;
    if (!exportConfig) return;
    
    // Validate CSV settings
    if (exportConfig.csv?.enabled && exportConfig.csv.delimiter) {
      if (exportConfig.csv.delimiter.length !== 1) {
        warnings.push({
          code: ValidationWarningCode.SUBOPTIMAL_CONFIG,
          message: 'CSV delimiter should be a single character',
          path: 'export.csv.delimiter',
          suggestion: 'Use a single character like "," or ";"',
        });
      }
    }
    
    // Validate print settings
    if (exportConfig.print?.enabled && exportConfig.print.paperSize) {
      const validSizes = ['A4', 'letter', 'legal'];
      if (!validSizes.includes(exportConfig.print.paperSize)) {
        warnings.push({
          code: ValidationWarningCode.SUBOPTIMAL_CONFIG,
          message: 'Invalid paper size for print export',
          path: 'export.print.paperSize',
          suggestion: `Use one of: ${validSizes.join(', ')}`,
        });
      }
    }
  }
  
  /**
   * Validate preset configuration
   */
  private static validatePreset<T>(
    config: AdvancedTableConfig<T>,
    errors: ConfigValidationError[],
    warnings: ConfigValidationWarning[]
  ): void {
    if (!config.preset) return;
    
    // This would typically check against available presets
    // For now, we'll validate the preset name format
    if (typeof config.preset !== 'string' || config.preset.trim().length === 0) {
      errors.push({
        code: ValidationErrorCode.INVALID_PRESET,
        message: 'Preset name must be a non-empty string',
        path: 'preset',
        fix: 'Provide a valid preset name like "basic-table" or "data-grid"',
      });
    }
  }
  
  /**
   * Generate a hash for configuration caching
   */
  private static generateConfigHash<T>(config: AdvancedTableConfig<T>): string {
    // Simple hash generation for caching purposes
    const configString = JSON.stringify({
      dataLength: config.data?.length || 0,
      columnsLength: config.columns?.length || 0,
      preset: config.preset,
      features: config.features,
      performance: config.performance,
      theme: config.theme,
      accessibility: config.accessibility,
      export: config.export,
    });
    
    let hash = 0;
    for (let i = 0; i < configString.length; i++) {
      const char = configString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return hash.toString(36);
  }
}

/**
 * Built-in validation rules that can be extended
 */
export const BuiltInValidationRules = {
  /**
   * Rule to check for required fields
   */
  REQUIRED_FIELDS: {
    id: 'required-fields',
    description: 'Validates that required configuration fields are present',
    category: 'error' as const,
    priority: 'critical' as const,
    validate: <T>(config: AdvancedTableConfig<T>) => {
      const errors: ConfigValidationError[] = [];
      
      if (!config.data) {
        errors.push({
          code: ValidationErrorCode.MISSING_DATA,
          message: 'Data is required',
          path: 'data',
          fix: 'Provide data array',
        });
      }
      
      if (!config.columns) {
        errors.push({
          code: ValidationErrorCode.MISSING_COLUMNS,
          message: 'Columns are required',
          path: 'columns',
          fix: 'Provide columns array',
        });
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        warnings: [],
        suggestions: [],
        timestamp: new Date(),
      };
    },
  },
  
  /**
   * Rule to check for performance optimizations
   */
  PERFORMANCE_OPTIMIZATION: {
    id: 'performance-optimization',
    description: 'Suggests performance optimizations based on data size',
    category: 'suggestion' as const,
    priority: 'medium' as const,
    validate: <T>(config: AdvancedTableConfig<T>) => {
      const suggestions: ConfigValidationSuggestion[] = [];
      
      if (config.data && config.data.length > 1000 && !config.features?.virtualization) {
        suggestions.push({
          type: 'performance',
          message: 'Enable virtualization for large datasets',
          path: 'features.virtualization',
          priority: 'high',
        });
      }
      
      return {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions,
        timestamp: new Date(),
      };
    },
  },
} as const;

// Register built-in rules
Object.values(BuiltInValidationRules).forEach(rule => {
  ConfigValidator.registerRule(rule);
});

/**
 * Utility functions for validation
 */
export const ValidationUtils = {
  /**
   * Create a validation error
   */
  createError(
    code: ValidationErrorCode | string,
    message: string,
    path: string,
    fix?: string
  ): ConfigValidationError {
    return { code, message, path, fix };
  },
  
  /**
   * Create a validation warning
   */
  createWarning(
    code: ValidationWarningCode | string,
    message: string,
    path: string,
    suggestion?: string
  ): ConfigValidationWarning {
    return { code, message, path, suggestion };
  },
  
  /**
   * Create a validation suggestion
   */
  createSuggestion(
    type: ConfigValidationSuggestion['type'],
    message: string,
    priority: ConfigValidationSuggestion['priority'],
    path?: string
  ): ConfigValidationSuggestion {
    return { type, message, priority, path };
  },
  
  /**
   * Format validation results for display
   */
  formatResults(result: ValidationResult): string {
    const lines: string[] = [];
    
    if (result.errors.length > 0) {
      lines.push('❌ Errors:');
      result.errors.forEach(error => {
        lines.push(`  • ${error.message} (${error.path})`);
        if (error.fix) {
          lines.push(`    Fix: ${error.fix}`);
        }
      });
    }
    
    if (result.warnings.length > 0) {
      lines.push('⚠️  Warnings:');
      result.warnings.forEach(warning => {
        lines.push(`  • ${warning.message} (${warning.path})`);
        if (warning.suggestion) {
          lines.push(`    Suggestion: ${warning.suggestion}`);
        }
      });
    }
    
    if (result.suggestions.length > 0) {
      lines.push('💡 Suggestions:');
      result.suggestions.forEach(suggestion => {
        lines.push(`  • ${suggestion.message} [${suggestion.priority}]`);
      });
    }
    
    if (result.isValid && result.errors.length === 0 && result.warnings.length === 0) {
      lines.push('✅ Configuration is valid');
    }
    
    return lines.join('\n');
  },
};