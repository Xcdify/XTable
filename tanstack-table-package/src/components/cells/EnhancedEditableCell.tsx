import React, { useState, useEffect, useRef, useCallback } from "react";

interface BaseEditableCellProps {
  initialValue: any;
  depth: number;
  onUpdate?: (value: any) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

// Text input cell
export const EditableTextCell: React.FC<BaseEditableCellProps> = ({ 
  initialValue, 
  depth, 
  onUpdate,
  onKeyDown
}) => {
  const [value, setValue] = useState(String(initialValue || ''));
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  
  useEffect(() => {
    setValue(String(initialValue || ''));
  }, [initialValue]);
  
  const handleSave = useCallback(() => {
    setIsEditing(false);
    onUpdate?.(value);
  }, [value, onUpdate]);
  
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setValue(String(initialValue || ''));
  }, [initialValue]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isEditing) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      } else if (e.key === 'Tab') {
        handleSave();
      }
    } else {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsEditing(true);
      }
    }
    onKeyDown?.(e);
  }, [isEditing, handleSave, handleCancel, onKeyDown]);
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  return (
    <div style={{ paddingLeft: `${depth * 20}px` }}>
      {isEditing ? (
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="w-full px-1 py-0.5 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <span
          ref={spanRef}
          onClick={() => setIsEditing(true)}
          onKeyDown={handleKeyDown}
          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-1 py-0.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 block"
          tabIndex={0}
          role="button"
          aria-label={`Edit ${value}`}
        >
          {value || 'Click to edit'}
        </span>
      )}
    </div>
  );
};

// Number input cell
export const EditableNumberCell: React.FC<BaseEditableCellProps> = ({ 
  initialValue, 
  depth, 
  onUpdate,
  onKeyDown
}) => {
  const [value, setValue] = useState(String(initialValue || ''));
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    setValue(String(initialValue || ''));
  }, [initialValue]);
  
  const handleSave = useCallback(() => {
    setIsEditing(false);
    const numValue = parseFloat(value);
    onUpdate?.(isNaN(numValue) ? initialValue : numValue);
  }, [value, onUpdate, initialValue]);
  
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setValue(String(initialValue || ''));
  }, [initialValue]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isEditing) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      } else if (e.key === 'Tab') {
        handleSave();
      }
    } else {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsEditing(true);
      }
    }
    onKeyDown?.(e);
  }, [isEditing, handleSave, handleCancel, onKeyDown]);
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  return (
    <div style={{ paddingLeft: `${depth * 20}px` }}>
      {isEditing ? (
        <input
          ref={inputRef}
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="w-full px-1 py-0.5 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          onKeyDown={handleKeyDown}
          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-1 py-0.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 block"
          tabIndex={0}
          role="button"
          aria-label={`Edit ${value}`}
        >
          {value || 'Click to edit'}
        </span>
      )}
    </div>
  );
};

// Date input cell
export const EditableDateCell: React.FC<BaseEditableCellProps> = ({ 
  initialValue, 
  depth, 
  onUpdate,
  onKeyDown
}) => {
  const [value, setValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (initialValue) {
      const date = new Date(initialValue);
      setValue(date.toISOString().split('T')[0]);
    }
  }, [initialValue]);
  
  const handleSave = useCallback(() => {
    setIsEditing(false);
    onUpdate?.(value ? new Date(value).toISOString() : initialValue);
  }, [value, onUpdate, initialValue]);
  
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    if (initialValue) {
      const date = new Date(initialValue);
      setValue(date.toISOString().split('T')[0]);
    }
  }, [initialValue]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isEditing) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      } else if (e.key === 'Tab') {
        handleSave();
      }
    } else {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsEditing(true);
      }
    }
    onKeyDown?.(e);
  }, [isEditing, handleSave, handleCancel, onKeyDown]);
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);
  
  const displayValue = initialValue ? new Date(initialValue).toLocaleDateString() : 'No date';
  
  return (
    <div style={{ paddingLeft: `${depth * 20}px` }}>
      {isEditing ? (
        <input
          ref={inputRef}
          type="date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="w-full px-1 py-0.5 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          onKeyDown={handleKeyDown}
          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-1 py-0.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 block"
          tabIndex={0}
          role="button"
          aria-label={`Edit ${displayValue}`}
        >
          {displayValue}
        </span>
      )}
    </div>
  );
};

// Select dropdown cell
export const EditableSelectCell: React.FC<BaseEditableCellProps & { 
  options: string[];
  getOptionStyles?: (option: string) => string;
}> = ({ 
  initialValue, 
  depth, 
  onUpdate,
  onKeyDown,
  options,
  getOptionStyles
}) => {
  const [value, setValue] = useState(String(initialValue || ''));
  const [isEditing, setIsEditing] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);
  
  useEffect(() => {
    setValue(String(initialValue || ''));
  }, [initialValue]);
  
  const handleSave = useCallback(() => {
    setIsEditing(false);
    onUpdate?.(value);
  }, [value, onUpdate]);
  
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setValue(String(initialValue || ''));
  }, [initialValue]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isEditing) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      } else if (e.key === 'Tab') {
        handleSave();
      }
    } else {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsEditing(true);
      }
    }
    onKeyDown?.(e);
  }, [isEditing, handleSave, handleCancel, onKeyDown]);
  
  useEffect(() => {
    if (isEditing && selectRef.current) {
      selectRef.current.focus();
    }
  }, [isEditing]);
  
  return (
    <div style={{ paddingLeft: `${depth * 20}px` }}>
      {isEditing ? (
        <select
          ref={selectRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="w-full px-1 py-0.5 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          onKeyDown={handleKeyDown}
          className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 block text-xs ${getOptionStyles?.(value) || ''}`}
          tabIndex={0}
          role="button"
          aria-label={`Edit ${value}`}
        >
          {value || 'Select option'}
        </span>
      )}
    </div>
  );
};

// Currency input cell
export const EditableCurrencyCell: React.FC<BaseEditableCellProps> = ({ 
  initialValue, 
  depth, 
  onUpdate,
  onKeyDown
}) => {
  const [value, setValue] = useState(String(initialValue || ''));
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    setValue(String(initialValue || ''));
  }, [initialValue]);
  
  const handleSave = useCallback(() => {
    setIsEditing(false);
    const numValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
    onUpdate?.(isNaN(numValue) ? initialValue : numValue);
  }, [value, onUpdate, initialValue]);
  
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setValue(String(initialValue || ''));
  }, [initialValue]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isEditing) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      } else if (e.key === 'Tab') {
        handleSave();
      }
    } else {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsEditing(true);
      }
    }
    onKeyDown?.(e);
  }, [isEditing, handleSave, handleCancel, onKeyDown]);
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  const displayValue = typeof initialValue === 'number' 
    ? `$${initialValue.toLocaleString()}` 
    : initialValue || '$0';
  
  return (
    <div style={{ paddingLeft: `${depth * 20}px` }}>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          placeholder="Enter amount"
          className="w-full px-1 py-0.5 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          onKeyDown={handleKeyDown}
          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-1 py-0.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 block"
          tabIndex={0}
          role="button"
          aria-label={`Edit ${displayValue}`}
        >
          {displayValue}
        </span>
      )}
    </div>
  );
};