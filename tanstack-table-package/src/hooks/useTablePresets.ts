import { useState, useCallback } from "react";
import { FeatureKey } from "../components/column-definitions";
import { TABLE_PRESETS, TablePreset, getPreset, getPresetFeatures } from "../config/presets";

export interface UseTablePresetsReturn {
  currentPreset: string | null;
  availablePresets: Record<string, TablePreset>;
  applyPreset: (presetName: string) => Record<FeatureKey, boolean> | null;
  getCurrentPresetInfo: () => TablePreset | null;
  isPresetActive: (presetName: string, currentFeatures: Record<FeatureKey, boolean>) => boolean;
}

export function useTablePresets(): UseTablePresetsReturn {
  const [currentPreset, setCurrentPreset] = useState<string | null>(null);

  const applyPreset = useCallback((presetName: string): Record<FeatureKey, boolean> | null => {
    const features = getPresetFeatures(presetName);
    if (features) {
      setCurrentPreset(presetName);
      return features;
    }
    return null;
  }, []);

  const getCurrentPresetInfo = useCallback((): TablePreset | null => {
    if (!currentPreset) return null;
    return getPreset(currentPreset) || null;
  }, [currentPreset]);

  const isPresetActive = useCallback((
    presetName: string, 
    currentFeatures: Record<FeatureKey, boolean>
  ): boolean => {
    const presetFeatures = getPresetFeatures(presetName);
    if (!presetFeatures) return false;

    // Check if all features match the preset
    return Object.keys(presetFeatures).every(key => {
      const featureKey = key as FeatureKey;
      return currentFeatures[featureKey] === presetFeatures[featureKey];
    });
  }, []);

  return {
    currentPreset,
    availablePresets: TABLE_PRESETS,
    applyPreset,
    getCurrentPresetInfo,
    isPresetActive,
  };
}