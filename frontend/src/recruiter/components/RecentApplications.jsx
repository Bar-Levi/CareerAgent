import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import convertMongoObject from "../../utils/convertMongoObject";
import { getCandidateInfo } from "../../utils/auth";

const RecentApplications = ({ applications = [], setSelectedConversationId, setSelectedJobListing, setSelectedCandidate}) => {
  const { state } = useLocation();
  const user = state?.user;

  const [applicantsData, setApplicantsData] = useState({});

  // Helper function: Get applicant data for a job seeker
  const getApplicantDataAsJobSeeker = async (application) => {



    // Fetch API request using jobSeekerId from the application
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

  const handleChatButtonClick = async (applicant) => {
    try {
      const participants = [
        {
          userId: applicant.jobSeekerId,
          name: applicant.name,
          profilePic: applicant.profilePic,
          role: "JobSeeker"
        },
        {
          userId: user._id,
          name: user.fullName,
          profilePic: user.profilePic,
          role: user.role
        }        
      ]
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/conversations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              participants,
              jobListingId: applicant.jobId,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json(); // Try to get error details from the server
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || response.statusText}`);
        }

        const { conversation, jobListingObject } = await response.json();
    
    
        setSelectedJobListing(convertMongoObject(jobListingObject));
        setSelectedConversationId(conversation._id);

        const candidateInfo = await getCandidateInfo(conversation);
        setSelectedCandidate(candidateInfo);
      
    } catch (error) {
        console.error('Error creating conversation:', error);
        // Handle error (e.g., display an error message to the user)
        alert("Failed to create chat. Please try again later.") // Example alert
    }
};

  // Pre-fetch applicant data for all applications when they change.
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

  return (
    <div className="w-full max-w-5xl">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Applications</h2>
      <div className="bg-white shadow rounded-lg p-4">
        {applications.length === 0 ? (
          <p className="text-gray-500">No recent applications.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {applications.map((app) => {
              // Get the prefetched applicant data
              const applicantData = applicantsData[app._id];
              return (
                <li
                  key={app._id}
                  className="py-4 flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0"
                >
                  {/* Candidate Details */}
                  <div className="flex items-start space-x-4">
                    {/* Profile Picture */}
                    <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                      <img
                        src={
                          applicantData?.profilePic ||
                          'https://res.cloudinary.com/careeragent/image/upload/v1735084555/default_profile_image.png'
                        }
                        alt={`${app.candidate || "Candidate"}'s profile`}
                        className="w-full h-full object-cover border-2 border-black rounded-full p-1"
                      />
                    </div>

                    {/* Candidate Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {app.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Applied for: {app.jobTitle}
                      </p>
                      <p className="text-sm text-gray-400">
                        Date:{" "}
                        {new Date(app.applicationDate || app.date).toLocaleDateString()}
                      </p>

                      {/* CV Link */}
                      <p className="text-sm text-gray-500 mt-2">
                        <span className="font-semibold">CV: </span>
                        <a
                          href={app.cv}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View CV
                        </a>
                      </p>

                      {/* LinkedIn & GitHub Links */}
                      {app.linkedinUrl && (
                        <p className="text-sm text-gray-500">
                          <span className="font-semibold">LinkedIn: </span>
                          <a
                            href={app.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {app.linkedinUrl}
                          </a>
                        </p>
                      )}
                      {app.githubUrl && (
                        <p className="text-sm text-gray-500">
                          <span className="font-semibold">GitHub: </span>
                          <a
                            href={app.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {app.githubUrl}
                          </a>
                        </p>
                      )}

                      {/* Chat Button */}
                      <button
                        className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white text-sm font-semibold rounded-full shadow-lg transform transition-transform duration-200 hover:scale-105 hover:shadow-xl"
                        onClick={() => handleChatButtonClick(app)}
                      >
                        Chat with Applicant
                      </button>
                    </div>
                  </div>

                  {/* Application Status */}
                  <p
                    className={`px-3 py-1 text-sm rounded-full ${
                      app.status === "Screening"
                        ? "bg-yellow-100 text-yellow-800"
                        : app.status === "Pending"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                    aria-label={`Application Status: ${app.status}`}
                  >
                    {app.status}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RecentApplications;
