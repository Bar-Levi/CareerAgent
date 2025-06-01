import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import convertMongoObject from "../../utils/convertMongoObject";
import { getCandidateInfo } from "../../utils/auth";

const Applications = ({
  applications = [],
  setSelectedConversationId,
  setSelectedJobListing,
  setSelectedCandidate,
  setTitle,
  setViewMode,
  selectedCandidateId,
  darkMode,  
}) => {
  const { state } = useLocation();
  const user = state?.user;
  const [applicantsData, setApplicantsData] = useState({});
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [processedCandidateId, setProcessedCandidateId] = useState(null);
  const [currentJobListingId, setCurrentJobListingId] = useState(null);
  const [notificationTimestamp, setNotificationTimestamp] = useState(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const navigate = useNavigate();

  const selectedCandidateRef = useRef();
  const containerRef = useRef();
  const applicationRefs = useRef({});
  
  // Identify and save the current job listing ID
  useEffect(() => {
    if (applications && applications.length > 0 && applications[0].jobId) {
      const jobId = applications[0].jobId;
      if (jobId !== currentJobListingId) {
        setCurrentJobListingId(jobId);
        
        // Reset processed flag when changing job listings
        setProcessedCandidateId(null);
      }
    }
  }, [applications, currentJobListingId]);
  
  // Extract timestamp and jobListingId from state if available
  useEffect(() => {
    if (state) {
      if (state.timestamp) {
        setNotificationTimestamp(state.timestamp);
      }
      
      // If a specific job listing ID is provided in the state (from notification),
      // set it as the current job listing ID to ensure correct loading
      if (state.jobListingId && state.jobListingId !== currentJobListingId) {
        if (process.env.NODE_ENV !== 'production') {
          console.log("Setting job listing ID from state:", state.jobListingId);
          console.log("Current applications:", applications);
        }
        setCurrentJobListingId(state.jobListingId);
        // Reset processed flag when changing job listings via notification
        setProcessedCandidateId(null);
        
        // Look for applications with this job ID
        const matchingApplications = applications.filter(app => 
          (app.jobId && app.jobId._id === state.jobListingId) || 
          app.jobId === state.jobListingId
        );
        
        if (process.env.NODE_ENV !== 'production') {
          console.log("Applications for this job listing:", matchingApplications);
        }
      }
    }
  }, [state, currentJobListingId, applications]);
  
  // Handle applicant selection
  const handleApplicantClick = (app) => {
    // Check if this app is currently selected
    const isCurrentlySelected = selectedApplicant && selectedApplicant._id === app._id;
    
    // Toggle selection - if clicking the same applicant, deselect it
    if (isCurrentlySelected) {
      setSelectedApplicant(null);
    } else {
      setSelectedApplicant(app);
      
      // Only scroll if we're selecting a new applicant
      setTimeout(() => {
        if (selectedCandidateRef.current) {
          selectedCandidateRef.current.scrollIntoView({ 
            behavior: "smooth", 
            block: "center" 
          });
        }
      }, 50);
    }
  };
  
  // Helper function to find applicant by ID
  const findApplicantById = useCallback((idToFind) => {
    if (!idToFind || !applications || applications.length === 0) return null;
    
    if (process.env.NODE_ENV !== 'production') {
      console.log("Finding applicant with ID:", idToFind);
    }
    
    // Try to find the applicant
    const found = applications.find(app => {
      // Check if app.applicantId exists before accessing _id
      if (!app || !app.applicantId) {
        if (process.env.NODE_ENV !== 'production') {
          console.log("Found application missing applicantId:", app);
        }
        return false;
      }
      
      return app.applicantId._id === idToFind || 
        app.applicantId._id.toString() === idToFind.toString();
    });
    
    if (!found) {
      if (process.env.NODE_ENV !== 'production') {
        console.log("Could not find applicant with ID:", idToFind);
      }
      return null;
    }
    
    if (process.env.NODE_ENV !== 'production') {
      console.log("Found applicant:", found.name);
    }
    return found;
  }, [applications]);
  
  // Auto-select and scroll to application if selectedCandidateId is provided
  useEffect(() => {
    // Only process the selectedCandidateId if it's provided and applications exist
    if (selectedCandidateId && applications && applications.length > 0) {
      if (process.env.NODE_ENV !== 'production') {
        console.log("Selected candidate ID found:", selectedCandidateId);
        console.log("Already processed this ID?", selectedCandidateId === processedCandidateId);
        console.log("Current notification timestamp:", notificationTimestamp);
        console.log("Available applications:", applications.length);
      }
      
      // Process the ID if either:
      // 1. It hasn't been processed yet, OR
      // 2. We have a new notification timestamp, OR
      // 3. The job listing has changed
      const shouldProcess = 
        selectedCandidateId !== processedCandidateId || 
        (state && state.timestamp && state.timestamp !== notificationTimestamp) ||
        currentJobListingId !== applications[0]?.jobId;
      
      if (!shouldProcess) {
        return;
      }
      
      // Find the application
      const selectedApplicant = findApplicantById(selectedCandidateId);
      
      if (selectedApplicant) {
        // Auto-select this applicant
        setSelectedApplicant(selectedApplicant);
        
        if (process.env.NODE_ENV !== 'production') {
          console.log("Attempting to scroll to applicant:", selectedApplicant.name);
        }
        
        // Attempt to scroll to this element with retries
        const scrollToElement = (attempt = 0) => {
          if (attempt > 5) return; // Give up after 5 attempts
          
          // Find the ref by looking for all possible ID formats that might have been used for storage
          let appElement = null;
          
          // First try the selectedCandidateId directly
          if (applicationRefs.current[selectedCandidateId]) {
            appElement = applicationRefs.current[selectedCandidateId];
          } 
          // If that fails, try to find the right reference by checking all stored refs
          else if (selectedApplicant && selectedApplicant.applicantId && selectedApplicant.applicantId._id) {
            appElement = applicationRefs.current[selectedApplicant.applicantId._id];
          }
          
          if (process.env.NODE_ENV !== 'production') {
            console.log("Looking for element with candidate ID:", selectedCandidateId);
            console.log("Selected applicant object:", selectedApplicant);
            console.log("Available refs:", Object.keys(applicationRefs.current));
          }
          
          if (appElement) {
            if (process.env.NODE_ENV !== 'production') {
              console.log(`Scrolling to applicant element (attempt ${attempt})`);
            }
            
            // Scroll to the element
            appElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Mark this candidate ID as processed after a delay to ensure the highlight is visible
            setTimeout(() => {
              setProcessedCandidateId(selectedCandidateId);
            }, 3000); // Wait 3 seconds before marking as processed
          } else {
            if (process.env.NODE_ENV !== 'production') {
              console.log(`Ref not available, retrying (attempt ${attempt})`);
              console.log("Current refs:", Object.keys(applicationRefs.current));
            }
            
            // Retry after a delay
            setTimeout(() => scrollToElement(attempt + 1), 500);
          }
        };
        
        // Start the scroll attempt
        setTimeout(() => scrollToElement(), 300); // Slight delay to allow refs to be populated
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.log("Selected applicant not found in applications list");
        }
        // Even if we don't find the applicant, mark the ID as processed after a delay
        setTimeout(() => {
          setProcessedCandidateId(selectedCandidateId);
        }, 1000);
      }
    }
  }, [selectedCandidateId, applications, findApplicantById, processedCandidateId, currentJobListingId, notificationTimestamp, state]);
  
  // Reset selectedApplicant when applications change (different job listing)
  useEffect(() => {
    // Clear the selected applicant when applications array changes (different job listing loaded)
    if (applications && Array.isArray(applications)) {
      setSelectedApplicant(null);
    }
  }, [applications]);

  // Add ref to each application card
  const registerRef = useCallback((ref, app) => {
    if (!ref || !app) return;
    
    // Store the ref under multiple possible ID keys to ensure we can find it later
    if (app.applicantId && app.applicantId._id) {
      applicationRefs.current[app.applicantId._id] = ref;
    }
    
    if (app._id) {
      applicationRefs.current[app._id] = ref;
    }
    
    if (app.jobSeekerId) {
      applicationRefs.current[app.jobSeekerId] = ref;
    }
    
    if (process.env.NODE_ENV !== 'production') {
      console.log("Ref attached to:", app.name);
      console.log("Using IDs:", app.applicantId?._id, app._id, app.jobSeekerId);
    }
  }, []);

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
    
    // Set loading state
    setIsCreatingChat(true);
    
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
      
      // Make API request to create conversation
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
      
      if (!conversation || !conversation._id) {
        throw new Error("No conversation ID returned from server");
      }

      // Process conversation data
      const processedJobListing = convertMongoObject(jobListingObject);
      setSelectedJobListing(processedJobListing);
      setSelectedConversationId(conversation._id);
      
      // Get candidate info
      const candidateInfo = await getCandidateInfo(conversation);
      
      // Update states in sequence
      setSelectedCandidate(candidateInfo);
      setTitle(candidateInfo.name);
      
      // Finally change view mode after all data is prepared
      setTimeout(() => {
        setViewMode("messages");
        setIsCreatingChat(false);
      }, 100);
    } catch (error) {
      console.error("Error creating conversation:", error);
      alert("Failed to create chat. Please try again later.");
      setIsCreatingChat(false);
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

  return (
    <div className="mx-auto h-full flex flex-col">
      <div className={`relative w-full ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} rounded-lg border shadow-lg flex-grow flex flex-col overflow-hidden`}>
        <div className={`sticky top-0 z-10 shadow-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} p-6 flex justify-between items-center`}>
          <div className="flex items-center">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Applications
            </h2>
            <div className={`ml-4 px-3 py-1 rounded-full text-sm ${
              darkMode 
                ? 'bg-gray-800 text-gray-300' 
                : 'bg-white text-gray-700'
            } font-medium flex items-center shadow-sm`}>
              <span className="mr-1.5">{applications.length}</span>
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {applications.length === 1 ? 'applicant' : 'applicants'}
              </span>
            </div>
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}>
            {applications.length > 0 && 
              <div className="flex gap-2 items-center">
                <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-indigo-400' : 'bg-indigo-500'}`}></div>
                <span>Latest: {new Date(
                  Math.max(...applications.map(app => new Date(app.applicationDate || app.date)))
                ).toLocaleDateString()}</span>
              </div>
            }
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="flex justify-center items-center p-16 text-gray-500 flex-grow">
            <p className={`text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No recent applications.</p>
          </div>
        ) : (
          <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'} overflow-y-auto flex-grow`} ref={containerRef}>
            {applications.map((app) => {
              const applicantData = applicantsData[app._id];
              // Check by all possible IDs to ensure we catch the selected applicant
              const isSelected = 
                // Check if we have a selected applicant from manual click
                (selectedApplicant && 
                  // Check various ID matching possibilities
                  (selectedApplicant._id === app._id || 
                   selectedApplicant.jobSeekerId === app.jobSeekerId ||
                   (selectedApplicant.applicantId && 
                    app.applicantId && 
                    selectedApplicant.applicantId._id === app.applicantId._id)
                  )
                ) || 
                // Also check if this applicant's ID matches the selectedCandidateId prop
                (selectedCandidateId && 
                  (selectedCandidateId === app._id || 
                   selectedCandidateId === app.jobSeekerId || 
                   (app.applicantId && selectedCandidateId === app.applicantId._id)
                  )
                );

              if (process.env.NODE_ENV !== 'production' && isSelected) {
                console.log("Highlighting application:", app.name);
              }

              return (
                <div
                  key={app._id}
                  ref={el => {
                    // Register the ref for scrolling
                    registerRef(el, app);
                    
                    // Also attach to selectedCandidateRef for selection
                    if (selectedApplicant && 
                       (app._id === selectedApplicant._id || 
                        app.jobSeekerId === selectedApplicant.jobSeekerId)) {
                      selectedCandidateRef.current = el;
                    }
                  }}
                  className={`p-6 transition-colors duration-200 cursor-pointer relative ${
                    isSelected 
                      ? darkMode ? 'bg-indigo-900/30 border-l-4 border-indigo-500' : 'bg-indigo-50 border-l-4 border-indigo-500'
                      : darkMode ? 'hover:bg-indigo-900/20 hover:border-l-4 hover:border-indigo-500' : 'hover:bg-indigo-50 hover:border-l-4 hover:border-indigo-500'
                  }`}
                  onClick={() => handleApplicantClick(app)}
                >
                  {/* Create a full clickable area overlay */}
                  <div className="absolute inset-0" onClick={() => handleApplicantClick(app)}></div>
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 relative z-10">
                    {/* Profile Picture */}
                    <div className={`w-20 h-20 rounded-full overflow-hidden flex-shrink-0 ring-4 ${darkMode ? 'ring-gray-700' : 'ring-blue-50'} shadow-md`}>
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
                          <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-1`}>
                            {app.name}
                          </h3>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'} mb-2`}>
                            Applied for:{" "}
                            <span className={`font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                              {app.jobTitle}
                            </span>
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-400'} mb-3`}>
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
                      <div className="mt-3 flex flex-wrap gap-3 relative z-20" onClick={(e) => e.stopPropagation()}>
                        <a
                          href={app.cv}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} transition-colors flex items-center space-x-1`}
                          onClick={(e) => e.stopPropagation()}
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

                        {app.phone && (
                          <a
                            href={`tel:${app.phone}`}
                            className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} transition-colors flex items-center space-x-1`}
                            onClick={(e) => e.stopPropagation()}
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
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            <span>{app.phone}</span>
                          </a>
                        )}

                        {app.linkedinUrl && (
                          <a
                            href={app.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} transition-colors flex items-center space-x-1`}
                            onClick={(e) => e.stopPropagation()}
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
                            className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} transition-colors flex items-center space-x-1`}
                            onClick={(e) => e.stopPropagation()}
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
                      <div className="mt-4 flex flex-wrap gap-3 relative z-20" onClick={(e) => e.stopPropagation()}>
                        <button
                          className={`px-4 py-2.5 ${darkMode ? 'bg-stone-800 border-stone-700/20 hover:bg-stone-700' : 'bg-stone-800 border-stone-700/20 hover:bg-stone-700'} text-white text-sm font-medium rounded-md shadow-sm border transition-all duration-200 hover:shadow-md hover:translate-y-[-1px] focus:outline-none focus:ring-2 focus:ring-stone-500/30 focus:ring-offset-1 flex items-center space-x-1.5 ${isCreatingChat && app._id === selectedApplicant?._id ? 'opacity-75 cursor-not-allowed' : ''}`}
                          onClick={(e) => handleChatButtonClick(app, e)}
                          disabled={isCreatingChat && app._id === selectedApplicant?._id}
                        >
                          {isCreatingChat && app._id === selectedApplicant?._id ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span className="hidden sm:inline">Opening Chat...</span>
                              <span className="sm:hidden">Opening...</span>
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 001.33 0l1.713-3.293a.783.783 0 01.642-.413 41.102 41.102 0 003.55-.414c1.437-.231 2.43-1.49 2.43-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zM6.75 6a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 2.5a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z" clipRule="evenodd" />
                              </svg>
                              <span className="hidden sm:inline">Chat with Applicant</span>
                              <span className="sm:hidden">Chat</span>
                            </>
                          )}
                        </button>
                        <button
                          className={`px-4 py-2.5 ${darkMode ? 'bg-stone-100 border-stone-200 text-stone-800 hover:bg-stone-50' : 'bg-stone-100 border-stone-200 text-stone-800 hover:bg-stone-50'} text-sm font-medium rounded-md shadow-sm border transition-all duration-200 hover:shadow-md hover:translate-y-[-1px] focus:outline-none focus:ring-2 focus:ring-stone-300 focus:ring-offset-1 flex items-center space-x-1.5`}
                          onClick={(e) => trackApplicant(app, e)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                            <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          <span className="hidden sm:inline">Track Applicant</span>
                          <span className="sm:hidden">Track</span>
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

