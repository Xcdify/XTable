import { TableFeatures } from "../components/ReusableAdvancedTable";
export interface TablePreset {
    name: string;
    description: string;
    features: TableFeatures;
    performanceConfig?: {
        debounceDelay?: number;
        enableMemoization?: boolean;
        enablePerformanceLogging?: boolean;
        virtualizationThreshold?: number;
    };
    theme?: {
        variant?: 'default' | 'minimal' | 'enterprise' | 'compact' | 'spacious';
        colorScheme?: 'light' | 'dark' | 'auto';
    };
    initialState?: {
        pagination?: {
            pageIndex: number;
            pageSize: number;
        };
    };
}
/**
 * Predefined table presets for common use cases
 */
export declare const TABLE_PRESETS: Record<string, TablePreset>;
/**
 * Get a preset configuration by name
 */
export declare function getPreset(presetName: string): TablePreset | undefined;
/**
 * Get all available preset names
 */
export declare function getPresetNames(): string[];
/**
 * Get presets filtered by category or feature
 */
export declare function getPresetsByFeature(feature: keyof TableFeatures): TablePreset[];
/**
 * Create a custom preset
 */
export declare function createCustomPreset(name: string, description: string, config: Partial<TablePreset>): TablePreset;
//# sourceMappingURL=table-presets.d.ts.map