import React, { useState } from "react";
import PropTypes from "prop-types";
import { FaFilter, FaCalendarAlt, FaSearch, FaCog } from "react-icons/fa";

const FilterBar = ({
  filterAttribute,
  setFilterAttribute,
  filterValue,
  setFilterValue,
  statusFilter,
  setStatusFilter,
  dateRange,
  setDateRange,
  visibleColumns,
  setVisibleColumns,
  columns = [],
  darkMode = false,
}) => {
  const [showColumnSettings, setShowColumnSettings] = useState(false);

  const filterOptions = [
    { label: "Name", value: "name" },
    { label: "Email", value: "email" },
    { label: "Job Title", value: "jobTitle" },
    { label: "Status", value: "status" },
  ];

  const statusOptions = [
    "All",
    "Applied",
    "In Review",
    "Interview Scheduled",
    "Interview Done",
    "Accepted",
    "Rejected",
    "Hired",
  ];

  return (
    <div className={`${darkMode ? 'bg-gray-800 shadow-lg border-gray-700' : 'bg-white shadow-sm border-gray-100'} border rounded-lg p-4 mb-6`}>
      <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
        {/* Column Settings Dropdown */}
        <div className="relative w-full md:w-1/6">
          <button
            onClick={() => setShowColumnSettings(!showColumnSettings)}
            className={`w-full flex items-center justify-between px-4 py-2 ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-200' 
                : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
            } border rounded-md`}
          >
            <div className="flex items-center space-x-2">
              <FaCog className={darkMode ? 'text-gray-300' : 'text-gray-500'} />
              <span>Columns</span>
            </div>
          </button>

          {showColumnSettings && (
            <div className={`absolute z-50 mt-2 w-48 ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 shadow-xl' 
                : 'bg-white border-gray-200 shadow-lg'
            } rounded-md border`}>
              <div className="p-2">
                {columns.map(({ key, label }) => (
                  <label key={key} className={`flex items-center p-2 ${
                    darkMode 
                      ? 'hover:bg-gray-600 text-gray-200' 
                      : 'hover:bg-gray-50 text-gray-700'
                  } cursor-pointer`}>
                    <input
                      type="checkbox"
                      checked={visibleColumns[key]}
                      onChange={() =>
                        setVisibleColumns((prev) => ({
                          ...prev,
                          [key]: !prev[key],
                        }))
                      }
                      className="mr-2"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 1) Choose attribute dropdown with icon */}
        <div className="relative w-full md:w-1/5">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaFilter className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
          </div>
          <select
            value={filterAttribute}
            onChange={(e) => setFilterAttribute(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500' 
                : 'bg-white border-gray-300 text-gray-700 focus:ring-blue-500 focus:border-blue-500'
            } border rounded-md focus:outline-none focus:ring-2 text-sm appearance-none`}
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                Filter by {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg
              className={`fill-current h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>

        {/* 2) Filter value input with search icon */}
        <div className="relative w-full md:w-1/4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
          </div>
          <input
            type="text"
            placeholder="Enter filter value..."
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-700 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500'
            } border rounded-md focus:outline-none focus:ring-2 text-sm`}
          />
        </div>

        {/* 3) Date Range Filter with calendar icon */}
        <div className="relative w-full md:w-1/4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaCalendarAlt className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
          </div>
          <input
            type="date"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500' 
                : 'bg-white border-gray-300 text-gray-700 focus:ring-blue-500 focus:border-blue-500'
            } border rounded-md focus:outline-none focus:ring-2 text-sm`}
          />
        </div>

        {/* Optional: Status Filter Dropdown */}
        <div className="w-full md:w-1/5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`w-full px-4 py-2 ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500' 
                : 'bg-white border-gray-300 text-gray-700 focus:ring-blue-500 focus:border-blue-500'
            } border rounded-md focus:outline-none focus:ring-2 text-sm`}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

FilterBar.propTypes = {
  filterAttribute: PropTypes.string.isRequired,
  setFilterAttribute: PropTypes.func.isRequired,
  filterValue: PropTypes.string.isRequired,
  setFilterValue: PropTypes.func.isRequired,
  statusFilter: PropTypes.string.isRequired,
  setStatusFilter: PropTypes.func.isRequired,
  dateRange: PropTypes.string.isRequired,
  setDateRange: PropTypes.func.isRequired,
  visibleColumns: PropTypes.object.isRequired,
  setVisibleColumns: PropTypes.func.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  darkMode: PropTypes.bool
};

export default FilterBar;