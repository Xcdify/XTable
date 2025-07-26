import { FeatureKey } from "../components/column-definitions";
import { TablePreset } from "../config/presets";
export interface UseTablePresetsReturn {
    currentPreset: string | null;
    availablePresets: Record<string, TablePreset>;
    applyPreset: (presetName: string) => Record<FeatureKey, boolean> | null;
    getCurrentPresetInfo: () => TablePreset | null;
    isPresetActive: (presetName: string, currentFeatures: Record<FeatureKey, boolean>) => boolean;
}
export declare function useTablePresets(): UseTablePresetsReturn;
//# sourceMappingURL=useTablePresets.d.ts.map