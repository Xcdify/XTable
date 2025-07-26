import { ThemeVariant, ColorScheme } from "../types/theme";
interface ThemeSelectorProps {
    variant?: ThemeVariant;
    colorScheme?: ColorScheme;
    onVariantChange?: (variant: ThemeVariant) => void;
    onColorSchemeChange?: (scheme: ColorScheme) => void;
    className?: string;
}
export declare function ThemeSelector({ variant, colorScheme, onVariantChange, onColorSchemeChange, className, }: ThemeSelectorProps): import("react/jsx-runtime").JSX.Element;
/**
 * Compact theme selector for inline use
 */
export declare function CompactThemeSelector({ variant, colorScheme, onVariantChange, onColorSchemeChange, }: ThemeSelectorProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=theme-selector.d.ts.map