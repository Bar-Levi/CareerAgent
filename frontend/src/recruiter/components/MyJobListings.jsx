import { FaEllipsisV, FaSpinner, FaSortUp, FaSortDown, FaSearch, FaFilter, FaSort } from "react-icons/fa";
import React, { useState, useEffect, useRef } from "react";

// Subcomponent for the settings menu
const SettingsMenu = ({ onRemove, onClose, loading }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose(); // Close the menu if clicking outside
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50 overflow-hidden"
        >
            {loading ? (
                <div className="flex items-center justify-center px-4 py-3">
                    <FaSpinner className="animate-spin text-gray-600 text-lg" />
                    <span className="ml-2 text-gray-700 font-medium">Removing...</span>
                </div>
            ) : (
                <button
                    onClick={onRemove}
                    className="block w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition duration-150"
                >
                    Remove Job Listing
                </button>
            )}
        </div>
    );
};

// Subcomponent for the status menu
const StatusMenu = ({ currentStatus, onChangeStatus, onClose }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    const statuses = [
        { label: "Active", color: "bg-green-100 text-green-800 hover:bg-green-200" },
        { label: "Paused", color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" },
        { label: "Closed", color: "bg-red-100 text-red-800 hover:bg-red-200" },
    ];

    return (
        <div
            ref={menuRef}
            className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50 overflow-hidden"
        >
            {statuses.map((status) => (
                <button
                    key={status.label}
                    onClick={() => onChangeStatus(status.label)}
                    className={`block w-full text-left px-4 py-3 text-sm font-semibold ${status.color} transition duration-150 ${currentStatus === status.label ? 'border-l-4 border-gray-500' : ''}`}
                >
                    {status.label}
                </button>
            ))}
        </div>
    );
};

const MyJobListings = ({
  jobListings,
  setJobListings,
  showNotification,
  selectedJobListing,
  setSelectedJobListing,
  setMetrics,
  setSelectedConversationId,
  setSelectedCandidate,
  setViewMode
}) => {
  const [menuOpen, setMenuOpen] = useState(null);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [individualLoading, setIndividualLoading] = useState({});
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("jobRole");
  const [sortDirection, setSortDirection] = useState("asc");

  const handleSortToggle = () => setSortDirection(prev => prev === "asc" ? "desc" : "asc");

  const filteredAndSortedListings = jobListings
    .filter(l => filterStatus === "All" || l.status === filterStatus)
    .filter(l => 
      `${l.jobRole} ${l.company}`.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortField]?.toString().toLowerCase();
      const bVal = b[sortField]?.toString().toLowerCase();
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  const handleStatusMenuToggle = (id) => {
    setMenuOpen((prev) => (prev === id ? null : id));
  };

  const handleSettingsMenuToggle = (id) => {
    setSettingsMenuOpen((prev) => (prev === id ? null : id));
  };

  const onRemove = async (id) => {
    setIndividualLoading((prev) => ({ ...prev, [id]: true }));
    const originalListings = [...jobListings];
    setJobListings((prev) => prev.filter((listing) => listing._id !== id));
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/joblistings/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to remove job listing with ID ${id}.`);
      }
      showNotification("success", "Job listing removed successfully.");
      // If the removed listing is the selected one, clear the selection.
      if (selectedJobListing && selectedJobListing._id === id) {
        setSelectedJobListing(null);
      }
    } catch (error) {
      console.error("Error removing job listing:", error.message);
      showNotification("error", "Failed to remove job listing. Restoring it...");
      setJobListings(originalListings);
    } finally {
      setIndividualLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const onRemoveAll = async () => {
    setLoading(true);
    const currentListings = [...jobListings];
    try {
      for (const listing of currentListings) {
        await onRemove(listing._id);
      }
      showNotification("success", "All job listings removed successfully.");
    } catch (error) {
      console.error("Error removing all job listings:", error.message);
      showNotification("error", "Failed to remove all job listings. Some might remain.");
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const onStatusChange = async (id, newStatus) => {
    try {
      // Optimistically update the local state
      setJobListings((prevListings) =>
        prevListings.map((listing) =>
          listing._id === id ? { ...listing, status: newStatus } : listing
        )
      );
  
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/joblistings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to update status for job listing with ID ${id}.`);
      }
  
      // Extract the JSON from the response
      const data = await response.json();
      // The controller returns the updated metrics under the "metrics" property
      const updatedMetrics = data.metrics;
      console.log("Updated metrics:", updatedMetrics);
      setMetrics(updatedMetrics);
  
      showNotification("success", `Status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating job listing status:", error.message);
      showNotification("error", "Failed to update status. Please try again.");
    } finally {
      setMenuOpen(null);
    }
  };
  
  return (
    <div
      className="relative w-full bg-white rounded-lg border border-gray-300 shadow-lg"
      style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      {/* Sticky header */}
      <div className="sticky top-0 bg-gray-200 dark:bg-gray-700 z-10 shadow-md">
        <div className="px-6 py-4">
          {/* Header title & action */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-300 mb-2 md:mb-0">
              My Job Listings
            </h2>
            {jobListings.length > 0 && (
              <button
                onClick={() => setShowConfirmDialog(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-150 text-sm font-medium"
              >
                Remove All
              </button>
            )}
          </div>

          {/* Search / Filter / Sort controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Search input */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Role / Company"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-[.9vw]"
              />
            </div>

            {/* Filter select */}
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none pl-10 pr-0 py-2 w-full bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-[.9vw]"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* Sort controls */}
            <div className="flex items-center">
              <div className="relative flex-1">
                <button
                  onClick={handleSortToggle}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />}
                </button>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                  className="appearance-none pl-10 py-2 w-full bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-[.9vw]"
                >
                  <option value="jobRole">Sort by Role</option>
                  <option value="location">Sort by Location</option>
                  <option value="createdAt">Sort by Date</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable job listings container */}
      <div className="bg-white flex-1 overflow-y-auto">
        {jobListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <svg
              className="w-16 h-16 text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              ></path>
            </svg>
            <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">
              No active job listings
            </p>
            <p className="text-gray-400 mt-2 text-center">
              Your job listings will appear here once created
            </p>
          </div>
        ) : (
          <ul className="bg-gray-100">
            {filteredAndSortedListings.map((listing) => (
              <li
                key={listing._id}
                className={`relative transition-all duration-200 hover:bg-gray-300 ${
                  selectedJobListing && selectedJobListing._id === listing._id
                    ? 'bg-gray-200 border-l-4 border-gray-300'
                    : ''
                }`}
              >
                <div className="p-4 md:p-5">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-black mb-2">
                        {listing.jobRole}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            ></path>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            ></path>
                          </svg>
                          {listing.location}
                        </span>
                        {listing.createdAt && (
                          <span className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              ></path>
                            </svg>
                            {new Date(listing.createdAt).toLocaleDateString()}
                          </span>
                        )}
                        {listing.company && (
                          <span className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              ></path>
                            </svg>
                            {listing.company}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-3 md:mt-0">
                      <div className="relative">
                        <button
                          disabled={listing.status === "Closed"}
                          onClick={() => handleStatusMenuToggle(listing._id)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-full flex items-center ${
                            listing.status === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : listing.status === 'Paused'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 mr-1.5 rounded-full ${
                              listing.status === 'Active'
                                ? 'bg-green-500'
                                : listing.status === 'Paused'
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                          ></span>
                          {listing.status}
                        </button>
                        {menuOpen === listing._id && (
                          <StatusMenu
                            currentStatus={listing.status}
                            onChangeStatus={(newStatus) =>
                              onStatusChange(listing._id, newStatus)
                            }
                            onClose={() => setMenuOpen(null)}
                          />
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedJobListing(listing);
                            setViewMode("messages");
                            setSelectedConversationId(null);
                            setSelectedCandidate(null);
                          }}
                          className="px-3 py-1.5 bg-gray-600 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition flex items-center"
                        >
                          <svg
                          className="w-3.5 h-3.5 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                          ></path>
                        </svg>
                         View Messages
                        </button>

                        <button
                          onClick={() => {
                            setSelectedJobListing(listing);
                            setViewMode("applications");
                            setSelectedConversationId(null);
                            setSelectedCandidate(null);
                          }}
                          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition flex items-center"
                        >
                          <svg
                            className="w-3.5 h-3.5 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                            ></path>
                          </svg>
                           View Applicants
                        </button>
                      </div>



                      <div className="relative">
                        <button
                          onClick={() => handleSettingsMenuToggle(listing._id)}
                          className="p-1.5 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                        >
                          <FaEllipsisV size={14} />
                        </button>
                        {settingsMenuOpen === listing._id && (
                          <SettingsMenu
                            onRemove={() => onRemove(listing._id)}
                            onClose={() => setSettingsMenuOpen(null)}
                            loading={individualLoading[listing._id] || false}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-6">
                <FaSpinner className="animate-spin text-3xl text-gray-600 mb-4" />
                <span className="text-gray-700 font-medium">
                  Removing all job listings...
                </span>
                <p className="text-gray-500 text-sm mt-2 text-center">
                  This may take a moment
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-100 text-red-600 mb-4">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      ></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Confirm Removal
                  </h3>
                  <p className="text-gray-600">
                    Are you sure you want to remove all job listings? This action cannot be undone.
                  </p>
                </div>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setShowConfirmDialog(false)}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onRemoveAll}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition duration-150"
                  >
                    Yes, Remove All
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyJobListings;