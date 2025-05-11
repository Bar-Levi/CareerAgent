import React, { useEffect, useState, useRef } from "react";
import { FaSpinner, FaBriefcase, FaCheckCircle, FaTimesCircle, FaClock, FaUserTie, FaSearch, FaFilter } from "react-icons/fa";

const JobApplications = ({ user, highlightApplicationId, highlightApplication }) => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // A ref map for all applications
  const appRefs = useRef({});

  // Add filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Define status options
  const statusOptions = [
    "Applied",
    "In Review",
    "Rejected",
    "Accepted",
    "Interview Scheduled",
    "Interview Done",
    "Hired"
  ];

  useEffect(() => {
    if (user?._id) {
      const fetchApplications = async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/applicants/getJobSeekerApplications/${user._id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          const data = await response.json();
          if (response.ok) {
            // Log the applications data to check the date format
            console.log("Applications data:", data.applicants || data.applications || []);
            setApplications(data.applicants || data.applications || []);
          } else {
            console.error("Error fetching applications:", data.message);
          }
        } catch (error) {
          console.error("Error fetching applications:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchApplications();
    }
  }, [user]);

  useEffect(() => {
    // Apply filters whenever applications or filter values change
    let filtered = [...applications];

    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    if (startDate) {
      filtered = filtered.filter(app => 
        new Date(app.applicationDate) >= new Date(startDate)
      );
    }

    if (endDate) {
      filtered = filtered.filter(app => 
        new Date(app.applicationDate) <= new Date(endDate)
      );
    }

    setFilteredApplications(filtered);
  }, [applications, searchTerm, statusFilter, startDate, endDate]);

  // Scroll to highlighted application
  useEffect(() => {
    console.log("JobApplications props:", { highlightApplication, highlightApplicationId });
    
    if (highlightApplication && highlightApplicationId && filteredApplications.length > 0) {
      console.log("Applications to check:", filteredApplications.length);
      
      // Find the application that matches the ID
      const appToHighlight = filteredApplications.find(app => app._id === highlightApplicationId);
      
      if (appToHighlight) {
        console.log("Found application to highlight:", appToHighlight.jobTitle);
        
        // Give time for applications to load and render
        const timer = setTimeout(() => {
          const ref = appRefs.current[highlightApplicationId];
          
          if (ref) {
            console.log("Scrolling to highlighted application");
            ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add a temporary flash animation effect
            ref.classList.add('highlight-pulse');
            
            // Remove the animation class after it completes
            setTimeout(() => {
              if (ref) {
                ref.classList.remove('highlight-pulse');
              }
            }, 2000);
          } else {
            console.log("Highlighted application ref not found");
          }
        }, 500);
        
        return () => clearTimeout(timer);
      } else {
        console.log("Application with ID not found in filtered applications:", highlightApplicationId);
      }
    }
  }, [highlightApplication, highlightApplicationId, filteredApplications]);

  // Add reset filters function
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setStartDate("");
    setEndDate("");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Applied":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "In Review":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Rejected":
        return "bg-red-100 text-red-700 border-red-200";
      case "Accepted":
        return "bg-green-100 text-green-700 border-green-200";
      case "Interview Scheduled":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "Interview Done":
        return "bg-purple-200 text-purple-800 border-purple-300";
      case "Hired":
        return "bg-green-200 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Applied":
        return <FaBriefcase className="w-4 h-4" />;
      case "In Review":
        return <FaClock className="w-4 h-4" />;
      case "Rejected":
        return <FaTimesCircle className="w-4 h-4" />;
      case "Accepted":
      case "Hired":
        return <FaCheckCircle className="w-4 h-4" />;
      case "Interview Scheduled":
      case "Interview Done":
        return <FaUserTie className="w-4 h-4" />;
      default:
        return <FaBriefcase className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  // Function to check if an application should be highlighted
  const isHighlighted = (app) => {
    if (!highlightApplication || !highlightApplicationId) return false;
    return app._id === highlightApplicationId;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col min-h-0">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 flex-none">
        <h2 className="text-lg font-bold text-white">Job Applications</h2>
      </div>

      {/* Add Filter Section */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex flex-wrap -mx-2">
          {/* Search Input */}
          <div className="w-full sm:w-1/2 lg:w-1/4 px-2 mb-3">
            <label className="block text-sm text-gray-600 mb-1 whitespace-nowrap">Search Job Title</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 h-10"
              />
              <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
          {/* Status Filter */}
          <div className="w-full sm:w-1/2 lg:w-1/4 px-2 mb-3">
            <label className="block text-sm text-gray-600 mb-1 whitespace-nowrap">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 h-10"
            >
              <option value="">All Statuses</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* From Date */}
          <div className="w-full sm:w-1/2 lg:w-1/4 px-2 mb-3">
            <label className="block text-sm text-gray-600 mb-1 whitespace-nowrap">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 h-10"
              aria-label="From date"
            />
          </div>

          {/* To Date */}
          <div className="w-full sm:w-1/2 lg:w-1/4 px-2 mb-3">
            <label className="block text-sm text-gray-600 mb-1 whitespace-nowrap">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 h-10"
              aria-label="To date"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap justify-between items-center mt-1">
          <div className="text-sm text-gray-600 mb-2 sm:mb-0">
            <span className="font-medium text-indigo-700">{filteredApplications.length}</span> 
            {filteredApplications.length === 1 ? ' job' : ' jobs'} found
            {(searchTerm || statusFilter || startDate || endDate) && 
              ` with applied filters${applications.length !== filteredApplications.length ? 
                ` (${applications.length} total)` : ''}`
            }
          </div>
          <button
            onClick={resetFilters}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md flex items-center gap-2 transition-colors"
          >
            <FaFilter className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <FaSpinner className="animate-spin text-3xl text-indigo-600" />
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-4">
            <FaBriefcase className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600 text-base font-medium">No applications found</p>
            <p className="text-gray-500 text-sm mt-1">
              {applications.length > 0 
                ? "No applications match your filters" 
                : "Your job applications will appear here"}
            </p>
          </div>
        ) : (
          <div className="overflow-y-auto h-full">
            <div className="p-4 space-y-2">
              <style>
                {`
                  .highlight-pulse {
                    animation: highlight-flash 2s ease-in-out;
                    outline: 3px solid #4f46e5;
                    box-shadow: 0 0 15px #4f46e5;
                    position: relative;
                    z-index: 10;
                  }
                  
                  @keyframes highlight-flash {
                    0%, 100% { outline-color: #4f46e5; box-shadow: 0 0 15px #4f46e5; }
                    50% { outline-color: #818cf8; box-shadow: 0 0 25px #818cf8; }
                  }
                `}
              </style>
              {filteredApplications.map((app) => (
                <div
                  key={app._id}
                  ref={(node) => {
                    appRefs.current[app._id] = node;
                  }}
                  className={`p-3 bg-gray-50 rounded-lg border ${
                    isHighlighted(app) 
                      ? 'border-indigo-500 transition-all duration-300' 
                      : 'border-gray-200 hover:border-indigo-200'
                  } hover:shadow-sm transition-all duration-200`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 capitalize text-base">
                        {app.jobTitle || "N/A"}
                      </h3>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {app.jobId?.company || "Company Name"}
                      </p>
                    </div>
                    <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border ${getStatusColor(app.status)}`}>
                      {getStatusIcon(app.status)}
                      <span className="text-sm font-medium">{app.status}</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500">
                    <span className="flex items-center">
                      <FaClock className="w-4 h-4 mr-1" />
                      {formatDate(app.applicationDate)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobApplications;
