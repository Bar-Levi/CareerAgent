import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import convertMongoObject from "../../utils/convertMongoObject";
import { getCandidateInfo } from "../../utils/auth";
import ScheduleInterviewModal from "../components/ScheduleInterviewModal";

const Applications = ({
  applications = [],
  setSelectedConversationId,
  setSelectedJobListing,
  setSelectedCandidate,
  setTitle,
  setViewMode,
  selectedCandidateId,  
}) => {
  const { state } = useLocation();
  const user = state?.user;
  const [applicantsData, setApplicantsData] = useState({});
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const navigate = useNavigate();

  const selectedCandidateRef = useRef();
  const containerRef = useRef();
  
  // Handle applicant selection
  const handleApplicantClick = (app) => {
    setSelectedApplicant(app);
    
    // Set a minimal timeout to ensure the DOM has updated before scrolling
    setTimeout(() => {
      if (selectedCandidateRef.current) {
        selectedCandidateRef.current.scrollIntoView({ 
          behavior: "smooth", 
          block: "center" 
        });
      }
    }, 50);
  };
  
  // Scroll to selected candidate when it changes or on initial load
  useEffect(() => {
    if (selectedCandidateId && applications && selectedCandidateRef.current) {
      selectedCandidateRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedApplicant, applications, selectedCandidateId]);

  const getApplicantDataAsJobSeeker = async (application) => {
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/api/auth/user-details?id=${encodeURIComponent(
        application.jobSeekerId
      )}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${
          errorData.message || response.statusText
        }`
      );
    }

    const applicantData = await response.json();
    return applicantData;
  };

  const handleChatButtonClick = async (applicant, event) => {
    // Prevent the click from bubbling up to parent div
    event?.stopPropagation();
    
    try {
      const participants = [
        {
          userId: applicant.jobSeekerId,
          name: applicant.name,
          profilePic: applicant.profilePic,
          role: "JobSeeker",
        },
        {
          userId: user._id,
          name: user.fullName,
          profilePic: user.profilePic,
          role: user.role,
        },
      ];
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/conversations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            participants,
            jobListingId: applicant.jobId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${
            errorData.message || response.statusText
          }`
        );
      }

      const { conversation, jobListingObject } = await response.json();

      setSelectedJobListing(convertMongoObject(jobListingObject));
      setSelectedConversationId(conversation._id);
      setViewMode("messages");

      const candidateInfo = await getCandidateInfo(conversation);
      setSelectedCandidate(candidateInfo);
      setTitle(candidateInfo.name);
    } catch (error) {
      console.error("Error creating conversation:", error);
      alert("Failed to create chat. Please try again later.");
    }
  };

  const trackApplicant = async (applicant, event) => {
    // Prevent the click from bubbling up to parent div
    event?.stopPropagation();
    
    try {
      localStorage.setItem("stateAddition", JSON.stringify({ applicant }));
      navigate(`/recruiter-candidate-tracker`, { state });
    } catch (error) {
      console.error("Error tracking applicant:", error);
      alert("Failed to track applicant. Please try again later.");
    }
  };

  useEffect(() => {
    const fetchApplicantsData = async () => {
      const newApplicantsData = {};
      for (const app of applications) {
        try {
          const data = await getApplicantDataAsJobSeeker(app);
          newApplicantsData[app._id] = data;
        } catch (error) {
          console.error(`Error fetching applicant data for app id ${app._id}:`, error);
        }
      }
      setApplicantsData(newApplicantsData);
    };

    if (applications.length > 0) {
      fetchApplicantsData();
    }
  }, [applications]);

  // Find the current selected applicant in the applications array
  useEffect(() => {
    if (selectedCandidateId && applications.length > 0) {
      const selected = applications.find(app => app.jobSeekerId === selectedCandidateId);
      if (selected) {
        setSelectedApplicant(selected);
      }
    }
  }, [selectedCandidateId, applications]);

  return (
    <div className="mx-auto h-full flex flex-col">
      <div className="relative w-full bg-white rounded-lg border border-gray-300 shadow-lg flex-grow flex flex-col overflow-hidden">
        <div className="sticky top-0 z-10 shadow-lg bg-gradient-to-r bg-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Applications
          </h2>
        </div>

        {applications.length === 0 ? (
          <div className="flex justify-center items-center p-16 text-gray-500 flex-grow">
            <p className="text-lg font-medium">No recent applications.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 overflow-y-auto flex-grow" ref={containerRef}>
            {applications.map((app) => {
              const applicantData = applicantsData[app._id];
              const isSelected = selectedApplicant?._id === app._id || app.jobSeekerId === selectedCandidateId;

              return (
                <div
                  key={app._id}
                  ref={isSelected ? selectedCandidateRef : null}
                  className={`p-6 transition-colors duration-200 cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-50 border-l-4 border-indigo-500' 
                      : 'hover:bg-gray-50 group'
                  }`}
                  onClick={() => handleApplicantClick(app)}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                    {/* Profile Picture */}
                    <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 ring-4 ring-blue-50 shadow-md">
                      <img
                        src={
                          applicantData?.profilePic ||
                          "https://res.cloudinary.com/careeragent/image/upload/v1735084555/default_profile_image.png"
                        }
                        alt={`${app.name || "Candidate"}'s profile`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Candidate Info */}
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-1">
                            {app.name}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            Applied for:{" "}
                            <span className="font-medium text-blue-600">
                              {app.jobTitle}
                            </span>
                          </p>
                          <p className="text-xs text-gray-400 mb-3">
                            Applied on:{" "}
                            {new Date(app.applicationDate || app.date).toLocaleDateString()}
                          </p>
                        </div>

                        <div
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            app.status === "Applied"
                              ? "bg-blue-100 text-blue-800"
                              : app.status.includes("Interview")
                              ? "bg-purple-100 text-purple-800"
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
                        </div>
                      </div>

                      {/* Links Section */}
                      <div className="mt-3 flex flex-wrap gap-3" onClick={(e) => e.stopPropagation()}>
                        <a
                          href={app.cv}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center space-x-1"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span>View CV</span>
                        </a>

                        {app.linkedinUrl && (
                          <a
                            href={app.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center space-x-1"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                            <span>LinkedIn</span>
                          </a>
                        )}

                        {app.githubUrl && (
                          <a
                            href={app.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center space-x-1"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.744.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            <span>GitHub</span>
                          </a>
                        )}
                      </div>

                      {/* Buttons Section */}
                      <div className="mt-4 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white text-sm font-semibold rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          onClick={(e) => handleChatButtonClick(app, e)}
                        >
                          Chat with Applicant
                        </button>
                        <button
                          className="px-6 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                          onClick={(e) => trackApplicant(app, e)}
                        >
                          Track Applicant
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;
