import React, { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

const JobListingCard = ({ 
  user: userProp,
  onJobSelect,
  jobListing,
  setShowModal,
  showNotification,
  setRenderingConversationKey,
  setRenderingConversationData,
  showOnlyApply = false,
}) => {
  const {
    jobRole,
    company,
    location,
    experienceLevel,
    companySize,
    jobType,
    remote,
    companyWebsite,
    recruiterName,
    recruiterProfileImage,
    applicants,
    education,
    skills,
    _id: jobId,
    recruiterId,
    createdAt,
    score = undefined,
    matchedData = undefined,
  } = jobListing;

  const { state } = useLocation();
  const user = state?.user ?? userProp;
  const navigate = useNavigate();

  const [appliedCounter, setAppliedCounter] = useState(applicants?.length || 0);
  const [applyButtonEnabled, setApplyButtonEnabled] = useState(true);
  const token = localStorage.getItem('token');

  const handleChatButtonClick = async () => {
    try {
      const participants = [
        {
          userId: user._id.toString(),
          name: user.fullName,
          profilePic: user.profilePic,
          role: user.role
        },
        {
          userId: recruiterId.toString(),
          profilePic: recruiterProfileImage,
          name: recruiterName,
          role: "Recruiter"
        }
      ];
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          participants,
          jobListingId: jobId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || response.statusText}`);
      }

      const { conversation } = await response.json();
      console.log("New conversation created:", conversation);
      onJobSelect(jobListing);

      setRenderingConversationData({
        convId: conversation._id,
        secondParticipantProfilePic: conversation.participants[1].profilePic,
        participantName: recruiterName,
        jobListingRole: jobRole,
      });
      setRenderingConversationKey((prev) => prev + 1);

    } catch (error) {
      console.error('Error creating conversation:', error);
      alert("Failed to create chat. Please try again later.");
    }
  };

  // When the user clicks "Talk with Chatbot", navigate to /chats with job data in state.
  const handleInterviewChatClick = () => {
    navigate("/chats", { 
      state: { 
        ...state, 
        interviewJobData: jobListing, 
        chatType: "interviewer" 
      } 
    });
  };

  const handleApplyNow = async () => {
    if (!user.cv || user.cv === "") {
      setShowModal(true); // Show modal if CV is missing
      return;
    }
    try {
      const applicantResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/applicants`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            name: user.fullName,
            email: user.email,
            phone: user.phone,
            linkedinUrl: user.linkedinUrl,
            githubUrl: user.githubUrl,
            cv: user.cv,
            isSubscribed: user.isSubscribed,
            profilePic: user.profilePic,
            jobId: jobId,
            recruiterId: recruiterId,
            jobSeekerId: user._id,
            jobTitle: jobRole,
          }),
        }
      );
      const applicantData = await applicantResponse.json();
      if (applicantResponse.ok) {
        console.log("Applicant created successfully:", applicantData);

        const updateJobResponse = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/joblistings/${jobId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              $push: {
                applicants: {
                  applicantId: applicantData.applicant._id,
                  jobSeekerId: user._id,
                },
              },
            }),
          }
        );

        if (updateJobResponse.ok) {
          showNotification("success", "Application submitted successfully!");
          setAppliedCounter((prev) => prev + 1);
          setApplyButtonEnabled(false);
        } else {
          showNotification("error", "Failed to update job listing with the new applicant.");
        }
      } else {
        showNotification("error", applicantData.message);
      }
    } catch (error) {
      console.error("Error applying for the job:", error);
      showNotification("error", "An error occurred. Please try again.");
    }
  };

  useEffect(() => {
    const existingApplicant = applicants?.find(
      (applicant) => applicant.jobSeekerId === user._id
    );
    if (existingApplicant) {
      setApplyButtonEnabled(false);
    }
  }, [applicants, user._id]);

  return (
    <div className="flex flex-col border border-gray-300 rounded-lg shadow-lg bg-gradient-to-r from-white to-gray-200 p-6 max-w-xl hover:shadow-xl transition-shadow duration-300">
      {/* Top Section: Recruiter Info */}
      <div className="flex items-center justify-between space-x-4">
        <div className="flex-shrink-0">
          <img
            src={recruiterProfileImage || 'https://res.cloudinary.com/careeragent/image/upload/v1735084555/default_profile_image.png'}
            alt="Recruiter"
            className="w-16 h-16 object-cover border-2 border-black rounded-full p-1"
          />
        </div>
        <div className="flex-grow">
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">
              Recruited by {recruiterName || "Unknown Recruiter"}
            </span>
            <br />
            <span className="text-xs text-gray-500">
              Posted on {createdAt ? new Date(createdAt).toLocaleDateString() : "N/A"}
            </span>
          </p>
        </div>
        {!showOnlyApply && (
        <div>
          <button
            className="px-4 py-2 bg-gradient-to-tr from-blue-300 to-blue-600 text-white font-semibold rounded hover:from-blue-400 hover:to-blue-700 hover:shadow-lg transition-all duration-300"
            onClick={handleChatButtonClick}
          >
            Chat with Recruiter
          </button>
        </div>
        )}
      </div>

      <hr className="border-gray-300 my-4" />

      {/* Middle Section: Job Details */}
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-tr from-gray-200 to-gray-300 rounded-md flex items-center justify-center">
          <span className="text-xl font-bold text-gray-600">Logo</span>
        </div>
        <div className="flex-grow">
          <h3 className="text-xl font-bold text-gray-800">{jobRole || "Unknown Role"}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {company && location ? `${company} - ${location}` : company || location || "Unknown Company/Location"}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {experienceLevel && `Experience: ${experienceLevel}`}
            {jobType?.length > 0 && ` | Type: ${jobType.join(", ")}`}
            {remote && ` | Remote: ${remote}`}
          </p>
          {skills?.length > 0 && (
            <p className="text-sm text-gray-500 mt-2">Skills: {skills.join(", ")}</p>
          )}
        </div>
      </div>

      <hr className="border-gray-300 my-4" />

      {/* Bottom Section: Action Buttons */}
      <div className="flex flex-wrap items-center justify-between">
        <button
          className={`px-4 py-2 font-semibold rounded transition-all duration-300 ${
            applyButtonEnabled
              ? "bg-gradient-to-tr from-green-300 to-green-600 text-white hover:from-green-400 hover:to-green-700 hover:shadow-lg"
              : "bg-gray-200 text-gray-700 flex items-center justify-center"
          }`}
          onClick={handleApplyNow}
          disabled={!applyButtonEnabled}
        >
          {applyButtonEnabled ? (
            "Apply Now"
          ) : (
            <span className="flex items-center">
              <FaCheck className="mr-2 text-green-600" />
              Applied
            </span>
          )}
        </button>

        {/* Talk with Chatbot button */}
        {!showOnlyApply && (
        <button
          className="px-4 py-2 font-semibold rounded bg-gradient-to-tr from-orange-300 to-orange-600 text-white hover:from-orange-400 hover:to-orange-700 hover:shadow-lg"
          onClick={handleInterviewChatClick}
        >
          Talk with Chatbot
        </button>
        )}

        <span className="py-2 text-gray-800 font-semibold rounded cursor-default">
          Applied: {appliedCounter || 0}
        </span>

        {/* Score Display with Tooltip */}
        {score !== undefined && (
          <div className="flex justify-center items-center">
            <span className="py-2 text-gray-800 font-semibold rounded">
              Score: {score}
            </span>
            {score !== 0 && matchedData && (
              <div className="relative group cursor-help">
                <span className="text-gray-800 text-md">
                  <i className="ml-3 fa fa-info-circle" />
                </span>
                <div className="absolute right-0 top-full mt-2 hidden group-hover:block bg-white text-gray-700 text-sm rounded-lg shadow-lg p-4 w-64 border border-gray-300">
                  <p className="text-lg font-bold mb-3 border-b pb-2">Matched Criteria</p>
                  <ul className="list-none pl-0 space-y-1">
                    {matchedData?.jobRole?.length > 0 && (
                      <li>
                        <strong className="block text-blue-600">Job Role:</strong>
                        <span>{matchedData.jobRole.join(", ")}</span>
                      </li>
                    )}
                    {matchedData?.jobType?.length > 0 && (
                      <li>
                        <strong className="block text-blue-600">Job Type:</strong>
                        <span>{matchedData.jobType.join(", ")}</span>
                      </li>
                    )}
                    {matchedData?.securityClearance !== null && (
                      <li>
                        <strong className="block text-blue-600">Security Clearance:</strong>
                        <span>{matchedData.securityClearance}</span>
                      </li>
                    )}
                    {matchedData?.education?.length > 0 && (
                      <li>
                        <strong className="block text-blue-600">Education:</strong>
                        <span>{matchedData.education.join(", ")}</span>
                      </li>
                    )}
                    {matchedData?.workExperience?.length > 0 && (
                      <li>
                        <strong className="block text-blue-600">Work Experience:</strong>
                        <span>{matchedData.workExperience.join(", ")}</span>
                      </li>
                    )}
                    {matchedData?.skills?.length > 0 && (
                      <li>
                        <strong className="block text-blue-600">Skills:</strong>
                        <span>
                          {matchedData.skills.length > 5
                            ? matchedData.skills.slice(0, 5).join(", ") + ", ..."
                            : matchedData.skills.join(", ")}
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobListingCard;
