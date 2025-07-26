"use client";

import React from "react";
import { defaultData } from "../data/sample-data";
import { useAdvancedTable } from "../hooks/useAdvancedTable";
import { useTablePresets } from "../hooks/useTablePresets";
import { EnhancedTableView } from "./enhanced-table-view";

export function PresetDemo() {
  const { availablePresets, applyPreset, isPresetActive } = useTablePresets();
  
  const [currentPresetName, setCurrentPresetName] = React.useState<string>('basic-table');
  
  const {
    table,
    features: enabled,
    toggleFeature,
  } = useAdvancedTable({
    data: defaultData,
    preset: currentPresetName,
  });

  const handlePresetChange = (presetName: string) => {
    setCurrentPresetName(presetName);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Table Configuration Presets</h2>
        
        <div className="flex flex-wrap gap-2">
          {Object.entries(availablePresets).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => handlePresetChange(key)}
              className={`px-4 py-2 rounded border text-sm ${
                currentPresetName === key
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
        
        {availablePresets[currentPresetName] && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded">
            <h3 className="font-medium">{availablePresets[currentPresetName].name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {availablePresets[currentPresetName].description}
            </p>
            
            <div className="mt-3">
              <h4 className="text-sm font-medium mb-2">Active Features:</h4>
              <div className="flex flex-wrap gap-1">
                {Object.entries(enabled)
                  .filter(([_, isEnabled]) => isEnabled)
                  .map(([feature]) => (
                    <span
                      key={feature}
                      className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs rounded"
                    >
                      {feature}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <EnhancedTableView table={table} features={enabled} />
    </div>
  );
}