import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  X,
  Calendar,
  User,
  Tag,
  ChevronDown,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export interface FilterOption {
  key: string;
  label: string;
  type: "text" | "select" | "date" | "dateRange" | "multiselect";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters: FilterOption[];
  activeFilters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
  className?: string;
  placeholder?: string;
  showAdvanced?: boolean;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  onSearchChange,
  filters,
  activeFilters,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
  className = "",
  placeholder = "Search...",
  showAdvanced = true,
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [localFilters, setLocalFilters] =
    useState<Record<string, any>>(activeFilters);

  useEffect(() => {
    setLocalFilters(activeFilters);
  }, [activeFilters]);

  const handleFilterChange = (key: string, value: any) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApplyFilters = () => {
    Object.entries(localFilters).forEach(([key, value]) => {
      onFilterChange(key, value);
    });
    onApplyFilters();
    setIsAdvancedOpen(false);
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    onClearFilters();
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).filter(
      (value) =>
        value !== null &&
        value !== undefined &&
        value !== "" &&
        (Array.isArray(value) ? value.length > 0 : true)
    ).length;
  };

  const renderFilterInput = (filter: FilterOption) => {
    const value = localFilters[filter.key] || "";

    switch (filter.type) {
      case "text":
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            placeholder={filter.placeholder || `Filter by ${filter.label}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );

      case "select":
        return (
          <select
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All {filter.label}</option>
            {filter.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "multiselect":
        return (
          <div className="space-y-2">
            {filter.options?.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={
                    Array.isArray(value) ? value.includes(option.value) : false
                  }
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter((v) => v !== option.value);
                    handleFilterChange(filter.key, newValues);
                  }}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case "date":
        return (
          <DatePicker
            selected={value ? new Date(value) : null}
            onChange={(date) =>
              handleFilterChange(
                filter.key,
                date?.toISOString().split("T")[0] || ""
              )
            }
            placeholderText={filter.placeholder || `Select ${filter.label}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            dateFormat="yyyy-MM-dd"
          />
        );

      case "dateRange":
        const startDate = value?.startDate ? new Date(value.startDate) : null;
        const endDate = value?.endDate ? new Date(value.endDate) : null;

        return (
          <div className="space-y-2">
            <DatePicker
              selected={startDate}
              onChange={(date) =>
                handleFilterChange(filter.key, {
                  ...value,
                  startDate: date?.toISOString().split("T")[0] || "",
                })
              }
              placeholderText="Start date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              dateFormat="yyyy-MM-dd"
            />
            <DatePicker
              selected={endDate}
              onChange={(date) =>
                handleFilterChange(filter.key, {
                  ...value,
                  endDate: date?.toISOString().split("T")[0] || "",
                })
              }
              placeholderText="End date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              dateFormat="yyyy-MM-dd"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Filter Toggle */}
      {showAdvanced && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {getActiveFilterCount() > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {getActiveFilterCount()}
              </span>
            )}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isAdvancedOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {getActiveFilterCount() > 0 && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Advanced Filters */}
      {isAdvancedOpen && showAdvanced && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <div key={filter.key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {filter.label}
                </label>
                {renderFilterInput(filter)}
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => setIsAdvancedOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;










