import React, { useState, useEffect, useRef } from "react";
import { FaEye, FaCalendarPlus, FaSort, FaSortUp, FaSortDown, FaTimes, FaCheck } from "react-icons/fa";
import ScheduleInterviewModal from "./ScheduleInterviewModal"; // Adjust import path
import { updateApplicantStatus } from "../../utils/applicantStatus";

const CandidateTable = ({
  applicants,
  setApplicants,
  sortConfig,
  setSortConfig,
  recruiter,
  refetchApplicants,
}) => {
  // State to control the modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [jobListingId, setJobListingId] = useState(null);
  const [renderKey, setRenderKey] = useState(0);

  // Ref for the table body and selected row
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
      console.log("applicants: ", applicants);
    }
  }, [selectedApplicant, applicants]);
  

  // Handle column sorting
  const handleSort = (key) => {
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
    if (sortConfig.key !== key) {
      return <FaSort className="inline-block ml-2 text-gray-300 w-3 h-3" />;
    }
    return sortConfig.direction === "asc"
      ? <FaSortUp className="inline-block ml-2 text-blue-500 w-3 h-3" />
      : <FaSortDown className="inline-block ml-2 text-blue-500 w-3 h-3" />;
  };

  const patchStatus = async (id, status) => {
    await updateApplicantStatus(id, status, refetchApplicants);
    refetchApplicants?.();
  };
  // Determine the appropriate action button label & logic per status
  const getStatusAction = (applicant) => {
    switch (applicant.status) {
      case "Applied":
        return [{
          label: "Review Application",
          onClick: async () => {
            window.open(applicant.cv, "_blank");
            await patchStatus(applicant._id, "In Review");
          },
        }];
  
      case "In Review":
        return [{
          label: "Schedule Interview",
          onClick: () => {
            setSelectedApplicant(applicant);
            setShowScheduleModal(true);
            refetchApplicants?.();
          },
        }];
  
      case "Interview Scheduled":
        return [{
          label: "Mark Interview Done",
          onClick: () => patchStatus(applicant._id, "Interview Done"),
        }];
  
      case "Interview Done":
        return [
          {
          label: "Schedule Another Interview",
          onClick: () => {
            setSelectedApplicant(applicant);
            setShowScheduleModal(true);
            refetchApplicants?.();
          },
          },
          {
            label: "Make Offer",
            onClick: () => patchStatus(applicant._id, "Offered"),
          }
        ];

      case "Interview Done":
        return [];
  
      case "Offered":
        return [{
          label: "Mark as Accepted",
          onClick: () => patchStatus(applicant._id, "Accepted"),
        }];
  
      case "Accepted":
        return [{
          label: "Mark as Hired",
          onClick: () => patchStatus(applicant._id, "Hired"),
        }];
  
      default:
        return null;
    }
  };


  const handleHireClick = (app) => {
    patchStatus(app._id, "Hired")
    
  };

  const handleRejectClick = (app) => {
    patchStatus(app._id, "Rejected");
  };

  return (
    <div key={renderKey} className="bg-white shadow-md rounded-lg overflow-auto flex-1 flex flex-col">
      <div className="flex-1 overflow-auto" ref={tableBodyRef}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {[
                { key: "name", label: "Candidate" },
                { key: "jobTitle", label: "Job Title" },
                { key: "status", label: "Status" },
                { key: "interviewDate", label: "Interview" },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort(key)}
                >
                  <div className="flex items-center">
                    {label}
                    {renderSortIcon(key)}
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Next Step
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applicants && applicants.map((app) => {
              const statusAction = getStatusAction(app);

              return (
                <tr
                  key={app._id}
                  ref={selectedApplicant?._id === app._id ? selectedRowRef : null}
                  className={`
                    hover:bg-gray-100 transition-colors duration-200
                    ${selectedApplicant?._id === app._id ? "bg-blue-50 font-semibold ring-2 ring-blue-300" : ""}
                  `}
                  onClick={() => {
                    setJobListingId(app.jobId);
                    setSelectedApplicant(app);
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{app.name}</div>
                        <div className="text-sm text-gray-500">{app.email}</div>
                      </div>
                    </div>
                  </td>
              
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {app.jobTitle}
                  </td>
              
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        app.status === "Applied"
                          ? "bg-blue-100 text-blue-800"
                          : app.status.includes("Interview")
                          ? "bg-purple-100 text-purple-800"
                          : app.status === "Offered"
                          ? "bg-teal-100 text-teal-800"
                          : app.status === "Accepted"
                          ? "bg-green-100 text-green-800"
                          : app.status === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : app.status === "In Review"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
              
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {app.interviewId ? (
                      <div className="flex flex-col">
                        <span>{new Date(app.interviewId.scheduledTime).toLocaleString()}</span>
                        <a 
                          href={app.interviewId.meetingLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          Enter the Meeting
                        </a>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>


              
                  {(
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {(statusAction && !["Hired", "Rejected"].includes(app.status))
                          ? statusAction.map((statusAction) => {
                              return (
                                <button
                                  key={statusAction.label} // it's a good practice to include a unique key for list items
                                  className="text-green-600 hover:text-green-900 transition-colors flex items-center"
                                  title={statusAction.label}
                                  onClick={statusAction.onClick}
                                >
                                  <FaCalendarPlus className="mr-1" />
                                  {statusAction.label}
                                </button>
                              );
                            })
                          : "—"
                        }
                      </td>

              
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        { !["Hired", "Rejected"].includes(app.status) ?
                        <div className="flex flex-col justify-center space-y-3">
                          <button
                            className="text-blue-600 hover:text-blue-900 transition-colors flex items-center"
                            title="View Candidate"
                            onClick={() => window.open(app.cv, "_blank", "noopener,noreferrer")}
                          >
                            <FaEye className="mr-1" /> View
                          </button>
              
                          <button
                            className="text-red-600 hover:text-red-900 transition-colors flex items-center"
                            title="Reject Applicant"
                            onClick={() => handleRejectClick(app)}
                          >
                            <FaTimes className="mr-1" /> Reject
                          </button>
              
                          <button
                            className="text-green-600 hover:text-green-900 transition-colors flex items-center"
                            title="Hire Applicant"
                            onClick={() => handleHireClick(app)}
                          >
                            <FaCheck className="mr-1" /> Hire
                          </button>
                        </div>
                        : "—"}
                      </td>
                    </>
                  )}
                </tr>
              );
              
              
            })}
          </tbody>
        </table>

        {/* Empty state */}
        {applicants && applicants.length === 0 && (
          <div className="text-center py-8 px-4 sm:px-6 lg:px-8">
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No applicants
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a new candidate
            </p>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && selectedApplicant && (
        <ScheduleInterviewModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          applicant={selectedApplicant}
          setApplicants={setApplicants}
          jobListingId={jobListingId} 
          recruiter={recruiter}
          refetchApplicants={() => {
            setShowScheduleModal(false);
            if (refetchApplicants) refetchApplicants();
          }}
        />
      )}
    </div>
  );
};

export default CandidateTable;