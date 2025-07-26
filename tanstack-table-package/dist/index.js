'use strict';

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');
var reactDom = require('react-dom');

function _interopNamespaceDefault(e) {
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var React__namespace = /*#__PURE__*/_interopNamespaceDefault(React);

/**
   * table-core
   *
   * Copyright (c) TanStack
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   */
// type Person = {
//   firstName: string
//   lastName: string
//   age: number
//   visits: number
//   status: string
//   progress: number
//   createdAt: Date
//   nested: {
//     foo: [
//       {
//         bar: 'bar'
//       }
//     ]
//     bar: { subBar: boolean }[]
//     baz: {
//       foo: 'foo'
//       bar: {
//         baz: 'baz'
//       }
//     }
//   }
// }


// Is this type a tuple?

// If this type is a tuple, what indices are allowed?

///

function functionalUpdate(updater, input) {
  return typeof updater === 'function' ? updater(input) : updater;
}
function makeStateUpdater(key, instance) {
  return updater => {
    instance.setState(old => {
      return {
        ...old,
        [key]: functionalUpdate(updater, old[key])
      };
    });
  };
}
function isFunction(d) {
  return d instanceof Function;
}
function isNumberArray(d) {
  return Array.isArray(d) && d.every(val => typeof val === 'number');
}
function flattenBy(arr, getChildren) {
  const flat = [];
  const recurse = subArr => {
    subArr.forEach(item => {
      flat.push(item);
      const children = getChildren(item);
      if (children != null && children.length) {
        recurse(children);
      }
    });
  };
  recurse(arr);
  return flat;
}
function memo$1(getDeps, fn, opts) {
  let deps = [];
  let result;
  return depArgs => {
    let depTime;
    if (opts.key && opts.debug) depTime = Date.now();
    const newDeps = getDeps(depArgs);
    const depsChanged = newDeps.length !== deps.length || newDeps.some((dep, index) => deps[index] !== dep);
    if (!depsChanged) {
      return result;
    }
    deps = newDeps;
    let resultTime;
    if (opts.key && opts.debug) resultTime = Date.now();
    result = fn(...newDeps);
    opts == null || opts.onChange == null || opts.onChange(result);
    if (opts.key && opts.debug) {
      if (opts != null && opts.debug()) {
        const depEndTime = Math.round((Date.now() - depTime) * 100) / 100;
        const resultEndTime = Math.round((Date.now() - resultTime) * 100) / 100;
        const resultFpsPercentage = resultEndTime / 16;
        const pad = (str, num) => {
          str = String(str);
          while (str.length < num) {
            str = ' ' + str;
          }
          return str;
        };
        console.info(`%c⏱ ${pad(resultEndTime, 5)} /${pad(depEndTime, 5)} ms`, `
            font-size: .6rem;
            font-weight: bold;
            color: hsl(${Math.max(0, Math.min(120 - 120 * resultFpsPercentage, 120))}deg 100% 31%);`, opts == null ? void 0 : opts.key);
      }
    }
    return result;
  };
}
function getMemoOptions(tableOptions, debugLevel, key, onChange) {
  return {
    debug: () => {
      var _tableOptions$debugAl;
      return (_tableOptions$debugAl = tableOptions == null ? void 0 : tableOptions.debugAll) != null ? _tableOptions$debugAl : tableOptions[debugLevel];
    },
    key: process.env.NODE_ENV === 'development' && key,
    onChange
  };
}

function createCell(table, row, column, columnId) {
  const getRenderValue = () => {
    var _cell$getValue;
    return (_cell$getValue = cell.getValue()) != null ? _cell$getValue : table.options.renderFallbackValue;
  };
  const cell = {
    id: `${row.id}_${column.id}`,
    row,
    column,
    getValue: () => row.getValue(columnId),
    renderValue: getRenderValue,
    getContext: memo$1(() => [table, column, row, cell], (table, column, row, cell) => ({
      table,
      column,
      row,
      cell: cell,
      getValue: cell.getValue,
      renderValue: cell.renderValue
    }), getMemoOptions(table.options, 'debugCells', 'cell.getContext'))
  };
  table._features.forEach(feature => {
    feature.createCell == null || feature.createCell(cell, column, row, table);
  }, {});
  return cell;
}

function createColumn(table, columnDef, depth, parent) {
  var _ref, _resolvedColumnDef$id;
  const defaultColumn = table._getDefaultColumnDef();
  const resolvedColumnDef = {
    ...defaultColumn,
    ...columnDef
  };
  const accessorKey = resolvedColumnDef.accessorKey;
  let id = (_ref = (_resolvedColumnDef$id = resolvedColumnDef.id) != null ? _resolvedColumnDef$id : accessorKey ? typeof String.prototype.replaceAll === 'function' ? accessorKey.replaceAll('.', '_') : accessorKey.replace(/\./g, '_') : undefined) != null ? _ref : typeof resolvedColumnDef.header === 'string' ? resolvedColumnDef.header : undefined;
  let accessorFn;
  if (resolvedColumnDef.accessorFn) {
    accessorFn = resolvedColumnDef.accessorFn;
  } else if (accessorKey) {
    // Support deep accessor keys
    if (accessorKey.includes('.')) {
      accessorFn = originalRow => {
        let result = originalRow;
        for (const key of accessorKey.split('.')) {
          var _result;
          result = (_result = result) == null ? void 0 : _result[key];
          if (process.env.NODE_ENV !== 'production' && result === undefined) {
            console.warn(`"${key}" in deeply nested key "${accessorKey}" returned undefined.`);
          }
        }
        return result;
      };
    } else {
      accessorFn = originalRow => originalRow[resolvedColumnDef.accessorKey];
    }
  }
  if (!id) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(resolvedColumnDef.accessorFn ? `Columns require an id when using an accessorFn` : `Columns require an id when using a non-string header`);
    }
    throw new Error();
  }
  let column = {
    id: `${String(id)}`,
    accessorFn,
    parent: parent,
    depth,
    columnDef: resolvedColumnDef,
    columns: [],
    getFlatColumns: memo$1(() => [true], () => {
      var _column$columns;
      return [column, ...((_column$columns = column.columns) == null ? void 0 : _column$columns.flatMap(d => d.getFlatColumns()))];
    }, getMemoOptions(table.options, 'debugColumns', 'column.getFlatColumns')),
    getLeafColumns: memo$1(() => [table._getOrderColumnsFn()], orderColumns => {
      var _column$columns2;
      if ((_column$columns2 = column.columns) != null && _column$columns2.length) {
        let leafColumns = column.columns.flatMap(column => column.getLeafColumns());
        return orderColumns(leafColumns);
      }
      return [column];
    }, getMemoOptions(table.options, 'debugColumns', 'column.getLeafColumns'))
  };
  for (const feature of table._features) {
    feature.createColumn == null || feature.createColumn(column, table);
  }

  // Yes, we have to convert table to unknown, because we know more than the compiler here.
  return column;
}

const debug = 'debugHeaders';
//

function createHeader(table, column, options) {
  var _options$id;
  const id = (_options$id = options.id) != null ? _options$id : column.id;
  let header = {
    id,
    column,
    index: options.index,
    isPlaceholder: !!options.isPlaceholder,
    placeholderId: options.placeholderId,
    depth: options.depth,
    subHeaders: [],
    colSpan: 0,
    rowSpan: 0,
    headerGroup: null,
    getLeafHeaders: () => {
      const leafHeaders = [];
      const recurseHeader = h => {
        if (h.subHeaders && h.subHeaders.length) {
          h.subHeaders.map(recurseHeader);
        }
        leafHeaders.push(h);
      };
      recurseHeader(header);
      return leafHeaders;
    },
    getContext: () => ({
      table,
      header: header,
      column
    })
  };
  table._features.forEach(feature => {
    feature.createHeader == null || feature.createHeader(header, table);
  });
  return header;
}
const Headers = {
  createTable: table => {
    // Header Groups

    table.getHeaderGroups = memo$1(() => [table.getAllColumns(), table.getVisibleLeafColumns(), table.getState().columnPinning.left, table.getState().columnPinning.right], (allColumns, leafColumns, left, right) => {
      var _left$map$filter, _right$map$filter;
      const leftColumns = (_left$map$filter = left == null ? void 0 : left.map(columnId => leafColumns.find(d => d.id === columnId)).filter(Boolean)) != null ? _left$map$filter : [];
      const rightColumns = (_right$map$filter = right == null ? void 0 : right.map(columnId => leafColumns.find(d => d.id === columnId)).filter(Boolean)) != null ? _right$map$filter : [];
      const centerColumns = leafColumns.filter(column => !(left != null && left.includes(column.id)) && !(right != null && right.includes(column.id)));
      const headerGroups = buildHeaderGroups(allColumns, [...leftColumns, ...centerColumns, ...rightColumns], table);
      return headerGroups;
    }, getMemoOptions(table.options, debug, 'getHeaderGroups'));
    table.getCenterHeaderGroups = memo$1(() => [table.getAllColumns(), table.getVisibleLeafColumns(), table.getState().columnPinning.left, table.getState().columnPinning.right], (allColumns, leafColumns, left, right) => {
      leafColumns = leafColumns.filter(column => !(left != null && left.includes(column.id)) && !(right != null && right.includes(column.id)));
      return buildHeaderGroups(allColumns, leafColumns, table, 'center');
    }, getMemoOptions(table.options, debug, 'getCenterHeaderGroups'));
    table.getLeftHeaderGroups = memo$1(() => [table.getAllColumns(), table.getVisibleLeafColumns(), table.getState().columnPinning.left], (allColumns, leafColumns, left) => {
      var _left$map$filter2;
      const orderedLeafColumns = (_left$map$filter2 = left == null ? void 0 : left.map(columnId => leafColumns.find(d => d.id === columnId)).filter(Boolean)) != null ? _left$map$filter2 : [];
      return buildHeaderGroups(allColumns, orderedLeafColumns, table, 'left');
    }, getMemoOptions(table.options, debug, 'getLeftHeaderGroups'));
    table.getRightHeaderGroups = memo$1(() => [table.getAllColumns(), table.getVisibleLeafColumns(), table.getState().columnPinning.right], (allColumns, leafColumns, right) => {
      var _right$map$filter2;
      const orderedLeafColumns = (_right$map$filter2 = right == null ? void 0 : right.map(columnId => leafColumns.find(d => d.id === columnId)).filter(Boolean)) != null ? _right$map$filter2 : [];
      return buildHeaderGroups(allColumns, orderedLeafColumns, table, 'right');
    }, getMemoOptions(table.options, debug, 'getRightHeaderGroups'));

    // Footer Groups

    table.getFooterGroups = memo$1(() => [table.getHeaderGroups()], headerGroups => {
      return [...headerGroups].reverse();
    }, getMemoOptions(table.options, debug, 'getFooterGroups'));
    table.getLeftFooterGroups = memo$1(() => [table.getLeftHeaderGroups()], headerGroups => {
      return [...headerGroups].reverse();
    }, getMemoOptions(table.options, debug, 'getLeftFooterGroups'));
    table.getCenterFooterGroups = memo$1(() => [table.getCenterHeaderGroups()], headerGroups => {
      return [...headerGroups].reverse();
    }, getMemoOptions(table.options, debug, 'getCenterFooterGroups'));
    table.getRightFooterGroups = memo$1(() => [table.getRightHeaderGroups()], headerGroups => {
      return [...headerGroups].reverse();
    }, getMemoOptions(table.options, debug, 'getRightFooterGroups'));

    // Flat Headers

    table.getFlatHeaders = memo$1(() => [table.getHeaderGroups()], headerGroups => {
      return headerGroups.map(headerGroup => {
        return headerGroup.headers;
      }).flat();
    }, getMemoOptions(table.options, debug, 'getFlatHeaders'));
    table.getLeftFlatHeaders = memo$1(() => [table.getLeftHeaderGroups()], left => {
      return left.map(headerGroup => {
        return headerGroup.headers;
      }).flat();
    }, getMemoOptions(table.options, debug, 'getLeftFlatHeaders'));
    table.getCenterFlatHeaders = memo$1(() => [table.getCenterHeaderGroups()], left => {
      return left.map(headerGroup => {
        return headerGroup.headers;
      }).flat();
    }, getMemoOptions(table.options, debug, 'getCenterFlatHeaders'));
    table.getRightFlatHeaders = memo$1(() => [table.getRightHeaderGroups()], left => {
      return left.map(headerGroup => {
        return headerGroup.headers;
      }).flat();
    }, getMemoOptions(table.options, debug, 'getRightFlatHeaders'));

    // Leaf Headers

    table.getCenterLeafHeaders = memo$1(() => [table.getCenterFlatHeaders()], flatHeaders => {
      return flatHeaders.filter(header => {
        var _header$subHeaders;
        return !((_header$subHeaders = header.subHeaders) != null && _header$subHeaders.length);
      });
    }, getMemoOptions(table.options, debug, 'getCenterLeafHeaders'));
    table.getLeftLeafHeaders = memo$1(() => [table.getLeftFlatHeaders()], flatHeaders => {
      return flatHeaders.filter(header => {
        var _header$subHeaders2;
        return !((_header$subHeaders2 = header.subHeaders) != null && _header$subHeaders2.length);
      });
    }, getMemoOptions(table.options, debug, 'getLeftLeafHeaders'));
    table.getRightLeafHeaders = memo$1(() => [table.getRightFlatHeaders()], flatHeaders => {
      return flatHeaders.filter(header => {
        var _header$subHeaders3;
        return !((_header$subHeaders3 = header.subHeaders) != null && _header$subHeaders3.length);
      });
    }, getMemoOptions(table.options, debug, 'getRightLeafHeaders'));
    table.getLeafHeaders = memo$1(() => [table.getLeftHeaderGroups(), table.getCenterHeaderGroups(), table.getRightHeaderGroups()], (left, center, right) => {
      var _left$0$headers, _left$, _center$0$headers, _center$, _right$0$headers, _right$;
      return [...((_left$0$headers = (_left$ = left[0]) == null ? void 0 : _left$.headers) != null ? _left$0$headers : []), ...((_center$0$headers = (_center$ = center[0]) == null ? void 0 : _center$.headers) != null ? _center$0$headers : []), ...((_right$0$headers = (_right$ = right[0]) == null ? void 0 : _right$.headers) != null ? _right$0$headers : [])].map(header => {
        return header.getLeafHeaders();
      }).flat();
    }, getMemoOptions(table.options, debug, 'getLeafHeaders'));
  }
};
function buildHeaderGroups(allColumns, columnsToGroup, table, headerFamily) {
  var _headerGroups$0$heade, _headerGroups$;
  // Find the max depth of the columns:
  // build the leaf column row
  // build each buffer row going up
  //    placeholder for non-existent level
  //    real column for existing level

  let maxDepth = 0;
  const findMaxDepth = function (columns, depth) {
    if (depth === void 0) {
      depth = 1;
    }
    maxDepth = Math.max(maxDepth, depth);
    columns.filter(column => column.getIsVisible()).forEach(column => {
      var _column$columns;
      if ((_column$columns = column.columns) != null && _column$columns.length) {
        findMaxDepth(column.columns, depth + 1);
      }
    }, 0);
  };
  findMaxDepth(allColumns);
  let headerGroups = [];
  const createHeaderGroup = (headersToGroup, depth) => {
    // The header group we are creating
    const headerGroup = {
      depth,
      id: [headerFamily, `${depth}`].filter(Boolean).join('_'),
      headers: []
    };

    // The parent columns we're going to scan next
    const pendingParentHeaders = [];

    // Scan each column for parents
    headersToGroup.forEach(headerToGroup => {
      // What is the latest (last) parent column?

      const latestPendingParentHeader = [...pendingParentHeaders].reverse()[0];
      const isLeafHeader = headerToGroup.column.depth === headerGroup.depth;
      let column;
      let isPlaceholder = false;
      if (isLeafHeader && headerToGroup.column.parent) {
        // The parent header is new
        column = headerToGroup.column.parent;
      } else {
        // The parent header is repeated
        column = headerToGroup.column;
        isPlaceholder = true;
      }
      if (latestPendingParentHeader && (latestPendingParentHeader == null ? void 0 : latestPendingParentHeader.column) === column) {
        // This column is repeated. Add it as a sub header to the next batch
        latestPendingParentHeader.subHeaders.push(headerToGroup);
      } else {
        // This is a new header. Let's create it
        const header = createHeader(table, column, {
          id: [headerFamily, depth, column.id, headerToGroup == null ? void 0 : headerToGroup.id].filter(Boolean).join('_'),
          isPlaceholder,
          placeholderId: isPlaceholder ? `${pendingParentHeaders.filter(d => d.column === column).length}` : undefined,
          depth,
          index: pendingParentHeaders.length
        });

        // Add the headerToGroup as a subHeader of the new header
        header.subHeaders.push(headerToGroup);
        // Add the new header to the pendingParentHeaders to get grouped
        // in the next batch
        pendingParentHeaders.push(header);
      }
      headerGroup.headers.push(headerToGroup);
      headerToGroup.headerGroup = headerGroup;
    });
    headerGroups.push(headerGroup);
    if (depth > 0) {
      createHeaderGroup(pendingParentHeaders, depth - 1);
    }
  };
  const bottomHeaders = columnsToGroup.map((column, index) => createHeader(table, column, {
    depth: maxDepth,
    index
  }));
  createHeaderGroup(bottomHeaders, maxDepth - 1);
  headerGroups.reverse();

  // headerGroups = headerGroups.filter(headerGroup => {
  //   return !headerGroup.headers.every(header => header.isPlaceholder)
  // })

  const recurseHeadersForSpans = headers => {
    const filteredHeaders = headers.filter(header => header.column.getIsVisible());
    return filteredHeaders.map(header => {
      let colSpan = 0;
      let rowSpan = 0;
      let childRowSpans = [0];
      if (header.subHeaders && header.subHeaders.length) {
        childRowSpans = [];
        recurseHeadersForSpans(header.subHeaders).forEach(_ref => {
          let {
            colSpan: childColSpan,
            rowSpan: childRowSpan
          } = _ref;
          colSpan += childColSpan;
          childRowSpans.push(childRowSpan);
        });
      } else {
        colSpan = 1;
      }
      const minChildRowSpan = Math.min(...childRowSpans);
      rowSpan = rowSpan + minChildRowSpan;
      header.colSpan = colSpan;
      header.rowSpan = rowSpan;
      return {
        colSpan,
        rowSpan
      };
    });
  };
  recurseHeadersForSpans((_headerGroups$0$heade = (_headerGroups$ = headerGroups[0]) == null ? void 0 : _headerGroups$.headers) != null ? _headerGroups$0$heade : []);
  return headerGroups;
}

const createRow = (table, id, original, rowIndex, depth, subRows, parentId) => {
  let row = {
    id,
    index: rowIndex,
    original,
    depth,
    parentId,
    _valuesCache: {},
    _uniqueValuesCache: {},
    getValue: columnId => {
      if (row._valuesCache.hasOwnProperty(columnId)) {
        return row._valuesCache[columnId];
      }
      const column = table.getColumn(columnId);
      if (!(column != null && column.accessorFn)) {
        return undefined;
      }
      row._valuesCache[columnId] = column.accessorFn(row.original, rowIndex);
      return row._valuesCache[columnId];
    },
    getUniqueValues: columnId => {
      if (row._uniqueValuesCache.hasOwnProperty(columnId)) {
        return row._uniqueValuesCache[columnId];
      }
      const column = table.getColumn(columnId);
      if (!(column != null && column.accessorFn)) {
        return undefined;
      }
      if (!column.columnDef.getUniqueValues) {
        row._uniqueValuesCache[columnId] = [row.getValue(columnId)];
        return row._uniqueValuesCache[columnId];
      }
      row._uniqueValuesCache[columnId] = column.columnDef.getUniqueValues(row.original, rowIndex);
      return row._uniqueValuesCache[columnId];
    },
    renderValue: columnId => {
      var _row$getValue;
      return (_row$getValue = row.getValue(columnId)) != null ? _row$getValue : table.options.renderFallbackValue;
    },
    subRows: subRows != null ? subRows : [],
    getLeafRows: () => flattenBy(row.subRows, d => d.subRows),
    getParentRow: () => row.parentId ? table.getRow(row.parentId, true) : undefined,
    getParentRows: () => {
      let parentRows = [];
      let currentRow = row;
      while (true) {
        const parentRow = currentRow.getParentRow();
        if (!parentRow) break;
        parentRows.push(parentRow);
        currentRow = parentRow;
      }
      return parentRows.reverse();
    },
    getAllCells: memo$1(() => [table.getAllLeafColumns()], leafColumns => {
      return leafColumns.map(column => {
        return createCell(table, row, column, column.id);
      });
    }, getMemoOptions(table.options, 'debugRows', 'getAllCells')),
    _getAllCellsByColumnId: memo$1(() => [row.getAllCells()], allCells => {
      return allCells.reduce((acc, cell) => {
        acc[cell.column.id] = cell;
        return acc;
      }, {});
    }, getMemoOptions(table.options, 'debugRows', 'getAllCellsByColumnId'))
  };
  for (let i = 0; i < table._features.length; i++) {
    const feature = table._features[i];
    feature == null || feature.createRow == null || feature.createRow(row, table);
  }
  return row;
};

//

const ColumnFaceting = {
  createColumn: (column, table) => {
    column._getFacetedRowModel = table.options.getFacetedRowModel && table.options.getFacetedRowModel(table, column.id);
    column.getFacetedRowModel = () => {
      if (!column._getFacetedRowModel) {
        return table.getPreFilteredRowModel();
      }
      return column._getFacetedRowModel();
    };
    column._getFacetedUniqueValues = table.options.getFacetedUniqueValues && table.options.getFacetedUniqueValues(table, column.id);
    column.getFacetedUniqueValues = () => {
      if (!column._getFacetedUniqueValues) {
        return new Map();
      }
      return column._getFacetedUniqueValues();
    };
    column._getFacetedMinMaxValues = table.options.getFacetedMinMaxValues && table.options.getFacetedMinMaxValues(table, column.id);
    column.getFacetedMinMaxValues = () => {
      if (!column._getFacetedMinMaxValues) {
        return undefined;
      }
      return column._getFacetedMinMaxValues();
    };
  }
};

const includesString = (row, columnId, filterValue) => {
  var _filterValue$toString, _row$getValue;
  const search = filterValue == null || (_filterValue$toString = filterValue.toString()) == null ? void 0 : _filterValue$toString.toLowerCase();
  return Boolean((_row$getValue = row.getValue(columnId)) == null || (_row$getValue = _row$getValue.toString()) == null || (_row$getValue = _row$getValue.toLowerCase()) == null ? void 0 : _row$getValue.includes(search));
};
includesString.autoRemove = val => testFalsey(val);
const includesStringSensitive = (row, columnId, filterValue) => {
  var _row$getValue2;
  return Boolean((_row$getValue2 = row.getValue(columnId)) == null || (_row$getValue2 = _row$getValue2.toString()) == null ? void 0 : _row$getValue2.includes(filterValue));
};
includesStringSensitive.autoRemove = val => testFalsey(val);
const equalsString = (row, columnId, filterValue) => {
  var _row$getValue3;
  return ((_row$getValue3 = row.getValue(columnId)) == null || (_row$getValue3 = _row$getValue3.toString()) == null ? void 0 : _row$getValue3.toLowerCase()) === (filterValue == null ? void 0 : filterValue.toLowerCase());
};
equalsString.autoRemove = val => testFalsey(val);
const arrIncludes = (row, columnId, filterValue) => {
  var _row$getValue4;
  return (_row$getValue4 = row.getValue(columnId)) == null ? void 0 : _row$getValue4.includes(filterValue);
};
arrIncludes.autoRemove = val => testFalsey(val);
const arrIncludesAll = (row, columnId, filterValue) => {
  return !filterValue.some(val => {
    var _row$getValue5;
    return !((_row$getValue5 = row.getValue(columnId)) != null && _row$getValue5.includes(val));
  });
};
arrIncludesAll.autoRemove = val => testFalsey(val) || !(val != null && val.length);
const arrIncludesSome = (row, columnId, filterValue) => {
  return filterValue.some(val => {
    var _row$getValue6;
    return (_row$getValue6 = row.getValue(columnId)) == null ? void 0 : _row$getValue6.includes(val);
  });
};
arrIncludesSome.autoRemove = val => testFalsey(val) || !(val != null && val.length);
const equals = (row, columnId, filterValue) => {
  return row.getValue(columnId) === filterValue;
};
equals.autoRemove = val => testFalsey(val);
const weakEquals = (row, columnId, filterValue) => {
  return row.getValue(columnId) == filterValue;
};
weakEquals.autoRemove = val => testFalsey(val);
const inNumberRange = (row, columnId, filterValue) => {
  let [min, max] = filterValue;
  const rowValue = row.getValue(columnId);
  return rowValue >= min && rowValue <= max;
};
inNumberRange.resolveFilterValue = val => {
  let [unsafeMin, unsafeMax] = val;
  let parsedMin = typeof unsafeMin !== 'number' ? parseFloat(unsafeMin) : unsafeMin;
  let parsedMax = typeof unsafeMax !== 'number' ? parseFloat(unsafeMax) : unsafeMax;
  let min = unsafeMin === null || Number.isNaN(parsedMin) ? -Infinity : parsedMin;
  let max = unsafeMax === null || Number.isNaN(parsedMax) ? Infinity : parsedMax;
  if (min > max) {
    const temp = min;
    min = max;
    max = temp;
  }
  return [min, max];
};
inNumberRange.autoRemove = val => testFalsey(val) || testFalsey(val[0]) && testFalsey(val[1]);

// Export

const filterFns = {
  includesString,
  includesStringSensitive,
  equalsString,
  arrIncludes,
  arrIncludesAll,
  arrIncludesSome,
  equals,
  weakEquals,
  inNumberRange
};
// Utils

function testFalsey(val) {
  return val === undefined || val === null || val === '';
}

//

const ColumnFiltering = {
  getDefaultColumnDef: () => {
    return {
      filterFn: 'auto'
    };
  },
  getInitialState: state => {
    return {
      columnFilters: [],
      ...state
    };
  },
  getDefaultOptions: table => {
    return {
      onColumnFiltersChange: makeStateUpdater('columnFilters', table),
      filterFromLeafRows: false,
      maxLeafRowFilterDepth: 100
    };
  },
  createColumn: (column, table) => {
    column.getAutoFilterFn = () => {
      const firstRow = table.getCoreRowModel().flatRows[0];
      const value = firstRow == null ? void 0 : firstRow.getValue(column.id);
      if (typeof value === 'string') {
        return filterFns.includesString;
      }
      if (typeof value === 'number') {
        return filterFns.inNumberRange;
      }
      if (typeof value === 'boolean') {
        return filterFns.equals;
      }
      if (value !== null && typeof value === 'object') {
        return filterFns.equals;
      }
      if (Array.isArray(value)) {
        return filterFns.arrIncludes;
      }
      return filterFns.weakEquals;
    };
    column.getFilterFn = () => {
      var _table$options$filter, _table$options$filter2;
      return isFunction(column.columnDef.filterFn) ? column.columnDef.filterFn : column.columnDef.filterFn === 'auto' ? column.getAutoFilterFn() : // @ts-ignore
      (_table$options$filter = (_table$options$filter2 = table.options.filterFns) == null ? void 0 : _table$options$filter2[column.columnDef.filterFn]) != null ? _table$options$filter : filterFns[column.columnDef.filterFn];
    };
    column.getCanFilter = () => {
      var _column$columnDef$ena, _table$options$enable, _table$options$enable2;
      return ((_column$columnDef$ena = column.columnDef.enableColumnFilter) != null ? _column$columnDef$ena : true) && ((_table$options$enable = table.options.enableColumnFilters) != null ? _table$options$enable : true) && ((_table$options$enable2 = table.options.enableFilters) != null ? _table$options$enable2 : true) && !!column.accessorFn;
    };
    column.getIsFiltered = () => column.getFilterIndex() > -1;
    column.getFilterValue = () => {
      var _table$getState$colum;
      return (_table$getState$colum = table.getState().columnFilters) == null || (_table$getState$colum = _table$getState$colum.find(d => d.id === column.id)) == null ? void 0 : _table$getState$colum.value;
    };
    column.getFilterIndex = () => {
      var _table$getState$colum2, _table$getState$colum3;
      return (_table$getState$colum2 = (_table$getState$colum3 = table.getState().columnFilters) == null ? void 0 : _table$getState$colum3.findIndex(d => d.id === column.id)) != null ? _table$getState$colum2 : -1;
    };
    column.setFilterValue = value => {
      table.setColumnFilters(old => {
        const filterFn = column.getFilterFn();
        const previousFilter = old == null ? void 0 : old.find(d => d.id === column.id);
        const newFilter = functionalUpdate(value, previousFilter ? previousFilter.value : undefined);

        //
        if (shouldAutoRemoveFilter(filterFn, newFilter, column)) {
          var _old$filter;
          return (_old$filter = old == null ? void 0 : old.filter(d => d.id !== column.id)) != null ? _old$filter : [];
        }
        const newFilterObj = {
          id: column.id,
          value: newFilter
        };
        if (previousFilter) {
          var _old$map;
          return (_old$map = old == null ? void 0 : old.map(d => {
            if (d.id === column.id) {
              return newFilterObj;
            }
            return d;
          })) != null ? _old$map : [];
        }
        if (old != null && old.length) {
          return [...old, newFilterObj];
        }
        return [newFilterObj];
      });
    };
  },
  createRow: (row, _table) => {
    row.columnFilters = {};
    row.columnFiltersMeta = {};
  },
  createTable: table => {
    table.setColumnFilters = updater => {
      const leafColumns = table.getAllLeafColumns();
      const updateFn = old => {
        var _functionalUpdate;
        return (_functionalUpdate = functionalUpdate(updater, old)) == null ? void 0 : _functionalUpdate.filter(filter => {
          const column = leafColumns.find(d => d.id === filter.id);
          if (column) {
            const filterFn = column.getFilterFn();
            if (shouldAutoRemoveFilter(filterFn, filter.value, column)) {
              return false;
            }
          }
          return true;
        });
      };
      table.options.onColumnFiltersChange == null || table.options.onColumnFiltersChange(updateFn);
    };
    table.resetColumnFilters = defaultState => {
      var _table$initialState$c, _table$initialState;
      table.setColumnFilters(defaultState ? [] : (_table$initialState$c = (_table$initialState = table.initialState) == null ? void 0 : _table$initialState.columnFilters) != null ? _table$initialState$c : []);
    };
    table.getPreFilteredRowModel = () => table.getCoreRowModel();
    table.getFilteredRowModel = () => {
      if (!table._getFilteredRowModel && table.options.getFilteredRowModel) {
        table._getFilteredRowModel = table.options.getFilteredRowModel(table);
      }
      if (table.options.manualFiltering || !table._getFilteredRowModel) {
        return table.getPreFilteredRowModel();
      }
      return table._getFilteredRowModel();
    };
  }
};
function shouldAutoRemoveFilter(filterFn, value, column) {
  return (filterFn && filterFn.autoRemove ? filterFn.autoRemove(value, column) : false) || typeof value === 'undefined' || typeof value === 'string' && !value;
}

const sum = (columnId, _leafRows, childRows) => {
  // It's faster to just add the aggregations together instead of
  // process leaf nodes individually
  return childRows.reduce((sum, next) => {
    const nextValue = next.getValue(columnId);
    return sum + (typeof nextValue === 'number' ? nextValue : 0);
  }, 0);
};
const min = (columnId, _leafRows, childRows) => {
  let min;
  childRows.forEach(row => {
    const value = row.getValue(columnId);
    if (value != null && (min > value || min === undefined && value >= value)) {
      min = value;
    }
  });
  return min;
};
const max = (columnId, _leafRows, childRows) => {
  let max;
  childRows.forEach(row => {
    const value = row.getValue(columnId);
    if (value != null && (max < value || max === undefined && value >= value)) {
      max = value;
    }
  });
  return max;
};
const extent = (columnId, _leafRows, childRows) => {
  let min;
  let max;
  childRows.forEach(row => {
    const value = row.getValue(columnId);
    if (value != null) {
      if (min === undefined) {
        if (value >= value) min = max = value;
      } else {
        if (min > value) min = value;
        if (max < value) max = value;
      }
    }
  });
  return [min, max];
};
const mean = (columnId, leafRows) => {
  let count = 0;
  let sum = 0;
  leafRows.forEach(row => {
    let value = row.getValue(columnId);
    if (value != null && (value = +value) >= value) {
      ++count, sum += value;
    }
  });
  if (count) return sum / count;
  return;
};
const median = (columnId, leafRows) => {
  if (!leafRows.length) {
    return;
  }
  const values = leafRows.map(row => row.getValue(columnId));
  if (!isNumberArray(values)) {
    return;
  }
  if (values.length === 1) {
    return values[0];
  }
  const mid = Math.floor(values.length / 2);
  const nums = values.sort((a, b) => a - b);
  return values.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};
const unique = (columnId, leafRows) => {
  return Array.from(new Set(leafRows.map(d => d.getValue(columnId))).values());
};
const uniqueCount = (columnId, leafRows) => {
  return new Set(leafRows.map(d => d.getValue(columnId))).size;
};
const count = (_columnId, leafRows) => {
  return leafRows.length;
};
const aggregationFns = {
  sum,
  min,
  max,
  extent,
  mean,
  median,
  unique,
  uniqueCount,
  count
};

//

const ColumnGrouping = {
  getDefaultColumnDef: () => {
    return {
      aggregatedCell: props => {
        var _toString, _props$getValue;
        return (_toString = (_props$getValue = props.getValue()) == null || _props$getValue.toString == null ? void 0 : _props$getValue.toString()) != null ? _toString : null;
      },
      aggregationFn: 'auto'
    };
  },
  getInitialState: state => {
    return {
      grouping: [],
      ...state
    };
  },
  getDefaultOptions: table => {
    return {
      onGroupingChange: makeStateUpdater('grouping', table),
      groupedColumnMode: 'reorder'
    };
  },
  createColumn: (column, table) => {
    column.toggleGrouping = () => {
      table.setGrouping(old => {
        // Find any existing grouping for this column
        if (old != null && old.includes(column.id)) {
          return old.filter(d => d !== column.id);
        }
        return [...(old != null ? old : []), column.id];
      });
    };
    column.getCanGroup = () => {
      var _column$columnDef$ena, _table$options$enable;
      return ((_column$columnDef$ena = column.columnDef.enableGrouping) != null ? _column$columnDef$ena : true) && ((_table$options$enable = table.options.enableGrouping) != null ? _table$options$enable : true) && (!!column.accessorFn || !!column.columnDef.getGroupingValue);
    };
    column.getIsGrouped = () => {
      var _table$getState$group;
      return (_table$getState$group = table.getState().grouping) == null ? void 0 : _table$getState$group.includes(column.id);
    };
    column.getGroupedIndex = () => {
      var _table$getState$group2;
      return (_table$getState$group2 = table.getState().grouping) == null ? void 0 : _table$getState$group2.indexOf(column.id);
    };
    column.getToggleGroupingHandler = () => {
      const canGroup = column.getCanGroup();
      return () => {
        if (!canGroup) return;
        column.toggleGrouping();
      };
    };
    column.getAutoAggregationFn = () => {
      const firstRow = table.getCoreRowModel().flatRows[0];
      const value = firstRow == null ? void 0 : firstRow.getValue(column.id);
      if (typeof value === 'number') {
        return aggregationFns.sum;
      }
      if (Object.prototype.toString.call(value) === '[object Date]') {
        return aggregationFns.extent;
      }
    };
    column.getAggregationFn = () => {
      var _table$options$aggreg, _table$options$aggreg2;
      if (!column) {
        throw new Error();
      }
      return isFunction(column.columnDef.aggregationFn) ? column.columnDef.aggregationFn : column.columnDef.aggregationFn === 'auto' ? column.getAutoAggregationFn() : (_table$options$aggreg = (_table$options$aggreg2 = table.options.aggregationFns) == null ? void 0 : _table$options$aggreg2[column.columnDef.aggregationFn]) != null ? _table$options$aggreg : aggregationFns[column.columnDef.aggregationFn];
    };
  },
  createTable: table => {
    table.setGrouping = updater => table.options.onGroupingChange == null ? void 0 : table.options.onGroupingChange(updater);
    table.resetGrouping = defaultState => {
      var _table$initialState$g, _table$initialState;
      table.setGrouping(defaultState ? [] : (_table$initialState$g = (_table$initialState = table.initialState) == null ? void 0 : _table$initialState.grouping) != null ? _table$initialState$g : []);
    };
    table.getPreGroupedRowModel = () => table.getFilteredRowModel();
    table.getGroupedRowModel = () => {
      if (!table._getGroupedRowModel && table.options.getGroupedRowModel) {
        table._getGroupedRowModel = table.options.getGroupedRowModel(table);
      }
      if (table.options.manualGrouping || !table._getGroupedRowModel) {
        return table.getPreGroupedRowModel();
      }
      return table._getGroupedRowModel();
    };
  },
  createRow: (row, table) => {
    row.getIsGrouped = () => !!row.groupingColumnId;
    row.getGroupingValue = columnId => {
      if (row._groupingValuesCache.hasOwnProperty(columnId)) {
        return row._groupingValuesCache[columnId];
      }
      const column = table.getColumn(columnId);
      if (!(column != null && column.columnDef.getGroupingValue)) {
        return row.getValue(columnId);
      }
      row._groupingValuesCache[columnId] = column.columnDef.getGroupingValue(row.original);
      return row._groupingValuesCache[columnId];
    };
    row._groupingValuesCache = {};
  },
  createCell: (cell, column, row, table) => {
    cell.getIsGrouped = () => column.getIsGrouped() && column.id === row.groupingColumnId;
    cell.getIsPlaceholder = () => !cell.getIsGrouped() && column.getIsGrouped();
    cell.getIsAggregated = () => {
      var _row$subRows;
      return !cell.getIsGrouped() && !cell.getIsPlaceholder() && !!((_row$subRows = row.subRows) != null && _row$subRows.length);
    };
  }
};
function orderColumns(leafColumns, grouping, groupedColumnMode) {
  if (!(grouping != null && grouping.length) || !groupedColumnMode) {
    return leafColumns;
  }
  const nonGroupingColumns = leafColumns.filter(col => !grouping.includes(col.id));
  if (groupedColumnMode === 'remove') {
    return nonGroupingColumns;
  }
  const groupingColumns = grouping.map(g => leafColumns.find(col => col.id === g)).filter(Boolean);
  return [...groupingColumns, ...nonGroupingColumns];
}

//

const ColumnOrdering = {
  getInitialState: state => {
    return {
      columnOrder: [],
      ...state
    };
  },
  getDefaultOptions: table => {
    return {
      onColumnOrderChange: makeStateUpdater('columnOrder', table)
    };
  },
  createColumn: (column, table) => {
    column.getIndex = memo$1(position => [_getVisibleLeafColumns(table, position)], columns => columns.findIndex(d => d.id === column.id), getMemoOptions(table.options, 'debugColumns', 'getIndex'));
    column.getIsFirstColumn = position => {
      var _columns$;
      const columns = _getVisibleLeafColumns(table, position);
      return ((_columns$ = columns[0]) == null ? void 0 : _columns$.id) === column.id;
    };
    column.getIsLastColumn = position => {
      var _columns;
      const columns = _getVisibleLeafColumns(table, position);
      return ((_columns = columns[columns.length - 1]) == null ? void 0 : _columns.id) === column.id;
    };
  },
  createTable: table => {
    table.setColumnOrder = updater => table.options.onColumnOrderChange == null ? void 0 : table.options.onColumnOrderChange(updater);
    table.resetColumnOrder = defaultState => {
      var _table$initialState$c;
      table.setColumnOrder(defaultState ? [] : (_table$initialState$c = table.initialState.columnOrder) != null ? _table$initialState$c : []);
    };
    table._getOrderColumnsFn = memo$1(() => [table.getState().columnOrder, table.getState().grouping, table.options.groupedColumnMode], (columnOrder, grouping, groupedColumnMode) => columns => {
      // Sort grouped columns to the start of the column list
      // before the headers are built
      let orderedColumns = [];

      // If there is no order, return the normal columns
      if (!(columnOrder != null && columnOrder.length)) {
        orderedColumns = columns;
      } else {
        const columnOrderCopy = [...columnOrder];

        // If there is an order, make a copy of the columns
        const columnsCopy = [...columns];

        // And make a new ordered array of the columns

        // Loop over the columns and place them in order into the new array
        while (columnsCopy.length && columnOrderCopy.length) {
          const targetColumnId = columnOrderCopy.shift();
          const foundIndex = columnsCopy.findIndex(d => d.id === targetColumnId);
          if (foundIndex > -1) {
            orderedColumns.push(columnsCopy.splice(foundIndex, 1)[0]);
          }
        }

        // If there are any columns left, add them to the end
        orderedColumns = [...orderedColumns, ...columnsCopy];
      }
      return orderColumns(orderedColumns, grouping, groupedColumnMode);
    }, getMemoOptions(table.options, 'debugTable', '_getOrderColumnsFn'));
  }
};

//

const getDefaultColumnPinningState = () => ({
  left: [],
  right: []
});
const ColumnPinning = {
  getInitialState: state => {
    return {
      columnPinning: getDefaultColumnPinningState(),
      ...state
    };
  },
  getDefaultOptions: table => {
    return {
      onColumnPinningChange: makeStateUpdater('columnPinning', table)
    };
  },
  createColumn: (column, table) => {
    column.pin = position => {
      const columnIds = column.getLeafColumns().map(d => d.id).filter(Boolean);
      table.setColumnPinning(old => {
        var _old$left3, _old$right3;
        if (position === 'right') {
          var _old$left, _old$right;
          return {
            left: ((_old$left = old == null ? void 0 : old.left) != null ? _old$left : []).filter(d => !(columnIds != null && columnIds.includes(d))),
            right: [...((_old$right = old == null ? void 0 : old.right) != null ? _old$right : []).filter(d => !(columnIds != null && columnIds.includes(d))), ...columnIds]
          };
        }
        if (position === 'left') {
          var _old$left2, _old$right2;
          return {
            left: [...((_old$left2 = old == null ? void 0 : old.left) != null ? _old$left2 : []).filter(d => !(columnIds != null && columnIds.includes(d))), ...columnIds],
            right: ((_old$right2 = old == null ? void 0 : old.right) != null ? _old$right2 : []).filter(d => !(columnIds != null && columnIds.includes(d)))
          };
        }
        return {
          left: ((_old$left3 = old == null ? void 0 : old.left) != null ? _old$left3 : []).filter(d => !(columnIds != null && columnIds.includes(d))),
          right: ((_old$right3 = old == null ? void 0 : old.right) != null ? _old$right3 : []).filter(d => !(columnIds != null && columnIds.includes(d)))
        };
      });
    };
    column.getCanPin = () => {
      const leafColumns = column.getLeafColumns();
      return leafColumns.some(d => {
        var _d$columnDef$enablePi, _ref, _table$options$enable;
        return ((_d$columnDef$enablePi = d.columnDef.enablePinning) != null ? _d$columnDef$enablePi : true) && ((_ref = (_table$options$enable = table.options.enableColumnPinning) != null ? _table$options$enable : table.options.enablePinning) != null ? _ref : true);
      });
    };
    column.getIsPinned = () => {
      const leafColumnIds = column.getLeafColumns().map(d => d.id);
      const {
        left,
        right
      } = table.getState().columnPinning;
      const isLeft = leafColumnIds.some(d => left == null ? void 0 : left.includes(d));
      const isRight = leafColumnIds.some(d => right == null ? void 0 : right.includes(d));
      return isLeft ? 'left' : isRight ? 'right' : false;
    };
    column.getPinnedIndex = () => {
      var _table$getState$colum, _table$getState$colum2;
      const position = column.getIsPinned();
      return position ? (_table$getState$colum = (_table$getState$colum2 = table.getState().columnPinning) == null || (_table$getState$colum2 = _table$getState$colum2[position]) == null ? void 0 : _table$getState$colum2.indexOf(column.id)) != null ? _table$getState$colum : -1 : 0;
    };
  },
  createRow: (row, table) => {
    row.getCenterVisibleCells = memo$1(() => [row._getAllVisibleCells(), table.getState().columnPinning.left, table.getState().columnPinning.right], (allCells, left, right) => {
      const leftAndRight = [...(left != null ? left : []), ...(right != null ? right : [])];
      return allCells.filter(d => !leftAndRight.includes(d.column.id));
    }, getMemoOptions(table.options, 'debugRows', 'getCenterVisibleCells'));
    row.getLeftVisibleCells = memo$1(() => [row._getAllVisibleCells(), table.getState().columnPinning.left], (allCells, left) => {
      const cells = (left != null ? left : []).map(columnId => allCells.find(cell => cell.column.id === columnId)).filter(Boolean).map(d => ({
        ...d,
        position: 'left'
      }));
      return cells;
    }, getMemoOptions(table.options, 'debugRows', 'getLeftVisibleCells'));
    row.getRightVisibleCells = memo$1(() => [row._getAllVisibleCells(), table.getState().columnPinning.right], (allCells, right) => {
      const cells = (right != null ? right : []).map(columnId => allCells.find(cell => cell.column.id === columnId)).filter(Boolean).map(d => ({
        ...d,
        position: 'right'
      }));
      return cells;
    }, getMemoOptions(table.options, 'debugRows', 'getRightVisibleCells'));
  },
  createTable: table => {
    table.setColumnPinning = updater => table.options.onColumnPinningChange == null ? void 0 : table.options.onColumnPinningChange(updater);
    table.resetColumnPinning = defaultState => {
      var _table$initialState$c, _table$initialState;
      return table.setColumnPinning(defaultState ? getDefaultColumnPinningState() : (_table$initialState$c = (_table$initialState = table.initialState) == null ? void 0 : _table$initialState.columnPinning) != null ? _table$initialState$c : getDefaultColumnPinningState());
    };
    table.getIsSomeColumnsPinned = position => {
      var _pinningState$positio;
      const pinningState = table.getState().columnPinning;
      if (!position) {
        var _pinningState$left, _pinningState$right;
        return Boolean(((_pinningState$left = pinningState.left) == null ? void 0 : _pinningState$left.length) || ((_pinningState$right = pinningState.right) == null ? void 0 : _pinningState$right.length));
      }
      return Boolean((_pinningState$positio = pinningState[position]) == null ? void 0 : _pinningState$positio.length);
    };
    table.getLeftLeafColumns = memo$1(() => [table.getAllLeafColumns(), table.getState().columnPinning.left], (allColumns, left) => {
      return (left != null ? left : []).map(columnId => allColumns.find(column => column.id === columnId)).filter(Boolean);
    }, getMemoOptions(table.options, 'debugColumns', 'getLeftLeafColumns'));
    table.getRightLeafColumns = memo$1(() => [table.getAllLeafColumns(), table.getState().columnPinning.right], (allColumns, right) => {
      return (right != null ? right : []).map(columnId => allColumns.find(column => column.id === columnId)).filter(Boolean);
    }, getMemoOptions(table.options, 'debugColumns', 'getRightLeafColumns'));
    table.getCenterLeafColumns = memo$1(() => [table.getAllLeafColumns(), table.getState().columnPinning.left, table.getState().columnPinning.right], (allColumns, left, right) => {
      const leftAndRight = [...(left != null ? left : []), ...(right != null ? right : [])];
      return allColumns.filter(d => !leftAndRight.includes(d.id));
    }, getMemoOptions(table.options, 'debugColumns', 'getCenterLeafColumns'));
  }
};

function safelyAccessDocument(_document) {
  return _document || (typeof document !== 'undefined' ? document : null);
}

//

//

const defaultColumnSizing = {
  size: 150,
  minSize: 20,
  maxSize: Number.MAX_SAFE_INTEGER
};
const getDefaultColumnSizingInfoState = () => ({
  startOffset: null,
  startSize: null,
  deltaOffset: null,
  deltaPercentage: null,
  isResizingColumn: false,
  columnSizingStart: []
});
const ColumnSizing = {
  getDefaultColumnDef: () => {
    return defaultColumnSizing;
  },
  getInitialState: state => {
    return {
      columnSizing: {},
      columnSizingInfo: getDefaultColumnSizingInfoState(),
      ...state
    };
  },
  getDefaultOptions: table => {
    return {
      columnResizeMode: 'onEnd',
      columnResizeDirection: 'ltr',
      onColumnSizingChange: makeStateUpdater('columnSizing', table),
      onColumnSizingInfoChange: makeStateUpdater('columnSizingInfo', table)
    };
  },
  createColumn: (column, table) => {
    column.getSize = () => {
      var _column$columnDef$min, _ref, _column$columnDef$max;
      const columnSize = table.getState().columnSizing[column.id];
      return Math.min(Math.max((_column$columnDef$min = column.columnDef.minSize) != null ? _column$columnDef$min : defaultColumnSizing.minSize, (_ref = columnSize != null ? columnSize : column.columnDef.size) != null ? _ref : defaultColumnSizing.size), (_column$columnDef$max = column.columnDef.maxSize) != null ? _column$columnDef$max : defaultColumnSizing.maxSize);
    };
    column.getStart = memo$1(position => [position, _getVisibleLeafColumns(table, position), table.getState().columnSizing], (position, columns) => columns.slice(0, column.getIndex(position)).reduce((sum, column) => sum + column.getSize(), 0), getMemoOptions(table.options, 'debugColumns', 'getStart'));
    column.getAfter = memo$1(position => [position, _getVisibleLeafColumns(table, position), table.getState().columnSizing], (position, columns) => columns.slice(column.getIndex(position) + 1).reduce((sum, column) => sum + column.getSize(), 0), getMemoOptions(table.options, 'debugColumns', 'getAfter'));
    column.resetSize = () => {
      table.setColumnSizing(_ref2 => {
        let {
          [column.id]: _,
          ...rest
        } = _ref2;
        return rest;
      });
    };
    column.getCanResize = () => {
      var _column$columnDef$ena, _table$options$enable;
      return ((_column$columnDef$ena = column.columnDef.enableResizing) != null ? _column$columnDef$ena : true) && ((_table$options$enable = table.options.enableColumnResizing) != null ? _table$options$enable : true);
    };
    column.getIsResizing = () => {
      return table.getState().columnSizingInfo.isResizingColumn === column.id;
    };
  },
  createHeader: (header, table) => {
    header.getSize = () => {
      let sum = 0;
      const recurse = header => {
        if (header.subHeaders.length) {
          header.subHeaders.forEach(recurse);
        } else {
          var _header$column$getSiz;
          sum += (_header$column$getSiz = header.column.getSize()) != null ? _header$column$getSiz : 0;
        }
      };
      recurse(header);
      return sum;
    };
    header.getStart = () => {
      if (header.index > 0) {
        const prevSiblingHeader = header.headerGroup.headers[header.index - 1];
        return prevSiblingHeader.getStart() + prevSiblingHeader.getSize();
      }
      return 0;
    };
    header.getResizeHandler = _contextDocument => {
      const column = table.getColumn(header.column.id);
      const canResize = column == null ? void 0 : column.getCanResize();
      return e => {
        if (!column || !canResize) {
          return;
        }
        e.persist == null || e.persist();
        if (isTouchStartEvent(e)) {
          // lets not respond to multiple touches (e.g. 2 or 3 fingers)
          if (e.touches && e.touches.length > 1) {
            return;
          }
        }
        const startSize = header.getSize();
        const columnSizingStart = header ? header.getLeafHeaders().map(d => [d.column.id, d.column.getSize()]) : [[column.id, column.getSize()]];
        const clientX = isTouchStartEvent(e) ? Math.round(e.touches[0].clientX) : e.clientX;
        const newColumnSizing = {};
        const updateOffset = (eventType, clientXPos) => {
          if (typeof clientXPos !== 'number') {
            return;
          }
          table.setColumnSizingInfo(old => {
            var _old$startOffset, _old$startSize;
            const deltaDirection = table.options.columnResizeDirection === 'rtl' ? -1 : 1;
            const deltaOffset = (clientXPos - ((_old$startOffset = old == null ? void 0 : old.startOffset) != null ? _old$startOffset : 0)) * deltaDirection;
            const deltaPercentage = Math.max(deltaOffset / ((_old$startSize = old == null ? void 0 : old.startSize) != null ? _old$startSize : 0), -0.999999);
            old.columnSizingStart.forEach(_ref3 => {
              let [columnId, headerSize] = _ref3;
              newColumnSizing[columnId] = Math.round(Math.max(headerSize + headerSize * deltaPercentage, 0) * 100) / 100;
            });
            return {
              ...old,
              deltaOffset,
              deltaPercentage
            };
          });
          if (table.options.columnResizeMode === 'onChange' || eventType === 'end') {
            table.setColumnSizing(old => ({
              ...old,
              ...newColumnSizing
            }));
          }
        };
        const onMove = clientXPos => updateOffset('move', clientXPos);
        const onEnd = clientXPos => {
          updateOffset('end', clientXPos);
          table.setColumnSizingInfo(old => ({
            ...old,
            isResizingColumn: false,
            startOffset: null,
            startSize: null,
            deltaOffset: null,
            deltaPercentage: null,
            columnSizingStart: []
          }));
        };
        const contextDocument = safelyAccessDocument(_contextDocument);
        const mouseEvents = {
          moveHandler: e => onMove(e.clientX),
          upHandler: e => {
            contextDocument == null || contextDocument.removeEventListener('mousemove', mouseEvents.moveHandler);
            contextDocument == null || contextDocument.removeEventListener('mouseup', mouseEvents.upHandler);
            onEnd(e.clientX);
          }
        };
        const touchEvents = {
          moveHandler: e => {
            if (e.cancelable) {
              e.preventDefault();
              e.stopPropagation();
            }
            onMove(e.touches[0].clientX);
            return false;
          },
          upHandler: e => {
            var _e$touches$;
            contextDocument == null || contextDocument.removeEventListener('touchmove', touchEvents.moveHandler);
            contextDocument == null || contextDocument.removeEventListener('touchend', touchEvents.upHandler);
            if (e.cancelable) {
              e.preventDefault();
              e.stopPropagation();
            }
            onEnd((_e$touches$ = e.touches[0]) == null ? void 0 : _e$touches$.clientX);
          }
        };
        const passiveIfSupported = passiveEventSupported() ? {
          passive: false
        } : false;
        if (isTouchStartEvent(e)) {
          contextDocument == null || contextDocument.addEventListener('touchmove', touchEvents.moveHandler, passiveIfSupported);
          contextDocument == null || contextDocument.addEventListener('touchend', touchEvents.upHandler, passiveIfSupported);
        } else {
          contextDocument == null || contextDocument.addEventListener('mousemove', mouseEvents.moveHandler, passiveIfSupported);
          contextDocument == null || contextDocument.addEventListener('mouseup', mouseEvents.upHandler, passiveIfSupported);
        }
        table.setColumnSizingInfo(old => ({
          ...old,
          startOffset: clientX,
          startSize,
          deltaOffset: 0,
          deltaPercentage: 0,
          columnSizingStart,
          isResizingColumn: column.id
        }));
      };
    };
  },
  createTable: table => {
    table.setColumnSizing = updater => table.options.onColumnSizingChange == null ? void 0 : table.options.onColumnSizingChange(updater);
    table.setColumnSizingInfo = updater => table.options.onColumnSizingInfoChange == null ? void 0 : table.options.onColumnSizingInfoChange(updater);
    table.resetColumnSizing = defaultState => {
      var _table$initialState$c;
      table.setColumnSizing(defaultState ? {} : (_table$initialState$c = table.initialState.columnSizing) != null ? _table$initialState$c : {});
    };
    table.resetHeaderSizeInfo = defaultState => {
      var _table$initialState$c2;
      table.setColumnSizingInfo(defaultState ? getDefaultColumnSizingInfoState() : (_table$initialState$c2 = table.initialState.columnSizingInfo) != null ? _table$initialState$c2 : getDefaultColumnSizingInfoState());
    };
    table.getTotalSize = () => {
      var _table$getHeaderGroup, _table$getHeaderGroup2;
      return (_table$getHeaderGroup = (_table$getHeaderGroup2 = table.getHeaderGroups()[0]) == null ? void 0 : _table$getHeaderGroup2.headers.reduce((sum, header) => {
        return sum + header.getSize();
      }, 0)) != null ? _table$getHeaderGroup : 0;
    };
    table.getLeftTotalSize = () => {
      var _table$getLeftHeaderG, _table$getLeftHeaderG2;
      return (_table$getLeftHeaderG = (_table$getLeftHeaderG2 = table.getLeftHeaderGroups()[0]) == null ? void 0 : _table$getLeftHeaderG2.headers.reduce((sum, header) => {
        return sum + header.getSize();
      }, 0)) != null ? _table$getLeftHeaderG : 0;
    };
    table.getCenterTotalSize = () => {
      var _table$getCenterHeade, _table$getCenterHeade2;
      return (_table$getCenterHeade = (_table$getCenterHeade2 = table.getCenterHeaderGroups()[0]) == null ? void 0 : _table$getCenterHeade2.headers.reduce((sum, header) => {
        return sum + header.getSize();
      }, 0)) != null ? _table$getCenterHeade : 0;
    };
    table.getRightTotalSize = () => {
      var _table$getRightHeader, _table$getRightHeader2;
      return (_table$getRightHeader = (_table$getRightHeader2 = table.getRightHeaderGroups()[0]) == null ? void 0 : _table$getRightHeader2.headers.reduce((sum, header) => {
        return sum + header.getSize();
      }, 0)) != null ? _table$getRightHeader : 0;
    };
  }
};
let passiveSupported = null;
function passiveEventSupported() {
  if (typeof passiveSupported === 'boolean') return passiveSupported;
  let supported = false;
  try {
    const options = {
      get passive() {
        supported = true;
        return false;
      }
    };
    const noop = () => {};
    window.addEventListener('test', noop, options);
    window.removeEventListener('test', noop);
  } catch (err) {
    supported = false;
  }
  passiveSupported = supported;
  return passiveSupported;
}
function isTouchStartEvent(e) {
  return e.type === 'touchstart';
}

//

const ColumnVisibility = {
  getInitialState: state => {
    return {
      columnVisibility: {},
      ...state
    };
  },
  getDefaultOptions: table => {
    return {
      onColumnVisibilityChange: makeStateUpdater('columnVisibility', table)
    };
  },
  createColumn: (column, table) => {
    column.toggleVisibility = value => {
      if (column.getCanHide()) {
        table.setColumnVisibility(old => ({
          ...old,
          [column.id]: value != null ? value : !column.getIsVisible()
        }));
      }
    };
    column.getIsVisible = () => {
      var _ref, _table$getState$colum;
      const childColumns = column.columns;
      return (_ref = childColumns.length ? childColumns.some(c => c.getIsVisible()) : (_table$getState$colum = table.getState().columnVisibility) == null ? void 0 : _table$getState$colum[column.id]) != null ? _ref : true;
    };
    column.getCanHide = () => {
      var _column$columnDef$ena, _table$options$enable;
      return ((_column$columnDef$ena = column.columnDef.enableHiding) != null ? _column$columnDef$ena : true) && ((_table$options$enable = table.options.enableHiding) != null ? _table$options$enable : true);
    };
    column.getToggleVisibilityHandler = () => {
      return e => {
        column.toggleVisibility == null || column.toggleVisibility(e.target.checked);
      };
    };
  },
  createRow: (row, table) => {
    row._getAllVisibleCells = memo$1(() => [row.getAllCells(), table.getState().columnVisibility], cells => {
      return cells.filter(cell => cell.column.getIsVisible());
    }, getMemoOptions(table.options, 'debugRows', '_getAllVisibleCells'));
    row.getVisibleCells = memo$1(() => [row.getLeftVisibleCells(), row.getCenterVisibleCells(), row.getRightVisibleCells()], (left, center, right) => [...left, ...center, ...right], getMemoOptions(table.options, 'debugRows', 'getVisibleCells'));
  },
  createTable: table => {
    const makeVisibleColumnsMethod = (key, getColumns) => {
      return memo$1(() => [getColumns(), getColumns().filter(d => d.getIsVisible()).map(d => d.id).join('_')], columns => {
        return columns.filter(d => d.getIsVisible == null ? void 0 : d.getIsVisible());
      }, getMemoOptions(table.options, 'debugColumns', key));
    };
    table.getVisibleFlatColumns = makeVisibleColumnsMethod('getVisibleFlatColumns', () => table.getAllFlatColumns());
    table.getVisibleLeafColumns = makeVisibleColumnsMethod('getVisibleLeafColumns', () => table.getAllLeafColumns());
    table.getLeftVisibleLeafColumns = makeVisibleColumnsMethod('getLeftVisibleLeafColumns', () => table.getLeftLeafColumns());
    table.getRightVisibleLeafColumns = makeVisibleColumnsMethod('getRightVisibleLeafColumns', () => table.getRightLeafColumns());
    table.getCenterVisibleLeafColumns = makeVisibleColumnsMethod('getCenterVisibleLeafColumns', () => table.getCenterLeafColumns());
    table.setColumnVisibility = updater => table.options.onColumnVisibilityChange == null ? void 0 : table.options.onColumnVisibilityChange(updater);
    table.resetColumnVisibility = defaultState => {
      var _table$initialState$c;
      table.setColumnVisibility(defaultState ? {} : (_table$initialState$c = table.initialState.columnVisibility) != null ? _table$initialState$c : {});
    };
    table.toggleAllColumnsVisible = value => {
      var _value;
      value = (_value = value) != null ? _value : !table.getIsAllColumnsVisible();
      table.setColumnVisibility(table.getAllLeafColumns().reduce((obj, column) => ({
        ...obj,
        [column.id]: !value ? !(column.getCanHide != null && column.getCanHide()) : value
      }), {}));
    };
    table.getIsAllColumnsVisible = () => !table.getAllLeafColumns().some(column => !(column.getIsVisible != null && column.getIsVisible()));
    table.getIsSomeColumnsVisible = () => table.getAllLeafColumns().some(column => column.getIsVisible == null ? void 0 : column.getIsVisible());
    table.getToggleAllColumnsVisibilityHandler = () => {
      return e => {
        var _target;
        table.toggleAllColumnsVisible((_target = e.target) == null ? void 0 : _target.checked);
      };
    };
  }
};
function _getVisibleLeafColumns(table, position) {
  return !position ? table.getVisibleLeafColumns() : position === 'center' ? table.getCenterVisibleLeafColumns() : position === 'left' ? table.getLeftVisibleLeafColumns() : table.getRightVisibleLeafColumns();
}

//

const GlobalFaceting = {
  createTable: table => {
    table._getGlobalFacetedRowModel = table.options.getFacetedRowModel && table.options.getFacetedRowModel(table, '__global__');
    table.getGlobalFacetedRowModel = () => {
      if (table.options.manualFiltering || !table._getGlobalFacetedRowModel) {
        return table.getPreFilteredRowModel();
      }
      return table._getGlobalFacetedRowModel();
    };
    table._getGlobalFacetedUniqueValues = table.options.getFacetedUniqueValues && table.options.getFacetedUniqueValues(table, '__global__');
    table.getGlobalFacetedUniqueValues = () => {
      if (!table._getGlobalFacetedUniqueValues) {
        return new Map();
      }
      return table._getGlobalFacetedUniqueValues();
    };
    table._getGlobalFacetedMinMaxValues = table.options.getFacetedMinMaxValues && table.options.getFacetedMinMaxValues(table, '__global__');
    table.getGlobalFacetedMinMaxValues = () => {
      if (!table._getGlobalFacetedMinMaxValues) {
        return;
      }
      return table._getGlobalFacetedMinMaxValues();
    };
  }
};

//

const GlobalFiltering = {
  getInitialState: state => {
    return {
      globalFilter: undefined,
      ...state
    };
  },
  getDefaultOptions: table => {
    return {
      onGlobalFilterChange: makeStateUpdater('globalFilter', table),
      globalFilterFn: 'auto',
      getColumnCanGlobalFilter: column => {
        var _table$getCoreRowMode;
        const value = (_table$getCoreRowMode = table.getCoreRowModel().flatRows[0]) == null || (_table$getCoreRowMode = _table$getCoreRowMode._getAllCellsByColumnId()[column.id]) == null ? void 0 : _table$getCoreRowMode.getValue();
        return typeof value === 'string' || typeof value === 'number';
      }
    };
  },
  createColumn: (column, table) => {
    column.getCanGlobalFilter = () => {
      var _column$columnDef$ena, _table$options$enable, _table$options$enable2, _table$options$getCol;
      return ((_column$columnDef$ena = column.columnDef.enableGlobalFilter) != null ? _column$columnDef$ena : true) && ((_table$options$enable = table.options.enableGlobalFilter) != null ? _table$options$enable : true) && ((_table$options$enable2 = table.options.enableFilters) != null ? _table$options$enable2 : true) && ((_table$options$getCol = table.options.getColumnCanGlobalFilter == null ? void 0 : table.options.getColumnCanGlobalFilter(column)) != null ? _table$options$getCol : true) && !!column.accessorFn;
    };
  },
  createTable: table => {
    table.getGlobalAutoFilterFn = () => {
      return filterFns.includesString;
    };
    table.getGlobalFilterFn = () => {
      var _table$options$filter, _table$options$filter2;
      const {
        globalFilterFn: globalFilterFn
      } = table.options;
      return isFunction(globalFilterFn) ? globalFilterFn : globalFilterFn === 'auto' ? table.getGlobalAutoFilterFn() : (_table$options$filter = (_table$options$filter2 = table.options.filterFns) == null ? void 0 : _table$options$filter2[globalFilterFn]) != null ? _table$options$filter : filterFns[globalFilterFn];
    };
    table.setGlobalFilter = updater => {
      table.options.onGlobalFilterChange == null || table.options.onGlobalFilterChange(updater);
    };
    table.resetGlobalFilter = defaultState => {
      table.setGlobalFilter(defaultState ? undefined : table.initialState.globalFilter);
    };
  }
};

//

const RowExpanding = {
  getInitialState: state => {
    return {
      expanded: {},
      ...state
    };
  },
  getDefaultOptions: table => {
    return {
      onExpandedChange: makeStateUpdater('expanded', table),
      paginateExpandedRows: true
    };
  },
  createTable: table => {
    let registered = false;
    let queued = false;
    table._autoResetExpanded = () => {
      var _ref, _table$options$autoRe;
      if (!registered) {
        table._queue(() => {
          registered = true;
        });
        return;
      }
      if ((_ref = (_table$options$autoRe = table.options.autoResetAll) != null ? _table$options$autoRe : table.options.autoResetExpanded) != null ? _ref : !table.options.manualExpanding) {
        if (queued) return;
        queued = true;
        table._queue(() => {
          table.resetExpanded();
          queued = false;
        });
      }
    };
    table.setExpanded = updater => table.options.onExpandedChange == null ? void 0 : table.options.onExpandedChange(updater);
    table.toggleAllRowsExpanded = expanded => {
      if (expanded != null ? expanded : !table.getIsAllRowsExpanded()) {
        table.setExpanded(true);
      } else {
        table.setExpanded({});
      }
    };
    table.resetExpanded = defaultState => {
      var _table$initialState$e, _table$initialState;
      table.setExpanded(defaultState ? {} : (_table$initialState$e = (_table$initialState = table.initialState) == null ? void 0 : _table$initialState.expanded) != null ? _table$initialState$e : {});
    };
    table.getCanSomeRowsExpand = () => {
      return table.getPrePaginationRowModel().flatRows.some(row => row.getCanExpand());
    };
    table.getToggleAllRowsExpandedHandler = () => {
      return e => {
        e.persist == null || e.persist();
        table.toggleAllRowsExpanded();
      };
    };
    table.getIsSomeRowsExpanded = () => {
      const expanded = table.getState().expanded;
      return expanded === true || Object.values(expanded).some(Boolean);
    };
    table.getIsAllRowsExpanded = () => {
      const expanded = table.getState().expanded;

      // If expanded is true, save some cycles and return true
      if (typeof expanded === 'boolean') {
        return expanded === true;
      }
      if (!Object.keys(expanded).length) {
        return false;
      }

      // If any row is not expanded, return false
      if (table.getRowModel().flatRows.some(row => !row.getIsExpanded())) {
        return false;
      }

      // They must all be expanded :shrug:
      return true;
    };
    table.getExpandedDepth = () => {
      let maxDepth = 0;
      const rowIds = table.getState().expanded === true ? Object.keys(table.getRowModel().rowsById) : Object.keys(table.getState().expanded);
      rowIds.forEach(id => {
        const splitId = id.split('.');
        maxDepth = Math.max(maxDepth, splitId.length);
      });
      return maxDepth;
    };
    table.getPreExpandedRowModel = () => table.getSortedRowModel();
    table.getExpandedRowModel = () => {
      if (!table._getExpandedRowModel && table.options.getExpandedRowModel) {
        table._getExpandedRowModel = table.options.getExpandedRowModel(table);
      }
      if (table.options.manualExpanding || !table._getExpandedRowModel) {
        return table.getPreExpandedRowModel();
      }
      return table._getExpandedRowModel();
    };
  },
  createRow: (row, table) => {
    row.toggleExpanded = expanded => {
      table.setExpanded(old => {
        var _expanded;
        const exists = old === true ? true : !!(old != null && old[row.id]);
        let oldExpanded = {};
        if (old === true) {
          Object.keys(table.getRowModel().rowsById).forEach(rowId => {
            oldExpanded[rowId] = true;
          });
        } else {
          oldExpanded = old;
        }
        expanded = (_expanded = expanded) != null ? _expanded : !exists;
        if (!exists && expanded) {
          return {
            ...oldExpanded,
            [row.id]: true
          };
        }
        if (exists && !expanded) {
          const {
            [row.id]: _,
            ...rest
          } = oldExpanded;
          return rest;
        }
        return old;
      });
    };
    row.getIsExpanded = () => {
      var _table$options$getIsR;
      const expanded = table.getState().expanded;
      return !!((_table$options$getIsR = table.options.getIsRowExpanded == null ? void 0 : table.options.getIsRowExpanded(row)) != null ? _table$options$getIsR : expanded === true || (expanded == null ? void 0 : expanded[row.id]));
    };
    row.getCanExpand = () => {
      var _table$options$getRow, _table$options$enable, _row$subRows;
      return (_table$options$getRow = table.options.getRowCanExpand == null ? void 0 : table.options.getRowCanExpand(row)) != null ? _table$options$getRow : ((_table$options$enable = table.options.enableExpanding) != null ? _table$options$enable : true) && !!((_row$subRows = row.subRows) != null && _row$subRows.length);
    };
    row.getIsAllParentsExpanded = () => {
      let isFullyExpanded = true;
      let currentRow = row;
      while (isFullyExpanded && currentRow.parentId) {
        currentRow = table.getRow(currentRow.parentId, true);
        isFullyExpanded = currentRow.getIsExpanded();
      }
      return isFullyExpanded;
    };
    row.getToggleExpandedHandler = () => {
      const canExpand = row.getCanExpand();
      return () => {
        if (!canExpand) return;
        row.toggleExpanded();
      };
    };
  }
};

//

const defaultPageIndex = 0;
const defaultPageSize = 10;
const getDefaultPaginationState = () => ({
  pageIndex: defaultPageIndex,
  pageSize: defaultPageSize
});
const RowPagination = {
  getInitialState: state => {
    return {
      ...state,
      pagination: {
        ...getDefaultPaginationState(),
        ...(state == null ? void 0 : state.pagination)
      }
    };
  },
  getDefaultOptions: table => {
    return {
      onPaginationChange: makeStateUpdater('pagination', table)
    };
  },
  createTable: table => {
    let registered = false;
    let queued = false;
    table._autoResetPageIndex = () => {
      var _ref, _table$options$autoRe;
      if (!registered) {
        table._queue(() => {
          registered = true;
        });
        return;
      }
      if ((_ref = (_table$options$autoRe = table.options.autoResetAll) != null ? _table$options$autoRe : table.options.autoResetPageIndex) != null ? _ref : !table.options.manualPagination) {
        if (queued) return;
        queued = true;
        table._queue(() => {
          table.resetPageIndex();
          queued = false;
        });
      }
    };
    table.setPagination = updater => {
      const safeUpdater = old => {
        let newState = functionalUpdate(updater, old);
        return newState;
      };
      return table.options.onPaginationChange == null ? void 0 : table.options.onPaginationChange(safeUpdater);
    };
    table.resetPagination = defaultState => {
      var _table$initialState$p;
      table.setPagination(defaultState ? getDefaultPaginationState() : (_table$initialState$p = table.initialState.pagination) != null ? _table$initialState$p : getDefaultPaginationState());
    };
    table.setPageIndex = updater => {
      table.setPagination(old => {
        let pageIndex = functionalUpdate(updater, old.pageIndex);
        const maxPageIndex = typeof table.options.pageCount === 'undefined' || table.options.pageCount === -1 ? Number.MAX_SAFE_INTEGER : table.options.pageCount - 1;
        pageIndex = Math.max(0, Math.min(pageIndex, maxPageIndex));
        return {
          ...old,
          pageIndex
        };
      });
    };
    table.resetPageIndex = defaultState => {
      var _table$initialState$p2, _table$initialState;
      table.setPageIndex(defaultState ? defaultPageIndex : (_table$initialState$p2 = (_table$initialState = table.initialState) == null || (_table$initialState = _table$initialState.pagination) == null ? void 0 : _table$initialState.pageIndex) != null ? _table$initialState$p2 : defaultPageIndex);
    };
    table.resetPageSize = defaultState => {
      var _table$initialState$p3, _table$initialState2;
      table.setPageSize(defaultState ? defaultPageSize : (_table$initialState$p3 = (_table$initialState2 = table.initialState) == null || (_table$initialState2 = _table$initialState2.pagination) == null ? void 0 : _table$initialState2.pageSize) != null ? _table$initialState$p3 : defaultPageSize);
    };
    table.setPageSize = updater => {
      table.setPagination(old => {
        const pageSize = Math.max(1, functionalUpdate(updater, old.pageSize));
        const topRowIndex = old.pageSize * old.pageIndex;
        const pageIndex = Math.floor(topRowIndex / pageSize);
        return {
          ...old,
          pageIndex,
          pageSize
        };
      });
    };
    //deprecated
    table.setPageCount = updater => table.setPagination(old => {
      var _table$options$pageCo;
      let newPageCount = functionalUpdate(updater, (_table$options$pageCo = table.options.pageCount) != null ? _table$options$pageCo : -1);
      if (typeof newPageCount === 'number') {
        newPageCount = Math.max(-1, newPageCount);
      }
      return {
        ...old,
        pageCount: newPageCount
      };
    });
    table.getPageOptions = memo$1(() => [table.getPageCount()], pageCount => {
      let pageOptions = [];
      if (pageCount && pageCount > 0) {
        pageOptions = [...new Array(pageCount)].fill(null).map((_, i) => i);
      }
      return pageOptions;
    }, getMemoOptions(table.options, 'debugTable', 'getPageOptions'));
    table.getCanPreviousPage = () => table.getState().pagination.pageIndex > 0;
    table.getCanNextPage = () => {
      const {
        pageIndex
      } = table.getState().pagination;
      const pageCount = table.getPageCount();
      if (pageCount === -1) {
        return true;
      }
      if (pageCount === 0) {
        return false;
      }
      return pageIndex < pageCount - 1;
    };
    table.previousPage = () => {
      return table.setPageIndex(old => old - 1);
    };
    table.nextPage = () => {
      return table.setPageIndex(old => {
        return old + 1;
      });
    };
    table.firstPage = () => {
      return table.setPageIndex(0);
    };
    table.lastPage = () => {
      return table.setPageIndex(table.getPageCount() - 1);
    };
    table.getPrePaginationRowModel = () => table.getExpandedRowModel();
    table.getPaginationRowModel = () => {
      if (!table._getPaginationRowModel && table.options.getPaginationRowModel) {
        table._getPaginationRowModel = table.options.getPaginationRowModel(table);
      }
      if (table.options.manualPagination || !table._getPaginationRowModel) {
        return table.getPrePaginationRowModel();
      }
      return table._getPaginationRowModel();
    };
    table.getPageCount = () => {
      var _table$options$pageCo2;
      return (_table$options$pageCo2 = table.options.pageCount) != null ? _table$options$pageCo2 : Math.ceil(table.getRowCount() / table.getState().pagination.pageSize);
    };
    table.getRowCount = () => {
      var _table$options$rowCou;
      return (_table$options$rowCou = table.options.rowCount) != null ? _table$options$rowCou : table.getPrePaginationRowModel().rows.length;
    };
  }
};

//

const getDefaultRowPinningState = () => ({
  top: [],
  bottom: []
});
const RowPinning = {
  getInitialState: state => {
    return {
      rowPinning: getDefaultRowPinningState(),
      ...state
    };
  },
  getDefaultOptions: table => {
    return {
      onRowPinningChange: makeStateUpdater('rowPinning', table)
    };
  },
  createRow: (row, table) => {
    row.pin = (position, includeLeafRows, includeParentRows) => {
      const leafRowIds = includeLeafRows ? row.getLeafRows().map(_ref => {
        let {
          id
        } = _ref;
        return id;
      }) : [];
      const parentRowIds = includeParentRows ? row.getParentRows().map(_ref2 => {
        let {
          id
        } = _ref2;
        return id;
      }) : [];
      const rowIds = new Set([...parentRowIds, row.id, ...leafRowIds]);
      table.setRowPinning(old => {
        var _old$top3, _old$bottom3;
        if (position === 'bottom') {
          var _old$top, _old$bottom;
          return {
            top: ((_old$top = old == null ? void 0 : old.top) != null ? _old$top : []).filter(d => !(rowIds != null && rowIds.has(d))),
            bottom: [...((_old$bottom = old == null ? void 0 : old.bottom) != null ? _old$bottom : []).filter(d => !(rowIds != null && rowIds.has(d))), ...Array.from(rowIds)]
          };
        }
        if (position === 'top') {
          var _old$top2, _old$bottom2;
          return {
            top: [...((_old$top2 = old == null ? void 0 : old.top) != null ? _old$top2 : []).filter(d => !(rowIds != null && rowIds.has(d))), ...Array.from(rowIds)],
            bottom: ((_old$bottom2 = old == null ? void 0 : old.bottom) != null ? _old$bottom2 : []).filter(d => !(rowIds != null && rowIds.has(d)))
          };
        }
        return {
          top: ((_old$top3 = old == null ? void 0 : old.top) != null ? _old$top3 : []).filter(d => !(rowIds != null && rowIds.has(d))),
          bottom: ((_old$bottom3 = old == null ? void 0 : old.bottom) != null ? _old$bottom3 : []).filter(d => !(rowIds != null && rowIds.has(d)))
        };
      });
    };
    row.getCanPin = () => {
      var _ref3;
      const {
        enableRowPinning,
        enablePinning
      } = table.options;
      if (typeof enableRowPinning === 'function') {
        return enableRowPinning(row);
      }
      return (_ref3 = enableRowPinning != null ? enableRowPinning : enablePinning) != null ? _ref3 : true;
    };
    row.getIsPinned = () => {
      const rowIds = [row.id];
      const {
        top,
        bottom
      } = table.getState().rowPinning;
      const isTop = rowIds.some(d => top == null ? void 0 : top.includes(d));
      const isBottom = rowIds.some(d => bottom == null ? void 0 : bottom.includes(d));
      return isTop ? 'top' : isBottom ? 'bottom' : false;
    };
    row.getPinnedIndex = () => {
      var _ref4, _visiblePinnedRowIds$;
      const position = row.getIsPinned();
      if (!position) return -1;
      const visiblePinnedRowIds = (_ref4 = position === 'top' ? table.getTopRows() : table.getBottomRows()) == null ? void 0 : _ref4.map(_ref5 => {
        let {
          id
        } = _ref5;
        return id;
      });
      return (_visiblePinnedRowIds$ = visiblePinnedRowIds == null ? void 0 : visiblePinnedRowIds.indexOf(row.id)) != null ? _visiblePinnedRowIds$ : -1;
    };
  },
  createTable: table => {
    table.setRowPinning = updater => table.options.onRowPinningChange == null ? void 0 : table.options.onRowPinningChange(updater);
    table.resetRowPinning = defaultState => {
      var _table$initialState$r, _table$initialState;
      return table.setRowPinning(defaultState ? getDefaultRowPinningState() : (_table$initialState$r = (_table$initialState = table.initialState) == null ? void 0 : _table$initialState.rowPinning) != null ? _table$initialState$r : getDefaultRowPinningState());
    };
    table.getIsSomeRowsPinned = position => {
      var _pinningState$positio;
      const pinningState = table.getState().rowPinning;
      if (!position) {
        var _pinningState$top, _pinningState$bottom;
        return Boolean(((_pinningState$top = pinningState.top) == null ? void 0 : _pinningState$top.length) || ((_pinningState$bottom = pinningState.bottom) == null ? void 0 : _pinningState$bottom.length));
      }
      return Boolean((_pinningState$positio = pinningState[position]) == null ? void 0 : _pinningState$positio.length);
    };
    table._getPinnedRows = (visibleRows, pinnedRowIds, position) => {
      var _table$options$keepPi;
      const rows = ((_table$options$keepPi = table.options.keepPinnedRows) != null ? _table$options$keepPi : true) ?
      //get all rows that are pinned even if they would not be otherwise visible
      //account for expanded parent rows, but not pagination or filtering
      (pinnedRowIds != null ? pinnedRowIds : []).map(rowId => {
        const row = table.getRow(rowId, true);
        return row.getIsAllParentsExpanded() ? row : null;
      }) :
      //else get only visible rows that are pinned
      (pinnedRowIds != null ? pinnedRowIds : []).map(rowId => visibleRows.find(row => row.id === rowId));
      return rows.filter(Boolean).map(d => ({
        ...d,
        position
      }));
    };
    table.getTopRows = memo$1(() => [table.getRowModel().rows, table.getState().rowPinning.top], (allRows, topPinnedRowIds) => table._getPinnedRows(allRows, topPinnedRowIds, 'top'), getMemoOptions(table.options, 'debugRows', 'getTopRows'));
    table.getBottomRows = memo$1(() => [table.getRowModel().rows, table.getState().rowPinning.bottom], (allRows, bottomPinnedRowIds) => table._getPinnedRows(allRows, bottomPinnedRowIds, 'bottom'), getMemoOptions(table.options, 'debugRows', 'getBottomRows'));
    table.getCenterRows = memo$1(() => [table.getRowModel().rows, table.getState().rowPinning.top, table.getState().rowPinning.bottom], (allRows, top, bottom) => {
      const topAndBottom = new Set([...(top != null ? top : []), ...(bottom != null ? bottom : [])]);
      return allRows.filter(d => !topAndBottom.has(d.id));
    }, getMemoOptions(table.options, 'debugRows', 'getCenterRows'));
  }
};

//

const RowSelection = {
  getInitialState: state => {
    return {
      rowSelection: {},
      ...state
    };
  },
  getDefaultOptions: table => {
    return {
      onRowSelectionChange: makeStateUpdater('rowSelection', table),
      enableRowSelection: true,
      enableMultiRowSelection: true,
      enableSubRowSelection: true
      // enableGroupingRowSelection: false,
      // isAdditiveSelectEvent: (e: unknown) => !!e.metaKey,
      // isInclusiveSelectEvent: (e: unknown) => !!e.shiftKey,
    };
  },
  createTable: table => {
    table.setRowSelection = updater => table.options.onRowSelectionChange == null ? void 0 : table.options.onRowSelectionChange(updater);
    table.resetRowSelection = defaultState => {
      var _table$initialState$r;
      return table.setRowSelection(defaultState ? {} : (_table$initialState$r = table.initialState.rowSelection) != null ? _table$initialState$r : {});
    };
    table.toggleAllRowsSelected = value => {
      table.setRowSelection(old => {
        value = typeof value !== 'undefined' ? value : !table.getIsAllRowsSelected();
        const rowSelection = {
          ...old
        };
        const preGroupedFlatRows = table.getPreGroupedRowModel().flatRows;

        // We don't use `mutateRowIsSelected` here for performance reasons.
        // All of the rows are flat already, so it wouldn't be worth it
        if (value) {
          preGroupedFlatRows.forEach(row => {
            if (!row.getCanSelect()) {
              return;
            }
            rowSelection[row.id] = true;
          });
        } else {
          preGroupedFlatRows.forEach(row => {
            delete rowSelection[row.id];
          });
        }
        return rowSelection;
      });
    };
    table.toggleAllPageRowsSelected = value => table.setRowSelection(old => {
      const resolvedValue = typeof value !== 'undefined' ? value : !table.getIsAllPageRowsSelected();
      const rowSelection = {
        ...old
      };
      table.getRowModel().rows.forEach(row => {
        mutateRowIsSelected(rowSelection, row.id, resolvedValue, true, table);
      });
      return rowSelection;
    });

    // addRowSelectionRange: rowId => {
    //   const {
    //     rows,
    //     rowsById,
    //     options: { selectGroupingRows, selectSubRows },
    //   } = table

    //   const findSelectedRow = (rows: Row[]) => {
    //     let found
    //     rows.find(d => {
    //       if (d.getIsSelected()) {
    //         found = d
    //         return true
    //       }
    //       const subFound = findSelectedRow(d.subRows || [])
    //       if (subFound) {
    //         found = subFound
    //         return true
    //       }
    //       return false
    //     })
    //     return found
    //   }

    //   const firstRow = findSelectedRow(rows) || rows[0]
    //   const lastRow = rowsById[rowId]

    //   let include = false
    //   const selectedRowIds = {}

    //   const addRow = (row: Row) => {
    //     mutateRowIsSelected(selectedRowIds, row.id, true, {
    //       rowsById,
    //       selectGroupingRows: selectGroupingRows!,
    //       selectSubRows: selectSubRows!,
    //     })
    //   }

    //   table.rows.forEach(row => {
    //     const isFirstRow = row.id === firstRow.id
    //     const isLastRow = row.id === lastRow.id

    //     if (isFirstRow || isLastRow) {
    //       if (!include) {
    //         include = true
    //       } else if (include) {
    //         addRow(row)
    //         include = false
    //       }
    //     }

    //     if (include) {
    //       addRow(row)
    //     }
    //   })

    //   table.setRowSelection(selectedRowIds)
    // },
    table.getPreSelectedRowModel = () => table.getCoreRowModel();
    table.getSelectedRowModel = memo$1(() => [table.getState().rowSelection, table.getCoreRowModel()], (rowSelection, rowModel) => {
      if (!Object.keys(rowSelection).length) {
        return {
          rows: [],
          flatRows: [],
          rowsById: {}
        };
      }
      return selectRowsFn(table, rowModel);
    }, getMemoOptions(table.options, 'debugTable', 'getSelectedRowModel'));
    table.getFilteredSelectedRowModel = memo$1(() => [table.getState().rowSelection, table.getFilteredRowModel()], (rowSelection, rowModel) => {
      if (!Object.keys(rowSelection).length) {
        return {
          rows: [],
          flatRows: [],
          rowsById: {}
        };
      }
      return selectRowsFn(table, rowModel);
    }, getMemoOptions(table.options, 'debugTable', 'getFilteredSelectedRowModel'));
    table.getGroupedSelectedRowModel = memo$1(() => [table.getState().rowSelection, table.getSortedRowModel()], (rowSelection, rowModel) => {
      if (!Object.keys(rowSelection).length) {
        return {
          rows: [],
          flatRows: [],
          rowsById: {}
        };
      }
      return selectRowsFn(table, rowModel);
    }, getMemoOptions(table.options, 'debugTable', 'getGroupedSelectedRowModel'));

    ///

    // getGroupingRowCanSelect: rowId => {
    //   const row = table.getRow(rowId)

    //   if (!row) {
    //     throw new Error()
    //   }

    //   if (typeof table.options.enableGroupingRowSelection === 'function') {
    //     return table.options.enableGroupingRowSelection(row)
    //   }

    //   return table.options.enableGroupingRowSelection ?? false
    // },

    table.getIsAllRowsSelected = () => {
      const preGroupedFlatRows = table.getFilteredRowModel().flatRows;
      const {
        rowSelection
      } = table.getState();
      let isAllRowsSelected = Boolean(preGroupedFlatRows.length && Object.keys(rowSelection).length);
      if (isAllRowsSelected) {
        if (preGroupedFlatRows.some(row => row.getCanSelect() && !rowSelection[row.id])) {
          isAllRowsSelected = false;
        }
      }
      return isAllRowsSelected;
    };
    table.getIsAllPageRowsSelected = () => {
      const paginationFlatRows = table.getPaginationRowModel().flatRows.filter(row => row.getCanSelect());
      const {
        rowSelection
      } = table.getState();
      let isAllPageRowsSelected = !!paginationFlatRows.length;
      if (isAllPageRowsSelected && paginationFlatRows.some(row => !rowSelection[row.id])) {
        isAllPageRowsSelected = false;
      }
      return isAllPageRowsSelected;
    };
    table.getIsSomeRowsSelected = () => {
      var _table$getState$rowSe;
      const totalSelected = Object.keys((_table$getState$rowSe = table.getState().rowSelection) != null ? _table$getState$rowSe : {}).length;
      return totalSelected > 0 && totalSelected < table.getFilteredRowModel().flatRows.length;
    };
    table.getIsSomePageRowsSelected = () => {
      const paginationFlatRows = table.getPaginationRowModel().flatRows;
      return table.getIsAllPageRowsSelected() ? false : paginationFlatRows.filter(row => row.getCanSelect()).some(d => d.getIsSelected() || d.getIsSomeSelected());
    };
    table.getToggleAllRowsSelectedHandler = () => {
      return e => {
        table.toggleAllRowsSelected(e.target.checked);
      };
    };
    table.getToggleAllPageRowsSelectedHandler = () => {
      return e => {
        table.toggleAllPageRowsSelected(e.target.checked);
      };
    };
  },
  createRow: (row, table) => {
    row.toggleSelected = (value, opts) => {
      const isSelected = row.getIsSelected();
      table.setRowSelection(old => {
        var _opts$selectChildren;
        value = typeof value !== 'undefined' ? value : !isSelected;
        if (row.getCanSelect() && isSelected === value) {
          return old;
        }
        const selectedRowIds = {
          ...old
        };
        mutateRowIsSelected(selectedRowIds, row.id, value, (_opts$selectChildren = opts == null ? void 0 : opts.selectChildren) != null ? _opts$selectChildren : true, table);
        return selectedRowIds;
      });
    };
    row.getIsSelected = () => {
      const {
        rowSelection
      } = table.getState();
      return isRowSelected(row, rowSelection);
    };
    row.getIsSomeSelected = () => {
      const {
        rowSelection
      } = table.getState();
      return isSubRowSelected(row, rowSelection) === 'some';
    };
    row.getIsAllSubRowsSelected = () => {
      const {
        rowSelection
      } = table.getState();
      return isSubRowSelected(row, rowSelection) === 'all';
    };
    row.getCanSelect = () => {
      var _table$options$enable;
      if (typeof table.options.enableRowSelection === 'function') {
        return table.options.enableRowSelection(row);
      }
      return (_table$options$enable = table.options.enableRowSelection) != null ? _table$options$enable : true;
    };
    row.getCanSelectSubRows = () => {
      var _table$options$enable2;
      if (typeof table.options.enableSubRowSelection === 'function') {
        return table.options.enableSubRowSelection(row);
      }
      return (_table$options$enable2 = table.options.enableSubRowSelection) != null ? _table$options$enable2 : true;
    };
    row.getCanMultiSelect = () => {
      var _table$options$enable3;
      if (typeof table.options.enableMultiRowSelection === 'function') {
        return table.options.enableMultiRowSelection(row);
      }
      return (_table$options$enable3 = table.options.enableMultiRowSelection) != null ? _table$options$enable3 : true;
    };
    row.getToggleSelectedHandler = () => {
      const canSelect = row.getCanSelect();
      return e => {
        var _target;
        if (!canSelect) return;
        row.toggleSelected((_target = e.target) == null ? void 0 : _target.checked);
      };
    };
  }
};
const mutateRowIsSelected = (selectedRowIds, id, value, includeChildren, table) => {
  var _row$subRows;
  const row = table.getRow(id, true);

  // const isGrouped = row.getIsGrouped()

  // if ( // TODO: enforce grouping row selection rules
  //   !isGrouped ||
  //   (isGrouped && table.options.enableGroupingRowSelection)
  // ) {
  if (value) {
    if (!row.getCanMultiSelect()) {
      Object.keys(selectedRowIds).forEach(key => delete selectedRowIds[key]);
    }
    if (row.getCanSelect()) {
      selectedRowIds[id] = true;
    }
  } else {
    delete selectedRowIds[id];
  }
  // }

  if (includeChildren && (_row$subRows = row.subRows) != null && _row$subRows.length && row.getCanSelectSubRows()) {
    row.subRows.forEach(row => mutateRowIsSelected(selectedRowIds, row.id, value, includeChildren, table));
  }
};
function selectRowsFn(table, rowModel) {
  const rowSelection = table.getState().rowSelection;
  const newSelectedFlatRows = [];
  const newSelectedRowsById = {};

  // Filters top level and nested rows
  const recurseRows = function (rows, depth) {
    return rows.map(row => {
      var _row$subRows2;
      const isSelected = isRowSelected(row, rowSelection);
      if (isSelected) {
        newSelectedFlatRows.push(row);
        newSelectedRowsById[row.id] = row;
      }
      if ((_row$subRows2 = row.subRows) != null && _row$subRows2.length) {
        row = {
          ...row,
          subRows: recurseRows(row.subRows)
        };
      }
      if (isSelected) {
        return row;
      }
    }).filter(Boolean);
  };
  return {
    rows: recurseRows(rowModel.rows),
    flatRows: newSelectedFlatRows,
    rowsById: newSelectedRowsById
  };
}
function isRowSelected(row, selection) {
  var _selection$row$id;
  return (_selection$row$id = selection[row.id]) != null ? _selection$row$id : false;
}
function isSubRowSelected(row, selection, table) {
  var _row$subRows3;
  if (!((_row$subRows3 = row.subRows) != null && _row$subRows3.length)) return false;
  let allChildrenSelected = true;
  let someSelected = false;
  row.subRows.forEach(subRow => {
    // Bail out early if we know both of these
    if (someSelected && !allChildrenSelected) {
      return;
    }
    if (subRow.getCanSelect()) {
      if (isRowSelected(subRow, selection)) {
        someSelected = true;
      } else {
        allChildrenSelected = false;
      }
    }

    // Check row selection of nested subrows
    if (subRow.subRows && subRow.subRows.length) {
      const subRowChildrenSelected = isSubRowSelected(subRow, selection);
      if (subRowChildrenSelected === 'all') {
        someSelected = true;
      } else if (subRowChildrenSelected === 'some') {
        someSelected = true;
        allChildrenSelected = false;
      } else {
        allChildrenSelected = false;
      }
    }
  });
  return allChildrenSelected ? 'all' : someSelected ? 'some' : false;
}

const reSplitAlphaNumeric = /([0-9]+)/gm;
const alphanumeric = (rowA, rowB, columnId) => {
  return compareAlphanumeric(toString(rowA.getValue(columnId)).toLowerCase(), toString(rowB.getValue(columnId)).toLowerCase());
};
const alphanumericCaseSensitive = (rowA, rowB, columnId) => {
  return compareAlphanumeric(toString(rowA.getValue(columnId)), toString(rowB.getValue(columnId)));
};

// The text filter is more basic (less numeric support)
// but is much faster
const text = (rowA, rowB, columnId) => {
  return compareBasic(toString(rowA.getValue(columnId)).toLowerCase(), toString(rowB.getValue(columnId)).toLowerCase());
};

// The text filter is more basic (less numeric support)
// but is much faster
const textCaseSensitive = (rowA, rowB, columnId) => {
  return compareBasic(toString(rowA.getValue(columnId)), toString(rowB.getValue(columnId)));
};
const datetime = (rowA, rowB, columnId) => {
  const a = rowA.getValue(columnId);
  const b = rowB.getValue(columnId);

  // Can handle nullish values
  // Use > and < because == (and ===) doesn't work with
  // Date objects (would require calling getTime()).
  return a > b ? 1 : a < b ? -1 : 0;
};
const basic = (rowA, rowB, columnId) => {
  return compareBasic(rowA.getValue(columnId), rowB.getValue(columnId));
};

// Utils

function compareBasic(a, b) {
  return a === b ? 0 : a > b ? 1 : -1;
}
function toString(a) {
  if (typeof a === 'number') {
    if (isNaN(a) || a === Infinity || a === -Infinity) {
      return '';
    }
    return String(a);
  }
  if (typeof a === 'string') {
    return a;
  }
  return '';
}

// Mixed sorting is slow, but very inclusive of many edge cases.
// It handles numbers, mixed alphanumeric combinations, and even
// null, undefined, and Infinity
function compareAlphanumeric(aStr, bStr) {
  // Split on number groups, but keep the delimiter
  // Then remove falsey split values
  const a = aStr.split(reSplitAlphaNumeric).filter(Boolean);
  const b = bStr.split(reSplitAlphaNumeric).filter(Boolean);

  // While
  while (a.length && b.length) {
    const aa = a.shift();
    const bb = b.shift();
    const an = parseInt(aa, 10);
    const bn = parseInt(bb, 10);
    const combo = [an, bn].sort();

    // Both are string
    if (isNaN(combo[0])) {
      if (aa > bb) {
        return 1;
      }
      if (bb > aa) {
        return -1;
      }
      continue;
    }

    // One is a string, one is a number
    if (isNaN(combo[1])) {
      return isNaN(an) ? -1 : 1;
    }

    // Both are numbers
    if (an > bn) {
      return 1;
    }
    if (bn > an) {
      return -1;
    }
  }
  return a.length - b.length;
}

// Exports

const sortingFns = {
  alphanumeric,
  alphanumericCaseSensitive,
  text,
  textCaseSensitive,
  datetime,
  basic
};

//

const RowSorting = {
  getInitialState: state => {
    return {
      sorting: [],
      ...state
    };
  },
  getDefaultColumnDef: () => {
    return {
      sortingFn: 'auto',
      sortUndefined: 1
    };
  },
  getDefaultOptions: table => {
    return {
      onSortingChange: makeStateUpdater('sorting', table),
      isMultiSortEvent: e => {
        return e.shiftKey;
      }
    };
  },
  createColumn: (column, table) => {
    column.getAutoSortingFn = () => {
      const firstRows = table.getFilteredRowModel().flatRows.slice(10);
      let isString = false;
      for (const row of firstRows) {
        const value = row == null ? void 0 : row.getValue(column.id);
        if (Object.prototype.toString.call(value) === '[object Date]') {
          return sortingFns.datetime;
        }
        if (typeof value === 'string') {
          isString = true;
          if (value.split(reSplitAlphaNumeric).length > 1) {
            return sortingFns.alphanumeric;
          }
        }
      }
      if (isString) {
        return sortingFns.text;
      }
      return sortingFns.basic;
    };
    column.getAutoSortDir = () => {
      const firstRow = table.getFilteredRowModel().flatRows[0];
      const value = firstRow == null ? void 0 : firstRow.getValue(column.id);
      if (typeof value === 'string') {
        return 'asc';
      }
      return 'desc';
    };
    column.getSortingFn = () => {
      var _table$options$sortin, _table$options$sortin2;
      if (!column) {
        throw new Error();
      }
      return isFunction(column.columnDef.sortingFn) ? column.columnDef.sortingFn : column.columnDef.sortingFn === 'auto' ? column.getAutoSortingFn() : (_table$options$sortin = (_table$options$sortin2 = table.options.sortingFns) == null ? void 0 : _table$options$sortin2[column.columnDef.sortingFn]) != null ? _table$options$sortin : sortingFns[column.columnDef.sortingFn];
    };
    column.toggleSorting = (desc, multi) => {
      // if (column.columns.length) {
      //   column.columns.forEach((c, i) => {
      //     if (c.id) {
      //       table.toggleColumnSorting(c.id, undefined, multi || !!i)
      //     }
      //   })
      //   return
      // }

      // this needs to be outside of table.setSorting to be in sync with rerender
      const nextSortingOrder = column.getNextSortingOrder();
      const hasManualValue = typeof desc !== 'undefined' && desc !== null;
      table.setSorting(old => {
        // Find any existing sorting for this column
        const existingSorting = old == null ? void 0 : old.find(d => d.id === column.id);
        const existingIndex = old == null ? void 0 : old.findIndex(d => d.id === column.id);
        let newSorting = [];

        // What should we do with this sort action?
        let sortAction;
        let nextDesc = hasManualValue ? desc : nextSortingOrder === 'desc';

        // Multi-mode
        if (old != null && old.length && column.getCanMultiSort() && multi) {
          if (existingSorting) {
            sortAction = 'toggle';
          } else {
            sortAction = 'add';
          }
        } else {
          // Normal mode
          if (old != null && old.length && existingIndex !== old.length - 1) {
            sortAction = 'replace';
          } else if (existingSorting) {
            sortAction = 'toggle';
          } else {
            sortAction = 'replace';
          }
        }

        // Handle toggle states that will remove the sorting
        if (sortAction === 'toggle') {
          // If we are "actually" toggling (not a manual set value), should we remove the sorting?
          if (!hasManualValue) {
            // Is our intention to remove?
            if (!nextSortingOrder) {
              sortAction = 'remove';
            }
          }
        }
        if (sortAction === 'add') {
          var _table$options$maxMul;
          newSorting = [...old, {
            id: column.id,
            desc: nextDesc
          }];
          // Take latest n columns
          newSorting.splice(0, newSorting.length - ((_table$options$maxMul = table.options.maxMultiSortColCount) != null ? _table$options$maxMul : Number.MAX_SAFE_INTEGER));
        } else if (sortAction === 'toggle') {
          // This flips (or sets) the
          newSorting = old.map(d => {
            if (d.id === column.id) {
              return {
                ...d,
                desc: nextDesc
              };
            }
            return d;
          });
        } else if (sortAction === 'remove') {
          newSorting = old.filter(d => d.id !== column.id);
        } else {
          newSorting = [{
            id: column.id,
            desc: nextDesc
          }];
        }
        return newSorting;
      });
    };
    column.getFirstSortDir = () => {
      var _ref, _column$columnDef$sor;
      const sortDescFirst = (_ref = (_column$columnDef$sor = column.columnDef.sortDescFirst) != null ? _column$columnDef$sor : table.options.sortDescFirst) != null ? _ref : column.getAutoSortDir() === 'desc';
      return sortDescFirst ? 'desc' : 'asc';
    };
    column.getNextSortingOrder = multi => {
      var _table$options$enable, _table$options$enable2;
      const firstSortDirection = column.getFirstSortDir();
      const isSorted = column.getIsSorted();
      if (!isSorted) {
        return firstSortDirection;
      }
      if (isSorted !== firstSortDirection && ((_table$options$enable = table.options.enableSortingRemoval) != null ? _table$options$enable : true) && (
      // If enableSortRemove, enable in general
      multi ? (_table$options$enable2 = table.options.enableMultiRemove) != null ? _table$options$enable2 : true : true) // If multi, don't allow if enableMultiRemove))
      ) {
        return false;
      }
      return isSorted === 'desc' ? 'asc' : 'desc';
    };
    column.getCanSort = () => {
      var _column$columnDef$ena, _table$options$enable3;
      return ((_column$columnDef$ena = column.columnDef.enableSorting) != null ? _column$columnDef$ena : true) && ((_table$options$enable3 = table.options.enableSorting) != null ? _table$options$enable3 : true) && !!column.accessorFn;
    };
    column.getCanMultiSort = () => {
      var _ref2, _column$columnDef$ena2;
      return (_ref2 = (_column$columnDef$ena2 = column.columnDef.enableMultiSort) != null ? _column$columnDef$ena2 : table.options.enableMultiSort) != null ? _ref2 : !!column.accessorFn;
    };
    column.getIsSorted = () => {
      var _table$getState$sorti;
      const columnSort = (_table$getState$sorti = table.getState().sorting) == null ? void 0 : _table$getState$sorti.find(d => d.id === column.id);
      return !columnSort ? false : columnSort.desc ? 'desc' : 'asc';
    };
    column.getSortIndex = () => {
      var _table$getState$sorti2, _table$getState$sorti3;
      return (_table$getState$sorti2 = (_table$getState$sorti3 = table.getState().sorting) == null ? void 0 : _table$getState$sorti3.findIndex(d => d.id === column.id)) != null ? _table$getState$sorti2 : -1;
    };
    column.clearSorting = () => {
      //clear sorting for just 1 column
      table.setSorting(old => old != null && old.length ? old.filter(d => d.id !== column.id) : []);
    };
    column.getToggleSortingHandler = () => {
      const canSort = column.getCanSort();
      return e => {
        if (!canSort) return;
        e.persist == null || e.persist();
        column.toggleSorting == null || column.toggleSorting(undefined, column.getCanMultiSort() ? table.options.isMultiSortEvent == null ? void 0 : table.options.isMultiSortEvent(e) : false);
      };
    };
  },
  createTable: table => {
    table.setSorting = updater => table.options.onSortingChange == null ? void 0 : table.options.onSortingChange(updater);
    table.resetSorting = defaultState => {
      var _table$initialState$s, _table$initialState;
      table.setSorting(defaultState ? [] : (_table$initialState$s = (_table$initialState = table.initialState) == null ? void 0 : _table$initialState.sorting) != null ? _table$initialState$s : []);
    };
    table.getPreSortedRowModel = () => table.getGroupedRowModel();
    table.getSortedRowModel = () => {
      if (!table._getSortedRowModel && table.options.getSortedRowModel) {
        table._getSortedRowModel = table.options.getSortedRowModel(table);
      }
      if (table.options.manualSorting || !table._getSortedRowModel) {
        return table.getPreSortedRowModel();
      }
      return table._getSortedRowModel();
    };
  }
};

const builtInFeatures = [Headers, ColumnVisibility, ColumnOrdering, ColumnPinning, ColumnFaceting, ColumnFiltering, GlobalFaceting,
//depends on ColumnFaceting
GlobalFiltering,
//depends on ColumnFiltering
RowSorting, ColumnGrouping,
//depends on RowSorting
RowExpanding, RowPagination, RowPinning, RowSelection, ColumnSizing];

//

function createTable(options) {
  var _options$_features, _options$initialState;
  if (process.env.NODE_ENV !== 'production' && (options.debugAll || options.debugTable)) {
    console.info('Creating Table Instance...');
  }
  const _features = [...builtInFeatures, ...((_options$_features = options._features) != null ? _options$_features : [])];
  let table = {
    _features
  };
  const defaultOptions = table._features.reduce((obj, feature) => {
    return Object.assign(obj, feature.getDefaultOptions == null ? void 0 : feature.getDefaultOptions(table));
  }, {});
  const mergeOptions = options => {
    if (table.options.mergeOptions) {
      return table.options.mergeOptions(defaultOptions, options);
    }
    return {
      ...defaultOptions,
      ...options
    };
  };
  const coreInitialState = {};
  let initialState = {
    ...coreInitialState,
    ...((_options$initialState = options.initialState) != null ? _options$initialState : {})
  };
  table._features.forEach(feature => {
    var _feature$getInitialSt;
    initialState = (_feature$getInitialSt = feature.getInitialState == null ? void 0 : feature.getInitialState(initialState)) != null ? _feature$getInitialSt : initialState;
  });
  const queued = [];
  let queuedTimeout = false;
  const coreInstance = {
    _features,
    options: {
      ...defaultOptions,
      ...options
    },
    initialState,
    _queue: cb => {
      queued.push(cb);
      if (!queuedTimeout) {
        queuedTimeout = true;

        // Schedule a microtask to run the queued callbacks after
        // the current call stack (render, etc) has finished.
        Promise.resolve().then(() => {
          while (queued.length) {
            queued.shift()();
          }
          queuedTimeout = false;
        }).catch(error => setTimeout(() => {
          throw error;
        }));
      }
    },
    reset: () => {
      table.setState(table.initialState);
    },
    setOptions: updater => {
      const newOptions = functionalUpdate(updater, table.options);
      table.options = mergeOptions(newOptions);
    },
    getState: () => {
      return table.options.state;
    },
    setState: updater => {
      table.options.onStateChange == null || table.options.onStateChange(updater);
    },
    _getRowId: (row, index, parent) => {
      var _table$options$getRow;
      return (_table$options$getRow = table.options.getRowId == null ? void 0 : table.options.getRowId(row, index, parent)) != null ? _table$options$getRow : `${parent ? [parent.id, index].join('.') : index}`;
    },
    getCoreRowModel: () => {
      if (!table._getCoreRowModel) {
        table._getCoreRowModel = table.options.getCoreRowModel(table);
      }
      return table._getCoreRowModel();
    },
    // The final calls start at the bottom of the model,
    // expanded rows, which then work their way up

    getRowModel: () => {
      return table.getPaginationRowModel();
    },
    //in next version, we should just pass in the row model as the optional 2nd arg
    getRow: (id, searchAll) => {
      let row = (searchAll ? table.getPrePaginationRowModel() : table.getRowModel()).rowsById[id];
      if (!row) {
        row = table.getCoreRowModel().rowsById[id];
        if (!row) {
          if (process.env.NODE_ENV !== 'production') {
            throw new Error(`getRow could not find row with ID: ${id}`);
          }
          throw new Error();
        }
      }
      return row;
    },
    _getDefaultColumnDef: memo$1(() => [table.options.defaultColumn], defaultColumn => {
      var _defaultColumn;
      defaultColumn = (_defaultColumn = defaultColumn) != null ? _defaultColumn : {};
      return {
        header: props => {
          const resolvedColumnDef = props.header.column.columnDef;
          if (resolvedColumnDef.accessorKey) {
            return resolvedColumnDef.accessorKey;
          }
          if (resolvedColumnDef.accessorFn) {
            return resolvedColumnDef.id;
          }
          return null;
        },
        // footer: props => props.header.column.id,
        cell: props => {
          var _props$renderValue$to, _props$renderValue;
          return (_props$renderValue$to = (_props$renderValue = props.renderValue()) == null || _props$renderValue.toString == null ? void 0 : _props$renderValue.toString()) != null ? _props$renderValue$to : null;
        },
        ...table._features.reduce((obj, feature) => {
          return Object.assign(obj, feature.getDefaultColumnDef == null ? void 0 : feature.getDefaultColumnDef());
        }, {}),
        ...defaultColumn
      };
    }, getMemoOptions(options, 'debugColumns', '_getDefaultColumnDef')),
    _getColumnDefs: () => table.options.columns,
    getAllColumns: memo$1(() => [table._getColumnDefs()], columnDefs => {
      const recurseColumns = function (columnDefs, parent, depth) {
        if (depth === void 0) {
          depth = 0;
        }
        return columnDefs.map(columnDef => {
          const column = createColumn(table, columnDef, depth, parent);
          const groupingColumnDef = columnDef;
          column.columns = groupingColumnDef.columns ? recurseColumns(groupingColumnDef.columns, column, depth + 1) : [];
          return column;
        });
      };
      return recurseColumns(columnDefs);
    }, getMemoOptions(options, 'debugColumns', 'getAllColumns')),
    getAllFlatColumns: memo$1(() => [table.getAllColumns()], allColumns => {
      return allColumns.flatMap(column => {
        return column.getFlatColumns();
      });
    }, getMemoOptions(options, 'debugColumns', 'getAllFlatColumns')),
    _getAllFlatColumnsById: memo$1(() => [table.getAllFlatColumns()], flatColumns => {
      return flatColumns.reduce((acc, column) => {
        acc[column.id] = column;
        return acc;
      }, {});
    }, getMemoOptions(options, 'debugColumns', 'getAllFlatColumnsById')),
    getAllLeafColumns: memo$1(() => [table.getAllColumns(), table._getOrderColumnsFn()], (allColumns, orderColumns) => {
      let leafColumns = allColumns.flatMap(column => column.getLeafColumns());
      return orderColumns(leafColumns);
    }, getMemoOptions(options, 'debugColumns', 'getAllLeafColumns')),
    getColumn: columnId => {
      const column = table._getAllFlatColumnsById()[columnId];
      if (process.env.NODE_ENV !== 'production' && !column) {
        console.error(`[Table] Column with id '${columnId}' does not exist.`);
      }
      return column;
    }
  };
  Object.assign(table, coreInstance);
  for (let index = 0; index < table._features.length; index++) {
    const feature = table._features[index];
    feature == null || feature.createTable == null || feature.createTable(table);
  }
  return table;
}

function getCoreRowModel() {
  return table => memo$1(() => [table.options.data], data => {
    const rowModel = {
      rows: [],
      flatRows: [],
      rowsById: {}
    };
    const accessRows = function (originalRows, depth, parentRow) {
      if (depth === void 0) {
        depth = 0;
      }
      const rows = [];
      for (let i = 0; i < originalRows.length; i++) {
        // This could be an expensive check at scale, so we should move it somewhere else, but where?
        // if (!id) {
        //   if (process.env.NODE_ENV !== 'production') {
        //     throw new Error(`getRowId expected an ID, but got ${id}`)
        //   }
        // }

        // Make the row
        const row = createRow(table, table._getRowId(originalRows[i], i, parentRow), originalRows[i], i, depth, undefined, parentRow == null ? void 0 : parentRow.id);

        // Keep track of every row in a flat array
        rowModel.flatRows.push(row);
        // Also keep track of every row by its ID
        rowModel.rowsById[row.id] = row;
        // Push table row into parent
        rows.push(row);

        // Get the original subrows
        if (table.options.getSubRows) {
          var _row$originalSubRows;
          row.originalSubRows = table.options.getSubRows(originalRows[i], i);

          // Then recursively access them
          if ((_row$originalSubRows = row.originalSubRows) != null && _row$originalSubRows.length) {
            row.subRows = accessRows(row.originalSubRows, depth + 1, row);
          }
        }
      }
      return rows;
    };
    rowModel.rows = accessRows(data);
    return rowModel;
  }, getMemoOptions(table.options, 'debugTable', 'getRowModel', () => table._autoResetPageIndex()));
}

function getExpandedRowModel() {
  return table => memo$1(() => [table.getState().expanded, table.getPreExpandedRowModel(), table.options.paginateExpandedRows], (expanded, rowModel, paginateExpandedRows) => {
    if (!rowModel.rows.length || expanded !== true && !Object.keys(expanded != null ? expanded : {}).length) {
      return rowModel;
    }
    if (!paginateExpandedRows) {
      // Only expand rows at this point if they are being paginated
      return rowModel;
    }
    return expandRows(rowModel);
  }, getMemoOptions(table.options, 'debugTable', 'getExpandedRowModel'));
}
function expandRows(rowModel) {
  const expandedRows = [];
  const handleRow = row => {
    var _row$subRows;
    expandedRows.push(row);
    if ((_row$subRows = row.subRows) != null && _row$subRows.length && row.getIsExpanded()) {
      row.subRows.forEach(handleRow);
    }
  };
  rowModel.rows.forEach(handleRow);
  return {
    rows: expandedRows,
    flatRows: rowModel.flatRows,
    rowsById: rowModel.rowsById
  };
}

function filterRows(rows, filterRowImpl, table) {
  if (table.options.filterFromLeafRows) {
    return filterRowModelFromLeafs(rows, filterRowImpl, table);
  }
  return filterRowModelFromRoot(rows, filterRowImpl, table);
}
function filterRowModelFromLeafs(rowsToFilter, filterRow, table) {
  var _table$options$maxLea;
  const newFilteredFlatRows = [];
  const newFilteredRowsById = {};
  const maxDepth = (_table$options$maxLea = table.options.maxLeafRowFilterDepth) != null ? _table$options$maxLea : 100;
  const recurseFilterRows = function (rowsToFilter, depth) {
    if (depth === void 0) {
      depth = 0;
    }
    const rows = [];

    // Filter from children up first
    for (let i = 0; i < rowsToFilter.length; i++) {
      var _row$subRows;
      let row = rowsToFilter[i];
      const newRow = createRow(table, row.id, row.original, row.index, row.depth, undefined, row.parentId);
      newRow.columnFilters = row.columnFilters;
      if ((_row$subRows = row.subRows) != null && _row$subRows.length && depth < maxDepth) {
        newRow.subRows = recurseFilterRows(row.subRows, depth + 1);
        row = newRow;
        if (filterRow(row) && !newRow.subRows.length) {
          rows.push(row);
          newFilteredRowsById[row.id] = row;
          newFilteredFlatRows.push(row);
          continue;
        }
        if (filterRow(row) || newRow.subRows.length) {
          rows.push(row);
          newFilteredRowsById[row.id] = row;
          newFilteredFlatRows.push(row);
          continue;
        }
      } else {
        row = newRow;
        if (filterRow(row)) {
          rows.push(row);
          newFilteredRowsById[row.id] = row;
          newFilteredFlatRows.push(row);
        }
      }
    }
    return rows;
  };
  return {
    rows: recurseFilterRows(rowsToFilter),
    flatRows: newFilteredFlatRows,
    rowsById: newFilteredRowsById
  };
}
function filterRowModelFromRoot(rowsToFilter, filterRow, table) {
  var _table$options$maxLea2;
  const newFilteredFlatRows = [];
  const newFilteredRowsById = {};
  const maxDepth = (_table$options$maxLea2 = table.options.maxLeafRowFilterDepth) != null ? _table$options$maxLea2 : 100;

  // Filters top level and nested rows
  const recurseFilterRows = function (rowsToFilter, depth) {
    if (depth === void 0) {
      depth = 0;
    }
    // Filter from parents downward first

    const rows = [];

    // Apply the filter to any subRows
    for (let i = 0; i < rowsToFilter.length; i++) {
      let row = rowsToFilter[i];
      const pass = filterRow(row);
      if (pass) {
        var _row$subRows2;
        if ((_row$subRows2 = row.subRows) != null && _row$subRows2.length && depth < maxDepth) {
          const newRow = createRow(table, row.id, row.original, row.index, row.depth, undefined, row.parentId);
          newRow.subRows = recurseFilterRows(row.subRows, depth + 1);
          row = newRow;
        }
        rows.push(row);
        newFilteredFlatRows.push(row);
        newFilteredRowsById[row.id] = row;
      }
    }
    return rows;
  };
  return {
    rows: recurseFilterRows(rowsToFilter),
    flatRows: newFilteredFlatRows,
    rowsById: newFilteredRowsById
  };
}

function getFilteredRowModel() {
  return table => memo$1(() => [table.getPreFilteredRowModel(), table.getState().columnFilters, table.getState().globalFilter], (rowModel, columnFilters, globalFilter) => {
    if (!rowModel.rows.length || !(columnFilters != null && columnFilters.length) && !globalFilter) {
      for (let i = 0; i < rowModel.flatRows.length; i++) {
        rowModel.flatRows[i].columnFilters = {};
        rowModel.flatRows[i].columnFiltersMeta = {};
      }
      return rowModel;
    }
    const resolvedColumnFilters = [];
    const resolvedGlobalFilters = [];
    (columnFilters != null ? columnFilters : []).forEach(d => {
      var _filterFn$resolveFilt;
      const column = table.getColumn(d.id);
      if (!column) {
        return;
      }
      const filterFn = column.getFilterFn();
      if (!filterFn) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`Could not find a valid 'column.filterFn' for column with the ID: ${column.id}.`);
        }
        return;
      }
      resolvedColumnFilters.push({
        id: d.id,
        filterFn,
        resolvedValue: (_filterFn$resolveFilt = filterFn.resolveFilterValue == null ? void 0 : filterFn.resolveFilterValue(d.value)) != null ? _filterFn$resolveFilt : d.value
      });
    });
    const filterableIds = (columnFilters != null ? columnFilters : []).map(d => d.id);
    const globalFilterFn = table.getGlobalFilterFn();
    const globallyFilterableColumns = table.getAllLeafColumns().filter(column => column.getCanGlobalFilter());
    if (globalFilter && globalFilterFn && globallyFilterableColumns.length) {
      filterableIds.push('__global__');
      globallyFilterableColumns.forEach(column => {
        var _globalFilterFn$resol;
        resolvedGlobalFilters.push({
          id: column.id,
          filterFn: globalFilterFn,
          resolvedValue: (_globalFilterFn$resol = globalFilterFn.resolveFilterValue == null ? void 0 : globalFilterFn.resolveFilterValue(globalFilter)) != null ? _globalFilterFn$resol : globalFilter
        });
      });
    }
    let currentColumnFilter;
    let currentGlobalFilter;

    // Flag the prefiltered row model with each filter state
    for (let j = 0; j < rowModel.flatRows.length; j++) {
      const row = rowModel.flatRows[j];
      row.columnFilters = {};
      if (resolvedColumnFilters.length) {
        for (let i = 0; i < resolvedColumnFilters.length; i++) {
          currentColumnFilter = resolvedColumnFilters[i];
          const id = currentColumnFilter.id;

          // Tag the row with the column filter state
          row.columnFilters[id] = currentColumnFilter.filterFn(row, id, currentColumnFilter.resolvedValue, filterMeta => {
            row.columnFiltersMeta[id] = filterMeta;
          });
        }
      }
      if (resolvedGlobalFilters.length) {
        for (let i = 0; i < resolvedGlobalFilters.length; i++) {
          currentGlobalFilter = resolvedGlobalFilters[i];
          const id = currentGlobalFilter.id;
          // Tag the row with the first truthy global filter state
          if (currentGlobalFilter.filterFn(row, id, currentGlobalFilter.resolvedValue, filterMeta => {
            row.columnFiltersMeta[id] = filterMeta;
          })) {
            row.columnFilters.__global__ = true;
            break;
          }
        }
        if (row.columnFilters.__global__ !== true) {
          row.columnFilters.__global__ = false;
        }
      }
    }
    const filterRowsImpl = row => {
      // Horizontally filter rows through each column
      for (let i = 0; i < filterableIds.length; i++) {
        if (row.columnFilters[filterableIds[i]] === false) {
          return false;
        }
      }
      return true;
    };

    // Filter final rows using all of the active filters
    return filterRows(rowModel.rows, filterRowsImpl, table);
  }, getMemoOptions(table.options, 'debugTable', 'getFilteredRowModel', () => table._autoResetPageIndex()));
}

function getGroupedRowModel() {
  return table => memo$1(() => [table.getState().grouping, table.getPreGroupedRowModel()], (grouping, rowModel) => {
    if (!rowModel.rows.length || !grouping.length) {
      rowModel.rows.forEach(row => {
        row.depth = 0;
        row.parentId = undefined;
      });
      return rowModel;
    }

    // Filter the grouping list down to columns that exist
    const existingGrouping = grouping.filter(columnId => table.getColumn(columnId));
    const groupedFlatRows = [];
    const groupedRowsById = {};
    // const onlyGroupedFlatRows: Row[] = [];
    // const onlyGroupedRowsById: Record<RowId, Row> = {};
    // const nonGroupedFlatRows: Row[] = [];
    // const nonGroupedRowsById: Record<RowId, Row> = {};

    // Recursively group the data
    const groupUpRecursively = function (rows, depth, parentId) {
      if (depth === void 0) {
        depth = 0;
      }
      // Grouping depth has been been met
      // Stop grouping and simply rewrite thd depth and row relationships
      if (depth >= existingGrouping.length) {
        return rows.map(row => {
          row.depth = depth;
          groupedFlatRows.push(row);
          groupedRowsById[row.id] = row;
          if (row.subRows) {
            row.subRows = groupUpRecursively(row.subRows, depth + 1, row.id);
          }
          return row;
        });
      }
      const columnId = existingGrouping[depth];

      // Group the rows together for this level
      const rowGroupsMap = groupBy(rows, columnId);

      // Perform aggregations for each group
      const aggregatedGroupedRows = Array.from(rowGroupsMap.entries()).map((_ref, index) => {
        let [groupingValue, groupedRows] = _ref;
        let id = `${columnId}:${groupingValue}`;
        id = parentId ? `${parentId}>${id}` : id;

        // First, Recurse to group sub rows before aggregation
        const subRows = groupUpRecursively(groupedRows, depth + 1, id);
        subRows.forEach(subRow => {
          subRow.parentId = id;
        });

        // Flatten the leaf rows of the rows in this group
        const leafRows = depth ? flattenBy(groupedRows, row => row.subRows) : groupedRows;
        const row = createRow(table, id, leafRows[0].original, index, depth, undefined, parentId);
        Object.assign(row, {
          groupingColumnId: columnId,
          groupingValue,
          subRows,
          leafRows,
          getValue: columnId => {
            // Don't aggregate columns that are in the grouping
            if (existingGrouping.includes(columnId)) {
              if (row._valuesCache.hasOwnProperty(columnId)) {
                return row._valuesCache[columnId];
              }
              if (groupedRows[0]) {
                var _groupedRows$0$getVal;
                row._valuesCache[columnId] = (_groupedRows$0$getVal = groupedRows[0].getValue(columnId)) != null ? _groupedRows$0$getVal : undefined;
              }
              return row._valuesCache[columnId];
            }
            if (row._groupingValuesCache.hasOwnProperty(columnId)) {
              return row._groupingValuesCache[columnId];
            }

            // Aggregate the values
            const column = table.getColumn(columnId);
            const aggregateFn = column == null ? void 0 : column.getAggregationFn();
            if (aggregateFn) {
              row._groupingValuesCache[columnId] = aggregateFn(columnId, leafRows, groupedRows);
              return row._groupingValuesCache[columnId];
            }
          }
        });
        subRows.forEach(subRow => {
          groupedFlatRows.push(subRow);
          groupedRowsById[subRow.id] = subRow;
          // if (subRow.getIsGrouped?.()) {
          //   onlyGroupedFlatRows.push(subRow);
          //   onlyGroupedRowsById[subRow.id] = subRow;
          // } else {
          //   nonGroupedFlatRows.push(subRow);
          //   nonGroupedRowsById[subRow.id] = subRow;
          // }
        });
        return row;
      });
      return aggregatedGroupedRows;
    };
    const groupedRows = groupUpRecursively(rowModel.rows, 0);
    groupedRows.forEach(subRow => {
      groupedFlatRows.push(subRow);
      groupedRowsById[subRow.id] = subRow;
      // if (subRow.getIsGrouped?.()) {
      //   onlyGroupedFlatRows.push(subRow);
      //   onlyGroupedRowsById[subRow.id] = subRow;
      // } else {
      //   nonGroupedFlatRows.push(subRow);
      //   nonGroupedRowsById[subRow.id] = subRow;
      // }
    });
    return {
      rows: groupedRows,
      flatRows: groupedFlatRows,
      rowsById: groupedRowsById
    };
  }, getMemoOptions(table.options, 'debugTable', 'getGroupedRowModel', () => {
    table._queue(() => {
      table._autoResetExpanded();
      table._autoResetPageIndex();
    });
  }));
}
function groupBy(rows, columnId) {
  const groupMap = new Map();
  return rows.reduce((map, row) => {
    const resKey = `${row.getGroupingValue(columnId)}`;
    const previous = map.get(resKey);
    if (!previous) {
      map.set(resKey, [row]);
    } else {
      previous.push(row);
    }
    return map;
  }, groupMap);
}

function getPaginationRowModel(opts) {
  return table => memo$1(() => [table.getState().pagination, table.getPrePaginationRowModel(), table.options.paginateExpandedRows ? undefined : table.getState().expanded], (pagination, rowModel) => {
    if (!rowModel.rows.length) {
      return rowModel;
    }
    const {
      pageSize,
      pageIndex
    } = pagination;
    let {
      rows,
      flatRows,
      rowsById
    } = rowModel;
    const pageStart = pageSize * pageIndex;
    const pageEnd = pageStart + pageSize;
    rows = rows.slice(pageStart, pageEnd);
    let paginatedRowModel;
    if (!table.options.paginateExpandedRows) {
      paginatedRowModel = expandRows({
        rows,
        flatRows,
        rowsById
      });
    } else {
      paginatedRowModel = {
        rows,
        flatRows,
        rowsById
      };
    }
    paginatedRowModel.flatRows = [];
    const handleRow = row => {
      paginatedRowModel.flatRows.push(row);
      if (row.subRows.length) {
        row.subRows.forEach(handleRow);
      }
    };
    paginatedRowModel.rows.forEach(handleRow);
    return paginatedRowModel;
  }, getMemoOptions(table.options, 'debugTable', 'getPaginationRowModel'));
}

function getSortedRowModel() {
  return table => memo$1(() => [table.getState().sorting, table.getPreSortedRowModel()], (sorting, rowModel) => {
    if (!rowModel.rows.length || !(sorting != null && sorting.length)) {
      return rowModel;
    }
    const sortingState = table.getState().sorting;
    const sortedFlatRows = [];

    // Filter out sortings that correspond to non existing columns
    const availableSorting = sortingState.filter(sort => {
      var _table$getColumn;
      return (_table$getColumn = table.getColumn(sort.id)) == null ? void 0 : _table$getColumn.getCanSort();
    });
    const columnInfoById = {};
    availableSorting.forEach(sortEntry => {
      const column = table.getColumn(sortEntry.id);
      if (!column) return;
      columnInfoById[sortEntry.id] = {
        sortUndefined: column.columnDef.sortUndefined,
        invertSorting: column.columnDef.invertSorting,
        sortingFn: column.getSortingFn()
      };
    });
    const sortData = rows => {
      // This will also perform a stable sorting using the row index
      // if needed.
      const sortedData = rows.map(row => ({
        ...row
      }));
      sortedData.sort((rowA, rowB) => {
        for (let i = 0; i < availableSorting.length; i += 1) {
          var _sortEntry$desc;
          const sortEntry = availableSorting[i];
          const columnInfo = columnInfoById[sortEntry.id];
          const sortUndefined = columnInfo.sortUndefined;
          const isDesc = (_sortEntry$desc = sortEntry == null ? void 0 : sortEntry.desc) != null ? _sortEntry$desc : false;
          let sortInt = 0;

          // All sorting ints should always return in ascending order
          if (sortUndefined) {
            const aValue = rowA.getValue(sortEntry.id);
            const bValue = rowB.getValue(sortEntry.id);
            const aUndefined = aValue === undefined;
            const bUndefined = bValue === undefined;
            if (aUndefined || bUndefined) {
              if (sortUndefined === 'first') return aUndefined ? -1 : 1;
              if (sortUndefined === 'last') return aUndefined ? 1 : -1;
              sortInt = aUndefined && bUndefined ? 0 : aUndefined ? sortUndefined : -sortUndefined;
            }
          }
          if (sortInt === 0) {
            sortInt = columnInfo.sortingFn(rowA, rowB, sortEntry.id);
          }

          // If sorting is non-zero, take care of desc and inversion
          if (sortInt !== 0) {
            if (isDesc) {
              sortInt *= -1;
            }
            if (columnInfo.invertSorting) {
              sortInt *= -1;
            }
            return sortInt;
          }
        }
        return rowA.index - rowB.index;
      });

      // If there are sub-rows, sort them
      sortedData.forEach(row => {
        var _row$subRows;
        sortedFlatRows.push(row);
        if ((_row$subRows = row.subRows) != null && _row$subRows.length) {
          row.subRows = sortData(row.subRows);
        }
      });
      return sortedData;
    };
    return {
      rows: sortData(rowModel.rows),
      flatRows: sortedFlatRows,
      rowsById: rowModel.rowsById
    };
  }, getMemoOptions(table.options, 'debugTable', 'getSortedRowModel', () => table._autoResetPageIndex()));
}

/**
   * react-table
   *
   * Copyright (c) TanStack
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   */

//

/**
 * If rendering headers, cells, or footers with custom markup, use flexRender instead of `cell.getValue()` or `cell.renderValue()`.
 */
function flexRender(Comp, props) {
  return !Comp ? null : isReactComponent(Comp) ? /*#__PURE__*/React__namespace.createElement(Comp, props) : Comp;
}
function isReactComponent(component) {
  return isClassComponent(component) || typeof component === 'function' || isExoticComponent(component);
}
function isClassComponent(component) {
  return typeof component === 'function' && (() => {
    const proto = Object.getPrototypeOf(component);
    return proto.prototype && proto.prototype.isReactComponent;
  })();
}
function isExoticComponent(component) {
  return typeof component === 'object' && typeof component.$$typeof === 'symbol' && ['react.memo', 'react.forward_ref'].includes(component.$$typeof.description);
}
function useReactTable(options) {
  // Compose in the generic options to the user options
  const resolvedOptions = {
    state: {},
    // Dummy state
    onStateChange: () => {},
    // noop
    renderFallbackValue: null,
    ...options
  };

  // Create a new table and store it in state
  const [tableRef] = React__namespace.useState(() => ({
    current: createTable(resolvedOptions)
  }));

  // By default, manage table state here using the table's initial state
  const [state, setState] = React__namespace.useState(() => tableRef.current.initialState);

  // Compose the default state above with any user state. This will allow the user
  // to only control a subset of the state if desired.
  tableRef.current.setOptions(prev => ({
    ...prev,
    ...options,
    state: {
      ...state,
      ...options.state
    },
    // Similarly, we'll maintain both our internal state and any user-provided
    // state.
    onStateChange: updater => {
      setState(updater);
      options.onStateChange == null || options.onStateChange(updater);
    }
  }));
  return tableRef.current;
}

function PivotTableView({ data, pivotState }) {
    const pivotData = React.useMemo(() => {
        if (pivotState.rowFields.length === 0 || pivotState.valueFields.length === 0) {
            return { rows: [], columns: [], uniqueColumnValues: [] };
        }
        // Group data by row fields
        const grouped = data.reduce((acc, item) => {
            const key = pivotState.rowFields.map(field => item[field] || 'N/A').join('|');
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(item);
            return acc;
        }, {});
        // Get unique values for column fields
        const uniqueColumnValues = pivotState.columnFields.length > 0
            ? [...new Set(data.map(item => pivotState.columnFields.map(field => item[field] || 'N/A').join('|')))]
            : ['Total'];
        // Create pivot structure
        const pivotRows = Object.entries(grouped).map(([key, items]) => {
            const rowData = {};
            // Add row field values
            const keyParts = key.split('|');
            pivotState.rowFields.forEach((field, index) => {
                rowData[field] = keyParts[index];
            });
            // Calculate values for each column combination
            uniqueColumnValues.forEach(columnKey => {
                const columnItems = pivotState.columnFields.length > 0
                    ? items.filter(item => {
                        const itemColumnKey = pivotState.columnFields.map(field => item[field] || 'N/A').join('|');
                        return itemColumnKey === columnKey;
                    })
                    : items;
                pivotState.valueFields.forEach(({ field, aggregation }) => {
                    const values = columnItems.map(item => Number(item[field]) || 0).filter(v => !isNaN(v));
                    const columnLabel = pivotState.columnFields.length > 0 ? columnKey : 'Total';
                    const cellKey = `${columnLabel}_${field}_${aggregation}`;
                    if (aggregation === 'sum') {
                        rowData[cellKey] = values.reduce((sum, val) => sum + val, 0);
                    }
                    else if (aggregation === 'avg') {
                        rowData[cellKey] = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
                    }
                    else if (aggregation === 'count') {
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
        return (jsxRuntime.jsx("div", { className: "text-center py-8 text-gray-500 dark:text-gray-400", children: jsxRuntime.jsx("p", { children: "Configure row fields and value fields to see pivot table" }) }));
    }
    const getFieldLabel = (field) => {
        const labels = {
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
    const formatValue = (value, field, aggregation) => {
        if (typeof value !== 'number')
            return value;
        if (field === 'salary') {
            return `$${value.toLocaleString()}`;
        }
        if (aggregation === 'avg') {
            return value.toFixed(1);
        }
        return value.toLocaleString();
    };
    return (jsxRuntime.jsxs("div", { className: "mt-6", children: [jsxRuntime.jsx("h3", { className: "text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100", children: "Pivot Table Results" }), jsxRuntime.jsx("div", { className: "overflow-x-auto border rounded-lg bg-white dark:bg-gray-800", children: jsxRuntime.jsxs("table", { className: "min-w-full divide-y divide-gray-200 dark:divide-gray-700", children: [jsxRuntime.jsx("thead", { className: "bg-gray-50 dark:bg-gray-900", children: jsxRuntime.jsxs("tr", { children: [pivotState.rowFields.map(field => (jsxRuntime.jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: getFieldLabel(field) }, field))), pivotData.uniqueColumnValues.map(columnValue => (pivotState.valueFields.map(({ field, aggregation }) => (jsxRuntime.jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: pivotState.columnFields.length > 0 ? (jsxRuntime.jsxs("div", { children: [jsxRuntime.jsx("div", { className: "font-semibold", children: columnValue }), jsxRuntime.jsxs("div", { className: "text-xs opacity-75", children: [aggregation, "(", getFieldLabel(field), ")"] })] })) : (`${aggregation}(${getFieldLabel(field)})`) }, `${columnValue}_${field}_${aggregation}`)))))] }) }), jsxRuntime.jsx("tbody", { className: "bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700", children: pivotData.rows.map((row, index) => (jsxRuntime.jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-700", children: [pivotState.rowFields.map(field => (jsxRuntime.jsx("td", { className: "px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100", children: jsxRuntime.jsx("span", { className: `px-2 py-1 rounded text-xs ${field === 'department' ? (row[field] === 'Sales' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                row[field] === 'Marketing' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                                    row[field] === 'Engineering' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                        row[field] === 'HR' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                                            row[field] === 'Finance' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                                'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200') : field === 'region' ? (row[field] === 'North' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                row[field] === 'South' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                    row[field] === 'East' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                        row[field] === 'West' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                                            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200') : field === 'performance' ? (row[field] === 'Excellent' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                row[field] === 'Good' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                    row[field] === 'Average' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200') : field === 'status' ? (row[field] === 'Married' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                row[field] === 'Single' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200') : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}`, children: row[field] }) }, field))), pivotData.uniqueColumnValues.map(columnValue => (pivotState.valueFields.map(({ field, aggregation }) => {
                                        const cellKey = `${columnValue}_${field}_${aggregation}`;
                                        const value = row[cellKey];
                                        return (jsxRuntime.jsx("td", { className: "px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100", children: jsxRuntime.jsx("div", { className: "font-medium", children: formatValue(value, field, aggregation) }) }, cellKey));
                                    })))] }, index))) })] }) }), jsxRuntime.jsx("div", { className: "mt-4 text-xs text-gray-500 dark:text-gray-400", children: jsxRuntime.jsxs("p", { children: [jsxRuntime.jsx("strong", { children: "Pivot Summary:" }), " ", pivotData.rows.length, " rows grouped by", ' ', pivotState.rowFields.map(getFieldLabel).join(', '), pivotState.columnFields.length > 0 && (jsxRuntime.jsxs("span", { children: [", pivoted by ", pivotState.columnFields.map(getFieldLabel).join(', ')] }))] }) })] }));
}

function PivotControls({ table }) {
    const [pivotState, setPivotState] = React.useState({
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
    const addRowField = (field) => {
        if (!pivotState.rowFields.includes(field)) {
            setPivotState(prev => ({
                ...prev,
                rowFields: [...prev.rowFields, field]
            }));
        }
    };
    const addColumnField = (field) => {
        if (!pivotState.columnFields.includes(field)) {
            setPivotState(prev => ({
                ...prev,
                columnFields: [...prev.columnFields, field]
            }));
        }
    };
    const addValueField = (field, aggregation) => {
        const exists = pivotState.valueFields.find(v => v.field === field && v.aggregation === aggregation);
        if (!exists) {
            setPivotState(prev => ({
                ...prev,
                valueFields: [...prev.valueFields, { field, aggregation }]
            }));
        }
    };
    const removeField = (type, index) => {
        setPivotState(prev => {
            if (type === 'row') {
                return { ...prev, rowFields: prev.rowFields.filter((_, i) => i !== index) };
            }
            else if (type === 'column') {
                return { ...prev, columnFields: prev.columnFields.filter((_, i) => i !== index) };
            }
            else {
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
            const key = pivotState.rowFields.map(field => item[field] || 'N/A').join('|');
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(item);
            return acc;
        }, {});
        // Create pivot structure
        const pivotData = Object.entries(grouped).map(([key, items]) => {
            const rowData = {};
            // Add row field values
            const keyParts = key.split('|');
            pivotState.rowFields.forEach((field, index) => {
                rowData[field] = keyParts[index];
            });
            // Calculate aggregated values
            pivotState.valueFields.forEach(({ field, aggregation }) => {
                const values = items.map(item => Number(item[field]) || 0).filter(v => !isNaN(v));
                if (aggregation === 'sum') {
                    rowData[`${field}_sum`] = values.reduce((sum, val) => sum + val, 0);
                }
                else if (aggregation === 'avg') {
                    rowData[`${field}_avg`] = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
                }
                else if (aggregation === 'count') {
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
    return (jsxRuntime.jsxs("div", { className: "border rounded-lg p-4 bg-gray-50 dark:bg-gray-800", children: [jsxRuntime.jsx("div", { className: "text-sm font-medium mb-4", children: "Pivot Configuration" }), jsxRuntime.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4", children: [jsxRuntime.jsxs("div", { children: [jsxRuntime.jsx("label", { className: "block text-xs font-medium mb-2", children: "Rows (Group By)" }), jsxRuntime.jsxs("select", { className: "w-full text-xs border rounded px-2 py-1 mb-2", onChange: (e) => e.target.value && addRowField(e.target.value), value: "", children: [jsxRuntime.jsx("option", { value: "", children: "Add row field..." }), availableColumns.map(col => (jsxRuntime.jsx("option", { value: col.id, children: col.label }, col.id)))] }), jsxRuntime.jsx("div", { className: "space-y-1", children: pivotState.rowFields.map((field, index) => (jsxRuntime.jsxs("div", { className: "flex items-center justify-between bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-xs", children: [jsxRuntime.jsx("span", { children: availableColumns.find(c => c.id === field)?.label || field }), jsxRuntime.jsx("button", { onClick: () => removeField('row', index), className: "text-red-500 hover:text-red-700", children: "\u00D7" })] }, index))) })] }), jsxRuntime.jsxs("div", { children: [jsxRuntime.jsx("label", { className: "block text-xs font-medium mb-2", children: "Columns (Pivot By)" }), jsxRuntime.jsxs("select", { className: "w-full text-xs border rounded px-2 py-1 mb-2", onChange: (e) => e.target.value && addColumnField(e.target.value), value: "", children: [jsxRuntime.jsx("option", { value: "", children: "Add column field..." }), availableColumns.map(col => (jsxRuntime.jsx("option", { value: col.id, children: col.label }, col.id)))] }), jsxRuntime.jsx("div", { className: "space-y-1", children: pivotState.columnFields.map((field, index) => (jsxRuntime.jsxs("div", { className: "flex items-center justify-between bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-xs", children: [jsxRuntime.jsx("span", { children: availableColumns.find(c => c.id === field)?.label || field }), jsxRuntime.jsx("button", { onClick: () => removeField('column', index), className: "text-red-500 hover:text-red-700", children: "\u00D7" })] }, index))) })] }), jsxRuntime.jsxs("div", { children: [jsxRuntime.jsx("label", { className: "block text-xs font-medium mb-2", children: "Values (Aggregate)" }), jsxRuntime.jsx("div", { className: "space-y-2 mb-2", children: valueColumns.map(col => (jsxRuntime.jsxs("div", { children: [jsxRuntime.jsx("div", { className: "text-xs font-medium", children: col.label }), jsxRuntime.jsx("div", { className: "flex gap-1", children: col.aggregations.map(agg => (jsxRuntime.jsx("button", { onClick: () => addValueField(col.id, agg), className: "px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600", children: agg }, agg))) })] }, col.id))) }), jsxRuntime.jsx("div", { className: "space-y-1", children: pivotState.valueFields.map((valueField, index) => (jsxRuntime.jsxs("div", { className: "flex items-center justify-between bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded text-xs", children: [jsxRuntime.jsxs("span", { children: [valueField.aggregation, "(", valueColumns.find(c => c.id === valueField.field)?.label || valueField.field, ")"] }), jsxRuntime.jsx("button", { onClick: () => removeField('value', index), className: "text-red-500 hover:text-red-700", children: "\u00D7" })] }, index))) })] })] }), jsxRuntime.jsxs("div", { className: "flex gap-2", children: [jsxRuntime.jsx("button", { onClick: applyPivot, className: "px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600", disabled: pivotState.rowFields.length === 0 || pivotState.valueFields.length === 0, children: "Apply Pivot" }), jsxRuntime.jsx("button", { onClick: () => setPivotState({ rowFields: [], columnFields: [], valueFields: [] }), className: "px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600", children: "Clear All" })] }), (pivotState.rowFields.length > 0 || pivotState.columnFields.length > 0 || pivotState.valueFields.length > 0) && (jsxRuntime.jsx(PivotTableView, { data: tableData, pivotState: pivotState }))] }));
}

/**
 * Main export utility class
 */
class TableExportUtils {
    /**
     * Export table data to CSV format
     */
    static async exportToCSV(data, columns, config = {}) {
        try {
            const { filename = 'table-export', includeHeaders = true, delimiter = ',', quote = '"', quoteAll = false, customHeaders, includeColumns, excludeColumns, dataTransformer, } = config;
            // Filter columns based on include/exclude lists
            const filteredColumns = this.filterColumns(columns, includeColumns, excludeColumns);
            // Transform data if transformer provided
            const processedData = dataTransformer ? dataTransformer(data) : data;
            // Generate CSV content
            const csvContent = this.generateCSVContent(processedData, filteredColumns, {
                includeHeaders,
                delimiter,
                quote,
                quoteAll,
                customHeaders,
            });
            // Download the file
            const finalFilename = `${filename}.csv`;
            this.downloadFile(csvContent, finalFilename, 'text/csv');
            return {
                success: true,
                filename: finalFilename,
                format: 'csv',
                rowCount: processedData.length,
                timestamp: new Date(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                format: 'csv',
                rowCount: 0,
                timestamp: new Date(),
            };
        }
    }
    /**
     * Export table data to Excel format
     */
    static async exportToExcel(data, columns, config = {}) {
        try {
            const { filename = 'table-export', sheetName = 'Sheet1', includeHeaders = true, customHeaders, includeColumns, excludeColumns, dataTransformer, } = config;
            // Filter columns based on include/exclude lists
            const filteredColumns = this.filterColumns(columns, includeColumns, excludeColumns);
            // Transform data if transformer provided
            const processedData = dataTransformer ? dataTransformer(data) : data;
            // Generate Excel workbook
            const workbook = this.generateExcelWorkbook(processedData, filteredColumns, {
                sheetName,
                includeHeaders,
                customHeaders,
            });
            // Download the file
            const finalFilename = `${filename}.xlsx`;
            this.downloadExcelFile(workbook, finalFilename);
            return {
                success: true,
                filename: finalFilename,
                format: 'excel',
                rowCount: processedData.length,
                timestamp: new Date(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                format: 'excel',
                rowCount: 0,
                timestamp: new Date(),
            };
        }
    }
    /**
     * Export table data to JSON format
     */
    static async exportToJSON(data, columns, config = {}) {
        try {
            const { filename = 'table-export', includeColumns, excludeColumns, dataTransformer, } = config;
            // Transform data if transformer provided
            let processedData = dataTransformer ? dataTransformer(data) : data;
            // Filter data based on column selection
            if (includeColumns || excludeColumns) {
                processedData = this.filterDataByColumns(processedData, columns, includeColumns, excludeColumns);
            }
            // Generate JSON content
            const jsonContent = JSON.stringify(processedData, null, 2);
            // Download the file
            const finalFilename = `${filename}.json`;
            this.downloadFile(jsonContent, finalFilename, 'application/json');
            return {
                success: true,
                filename: finalFilename,
                format: 'json',
                rowCount: processedData.length,
                timestamp: new Date(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                format: 'json',
                rowCount: 0,
                timestamp: new Date(),
            };
        }
    }
    /**
     * Generate print-optimized table layout
     */
    static generatePrintLayout(data, columns, config = {}) {
        const { title = 'Table Export', orientation = 'portrait', paperSize = 'A4', includeHeaders = true, includePageNumbers = true, customCSS = '', customHeaders, includeColumns, excludeColumns, } = config;
        // Filter columns based on include/exclude lists
        const filteredColumns = this.filterColumns(columns, includeColumns, excludeColumns);
        // Generate HTML content for printing
        const htmlContent = this.generatePrintHTML(data, filteredColumns, {
            title,
            orientation,
            paperSize,
            includeHeaders,
            includePageNumbers,
            customCSS,
            customHeaders,
        });
        return htmlContent;
    }
    /**
     * Open print dialog with optimized layout
     */
    static async printTable(data, columns, config = {}) {
        try {
            const htmlContent = this.generatePrintLayout(data, columns, config);
            // Create a new window for printing
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                throw new Error('Unable to open print window. Please check popup blocker settings.');
            }
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            // Wait for content to load, then print
            printWindow.onload = () => {
                printWindow.print();
                printWindow.close();
            };
            return {
                success: true,
                format: 'print',
                rowCount: data.length,
                timestamp: new Date(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                format: 'print',
                rowCount: 0,
                timestamp: new Date(),
            };
        }
    }
    /**
     * Export data from TanStack Table instance
     */
    static async exportFromTable(table, format, config = {}) {
        const data = table.getRowModel().rows.map(row => row.original);
        const columns = table.getAllColumns().map(col => col.columnDef);
        switch (format) {
            case 'csv':
                return this.exportToCSV(data, columns, config);
            case 'excel':
                return this.exportToExcel(data, columns, config);
            case 'json':
                return this.exportToJSON(data, columns, config);
            case 'print':
                return this.printTable(data, columns, config);
            default:
                return {
                    success: false,
                    error: `Unsupported export format: ${format}`,
                    format,
                    rowCount: 0,
                    timestamp: new Date(),
                };
        }
    }
    // Private helper methods
    static filterColumns(columns, includeColumns, excludeColumns) {
        let filteredColumns = columns;
        if (includeColumns) {
            filteredColumns = filteredColumns.filter(col => includeColumns.includes(col.id || ''));
        }
        if (excludeColumns) {
            filteredColumns = filteredColumns.filter(col => !excludeColumns.includes(col.id || ''));
        }
        return filteredColumns;
    }
    static filterDataByColumns(data, columns, includeColumns, excludeColumns) {
        const filteredColumns = this.filterColumns(columns, includeColumns, excludeColumns);
        const columnIds = filteredColumns.map(col => col.id).filter(Boolean);
        return data.map(row => {
            const filteredRow = {};
            columnIds.forEach(id => {
                if (id && id in row) {
                    filteredRow[id] = row[id];
                }
            });
            return filteredRow;
        });
    }
    static generateCSVContent(data, columns, options) {
        const { includeHeaders, delimiter, quote, quoteAll, customHeaders } = options;
        const lines = [];
        // Add headers if requested
        if (includeHeaders) {
            const headers = columns.map(col => {
                const headerId = col.id || '';
                const headerText = customHeaders?.[headerId] ||
                    (typeof col.header === 'string' ? col.header : headerId);
                return this.escapeCSVField(headerText, delimiter, quote, quoteAll);
            });
            lines.push(headers.join(delimiter));
        }
        // Add data rows
        data.forEach(row => {
            const values = columns.map(col => {
                const value = this.getCellValue(row, col);
                return this.escapeCSVField(String(value || ''), delimiter, quote, quoteAll);
            });
            lines.push(values.join(delimiter));
        });
        return lines.join('\n');
    }
    static escapeCSVField(field, delimiter, quote, quoteAll) {
        const needsQuoting = quoteAll ||
            field.includes(delimiter) ||
            field.includes(quote) ||
            field.includes('\n') ||
            field.includes('\r');
        if (needsQuoting) {
            const escapedField = field.replace(new RegExp(quote, 'g'), quote + quote);
            return quote + escapedField + quote;
        }
        return field;
    }
    static generateExcelWorkbook(data, columns, options) {
        // This is a simplified Excel generation
        // In a real implementation, you would use a library like xlsx or exceljs
        const { sheetName, includeHeaders, customHeaders } = options;
        const worksheetData = [];
        // Add headers if requested
        if (includeHeaders) {
            const headers = columns.map(col => {
                const headerId = col.id || '';
                return customHeaders?.[headerId] ||
                    (typeof col.header === 'string' ? col.header : headerId);
            });
            worksheetData.push(headers);
        }
        // Add data rows
        data.forEach(row => {
            const values = columns.map(col => this.getCellValue(row, col));
            worksheetData.push(values);
        });
        // Return a simple workbook structure
        // In a real implementation, this would be a proper Excel workbook
        return {
            SheetNames: [sheetName],
            Sheets: {
                [sheetName]: worksheetData
            }
        };
    }
    static generatePrintHTML(data, columns, options) {
        const { title, orientation, paperSize, includeHeaders, includePageNumbers, customCSS, customHeaders } = options;
        const printCSS = `
      <style>
        @page {
          size: ${paperSize} ${orientation};
          margin: 1in;
        }
        
        body {
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          margin: 0;
          padding: 0;
        }
        
        .print-header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
        }
        
        .print-title {
          font-size: 18px;
          font-weight: bold;
          margin: 0;
        }
        
        .print-date {
          font-size: 10px;
          color: #666;
          margin: 5px 0 0 0;
        }
        
        .print-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        .print-table th,
        .print-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          font-size: 11px;
        }
        
        .print-table th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        
        .print-table tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        
        .print-footer {
          position: fixed;
          bottom: 0;
          width: 100%;
          text-align: center;
          font-size: 10px;
          color: #666;
        }
        
        @media print {
          .print-table {
            page-break-inside: auto;
          }
          
          .print-table tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          .print-table thead {
            display: table-header-group;
          }
          
          .print-table tfoot {
            display: table-footer-group;
          }
        }
        
        ${customCSS}
      </style>
    `;
        const headerHTML = `
      <div class="print-header">
        <h1 class="print-title">${title}</h1>
        <p class="print-date">Generated on ${new Date().toLocaleString()}</p>
      </div>
    `;
        const tableHTML = this.generateTableHTML(data, columns, includeHeaders, customHeaders);
        const footerHTML = includePageNumbers ? `
      <div class="print-footer">
        Page <span class="page-number"></span>
      </div>
    ` : '';
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          ${printCSS}
        </head>
        <body>
          ${headerHTML}
          ${tableHTML}
          ${footerHTML}
        </body>
      </html>
    `;
    }
    static generateTableHTML(data, columns, includeHeaders, customHeaders) {
        let html = '<table class="print-table">';
        // Add headers if requested
        if (includeHeaders) {
            html += '<thead><tr>';
            columns.forEach(col => {
                const headerId = col.id || '';
                const headerText = customHeaders?.[headerId] ||
                    (typeof col.header === 'string' ? col.header : headerId);
                html += `<th>${this.escapeHTML(headerText)}</th>`;
            });
            html += '</tr></thead>';
        }
        // Add data rows
        html += '<tbody>';
        data.forEach(row => {
            html += '<tr>';
            columns.forEach(col => {
                const value = this.getCellValue(row, col);
                html += `<td>${this.escapeHTML(String(value || ''))}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody>';
        html += '</table>';
        return html;
    }
    static getCellValue(row, column) {
        // Handle accessor function
        if ('accessorFn' in column && typeof column.accessorFn === 'function') {
            return column.accessorFn(row, 0);
        }
        // Handle accessor key
        if ('accessorKey' in column && column.accessorKey) {
            const key = column.accessorKey;
            return row[key];
        }
        // Handle direct property access via id
        if (column.id && typeof row === 'object' && row !== null) {
            const value = row[column.id];
            if (value !== undefined) {
                return value;
            }
        }
        return '';
    }
    static escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    static downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    static downloadExcelFile(workbook, filename) {
        // This is a simplified implementation
        // In a real implementation, you would use a library like xlsx to generate proper Excel files
        const csvContent = this.convertWorkbookToCSV(workbook);
        this.downloadFile(csvContent, filename.replace('.xlsx', '.csv'), 'text/csv');
    }
    static convertWorkbookToCSV(workbook) {
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        return worksheet.map((row) => row.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    }
}
/**
 * React hook for table export functionality
 */
function useTableExport() {
    const exportToCSV = async (data, columns, config) => {
        return TableExportUtils.exportToCSV(data, columns, config);
    };
    const exportToExcel = async (data, columns, config) => {
        return TableExportUtils.exportToExcel(data, columns, config);
    };
    const exportToJSON = async (data, columns, config) => {
        return TableExportUtils.exportToJSON(data, columns, config);
    };
    const printTable = async (data, columns, config) => {
        return TableExportUtils.printTable(data, columns, config);
    };
    const exportFromTable = async (table, format, config) => {
        return TableExportUtils.exportFromTable(table, format, config);
    };
    return {
        exportToCSV,
        exportToExcel,
        exportToJSON,
        printTable,
        exportFromTable,
    };
}
/**
 * Export configuration builder for fluent API
 */
class ExportConfigBuilder {
    constructor() {
        this.config = {};
    }
    static create() {
        return new ExportConfigBuilder();
    }
    filename(filename) {
        this.config.filename = filename;
        return this;
    }
    includeHeaders(include = true) {
        this.config.includeHeaders = include;
        return this;
    }
    customHeaders(headers) {
        this.config.customHeaders = headers;
        return this;
    }
    includeColumns(columns) {
        this.config.includeColumns = columns;
        return this;
    }
    excludeColumns(columns) {
        this.config.excludeColumns = columns;
        return this;
    }
    dataTransformer(transformer) {
        this.config.dataTransformer = transformer;
        return this;
    }
    build() {
        return { ...this.config };
    }
}
/**
 * CSV-specific configuration builder
 */
class CSVExportConfigBuilder extends ExportConfigBuilder {
    constructor() {
        super(...arguments);
        this.csvConfig = {};
    }
    static create() {
        return new CSVExportConfigBuilder();
    }
    filename(filename) {
        super.filename(filename);
        return this;
    }
    includeHeaders(include = true) {
        super.includeHeaders(include);
        return this;
    }
    customHeaders(headers) {
        super.customHeaders(headers);
        return this;
    }
    includeColumns(columns) {
        super.includeColumns(columns);
        return this;
    }
    excludeColumns(columns) {
        super.excludeColumns(columns);
        return this;
    }
    dataTransformer(transformer) {
        super.dataTransformer(transformer);
        return this;
    }
    delimiter(delimiter) {
        this.csvConfig.delimiter = delimiter;
        return this;
    }
    quote(quote) {
        this.csvConfig.quote = quote;
        return this;
    }
    quoteAll(quoteAll = true) {
        this.csvConfig.quoteAll = quoteAll;
        return this;
    }
    build() {
        return { ...super.build(), ...this.csvConfig };
    }
}
/**
 * Excel-specific configuration builder
 */
class ExcelExportConfigBuilder extends ExportConfigBuilder {
    constructor() {
        super(...arguments);
        this.excelConfig = {};
    }
    static create() {
        return new ExcelExportConfigBuilder();
    }
    filename(filename) {
        super.filename(filename);
        return this;
    }
    includeHeaders(include = true) {
        super.includeHeaders(include);
        return this;
    }
    customHeaders(headers) {
        super.customHeaders(headers);
        return this;
    }
    includeColumns(columns) {
        super.includeColumns(columns);
        return this;
    }
    excludeColumns(columns) {
        super.excludeColumns(columns);
        return this;
    }
    dataTransformer(transformer) {
        super.dataTransformer(transformer);
        return this;
    }
    sheetName(name) {
        this.excelConfig.sheetName = name;
        return this;
    }
    autoFitColumns(autoFit = true) {
        this.excelConfig.autoFitColumns = autoFit;
        return this;
    }
    columnWidths(widths) {
        this.excelConfig.columnWidths = widths;
        return this;
    }
    build() {
        return { ...super.build(), ...this.excelConfig };
    }
}
/**
 * Print-specific configuration builder
 */
class PrintExportConfigBuilder extends ExportConfigBuilder {
    constructor() {
        super(...arguments);
        this.printConfig = {};
    }
    static create() {
        return new PrintExportConfigBuilder();
    }
    filename(filename) {
        super.filename(filename);
        return this;
    }
    includeHeaders(include = true) {
        super.includeHeaders(include);
        return this;
    }
    customHeaders(headers) {
        super.customHeaders(headers);
        return this;
    }
    includeColumns(columns) {
        super.includeColumns(columns);
        return this;
    }
    excludeColumns(columns) {
        super.excludeColumns(columns);
        return this;
    }
    dataTransformer(transformer) {
        super.dataTransformer(transformer);
        return this;
    }
    orientation(orientation) {
        this.printConfig.orientation = orientation;
        return this;
    }
    paperSize(size) {
        this.printConfig.paperSize = size;
        return this;
    }
    title(title) {
        this.printConfig.title = title;
        return this;
    }
    includePageNumbers(include = true) {
        this.printConfig.includePageNumbers = include;
        return this;
    }
    customCSS(css) {
        this.printConfig.customCSS = css;
        return this;
    }
    build() {
        return { ...super.build(), ...this.printConfig };
    }
}

function ExportControls({ table, enabled = true }) {
    const [isExporting, setIsExporting] = React.useState(false);
    const [lastExportResult, setLastExportResult] = React.useState(null);
    const [showAdvanced, setShowAdvanced] = React.useState(false);
    const { exportToCSV, exportToExcel, exportToJSON, printTable, exportFromTable } = useTableExport();
    if (!enabled)
        return null;
    const handleQuickExport = async (format) => {
        setIsExporting(true);
        setLastExportResult(null);
        try {
            const result = await exportFromTable(table, format, {
                filename: `table-export-${new Date().toISOString().split('T')[0]}`,
                includeHeaders: true,
            });
            setLastExportResult(result);
        }
        catch (error) {
            setLastExportResult({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                format,
                rowCount: 0,
                timestamp: new Date(),
            });
        }
        finally {
            setIsExporting(false);
        }
    };
    const handleAdvancedCSVExport = async () => {
        setIsExporting(true);
        setLastExportResult(null);
        try {
            const data = table.getRowModel().rows.map(row => row.original);
            const columns = table.getAllColumns().map(col => col.columnDef);
            const config = CSVExportConfigBuilder.create()
                .filename(`detailed-export-${new Date().toISOString().split('T')[0]}`)
                .delimiter(',')
                .includeHeaders(true)
                .customHeaders({
                firstName: 'First Name',
                lastName: 'Last Name',
                department: 'Department',
                salary: 'Annual Salary (USD)',
                performance: 'Performance Rating',
                joinDate: 'Date Joined',
            })
                .dataTransformer((data) => data.map(item => ({
                ...item,
                // Generic data transformation - users can override this
                ...(typeof item === 'object' && item !== null ? item : {})
            })))
                .build();
            const result = await exportToCSV(data, columns, config);
            setLastExportResult(result);
        }
        catch (error) {
            setLastExportResult({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                format: 'csv',
                rowCount: 0,
                timestamp: new Date(),
            });
        }
        finally {
            setIsExporting(false);
        }
    };
    const handleAdvancedExcelExport = async () => {
        setIsExporting(true);
        setLastExportResult(null);
        try {
            const data = table.getRowModel().rows.map(row => row.original);
            const columns = table.getAllColumns().map(col => col.columnDef);
            const config = ExcelExportConfigBuilder.create()
                .filename(`employee-spreadsheet-${new Date().toISOString().split('T')[0]}`)
                .sheetName('Employee Data')
                .includeHeaders(true)
                .autoFitColumns(true)
                .customHeaders({
                firstName: 'First Name',
                lastName: 'Last Name',
                department: 'Department',
                salary: 'Annual Salary',
                performance: 'Performance Rating',
            })
                .build();
            const result = await exportToExcel(data, columns, config);
            setLastExportResult(result);
        }
        catch (error) {
            setLastExportResult({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                format: 'excel',
                rowCount: 0,
                timestamp: new Date(),
            });
        }
        finally {
            setIsExporting(false);
        }
    };
    const handlePrintExport = async () => {
        setIsExporting(true);
        setLastExportResult(null);
        try {
            const data = table.getRowModel().rows.map(row => row.original);
            const columns = table.getAllColumns().map(col => col.columnDef);
            const config = PrintExportConfigBuilder.create()
                .title('Employee Directory')
                .orientation('landscape')
                .paperSize('A4')
                .includePageNumbers(true)
                .includeHeaders(true)
                .customCSS(`
          .print-table th { 
            background-color: #4f46e5 !important; 
            color: white !important; 
          }
          .print-table td { 
            font-size: 11px !important; 
          }
          .print-table tr:nth-child(even) {
            background-color: #f8f9fa !important;
          }
        `)
                .customHeaders({
                firstName: 'First Name',
                lastName: 'Last Name',
                department: 'Dept.',
                salary: 'Salary',
            })
                .build();
            const result = await printTable(data, columns, config);
            setLastExportResult(result);
        }
        catch (error) {
            setLastExportResult({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                format: 'print',
                rowCount: 0,
                timestamp: new Date(),
            });
        }
        finally {
            setIsExporting(false);
        }
    };
    const selectedRowCount = Object.keys(table.getState().rowSelection || {}).length;
    const totalRowCount = table.getRowModel().rows.length;
    return (jsxRuntime.jsxs("div", { className: "border rounded-lg p-4 bg-white dark:bg-gray-800", children: [jsxRuntime.jsxs("div", { className: "flex items-center justify-between mb-4", children: [jsxRuntime.jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: "Export Data" }), jsxRuntime.jsxs("button", { onClick: () => setShowAdvanced(!showAdvanced), className: "text-sm text-blue-600 dark:text-blue-400 hover:underline", children: [showAdvanced ? 'Hide' : 'Show', " Advanced Options"] })] }), jsxRuntime.jsx("div", { className: "mb-4 text-sm text-gray-600 dark:text-gray-400", children: selectedRowCount > 0 ? (jsxRuntime.jsxs("span", { children: ["Exporting ", selectedRowCount, " selected rows of ", totalRowCount, " total"] })) : (jsxRuntime.jsxs("span", { children: ["Exporting all ", totalRowCount, " rows"] })) }), jsxRuntime.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-4", children: [jsxRuntime.jsxs("button", { onClick: () => handleQuickExport('csv'), disabled: isExporting, className: "flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm", children: [isExporting ? (jsxRuntime.jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" })) : (jsxRuntime.jsx("span", { children: "\uD83D\uDCC4" })), "CSV"] }), jsxRuntime.jsxs("button", { onClick: () => handleQuickExport('excel'), disabled: isExporting, className: "flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm", children: [isExporting ? (jsxRuntime.jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" })) : (jsxRuntime.jsx("span", { children: "\uD83D\uDCCA" })), "Excel"] }), jsxRuntime.jsxs("button", { onClick: () => handleQuickExport('json'), disabled: isExporting, className: "flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm", children: [isExporting ? (jsxRuntime.jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" })) : (jsxRuntime.jsx("span", { children: "\uD83D\uDD27" })), "JSON"] }), jsxRuntime.jsxs("button", { onClick: handlePrintExport, disabled: isExporting, className: "flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm", children: [isExporting ? (jsxRuntime.jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" })) : (jsxRuntime.jsx("span", { children: "\uD83D\uDDA8\uFE0F" })), "Print"] })] }), showAdvanced && (jsxRuntime.jsxs("div", { className: "border-t pt-4", children: [jsxRuntime.jsx("h4", { className: "text-md font-medium mb-3 text-gray-900 dark:text-gray-100", children: "Advanced Export Options" }), jsxRuntime.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3", children: [jsxRuntime.jsx("button", { onClick: handleAdvancedCSVExport, disabled: isExporting, className: "px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm", children: "Enhanced CSV" }), jsxRuntime.jsx("button", { onClick: handleAdvancedExcelExport, disabled: isExporting, className: "px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm", children: "Formatted Excel" }), jsxRuntime.jsx("button", { onClick: () => handleQuickExport('print'), disabled: isExporting, className: "px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm", children: "Custom Print Layout" })] }), jsxRuntime.jsxs("div", { className: "mt-3 text-xs text-gray-500 dark:text-gray-400", children: [jsxRuntime.jsxs("p", { children: [jsxRuntime.jsx("strong", { children: "Enhanced CSV:" }), " Includes formatted salary values and custom headers"] }), jsxRuntime.jsxs("p", { children: [jsxRuntime.jsx("strong", { children: "Formatted Excel:" }), " Auto-fit columns with professional formatting"] }), jsxRuntime.jsxs("p", { children: [jsxRuntime.jsx("strong", { children: "Custom Print:" }), " Landscape layout with custom styling"] })] })] })), lastExportResult && (jsxRuntime.jsxs("div", { className: `mt-4 p-3 rounded-md border ${lastExportResult.success
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                    : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'}`, children: [jsxRuntime.jsxs("div", { className: "flex items-center justify-between", children: [jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [jsxRuntime.jsx("span", { className: `inline-block w-2 h-2 rounded-full ${lastExportResult.success ? 'bg-green-500' : 'bg-red-500'}` }), jsxRuntime.jsxs("span", { className: `text-sm font-medium ${lastExportResult.success
                                            ? 'text-green-800 dark:text-green-200'
                                            : 'text-red-800 dark:text-red-200'}`, children: [lastExportResult.format.toUpperCase(), " Export"] }), lastExportResult.filename && (jsxRuntime.jsxs("span", { className: "text-xs text-gray-600 dark:text-gray-400", children: ["(", lastExportResult.filename, ")"] }))] }), jsxRuntime.jsx("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: lastExportResult.timestamp.toLocaleTimeString() })] }), lastExportResult.success ? (jsxRuntime.jsxs("p", { className: "text-sm text-green-700 dark:text-green-300 mt-1", children: ["Successfully exported ", lastExportResult.rowCount, " rows"] })) : (jsxRuntime.jsxs("p", { className: "text-sm text-red-700 dark:text-red-300 mt-1", children: ["Error: ", lastExportResult.error] }))] }))] }));
}

var M=(e,i,s,u,m,a,l,h)=>{let d=document.documentElement,w=["light","dark"];function p(n){(Array.isArray(e)?e:[e]).forEach(y=>{let k=y==="class",S=k&&a?m.map(f=>a[f]||f):m;k?(d.classList.remove(...S),d.classList.add(a&&a[n]?a[n]:n)):d.setAttribute(y,n);}),R(n);}function R(n){h&&w.includes(n)&&(d.style.colorScheme=n);}function c(){return window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}if(u)p(u);else try{let n=localStorage.getItem(i)||s,y=l&&n==="system"?c():n;p(y);}catch(n){}};var x=React__namespace.createContext(void 0),U={setTheme:e=>{},themes:[]},z=()=>{var e;return (e=React__namespace.useContext(x))!=null?e:U};React__namespace.memo(({forcedTheme:e,storageKey:i,attribute:s,enableSystem:u,enableColorScheme:m,defaultTheme:a,value:l,themes:h,nonce:d,scriptProps:w})=>{let p=JSON.stringify([s,i,a,e,h,l,u,m]).slice(1,-1);return React__namespace.createElement("script",{...w,suppressHydrationWarning:true,nonce:typeof window=="undefined"?d:"",dangerouslySetInnerHTML:{__html:`(${M.toString()})(${p})`}})});

/**
 * Default theme preset - balanced design suitable for most applications
 */
const defaultThemeProperties = {
    // Color system
    '--table-bg-primary': '#ffffff',
    '--table-bg-secondary': '#f8fafc',
    '--table-bg-accent': '#f1f5f9',
    '--table-text-primary': '#1e293b',
    '--table-text-secondary': '#475569',
    '--table-text-muted': '#64748b',
    '--table-border-color': '#e2e8f0',
    '--table-border-hover': '#cbd5e1',
    // Interactive states
    '--table-hover-bg': '#f8fafc',
    '--table-selected-bg': '#dbeafe',
    '--table-focus-ring': '#3b82f6',
    '--table-active-bg': '#e0e7ff',
    // Header styling
    '--table-header-bg': '#f1f5f9',
    '--table-header-text': '#374151',
    '--table-header-border': '#d1d5db',
    // Cell styling
    '--table-cell-padding': '0.75rem',
    '--table-cell-border': '#e5e7eb',
    // Controls and buttons
    '--table-button-bg': '#3b82f6',
    '--table-button-text': '#ffffff',
    '--table-button-hover-bg': '#2563eb',
    '--table-button-border': '#3b82f6',
    // Status colors
    '--table-success-color': '#10b981',
    '--table-warning-color': '#f59e0b',
    '--table-error-color': '#ef4444',
    '--table-info-color': '#3b82f6',
    // Typography
    '--table-font-family': 'system-ui, -apple-system, sans-serif',
    '--table-font-size': '0.875rem',
    '--table-font-weight': '400',
    '--table-line-height': '1.5',
    // Spacing
    '--table-spacing-xs': '0.25rem',
    '--table-spacing-sm': '0.5rem',
    '--table-spacing-md': '0.75rem',
    '--table-spacing-lg': '1rem',
    '--table-spacing-xl': '1.5rem',
    // Border radius
    '--table-border-radius': '0.375rem',
    '--table-border-radius-sm': '0.25rem',
    '--table-border-radius-lg': '0.5rem',
    // Shadows
    '--table-shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '--table-shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    '--table-shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
};
/**
 * Minimal theme preset - clean and simple design with minimal visual elements
 */
const minimalThemeProperties = {
    // Color system
    '--table-bg-primary': '#ffffff',
    '--table-bg-secondary': '#ffffff',
    '--table-bg-accent': '#fafafa',
    '--table-text-primary': '#000000',
    '--table-text-secondary': '#666666',
    '--table-text-muted': '#999999',
    '--table-border-color': '#e0e0e0',
    '--table-border-hover': '#d0d0d0',
    // Interactive states
    '--table-hover-bg': '#fafafa',
    '--table-selected-bg': '#f0f0f0',
    '--table-focus-ring': '#000000',
    '--table-active-bg': '#e8e8e8',
    // Header styling
    '--table-header-bg': '#ffffff',
    '--table-header-text': '#000000',
    '--table-header-border': '#e0e0e0',
    // Cell styling
    '--table-cell-padding': '0.5rem',
    '--table-cell-border': 'transparent',
    // Controls and buttons
    '--table-button-bg': '#000000',
    '--table-button-text': '#ffffff',
    '--table-button-hover-bg': '#333333',
    '--table-button-border': '#000000',
    // Status colors
    '--table-success-color': '#22c55e',
    '--table-warning-color': '#eab308',
    '--table-error-color': '#ef4444',
    '--table-info-color': '#3b82f6',
    // Typography
    '--table-font-family': 'system-ui, -apple-system, sans-serif',
    '--table-font-size': '0.875rem',
    '--table-font-weight': '400',
    '--table-line-height': '1.4',
    // Spacing
    '--table-spacing-xs': '0.25rem',
    '--table-spacing-sm': '0.5rem',
    '--table-spacing-md': '0.75rem',
    '--table-spacing-lg': '1rem',
    '--table-spacing-xl': '1.5rem',
    // Border radius
    '--table-border-radius': '0',
    '--table-border-radius-sm': '0',
    '--table-border-radius-lg': '0',
    // Shadows
    '--table-shadow-sm': 'none',
    '--table-shadow-md': 'none',
    '--table-shadow-lg': 'none',
};
/**
 * Enterprise theme preset - professional design suitable for business applications
 */
const enterpriseThemeProperties = {
    // Color system
    '--table-bg-primary': '#ffffff',
    '--table-bg-secondary': '#f7f8fc',
    '--table-bg-accent': '#eef2ff',
    '--table-text-primary': '#1f2937',
    '--table-text-secondary': '#4b5563',
    '--table-text-muted': '#6b7280',
    '--table-border-color': '#d1d5db',
    '--table-border-hover': '#9ca3af',
    // Interactive states
    '--table-hover-bg': '#f9fafb',
    '--table-selected-bg': '#dbeafe',
    '--table-focus-ring': '#2563eb',
    '--table-active-bg': '#bfdbfe',
    // Header styling
    '--table-header-bg': '#f3f4f6',
    '--table-header-text': '#111827',
    '--table-header-border': '#d1d5db',
    // Cell styling
    '--table-cell-padding': '1rem',
    '--table-cell-border': '#e5e7eb',
    // Controls and buttons
    '--table-button-bg': '#1f2937',
    '--table-button-text': '#ffffff',
    '--table-button-hover-bg': '#374151',
    '--table-button-border': '#1f2937',
    // Status colors
    '--table-success-color': '#059669',
    '--table-warning-color': '#d97706',
    '--table-error-color': '#dc2626',
    '--table-info-color': '#2563eb',
    // Typography
    '--table-font-family': '"Inter", system-ui, -apple-system, sans-serif',
    '--table-font-size': '0.875rem',
    '--table-font-weight': '500',
    '--table-line-height': '1.5',
    // Spacing
    '--table-spacing-xs': '0.25rem',
    '--table-spacing-sm': '0.5rem',
    '--table-spacing-md': '1rem',
    '--table-spacing-lg': '1.25rem',
    '--table-spacing-xl': '2rem',
    // Border radius
    '--table-border-radius': '0.25rem',
    '--table-border-radius-sm': '0.125rem',
    '--table-border-radius-lg': '0.375rem',
    // Shadows
    '--table-shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '--table-shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06)',
    '--table-shadow-lg': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)',
};
/**
 * Dark theme variations for each preset
 */
const darkThemeOverrides = {
    '--table-bg-primary': '#1f2937',
    '--table-bg-secondary': '#111827',
    '--table-bg-accent': '#374151',
    '--table-text-primary': '#f9fafb',
    '--table-text-secondary': '#d1d5db',
    '--table-text-muted': '#9ca3af',
    '--table-border-color': '#4b5563',
    '--table-border-hover': '#6b7280',
    '--table-hover-bg': '#374151',
    '--table-selected-bg': '#1e40af',
    '--table-header-bg': '#374151',
    '--table-header-text': '#f9fafb',
    '--table-header-border': '#4b5563',
    '--table-cell-border': '#4b5563',
};
/**
 * Create dark theme properties by merging base properties with dark overrides
 */
function createDarkTheme(baseProperties) {
    return { ...baseProperties, ...darkThemeOverrides };
}
/**
 * Default theme preset
 */
const DEFAULT_THEME_PRESET = {
    name: 'default',
    description: 'Balanced design suitable for most applications with modern styling and good contrast',
    properties: defaultThemeProperties,
    config: {
        density: 'normal',
        borderStyle: 'subtle',
        cornerRadius: 'medium',
        shadows: 'subtle',
    },
    useCases: [
        'General purpose applications',
        'Admin dashboards',
        'Data visualization tools',
        'Content management systems',
    ],
    compatibleSchemes: ['light', 'dark', 'auto'],
};
/**
 * Minimal theme preset
 */
const MINIMAL_THEME_PRESET = {
    name: 'minimal',
    description: 'Clean and simple design with minimal visual elements, focusing on content',
    properties: minimalThemeProperties,
    config: {
        density: 'compact',
        borderStyle: 'none',
        cornerRadius: 'none',
        shadows: 'none',
    },
    useCases: [
        'Documentation sites',
        'Simple data displays',
        'Minimalist applications',
        'Print-friendly layouts',
    ],
    compatibleSchemes: ['light', 'dark'],
};
/**
 * Enterprise theme preset
 */
const ENTERPRISE_THEME_PRESET = {
    name: 'enterprise',
    description: 'Professional design suitable for business applications with enhanced spacing and typography',
    properties: enterpriseThemeProperties,
    config: {
        density: 'spacious',
        borderStyle: 'prominent',
        cornerRadius: 'small',
        shadows: 'prominent',
    },
    useCases: [
        'Business applications',
        'Financial dashboards',
        'Enterprise software',
        'Professional reporting tools',
    ],
    compatibleSchemes: ['light', 'dark', 'auto'],
};
/**
 * All available theme presets
 */
const THEME_PRESETS = {
    default: DEFAULT_THEME_PRESET,
    minimal: MINIMAL_THEME_PRESET,
    enterprise: ENTERPRISE_THEME_PRESET,
};
/**
 * Get theme preset by name
 */
function getThemePreset(name) {
    return THEME_PRESETS[name];
}
/**
 * Get all available theme preset names
 */
function getThemePresetNames() {
    return Object.keys(THEME_PRESETS);
}
/**
 * Get theme properties with dark mode support
 */
function getThemeProperties(presetName, colorScheme = 'light') {
    const preset = getThemePreset(presetName);
    if (!preset) {
        return defaultThemeProperties;
    }
    return colorScheme === 'dark'
        ? createDarkTheme(preset.properties)
        : preset.properties;
}
/**
 * Create custom theme properties by merging preset with overrides
 */
function createCustomTheme(basePreset, overrides, colorScheme = 'light') {
    const baseProperties = getThemeProperties(basePreset, colorScheme);
    return { ...baseProperties, ...overrides };
}

/**
 * Hook for managing table theme with Next.js theme integration
 */
function useTableTheme(options = {}) {
    let systemTheme = 'light';
    let setSystemTheme = () => { };
    try {
        const themeHook = z();
        systemTheme = themeHook.theme || 'light';
        setSystemTheme = themeHook.setTheme || (() => { });
    }
    catch (error) {
        console.warn('next-themes not properly configured, falling back to light theme');
    }
    // Determine effective color scheme
    const effectiveColorScheme = React.useMemo(() => {
        if (options.colorScheme === 'auto') {
            return systemTheme === 'dark' ? 'dark' : 'light';
        }
        return options.colorScheme || 'light';
    }, [options.colorScheme, systemTheme]);
    // Get theme properties
    const themeProperties = React.useMemo(() => {
        const variant = options.variant || 'default';
        const baseProperties = getThemeProperties(variant, effectiveColorScheme);
        // Merge with custom properties
        return {
            ...baseProperties,
            ...options.customProperties,
        };
    }, [options.variant, effectiveColorScheme, options.customProperties]);
    // Generate CSS class names
    const classNames = React.useMemo(() => {
        const variant = options.variant || 'default';
        const preset = getThemePreset(variant);
        const density = options.themeConfig?.density || preset?.config?.density || 'normal';
        return {
            table: [
                'table-themed',
                `table-theme-${variant}`,
                `table-density-${density}`,
                options.enableTransitions !== false && 'table-transitions',
                options.enableHoverEffects !== false && 'table-hover-effects',
                options.enableFocusIndicators !== false && 'table-focus-indicators',
                options.classNames?.table,
            ].filter(Boolean).join(' '),
            header: [
                'table-header',
                options.classNames?.header,
            ].filter(Boolean).join(' '),
            cell: [
                'table-cell',
                options.classNames?.cell,
            ].filter(Boolean).join(' '),
            row: [
                'table-row',
                options.classNames?.row,
            ].filter(Boolean).join(' '),
            pagination: [
                'table-pagination',
                options.classNames?.pagination,
            ].filter(Boolean).join(' '),
            controls: [
                'table-controls',
                options.classNames?.controls,
            ].filter(Boolean).join(' '),
        };
    }, [options]);
    // Generate inline styles for components
    const styles = React.useMemo(() => {
        return {
            table: {
                ...options.components?.table,
                // Apply theme properties as CSS custom properties
                ...Object.fromEntries(Object.entries(themeProperties).map(([key, value]) => [key, value])),
            },
            header: options.components?.header || {},
            cell: options.components?.cell || {},
            row: options.components?.row || {},
            pagination: options.components?.pagination || {},
            controls: options.components?.controls || {},
        };
    }, [themeProperties, options.components]);
    // Apply global CSS custom properties
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const root = document.documentElement;
            Object.entries(themeProperties).forEach(([property, value]) => {
                root.style.setProperty(property, value);
            });
            return () => {
                // Cleanup on unmount
                Object.keys(themeProperties).forEach(property => {
                    root.style.removeProperty(property);
                });
            };
        }
    }, [themeProperties]);
    // Theme control functions
    const setVariant = (variant) => {
        // This would typically update a parent state or context
        // For now, we'll just log the change
        console.log('Theme variant changed to:', variant);
    };
    const setColorScheme = (scheme) => {
        if (scheme === 'auto') {
            setSystemTheme('system');
        }
        else {
            setSystemTheme(scheme);
        }
    };
    const toggleColorScheme = () => {
        const newScheme = effectiveColorScheme === 'light' ? 'dark' : 'light';
        setColorScheme(newScheme);
    };
    return {
        // Current theme state
        variant: options.variant || 'default',
        colorScheme: effectiveColorScheme,
        properties: themeProperties,
        // CSS utilities
        classNames,
        styles,
        // Theme controls
        setVariant,
        setColorScheme,
        toggleColorScheme,
        // Utility functions
        getThemeProperty: (property) => themeProperties[property],
        createCustomTheme: (overrides) => createCustomTheme(options.variant || 'default', overrides, effectiveColorScheme),
    };
}

const featureList = {
    sorting: "Sorting",
    filtering: "Filtering",
    pagination: "Pagination",
    rowSelection: "Row Selection",
    columnVisibility: "Column Visibility",
    columnResizing: "Column Resizing",
    columnPinning: "Column Pinning",
    rowExpansion: "Row Expansion",
    globalFiltering: "Global Search",
    grouping: "Grouping",
    inlineEditing: "Inline Editing",
    pivoting: "Pivoting",
    virtualization: "Virtualization",
    exporting: "Data Export",
};
function TableControls({ enabled, onToggleFeature, table, globalFilter, onGlobalFilterChange, onDebouncedGlobalFilterChange, rowSelection, theme, }) {
    const { classNames, styles } = useTableTheme(theme);
    return (jsxRuntime.jsxs("div", { className: `${classNames.controls} space-y-4`, style: styles.controls, children: [jsxRuntime.jsxs("div", { className: "space-y-3", children: [jsxRuntime.jsx("h3", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: "Table Features" }), jsxRuntime.jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3", children: Object.entries(featureList).map(([key, label]) => (jsxRuntime.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [jsxRuntime.jsx("input", { type: "checkbox", checked: enabled[key], onChange: () => onToggleFeature(key), className: "rounded" }), jsxRuntime.jsx("span", { className: "text-gray-700 dark:text-gray-300", children: label })] }, key))) })] }), enabled.globalFiltering && (jsxRuntime.jsxs("div", { className: "space-y-2", children: [jsxRuntime.jsx("h3", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: "Global Search" }), jsxRuntime.jsx("input", { type: "text", value: globalFilter, onChange: (e) => {
                            // Update UI immediately for responsiveness
                            onGlobalFilterChange(e.target.value);
                            // Use debounced handler for actual filtering if available
                            if (onDebouncedGlobalFilterChange) {
                                onDebouncedGlobalFilterChange(e.target.value);
                            }
                        }, placeholder: "Search all columns...", className: "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded w-full max-w-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" })] })), enabled.columnVisibility && (jsxRuntime.jsxs("div", { className: "space-y-2", children: [jsxRuntime.jsx("h3", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: "Show/Hide Columns" }), jsxRuntime.jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2", children: table.getAllLeafColumns().map((column) => (jsxRuntime.jsxs("label", { className: "flex items-center gap-2 text-xs cursor-pointer", children: [jsxRuntime.jsx("input", { type: "checkbox", checked: column.getIsVisible(), onChange: column.getToggleVisibilityHandler(), className: "rounded" }), jsxRuntime.jsx("span", { className: "text-gray-700 dark:text-gray-300", children: typeof column.columnDef.header === 'string'
                                        ? column.columnDef.header
                                        : column.id })] }, column.id))) })] })), enabled.rowSelection && Object.keys(rowSelection).length > 0 && (jsxRuntime.jsxs("div", { className: "text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded", children: [Object.keys(rowSelection).length, " row(s) selected"] })), enabled.pivoting && (jsxRuntime.jsxs("div", { className: "space-y-2", children: [jsxRuntime.jsx("h3", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: "Pivot Controls" }), jsxRuntime.jsx(PivotControls, { table: table })] })), enabled.exporting && (jsxRuntime.jsxs("div", { className: "space-y-2", children: [jsxRuntime.jsx("h3", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: "Export Data" }), jsxRuntime.jsx(ExportControls, { table: table, enabled: enabled.exporting })] }))] }));
}

function DragDropArea({ groupedColumns, onGroupChange, onRemoveGroup, allColumns }) {
    const [dragOver, setDragOver] = React.useState(false);
    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };
    const handleDragLeave = () => {
        setDragOver(false);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const columnId = e.dataTransfer.getData("text/plain");
        if (columnId && !groupedColumns.includes(columnId)) {
            onGroupChange(columnId);
        }
    };
    return (jsxRuntime.jsxs("div", { className: "mb-4", children: [jsxRuntime.jsx("div", { className: "text-sm font-medium mb-2", children: "Grouping Area" }), jsxRuntime.jsx("div", { className: `min-h-16 border-2 border-dashed rounded-lg p-4 transition-colors ${dragOver
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-600"}`, onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop, children: groupedColumns.length === 0 ? (jsxRuntime.jsx("div", { className: "text-gray-500 text-sm text-center", children: "Drag column headers here to group by them" })) : (jsxRuntime.jsx("div", { className: "flex flex-wrap gap-2", children: groupedColumns.map((columnId) => {
                        const column = allColumns.find(col => col.id === columnId);
                        const headerText = typeof column?.columnDef.header === 'string'
                            ? column.columnDef.header
                            : columnId;
                        return (jsxRuntime.jsxs("div", { className: "flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm", children: [jsxRuntime.jsx("span", { children: headerText }), jsxRuntime.jsx("button", { onClick: () => onRemoveGroup(columnId), className: "hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full w-4 h-4 flex items-center justify-center text-xs", children: "\u00D7" })] }, columnId));
                    }) })) })] }));
}
function DraggableColumnHeader({ children, columnId, canGroup }) {
    const handleDragStart = (e) => {
        e.dataTransfer.setData("text/plain", columnId);
    };
    return (jsxRuntime.jsx("div", { draggable: canGroup, onDragStart: handleDragStart, className: canGroup ? "cursor-grab active:cursor-grabbing" : "", children: children }));
}

function useKeyboardNavigation({ table, enabled = true }) {
    const tableRef = React.useRef(null);
    const currentCellRef = React.useRef({ rowIndex: 0, columnIndex: 0 });
    const getCellElement = React.useCallback((rowIndex, columnIndex) => {
        if (!tableRef.current)
            return null;
        const tbody = tableRef.current.querySelector('tbody');
        if (!tbody)
            return null;
        const row = tbody.children[rowIndex];
        if (!row)
            return null;
        const cell = row.children[columnIndex];
        if (!cell)
            return null;
        // Look for focusable element within the cell - prioritize editable elements
        const focusableElement = cell.querySelector('span[role="button"], input, select, button, [tabindex="0"]');
        return focusableElement || cell;
    }, []);
    const focusCell = React.useCallback((rowIndex, columnIndex) => {
        const cellElement = getCellElement(rowIndex, columnIndex);
        if (cellElement) {
            cellElement.focus();
            currentCellRef.current = { rowIndex, columnIndex };
        }
    }, [getCellElement]);
    const moveToCell = React.useCallback((direction) => {
        const { rowIndex, columnIndex } = currentCellRef.current;
        const rows = table.getRowModel().rows;
        const columns = table.getVisibleLeafColumns();
        let newRowIndex = rowIndex;
        let newColumnIndex = columnIndex;
        switch (direction) {
            case 'up':
                newRowIndex = Math.max(0, rowIndex - 1);
                break;
            case 'down':
                newRowIndex = Math.min(rows.length - 1, rowIndex + 1);
                break;
            case 'left':
                newColumnIndex = Math.max(0, columnIndex - 1);
                break;
            case 'right':
                newColumnIndex = Math.min(columns.length - 1, columnIndex + 1);
                break;
        }
        if (newRowIndex !== rowIndex || newColumnIndex !== columnIndex) {
            focusCell(newRowIndex, newColumnIndex);
        }
    }, [table, focusCell]);
    const handleKeyDown = React.useCallback((e) => {
        if (!enabled || !tableRef.current)
            return;
        // Only handle navigation if focus is within the table
        if (!tableRef.current.contains(document.activeElement))
            return;
        // Don't interfere with input editing
        if (document.activeElement?.tagName === 'INPUT' ||
            document.activeElement?.tagName === 'SELECT' ||
            document.activeElement?.tagName === 'TEXTAREA') {
            return;
        }
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                moveToCell('up');
                break;
            case 'ArrowDown':
                e.preventDefault();
                moveToCell('down');
                break;
            case 'ArrowLeft':
                e.preventDefault();
                moveToCell('left');
                break;
            case 'ArrowRight':
                e.preventDefault();
                moveToCell('right');
                break;
            case 'Home':
                e.preventDefault();
                if (e.ctrlKey) {
                    // Ctrl+Home: Go to first cell
                    focusCell(0, 0);
                }
                else {
                    // Home: Go to first column of current row
                    focusCell(currentCellRef.current.rowIndex, 0);
                }
                break;
            case 'End':
                e.preventDefault();
                if (e.ctrlKey) {
                    // Ctrl+End: Go to last cell
                    const rows = table.getRowModel().rows;
                    const columns = table.getVisibleLeafColumns();
                    focusCell(rows.length - 1, columns.length - 1);
                }
                else {
                    // End: Go to last column of current row
                    const columns = table.getVisibleLeafColumns();
                    focusCell(currentCellRef.current.rowIndex, columns.length - 1);
                }
                break;
            case 'PageUp':
                e.preventDefault();
                moveToCell('up'); // Could be enhanced to move multiple rows
                break;
            case 'PageDown':
                e.preventDefault();
                moveToCell('down'); // Could be enhanced to move multiple rows
                break;
        }
    }, [enabled, moveToCell, focusCell, table]);
    React.useEffect(() => {
        if (enabled) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [enabled, handleKeyDown]);
    // Initialize focus on first cell when table loads
    React.useEffect(() => {
        if (enabled && table.getRowModel().rows.length > 0) {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                focusCell(0, 0);
            }, 100);
        }
    }, [enabled, table.getRowModel().rows.length, focusCell]);
    return {
        tableRef,
        focusCell,
        currentCell: currentCellRef.current,
    };
}

function EnhancedTableView({ table, features, theme }) {
    const { classNames, styles } = useTableTheme(theme);
    const { tableRef } = useKeyboardNavigation({
        table,
        enabled: true // Always enable keyboard navigation
    });
    return (jsxRuntime.jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden", children: jsxRuntime.jsx("div", { className: "overflow-auto", children: jsxRuntime.jsxs("table", { ref: tableRef, className: "w-full border-collapse", style: {
                    width: features.columnResizing ? table.getCenterTotalSize() : undefined,
                }, children: [jsxRuntime.jsxs("thead", { className: "bg-gray-50 dark:bg-gray-700", children: [table.getHeaderGroups().map((headerGroup) => (jsxRuntime.jsx("tr", { className: "border-b border-gray-200 dark:border-gray-600", children: headerGroup.headers.map((header) => (jsxRuntime.jsxs("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600 last:border-r-0", style: {
                                        width: features.columnResizing ? header.getSize() : undefined,
                                        position: features.columnPinning && header.column.getIsPinned() ? 'sticky' : undefined,
                                        left: features.columnPinning && header.column.getIsPinned() === 'left' ? header.column.getStart('left') : undefined,
                                        right: features.columnPinning && header.column.getIsPinned() === 'right' ? header.column.getAfter('right') : undefined,
                                        zIndex: features.columnPinning && header.column.getIsPinned() ? 1 : undefined,
                                    }, children: [header.isPlaceholder ? null : (jsxRuntime.jsx(DraggableColumnHeader, { columnId: header.column.id, canGroup: features.grouping && header.column.getCanGroup(), children: jsxRuntime.jsxs("div", { className: "flex items-center justify-between", children: [jsxRuntime.jsxs("div", { className: features.sorting ? "cursor-pointer select-none flex items-center" : "flex items-center",
                                                        onClick: features.sorting ? header.column.getToggleSortingHandler() : undefined, children: [features.grouping && header.column.getCanGroup() && (jsxRuntime.jsx("button", { onClick: header.column.getToggleGroupingHandler(), className: "mr-2 px-1 py-0.5 text-xs border rounded", children: header.column.getIsGrouped() ? '🛑' : '👥' })), flexRender(header.column.columnDef.header, header.getContext()), features.sorting && ({
                                                                asc: " 🔼",
                                                                desc: " 🔽",
                                                            }[header.column.getIsSorted()] ?? null)] }), features.columnPinning && (jsxRuntime.jsxs("div", { className: "flex gap-1", children: [jsxRuntime.jsx("button", { onClick: () => header.column.pin('left'), className: "text-xs px-1 hover:bg-gray-200 dark:hover:bg-gray-700", children: "\uD83D\uDCCCL" }), jsxRuntime.jsx("button", { onClick: () => header.column.pin('right'), className: "text-xs px-1 hover:bg-gray-200 dark:hover:bg-gray-700", children: "\uD83D\uDCCCR" }), jsxRuntime.jsx("button", { onClick: () => header.column.pin(false), className: "text-xs px-1 hover:bg-gray-200 dark:hover:bg-gray-700", children: "\u274C" })] }))] }) })), features.columnResizing && (jsxRuntime.jsx("div", { onMouseDown: header.getResizeHandler(), onTouchStart: header.getResizeHandler(), className: "absolute right-0 top-0 h-full w-1 bg-gray-300 cursor-col-resize hover:bg-blue-500" }))] }, header.id))) }, headerGroup.id))), features.filtering && (jsxRuntime.jsx("tr", { className: "bg-gray-25 dark:bg-gray-750", children: table.getHeaderGroups()[0].headers.map((header) => (jsxRuntime.jsx("th", { className: "px-4 py-2 border-r border-gray-200 dark:border-gray-600 last:border-r-0", children: header.column.getCanFilter() ? (jsxRuntime.jsx("input", { className: "w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100", value: (header.column.getFilterValue() ?? ""), onChange: (e) => header.column.setFilterValue(e.target.value), placeholder: `Filter ${header.column.columnDef.header}...` })) : null }, header.id))) }))] }), jsxRuntime.jsx("tbody", { className: "bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700", children: table.getRowModel().rows.map((row, index) => (jsxRuntime.jsx("tr", { className: `
                ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'}
                ${features.rowSelection && row.getIsSelected() ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''}
                hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150
              `, children: row.getVisibleCells().map((cell) => (jsxRuntime.jsx("td", { className: "px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-600 last:border-r-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-blue-50 dark:focus:bg-blue-900/20", tabIndex: 0, style: {
                                    position: features.columnPinning && cell.column.getIsPinned() ? 'sticky' : undefined,
                                    left: features.columnPinning && cell.column.getIsPinned() === 'left' ? cell.column.getStart('left') : undefined,
                                    right: features.columnPinning && cell.column.getIsPinned() === 'right' ? cell.column.getAfter('right') : undefined,
                                    zIndex: features.columnPinning && cell.column.getIsPinned() ? 1 : undefined,
                                    backgroundColor: features.columnPinning && cell.column.getIsPinned() ? 'inherit' : undefined,
                                }, children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id))) }, row.id))) })] }) }) }));
}

function memo(getDeps, fn, opts) {
  let deps = opts.initialDeps ?? [];
  let result;
  function memoizedFunction() {
    var _a, _b, _c, _d;
    let depTime;
    if (opts.key && ((_a = opts.debug) == null ? void 0 : _a.call(opts))) depTime = Date.now();
    const newDeps = getDeps();
    const depsChanged = newDeps.length !== deps.length || newDeps.some((dep, index) => deps[index] !== dep);
    if (!depsChanged) {
      return result;
    }
    deps = newDeps;
    let resultTime;
    if (opts.key && ((_b = opts.debug) == null ? void 0 : _b.call(opts))) resultTime = Date.now();
    result = fn(...newDeps);
    if (opts.key && ((_c = opts.debug) == null ? void 0 : _c.call(opts))) {
      const depEndTime = Math.round((Date.now() - depTime) * 100) / 100;
      const resultEndTime = Math.round((Date.now() - resultTime) * 100) / 100;
      const resultFpsPercentage = resultEndTime / 16;
      const pad = (str, num) => {
        str = String(str);
        while (str.length < num) {
          str = " " + str;
        }
        return str;
      };
      console.info(
        `%c⏱ ${pad(resultEndTime, 5)} /${pad(depEndTime, 5)} ms`,
        `
            font-size: .6rem;
            font-weight: bold;
            color: hsl(${Math.max(
          0,
          Math.min(120 - 120 * resultFpsPercentage, 120)
        )}deg 100% 31%);`,
        opts == null ? void 0 : opts.key
      );
    }
    (_d = opts == null ? void 0 : opts.onChange) == null ? void 0 : _d.call(opts, result);
    return result;
  }
  memoizedFunction.updateDeps = (newDeps) => {
    deps = newDeps;
  };
  return memoizedFunction;
}
function notUndefined(value, msg) {
  if (value === void 0) {
    throw new Error(`Unexpected undefined${""}`);
  } else {
    return value;
  }
}
const approxEqual = (a, b) => Math.abs(a - b) < 1.01;
const debounce = (targetWindow, fn, ms) => {
  let timeoutId;
  return function(...args) {
    targetWindow.clearTimeout(timeoutId);
    timeoutId = targetWindow.setTimeout(() => fn.apply(this, args), ms);
  };
};

const getRect = (element) => {
  const { offsetWidth, offsetHeight } = element;
  return { width: offsetWidth, height: offsetHeight };
};
const defaultKeyExtractor = (index) => index;
const defaultRangeExtractor = (range) => {
  const start = Math.max(range.startIndex - range.overscan, 0);
  const end = Math.min(range.endIndex + range.overscan, range.count - 1);
  const arr = [];
  for (let i = start; i <= end; i++) {
    arr.push(i);
  }
  return arr;
};
const observeElementRect = (instance, cb) => {
  const element = instance.scrollElement;
  if (!element) {
    return;
  }
  const targetWindow = instance.targetWindow;
  if (!targetWindow) {
    return;
  }
  const handler = (rect) => {
    const { width, height } = rect;
    cb({ width: Math.round(width), height: Math.round(height) });
  };
  handler(getRect(element));
  if (!targetWindow.ResizeObserver) {
    return () => {
    };
  }
  const observer = new targetWindow.ResizeObserver((entries) => {
    const run = () => {
      const entry = entries[0];
      if (entry == null ? void 0 : entry.borderBoxSize) {
        const box = entry.borderBoxSize[0];
        if (box) {
          handler({ width: box.inlineSize, height: box.blockSize });
          return;
        }
      }
      handler(getRect(element));
    };
    instance.options.useAnimationFrameWithResizeObserver ? requestAnimationFrame(run) : run();
  });
  observer.observe(element, { box: "border-box" });
  return () => {
    observer.unobserve(element);
  };
};
const addEventListenerOptions = {
  passive: true
};
const supportsScrollend = typeof window == "undefined" ? true : "onscrollend" in window;
const observeElementOffset = (instance, cb) => {
  const element = instance.scrollElement;
  if (!element) {
    return;
  }
  const targetWindow = instance.targetWindow;
  if (!targetWindow) {
    return;
  }
  let offset = 0;
  const fallback = instance.options.useScrollendEvent && supportsScrollend ? () => void 0 : debounce(
    targetWindow,
    () => {
      cb(offset, false);
    },
    instance.options.isScrollingResetDelay
  );
  const createHandler = (isScrolling) => () => {
    const { horizontal, isRtl } = instance.options;
    offset = horizontal ? element["scrollLeft"] * (isRtl && -1 || 1) : element["scrollTop"];
    fallback();
    cb(offset, isScrolling);
  };
  const handler = createHandler(true);
  const endHandler = createHandler(false);
  endHandler();
  element.addEventListener("scroll", handler, addEventListenerOptions);
  const registerScrollendEvent = instance.options.useScrollendEvent && supportsScrollend;
  if (registerScrollendEvent) {
    element.addEventListener("scrollend", endHandler, addEventListenerOptions);
  }
  return () => {
    element.removeEventListener("scroll", handler);
    if (registerScrollendEvent) {
      element.removeEventListener("scrollend", endHandler);
    }
  };
};
const measureElement = (element, entry, instance) => {
  if (entry == null ? void 0 : entry.borderBoxSize) {
    const box = entry.borderBoxSize[0];
    if (box) {
      const size = Math.round(
        box[instance.options.horizontal ? "inlineSize" : "blockSize"]
      );
      return size;
    }
  }
  return element[instance.options.horizontal ? "offsetWidth" : "offsetHeight"];
};
const elementScroll = (offset, {
  adjustments = 0,
  behavior
}, instance) => {
  var _a, _b;
  const toOffset = offset + adjustments;
  (_b = (_a = instance.scrollElement) == null ? void 0 : _a.scrollTo) == null ? void 0 : _b.call(_a, {
    [instance.options.horizontal ? "left" : "top"]: toOffset,
    behavior
  });
};
class Virtualizer {
  constructor(opts) {
    this.unsubs = [];
    this.scrollElement = null;
    this.targetWindow = null;
    this.isScrolling = false;
    this.measurementsCache = [];
    this.itemSizeCache = /* @__PURE__ */ new Map();
    this.pendingMeasuredCacheIndexes = [];
    this.scrollRect = null;
    this.scrollOffset = null;
    this.scrollDirection = null;
    this.scrollAdjustments = 0;
    this.elementsCache = /* @__PURE__ */ new Map();
    this.observer = /* @__PURE__ */ (() => {
      let _ro = null;
      const get = () => {
        if (_ro) {
          return _ro;
        }
        if (!this.targetWindow || !this.targetWindow.ResizeObserver) {
          return null;
        }
        return _ro = new this.targetWindow.ResizeObserver((entries) => {
          entries.forEach((entry) => {
            const run = () => {
              this._measureElement(entry.target, entry);
            };
            this.options.useAnimationFrameWithResizeObserver ? requestAnimationFrame(run) : run();
          });
        });
      };
      return {
        disconnect: () => {
          var _a;
          (_a = get()) == null ? void 0 : _a.disconnect();
          _ro = null;
        },
        observe: (target) => {
          var _a;
          return (_a = get()) == null ? void 0 : _a.observe(target, { box: "border-box" });
        },
        unobserve: (target) => {
          var _a;
          return (_a = get()) == null ? void 0 : _a.unobserve(target);
        }
      };
    })();
    this.range = null;
    this.setOptions = (opts2) => {
      Object.entries(opts2).forEach(([key, value]) => {
        if (typeof value === "undefined") delete opts2[key];
      });
      this.options = {
        debug: false,
        initialOffset: 0,
        overscan: 1,
        paddingStart: 0,
        paddingEnd: 0,
        scrollPaddingStart: 0,
        scrollPaddingEnd: 0,
        horizontal: false,
        getItemKey: defaultKeyExtractor,
        rangeExtractor: defaultRangeExtractor,
        onChange: () => {
        },
        measureElement,
        initialRect: { width: 0, height: 0 },
        scrollMargin: 0,
        gap: 0,
        indexAttribute: "data-index",
        initialMeasurementsCache: [],
        lanes: 1,
        isScrollingResetDelay: 150,
        enabled: true,
        isRtl: false,
        useScrollendEvent: false,
        useAnimationFrameWithResizeObserver: false,
        ...opts2
      };
    };
    this.notify = (sync) => {
      var _a, _b;
      (_b = (_a = this.options).onChange) == null ? void 0 : _b.call(_a, this, sync);
    };
    this.maybeNotify = memo(
      () => {
        this.calculateRange();
        return [
          this.isScrolling,
          this.range ? this.range.startIndex : null,
          this.range ? this.range.endIndex : null
        ];
      },
      (isScrolling) => {
        this.notify(isScrolling);
      },
      {
        key: process.env.NODE_ENV !== "production" && "maybeNotify",
        debug: () => this.options.debug,
        initialDeps: [
          this.isScrolling,
          this.range ? this.range.startIndex : null,
          this.range ? this.range.endIndex : null
        ]
      }
    );
    this.cleanup = () => {
      this.unsubs.filter(Boolean).forEach((d) => d());
      this.unsubs = [];
      this.observer.disconnect();
      this.scrollElement = null;
      this.targetWindow = null;
    };
    this._didMount = () => {
      return () => {
        this.cleanup();
      };
    };
    this._willUpdate = () => {
      var _a;
      const scrollElement = this.options.enabled ? this.options.getScrollElement() : null;
      if (this.scrollElement !== scrollElement) {
        this.cleanup();
        if (!scrollElement) {
          this.maybeNotify();
          return;
        }
        this.scrollElement = scrollElement;
        if (this.scrollElement && "ownerDocument" in this.scrollElement) {
          this.targetWindow = this.scrollElement.ownerDocument.defaultView;
        } else {
          this.targetWindow = ((_a = this.scrollElement) == null ? void 0 : _a.window) ?? null;
        }
        this.elementsCache.forEach((cached) => {
          this.observer.observe(cached);
        });
        this._scrollToOffset(this.getScrollOffset(), {
          adjustments: void 0,
          behavior: void 0
        });
        this.unsubs.push(
          this.options.observeElementRect(this, (rect) => {
            this.scrollRect = rect;
            this.maybeNotify();
          })
        );
        this.unsubs.push(
          this.options.observeElementOffset(this, (offset, isScrolling) => {
            this.scrollAdjustments = 0;
            this.scrollDirection = isScrolling ? this.getScrollOffset() < offset ? "forward" : "backward" : null;
            this.scrollOffset = offset;
            this.isScrolling = isScrolling;
            this.maybeNotify();
          })
        );
      }
    };
    this.getSize = () => {
      if (!this.options.enabled) {
        this.scrollRect = null;
        return 0;
      }
      this.scrollRect = this.scrollRect ?? this.options.initialRect;
      return this.scrollRect[this.options.horizontal ? "width" : "height"];
    };
    this.getScrollOffset = () => {
      if (!this.options.enabled) {
        this.scrollOffset = null;
        return 0;
      }
      this.scrollOffset = this.scrollOffset ?? (typeof this.options.initialOffset === "function" ? this.options.initialOffset() : this.options.initialOffset);
      return this.scrollOffset;
    };
    this.getFurthestMeasurement = (measurements, index) => {
      const furthestMeasurementsFound = /* @__PURE__ */ new Map();
      const furthestMeasurements = /* @__PURE__ */ new Map();
      for (let m = index - 1; m >= 0; m--) {
        const measurement = measurements[m];
        if (furthestMeasurementsFound.has(measurement.lane)) {
          continue;
        }
        const previousFurthestMeasurement = furthestMeasurements.get(
          measurement.lane
        );
        if (previousFurthestMeasurement == null || measurement.end > previousFurthestMeasurement.end) {
          furthestMeasurements.set(measurement.lane, measurement);
        } else if (measurement.end < previousFurthestMeasurement.end) {
          furthestMeasurementsFound.set(measurement.lane, true);
        }
        if (furthestMeasurementsFound.size === this.options.lanes) {
          break;
        }
      }
      return furthestMeasurements.size === this.options.lanes ? Array.from(furthestMeasurements.values()).sort((a, b) => {
        if (a.end === b.end) {
          return a.index - b.index;
        }
        return a.end - b.end;
      })[0] : void 0;
    };
    this.getMeasurementOptions = memo(
      () => [
        this.options.count,
        this.options.paddingStart,
        this.options.scrollMargin,
        this.options.getItemKey,
        this.options.enabled
      ],
      (count, paddingStart, scrollMargin, getItemKey, enabled) => {
        this.pendingMeasuredCacheIndexes = [];
        return {
          count,
          paddingStart,
          scrollMargin,
          getItemKey,
          enabled
        };
      },
      {
        key: false
      }
    );
    this.getMeasurements = memo(
      () => [this.getMeasurementOptions(), this.itemSizeCache],
      ({ count, paddingStart, scrollMargin, getItemKey, enabled }, itemSizeCache) => {
        if (!enabled) {
          this.measurementsCache = [];
          this.itemSizeCache.clear();
          return [];
        }
        if (this.measurementsCache.length === 0) {
          this.measurementsCache = this.options.initialMeasurementsCache;
          this.measurementsCache.forEach((item) => {
            this.itemSizeCache.set(item.key, item.size);
          });
        }
        const min = this.pendingMeasuredCacheIndexes.length > 0 ? Math.min(...this.pendingMeasuredCacheIndexes) : 0;
        this.pendingMeasuredCacheIndexes = [];
        const measurements = this.measurementsCache.slice(0, min);
        for (let i = min; i < count; i++) {
          const key = getItemKey(i);
          const furthestMeasurement = this.options.lanes === 1 ? measurements[i - 1] : this.getFurthestMeasurement(measurements, i);
          const start = furthestMeasurement ? furthestMeasurement.end + this.options.gap : paddingStart + scrollMargin;
          const measuredSize = itemSizeCache.get(key);
          const size = typeof measuredSize === "number" ? measuredSize : this.options.estimateSize(i);
          const end = start + size;
          const lane = furthestMeasurement ? furthestMeasurement.lane : i % this.options.lanes;
          measurements[i] = {
            index: i,
            start,
            size,
            end,
            key,
            lane
          };
        }
        this.measurementsCache = measurements;
        return measurements;
      },
      {
        key: process.env.NODE_ENV !== "production" && "getMeasurements",
        debug: () => this.options.debug
      }
    );
    this.calculateRange = memo(
      () => [
        this.getMeasurements(),
        this.getSize(),
        this.getScrollOffset(),
        this.options.lanes
      ],
      (measurements, outerSize, scrollOffset, lanes) => {
        return this.range = measurements.length > 0 && outerSize > 0 ? calculateRange({
          measurements,
          outerSize,
          scrollOffset,
          lanes
        }) : null;
      },
      {
        key: process.env.NODE_ENV !== "production" && "calculateRange",
        debug: () => this.options.debug
      }
    );
    this.getVirtualIndexes = memo(
      () => {
        let startIndex = null;
        let endIndex = null;
        const range = this.calculateRange();
        if (range) {
          startIndex = range.startIndex;
          endIndex = range.endIndex;
        }
        this.maybeNotify.updateDeps([this.isScrolling, startIndex, endIndex]);
        return [
          this.options.rangeExtractor,
          this.options.overscan,
          this.options.count,
          startIndex,
          endIndex
        ];
      },
      (rangeExtractor, overscan, count, startIndex, endIndex) => {
        return startIndex === null || endIndex === null ? [] : rangeExtractor({
          startIndex,
          endIndex,
          overscan,
          count
        });
      },
      {
        key: process.env.NODE_ENV !== "production" && "getVirtualIndexes",
        debug: () => this.options.debug
      }
    );
    this.indexFromElement = (node) => {
      const attributeName = this.options.indexAttribute;
      const indexStr = node.getAttribute(attributeName);
      if (!indexStr) {
        console.warn(
          `Missing attribute name '${attributeName}={index}' on measured element.`
        );
        return -1;
      }
      return parseInt(indexStr, 10);
    };
    this._measureElement = (node, entry) => {
      const index = this.indexFromElement(node);
      const item = this.measurementsCache[index];
      if (!item) {
        return;
      }
      const key = item.key;
      const prevNode = this.elementsCache.get(key);
      if (prevNode !== node) {
        if (prevNode) {
          this.observer.unobserve(prevNode);
        }
        this.observer.observe(node);
        this.elementsCache.set(key, node);
      }
      if (node.isConnected) {
        this.resizeItem(index, this.options.measureElement(node, entry, this));
      }
    };
    this.resizeItem = (index, size) => {
      const item = this.measurementsCache[index];
      if (!item) {
        return;
      }
      const itemSize = this.itemSizeCache.get(item.key) ?? item.size;
      const delta = size - itemSize;
      if (delta !== 0) {
        if (this.shouldAdjustScrollPositionOnItemSizeChange !== void 0 ? this.shouldAdjustScrollPositionOnItemSizeChange(item, delta, this) : item.start < this.getScrollOffset() + this.scrollAdjustments) {
          if (process.env.NODE_ENV !== "production" && this.options.debug) {
            console.info("correction", delta);
          }
          this._scrollToOffset(this.getScrollOffset(), {
            adjustments: this.scrollAdjustments += delta,
            behavior: void 0
          });
        }
        this.pendingMeasuredCacheIndexes.push(item.index);
        this.itemSizeCache = new Map(this.itemSizeCache.set(item.key, size));
        this.notify(false);
      }
    };
    this.measureElement = (node) => {
      if (!node) {
        this.elementsCache.forEach((cached, key) => {
          if (!cached.isConnected) {
            this.observer.unobserve(cached);
            this.elementsCache.delete(key);
          }
        });
        return;
      }
      this._measureElement(node, void 0);
    };
    this.getVirtualItems = memo(
      () => [this.getVirtualIndexes(), this.getMeasurements()],
      (indexes, measurements) => {
        const virtualItems = [];
        for (let k = 0, len = indexes.length; k < len; k++) {
          const i = indexes[k];
          const measurement = measurements[i];
          virtualItems.push(measurement);
        }
        return virtualItems;
      },
      {
        key: process.env.NODE_ENV !== "production" && "getVirtualItems",
        debug: () => this.options.debug
      }
    );
    this.getVirtualItemForOffset = (offset) => {
      const measurements = this.getMeasurements();
      if (measurements.length === 0) {
        return void 0;
      }
      return notUndefined(
        measurements[findNearestBinarySearch(
          0,
          measurements.length - 1,
          (index) => notUndefined(measurements[index]).start,
          offset
        )]
      );
    };
    this.getOffsetForAlignment = (toOffset, align, itemSize = 0) => {
      const size = this.getSize();
      const scrollOffset = this.getScrollOffset();
      if (align === "auto") {
        align = toOffset >= scrollOffset + size ? "end" : "start";
      }
      if (align === "center") {
        toOffset += (itemSize - size) / 2;
      } else if (align === "end") {
        toOffset -= size;
      }
      const maxOffset = this.getTotalSize() + this.options.scrollMargin - size;
      return Math.max(Math.min(maxOffset, toOffset), 0);
    };
    this.getOffsetForIndex = (index, align = "auto") => {
      index = Math.max(0, Math.min(index, this.options.count - 1));
      const item = this.measurementsCache[index];
      if (!item) {
        return void 0;
      }
      const size = this.getSize();
      const scrollOffset = this.getScrollOffset();
      if (align === "auto") {
        if (item.end >= scrollOffset + size - this.options.scrollPaddingEnd) {
          align = "end";
        } else if (item.start <= scrollOffset + this.options.scrollPaddingStart) {
          align = "start";
        } else {
          return [scrollOffset, align];
        }
      }
      const toOffset = align === "end" ? item.end + this.options.scrollPaddingEnd : item.start - this.options.scrollPaddingStart;
      return [
        this.getOffsetForAlignment(toOffset, align, item.size),
        align
      ];
    };
    this.isDynamicMode = () => this.elementsCache.size > 0;
    this.scrollToOffset = (toOffset, { align = "start", behavior } = {}) => {
      if (behavior === "smooth" && this.isDynamicMode()) {
        console.warn(
          "The `smooth` scroll behavior is not fully supported with dynamic size."
        );
      }
      this._scrollToOffset(this.getOffsetForAlignment(toOffset, align), {
        adjustments: void 0,
        behavior
      });
    };
    this.scrollToIndex = (index, { align: initialAlign = "auto", behavior } = {}) => {
      if (behavior === "smooth" && this.isDynamicMode()) {
        console.warn(
          "The `smooth` scroll behavior is not fully supported with dynamic size."
        );
      }
      index = Math.max(0, Math.min(index, this.options.count - 1));
      let attempts = 0;
      const maxAttempts = 10;
      const tryScroll = (currentAlign) => {
        if (!this.targetWindow) return;
        const offsetInfo = this.getOffsetForIndex(index, currentAlign);
        if (!offsetInfo) {
          console.warn("Failed to get offset for index:", index);
          return;
        }
        const [offset, align] = offsetInfo;
        this._scrollToOffset(offset, { adjustments: void 0, behavior });
        this.targetWindow.requestAnimationFrame(() => {
          const currentOffset = this.getScrollOffset();
          const afterInfo = this.getOffsetForIndex(index, align);
          if (!afterInfo) {
            console.warn("Failed to get offset for index:", index);
            return;
          }
          if (!approxEqual(afterInfo[0], currentOffset)) {
            scheduleRetry(align);
          }
        });
      };
      const scheduleRetry = (align) => {
        if (!this.targetWindow) return;
        attempts++;
        if (attempts < maxAttempts) {
          if (process.env.NODE_ENV !== "production" && this.options.debug) {
            console.info("Schedule retry", attempts, maxAttempts);
          }
          this.targetWindow.requestAnimationFrame(() => tryScroll(align));
        } else {
          console.warn(
            `Failed to scroll to index ${index} after ${maxAttempts} attempts.`
          );
        }
      };
      tryScroll(initialAlign);
    };
    this.scrollBy = (delta, { behavior } = {}) => {
      if (behavior === "smooth" && this.isDynamicMode()) {
        console.warn(
          "The `smooth` scroll behavior is not fully supported with dynamic size."
        );
      }
      this._scrollToOffset(this.getScrollOffset() + delta, {
        adjustments: void 0,
        behavior
      });
    };
    this.getTotalSize = () => {
      var _a;
      const measurements = this.getMeasurements();
      let end;
      if (measurements.length === 0) {
        end = this.options.paddingStart;
      } else if (this.options.lanes === 1) {
        end = ((_a = measurements[measurements.length - 1]) == null ? void 0 : _a.end) ?? 0;
      } else {
        const endByLane = Array(this.options.lanes).fill(null);
        let endIndex = measurements.length - 1;
        while (endIndex >= 0 && endByLane.some((val) => val === null)) {
          const item = measurements[endIndex];
          if (endByLane[item.lane] === null) {
            endByLane[item.lane] = item.end;
          }
          endIndex--;
        }
        end = Math.max(...endByLane.filter((val) => val !== null));
      }
      return Math.max(
        end - this.options.scrollMargin + this.options.paddingEnd,
        0
      );
    };
    this._scrollToOffset = (offset, {
      adjustments,
      behavior
    }) => {
      this.options.scrollToFn(offset, { behavior, adjustments }, this);
    };
    this.measure = () => {
      this.itemSizeCache = /* @__PURE__ */ new Map();
      this.notify(false);
    };
    this.setOptions(opts);
  }
}
const findNearestBinarySearch = (low, high, getCurrentValue, value) => {
  while (low <= high) {
    const middle = (low + high) / 2 | 0;
    const currentValue = getCurrentValue(middle);
    if (currentValue < value) {
      low = middle + 1;
    } else if (currentValue > value) {
      high = middle - 1;
    } else {
      return middle;
    }
  }
  if (low > 0) {
    return low - 1;
  } else {
    return 0;
  }
};
function calculateRange({
  measurements,
  outerSize,
  scrollOffset,
  lanes
}) {
  const lastIndex = measurements.length - 1;
  const getOffset = (index) => measurements[index].start;
  if (measurements.length <= lanes) {
    return {
      startIndex: 0,
      endIndex: lastIndex
    };
  }
  let startIndex = findNearestBinarySearch(
    0,
    lastIndex,
    getOffset,
    scrollOffset
  );
  let endIndex = startIndex;
  if (lanes === 1) {
    while (endIndex < lastIndex && measurements[endIndex].end < scrollOffset + outerSize) {
      endIndex++;
    }
  } else if (lanes > 1) {
    const endPerLane = Array(lanes).fill(0);
    while (endIndex < lastIndex && endPerLane.some((pos) => pos < scrollOffset + outerSize)) {
      const item = measurements[endIndex];
      endPerLane[item.lane] = item.end;
      endIndex++;
    }
    const startPerLane = Array(lanes).fill(scrollOffset + outerSize);
    while (startIndex >= 0 && startPerLane.some((pos) => pos >= scrollOffset)) {
      const item = measurements[startIndex];
      startPerLane[item.lane] = item.start;
      startIndex--;
    }
    startIndex = Math.max(0, startIndex - startIndex % lanes);
    endIndex = Math.min(lastIndex, endIndex + (lanes - 1 - endIndex % lanes));
  }
  return { startIndex, endIndex };
}

const useIsomorphicLayoutEffect = typeof document !== "undefined" ? React__namespace.useLayoutEffect : React__namespace.useEffect;
function useVirtualizerBase(options) {
  const rerender = React__namespace.useReducer(() => ({}), {})[1];
  const resolvedOptions = {
    ...options,
    onChange: (instance2, sync) => {
      var _a;
      if (sync) {
        reactDom.flushSync(rerender);
      } else {
        rerender();
      }
      (_a = options.onChange) == null ? void 0 : _a.call(options, instance2, sync);
    }
  };
  const [instance] = React__namespace.useState(
    () => new Virtualizer(resolvedOptions)
  );
  instance.setOptions(resolvedOptions);
  useIsomorphicLayoutEffect(() => {
    return instance._didMount();
  }, []);
  useIsomorphicLayoutEffect(() => {
    return instance._willUpdate();
  });
  return instance;
}
function useVirtualizer(options) {
  return useVirtualizerBase({
    observeElementRect,
    observeElementOffset,
    scrollToFn: elementScroll,
    ...options
  });
}

function VirtualizedTableView({ table, features, height = 400, rowHeight = 35, overscan = 5, theme }) {
    const { classNames, styles } = useTableTheme(theme);
    const { rows } = table.getRowModel();
    // Create a parent ref for the virtualizer
    const parentRef = React.useRef(null);
    // Create the virtualizer
    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => rowHeight,
        overscan,
    });
    // Get virtual items
    const virtualRows = rowVirtualizer.getVirtualItems();
    // Calculate total size for proper scrolling
    const totalSize = rowVirtualizer.getTotalSize();
    // Memoize header groups for performance
    const headerGroups = React.useMemo(() => table.getHeaderGroups(), [table]);
    return (jsxRuntime.jsxs("div", { className: "overflow-auto border", children: [jsxRuntime.jsx("div", { className: "sticky top-0 z-10", style: styles.header, children: jsxRuntime.jsx("table", { className: classNames.table, style: {
                        ...styles.table,
                        width: features.columnResizing ? table.getCenterTotalSize() : undefined,
                    }, children: jsxRuntime.jsxs("thead", { children: [headerGroups.map((headerGroup) => (jsxRuntime.jsx("tr", { children: headerGroup.headers.map((header) => (jsxRuntime.jsxs("th", { className: classNames.header, style: {
                                        width: features.columnResizing ? header.getSize() : undefined,
                                        position: features.columnPinning && header.column.getIsPinned() ? 'sticky' : undefined,
                                        left: features.columnPinning && header.column.getIsPinned() === 'left' ? header.column.getStart('left') : undefined,
                                        right: features.columnPinning && header.column.getIsPinned() === 'right' ? header.column.getAfter('right') : undefined,
                                        zIndex: features.columnPinning && header.column.getIsPinned() ? 2 : 1,
                                    }, children: [header.isPlaceholder ? null : (jsxRuntime.jsx(DraggableColumnHeader, { columnId: header.column.id, canGroup: features.grouping && header.column.getCanGroup(), children: jsxRuntime.jsxs("div", { className: "flex items-center justify-between", children: [jsxRuntime.jsxs("div", { className: features.sorting ? "cursor-pointer select-none flex items-center" : "flex items-center",
                                                        onClick: features.sorting ? header.column.getToggleSortingHandler() : undefined, children: [features.grouping && header.column.getCanGroup() && (jsxRuntime.jsx("button", { onClick: header.column.getToggleGroupingHandler(), className: "mr-2 px-1 py-0.5 text-xs border rounded", children: header.column.getIsGrouped() ? '🛑' : '👥' })), flexRender(header.column.columnDef.header, header.getContext()), features.sorting && ({
                                                                asc: " 🔼",
                                                                desc: " 🔽",
                                                            }[header.column.getIsSorted()] ?? null)] }), features.columnPinning && (jsxRuntime.jsxs("div", { className: "flex gap-1", children: [jsxRuntime.jsx("button", { onClick: () => header.column.pin('left'), className: "text-xs px-1 hover:bg-gray-200 dark:hover:bg-gray-700", children: "\uD83D\uDCCCL" }), jsxRuntime.jsx("button", { onClick: () => header.column.pin('right'), className: "text-xs px-1 hover:bg-gray-200 dark:hover:bg-gray-700", children: "\uD83D\uDCCCR" }), jsxRuntime.jsx("button", { onClick: () => header.column.pin(false), className: "text-xs px-1 hover:bg-gray-200 dark:hover:bg-gray-700", children: "\u274C" })] }))] }) })), features.columnResizing && (jsxRuntime.jsx("div", { onMouseDown: header.getResizeHandler(), onTouchStart: header.getResizeHandler(), className: "absolute right-0 top-0 h-full w-1 bg-gray-300 cursor-col-resize hover:bg-blue-500" }))] }, header.id))) }, headerGroup.id))), features.filtering && (jsxRuntime.jsx("tr", { children: headerGroups[0].headers.map((header) => (jsxRuntime.jsx("th", { className: "border px-2 py-1", children: header.column.getCanFilter() ? (jsxRuntime.jsx("input", { className: "w-full border p-1 text-xs", value: (header.column.getFilterValue() ?? ""), onChange: (e) => header.column.setFilterValue(e.target.value), placeholder: `Filter...` })) : null }, header.id))) }))] }) }) }), jsxRuntime.jsx("div", { ref: parentRef, className: "overflow-auto", style: {
                    height: `${height}px`,
                }, children: jsxRuntime.jsx("div", { style: {
                        height: `${totalSize}px`,
                        width: '100%',
                        position: 'relative',
                    }, children: jsxRuntime.jsx("table", { className: classNames.table, style: {
                            ...styles.table,
                            width: features.columnResizing ? table.getCenterTotalSize() : undefined,
                        }, children: jsxRuntime.jsx("tbody", { children: virtualRows.map((virtualRow) => {
                                const row = rows[virtualRow.index];
                                return (jsxRuntime.jsx("tr", { "data-index": virtualRow.index, ref: (node) => rowVirtualizer.measureElement(node), className: `${classNames.row} ${features.rowSelection && row.getIsSelected() ? "selected" : ""}`, style: {
                                        ...styles.row,
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        transform: `translateY(${virtualRow.start}px)`,
                                    }, children: row.getVisibleCells().map((cell) => (jsxRuntime.jsx("td", { className: classNames.cell, style: {
                                            ...styles.cell,
                                            height: `${rowHeight}px`,
                                            position: features.columnPinning && cell.column.getIsPinned() ? 'sticky' : undefined,
                                            left: features.columnPinning && cell.column.getIsPinned() === 'left' ? cell.column.getStart('left') : undefined,
                                            right: features.columnPinning && cell.column.getIsPinned() === 'right' ? cell.column.getAfter('right') : undefined,
                                            zIndex: features.columnPinning && cell.column.getIsPinned() ? 1 : undefined,
                                            backgroundColor: features.columnPinning && cell.column.getIsPinned() ? 'inherit' : undefined,
                                        }, children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id))) }, row.id));
                            }) }) }) }) }), jsxRuntime.jsxs("div", { className: "text-xs text-gray-500 p-2 border-t", children: ["Showing ", virtualRows.length, " of ", rows.length, " rows (virtualized)"] })] }));
}

function ThemeSelector({ variant = 'default', colorScheme = 'auto', onVariantChange, onColorSchemeChange, className = '', }) {
    const { classNames, styles, toggleColorScheme } = useTableTheme({ variant, colorScheme });
    const presetNames = getThemePresetNames();
    const handleVariantChange = (newVariant) => {
        const typedVariant = newVariant;
        onVariantChange?.(typedVariant);
    };
    const handleColorSchemeChange = (newScheme) => {
        const typedScheme = newScheme;
        onColorSchemeChange?.(typedScheme);
    };
    return (jsxRuntime.jsx("div", { className: `theme-selector ${className}`, style: styles.controls, children: jsxRuntime.jsxs("div", { className: "flex flex-col gap-4 p-4 border rounded-lg", children: [jsxRuntime.jsx("h3", { className: "text-lg font-semibold", children: "Theme Settings" }), jsxRuntime.jsxs("div", { className: "flex flex-col gap-2", children: [jsxRuntime.jsx("label", { className: "text-sm font-medium", children: "Theme Variant:" }), jsxRuntime.jsx("select", { value: variant, onChange: (e) => handleVariantChange(e.target.value), className: "px-3 py-2 border rounded", style: styles.controls, children: presetNames.map((presetName) => {
                                const preset = getThemePreset(presetName);
                                return (jsxRuntime.jsxs("option", { value: presetName, children: [preset?.name || presetName, " - ", preset?.description || 'Custom theme'] }, presetName));
                            }) })] }), jsxRuntime.jsxs("div", { className: "flex flex-col gap-2", children: [jsxRuntime.jsx("label", { className: "text-sm font-medium", children: "Color Scheme:" }), jsxRuntime.jsx("div", { className: "flex gap-2", children: ['light', 'dark', 'auto'].map((scheme) => (jsxRuntime.jsxs("label", { className: "flex items-center gap-1 text-sm cursor-pointer", children: [jsxRuntime.jsx("input", { type: "radio", name: "colorScheme", value: scheme, checked: colorScheme === scheme, onChange: (e) => handleColorSchemeChange(e.target.value) }), scheme.charAt(0).toUpperCase() + scheme.slice(1)] }, scheme))) })] })] }) }));
}

/**
 * Predefined table presets for common use cases
 */
const TABLE_PRESETS$1 = {
    basic: {
        name: "Basic Table",
        description: "Simple table with sorting and pagination",
        features: {
            sorting: true,
            pagination: true,
            filtering: false,
            rowSelection: false,
            columnVisibility: false,
            columnResizing: false,
            columnPinning: false,
            rowExpansion: false,
            globalFiltering: false,
            grouping: false,
            inlineEditing: false,
            pivoting: false,
            virtualization: false,
            exporting: false,
        },
        theme: {
            variant: 'default',
            colorScheme: 'auto',
        },
        initialState: {
            pagination: { pageIndex: 0, pageSize: 10 },
        },
    },
    standard: {
        name: "Standard Table",
        description: "Full-featured table for most use cases",
        features: {
            sorting: true,
            pagination: true,
            filtering: true,
            rowSelection: true,
            columnVisibility: true,
            columnResizing: true,
            columnPinning: false,
            rowExpansion: false,
            globalFiltering: true,
            grouping: false,
            inlineEditing: false,
            pivoting: false,
            virtualization: false,
            exporting: true,
        },
        performanceConfig: {
            debounceDelay: 300,
            enableMemoization: true,
            enablePerformanceLogging: false,
        },
        theme: {
            variant: 'default',
            colorScheme: 'auto',
        },
        initialState: {
            pagination: { pageIndex: 0, pageSize: 20 },
        },
    },
    advanced: {
        name: "Advanced Table",
        description: "Table with all features enabled for power users",
        features: {
            sorting: true,
            pagination: true,
            filtering: true,
            rowSelection: true,
            columnVisibility: true,
            columnResizing: true,
            columnPinning: true,
            rowExpansion: true,
            globalFiltering: true,
            grouping: true,
            inlineEditing: false,
            pivoting: false,
            virtualization: false,
            exporting: true,
        },
        performanceConfig: {
            debounceDelay: 250,
            enableMemoization: true,
            enablePerformanceLogging: false,
        },
        theme: {
            variant: 'enterprise',
            colorScheme: 'auto',
        },
        initialState: {
            pagination: { pageIndex: 0, pageSize: 25 },
        },
    },
    dataEntry: {
        name: "Data Entry Table",
        description: "Table optimized for data entry and editing",
        features: {
            sorting: true,
            pagination: true,
            filtering: true,
            rowSelection: true,
            columnVisibility: false,
            columnResizing: true,
            columnPinning: false,
            rowExpansion: false,
            globalFiltering: true,
            grouping: false,
            inlineEditing: true,
            pivoting: false,
            virtualization: false,
            exporting: true,
        },
        performanceConfig: {
            debounceDelay: 200,
            enableMemoization: true,
            enablePerformanceLogging: false,
        },
        theme: {
            variant: 'compact',
            colorScheme: 'auto',
        },
        initialState: {
            pagination: { pageIndex: 0, pageSize: 15 },
        },
    },
    analytics: {
        name: "Analytics Table",
        description: "Table for data analysis with grouping and pivoting",
        features: {
            sorting: true,
            pagination: true,
            filtering: true,
            rowSelection: true,
            columnVisibility: true,
            columnResizing: true,
            columnPinning: true,
            rowExpansion: true,
            globalFiltering: true,
            grouping: true,
            inlineEditing: false,
            pivoting: true,
            virtualization: false,
            exporting: true,
        },
        performanceConfig: {
            debounceDelay: 300,
            enableMemoization: true,
            enablePerformanceLogging: false,
        },
        theme: {
            variant: 'spacious',
            colorScheme: 'auto',
        },
        initialState: {
            pagination: { pageIndex: 0, pageSize: 50 },
        },
    },
    minimal: {
        name: "Minimal Table",
        description: "Clean, minimal table for simple data display",
        features: {
            sorting: true,
            pagination: true,
            filtering: false,
            rowSelection: false,
            columnVisibility: false,
            columnResizing: false,
            columnPinning: false,
            rowExpansion: false,
            globalFiltering: false,
            grouping: false,
            inlineEditing: false,
            pivoting: false,
            virtualization: false,
            exporting: false,
        },
        theme: {
            variant: 'minimal',
            colorScheme: 'auto',
        },
        initialState: {
            pagination: { pageIndex: 0, pageSize: 15 },
        },
    },
    performance: {
        name: "High Performance Table",
        description: "Optimized for large datasets with virtualization",
        features: {
            sorting: true,
            pagination: false, // Disabled when virtualization is on
            filtering: true,
            rowSelection: true,
            columnVisibility: true,
            columnResizing: true,
            columnPinning: true,
            rowExpansion: false,
            globalFiltering: true,
            grouping: false,
            inlineEditing: false,
            pivoting: false,
            virtualization: true,
            exporting: true,
        },
        performanceConfig: {
            debounceDelay: 150,
            enableMemoization: true,
            enablePerformanceLogging: true,
            virtualizationThreshold: 100,
        },
        theme: {
            variant: 'default',
            colorScheme: 'auto',
        },
    },
    dashboard: {
        name: "Dashboard Table",
        description: "Table for dashboard displays with key metrics",
        features: {
            sorting: true,
            pagination: true,
            filtering: false,
            rowSelection: false,
            columnVisibility: true,
            columnResizing: false,
            columnPinning: false,
            rowExpansion: false,
            globalFiltering: true,
            grouping: true,
            inlineEditing: false,
            pivoting: false,
            virtualization: false,
            exporting: true,
        },
        performanceConfig: {
            debounceDelay: 300,
            enableMemoization: true,
            enablePerformanceLogging: false,
        },
        theme: {
            variant: 'enterprise',
            colorScheme: 'auto',
        },
        initialState: {
            pagination: { pageIndex: 0, pageSize: 10 },
        },
    },
    readonly: {
        name: "Read-Only Table",
        description: "Table for displaying data without editing capabilities",
        features: {
            sorting: true,
            pagination: true,
            filtering: true,
            rowSelection: false,
            columnVisibility: true,
            columnResizing: true,
            columnPinning: false,
            rowExpansion: true,
            globalFiltering: true,
            grouping: false,
            inlineEditing: false,
            pivoting: false,
            virtualization: false,
            exporting: true,
        },
        performanceConfig: {
            debounceDelay: 300,
            enableMemoization: true,
            enablePerformanceLogging: false,
        },
        theme: {
            variant: 'default',
            colorScheme: 'auto',
        },
        initialState: {
            pagination: { pageIndex: 0, pageSize: 20 },
        },
    },
    mobile: {
        name: "Mobile Optimized",
        description: "Table optimized for mobile and small screens",
        features: {
            sorting: true,
            pagination: true,
            filtering: false,
            rowSelection: false,
            columnVisibility: true,
            columnResizing: false,
            columnPinning: false,
            rowExpansion: true,
            globalFiltering: true,
            grouping: false,
            inlineEditing: false,
            pivoting: false,
            virtualization: false,
            exporting: false,
        },
        performanceConfig: {
            debounceDelay: 400,
            enableMemoization: true,
            enablePerformanceLogging: false,
        },
        theme: {
            variant: 'compact',
            colorScheme: 'auto',
        },
        initialState: {
            pagination: { pageIndex: 0, pageSize: 5 },
        },
    },
};
/**
 * Get a preset configuration by name
 */
function getPreset$1(presetName) {
    return TABLE_PRESETS$1[presetName];
}

function PresetSelector({ currentPreset = 'standard', onPresetChange, className = "" }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedPreset, setSelectedPreset] = React.useState(currentPreset);
    const handlePresetSelect = (presetKey) => {
        const preset = TABLE_PRESETS$1[presetKey];
        if (preset) {
            setSelectedPreset(presetKey);
            onPresetChange(preset);
            setIsOpen(false);
        }
    };
    const currentPresetData = TABLE_PRESETS$1[selectedPreset];
    return (jsxRuntime.jsxs("div", { className: `relative ${className}`, children: [jsxRuntime.jsxs("button", { onClick: () => setIsOpen(!isOpen), className: "flex items-center justify-between w-full px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500", children: [jsxRuntime.jsxs("div", { className: "flex flex-col items-start", children: [jsxRuntime.jsx("span", { className: "font-medium", children: currentPresetData?.name || 'Select Preset' }), jsxRuntime.jsx("span", { className: "text-xs text-gray-500 dark:text-gray-400 truncate max-w-48", children: currentPresetData?.description })] }), jsxRuntime.jsx("svg", { className: `w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: jsxRuntime.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) })] }), isOpen && (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [jsxRuntime.jsx("div", { className: "fixed inset-0 z-10", onClick: () => setIsOpen(false) }), jsxRuntime.jsx("div", { className: "absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-96 overflow-y-auto", children: jsxRuntime.jsx("div", { className: "py-1", children: Object.entries(TABLE_PRESETS$1).map(([key, preset]) => (jsxRuntime.jsx("button", { onClick: () => handlePresetSelect(key), className: `w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700 ${selectedPreset === key
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                    : 'text-gray-900 dark:text-gray-100'}`, children: jsxRuntime.jsxs("div", { className: "flex flex-col", children: [jsxRuntime.jsx("span", { className: "font-medium text-sm", children: preset.name }), jsxRuntime.jsx("span", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: preset.description }), jsxRuntime.jsxs("div", { className: "flex flex-wrap gap-1 mt-2", children: [Object.entries(preset.features)
                                                    .filter(([, enabled]) => enabled)
                                                    .slice(0, 4)
                                                    .map(([feature]) => (jsxRuntime.jsx("span", { className: "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200", children: feature }, feature))), Object.values(preset.features).filter(Boolean).length > 4 && (jsxRuntime.jsxs("span", { className: "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400", children: ["+", Object.values(preset.features).filter(Boolean).length - 4, " more"] }))] })] }) }, key))) }) })] }))] }));
}

/**
 * Debounce hook for delaying function execution
 * Useful for search inputs and filters to reduce computation frequency
 */
function useDebounce(callback, delay) {
    const timeoutRef = React.useRef(null);
    const debouncedCallback = React.useCallback((...args) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    }, [callback, delay]);
    // Cleanup timeout on unmount
    React.useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);
    return debouncedCallback;
}
/**
 * Memoization utilities for table data and columns
 */
class TableMemoization {
    /**
     * Memoize table columns with deep comparison
     * Prevents unnecessary re-renders when column definitions haven't changed
     */
    static useMemoizedColumns(columns, dependencies = []) {
        return React.useMemo(() => {
            return columns.map((col, index) => ({
                ...col,
                // Add stable id if not provided
                id: col.id || `column-${index}`,
            }));
        }, [columns, ...dependencies]);
    }
    /**
     * Memoize table data with row indexing
     * Adds stable row identifiers and prevents unnecessary re-computation
     */
    static useMemoizedData(data, keyExtractor) {
        return React.useMemo(() => {
            return data.map((row, index) => {
                const rowKey = keyExtractor ? keyExtractor(row, index) : index;
                return {
                    ...row,
                    _tableRowId: rowKey,
                    _tableRowIndex: index,
                };
            });
        }, [data, keyExtractor]);
    }
    /**
     * Memoize computed table state
     * Prevents recalculation of derived values
     */
    static useComputedTableState(data, columns, features) {
        return React.useMemo(() => {
            const enabledFeatures = Object.entries(features)
                .filter(([_, enabled]) => enabled)
                .map(([feature]) => feature);
            return {
                totalRows: data.length,
                totalColumns: columns.length,
                hasData: data.length > 0,
                enabledFeatures,
                featureCount: enabledFeatures.length,
                // Performance metrics
                isLargeDataset: data.length > 1000,
                shouldVirtualize: data.length > 5000,
            };
        }, [data.length, columns.length, features]);
    }
}
/**
 * Performance monitoring utilities
 */
class PerformanceMonitor {
    /**
     * Start performance measurement
     */
    static startMeasurement(name) {
        this.measurements.set(name, performance.now());
    }
    /**
     * End performance measurement and return duration
     */
    static endMeasurement(name) {
        const startTime = this.measurements.get(name);
        if (!startTime) {
            console.warn(`No measurement started for: ${name}`);
            return 0;
        }
        const duration = performance.now() - startTime;
        this.measurements.delete(name);
        return duration;
    }
    /**
     * Measure function execution time
     */
    static measureFunction(fn, name) {
        return ((...args) => {
            const measurementName = name || fn.name || 'anonymous';
            this.startMeasurement(measurementName);
            try {
                const result = fn(...args);
                // Handle async functions
                if (result instanceof Promise) {
                    return result.finally(() => {
                        const duration = this.endMeasurement(measurementName);
                        console.debug(`${measurementName} took ${duration.toFixed(2)}ms`);
                    });
                }
                const duration = this.endMeasurement(measurementName);
                console.debug(`${measurementName} took ${duration.toFixed(2)}ms`);
                return result;
            }
            catch (error) {
                this.endMeasurement(measurementName);
                throw error;
            }
        });
    }
    /**
     * Memory usage monitoring
     */
    static getMemoryUsage() {
        if ('memory' in performance) {
            return performance.memory.usedJSHeapSize;
        }
        return 0;
    }
    /**
     * Log performance metrics
     */
    static logMetrics(context, metrics) {
        console.group(`Performance Metrics - ${context}`);
        Object.entries(metrics).forEach(([key, value]) => {
            console.log(`${key}: ${value}`);
        });
        console.groupEnd();
    }
}
PerformanceMonitor.measurements = new Map();
const defaultPerformanceConfig = {
    debounceDelay: 300,
    enableMemoization: true,
    enablePerformanceLogging: false,
    virtualizationThreshold: 1000,
};
/**
 * Performance optimization hook
 * Combines all performance utilities for easy use
 */
function useTablePerformance(data, columns, features, config = {}) {
    const performanceConfig = { ...defaultPerformanceConfig, ...config };
    // Memoized data and columns
    const memoizedData = TableMemoization.useMemoizedData(data);
    const memoizedColumns = TableMemoization.useMemoizedColumns(columns, [features]);
    // Computed state
    const computedState = TableMemoization.useComputedTableState(data, columns, features);
    // Performance monitoring
    React.useEffect(() => {
        if (performanceConfig.enablePerformanceLogging) {
            PerformanceMonitor.logMetrics('Table Performance', {
                'Data Size': data.length,
                'Column Count': columns.length,
                'Enabled Features': computedState.enabledFeatures.length,
                'Should Virtualize': computedState.shouldVirtualize,
                'Memory Usage': `${(PerformanceMonitor.getMemoryUsage() / 1024 / 1024).toFixed(2)} MB`,
            });
        }
    }, [data.length, columns.length, computedState, performanceConfig.enablePerformanceLogging]);
    return {
        memoizedData,
        memoizedColumns,
        computedState,
        performanceConfig,
    };
}

function ReusableAdvancedTable({ data, columns: providedColumns, preset, features = {}, performanceConfig = {}, initialState = {}, theme = {}, virtualization = {}, getSubRows, onDataChange, onStateChange, onFeatureToggle, components, className = "", showThemeSelector = true, showPresetSelector = true, allowFeatureToggling = true, meta, }) {
    // Get preset configuration
    const presetConfig = preset ? getPreset$1(preset) : null;
    // Default feature configuration
    const defaultFeatures = {
        sorting: true,
        filtering: true,
        pagination: true,
        rowSelection: false,
        columnVisibility: false,
        columnResizing: false,
        columnPinning: false,
        rowExpansion: false,
        globalFiltering: false,
        grouping: false,
        inlineEditing: false,
        pivoting: false,
        virtualization: false,
        exporting: true,
    };
    // Merge features: defaults -> preset -> props
    const [enabled, setEnabled] = React.useState({
        ...defaultFeatures,
        ...(presetConfig?.features || {}),
        ...features,
    });
    // Current preset state
    const [currentPreset, setCurrentPreset] = React.useState(preset || 'standard');
    // Theme state
    const [themeVariant, setThemeVariant] = React.useState(presetConfig?.theme?.variant || theme.variant || 'default');
    const [colorScheme, setColorScheme] = React.useState(presetConfig?.theme?.colorScheme || theme.colorScheme || 'auto');
    const themeOptions = React.useMemo(() => ({
        variant: themeVariant,
        colorScheme: colorScheme,
        enableTransitions: theme.enableTransitions ?? true,
        enableHoverEffects: theme.enableHoverEffects ?? true,
        enableFocusIndicators: theme.enableFocusIndicators ?? true,
    }), [themeVariant, colorScheme, theme.enableTransitions, theme.enableHoverEffects, theme.enableFocusIndicators]);
    // Data state management
    const [tableData, setTableData] = React.useState(data);
    // Table state management
    const [sorting, setSorting] = React.useState(initialState.sorting || []);
    const [columnFilters, setColumnFilters] = React.useState(initialState.columnFilters || []);
    const [rowSelection, setRowSelection] = React.useState(initialState.rowSelection || {});
    const [columnVisibility, setColumnVisibility] = React.useState(initialState.columnVisibility || {});
    const [columnPinning, setColumnPinning] = React.useState(initialState.columnPinning || {});
    const [grouping, setGrouping] = React.useState(initialState.grouping || []);
    const [expanded, setExpanded] = React.useState(initialState.expanded || {});
    const [globalFilter, setGlobalFilter] = React.useState(initialState.globalFilter || '');
    // Update table data when props change
    React.useEffect(() => {
        setTableData(data);
    }, [data]);
    // Note: handleDataUpdate function moved inside useMemo for stability
    // Notify parent of data changes - use ref to avoid infinite loops
    const initialDataRef = React.useRef(data);
    const hasDataChangedRef = React.useRef(false);
    // Use ref for callback to avoid dependency issues
    const onDataChangeRef = React.useRef(onDataChange);
    onDataChangeRef.current = onDataChange;
    React.useEffect(() => {
        // Only call onDataChange if the data was actually changed by user interaction,
        // not by prop updates from parent
        if (onDataChangeRef.current && hasDataChangedRef.current && tableData !== initialDataRef.current) {
            onDataChangeRef.current(tableData);
        }
        // Reset the flag after handling
        hasDataChangedRef.current = false;
    }, [tableData]); // Remove onDataChange from dependencies
    // Track when data changes from props vs user interaction
    React.useEffect(() => {
        initialDataRef.current = data;
        hasDataChangedRef.current = false;
    }, [data]);
    // Create columns with editing support
    const columns = React.useMemo(() => {
        // Columns are required - this is a truly generic component
        if (!providedColumns || providedColumns.length === 0) {
            throw new Error('ReusableAdvancedTable: columns prop is required. Please provide column definitions for your data structure.');
        }
        return providedColumns;
    }, [providedColumns]); // Remove handleDataUpdate from dependencies
    // Performance optimizations
    const { memoizedData, memoizedColumns } = useTablePerformance(tableData, columns, enabled, performanceConfig);
    // TanStack Table configuration
    const table = useReactTable({
        data: memoizedData,
        columns: memoizedColumns,
        state: {
            sorting,
            columnFilters,
            rowSelection,
            columnVisibility,
            columnPinning,
            grouping,
            expanded,
            globalFilter,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onRowSelectionChange: setRowSelection,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnPinningChange: setColumnPinning,
        onGroupingChange: setGrouping,
        onExpandedChange: setExpanded,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: enabled.filtering ? getFilteredRowModel() : undefined,
        getSortedRowModel: enabled.sorting ? getSortedRowModel() : undefined,
        getPaginationRowModel: enabled.pagination ? getPaginationRowModel() : undefined,
        getGroupedRowModel: enabled.grouping ? getGroupedRowModel() : undefined,
        getExpandedRowModel: enabled.rowExpansion ? getExpandedRowModel() : undefined,
        enableSorting: enabled.sorting,
        enableColumnFilters: enabled.filtering,
        enableRowSelection: enabled.rowSelection,
        enableColumnResizing: enabled.columnResizing,
        enableColumnPinning: enabled.columnPinning,
        enableGrouping: enabled.grouping,
        enableExpanding: enabled.rowExpansion,
        enableGlobalFilter: enabled.globalFiltering,
        columnResizeMode: 'onChange',
        getSubRows: getSubRows,
        meta: meta,
        initialState: {
            pagination: initialState.pagination || { pageIndex: 0, pageSize: 10 },
        },
    });
    // Feature toggle function
    function toggleFeature(feature) {
        const newEnabled = { ...enabled, [feature]: !enabled[feature] };
        setEnabled(newEnabled);
        onFeatureToggle?.(feature, newEnabled[feature]);
    }
    // Handle preset changes
    const handlePresetChange = (newPreset) => {
        setCurrentPreset(newPreset.name.toLowerCase());
        setEnabled({
            ...defaultFeatures,
            ...newPreset.features,
            ...features, // Props override preset
        });
        if (newPreset.theme) {
            if (newPreset.theme.variant) {
                setThemeVariant(newPreset.theme.variant);
            }
            if (newPreset.theme.colorScheme) {
                setColorScheme(newPreset.theme.colorScheme);
            }
        }
    };
    // Debounced handlers for better performance
    const finalPerformanceConfig = presetConfig?.performanceConfig || performanceConfig;
    const debounceDelay = finalPerformanceConfig.debounceDelay || 300;
    const debouncedSetGlobalFilter = useDebounce(setGlobalFilter, debounceDelay);
    // Grouping handlers
    const handleGroupChange = (columnId) => {
        setGrouping(prev => [...prev, columnId]);
    };
    const handleRemoveGroup = (columnId) => {
        setGrouping(prev => prev.filter(id => id !== columnId));
    };
    // Use ref for state change callback to avoid dependency issues
    const onStateChangeRef = React.useRef(onStateChange);
    onStateChangeRef.current = onStateChange;
    // Notify parent of state changes
    React.useEffect(() => {
        if (onStateChangeRef.current) {
            onStateChangeRef.current({
                sorting,
                columnFilters,
                rowSelection,
                columnVisibility,
                columnPinning,
                grouping,
                expanded,
                globalFilter,
            });
        }
    }, [sorting, columnFilters, rowSelection, columnVisibility, columnPinning, grouping, expanded, globalFilter]); // Remove onStateChange from dependencies
    return (jsxRuntime.jsxs("div", { className: `w-full space-y-6 ${className}`, children: [(showPresetSelector || showThemeSelector) && (jsxRuntime.jsx("div", { className: "bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700", children: jsxRuntime.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [showPresetSelector && (jsxRuntime.jsxs("div", { children: [jsxRuntime.jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Table Preset" }), jsxRuntime.jsx(PresetSelector, { currentPreset: currentPreset, onPresetChange: handlePresetChange })] })), showThemeSelector && (jsxRuntime.jsx("div", { children: jsxRuntime.jsx(ThemeSelector, { variant: themeVariant, colorScheme: colorScheme, onVariantChange: setThemeVariant, onColorSchemeChange: setColorScheme }) }))] }) })), allowFeatureToggling && (jsxRuntime.jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4", children: jsxRuntime.jsx(TableControls, { enabled: enabled, onToggleFeature: toggleFeature, table: table, globalFilter: globalFilter, onGlobalFilterChange: setGlobalFilter, onDebouncedGlobalFilterChange: debouncedSetGlobalFilter, rowSelection: rowSelection, theme: themeOptions }) })), enabled.grouping && (jsxRuntime.jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4", children: jsxRuntime.jsx(DragDropArea, { groupedColumns: grouping, onGroupChange: handleGroupChange, onRemoveGroup: handleRemoveGroup, allColumns: table.getAllColumns() }) })), jsxRuntime.jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden", children: [jsxRuntime.jsx("div", { className: "overflow-hidden", children: enabled.virtualization ? (jsxRuntime.jsx(VirtualizedTableView, { table: table, features: enabled, height: virtualization.height || 400, rowHeight: virtualization.rowHeight || 35, overscan: virtualization.overscan || 5, theme: themeOptions })) : (jsxRuntime.jsx(EnhancedTableView, { table: table, features: enabled, theme: themeOptions })) }), enabled.pagination && (jsxRuntime.jsx("div", { className: "border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3", children: jsxRuntime.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [jsxRuntime.jsx("button", { className: "border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800", onClick: () => table.setPageIndex(0), disabled: !table.getCanPreviousPage(), children: '<<' }), jsxRuntime.jsx("button", { className: "border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800", onClick: () => table.previousPage(), disabled: !table.getCanPreviousPage(), children: '<' }), jsxRuntime.jsx("button", { className: "border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800", onClick: () => table.nextPage(), disabled: !table.getCanNextPage(), children: '>' }), jsxRuntime.jsx("button", { className: "border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800", onClick: () => table.setPageIndex(table.getPageCount() - 1), disabled: !table.getCanNextPage(), children: '>>' })] }), jsxRuntime.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center gap-4", children: [jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [jsxRuntime.jsxs("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: ["Page ", table.getState().pagination.pageIndex + 1, " of", ' ', table.getPageCount()] }), jsxRuntime.jsx("select", { value: table.getState().pagination.pageSize, onChange: e => {
                                                        table.setPageSize(Number(e.target.value));
                                                    }, className: "border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100", children: [10, 20, 30, 40, 50].map(pageSize => (jsxRuntime.jsxs("option", { value: pageSize, children: ["Show ", pageSize] }, pageSize))) })] }), jsxRuntime.jsxs("div", { className: "text-sm text-gray-600 dark:text-gray-400", children: ["Showing ", table.getRowModel().rows.length, " of", ' ', table.getFilteredRowModel().rows.length, " results"] })] })] }) }))] })] }));
}

const EditableCellComponent = ({ initialValue, depth, onUpdate }) => {
    const [value, setValue] = React.useState(initialValue);
    const [isEditing, setIsEditing] = React.useState(false);
    React.useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);
    const onBlur = () => {
        setIsEditing(false);
        onUpdate?.(value);
    };
    return (jsxRuntime.jsx("div", { style: { paddingLeft: `${depth * 20}px` }, children: isEditing ? (jsxRuntime.jsx("input", { value: value, onChange: (e) => setValue(e.target.value), onBlur: onBlur, onKeyDown: (e) => e.key === 'Enter' && onBlur(), className: "w-full px-1 py-0.5 border rounded", autoFocus: true })) : (jsxRuntime.jsx("span", { onClick: () => setIsEditing(true), className: "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-1 py-0.5 rounded", children: value })) }));
};
// Memoized version for better performance
const EditableCell = React.memo(EditableCellComponent, (prevProps, nextProps) => {
    return (prevProps.initialValue === nextProps.initialValue &&
        prevProps.depth === nextProps.depth &&
        prevProps.onUpdate === nextProps.onUpdate);
});

const StatusCellComponent = ({ value, depth }) => {
    const getStatusStyles = (status) => {
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
    return (jsxRuntime.jsx("div", { style: { paddingLeft: `${depth * 20}px` }, children: jsxRuntime.jsx("span", { className: `px-2 py-1 rounded text-xs ${getStatusStyles(value)}`, children: value }) }));
};
// Memoized version for better performance
const StatusCell = React.memo(StatusCellComponent, (prevProps, nextProps) => {
    return (prevProps.value === nextProps.value &&
        prevProps.depth === nextProps.depth);
});

const ProgressCellComponent = ({ value, depth }) => {
    return (jsxRuntime.jsx("div", { style: { paddingLeft: `${depth * 20}px` }, children: jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [jsxRuntime.jsx("div", { className: "w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2", children: jsxRuntime.jsx("div", { className: "bg-blue-500 h-2 rounded-full transition-all", style: { width: `${value}%` } }) }), jsxRuntime.jsxs("span", { className: "text-xs", children: [value, "%"] })] }) }));
};
// Memoized version for better performance
const ProgressCell = React.memo(ProgressCellComponent, (prevProps, nextProps) => {
    return (prevProps.value === nextProps.value &&
        prevProps.depth === nextProps.depth);
});

const DepartmentCellComponent = ({ value, depth }) => {
    const getDepartmentStyles = (department) => {
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
    return (jsxRuntime.jsx("div", { style: { paddingLeft: `${depth * 20}px` }, children: jsxRuntime.jsx("span", { className: `px-2 py-1 rounded text-xs ${getDepartmentStyles(value)}`, children: value }) }));
};
// Memoized version for better performance
const DepartmentCell = React.memo(DepartmentCellComponent, (prevProps, nextProps) => {
    return (prevProps.value === nextProps.value &&
        prevProps.depth === nextProps.depth);
});

const RegionCellComponent = ({ value, depth }) => {
    const getRegionStyles = (region) => {
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
    return (jsxRuntime.jsx("div", { style: { paddingLeft: `${depth * 20}px` }, children: jsxRuntime.jsx("span", { className: `px-2 py-1 rounded text-xs ${getRegionStyles(value)}`, children: value }) }));
};
// Memoized version for better performance
const RegionCell = React.memo(RegionCellComponent, (prevProps, nextProps) => {
    return (prevProps.value === nextProps.value &&
        prevProps.depth === nextProps.depth);
});

// Text input cell
const EditableTextCell = ({ initialValue, depth, onUpdate, onKeyDown }) => {
    const [value, setValue] = React.useState(String(initialValue || ''));
    const [isEditing, setIsEditing] = React.useState(false);
    const inputRef = React.useRef(null);
    const spanRef = React.useRef(null);
    React.useEffect(() => {
        setValue(String(initialValue || ''));
    }, [initialValue]);
    const handleSave = React.useCallback(() => {
        setIsEditing(false);
        onUpdate?.(value);
    }, [value, onUpdate]);
    const handleCancel = React.useCallback(() => {
        setIsEditing(false);
        setValue(String(initialValue || ''));
    }, [initialValue]);
    const handleKeyDown = React.useCallback((e) => {
        if (isEditing) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSave();
            }
            else if (e.key === 'Escape') {
                e.preventDefault();
                handleCancel();
            }
            else if (e.key === 'Tab') {
                handleSave();
            }
        }
        else {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsEditing(true);
            }
        }
        onKeyDown?.(e);
    }, [isEditing, handleSave, handleCancel, onKeyDown]);
    React.useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);
    return (jsxRuntime.jsx("div", { style: { paddingLeft: `${depth * 20}px` }, children: isEditing ? (jsxRuntime.jsx("input", { ref: inputRef, value: value, onChange: (e) => setValue(e.target.value), onBlur: handleSave, onKeyDown: handleKeyDown, className: "w-full px-1 py-0.5 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" })) : (jsxRuntime.jsx("span", { ref: spanRef, onClick: () => setIsEditing(true), onKeyDown: handleKeyDown, className: "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-1 py-0.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 block", tabIndex: 0, role: "button", "aria-label": `Edit ${value}`, children: value || 'Click to edit' })) }));
};
// Number input cell
const EditableNumberCell = ({ initialValue, depth, onUpdate, onKeyDown }) => {
    const [value, setValue] = React.useState(String(initialValue || ''));
    const [isEditing, setIsEditing] = React.useState(false);
    const inputRef = React.useRef(null);
    React.useEffect(() => {
        setValue(String(initialValue || ''));
    }, [initialValue]);
    const handleSave = React.useCallback(() => {
        setIsEditing(false);
        const numValue = parseFloat(value);
        onUpdate?.(isNaN(numValue) ? initialValue : numValue);
    }, [value, onUpdate, initialValue]);
    const handleCancel = React.useCallback(() => {
        setIsEditing(false);
        setValue(String(initialValue || ''));
    }, [initialValue]);
    const handleKeyDown = React.useCallback((e) => {
        if (isEditing) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSave();
            }
            else if (e.key === 'Escape') {
                e.preventDefault();
                handleCancel();
            }
            else if (e.key === 'Tab') {
                handleSave();
            }
        }
        else {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsEditing(true);
            }
        }
        onKeyDown?.(e);
    }, [isEditing, handleSave, handleCancel, onKeyDown]);
    React.useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);
    return (jsxRuntime.jsx("div", { style: { paddingLeft: `${depth * 20}px` }, children: isEditing ? (jsxRuntime.jsx("input", { ref: inputRef, type: "number", value: value, onChange: (e) => setValue(e.target.value), onBlur: handleSave, onKeyDown: handleKeyDown, className: "w-full px-1 py-0.5 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" })) : (jsxRuntime.jsx("span", { onClick: () => setIsEditing(true), onKeyDown: handleKeyDown, className: "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-1 py-0.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 block", tabIndex: 0, role: "button", "aria-label": `Edit ${value}`, children: value || 'Click to edit' })) }));
};
// Date input cell
const EditableDateCell = ({ initialValue, depth, onUpdate, onKeyDown }) => {
    const [value, setValue] = React.useState('');
    const [isEditing, setIsEditing] = React.useState(false);
    const inputRef = React.useRef(null);
    React.useEffect(() => {
        if (initialValue) {
            const date = new Date(initialValue);
            setValue(date.toISOString().split('T')[0]);
        }
    }, [initialValue]);
    const handleSave = React.useCallback(() => {
        setIsEditing(false);
        onUpdate?.(value ? new Date(value).toISOString() : initialValue);
    }, [value, onUpdate, initialValue]);
    const handleCancel = React.useCallback(() => {
        setIsEditing(false);
        if (initialValue) {
            const date = new Date(initialValue);
            setValue(date.toISOString().split('T')[0]);
        }
    }, [initialValue]);
    const handleKeyDown = React.useCallback((e) => {
        if (isEditing) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSave();
            }
            else if (e.key === 'Escape') {
                e.preventDefault();
                handleCancel();
            }
            else if (e.key === 'Tab') {
                handleSave();
            }
        }
        else {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsEditing(true);
            }
        }
        onKeyDown?.(e);
    }, [isEditing, handleSave, handleCancel, onKeyDown]);
    React.useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);
    const displayValue = initialValue ? new Date(initialValue).toLocaleDateString() : 'No date';
    return (jsxRuntime.jsx("div", { style: { paddingLeft: `${depth * 20}px` }, children: isEditing ? (jsxRuntime.jsx("input", { ref: inputRef, type: "date", value: value, onChange: (e) => setValue(e.target.value), onBlur: handleSave, onKeyDown: handleKeyDown, className: "w-full px-1 py-0.5 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" })) : (jsxRuntime.jsx("span", { onClick: () => setIsEditing(true), onKeyDown: handleKeyDown, className: "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-1 py-0.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 block", tabIndex: 0, role: "button", "aria-label": `Edit ${displayValue}`, children: displayValue })) }));
};
// Select dropdown cell
const EditableSelectCell = ({ initialValue, depth, onUpdate, onKeyDown, options, getOptionStyles }) => {
    const [value, setValue] = React.useState(String(initialValue || ''));
    const [isEditing, setIsEditing] = React.useState(false);
    const selectRef = React.useRef(null);
    React.useEffect(() => {
        setValue(String(initialValue || ''));
    }, [initialValue]);
    const handleSave = React.useCallback(() => {
        setIsEditing(false);
        onUpdate?.(value);
    }, [value, onUpdate]);
    const handleCancel = React.useCallback(() => {
        setIsEditing(false);
        setValue(String(initialValue || ''));
    }, [initialValue]);
    const handleKeyDown = React.useCallback((e) => {
        if (isEditing) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSave();
            }
            else if (e.key === 'Escape') {
                e.preventDefault();
                handleCancel();
            }
            else if (e.key === 'Tab') {
                handleSave();
            }
        }
        else {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsEditing(true);
            }
        }
        onKeyDown?.(e);
    }, [isEditing, handleSave, handleCancel, onKeyDown]);
    React.useEffect(() => {
        if (isEditing && selectRef.current) {
            selectRef.current.focus();
        }
    }, [isEditing]);
    return (jsxRuntime.jsx("div", { style: { paddingLeft: `${depth * 20}px` }, children: isEditing ? (jsxRuntime.jsx("select", { ref: selectRef, value: value, onChange: (e) => setValue(e.target.value), onBlur: handleSave, onKeyDown: handleKeyDown, className: "w-full px-1 py-0.5 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500", children: options.map(option => (jsxRuntime.jsx("option", { value: option, children: option }, option))) })) : (jsxRuntime.jsx("span", { onClick: () => setIsEditing(true), onKeyDown: handleKeyDown, className: `cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 block text-xs ${getOptionStyles?.(value) || ''}`, tabIndex: 0, role: "button", "aria-label": `Edit ${value}`, children: value || 'Select option' })) }));
};
// Currency input cell
const EditableCurrencyCell = ({ initialValue, depth, onUpdate, onKeyDown }) => {
    const [value, setValue] = React.useState(String(initialValue || ''));
    const [isEditing, setIsEditing] = React.useState(false);
    const inputRef = React.useRef(null);
    React.useEffect(() => {
        setValue(String(initialValue || ''));
    }, [initialValue]);
    const handleSave = React.useCallback(() => {
        setIsEditing(false);
        const numValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
        onUpdate?.(isNaN(numValue) ? initialValue : numValue);
    }, [value, onUpdate, initialValue]);
    const handleCancel = React.useCallback(() => {
        setIsEditing(false);
        setValue(String(initialValue || ''));
    }, [initialValue]);
    const handleKeyDown = React.useCallback((e) => {
        if (isEditing) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSave();
            }
            else if (e.key === 'Escape') {
                e.preventDefault();
                handleCancel();
            }
            else if (e.key === 'Tab') {
                handleSave();
            }
        }
        else {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsEditing(true);
            }
        }
        onKeyDown?.(e);
    }, [isEditing, handleSave, handleCancel, onKeyDown]);
    React.useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);
    const displayValue = typeof initialValue === 'number'
        ? `$${initialValue.toLocaleString()}`
        : initialValue || '$0';
    return (jsxRuntime.jsx("div", { style: { paddingLeft: `${depth * 20}px` }, children: isEditing ? (jsxRuntime.jsx("input", { ref: inputRef, type: "text", value: value, onChange: (e) => setValue(e.target.value), onBlur: handleSave, onKeyDown: handleKeyDown, placeholder: "Enter amount", className: "w-full px-1 py-0.5 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" })) : (jsxRuntime.jsx("span", { onClick: () => setIsEditing(true), onKeyDown: handleKeyDown, className: "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-1 py-0.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 block", tabIndex: 0, role: "button", "aria-label": `Edit ${displayValue}`, children: displayValue })) }));
};

/**
 * Creates utility columns for row selection and expansion.
 * These are generic and can be used with any data structure.
 */
const createUtilityColumns = (features) => [
    // Row selection column
    ...(features.rowSelection ? [{
            id: 'select',
            header: ({ table }) => (React.createElement('input', {
                type: 'checkbox',
                checked: table.getIsAllRowsSelected(),
                onChange: table.getToggleAllRowsSelectedHandler()
            })),
            cell: ({ row }) => (React.createElement('input', {
                type: 'checkbox',
                checked: row.getIsSelected(),
                onChange: row.getToggleSelectedHandler()
            })),
        }] : []),
    // Expand column
    ...(features.rowExpansion ? [{
            id: 'expand',
            header: 'Expand',
            cell: ({ row }) => (row.getCanExpand() ? (React.createElement('button', {
                onClick: row.getToggleExpandedHandler(),
                className: 'px-2 py-1 text-xs border rounded'
            }, row.getIsExpanded() ? '▼' : '▶')) : null),
        }] : []),
];
/**
 * Utility functions for creating common column types.
 * These are generic helpers that can be used with any data structure.
 */
/**
 * Creates a basic text column with optional inline editing
 */
const createTextColumn = (accessorKey, header, options = {}) => ({
    accessorKey: accessorKey,
    header,
    footer: (info) => info.column.id,
    enableGrouping: options.enableGrouping,
    cell: ({ getValue, row }) => {
        const value = getValue();
        return options.enableEditing
            ? React.createElement(EditableTextCell, {
                initialValue: value,
                depth: 0,
                onUpdate: (newValue) => {
                    options.onUpdate?.(row.index, accessorKey, newValue);
                }
            })
            : React.createElement('span', {}, value);
    },
});
/**
 * Creates a number column with optional inline editing
 */
const createNumberColumn = (accessorKey, header, options = {}) => ({
    accessorKey: accessorKey,
    header,
    footer: (info) => info.column.id,
    enableGrouping: options.enableGrouping,
    aggregationFn: options.aggregationFn,
    cell: ({ getValue, row }) => {
        const value = getValue();
        return options.enableEditing
            ? React.createElement(EditableNumberCell, {
                initialValue: value,
                depth: 0,
                onUpdate: (newValue) => {
                    options.onUpdate?.(row.index, accessorKey, newValue);
                }
            })
            : React.createElement('span', {}, value);
    },
});
/**
 * Creates a currency column with optional inline editing
 */
const createCurrencyColumn = (accessorKey, header, options = {}) => ({
    accessorKey: accessorKey,
    header,
    footer: (info) => info.column.id,
    enableGrouping: options.enableGrouping,
    aggregationFn: options.aggregationFn,
    cell: ({ getValue, row }) => {
        const value = getValue();
        return options.enableEditing
            ? React.createElement(EditableCurrencyCell, {
                initialValue: value,
                depth: 0,
                onUpdate: (newValue) => {
                    options.onUpdate?.(row.index, accessorKey, newValue);
                }
            })
            : React.createElement('span', {}, `$${(value)?.toLocaleString() || 'N/A'}`);
    },
});
/**
 * Creates a date column with optional inline editing
 */
const createDateColumn = (accessorKey, header, options = {}) => ({
    accessorKey: accessorKey,
    header,
    footer: (info) => info.column.id,
    enableGrouping: options.enableGrouping,
    cell: ({ getValue, row }) => {
        const value = getValue();
        return options.enableEditing
            ? React.createElement(EditableDateCell, {
                initialValue: value,
                depth: 0,
                onUpdate: (newValue) => {
                    options.onUpdate?.(row.index, accessorKey, newValue);
                }
            })
            : React.createElement('span', {}, value ? new Date(value).toLocaleDateString() : 'N/A');
    },
});
/**
 * Creates a select column with predefined options
 */
const createSelectColumn = (accessorKey, header, options) => ({
    accessorKey: accessorKey,
    header,
    footer: (info) => info.column.id,
    enableGrouping: options.enableGrouping,
    cell: ({ getValue, row }) => {
        const value = getValue();
        return options.enableEditing
            ? React.createElement(EditableSelectCell, {
                initialValue: value,
                depth: 0,
                options: options.selectOptions,
                getOptionStyles: options.getOptionStyles,
                onUpdate: (newValue) => {
                    options.onUpdate?.(row.index, accessorKey, newValue);
                }
            })
            : React.createElement('span', {
                className: options.getOptionStyles ? `px-2 py-1 rounded text-xs ${options.getOptionStyles(value)}` : ''
            }, value);
    },
});

const TABLE_PRESETS = {
    'basic-table': {
        name: 'Basic Table',
        description: 'Essential features for most use cases - sorting, filtering, and pagination',
        category: 'basic',
        tags: ['sorting', 'filtering', 'pagination', 'beginner-friendly'],
        recommendedDataSize: { min: 0, max: 1000 },
        features: {
            sorting: true,
            filtering: true,
            pagination: true,
            rowSelection: false,
            columnVisibility: false,
            columnResizing: false,
            columnPinning: false,
            rowExpansion: false,
            globalFiltering: false,
            grouping: false,
            inlineEditing: false,
            pivoting: false,
            virtualization: false,
            exporting: false,
        },
        performance: {
            debounceDelay: 300,
            enableMemoization: true,
            enablePerformanceLogging: false,
        }
    },
    'data-grid': {
        name: 'Data Grid',
        description: 'Full-featured data grid with all capabilities enabled',
        category: 'advanced',
        tags: ['full-featured', 'enterprise', 'advanced', 'all-features'],
        recommendedDataSize: { min: 100, max: 5000 },
        features: {
            sorting: true,
            filtering: true,
            pagination: true,
            rowSelection: true,
            columnVisibility: true,
            columnResizing: true,
            columnPinning: true,
            rowExpansion: true,
            globalFiltering: true,
            grouping: true,
            inlineEditing: true,
            pivoting: false, // Keep pivoting disabled as it's complex
            virtualization: false,
            exporting: true,
        },
        performance: {
            debounceDelay: 200,
            enableMemoization: true,
            enablePerformanceLogging: false,
            rendering: {
                enableBatchUpdates: true,
                renderThrottle: 16,
            }
        }
    },
    'simple-list': {
        name: 'Simple List',
        description: 'Minimal table for displaying simple data lists',
        category: 'basic',
        tags: ['minimal', 'simple', 'lightweight', 'read-only'],
        recommendedDataSize: { min: 0, max: 500 },
        features: {
            sorting: false,
            filtering: false,
            pagination: false,
            rowSelection: false,
            columnVisibility: false,
            columnResizing: false,
            columnPinning: false,
            rowExpansion: false,
            globalFiltering: false,
            grouping: false,
            inlineEditing: false,
            pivoting: false,
            virtualization: false,
            exporting: false,
        },
        performance: {
            debounceDelay: 0,
            enableMemoization: false,
            enablePerformanceLogging: false,
        }
    },
    'analytics-dashboard': {
        name: 'Analytics Dashboard',
        description: 'Optimized for analytics with grouping and aggregation features',
        category: 'specialized',
        tags: ['analytics', 'grouping', 'aggregation', 'dashboard'],
        recommendedDataSize: { min: 500, max: 10000 },
        features: {
            sorting: true,
            filtering: true,
            pagination: true,
            rowSelection: false,
            columnVisibility: true,
            columnResizing: true,
            columnPinning: false,
            rowExpansion: true,
            globalFiltering: true,
            grouping: true,
            inlineEditing: false,
            pivoting: false,
            virtualization: false,
            exporting: true,
        },
        performance: {
            debounceDelay: 250,
            enableMemoization: true,
            enablePerformanceLogging: false,
            rendering: {
                enableBatchUpdates: true,
                renderThrottle: 16,
            }
        }
    },
    'editable-form': {
        name: 'Editable Form',
        description: 'Table optimized for inline editing and data entry',
        category: 'specialized',
        tags: ['editable', 'form', 'data-entry', 'inline-editing'],
        recommendedDataSize: { min: 10, max: 1000 },
        features: {
            sorting: true,
            filtering: true,
            pagination: true,
            rowSelection: true,
            columnVisibility: false,
            columnResizing: true,
            columnPinning: false,
            rowExpansion: false,
            globalFiltering: true,
            grouping: false,
            inlineEditing: true,
            pivoting: false,
            virtualization: false,
            exporting: false,
        },
        performance: {
            debounceDelay: 500, // Longer debounce for editing
            enableMemoization: true,
            enablePerformanceLogging: false,
        }
    },
    'large-dataset': {
        name: 'Large Dataset',
        description: 'Optimized for handling large datasets with virtualization and essential features',
        category: 'performance',
        tags: ['virtualization', 'large-data', 'performance', 'scalable'],
        recommendedDataSize: { min: 5000, max: 100000 },
        features: {
            sorting: true,
            filtering: true,
            pagination: false, // Disable pagination when using virtualization
            rowSelection: true,
            columnVisibility: true,
            columnResizing: true,
            columnPinning: true,
            rowExpansion: false,
            globalFiltering: true,
            grouping: false, // Disable grouping for better virtualization performance
            inlineEditing: false,
            pivoting: false,
            virtualization: true,
            exporting: true,
        },
        performance: {
            debounceDelay: 100, // Faster debounce for large datasets
            enableMemoization: true,
            enablePerformanceLogging: true,
            virtualizationThreshold: 1000,
            virtualization: {
                enabled: true,
                rowHeight: 35,
                overscan: 10,
                containerHeight: 600,
            },
            memory: {
                enableGCHints: true,
                maxCachedRows: 2000,
            },
            rendering: {
                enableBatchUpdates: true,
                renderThrottle: 8, // Higher frequency for smooth scrolling
            }
        }
    }
};
const getPreset = (presetName) => {
    return TABLE_PRESETS[presetName];
};
const getPresetFeatures = (presetName) => {
    const preset = getPreset(presetName);
    return preset?.features;
};

function useTablePresets() {
    const [currentPreset, setCurrentPreset] = React.useState(null);
    const applyPreset = React.useCallback((presetName) => {
        const features = getPresetFeatures(presetName);
        if (features) {
            setCurrentPreset(presetName);
            return features;
        }
        return null;
    }, []);
    const getCurrentPresetInfo = React.useCallback(() => {
        if (!currentPreset)
            return null;
        return getPreset(currentPreset) || null;
    }, [currentPreset]);
    const isPresetActive = React.useCallback((presetName, currentFeatures) => {
        const presetFeatures = getPresetFeatures(presetName);
        if (!presetFeatures)
            return false;
        // Check if all features match the preset
        return Object.keys(presetFeatures).every(key => {
            const featureKey = key;
            return currentFeatures[featureKey] === presetFeatures[featureKey];
        });
    }, []);
    return {
        currentPreset,
        availablePresets: TABLE_PRESETS,
        applyPreset,
        getCurrentPresetInfo,
        isPresetActive,
    };
}

/**
 * Sample data for testing and demonstration purposes.
 * This is generic sample data that can be used to test the table component.
 * You can replace this with your own data structure.
 */
const defaultData = [
    // Sales Team
    {
        firstName: "Sarah",
        lastName: "Johnson",
        age: 32,
        visits: 245,
        status: "Married",
        progress: 85,
        department: "Sales",
        region: "North",
        salary: 75000,
        performance: "Excellent",
        joinDate: "2020-03-15",
        subRows: [
            {
                firstName: "Mike",
                lastName: "Johnson",
                age: 28,
                visits: 120,
                status: "Single",
                progress: 70,
                department: "Sales",
                region: "North",
                salary: 55000,
                performance: "Good",
                joinDate: "2022-01-10",
            },
        ],
    },
    {
        firstName: "David",
        lastName: "Chen",
        age: 29,
        visits: 180,
        status: "Single",
        progress: 92,
        department: "Sales",
        region: "West",
        salary: 68000,
        performance: "Excellent",
        joinDate: "2021-06-20",
    },
    {
        firstName: "Lisa",
        lastName: "Rodriguez",
        age: 35,
        visits: 320,
        status: "Married",
        progress: 78,
        department: "Sales",
        region: "South",
        salary: 82000,
        performance: "Good",
        joinDate: "2019-09-05",
    },
    // Marketing Team
    {
        firstName: "Emma",
        lastName: "Wilson",
        age: 27,
        visits: 95,
        status: "Single",
        progress: 88,
        department: "Marketing",
        region: "East",
        salary: 62000,
        performance: "Excellent",
        joinDate: "2022-02-14",
    },
    {
        firstName: "James",
        lastName: "Brown",
        age: 31,
        visits: 150,
        status: "Married",
        progress: 65,
        department: "Marketing",
        region: "North",
        salary: 58000,
        performance: "Average",
        joinDate: "2020-11-30",
    },
    {
        firstName: "Maria",
        lastName: "Garcia",
        age: 26,
        visits: 110,
        status: "Single",
        progress: 95,
        department: "Marketing",
        region: "West",
        salary: 65000,
        performance: "Excellent",
        joinDate: "2023-01-08",
    },
    // Engineering Team
    {
        firstName: "Alex",
        lastName: "Thompson",
        age: 34,
        visits: 75,
        status: "Married",
        progress: 90,
        department: "Engineering",
        region: "West",
        salary: 95000,
        performance: "Excellent",
        joinDate: "2018-05-12",
        subRows: [
            {
                firstName: "Ryan",
                lastName: "Thompson",
                age: 24,
                visits: 45,
                status: "Single",
                progress: 75,
                department: "Engineering",
                region: "West",
                salary: 72000,
                performance: "Good",
                joinDate: "2023-03-20",
            },
        ],
    },
    {
        firstName: "Priya",
        lastName: "Patel",
        age: 28,
        visits: 60,
        status: "Single",
        progress: 87,
        department: "Engineering",
        region: "East",
        salary: 88000,
        performance: "Excellent",
        joinDate: "2021-08-15",
    },
    {
        firstName: "Kevin",
        lastName: "Lee",
        age: 30,
        visits: 85,
        status: "Married",
        progress: 82,
        department: "Engineering",
        region: "North",
        salary: 92000,
        performance: "Good",
        joinDate: "2020-01-25",
    },
    // HR Team
    {
        firstName: "Jennifer",
        lastName: "Davis",
        age: 38,
        visits: 200,
        status: "Married",
        progress: 75,
        department: "HR",
        region: "East",
        salary: 70000,
        performance: "Good",
        joinDate: "2017-12-10",
    },
    {
        firstName: "Robert",
        lastName: "Miller",
        age: 45,
        visits: 180,
        status: "Divorced",
        progress: 68,
        department: "HR",
        region: "South",
        salary: 65000,
        performance: "Average",
        joinDate: "2019-04-18",
    },
    // Finance Team
    {
        firstName: "Amanda",
        lastName: "Taylor",
        age: 33,
        visits: 140,
        status: "Married",
        progress: 91,
        department: "Finance",
        region: "North",
        salary: 78000,
        performance: "Excellent",
        joinDate: "2020-07-22",
    },
    {
        firstName: "Daniel",
        lastName: "Anderson",
        age: 29,
        visits: 125,
        status: "Single",
        progress: 79,
        department: "Finance",
        region: "South",
        salary: 71000,
        performance: "Good",
        joinDate: "2021-10-05",
    },
];

function useAdvancedTable({ data, columns: customColumns, initialFeatures = {}, preset, performanceConfig, config, }) {
    // Enhanced configuration support - merge config with individual props
    const enhancedConfig = React.useMemo(() => {
        if (config) {
            return {
                data: config.data || data,
                columns: config.columns || customColumns,
                preset: config.preset || preset,
                features: config.features || initialFeatures,
                performance: config.performance || performanceConfig,
            };
        }
        return {
            data,
            columns: customColumns,
            preset,
            features: initialFeatures,
            performance: performanceConfig,
        };
    }, [config, data, customColumns, preset, initialFeatures, performanceConfig]);
    // Get preset features if preset is provided
    const presetFeatures = enhancedConfig.preset ? getPresetFeatures(enhancedConfig.preset) : {};
    // Feature toggles state - apply preset first, then features from config, then defaults
    const [enabled, setEnabled] = React.useState({
        sorting: true,
        filtering: true,
        pagination: true,
        rowSelection: false,
        columnVisibility: false,
        columnResizing: false,
        columnPinning: false,
        rowExpansion: false,
        globalFiltering: false,
        grouping: false,
        inlineEditing: false,
        pivoting: false,
        virtualization: false,
        exporting: true,
        ...presetFeatures,
        ...enhancedConfig.features,
    });
    // Table state management - support initial state from config
    const initialState = config?.initialState || {};
    const [sorting, setSorting] = React.useState(initialState.sorting || []);
    const [columnFilters, setColumnFilters] = React.useState(initialState.columnFilters || []);
    const [rowSelection, setRowSelection] = React.useState(initialState.rowSelection || {});
    const [columnVisibility, setColumnVisibility] = React.useState(initialState.columnVisibility || {});
    const [columnPinning, setColumnPinning] = React.useState(initialState.columnPinning || {});
    const [grouping, setGrouping] = React.useState(initialState.grouping || []);
    const [expanded, setExpanded] = React.useState(initialState.expanded || {});
    const [globalFilter, setGlobalFilter] = React.useState(initialState.globalFilter || '');
    // Performance optimizations - use enhanced configuration data and performance settings
    const finalData = enhancedConfig.data;
    // Use provided columns or create utility columns (row selection, expansion) if needed
    const utilityColumns = createUtilityColumns(enabled);
    const finalColumns = enhancedConfig.columns || utilityColumns;
    const finalPerformanceConfig = enhancedConfig.performance;
    const { memoizedData, memoizedColumns, computedState } = useTablePerformance(finalData, finalColumns, enabled, finalPerformanceConfig);
    // Use memoized columns for better performance
    const columns = memoizedColumns;
    // TanStack Table configuration - use memoized data for better performance
    const table = useReactTable({
        data: memoizedData,
        columns,
        state: {
            sorting,
            columnFilters,
            rowSelection,
            columnVisibility,
            columnPinning,
            grouping,
            expanded,
            globalFilter,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onRowSelectionChange: setRowSelection,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnPinningChange: setColumnPinning,
        onGroupingChange: setGrouping,
        onExpandedChange: setExpanded,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: enabled.filtering ? getFilteredRowModel() : undefined,
        getSortedRowModel: enabled.sorting ? getSortedRowModel() : undefined,
        getPaginationRowModel: enabled.pagination ? getPaginationRowModel() : undefined,
        getGroupedRowModel: enabled.grouping ? getGroupedRowModel() : undefined,
        getExpandedRowModel: enabled.rowExpansion ? getExpandedRowModel() : undefined,
        enableSorting: enabled.sorting,
        enableColumnFilters: enabled.filtering,
        enableRowSelection: enabled.rowSelection,
        enableColumnResizing: enabled.columnResizing,
        enableColumnPinning: enabled.columnPinning,
        enableGrouping: enabled.grouping,
        enableExpanding: enabled.rowExpansion,
        enableGlobalFilter: enabled.globalFiltering,
        columnResizeMode: 'onChange',
        getSubRows: (row) => row.subRows,
    });
    // Feature toggle function - keep existing implementation
    function toggleFeature(feature) {
        setEnabled((prev) => ({ ...prev, [feature]: !prev[feature] }));
    }
    // Debounced handlers for better performance - use enhanced config settings
    const debounceDelay = finalPerformanceConfig?.debounceDelay || performanceConfig?.debounceDelay || 300;
    const debouncedSetGlobalFilter = useDebounce(setGlobalFilter, debounceDelay);
    const debouncedSetColumnFilters = useDebounce(setColumnFilters, debounceDelay);
    // Grouping handlers - keep existing implementation
    const handleGroupChange = (columnId) => {
        setGrouping(prev => [...prev, columnId]);
    };
    const handleRemoveGroup = (columnId) => {
        setGrouping(prev => prev.filter(id => id !== columnId));
    };
    // Return all the state and handlers needed by the component
    return {
        table,
        features: enabled,
        toggleFeature,
        // Table state
        sorting,
        setSorting,
        columnFilters,
        setColumnFilters,
        rowSelection,
        setRowSelection,
        columnVisibility,
        setColumnVisibility,
        columnPinning,
        setColumnPinning,
        grouping,
        setGrouping,
        expanded,
        setExpanded,
        globalFilter,
        setGlobalFilter,
        // Debounced handlers for performance
        debouncedSetGlobalFilter,
        debouncedSetColumnFilters,
        // Grouping handlers
        handleGroupChange,
        handleRemoveGroup,
        // Performance state
        computedState,
    };
}

/**
 * Validation error codes for programmatic handling
 */
exports.ValidationErrorCode = void 0;
(function (ValidationErrorCode) {
    ValidationErrorCode["MISSING_DATA"] = "MISSING_DATA";
    ValidationErrorCode["MISSING_COLUMNS"] = "MISSING_COLUMNS";
    ValidationErrorCode["INVALID_DATA_TYPE"] = "INVALID_DATA_TYPE";
    ValidationErrorCode["INVALID_COLUMNS_TYPE"] = "INVALID_COLUMNS_TYPE";
    ValidationErrorCode["MISSING_COLUMN_ID"] = "MISSING_COLUMN_ID";
    ValidationErrorCode["INVALID_PRESET"] = "INVALID_PRESET";
    ValidationErrorCode["INVALID_PERFORMANCE_CONFIG"] = "INVALID_PERFORMANCE_CONFIG";
    ValidationErrorCode["CONFLICTING_FEATURES"] = "CONFLICTING_FEATURES";
    ValidationErrorCode["INVALID_VIRTUALIZATION_CONFIG"] = "INVALID_VIRTUALIZATION_CONFIG";
    ValidationErrorCode["INVALID_THEME_CONFIG"] = "INVALID_THEME_CONFIG";
    ValidationErrorCode["INVALID_ACCESSIBILITY_CONFIG"] = "INVALID_ACCESSIBILITY_CONFIG";
    ValidationErrorCode["INVALID_EXPORT_CONFIG"] = "INVALID_EXPORT_CONFIG";
    ValidationErrorCode["CIRCULAR_DEPENDENCY"] = "CIRCULAR_DEPENDENCY";
})(exports.ValidationErrorCode || (exports.ValidationErrorCode = {}));
/**
 * Validation warning codes for programmatic handling
 */
exports.ValidationWarningCode = void 0;
(function (ValidationWarningCode) {
    ValidationWarningCode["EMPTY_DATA"] = "EMPTY_DATA";
    ValidationWarningCode["MISSING_COLUMN_HEADER"] = "MISSING_COLUMN_HEADER";
    ValidationWarningCode["LARGE_DATASET_WITHOUT_VIRTUALIZATION"] = "LARGE_DATASET_WITHOUT_VIRTUALIZATION";
    ValidationWarningCode["CONFLICTING_FEATURE_COMBINATION"] = "CONFLICTING_FEATURE_COMBINATION";
    ValidationWarningCode["PERFORMANCE_CONCERN"] = "PERFORMANCE_CONCERN";
    ValidationWarningCode["ACCESSIBILITY_CONCERN"] = "ACCESSIBILITY_CONCERN";
    ValidationWarningCode["DEPRECATED_CONFIG"] = "DEPRECATED_CONFIG";
    ValidationWarningCode["SUBOPTIMAL_CONFIG"] = "SUBOPTIMAL_CONFIG";
})(exports.ValidationWarningCode || (exports.ValidationWarningCode = {}));
/**
 * Comprehensive configuration validator with extensible rule system
 */
class ConfigValidator {
    /**
     * Register a custom validation rule
     */
    static registerRule(rule) {
        this.rules.set(rule.id, rule);
    }
    /**
     * Unregister a validation rule
     */
    static unregisterRule(ruleId) {
        this.rules.delete(ruleId);
    }
    /**
     * Get all registered rules
     */
    static getRules() {
        return Array.from(this.rules.values());
    }
    /**
     * Clear validation cache
     */
    static clearCache() {
        this.cache.clear();
    }
    /**
     * Validate a table configuration with comprehensive checks
     */
    static validate(config, options) {
        const startTime = performance.now();
        const configHash = this.generateConfigHash(config);
        // Check cache if enabled
        if (options?.useCache && this.cache.has(configHash)) {
            const cached = this.cache.get(configHash);
            return { ...cached, timestamp: new Date() };
        }
        const errors = [];
        const warnings = [];
        const suggestions = [];
        let rulesExecuted = 0;
        // Execute built-in validation rules
        this.validateRequired(config, errors);
        this.validateDataStructure(config, errors, warnings);
        this.validateColumns(config, errors, warnings);
        this.validateFeatures(config, errors, warnings, suggestions);
        this.validatePerformance(config, warnings, suggestions);
        this.validateAccessibility(config, warnings, suggestions);
        this.validateTheme(config, warnings);
        this.validateExport(config, warnings);
        this.validatePreset(config, errors, warnings);
        rulesExecuted += 9; // Built-in rules count
        // Execute custom rules
        const applicableRules = Array.from(this.rules.values())
            .filter(rule => !options?.ruleFilter || options.ruleFilter(rule))
            .filter(rule => !rule.condition || rule.condition(config));
        for (const rule of applicableRules) {
            try {
                const ruleResult = rule.validate(config);
                if (ruleResult) {
                    errors.push(...ruleResult.errors);
                    warnings.push(...ruleResult.warnings);
                    suggestions.push(...ruleResult.suggestions);
                }
                rulesExecuted++;
            }
            catch (error) {
                console.warn(`Validation rule '${rule.id}' failed:`, error);
            }
        }
        const endTime = performance.now();
        const result = {
            isValid: errors.length === 0,
            errors,
            warnings,
            suggestions,
            timestamp: new Date(),
            configHash,
            ...(options?.includeMetrics && {
                metrics: {
                    validationTime: endTime - startTime,
                    rulesExecuted,
                },
            }),
        };
        // Cache result if enabled
        if (options?.useCache) {
            this.cache.set(configHash, result);
        }
        return result;
    }
    /**
     * Quick validation check - returns only boolean result
     */
    static isValid(config) {
        return this.validate(config, { useCache: true }).isValid;
    }
    /**
     * Get only validation errors
     */
    static getErrors(config) {
        return this.validate(config, { useCache: true }).errors;
    }
    /**
     * Get only validation warnings
     */
    static getWarnings(config) {
        return this.validate(config, { useCache: true }).warnings;
    }
    /**
     * Get only validation suggestions
     */
    static getSuggestions(config) {
        return this.validate(config, { useCache: true }).suggestions;
    }
    /**
     * Validate required fields
     */
    static validateRequired(config, errors) {
        if (!config.data) {
            errors.push({
                code: exports.ValidationErrorCode.MISSING_DATA,
                message: 'Data is required for table configuration',
                path: 'data',
                fix: 'Provide an array of data objects: { data: [{ ... }] }',
            });
        }
        if (!config.columns) {
            errors.push({
                code: exports.ValidationErrorCode.MISSING_COLUMNS,
                message: 'Columns are required for table configuration',
                path: 'columns',
                fix: 'Provide an array of column definitions: { columns: [{ id: "...", header: "..." }] }',
            });
        }
    }
    /**
     * Validate data structure and types
     */
    static validateDataStructure(config, errors, warnings) {
        if (config.data) {
            if (!Array.isArray(config.data)) {
                errors.push({
                    code: exports.ValidationErrorCode.INVALID_DATA_TYPE,
                    message: 'Data must be an array',
                    path: 'data',
                    fix: 'Ensure data is an array: { data: [...] }',
                });
            }
            else if (config.data.length === 0) {
                warnings.push({
                    code: exports.ValidationWarningCode.EMPTY_DATA,
                    message: 'Data array is empty - table will show no content',
                    path: 'data',
                    suggestion: 'Consider providing sample data or an empty state component',
                });
            }
        }
        if (config.columns) {
            if (!Array.isArray(config.columns)) {
                errors.push({
                    code: exports.ValidationErrorCode.INVALID_COLUMNS_TYPE,
                    message: 'Columns must be an array',
                    path: 'columns',
                    fix: 'Ensure columns is an array: { columns: [...] }',
                });
            }
            else if (config.columns.length === 0) {
                errors.push({
                    code: exports.ValidationErrorCode.MISSING_COLUMNS,
                    message: 'At least one column definition is required',
                    path: 'columns',
                    fix: 'Add at least one column definition',
                });
            }
        }
    }
    /**
     * Validate column definitions
     */
    static validateColumns(config, errors, warnings) {
        if (!config.columns || !Array.isArray(config.columns))
            return;
        config.columns.forEach((column, index) => {
            const columnPath = `columns[${index}]`;
            // Check for required identifiers
            if (!column.id && !column.accessorKey && !column.accessorFn) {
                errors.push({
                    code: exports.ValidationErrorCode.MISSING_COLUMN_ID,
                    message: `Column at index ${index} is missing identifier`,
                    path: columnPath,
                    fix: 'Provide either id, accessorKey, or accessorFn: { id: "columnId" } or { accessorKey: "dataProperty" }',
                });
            }
            // Check for headers (UX warning)
            if (!column.header) {
                warnings.push({
                    code: exports.ValidationWarningCode.MISSING_COLUMN_HEADER,
                    message: `Column at index ${index} is missing header`,
                    path: `${columnPath}.header`,
                    suggestion: 'Provide a header for better user experience: { header: "Column Title" }',
                });
            }
            // Check for duplicate IDs
            const columnId = column.id || column.accessorKey;
            if (columnId) {
                const duplicates = config.columns.filter((col, idx) => idx !== index && (col.id === columnId || col.accessorKey === columnId));
                if (duplicates.length > 0) {
                    errors.push({
                        code: exports.ValidationErrorCode.MISSING_COLUMN_ID,
                        message: `Duplicate column identifier '${columnId}' found`,
                        path: columnPath,
                        fix: 'Ensure all column identifiers are unique',
                    });
                }
            }
        });
    }
    /**
     * Validate feature configurations
     */
    static validateFeatures(config, errors, warnings, suggestions) {
        if (!config.features)
            return;
        // Check for conflicting features
        if (config.features.virtualization && config.features.pagination) {
            warnings.push({
                code: exports.ValidationWarningCode.CONFLICTING_FEATURE_COMBINATION,
                message: 'Virtualization and pagination should not be used together',
                path: 'features',
                suggestion: 'Disable pagination when using virtualization for better performance',
            });
        }
        // Check for grouping with virtualization
        if (config.features.virtualization && config.features.grouping) {
            warnings.push({
                code: exports.ValidationWarningCode.CONFLICTING_FEATURE_COMBINATION,
                message: 'Virtualization with grouping may cause performance issues',
                path: 'features',
                suggestion: 'Consider disabling grouping or virtualization for better performance',
            });
        }
        // Suggest features for large datasets
        if (config.data && config.data.length > 1000) {
            if (!config.features.virtualization) {
                suggestions.push({
                    type: 'performance',
                    message: 'Consider enabling virtualization for large datasets (>1000 rows)',
                    path: 'features.virtualization',
                    priority: 'high',
                });
            }
            if (!config.features.pagination) {
                suggestions.push({
                    type: 'performance',
                    message: 'Consider enabling pagination for large datasets',
                    path: 'features.pagination',
                    priority: 'medium',
                });
            }
        }
    }
    /**
     * Validate performance configuration
     */
    static validatePerformance(config, warnings, suggestions) {
        const perf = config.performance;
        if (!perf)
            return;
        // Validate virtualization settings
        if (perf.virtualization?.enabled) {
            if (!perf.virtualization.rowHeight || perf.virtualization.rowHeight <= 0) {
                warnings.push({
                    code: exports.ValidationWarningCode.PERFORMANCE_CONCERN,
                    message: 'Invalid row height for virtualization',
                    path: 'performance.virtualization.rowHeight',
                    suggestion: 'Provide a positive row height value (e.g., 35)',
                });
            }
            if (perf.virtualization.overscan && perf.virtualization.overscan < 0) {
                warnings.push({
                    code: exports.ValidationWarningCode.PERFORMANCE_CONCERN,
                    message: 'Overscan value should be non-negative',
                    path: 'performance.virtualization.overscan',
                    suggestion: 'Use a non-negative overscan value (e.g., 5)',
                });
            }
        }
        // Validate debounce settings
        if (perf.debounceDelay && perf.debounceDelay < 0) {
            warnings.push({
                code: exports.ValidationWarningCode.PERFORMANCE_CONCERN,
                message: 'Debounce delay should be non-negative',
                path: 'performance.debounceDelay',
                suggestion: 'Use a non-negative debounce delay (e.g., 300)',
            });
        }
        // Performance suggestions
        if (config.data && config.data.length > 500 && !perf.enableMemoization) {
            suggestions.push({
                type: 'performance',
                message: 'Consider enabling memoization for better performance with medium-large datasets',
                path: 'performance.enableMemoization',
                priority: 'medium',
            });
        }
    }
    /**
     * Validate accessibility configuration
     */
    static validateAccessibility(config, warnings, suggestions) {
        const a11y = config.accessibility;
        if (!a11y?.ariaLabel && !a11y?.ariaDescription) {
            suggestions.push({
                type: 'accessibility',
                message: 'Consider adding ARIA labels for better screen reader support',
                path: 'accessibility.ariaLabel',
                priority: 'medium',
            });
        }
        if (a11y?.keyboardNavigation === false) {
            warnings.push({
                code: exports.ValidationWarningCode.ACCESSIBILITY_CONCERN,
                message: 'Disabling keyboard navigation reduces accessibility',
                path: 'accessibility.keyboardNavigation',
                suggestion: 'Keep keyboard navigation enabled for better accessibility',
            });
        }
        if (a11y?.screenReaderAnnouncements === false) {
            suggestions.push({
                type: 'accessibility',
                message: 'Screen reader announcements improve accessibility for dynamic content',
                path: 'accessibility.screenReaderAnnouncements',
                priority: 'medium',
            });
        }
    }
    /**
     * Validate theme configuration
     */
    static validateTheme(config, warnings) {
        const theme = config.theme;
        if (!theme)
            return;
        // Validate color scheme
        if (theme.colorScheme && !['light', 'dark', 'auto'].includes(theme.colorScheme)) {
            warnings.push({
                code: exports.ValidationWarningCode.SUBOPTIMAL_CONFIG,
                message: 'Invalid color scheme value',
                path: 'theme.colorScheme',
                suggestion: 'Use "light", "dark", or "auto"',
            });
        }
        // Validate variant
        const validVariants = ['default', 'minimal', 'enterprise', 'compact', 'spacious'];
        if (theme.variant && !validVariants.includes(theme.variant)) {
            warnings.push({
                code: exports.ValidationWarningCode.SUBOPTIMAL_CONFIG,
                message: 'Invalid theme variant',
                path: 'theme.variant',
                suggestion: `Use one of: ${validVariants.join(', ')}`,
            });
        }
    }
    /**
     * Validate export configuration
     */
    static validateExport(config, warnings) {
        const exportConfig = config.export;
        if (!exportConfig)
            return;
        // Validate CSV settings
        if (exportConfig.csv?.enabled && exportConfig.csv.delimiter) {
            if (exportConfig.csv.delimiter.length !== 1) {
                warnings.push({
                    code: exports.ValidationWarningCode.SUBOPTIMAL_CONFIG,
                    message: 'CSV delimiter should be a single character',
                    path: 'export.csv.delimiter',
                    suggestion: 'Use a single character like "," or ";"',
                });
            }
        }
        // Validate print settings
        if (exportConfig.print?.enabled && exportConfig.print.paperSize) {
            const validSizes = ['A4', 'letter', 'legal'];
            if (!validSizes.includes(exportConfig.print.paperSize)) {
                warnings.push({
                    code: exports.ValidationWarningCode.SUBOPTIMAL_CONFIG,
                    message: 'Invalid paper size for print export',
                    path: 'export.print.paperSize',
                    suggestion: `Use one of: ${validSizes.join(', ')}`,
                });
            }
        }
    }
    /**
     * Validate preset configuration
     */
    static validatePreset(config, errors, warnings) {
        if (!config.preset)
            return;
        // This would typically check against available presets
        // For now, we'll validate the preset name format
        if (typeof config.preset !== 'string' || config.preset.trim().length === 0) {
            errors.push({
                code: exports.ValidationErrorCode.INVALID_PRESET,
                message: 'Preset name must be a non-empty string',
                path: 'preset',
                fix: 'Provide a valid preset name like "basic-table" or "data-grid"',
            });
        }
    }
    /**
     * Generate a hash for configuration caching
     */
    static generateConfigHash(config) {
        // Simple hash generation for caching purposes
        const configString = JSON.stringify({
            dataLength: config.data?.length || 0,
            columnsLength: config.columns?.length || 0,
            preset: config.preset,
            features: config.features,
            performance: config.performance,
            theme: config.theme,
            accessibility: config.accessibility,
            export: config.export,
        });
        let hash = 0;
        for (let i = 0; i < configString.length; i++) {
            const char = configString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(36);
    }
}
ConfigValidator.rules = new Map();
ConfigValidator.cache = new Map();
/**
 * Built-in validation rules that can be extended
 */
const BuiltInValidationRules = {
    /**
     * Rule to check for required fields
     */
    REQUIRED_FIELDS: {
        id: 'required-fields',
        description: 'Validates that required configuration fields are present',
        category: 'error',
        priority: 'critical',
        validate: (config) => {
            const errors = [];
            if (!config.data) {
                errors.push({
                    code: exports.ValidationErrorCode.MISSING_DATA,
                    message: 'Data is required',
                    path: 'data',
                    fix: 'Provide data array',
                });
            }
            if (!config.columns) {
                errors.push({
                    code: exports.ValidationErrorCode.MISSING_COLUMNS,
                    message: 'Columns are required',
                    path: 'columns',
                    fix: 'Provide columns array',
                });
            }
            return {
                isValid: errors.length === 0,
                errors,
                warnings: [],
                suggestions: [],
                timestamp: new Date(),
            };
        },
    },
    /**
     * Rule to check for performance optimizations
     */
    PERFORMANCE_OPTIMIZATION: {
        id: 'performance-optimization',
        description: 'Suggests performance optimizations based on data size',
        category: 'suggestion',
        priority: 'medium',
        validate: (config) => {
            const suggestions = [];
            if (config.data && config.data.length > 1000 && !config.features?.virtualization) {
                suggestions.push({
                    type: 'performance',
                    message: 'Enable virtualization for large datasets',
                    path: 'features.virtualization',
                    priority: 'high',
                });
            }
            return {
                isValid: true,
                errors: [],
                warnings: [],
                suggestions,
                timestamp: new Date(),
            };
        },
    },
};
// Register built-in rules
Object.values(BuiltInValidationRules).forEach(rule => {
    ConfigValidator.registerRule(rule);
});
/**
 * Utility functions for validation
 */
const ValidationUtils = {
    /**
     * Create a validation error
     */
    createError(code, message, path, fix) {
        return { code, message, path, fix };
    },
    /**
     * Create a validation warning
     */
    createWarning(code, message, path, suggestion) {
        return { code, message, path, suggestion };
    },
    /**
     * Create a validation suggestion
     */
    createSuggestion(type, message, priority, path) {
        return { type, message, priority, path };
    },
    /**
     * Format validation results for display
     */
    formatResults(result) {
        const lines = [];
        if (result.errors.length > 0) {
            lines.push('❌ Errors:');
            result.errors.forEach(error => {
                lines.push(`  • ${error.message} (${error.path})`);
                if (error.fix) {
                    lines.push(`    Fix: ${error.fix}`);
                }
            });
        }
        if (result.warnings.length > 0) {
            lines.push('⚠️  Warnings:');
            result.warnings.forEach(warning => {
                lines.push(`  • ${warning.message} (${warning.path})`);
                if (warning.suggestion) {
                    lines.push(`    Suggestion: ${warning.suggestion}`);
                }
            });
        }
        if (result.suggestions.length > 0) {
            lines.push('💡 Suggestions:');
            result.suggestions.forEach(suggestion => {
                lines.push(`  • ${suggestion.message} [${suggestion.priority}]`);
            });
        }
        if (result.isValid && result.errors.length === 0 && result.warnings.length === 0) {
            lines.push('✅ Configuration is valid');
        }
        return lines.join('\n');
    },
};

/**
 * Helper function to create TanStack Table columns from simplified configuration
 */
function createColumnDef(config) {
    const { key, header, type = "text", sortable = true, filterable = true, resizable = true, width, minWidth, maxWidth, aggregationFn, cell, headerCell, options = [], format, className, style, } = config;
    const columnDef = {
        accessorKey: key,
        header: headerCell ? headerCell : header,
        enableSorting: sortable,
        enableColumnFilter: filterable,
        enableResizing: resizable,
        size: width,
        minSize: minWidth,
        maxSize: maxWidth,
        aggregationFn: aggregationFn,
    };
    // Custom cell renderer or auto-generate based on type
    if (cell) {
        columnDef.cell = ({ getValue, row, column }) => cell({ value: getValue(), row: row.original, column });
    }
    else {
        columnDef.cell = ({ getValue }) => {
            const value = getValue();
            return createCellRenderer(type, value, options, format, className, style);
        };
    }
    return columnDef;
}
/**
 * Auto-generate cell renderer based on column type
 */
function createCellRenderer(type, value, options, format, className, style) {
    if (value == null) {
        return React.createElement('span', { className: 'text-gray-400' }, 'N/A');
    }
    // Use custom format function if provided
    if (format) {
        return React.createElement('span', { className, style }, format(value));
    }
    const baseProps = { className, style };
    switch (type) {
        case "text":
            return React.createElement('span', baseProps, String(value));
        case "number":
            return React.createElement('span', baseProps, Number(value).toLocaleString());
        case "currency":
            return React.createElement('span', baseProps, new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(Number(value)));
        case "percentage":
            return React.createElement('span', baseProps, `${Number(value)}%`);
        case "date":
            const date = new Date(value);
            return React.createElement('span', baseProps, isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString());
        case "boolean":
            return React.createElement('span', {
                ...baseProps,
                className: `px-2 py-1 rounded text-xs ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} ${className || ''}`
            }, value ? 'Yes' : 'No');
        case "email":
            return React.createElement('a', {
                ...baseProps,
                href: `mailto:${value}`,
                className: `text-blue-600 hover:underline ${className || ''}`
            }, String(value));
        case "url":
            return React.createElement('a', {
                ...baseProps,
                href: String(value),
                target: '_blank',
                rel: 'noopener noreferrer',
                className: `text-blue-600 hover:underline ${className || ''}`
            }, String(value));
        case "select":
            const option = options.find(opt => opt.value === value);
            const optionLabel = option?.label || String(value);
            const optionColor = option?.color;
            return React.createElement('span', {
                ...baseProps,
                className: `px-2 py-1 rounded text-xs ${optionColor || 'bg-gray-100 text-gray-800'} ${className || ''}`
            }, optionLabel);
        case "multiselect":
            if (!Array.isArray(value))
                return React.createElement('span', baseProps, 'N/A');
            return React.createElement('div', { className: 'flex flex-wrap gap-1' }, value.map((item, index) => {
                const option = options.find(opt => opt.value === item);
                const optionLabel = option?.label || String(item);
                const optionColor = option?.color;
                return React.createElement('span', {
                    key: index,
                    className: `px-1 py-0.5 rounded text-xs ${optionColor || 'bg-gray-100 text-gray-800'}`
                }, optionLabel);
            }));
        default:
            return React.createElement('span', baseProps, String(value));
    }
}
/**
 * Helper to create multiple columns at once
 */
function createColumns(configs) {
    return configs.map(config => createColumnDef(config));
}
/**
 * Predefined column configurations for common data types
 */
const ColumnPresets = {
    id: (key = 'id') => ({
        key,
        header: 'ID',
        type: 'number',
        width: 80,
        pinned: 'left',
    }),
    name: (key = 'name') => ({
        key,
        header: 'Name',
        type: 'text',
        sortable: true,
        filterable: true,
    }),
    email: (key = 'email') => ({
        key,
        header: 'Email',
        type: 'email',
        sortable: true,
        filterable: true,
    }),
    date: (key, header) => ({
        key,
        header,
        type: 'date',
        sortable: true,
        filterable: true,
    }),
    currency: (key, header) => ({
        key,
        header,
        type: 'currency',
        sortable: true,
        aggregationFn: 'sum',
    }),
    status: (key = 'status', options = []) => ({
        key,
        header: 'Status',
        type: 'select',
        options,
        filterable: true,
    }),
    boolean: (key, header) => ({
        key,
        header,
        type: 'boolean',
        filterable: true,
    }),
    actions: (cell) => ({
        key: 'actions',
        header: 'Actions',
        type: 'custom',
        sortable: false,
        filterable: false,
        resizable: false,
        cell,
        pinned: 'right',
        width: 120,
    }),
};
/**
 * Helper to infer column types from data
 */
function inferColumnTypes(data, sampleSize = 10) {
    if (!data.length)
        return [];
    const sample = data.slice(0, sampleSize);
    const keys = Object.keys(sample[0]);
    return keys.map(key => {
        const values = sample.map(row => row[key]).filter(val => val != null);
        let type = 'text';
        if (values.length > 0) {
            const firstValue = values[0];
            if (typeof firstValue === 'number') {
                type = 'number';
            }
            else if (typeof firstValue === 'boolean') {
                type = 'boolean';
            }
            else if (firstValue instanceof Date ||
                (typeof firstValue === 'string' && !isNaN(Date.parse(firstValue)))) {
                type = 'date';
            }
            else if (typeof firstValue === 'string') {
                if (firstValue.includes('@')) {
                    type = 'email';
                }
                else if (firstValue.startsWith('http')) {
                    type = 'url';
                }
                else if (firstValue.startsWith('$') || key.toString().toLowerCase().includes('price') || key.toString().toLowerCase().includes('cost')) {
                    type = 'currency';
                }
            }
        }
        return {
            key,
            header: String(key).replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
            type,
        };
    });
}

exports.BuiltInValidationRules = BuiltInValidationRules;
exports.CSVExportConfigBuilder = CSVExportConfigBuilder;
exports.ColumnPresets = ColumnPresets;
exports.ConfigValidator = ConfigValidator;
exports.DepartmentCell = DepartmentCell;
exports.DragDropArea = DragDropArea;
exports.EditableCell = EditableCell;
exports.EnhancedTableView = EnhancedTableView;
exports.ExcelExportConfigBuilder = ExcelExportConfigBuilder;
exports.ExportConfigBuilder = ExportConfigBuilder;
exports.PresetSelector = PresetSelector;
exports.PrintExportConfigBuilder = PrintExportConfigBuilder;
exports.ProgressCell = ProgressCell;
exports.RegionCell = RegionCell;
exports.ReusableAdvancedTable = ReusableAdvancedTable;
exports.StatusCell = StatusCell;
exports.TableControls = TableControls;
exports.TableExportUtils = TableExportUtils;
exports.ThemeSelector = ThemeSelector;
exports.ValidationUtils = ValidationUtils;
exports.VirtualizedTableView = VirtualizedTableView;
exports.createColumnDef = createColumnDef;
exports.createColumns = createColumns;
exports.createCurrencyColumn = createCurrencyColumn;
exports.createDateColumn = createDateColumn;
exports.createNumberColumn = createNumberColumn;
exports.createSelectColumn = createSelectColumn;
exports.createTextColumn = createTextColumn;
exports.createUtilityColumns = createUtilityColumns;
exports.defaultData = defaultData;
exports.getPreset = getPreset$1;
exports.inferColumnTypes = inferColumnTypes;
exports.useAdvancedTable = useAdvancedTable;
exports.useDebounce = useDebounce;
exports.useKeyboardNavigation = useKeyboardNavigation;
exports.useTableExport = useTableExport;
exports.useTablePerformance = useTablePerformance;
exports.useTablePresets = useTablePresets;
exports.useTableTheme = useTableTheme;
//# sourceMappingURL=index.js.map
