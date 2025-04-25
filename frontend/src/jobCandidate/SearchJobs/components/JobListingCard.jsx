import React, { useEffect, useState, useRef } from "react";
import { FaCheck, FaBookmark, FaRegBookmark, FaComments, FaRobot, FaBriefcase, FaCode, FaTimes, FaStar } from "react-icons/fa";
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
  setUser
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
  const cardRef = useRef(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const [appliedCounter, setAppliedCounter] = useState(applicants?.length || 0);
  const [applyButtonEnabled, setApplyButtonEnabled] = useState(true);
  const [isSaved, setIsSaved] = useState(
    user.savedJobListings?.map(id => id.toString()).includes(jobId.toString())
  );  
  const token = localStorage.getItem('token');
  const [isHovered, setIsHovered] = useState(false);
  const [showMatchDetails, setShowMatchDetails] = useState(false);
  const matchDetailsRef = useRef(null);

  const toggleSave = async (e) => {
    e.stopPropagation();
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

  // Handle opening match details from points badge
  const handlePointsClick = (e) => {
    e.stopPropagation();
    
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top + window.scrollY + 10,
        left: rect.right + window.scrollX - 80,
      });
      
      setShowMatchDetails(true);
    }
  };

  // Handle closing match details
  const handleCloseDetails = (e) => {
    if (e) e.stopPropagation();
    setShowMatchDetails(false);
  };

  // Click outside to close match details
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMatchDetails && 
          matchDetailsRef.current && 
          !matchDetailsRef.current.contains(event.target) &&
          // Ensure clicks on the points badge are handled by the badge itself
          !(event.target.closest('[data-points-badge="true"]'))) {
        setShowMatchDetails(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMatchDetails]);

  const handleChatButtonClick = async (e) => {
    e.stopPropagation();
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
      showNotification("error", "Failed to create chat. Please try again later.");
    }
  };

  // When the user clicks "Talk with Chatbot", navigate to /chats with job data in state.
  const handleInterviewChatClick = (e) => {
    e.stopPropagation();
    navigate("/chats", { 
      state: { 
        ...state, 
        interviewJobData: jobListing, 
        chatType: "interviewer" 
      } 
    });
  };

  const handleApplyNow = async (e) => {
    e.stopPropagation();
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

          // Update the user state with incremented numOfApplicationsSent
          const updatedUser = {
            ...user,
            numOfApplicationsSent: (user.numOfApplicationsSent || 0) + 1
          };
          setUser(updatedUser);
          
          // Navigate back to the same location with updated state
          navigate(location.pathname, { state: { ...state, user: updatedUser } });
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

  // Format date in a more modern way
  const formattedDate = createdAt 
    ? new Date(createdAt).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }) 
    : "N/A";

  return (
    <div 
      ref={cardRef}
      className="relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 
                border border-gray-300 bg-white hover:shadow-2xl hover:border-blue-200
                group cursor-pointer mb-4" 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onJobSelect(jobListing)}
    >
      {/* Score badge if available - better positioned and with clear interaction */}
      {score !== undefined && (
        <button 
          data-points-badge="true"
          type="button"
          className="absolute top-0 right-14 m-4 bg-gradient-to-r from-indigo-500 to-blue-600 text-white 
                    px-3 py-1 rounded-full flex items-center gap-1 z-10 shadow-md hover:shadow-lg 
                    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={handlePointsClick}
          aria-label="Show match details"
        >
          <FaStar size={12} className="text-yellow-200" />
          <span className="font-semibold">{score}</span>
          <span className="text-xs">points</span>
        </button>
      )}

      {/* Main content */}
      <div className="p-6">
        {/* Header section with company & recruiter info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-14 w-14 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
                <img
                  src={companyLogo || "https://res.cloudinary.com/careeragent/image/upload/v1735084555/default_profile_image.png"}
                  alt={company}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full overflow-hidden border-2 border-white">
                <img
                  src={recruiterProfileImage || "https://res.cloudinary.com/careeragent/image/upload/v1735084555/default_profile_image.png"}
                  alt={recruiterName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Posted by {recruiterName || "Unknown Recruiter"}</p>
              <p className="text-xs text-gray-400">{formattedDate}</p>
            </div>
          </div>
          
          <button 
            onClick={toggleSave} 
            className={`p-2 rounded-full transition-all duration-300 ${
              isSaved ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
            }`}
          >
            {isSaved ? <FaBookmark size={20}/> : <FaRegBookmark size={20}/>}
          </button>
        </div>

        {/* Job details */}
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-800 mb-1">{jobRole || "Unknown Role"}</h2>
          <p className="text-gray-600 text-sm">
            {company} {location && `• ${location}`}
          </p>
          
          {/* Job type badges */}
          <div className="flex flex-wrap gap-2 mt-3">
            {experienceLevel && (
              <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                {experienceLevel}
              </span>
            )}
            {jobType?.map((type, index) => (
              <span key={index} className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-full">
                {type}
              </span>
            ))}
            {remote && (
              <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full">
                {remote}
              </span>
            )}
          </div>

          {/* Skills */}
          {skills?.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700 flex items-center mb-1.5">
                <FaCode className="mr-1.5 text-gray-500" size={14} />
                Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {skills.slice(0, 4).map((skill, index) => (
                  <span key={index} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                    {skill}
                  </span>
                ))}
                {skills.length > 4 && (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                    +{skills.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action buttons and stats */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <button
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all duration-300 ${
              applyButtonEnabled
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:from-green-600 hover:to-emerald-700"
                : "bg-gray-100 text-gray-600 flex items-center justify-center"
            }`}
            onClick={handleApplyNow}
            disabled={!applyButtonEnabled}
          >
            {applyButtonEnabled ? (
              <>
                <FaBriefcase />
                Apply Now
              </>
            ) : (
              <>
                <FaCheck className="text-green-600" />
                Applied
              </>
            )}
          </button>

          {!showOnlyApply && (
            <>
              <button
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center gap-1.5"
                onClick={handleChatButtonClick}
              >
                <FaComments />
                Chat
              </button>
              
              <button
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-orange-50 text-orange-600 hover:bg-orange-100 flex items-center gap-1.5"
                onClick={handleInterviewChatClick}
              >
                <FaRobot />
                Practice
              </button>
            </>
          )}

          {/* Applied counter */}
          <div className="ml-auto px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
            {appliedCounter || 0} applied
          </div>
        </div>
      </div>

      {/* Matched criteria tooltip - improved positioning and interaction */}
      {score !== undefined && score !== 0 && matchedData && showMatchDetails && (
        <div 
          ref={matchDetailsRef}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="fixed inset-0 bg-black bg-opacity-30" 
            onClick={handleCloseDetails}
          ></div>
          <div className="relative bg-white rounded-xl shadow-xl border border-gray-200 p-5 w-80 max-w-[90vw] max-h-[80vh] overflow-auto z-50">
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <p className="font-bold text-gray-800">Match Score: {score} points</p>
              <button 
                onClick={handleCloseDetails} 
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <FaTimes size={16} />
              </button>
            </div>
            <div>
              <ul className="list-none pl-0 space-y-3">
                {matchedData?.jobRole?.length > 0 && (
                  <li>
                    <strong className="block text-blue-600 text-sm">Job Role:</strong>
                    <span className="block text-sm text-gray-700">{matchedData.jobRole.join(", ")}</span>
                  </li>
                )}
                {matchedData?.jobType?.length > 0 && (
                  <li>
                    <strong className="block text-blue-600 text-sm">Job Type:</strong>
                    <span className="block text-sm text-gray-700">{matchedData.jobType.join(", ")}</span>
                  </li>
                )}
                {matchedData?.securityClearance !== null && (
                  <li>
                    <strong className="block text-blue-600 text-sm">Security Clearance:</strong>
                    <span className="block text-sm text-gray-700">{matchedData.securityClearance}</span>
                  </li>
                )}
                {matchedData?.education?.length > 0 && (
                  <li>
                    <strong className="block text-blue-600 text-sm">Education:</strong>
                    <span className="block text-sm text-gray-700">{matchedData.education.join(", ")}</span>
                  </li>
                )}
                {matchedData?.workExperience?.length > 0 && (
                  <li>
                    <strong className="block text-blue-600 text-sm">Work Experience:</strong>
                    <span className="block text-sm text-gray-700">{matchedData.workExperience.join(", ")}</span>
                  </li>
                )}
                {matchedData?.skills?.length > 0 && (
                  <li>
                    <strong className="block text-blue-600 text-sm">Skills:</strong>
                    <span className="block text-sm text-gray-700">
                      {matchedData.skills.join(", ")}
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobListingCard;
