import React from "react";

interface RegionCellProps {
  value: string;
  depth: number;
}

const RegionCellComponent: React.FC<RegionCellProps> = ({ value, depth }) => {
  const getRegionStyles = (region: string) => {
    switch (region) {
      case 'North':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'South':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'East':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'West':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div style={{ paddingLeft: `${depth * 20}px` }}>
      <span className={`px-2 py-1 rounded text-xs ${getRegionStyles(value)}`}>
        {value}
      </span>
    </div>
  );
};

// Memoized version for better performance
export const RegionCell = React.memo(RegionCellComponent, (prevProps, nextProps) => {
  return (
    prevProps.value === nextProps.value &&
    prevProps.depth === nextProps.depth
  );
});