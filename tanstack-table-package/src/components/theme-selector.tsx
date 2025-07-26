"use client";

import React from "react";
import { useTableTheme } from "../hooks/useTableTheme";
import { ThemeVariant, ColorScheme } from "../types/theme";
import { getThemePresetNames, getThemePreset } from "../config/theme-presets";

interface ThemeSelectorProps {
  variant?: ThemeVariant;
  colorScheme?: ColorScheme;
  onVariantChange?: (variant: ThemeVariant) => void;
  onColorSchemeChange?: (scheme: ColorScheme) => void;
  className?: string;
}

export function ThemeSelector({
  variant = 'default',
  colorScheme = 'auto',
  onVariantChange,
  onColorSchemeChange,
  className = '',
}: ThemeSelectorProps) {
  const { classNames, styles, toggleColorScheme } = useTableTheme({ variant, colorScheme });
  
  const presetNames = getThemePresetNames();
  
  const handleVariantChange = (newVariant: string) => {
    const typedVariant = newVariant as ThemeVariant;
    onVariantChange?.(typedVariant);
  };
  
  const handleColorSchemeChange = (newScheme: string) => {
    const typedScheme = newScheme as ColorScheme;
    onColorSchemeChange?.(typedScheme);
  };

  return (
    <div className={`theme-selector ${className}`} style={styles.controls}>
      <div className="flex flex-col gap-4 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold">Theme Settings</h3>
        
        {/* Theme Variant Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Theme Variant:</label>
          <select
            value={variant}
            onChange={(e) => handleVariantChange(e.target.value)}
            className="px-3 py-2 border rounded"
            style={styles.controls}
          >
            {presetNames.map((presetName) => {
              const preset = getThemePreset(presetName);
              return (
                <option key={presetName} value={presetName}>
                  {preset?.name || presetName} - {preset?.description || 'Custom theme'}
                </option>
              );
            })}
          </select>
        </div>

        {/* Color Scheme Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Color Scheme:</label>
          <div className="flex gap-2">
            {(['light', 'dark', 'auto'] as ColorScheme[]).map((scheme) => (
              <label key={scheme} className="flex items-center gap-1 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="colorScheme"
                  value={scheme}
                  checked={colorScheme === scheme}
                  onChange={(e) => handleColorSchemeChange(e.target.value)}
                />
                {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
              </label>
            ))}
          </div>
        </div>


      </div>
    </div>
  );
}

/**
 * Compact theme selector for inline use
 */
export function CompactThemeSelector({
  variant = 'default',
  colorScheme = 'auto',
  onVariantChange,
  onColorSchemeChange,
}: ThemeSelectorProps) {
  const { toggleColorScheme } = useTableTheme({ variant, colorScheme });
  
  return (
    <div className="flex items-center gap-2">
      <select
        value={variant}
        onChange={(e) => onVariantChange?.(e.target.value as ThemeVariant)}
        className="px-2 py-1 border rounded text-xs"
      >
        {getThemePresetNames().map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      
      <button
        onClick={toggleColorScheme}
        className="px-2 py-1 border rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
        title="Toggle light/dark mode"
      >
        🌓
      </button>
    </div>
  );
}