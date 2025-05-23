import React, { useEffect, useState, useRef } from "react";
import { FaCheck, FaBookmark, FaRegBookmark, FaComments, FaRobot, FaBriefcase, FaCode, FaTimes, FaStar, FaMapMarkerAlt, FaBuilding, FaGraduationCap, FaCalendarAlt, FaUsers } from "react-icons/fa";
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
  setUser,
  relevancePoints
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
  const [isSaved, setIsSaved] = useState(false);  
  const token = localStorage.getItem('token');
  const [isHovered, setIsHovered] = useState(false);
  const [showMatchDetails, setShowMatchDetails] = useState(false);
  const matchDetailsRef = useRef(null);

  // Initialize isSaved based on user data - this will run every time user or user.savedJobListings changes
  useEffect(() => {
    if (jobId && user?.savedJobListings) {
  
      // Always use a fresh check against the current user.savedJobListings
      const isJobSaved = Array.isArray(user.savedJobListings) && 
        user.savedJobListings.some(id => String(id) === String(jobId));

      setIsSaved(isJobSaved);
    }
  }, [jobId, user, user?.savedJobListings]); // Add explicit dependency on user.savedJobListings

  const toggleSave = async (e) => {
    e.stopPropagation();
    const method = isSaved ? "DELETE" : "POST";
    const url = `${process.env.REACT_APP_BACKEND_URL}/api/jobseeker/${user._id}/saved/${jobId}`;
  
    try {
      const response = await fetch(url, {
        method,
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Cache-Control": "no-cache, no-store, must-revalidate"
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to update saved jobs");
      }
      
      // Get the updated saved job listings directly from the response
      const data = await response.json();
      
      // Update the saved state based on the returned data
      const newSavedState = data.savedJobListings.some(id => String(id) === String(jobId));
      setIsSaved(newSavedState);
      
      // Create updated user object with the returned data
      const updatedUser = {
        ...user,
        savedJobListings: data.savedJobListings
      };
      
      // Update parent component state
      setUser(updatedUser);
      
      // Update location state if it exists
      if (state && state.user) {
        state.user.savedJobListings = data.savedJobListings;
      }
      
      showNotification("success", newSavedState ? "Job Saved" : "Removed from Saved");
    } catch (error) {
      console.error("Error updating saved jobs:", error);
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

          // Update the user state directly
          const updatedUser = {
            ...user,
            numOfApplicationsSent: (user.numOfApplicationsSent || 0) + 1
          };
          setUser(updatedUser);
          
          // Also update location.state.user
          if (state && state.user) {
            state.user.numOfApplicationsSent = (user.numOfApplicationsSent || 0) + 1;
          }
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
      {/* Top Header - Date and Actions */}
      <div className="absolute top-0 right-0 left-0 flex justify-between items-center p-4 z-10">
        {/* Posted date and recruiter info */}
        <div className="flex items-center text-gray-500 text-xs">
          <FaCalendarAlt className="mr-1 text-gray-400" size={12} />
          <span>{formattedDate}</span>
          <span className="mx-1">•</span>
          <span>by {recruiterName || "Unknown Recruiter"}</span>
        </div>
        
        {/* Save and Score Badge */}
        <div className="flex gap-2">
          {score !== undefined && (
            <button 
              data-points-badge="true"
              type="button"
              className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white 
                        px-3 py-1 rounded-full flex items-center gap-1 shadow-md hover:shadow-lg 
                        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onClick={handlePointsClick}
              aria-label="Show match details"
            >
              <FaStar size={12} className="text-yellow-200" />
              <span className="font-semibold">{score}</span>
              <span className="text-xs">points</span>
            </button>
          )}
          
          <button 
            onClick={toggleSave} 
            className={`p-2 rounded-full transition-all duration-300 ${
              isSaved ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
            }`}
            aria-label={isSaved ? "Remove from saved jobs" : "Save this job"}
          >
            {isSaved ? <FaBookmark size={20}/> : <FaRegBookmark size={20}/>}
          </button>
        </div>
      </div>

      <div className="p-6 pt-12"> {/* Increase top padding to accommodate the header */}
        {/* SECTION: Header with company info */}
        <div className="flex items-start mb-5 border-b border-gray-100 pb-4">
          <div className="flex-shrink-0 mr-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
                <img
                  src={companyLogo || "https://res.cloudinary.com/careeragent/image/upload/v1735084555/default_profile_image.png"}
                  alt={company}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full overflow-hidden border-2 border-white shadow-sm">
                <img
                  src={recruiterProfileImage || "https://res.cloudinary.com/careeragent/image/upload/v1735084555/default_profile_image.png"}
                  alt={recruiterName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          
          <div className="flex-grow">
            {/* Job Title and Company */}
            <h2 className="text-xl font-bold text-gray-800 mb-1">{jobRole || "Unknown Role"}</h2>
            <div className="flex items-center text-gray-600 text-sm mb-1">
              <FaBuilding className="mr-1.5 text-gray-500" size={14} />
              <span className="font-medium">{company}</span>
            </div>
            
            {/* Location */}
            {location && (
              <div className="flex items-center text-gray-500 text-sm mb-1">
                <FaMapMarkerAlt className="mr-1.5 text-gray-400" size={14} />
                <span>{location}</span>
              </div>
            )}
            
            {/* Company Size if available */}
            {companySize && (
              <div className="flex items-center text-gray-500 text-sm">
                <FaUsers className="mr-1.5 text-gray-400" size={14} />
                <span>{companySize}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* SECTION: Job Categories/Types */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2 border-b border-gray-100 pb-1">Job Details</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {experienceLevel && (
              <span className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full flex items-center">
                <FaCode className="mr-1.5" size={12} />
                {experienceLevel}
              </span>
            )}
            {jobType?.map((type, index) => (
              <span key={index} className="text-xs px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full">
                {type}
              </span>
            ))}
            {remote && (
              <span className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-full">
                {remote}
              </span>
            )}
          </div>
          
          {/* Education as separate section */}
          {education && (
            <div className="flex flex-wrap gap-2">
              {Array.isArray(education) ? (
                education.map((edu, index) => (
                  <span key={index} className="text-xs px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full flex items-center">
                    <FaGraduationCap className="mr-1.5" size={12} />
                    {edu}
                  </span>
                ))
              ) : (
                <span className="text-xs px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full flex items-center">
                  <FaGraduationCap className="mr-1.5" size={12} />
                  {education}
                </span>
              )}
            </div>
          )}
        </div>

        {/* SECTION: Skills */}
        {skills?.length > 0 && (
          <div className="mb-5 bg-gray-50 p-3 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center mb-2">
              <FaCode className="mr-1.5 text-blue-500" size={14} />
              Required Skills
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {skills.slice(0, 6).map((skill, index) => (
                <span key={index} className="text-xs px-2.5 py-1.5 bg-white text-gray-700 rounded-full border border-gray-200 shadow-sm">
                  {skill}
                </span>
              ))}
              {skills.length > 6 && (
                <span className="text-xs px-3 py-1.5 bg-gray-200 text-gray-700 rounded-full font-medium">
                  +{skills.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* SECTION: Application and Action buttons */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-gray-100">
          {/* Left side: Action buttons */}
          <div className="flex-grow flex gap-2">
            <button
              className={`flex-1 max-w-[150px] py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-all duration-300 ${
                applyButtonEnabled
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:from-green-600 hover:to-emerald-700"
                  : "bg-gray-100 text-gray-600"
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
                  className="flex-1 max-w-[120px] py-2.5 rounded-lg text-sm font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center gap-1.5"
                  onClick={handleChatButtonClick}
                >
                  <FaComments />
                  Chat
                </button>
                
                <button
                  className="flex-1 max-w-[120px] py-2.5 rounded-lg text-sm font-semibold bg-orange-50 text-orange-600 hover:bg-orange-100 flex items-center justify-center gap-1.5"
                  onClick={handleInterviewChatClick}
                >
                  <FaRobot />
                  Practice
                </button>
              </>
            )}
          </div>

          {/* Right side: Application counter */}
          <div className="px-3 py-1.5 rounded-full text-xs bg-gray-100 text-gray-700 flex items-center gap-1">
            <FaUsers className="text-gray-500" size={12} />
            <span>{appliedCounter || 0} applied</span>
          </div>
        </div>
      </div>

      {/* Match details modal */}
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
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-full">
                  <FaStar className="text-blue-600" size={16} />
                </div>
                <div>
                  <p className="font-bold text-gray-800">Match Details</p>
                  <p className="text-sm text-blue-600 font-medium">Score: {score} points</p>
                </div>
              </div>
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
                  <li className="p-2 bg-blue-50 rounded-lg">
                    <strong className="block text-blue-800 text-sm mb-1">Job Role ({relevancePoints.matchedJobRolePoints})</strong>
                    <span className="block text-sm text-gray-700">{matchedData.jobRole.join(", ")}</span>
                  </li>
                )}
                {matchedData?.jobType?.length > 0 && (
                  <li className="p-2 bg-purple-50 rounded-lg">
                    <strong className="block text-purple-800 text-sm mb-1">Job Type ({matchedData.jobType[0].split(',')[1]})</strong>
                    <span className="block text-sm text-gray-700">{matchedData.jobType[0].split(',')[0]}</span>
                  </li>
                )}
                {matchedData?.securityClearance !== null && (
                  <li className="p-2 bg-amber-50 rounded-lg">
                    <strong className="block text-amber-800 text-sm mb-1">Security Clearance ({relevancePoints.matchedSecurityClearancePoints})</strong>
                    <span className="block text-sm text-gray-700">{matchedData.securityClearance}</span>
                  </li>
                )}
                {matchedData?.education?.length > 0 && (
                  <li className="p-2 bg-green-50 rounded-lg">
                    <strong className="block text-green-800 text-sm mb-1">Education ({relevancePoints.matchedEducationPoints})</strong>
                    <span className="block text-sm text-gray-700">{matchedData.education.join(", ")}</span>
                  </li>
                )}
                {matchedData?.workExperience?.length > 0 && (
                  <li className="p-2 bg-indigo-50 rounded-lg">
                    <strong className="block text-indigo-800 text-sm mb-1">Work Experience ({relevancePoints.matchedWorkExperiencePoints})</strong>
                    <span className="block text-sm text-gray-700">{matchedData.workExperience.join(", ")}</span>
                  </li>
                )}
                {matchedData?.skills?.length > 0 && (
                  <li className="p-2 bg-gray-50 rounded-lg">
                    <strong className="block text-gray-800 text-sm mb-1">Skills ({relevancePoints.matchedSkillPoints})</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {matchedData.skills.map((skill, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-full text-gray-700">
                          {skill}
                        </span>
                      ))}
                    </div>
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
