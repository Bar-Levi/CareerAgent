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
    <div className={`${darkMode ? 'bg-gray-800 shadow-lg border-gray-700' : 'bg-white shadow-sm border-gray-100'} border rounded-lg p-2 md:p-3`}>
      <div className="flex flex-col space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
          {/* Filter By Dropdown */}
          <div className="relative">
            <select
              value={filterAttribute}
              onChange={(e) => setFilterAttribute(e.target.value)}
              className={`w-full px-2 py-1.5 text-sm ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-white border-gray-300 text-gray-700'
              } border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500`}
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  Filter by {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              placeholder="Search..."
              className={`w-full px-2 py-1.5 text-sm ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-700 placeholder-gray-400'
              } border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500`}
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full px-2 py-1.5 text-sm ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-white border-gray-300 text-gray-700'
              } border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500`}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status === "All" ? "All Statuses" : status}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="relative">
            <input
              type="date"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={`w-full px-2 py-1.5 text-sm ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-white border-gray-300 text-gray-700'
              } border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500`}
            />
          </div>
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