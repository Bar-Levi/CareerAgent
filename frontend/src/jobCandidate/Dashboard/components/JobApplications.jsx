import React, { useEffect, useState } from "react";
import { FaSpinner, FaBriefcase, FaCheckCircle, FaTimesCircle, FaClock, FaUserTie } from "react-icons/fa";

const JobApplications = ({ user }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col min-h-0">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 flex-none">
        <h2 className="text-lg font-bold text-white">Job Applications</h2>
      </div>

      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <FaSpinner className="animate-spin text-3xl text-indigo-600" />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-4">
            <FaBriefcase className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600 text-base font-medium">No applications found</p>
            <p className="text-gray-500 text-sm mt-1">Your job applications will appear here</p>
          </div>
        ) : (
          <div className="overflow-y-auto h-full">
            <div className="p-4 space-y-2">
              {applications.map((app) => (
                <div
                  key={app._id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-200 hover:shadow-sm transition-all duration-200"
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
