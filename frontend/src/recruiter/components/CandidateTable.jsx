import React, { useState, useEffect, useRef } from "react";
import { CSVLink } from "react-csv";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Add this import
import { FaEye, FaCalendarPlus, FaSort, FaSortUp, FaSortDown, FaTimes, FaCheck, FaPencilAlt, FaDownload, FaCog } from "react-icons/fa";
import ScheduleInterviewModal from "./ScheduleInterviewModal"; // Adjust import path
import { updateApplicantStatus } from "../../utils/applicantStatus";
import CandidateNotesModal from "./CandidateNotesModal"; // Adjust import path

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

const CandidateTable = ({
  applicants,
  setApplicants,
  sortConfig,
  setSortConfig,
  recruiter,
  refetchApplicants,
  visibleColumns = DEFAULT_COLUMNS, // Provide default value
  darkMode = false,
}) => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [jobListingId, setJobListingId] = useState(null);
  const [renderKey, setRenderKey] = useState(0);

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
    await updateApplicantStatus(applicant, status, refetchApplicants);
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
        }];
      case "In Review":
        return [{
          label: "Schedule Interview",
          onClick: async () => {
            setSelectedApplicant(applicant);
            setShowScheduleModal(true);
            await refetchApplicants?.();
          },
        },
        {
          label: "Mark as Accepted",
          onClick: () => patchStatus(applicant, "Accepted"),
        }];
      case "Interview Scheduled":
        return [{
          label: "Mark Interview Done",
          onClick: () => patchStatus(applicant, "Interview Done"),
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
          },
          {
            label: "Mark as Accepted",
            onClick: () => patchStatus(applicant, "Accepted"),
          }
        ];
      case "Accepted":
        return [{
          label: "Mark as Hired",
          onClick: () => patchStatus(applicant, "Hired"),
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

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable Table Container */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            <thead className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} sticky top-0 z-10`}>
              <tr>
                {columns.map(({ key, label }) => 
                  visibleColumns[key] ? (
                    <th
                      key={key}
                      className={`px-4 py-3 text-left text-xs font-medium ${
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
                      <td className="px-4 py-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                            <img
                              className="h-full w-full object-cover"
                              src={app.profilePic || "https://res.cloudinary.com/careeragent/image/upload/v1735084555/default_profile_image.png"}
                              alt={app.name}
                            />
                          </div>
                          <div>
                            <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {app.name}
                            </div>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {app.email}
                            </div>
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Job Title */}
                    {visibleColumns.jobTitle && (
                      <td className={`px-4 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {app.jobTitle}
                      </td>
                    )}

                    {/* Application Date */}
                    {visibleColumns.applicationDate && (
                      <td className={`px-4 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {app.applicationDate
                          ? new Date(app.applicationDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                    )}

                    {/* Status */}
                    {visibleColumns.status && (
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                    )}

                    {/* Interview */}
                    {visibleColumns.interview && (
                      <td className={`px-4 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {app.interviewId ? (
                          <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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
                      <td className="px-4 py-4">
                        {statusAction ? (
                          <div className="flex flex-col space-y-2">
                            {statusAction.map((action, idx) => (
                              <button
                                key={idx}
                                onClick={action.onClick}
                                className={`px-2 py-1 text-xs font-medium rounded ${
                                  darkMode 
                                    ? 'bg-indigo-700 text-white hover:bg-indigo-600' 
                                    : 'bg-blue-600 text-white hover:bg-blue-500'
                                } transition-colors duration-150`}
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            No actions available
                          </span>
                        )}
                      </td>
                    )}

                    {/* Actions */}
                    {visibleColumns.actions && (
                      <td className="px-4 py-4 text-right text-sm font-medium">
                        <div className="flex space-x-2 justify-center">
                          <button
                            onClick={() => {
                              setSelectedApplicant(app);
                              setShowNotesModal(true);
                            }}
                            className={`p-1 rounded ${
                              darkMode 
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title="View/Edit Notes"
                          >
                            <FaPencilAlt className="w-4 h-4" />
                          </button>

                          {/* Additional action - Hire */}
                          {app.status !== "Hired" && app.status !== "Rejected" && (
                            <button
                              onClick={() => handleHireClick(app)}
                              className={`p-1 rounded ${
                                darkMode 
                                  ? 'bg-green-800 text-green-200 hover:bg-green-700' 
                                  : 'bg-green-100 text-green-600 hover:bg-green-200'
                              }`}
                              title="Mark as Hired"
                            >
                              <FaCheck className="w-4 h-4" />
                            </button>
                          )}

                          {/* Additional action - Reject */}
                          {app.status !== "Rejected" && app.status !== "Hired" && (
                            <button
                              onClick={() => handleRejectClick(app)}
                              className={`p-1 rounded ${
                                darkMode 
                                  ? 'bg-red-800 text-red-200 hover:bg-red-700' 
                                  : 'bg-red-100 text-red-600 hover:bg-red-200'
                              }`}
                              title="Reject Candidate"
                            >
                              <FaTimes className="w-4 h-4" />
                            </button>
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
                    className={`px-4 py-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    No candidates found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
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
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
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
