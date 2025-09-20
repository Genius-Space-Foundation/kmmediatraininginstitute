import React, { useState, useMemo } from "react";
import {
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Download,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";

export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
}

export interface Action {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: any) => void;
  className?: string;
  condition?: (row: any) => boolean;
}

export interface DataTableProps {
  data: any[];
  columns: Column[];
  actions?: Action[];
  searchTerm?: string;
  filters?: Record<string, any>;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (key: string, direction: "asc" | "desc") => void;
  onExport?: (format: "csv" | "json") => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  selectable?: boolean;
  selectedRows?: any[];
  onSelectionChange?: (selectedRows: any[]) => void;
}

const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  actions = [],
  searchTerm = "",
  filters = {},
  sortBy,
  sortDirection = "asc",
  onSort,
  onExport,
  pagination,
  loading = false,
  emptyMessage = "No data available",
  className = "",
  selectable = false,
  selectedRows = [],
  onSelectionChange,
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter((row) =>
        columns.some((column) => {
          const value = row[column.key];
          return (
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        if (Array.isArray(value)) {
          filtered = filtered.filter((row) => value.includes(row[key]));
        } else {
          filtered = filtered.filter(
            (row) =>
              row[key] &&
              row[key]
                .toString()
                .toLowerCase()
                .includes(value.toString().toLowerCase())
          );
        }
      }
    });

    return filtered;
  }, [data, searchTerm, filters, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortBy || !onSort) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortBy, sortDirection, onSort]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const start = (pagination.page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, pagination]);

  const handleSort = (key: string) => {
    if (!onSort) return;

    const newDirection =
      sortBy === key && sortDirection === "asc" ? "desc" : "asc";
    onSort(key, newDirection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;

    if (checked) {
      onSelectionChange(paginatedData);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (row: any, checked: boolean) => {
    if (!onSelectionChange) return;

    if (checked) {
      onSelectionChange([...selectedRows, row]);
    } else {
      onSelectionChange(selectedRows.filter((r) => r.id !== row.id));
    }
  };

  const isRowSelected = (row: any) => {
    return selectedRows.some((r) => r.id === row.id);
  };

  const toggleRowExpansion = (rowId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow ${className}`}>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-medium text-gray-900">
              Data Table ({filteredData.length} items)
            </h3>
            {selectedRows.length > 0 && (
              <span className="text-sm text-gray-600">
                {selectedRows.length} selected
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {onExport && (
              <div className="flex space-x-2">
                <button
                  onClick={() => onExport("csv")}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </button>
                <button
                  onClick={() => onExport("json")}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  JSON
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      paginatedData.length > 0 &&
                      paginatedData.every((row) => isRowSelected(row))
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-${
                    column.align || "left"
                  } text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? "cursor-pointer hover:bg-gray-100" : ""
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp
                          className={`h-3 w-3 ${
                            sortBy === column.key && sortDirection === "asc"
                              ? "text-blue-600"
                              : "text-gray-400"
                          }`}
                        />
                        <ChevronDown
                          className={`h-3 w-3 -mt-1 ${
                            sortBy === column.key && sortDirection === "desc"
                              ? "text-blue-600"
                              : "text-gray-400"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (selectable ? 1 : 0) +
                    (actions.length > 0 ? 1 : 0)
                  }
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={row.id || index}
                  className={`hover:bg-gray-50 ${
                    isRowSelected(row) ? "bg-blue-50" : ""
                  }`}
                >
                  {selectable && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={isRowSelected(row)}
                        onChange={(e) => handleSelectRow(row, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 text-${
                        column.align || "left"
                      } text-sm text-gray-900`}
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {actions
                          .filter(
                            (action) =>
                              !action.condition || action.condition(row)
                          )
                          .map((action, actionIndex) => (
                            <button
                              key={actionIndex}
                              onClick={() => action.onClick(row)}
                              className={`p-1 text-gray-400 hover:text-gray-600 ${
                                action.className || ""
                              }`}
                              title={action.label}
                            >
                              {action.icon || (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </button>
                          ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
                {Math.min(
                  pagination.page * pagination.pageSize,
                  pagination.total
                )}{" "}
                of {pagination.total} results
              </span>
              <select
                value={pagination.pageSize}
                onChange={(e) =>
                  pagination.onPageSizeChange(Number(e.target.value))
                }
                className="ml-4 px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-700">
                Page {pagination.page} of{" "}
                {Math.ceil(pagination.total / pagination.pageSize)}
              </span>
              <button
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={
                  pagination.page >=
                  Math.ceil(pagination.total / pagination.pageSize)
                }
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;










