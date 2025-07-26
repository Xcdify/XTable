import React from "react";

interface ProgressCellProps {
  value: number;
  depth: number;
}

const ProgressCellComponent: React.FC<ProgressCellProps> = ({ value, depth }) => {
  return (
    <div style={{ paddingLeft: `${depth * 20}px` }}>
      <div className="flex items-center gap-2">
        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all" 
            style={{ width: `${value}%` }}
          />
        </div>
        <span className="text-xs">{value}%</span>
      </div>
    </div>
  );
};

// Memoized version for better performance
export const ProgressCell = React.memo(ProgressCellComponent, (prevProps, nextProps) => {
  return (
    prevProps.value === nextProps.value &&
    prevProps.depth === nextProps.depth
  );
});