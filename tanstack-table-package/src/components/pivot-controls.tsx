import React, { useState } from 'react';
import { Table } from '@tanstack/react-table';
import { PivotTableView } from './pivot-table-view';

interface PivotState {
  rowFields: string[];
  columnFields: string[];
  valueFields: { field: string; aggregation: 'sum' | 'avg' | 'count' }[];
}

interface PivotControlsProps<T = any> {
  table: Table<T>;
}

export function PivotControls<T = any>({ table }: PivotControlsProps<T>) {
  const [pivotState, setPivotState] = useState<PivotState>({
    rowFields: [],
    columnFields: [],
    valueFields: []
  });

  const availableColumns = [
    { id: 'department', label: 'Department' },
    { id: 'region', label: 'Region' },
    { id: 'status', label: 'Status' },
    { id: 'performance', label: 'Performance' },
    { id: 'firstName', label: 'First Name' },
    { id: 'lastName', label: 'Last Name' }
  ];

  const valueColumns = [
    { id: 'salary', label: 'Salary', aggregations: ['sum', 'avg'] },
    { id: 'age', label: 'Age', aggregations: ['avg', 'count'] },
    { id: 'visits', label: 'Visits', aggregations: ['sum', 'avg'] },
    { id: 'progress', label: 'Progress', aggregations: ['avg'] }
  ];

  const addRowField = (field: string) => {
    if (!pivotState.rowFields.includes(field)) {
      setPivotState(prev => ({
        ...prev,
        rowFields: [...prev.rowFields, field]
      }));
    }
  };

  const addColumnField = (field: string) => {
    if (!pivotState.columnFields.includes(field)) {
      setPivotState(prev => ({
        ...prev,
        columnFields: [...prev.columnFields, field]
      }));
    }
  };

  const addValueField = (field: string, aggregation: 'sum' | 'avg' | 'count') => {
    const exists = pivotState.valueFields.find(v => v.field === field && v.aggregation === aggregation);
    if (!exists) {
      setPivotState(prev => ({
        ...prev,
        valueFields: [...prev.valueFields, { field, aggregation }]
      }));
    }
  };

  const removeField = (type: 'row' | 'column' | 'value', index: number) => {
    setPivotState(prev => {
      if (type === 'row') {
        return { ...prev, rowFields: prev.rowFields.filter((_, i) => i !== index) };
      } else if (type === 'column') {
        return { ...prev, columnFields: prev.columnFields.filter((_, i) => i !== index) };
      } else {
        return { ...prev, valueFields: prev.valueFields.filter((_, i) => i !== index) };
      }
    });
  };

  const generatePivotData = () => {
    const data = table.getFilteredRowModel().rows.map(row => row.original);
    
    if (pivotState.rowFields.length === 0 || pivotState.valueFields.length === 0) {
      return data;
    }

    // Group data by row fields
    const grouped = data.reduce((acc, item) => {
      const key = pivotState.rowFields.map(field => (item as any)[field] || 'N/A').join('|');
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, T[]>);

    // Create pivot structure
    const pivotData = Object.entries(grouped).map(([key, items]) => {
      const rowData: Record<string, any> = {};
      
      // Add row field values
      const keyParts = key.split('|');
      pivotState.rowFields.forEach((field, index) => {
        rowData[field] = keyParts[index];
      });

      // Calculate aggregated values
      pivotState.valueFields.forEach(({ field, aggregation }) => {
        const values = items.map(item => Number((item as any)[field]) || 0).filter(v => !isNaN(v));
        
        if (aggregation === 'sum') {
          rowData[`${field}_sum`] = values.reduce((sum, val) => sum + val, 0);
        } else if (aggregation === 'avg') {
          rowData[`${field}_avg`] = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
        } else if (aggregation === 'count') {
          rowData[`${field}_count`] = values.length;
        }
      });

      return rowData;
    });

    return pivotData;
  };

  const applyPivot = () => {
    // Generate pivot data for display
    const pivotData = generatePivotData();
    console.log('Pivot Data:', pivotData);
    console.log('Pivot Configuration:', pivotState);
  };

  const tableData = table.getFilteredRowModel().rows.map(row => row.original);

  return (
    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
      <div className="text-sm font-medium mb-4">Pivot Configuration</div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Row Fields */}
        <div>
          <label className="block text-xs font-medium mb-2">Rows (Group By)</label>
          <select 
            className="w-full text-xs border rounded px-2 py-1 mb-2"
            onChange={(e) => e.target.value && addRowField(e.target.value)}
            value=""
          >
            <option value="">Add row field...</option>
            {availableColumns.map(col => (
              <option key={col.id} value={col.id}>{col.label}</option>
            ))}
          </select>
          <div className="space-y-1">
            {pivotState.rowFields.map((field, index) => (
              <div key={index} className="flex items-center justify-between bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-xs">
                <span>{availableColumns.find(c => c.id === field)?.label || field}</span>
                <button 
                  onClick={() => removeField('row', index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Column Fields */}
        <div>
          <label className="block text-xs font-medium mb-2">Columns (Pivot By)</label>
          <select 
            className="w-full text-xs border rounded px-2 py-1 mb-2"
            onChange={(e) => e.target.value && addColumnField(e.target.value)}
            value=""
          >
            <option value="">Add column field...</option>
            {availableColumns.map(col => (
              <option key={col.id} value={col.id}>{col.label}</option>
            ))}
          </select>
          <div className="space-y-1">
            {pivotState.columnFields.map((field, index) => (
              <div key={index} className="flex items-center justify-between bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-xs">
                <span>{availableColumns.find(c => c.id === field)?.label || field}</span>
                <button 
                  onClick={() => removeField('column', index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Value Fields */}
        <div>
          <label className="block text-xs font-medium mb-2">Values (Aggregate)</label>
          <div className="space-y-2 mb-2">
            {valueColumns.map(col => (
              <div key={col.id}>
                <div className="text-xs font-medium">{col.label}</div>
                <div className="flex gap-1">
                  {col.aggregations.map(agg => (
                    <button
                      key={agg}
                      onClick={() => addValueField(col.id, agg as any)}
                      className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      {agg}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-1">
            {pivotState.valueFields.map((valueField, index) => (
              <div key={index} className="flex items-center justify-between bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded text-xs">
                <span>{valueField.aggregation}({valueColumns.find(c => c.id === valueField.field)?.label || valueField.field})</span>
                <button 
                  onClick={() => removeField('value', index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={applyPivot}
          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          disabled={pivotState.rowFields.length === 0 || pivotState.valueFields.length === 0}
        >
          Apply Pivot
        </button>
        <button
          onClick={() => setPivotState({ rowFields: [], columnFields: [], valueFields: [] })}
          className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
        >
          Clear All
        </button>
      </div>

      {(pivotState.rowFields.length > 0 || pivotState.columnFields.length > 0 || pivotState.valueFields.length > 0) && (
        <PivotTableView<T> data={tableData} pivotState={pivotState} />
      )}
    </div>
  );
}
