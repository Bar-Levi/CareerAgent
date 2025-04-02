import React, { useEffect, useState } from "react";
import { FaCheck, FaBookmark, FaRegBookmark } from "react-icons/fa";
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
    companyLogo,
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
  const [isSaved, setIsSaved] = useState(
    user.savedJobListings?.map(id => id.toString()).includes(jobId.toString())
  );  
  const token = localStorage.getItem('token');

  const toggleSave = async () => {
    const method = isSaved ? "DELETE" : "POST";
    const url = `${process.env.REACT_APP_BACKEND_URL}/api/jobseeker/${user._id}/saved/${jobId}`;
  
    try {
      await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
  
      // Compute new saved list
      const updatedSaved = isSaved
        ? user.savedJobListings.filter(id => id.toString() !== jobId.toString())
        : [...(user.savedJobListings || []), jobId];
  
      const updatedUser = { ...user, savedJobListings: updatedSaved };
  
      // Push new state into the same route
      navigate(location.pathname, { state: { ...state, user: updatedUser } });
  
      setIsSaved(!isSaved);
      showNotification("success", isSaved ? "Removed from Saved" : "Job Saved");
    } catch {
      showNotification("error", "Unable to update saved jobs");
    }
  };  

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
          isJobSeeker: true,
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
          <img
            src={companyLogo || "https://res.cloudinary.com/careeragent/image/upload/v1735084555/default_profile_image.png"}
            alt="Company Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-grow">
          <h3 className="text-xl font-bold text-gray-800">{jobRole || "Unknown Role"}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {company && location
              ? `${company} - ${location}`
              : company || location || "Unknown Company/Location"}
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

      {/* Bottom Section: Action Buttons and Stats */}
      <div className="flex items-center gap-3">
        <button
          className={`px-3 py-2 text-base font-semibold rounded transition-all duration-300 whitespace-nowrap ${
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
            <span className="flex items-center whitespace-nowrap">
              <FaCheck className="mr-2 text-green-600" />
              Applied
            </span>
          )}
        </button>
      
        <button onClick={toggleSave} className="p-2 rounded hover:bg-gray-200">
          {isSaved ? <FaBookmark size={18}/> : <FaRegBookmark size={18}/>}
        </button>

        {/* Talk with Chatbot button */}
        {!showOnlyApply && (
        <button
          className="px-4 py-2 text-base font-semibold rounded bg-gradient-to-tr from-orange-300 to-orange-600 text-white hover:from-orange-400 hover:to-orange-700 hover:shadow-lg whitespace-nowrap"
          onClick={handleInterviewChatClick}
        >
          Talk with Chatbot
        </button>
        )}

        <div className="flex items-center gap-4 ml-auto whitespace-nowrap">
          <span className="text-gray-800 text-base">
            Applied: {appliedCounter || 0}
          </span>

          {/* Score Display with Tooltip */}
          {score !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-gray-800 text-base">
                Score: {score}
              </span>
              {score !== 0 && matchedData && (
                <div className="relative group cursor-help">
                  <span className="text-gray-800 text-base">
                    <i className="fa fa-info-circle" />
                  </span>
                  <div className="absolute right-0 top-full mt-2 hidden group-hover:block bg-white text-gray-700 text-sm rounded-lg shadow-lg p-3 w-56 border border-gray-300 z-10">
                    <p className="text-base font-bold mb-2 border-b pb-1">Matched Criteria</p>
                    <ul className="list-none pl-0 space-y-1">
                      {matchedData?.jobRole?.length > 0 && (
                        <li className="overflow-hidden">
                          <strong className="block text-blue-600 text-sm">Job Role:</strong>
                          <span className="block truncate">{matchedData.jobRole.join(", ")}</span>
                        </li>
                      )}
                      {matchedData?.jobType?.length > 0 && (
                        <li className="overflow-hidden">
                          <strong className="block text-blue-600 text-sm">Job Type:</strong>
                          <span className="block truncate">{matchedData.jobType.join(", ")}</span>
                        </li>
                      )}
                      {matchedData?.securityClearance !== null && (
                        <li className="overflow-hidden">
                          <strong className="block text-blue-600 text-sm">Security Clearance:</strong>
                          <span className="block truncate">{matchedData.securityClearance}</span>
                        </li>
                      )}
                      {matchedData?.education?.length > 0 && (
                        <li className="overflow-hidden">
                          <strong className="block text-blue-600 text-sm">Education:</strong>
                          <span className="block truncate">{matchedData.education.join(", ")}</span>
                        </li>
                      )}
                      {matchedData?.workExperience?.length > 0 && (
                        <li className="overflow-hidden">
                          <strong className="block text-blue-600 text-sm">Work Experience:</strong>
                          <span className="block truncate">{matchedData.workExperience.join(", ")}</span>
                        </li>
                      )}
                      {matchedData?.skills?.length > 0 && (
                        <li className="overflow-hidden">
                          <strong className="block text-blue-600 text-sm">Skills:</strong>
                          <span className="block truncate">
                            {matchedData.skills.join(", ")}
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
    </div>
  );
};

export default JobListingCard;
