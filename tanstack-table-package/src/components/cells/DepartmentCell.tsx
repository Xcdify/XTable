import React from "react";

interface DepartmentCellProps {
  value: string;
  depth: number;
}

const DepartmentCellComponent: React.FC<DepartmentCellProps> = ({ value, depth }) => {
  const getDepartmentStyles = (department: string) => {
    switch (department) {
      case 'Sales':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Marketing':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Engineering':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'HR':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Finance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div style={{ paddingLeft: `${depth * 20}px` }}>
      <span className={`px-2 py-1 rounded text-xs ${getDepartmentStyles(value)}`}>
        {value}
      </span>
    </div>
  );
};

// Memoized version for better performance
export const DepartmentCell = React.memo(DepartmentCellComponent, (prevProps, nextProps) => {
  return (
    prevProps.value === nextProps.value &&
    prevProps.depth === nextProps.depth
  );
});