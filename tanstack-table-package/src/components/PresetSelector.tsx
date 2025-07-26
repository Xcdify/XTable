"use client";

import React, { useState } from "react";
import { TABLE_PRESETS, TablePreset } from "../config/table-presets";

interface PresetSelectorProps {
  currentPreset?: string;
  onPresetChange: (preset: TablePreset) => void;
  className?: string;
}

export function PresetSelector({ 
  currentPreset = 'standard', 
  onPresetChange, 
  className = "" 
}: PresetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(currentPreset);

  const handlePresetSelect = (presetKey: string) => {
    const preset = TABLE_PRESETS[presetKey];
    if (preset) {
      setSelectedPreset(presetKey);
      onPresetChange(preset);
      setIsOpen(false);
    }
  };

  const currentPresetData = TABLE_PRESETS[selectedPreset];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex flex-col items-start">
          <span className="font-medium">{currentPresetData?.name || 'Select Preset'}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-48">
            {currentPresetData?.description}
          </span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-96 overflow-y-auto">
            <div className="py-1">
              {Object.entries(TABLE_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => handlePresetSelect(key)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700 ${
                    selectedPreset === key 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{preset.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {preset.description}
                    </span>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {Object.entries(preset.features)
                        .filter(([, enabled]) => enabled)
                        .slice(0, 4)
                        .map(([feature]) => (
                          <span
                            key={feature}
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          >
                            {feature}
                          </span>
                        ))}
                      {Object.values(preset.features).filter(Boolean).length > 4 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                          +{Object.values(preset.features).filter(Boolean).length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}