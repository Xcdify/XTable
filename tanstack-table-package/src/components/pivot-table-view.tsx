import React, { useMemo } from 'react';

interface PivotState {
  rowFields: string[];
  columnFields: string[];
  valueFields: { field: string; aggregation: 'sum' | 'avg' | 'count' }[];
}

interface PivotTableViewProps<T = any> {
  data: T[];
  pivotState: PivotState;
}

interface PivotData {
  [key: string]: any;
}

export function PivotTableView<T = any>({ data, pivotState }: PivotTableViewProps<T>) {
  const pivotData = useMemo(() => {
    if (pivotState.rowFields.length === 0 || pivotState.valueFields.length === 0) {
      return { rows: [], columns: [], uniqueColumnValues: [] };
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

    // Get unique values for column fields
    const uniqueColumnValues = pivotState.columnFields.length > 0 
      ? [...new Set(data.map(item => 
          pivotState.columnFields.map(field => (item as any)[field] || 'N/A').join('|')
        ))]
      : ['Total'];

    // Create pivot structure
    const pivotRows = Object.entries(grouped).map(([key, items]) => {
      const rowData: PivotData = {};
      
      // Add row field values
      const keyParts = key.split('|');
      pivotState.rowFields.forEach((field, index) => {
        rowData[field] = keyParts[index];
      });

      // Calculate values for each column combination
      uniqueColumnValues.forEach(columnKey => {
        const columnItems = pivotState.columnFields.length > 0 
          ? items.filter(item => {
              const itemColumnKey = pivotState.columnFields.map(field => 
                (item as any)[field] || 'N/A'
              ).join('|');
              return itemColumnKey === columnKey;
            })
          : items;

        pivotState.valueFields.forEach(({ field, aggregation }) => {
          const values = columnItems.map(item => Number((item as any)[field]) || 0).filter(v => !isNaN(v));
          const columnLabel = pivotState.columnFields.length > 0 ? columnKey : 'Total';
          const cellKey = `${columnLabel}_${field}_${aggregation}`;
          
          if (aggregation === 'sum') {
            rowData[cellKey] = values.reduce((sum, val) => sum + val, 0);
          } else if (aggregation === 'avg') {
            rowData[cellKey] = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
          } else if (aggregation === 'count') {
            rowData[cellKey] = values.length;
          }
        });
      });

      return rowData;
    });

    return {
      rows: pivotRows,
      columns: uniqueColumnValues,
      uniqueColumnValues
    };
  }, [data, pivotState]);

  if (pivotState.rowFields.length === 0 || pivotState.valueFields.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>Configure row fields and value fields to see pivot table</p>
      </div>
    );
  }

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      department: 'Department',
      region: 'Region',
      status: 'Status',
      performance: 'Performance',
      firstName: 'First Name',
      lastName: 'Last Name',
      salary: 'Salary',
      age: 'Age',
      visits: 'Visits',
      progress: 'Progress'
    };
    return labels[field] || field;
  };

  const formatValue = (value: any, field: string, aggregation: string) => {
    if (typeof value !== 'number') return value;
    
    if (field === 'salary') {
      return `$${value.toLocaleString()}`;
    }
    
    if (aggregation === 'avg') {
      return value.toFixed(1);
    }
    
    return value.toLocaleString();
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Pivot Table Results
      </h3>
      
      <div className="overflow-x-auto border rounded-lg bg-white dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {/* Row field headers */}
              {pivotState.rowFields.map(field => (
                <th
                  key={field}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {getFieldLabel(field)}
                </th>
              ))}
              
              {/* Column headers for each unique column value and value field combination */}
              {pivotData.uniqueColumnValues.map(columnValue => (
                pivotState.valueFields.map(({ field, aggregation }) => (
                  <th
                    key={`${columnValue}_${field}_${aggregation}`}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {pivotState.columnFields.length > 0 ? (
                      <div>
                        <div className="font-semibold">{columnValue}</div>
                        <div className="text-xs opacity-75">
                          {aggregation}({getFieldLabel(field)})
                        </div>
                      </div>
                    ) : (
                      `${aggregation}(${getFieldLabel(field)})`
                    )}
                  </th>
                ))
              ))}
            </tr>
          </thead>
          
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {pivotData.rows.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {/* Row field values */}
                {pivotState.rowFields.map(field => (
                  <td
                    key={field}
                    className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                  >
                    <span className={`px-2 py-1 rounded text-xs ${
                      field === 'department' ? (
                        row[field] === 'Sales' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        row[field] === 'Marketing' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                        row[field] === 'Engineering' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        row[field] === 'HR' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                        row[field] === 'Finance' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      ) : field === 'region' ? (
                        row[field] === 'North' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        row[field] === 'South' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        row[field] === 'East' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        row[field] === 'West' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      ) : field === 'performance' ? (
                        row[field] === 'Excellent' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        row[field] === 'Good' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        row[field] === 'Average' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      ) : field === 'status' ? (
                        row[field] === 'Married' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        row[field] === 'Single' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      ) : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {row[field]}
                    </span>
                  </td>
                ))}
                
                {/* Value cells */}
                {pivotData.uniqueColumnValues.map(columnValue => (
                  pivotState.valueFields.map(({ field, aggregation }) => {
                    const cellKey = `${columnValue}_${field}_${aggregation}`;
                    const value = row[cellKey];
                    
                    return (
                      <td
                        key={cellKey}
                        className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                      >
                        <div className="font-medium">
                          {formatValue(value, field, aggregation)}
                        </div>
                      </td>
                    );
                  })
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>
          <strong>Pivot Summary:</strong> {pivotData.rows.length} rows grouped by{' '}
          {pivotState.rowFields.map(getFieldLabel).join(', ')}
          {pivotState.columnFields.length > 0 && (
            <span>, pivoted by {pivotState.columnFields.map(getFieldLabel).join(', ')}</span>
          )}
        </p>
      </div>
    </div>
  );
}
