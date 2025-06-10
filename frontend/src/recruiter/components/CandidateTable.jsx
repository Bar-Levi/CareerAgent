import React, { useState, useEffect, useRef } from "react";
import { FaSort, FaSortUp, FaSortDown, FaTimes, FaCheck, FaPencilAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import ScheduleInterviewModal from "./ScheduleInterviewModal"; 
import { updateApplicantStatus } from "../../utils/applicantStatus";
import CandidateNotesModal from "./CandidateNotesModal";

// Add default columns configuration
const DEFAULT_COLUMNS = {
  name: true,
  jobTitle: true,
  applicationDate: true,
  status: true,
  interview: true,
  nextStep: true,
  actions: true
};

// Add sortable column configuration
const SORTABLE_COLUMNS = {
  name: true,
  jobTitle: true,
  applicationDate: true,
  status: true,
  interview: false,
  nextStep: false,
  actions: false
};

// Modern action button component with animations and dynamic styling
const ActionButton = ({ label, onClick, icon, variant = "primary", darkMode, compactMode = false }) => {
  // Define color variants - primary, schedule, review
  const getVariantStyle = () => {
    if (darkMode) {
      switch (variant) {
        case "primary": 
          return "bg-gradient-to-r from-indigo-700/90 to-indigo-600/90 hover:from-indigo-600/90 hover:to-indigo-500/90 text-white border-indigo-500/30";
        case "schedule": 
          return "bg-gradient-to-r from-purple-700/90 to-purple-600/90 hover:from-purple-600/90 hover:to-purple-500/90 text-white border-purple-500/30";
        case "review": 
          return "bg-gradient-to-r from-blue-700/90 to-blue-600/90 hover:from-blue-600/90 hover:to-blue-500/90 text-white border-blue-500/30";
        case "accept": 
          return "bg-gradient-to-r from-green-700/90 to-green-600/90 hover:from-green-600/90 hover:to-green-500/90 text-white border-green-500/30";
        default:
          return "bg-gradient-to-r from-indigo-700/90 to-indigo-600/90 hover:from-indigo-600/90 hover:to-indigo-500/90 text-white border-indigo-500/30";
      }
    } else {
      switch (variant) {
        case "primary": 
          return "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white border-indigo-300";
        case "schedule": 
          return "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-purple-300";
        case "review": 
          return "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-blue-300";
        case "accept": 
          return "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-green-300";
        default:
          return "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white border-indigo-300";
      }
    }
  };

  // Super compact mode just shows the icon with tooltip
  if (compactMode) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`p-1.5 rounded-md border-[0.5px] transition-all duration-200 ${getVariantStyle()}`}
        title={label}
      >
        {icon}
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-max px-2 py-1 rounded-md text-xs font-medium border-[0.5px] flex items-center justify-start gap-1.5 transition-all duration-200 ${getVariantStyle()}`}
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  );
};

const CandidateTable = ({
  applicants,
  setApplicants,
  sortConfig,
  setSortConfig,
  recruiter,
  refetchApplicants,
  visibleColumns = DEFAULT_COLUMNS, // Provide default value
  darkMode = false,
  user, // Add user prop
  updateTotalHired, // Add function to update totalHired count
  refreshMetrics, // Add refreshMetrics function
}) => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [jobListingId, setJobListingId] = useState(null);
  const [renderKey, setRenderKey] = useState(0);
  const [compactView, setCompactView] = useState(true); // Default to compact view

  const navigate = useNavigate();
  const location = useLocation();
  
  const tableBodyRef = useRef(null);
  const selectedRowRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("stateAddition");
    if (saved) {
      const { applicant } = JSON.parse(saved);
      setSelectedApplicant(applicant);
      localStorage.removeItem("stateAddition");
    }
  }, []);

  useEffect(() => {
    if (selectedApplicant && applicants.length && selectedRowRef.current) {
      selectedRowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedApplicant, applicants]);

  const handleSort = (key) => {
    // Only handle sort if column is sortable
    if (!SORTABLE_COLUMNS[key]) return;

    setSelectedApplicant(null);
    if (sortConfig.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSortConfig({ key, direction: "asc" });
    }
  };

  const renderSortIcon = (key) => {
    // Only show sort icon if column is sortable
    if (!SORTABLE_COLUMNS[key]) return null;

    if (sortConfig.key !== key) {
      return <FaSort className={`inline-block ml-2 ${darkMode ? 'text-gray-500' : 'text-gray-300'} w-3 h-3`} />;
    }
    return sortConfig.direction === "asc"
      ? <FaSortUp className={`inline-block ml-2 ${darkMode ? 'text-indigo-400' : 'text-blue-500'} w-3 h-3`} />
      : <FaSortDown className={`inline-block ml-2 ${darkMode ? 'text-indigo-400' : 'text-blue-500'} w-3 h-3`} />;
  };

  const patchStatus = async (applicant, status) => {
    await updateApplicantStatus(applicant, status, refetchApplicants, refreshMetrics);
    
    // When status is changed to Hired, increment totalHired counter
    if (status === "Hired" && updateTotalHired) {
      // Call the updateTotalHired function from props
      updateTotalHired();
      
      // Update the location state with the incremented totalHired count
      if (location.state && location.state.user) {
        // Navigate to the same page with updated state to force a full refresh
        navigate(location.pathname, { 
          state: {
            ...location.state,
            refreshToken: Date.now() // Force component to re-render
          },
          replace: true 
        });
      }
    }
    
    await refetchApplicants?.();
  };

  const getStatusAction = (applicant) => {
    switch (applicant.status) {
      case "Applied":
        return [{
          label: "Review Application",
          onClick: async () => {
            window.open(applicant.cv, "_blank");
            await patchStatus(applicant, "In Review");
          },
          icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>,
          variant: "review"
        }];
      case "In Review":
        return [{
          label: "Schedule Interview",
          onClick: async () => {
            setSelectedApplicant(applicant);
            setShowScheduleModal(true);
            await refetchApplicants?.();
          },
          icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>,
          variant: "schedule"
        },
        {
          label: "Mark as Accepted",
          onClick: () => patchStatus(applicant, "Accepted"),
          icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>,
          variant: "accept"
        }];
      case "Interview Scheduled":
        return [{
          label: "Mark Interview Done",
          onClick: () => patchStatus(applicant, "Interview Done"),
          icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>,
          variant: "primary"
        }];
      case "Interview Done":
        return [
          {
            label: "Schedule Another Interview",
            onClick: async () => {
              setSelectedApplicant(applicant);
              setShowScheduleModal(true);
              await refetchApplicants?.();
            },
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>,
            variant: "schedule"
          },
          {
            label: "Mark as Accepted",
            onClick: () => patchStatus(applicant, "Accepted"),
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>,
            variant: "accept"
          }
        ];
      case "Accepted":
        return [{
          label: "Mark as Hired",
          onClick: () => patchStatus(applicant, "Hired"),
          icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>,
          variant: "primary"
        }];
      default:
        return null;
    }
  };

  const handleHireClick = (applicant) => {
    patchStatus(applicant, "Hired");
  };

  const handleRejectClick = (applicant) => {
    patchStatus(applicant, "Rejected");
  };

  // Create a columns map for better organization
  const columns = [
    { key: 'name', label: 'Details' }, // Changed from 'Name' to 'Details'
    { key: 'jobTitle', label: 'Job Title' },
    { key: 'applicationDate', label: 'Application Date' },
    { key: 'status', label: 'Status' },
    { key: 'interview', label: 'Interview' },
    { key: 'nextStep', label: 'Next Step' },
    { key: 'actions', label: 'Actions' }
  ];

  // Column width classes for each column
  const columnWidthClasses = {
    name: 'w-[20%] min-w-[180px]',
    jobTitle: 'w-[15%] min-w-[150px]',
    applicationDate: 'w-[15%] min-w-[130px]', 
    status: 'w-[10%] min-w-[120px]',
    interview: 'w-[15%] min-w-[180px]',
    nextStep: 'w-[15%] min-w-[150px]',
    actions: 'w-[10%] min-w-[100px]'
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Scrollable Table Container */}
      <div className="flex-1 overflow-auto w-full">
        <table className={`w-full table-fixed divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
          <thead className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} sticky top-0 z-10`}>
            <tr>
              {columns.map(({ key, label }) => 
                visibleColumns[key] ? (
                  <th
                    key={key}
                    className={`px-4 py-3 text-left text-xs font-medium ${columnWidthClasses[key]} ${
                      darkMode ? 'text-gray-300' : 'text-gray-500'
                    } uppercase tracking-wider whitespace-nowrap ${
                      SORTABLE_COLUMNS[key] 
                        ? darkMode 
                          ? 'cursor-pointer hover:bg-gray-700' 
                          : 'cursor-pointer hover:bg-gray-100'
                        : ''
                    }`}
                    onClick={() => handleSort(key)}
                  >
                    <div className="flex items-center">
                      {label}
                      {renderSortIcon(key)}
                    </div>
                  </th>
                ) : null
              )}
            </tr>
          </thead>
          <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {applicants && applicants.length > 0 ? applicants.map((app) => {
              const statusAction = getStatusAction(app);

              // Get status color for current status
              const getStatusColor = (status) => {
                if (darkMode) {
                  switch (status) {
                    case "Applied": return "bg-blue-900/30 text-blue-300";
                    case "In Review": return "bg-yellow-900/30 text-yellow-300";
                    case "Interview Scheduled": return "bg-purple-900/30 text-purple-300";
                    case "Interview Done": return "bg-indigo-900/30 text-indigo-300";
                    case "Accepted": return "bg-green-900/30 text-green-300";
                    case "Hired": return "bg-emerald-900/30 text-emerald-300";
                    case "Rejected": return "bg-red-900/30 text-red-300";
                    default: return "bg-gray-700 text-gray-300";
                  }
                } else {
                  switch (status) {
                    case "Applied": return "bg-blue-100 text-blue-800";
                    case "In Review": return "bg-yellow-100 text-yellow-800";
                    case "Interview Scheduled": return "bg-purple-100 text-purple-800";
                    case "Interview Done": return "bg-indigo-100 text-indigo-800";
                    case "Accepted": return "bg-green-100 text-green-800";
                    case "Hired": return "bg-emerald-100 text-emerald-800";
                    case "Rejected": return "bg-red-100 text-red-800";
                    default: return "bg-gray-100 text-gray-800";
                  }
                }
              };

              return (
                <tr
                  key={app._id}
                  ref={selectedApplicant?._id === app._id ? selectedRowRef : null}
                  className={`${
                    selectedApplicant?._id === app._id 
                      ? darkMode 
                        ? 'bg-gray-700' 
                        : 'bg-blue-50'
                      : darkMode 
                        ? 'hover:bg-gray-700' 
                        : 'hover:bg-gray-50'
                  } transition-all duration-150`}
                >
                  {/* Candidate Details */}
                  {visibleColumns.name && (
                    <td className="px-4 py-4 overflow-hidden">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                          <img
                            className="h-full w-full object-cover"
                            src={app.profilePic || "https://res.cloudinary.com/careeragent/image/upload/v1735084555/default_profile_image.png"}
                            alt={app.name}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                            {app.name}
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                            {app.email}
                          </div>
                        </div>
                      </div>
                    </td>
                  )}

                  {/* Job Title */}
                  {visibleColumns.jobTitle && (
                    <td className={`px-4 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'} truncate`}>
                      {app.jobTitle}
                    </td>
                  )}

                  {/* Application Date */}
                  {visibleColumns.applicationDate && (
                    <td className={`px-4 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
                      {app.applicationDate
                        ? new Date(app.applicationDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                  )}

                  {/* Status */}
                  {visibleColumns.status && (
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                  )}

                  {/* Interview */}
                  {visibleColumns.interview && (
                    <td className={`px-4 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} overflow-hidden`}>
                      {app.interviewId ? (
                        <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} truncate`}>
                          <div>
                            {new Date(app.interviewId.scheduledTime).toLocaleString()}
                          </div>
                          <a
                            href={app.interviewId.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
                          >
                            Join Meeting
                          </a>
                        </div>
                      ) : (
                        <span className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Not scheduled</span>
                      )}
                    </td>
                  )}

                  {/* Next Step */}
                  {visibleColumns.nextStep && (
                    <td className="px-4 py-4 overflow-hidden">
                      {statusAction ? (
                        <>
                          {compactView ? (
                            <div className="flex flex-wrap justify-start items-center">
                              {statusAction.map((action, idx) => (
                                <ActionButton
                                  key={idx}
                                  label={action.label}
                                  onClick={action.onClick}
                                  icon={action.icon}
                                  variant={action.variant}
                                  darkMode={darkMode}
                                  compactMode={true}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-start space-y-1">
                              {statusAction.map((action, idx) => (
                                <ActionButton
                                  key={idx}
                                  label={action.label}
                                  onClick={action.onClick}
                                  icon={action.icon}
                                  variant={action.variant}
                                  darkMode={darkMode}
                                />
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          No actions
                        </span>
                      )}
                    </td>
                  )}

                  {/* Actions */}
                  {visibleColumns.actions && (
                    <td className="px-4 py-4 text-center text-sm font-medium">
                      <div className="flex space-x-2 justify-center">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setSelectedApplicant(app);
                            setShowNotesModal(true);
                          }}
                          className={`p-2 rounded-full ${
                            darkMode 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                          } transition-all duration-200`}
                          title="View/Edit Notes"
                        >
                          <FaPencilAlt className="w-4 h-4" />
                        </motion.button>

                        {/* Additional action - Hire */}
                        {app.status !== "Hired" && app.status !== "Rejected" && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleHireClick(app)}
                            className={`p-2 rounded-full ${
                              darkMode 
                                ? 'bg-green-800/80 text-green-200 hover:bg-green-700' 
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                            } transition-all duration-200`}
                            title="Mark as Hired"
                          >
                            <FaCheck className="w-4 h-4" />
                          </motion.button>
                        )}

                        {/* Additional action - Reject */}
                        {app.status !== "Rejected" && app.status !== "Hired" && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRejectClick(app)}
                            className={`p-2 rounded-full ${
                              darkMode 
                                ? 'bg-red-800/80 text-red-200 hover:bg-red-700' 
                                : 'bg-red-100 text-red-600 hover:bg-red-200'
                            } transition-all duration-200`}
                            title="Reject Candidate"
                          >
                            <FaTimes className="w-4 h-4" />
                          </motion.button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            }) : (
              <tr>
                <td 
                  colSpan={Object.values(visibleColumns).filter(Boolean).length} 
                  className={`px-4 py-16 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-lg font-medium w-full`}
                >
                  {applicants.length === 0 ? (
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>No applicants found</span>
                      <span className="text-sm font-normal">Try adjusting your search filters</span>
                    </div>
                  ) : "Loading applicants..."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <ScheduleInterviewModal
            isOpen={showScheduleModal}
            onClose={() => setShowScheduleModal(false)}
            applicant={selectedApplicant}
            recruiter={recruiter}
            onSuccess={refetchApplicants}
            darkMode={darkMode}
            jobListingId={selectedApplicant?.jobId?._id}
            setApplicants={setApplicants}
          />
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <CandidateNotesModal
            isOpen={showNotesModal}
            onClose={() => setShowNotesModal(false)}
            applicant={selectedApplicant}
            onSuccess={() => {
              refetchApplicants?.();
              setShowNotesModal(false);
            }}
            darkMode={darkMode}
            onNotesUpdated={() => refetchApplicants?.()}
          />
        </div>
      )}
    </div>
  );
};

export default CandidateTable;
