import { FeatureKey } from "../components/column-definitions";
import { TablePreset } from "../types/table-config";
export type { TablePreset };
export declare const TABLE_PRESETS: Record<string, TablePreset>;
export declare const getPreset: (presetName: string) => TablePreset | undefined;
export declare const getPresetNames: () => string[];
export declare const getPresetFeatures: (presetName: string) => Record<FeatureKey, boolean> | undefined;
//# sourceMappingURL=presets.d.ts.map