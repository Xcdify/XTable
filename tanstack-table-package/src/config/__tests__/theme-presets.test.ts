import { describe, it, expect } from 'vitest';
import { 
  getThemePreset, 
  getThemePresetNames, 
  getThemeProperties,
  createCustomTheme,
  THEME_PRESETS 
} from '../theme-presets';

describe('Theme Presets', () => {
  it('should have all required theme presets', () => {
    const presetNames = getThemePresetNames();
    expect(presetNames).toContain('default');
    expect(presetNames).toContain('minimal');
    expect(presetNames).toContain('enterprise');
  });

  it('should return theme preset by name', () => {
    const defaultPreset = getThemePreset('default');
    expect(defaultPreset).toBeDefined();
    expect(defaultPreset?.name).toBe('default');
    expect(defaultPreset?.description).toBeDefined();
    expect(defaultPreset?.properties).toBeDefined();
  });

  it('should return undefined for non-existent preset', () => {
    const nonExistentPreset = getThemePreset('non-existent');
    expect(nonExistentPreset).toBeUndefined();
  });

  it('should get theme properties for light mode', () => {
    const properties = getThemeProperties('default', 'light');
    expect(properties).toBeDefined();
    expect(properties['--table-bg-primary']).toBe('#ffffff');
    expect(properties['--table-text-primary']).toBe('#1e293b');
  });

  it('should get theme properties for dark mode', () => {
    const properties = getThemeProperties('default', 'dark');
    expect(properties).toBeDefined();
    expect(properties['--table-bg-primary']).toBe('#1f2937');
    expect(properties['--table-text-primary']).toBe('#f9fafb');
  });

  it('should create custom theme with overrides', () => {
    const customProperties = createCustomTheme('default', {
      '--table-bg-primary': '#custom-color',
    }, 'light');
    
    expect(customProperties['--table-bg-primary']).toBe('#custom-color');
    expect(customProperties['--table-text-primary']).toBe('#1e293b'); // Should keep original
  });

  it('should have valid CSS properties for all presets', () => {
    Object.values(THEME_PRESETS).forEach(preset => {
      expect(preset.properties['--table-bg-primary']).toBeDefined();
      expect(preset.properties['--table-text-primary']).toBeDefined();
      expect(preset.properties['--table-border-color']).toBeDefined();
      expect(preset.properties['--table-font-family']).toBeDefined();
    });
  });

  it('should have different properties for different presets', () => {
    const defaultPreset = getThemePreset('default');
    const minimalPreset = getThemePreset('minimal');
    const enterprisePreset = getThemePreset('enterprise');

    expect(defaultPreset?.properties['--table-border-radius']).not.toBe(
      minimalPreset?.properties['--table-border-radius']
    );
    
    expect(defaultPreset?.properties['--table-cell-padding']).not.toBe(
      enterprisePreset?.properties['--table-cell-padding']
    );
  });
});