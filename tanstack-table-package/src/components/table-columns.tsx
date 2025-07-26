// Re-export from the new modular structure for backward compatibility
export { defaultData } from "../data/sample-data";
export type { FeatureKey } from "./column-definitions";
export {
  createUtilityColumns,
  createTextColumn,
  createNumberColumn,
  createCurrencyColumn,
  createDateColumn,
  createSelectColumn
} from "./column-definitions";
