import React, { useState } from "react";
import { FaEye, FaCalendarPlus, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import ScheduleInterviewModal from "./ScheduleInterviewModal"; // Adjust import path

const CandidateTable = ({
  applicants,
  sortConfig,
  setSortConfig,
  recruiter,       // pass the current recruiter object
  refetchApplicants, // callback to refresh or handle success
}) => {
  // State to control the modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [jobListingId, setJobListingId] = useState(null);
  const [renderKey, setRenderKey] = useState(0);

  // Handle column sorting
  const handleSort = (key) => {
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

  const updateApplicantStatus = async (applicantId, status) => {
    try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/applicants/${applicantId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ status }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to update applicant status"
          );
        }

        // Optionally refetch or refresh the data to see the new status
        if (refetchApplicants) refetchApplicants();

      } catch (error) {
        console.error("Error updating status:", error);
        // Show a user-friendly error message if needed
      }
  };
  // 1) Determine the appropriate action button label & logic per status
  const getStatusAction = (applicant) => {
    const patchStatus = async (id, status) => {
      await updateApplicantStatus(id, status);
      refetchApplicants?.();
    };
  
    switch (applicant.status) {
      case "Applied":
        return {
          label: "Review Application",
          onClick: async () => {
            window.open(applicant.cv, "_blank");
            await patchStatus(applicant._id, "In Review");
          },
        };
  
      case "In Review":
        return {
          label: "Schedule Interview 1",
          onClick: () => {
            setSelectedApplicant(applicant);
            setShowScheduleModal(true);
            refetchApplicants?.();
          },
        };
  
      case "Interview 1 Scheduled":
        return {
          label: "Mark Interview 1 Done",
          onClick: () => patchStatus(applicant._id, "Interview 1 Done"),
        };
  
      case "Interview 1 Done":
        return {
          label: "Schedule Interview 2",
          onClick: () => {
            setSelectedApplicant(applicant);
            setShowScheduleModal(true);
            refetchApplicants?.();
          },
        };
  
      case "Interview 2 Scheduled":
        return {
          label: "Mark Interview 2 Done",
          onClick: () => patchStatus(applicant._id, "Interview 2 Done"),
        };
  
      case "Interview 2 Done":
        return {
          label: "Make Offer",
          onClick: () => patchStatus(applicant._id, "Offered"),
        };
  
      case "Offered":
        return {
          label: "Mark as Accepted",
          onClick: () => patchStatus(applicant._id, "Accepted"),
        };
  
      case "Accepted":
        return {
          label: "Mark as Hired",
          onClick: () => patchStatus(applicant._id, "Hired"),
        };
  
      default:
        return null;
    }
  };
  
  

  return (
    <div key={renderKey} className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                { key: "name", label: "Candidate" },
                { key: "jobTitle", label: "Role" },
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
                  className="hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => {
                    setJobListingId(app.jobId);
                    setSelectedApplicant(app);

                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {app.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {app.email}
                        </div>
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
                    {app.interviewDate
                      ? new Date(app.interviewDate).toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {/* Action button determined by status */}
                    {statusAction && (
                        <button
                          className="text-green-600 hover:text-green-900 transition-colors flex items-center"
                          title={statusAction.label}
                          onClick={statusAction.onClick}
                        >
                          <FaCalendarPlus className="mr-1" />
                          {statusAction.label}
                        </button>
                      ) || "—"} 
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      {/* View button */}
                      <button
                        className="text-blue-600 hover:text-blue-900 transition-colors flex items-center"
                        title="View Candidate"
                        onClick={() => {
                            window.open(app.cv, "_blank", "noopener,noreferrer");
                        }
                        }
                      >
                        <FaEye className="mr-1" /> View
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Empty state */}
        {applicants && applicants.length === 0 && (
          <div className="text-center py-8 px-4 sm:px-6 lg:px-8">
            {/* ...same empty state content... */}
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
          jobListingId={jobListingId} 
          recruiter={recruiter}
          refetchApplicants={() => {
            // Refresh data or handle next steps
            setShowScheduleModal(false);
            if (refetchApplicants) refetchApplicants();
          }}
        />
      )}
    </div>
  );
};

export default CandidateTable;
