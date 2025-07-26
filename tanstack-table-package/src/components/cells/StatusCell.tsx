import React from "react";

interface StatusCellProps {
  value: string;
  depth: number;
}

const StatusCellComponent: React.FC<StatusCellProps> = ({ value, depth }) => {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Single':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Married':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Divorced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div style={{ paddingLeft: `${depth * 20}px` }}>
      <span className={`px-2 py-1 rounded text-xs ${getStatusStyles(value)}`}>
        {value}
      </span>
    </div>
  );
};

// Memoized version for better performance
export const StatusCell = React.memo(StatusCellComponent, (prevProps, nextProps) => {
  return (
    prevProps.value === nextProps.value &&
    prevProps.depth === nextProps.depth
  );
});