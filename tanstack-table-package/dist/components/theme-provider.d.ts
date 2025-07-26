import { ReactNode } from "react";
import { EnhancedThemeOptions, ThemeContextValue } from "../types/theme";
interface TableThemeProviderProps {
    children: ReactNode;
    initialTheme?: Partial<EnhancedThemeOptions>;
    enableSystemTheme?: boolean;
    storageKey?: string;
}
/**
 * Enhanced table theme provider that works alongside Next.js theme provider
 */
export declare function TableThemeProvider({ children, initialTheme, enableSystemTheme, storageKey }: TableThemeProviderProps): import("react/jsx-runtime").JSX.Element;
/**
 * Hook to use table theme context
 */
export declare function useTableTheme(): ThemeContextValue;
/**
 * Combined theme provider that includes both Next.js and table themes
 */
interface Props {
    children: ReactNode;
    tableTheme?: Partial<EnhancedThemeOptions>;
}
export declare function ThemeProvider({ children, tableTheme }: Props): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=theme-provider.d.ts.map