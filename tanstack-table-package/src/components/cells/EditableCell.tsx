import React from "react";

interface EditableCellProps {
  initialValue: string;
  depth: number;
  onUpdate?: (value: string) => void;
}

const EditableCellComponent: React.FC<EditableCellProps> = ({ 
  initialValue, 
  depth, 
  onUpdate 
}) => {
  const [value, setValue] = React.useState(initialValue);
  const [isEditing, setIsEditing] = React.useState(false);
  
  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);
  
  const onBlur = () => {
    setIsEditing(false);
    onUpdate?.(value);
  };
  
  return (
    <div style={{ paddingLeft: `${depth * 20}px` }}>
      {isEditing ? (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={onBlur}
          onKeyDown={(e) => e.key === 'Enter' && onBlur()}
          className="w-full px-1 py-0.5 border rounded"
          autoFocus
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-1 py-0.5 rounded"
        >
          {value}
        </span>
      )}
    </div>
  );
};

// Memoized version for better performance
export const EditableCell = React.memo(EditableCellComponent, (prevProps, nextProps) => {
  return (
    prevProps.initialValue === nextProps.initialValue &&
    prevProps.depth === nextProps.depth &&
    prevProps.onUpdate === nextProps.onUpdate
  );
});