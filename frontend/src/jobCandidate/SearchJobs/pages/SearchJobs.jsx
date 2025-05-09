import React, { useState, useEffect, useRef } from "react";
import JobListingCardsList from "../components/JobListingCardsList";
import SearchFilters from "../components/SearchFilters";
import NavigationBar from "../../../components/NavigationBar/NavigationBar";
import Modal from "../components/Modal";
import { useLocation, useNavigate } from "react-router-dom";
import Notification from "../../../components/Notification";
import Botpress from "../../../botpress/Botpress";
import { extractTextFromPDF } from "../../../utils/pdfUtils";
import convertMongoObject from "../../../utils/convertMongoObject";
import JobListingDescription from "../components/JobListingDescription";
import MessagingBar from "../components/MessagingBar";
import { FaFilter, FaSort, FaChevronDown, FaChevronUp, FaTimes, FaInfoCircle } from "react-icons/fa";

const SearchJobs = ({onlineUsers}) => {
  // Get state from location and initialize our user state
  const { state } = useLocation();
  const [user, setUser] = useState(state.user);
  const navigate = useNavigate();
  const locationObj = useLocation(); // renamed to avoid conflicts
  const [notification, setNotification] = useState(null);
  const [jobListingsCount, setJobListingsCount] = useState(0);
  const [educationListedOptions, setEducationListedOptions] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);

  // Initialize conversation and job listing states from notification (if any)
  const [selectedJob, setSelectedJob] = useState(null);

  const [renderingConversationKey, setRenderingConversationKey] = useState(0);
  const [renderingConversationData, setRenderingConversationData] = useState({
    convId: null,
    secondParticipantProfilePic: null,
    participantName: null,
    jobListingRole: null,
  });

  const descriptionRef = useRef(null);
  const sortingOptionsRef = useRef(null);

  // Update user state handler - add this new function
  const updateUserState = (updatedUser) => {
    setUser(updatedUser);
  };

  useEffect(() => {
    const stateAddition = localStorage.getItem("stateAddition");
    if (stateAddition) {
      try {
        const parsedAddition = JSON.parse(stateAddition);
        setRenderingConversationData({
          convId: parsedAddition.conversationId,
          secondParticipantProfilePic: parsedAddition.secondParticipantProfilePic,
          participantName: parsedAddition.title,
          jobListingRole: parsedAddition.jobListing.jobRole,
        });
        setRenderingConversationKey((prev) => prev + 1);

        setSelectedJob(convertMongoObject(parsedAddition.jobListing));
      } catch (error) {
        console.error("Error parsing stateAddition:", error);
      } finally {
        localStorage.removeItem("stateAddition");
      }
    } else {
      console.log("No state addition found.");
    }
  }, [state.refreshToken]);

  // Update user state when location state changes
  useEffect(() => {
    if (state && state.user) {
      setUser(state.user);
    }
  }, [state]);

  // Fetch saved job listings when component mounts
  useEffect(() => {
    const fetchSavedJobListings = async () => {
      if (user && user._id) {
        try {
          // Add timestamp to avoid caching
          const timestamp = new Date().getTime();
          const response = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}/api/jobseeker/${user._id}/saved?t=${timestamp}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                // Add cache control headers
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            // Force a complete state update with fresh data
            const updatedUser = {
              ...user,
              savedJobListings: data.savedJobListings
            };
            setUser(updatedUser);
            
            // Also update state.user if it exists to ensure consistency
            if (state && state.user) {
              state.user.savedJobListings = data.savedJobListings;
            }
          } else {
            console.error("Failed to fetch saved job listings");
          }
        } catch (error) {
          console.error("Error fetching saved job listings:", error);
        }
      }
    };

    fetchSavedJobListings();
    
  }, [user?._id, state?.refreshToken]); // Run when user ID changes or page refreshes

  // Function to show notifications
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const [filters, setFilters] = useState({
    jobRole: "",
    company: "",
    location: "",
    experienceLevel: "",
    companySize: "",
    jobType: "",
    remote: "",
    skills: "",
    languages: "",
    securityClearance: "",
    education: "",
    workExperience: "",
  });

  const [sortingMethod, setSortingMethod] = useState("newest");
  const [showModal, setShowModal] = useState(false);

  // Open the modal if no CV is uploaded
  useEffect(() => {
    if (!user.cv || user.cv === "") {
      setShowModal(true);   
      setSortingMethod("newest");  
    }
  }, [user.cv]);

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      jobRole: "",
      company: "",
      location: "",
      experienceLevel: "",
      companySize: "",
      jobType: "",
      remote: "",
      skills: "",
      languages: "",
      securityClearance: "",
      education: "",
      workExperience: "",
    });
  };

  const handleSelectJob = (job) => {
    setSelectedJob(job);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleSortChange = (e) => {
    setSortingMethod(e.target.value);
    setShowSortOptions(false);
  };

  // Count active filters
  const activeFiltersCount = Object.values(filters).filter(val => val !== "").length;

  // Handle click outside for sorting dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortingOptionsRef.current && !sortingOptionsRef.current.contains(event.target)) {
        setShowSortOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // This function is used to handle CV upload.
  // The email is passed via query string.
  // After success, it updates the user state with new cv and analyzed_cv_content.
  const handleCVUpload = async (file) => {
    try {
      // Get token from state or localStorage
      const token = state.token || localStorage.getItem("token");

      // Process the CV file: extract text and send it to our AI endpoint
      const processCV = async (cvFile) => {
        try {
          const cvContent = await extractTextFromPDF(cvFile);
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/ai/generateJsonFromCV`, {
            method: "POST",
            body: JSON.stringify({ prompt: cvContent }),
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
          });
          if (!response.ok) {
            throw new Error("Failed to generate AI CV.");
          }
          const jsonResponse = await response.json();
          const jsonRaw = jsonResponse.response;
          const match = jsonRaw.match(/```json\n([\s\S]+?)\n```/);
          if (!match) {
            throw new Error("Invalid JSON format in response.");
          }
          const jsonString = match[1];
          const prettyJson = JSON.parse(jsonString);
          return prettyJson;
        } catch (error) {
          console.error("Error processing CV:", error.message);
          throw error;
        }
      };

      // Process file to get analyzed content
      const analyzedContent = await processCV(file);

      // Build form data for upload
      const formData = new FormData();
      formData.append("cv", file);
      formData.append("analyzed_cv_content", JSON.stringify(analyzedContent));

      // Call our update endpoint
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/personal/jobseeker/cv/update?email=${encodeURIComponent(user.email)}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error("Failed to upload CV.");
      }
      const data = await response.json();

      // Build our updated user object with new cv and analyzed_cv_content
      const updatedUser = {
        ...user,
        cv: data.cv,
        analyzed_cv_content: analyzedContent
      };
      // Build new state including the full user object
      const newState = {
        user: updatedUser,
        isVerified: user.isVerified,
        refreshToken: 0
      };
      // Update our local user state and navigate to the same page with new state
      setUser(updatedUser);
      navigate(locationObj.pathname, { state: newState });
      showNotification("success", "CV uploaded successfully!");
      setShowModal(false);
    } catch (error) {
      console.error("Error uploading CV:", error);
      showNotification("error", "Failed to upload CV. Please try again.");
    }
  };

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (descriptionRef.current && !descriptionRef.current.contains(event.target)) {
        // Check if the click was on a job listing card
        const isJobCard = event.target.closest('.job-listing-card');
        if (!isJobCard) {
          setSelectedJob(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div key={state.refreshToken} className="bg-gray-50 min-h-screen flex flex-col">
      <NavigationBar userType={state?.user?.role}/>
      <Botpress />
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="flex-grow lg:grid lg:grid-cols-4 gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full relative">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden sticky top-0 z-20 flex justify-between items-center mb-4 bg-white rounded-xl shadow-sm p-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-gray-700 font-medium"
          >
            <FaFilter className={activeFiltersCount > 0 ? "text-blue-500" : ""} />
            Filters
            {activeFiltersCount > 0 && (
              <span className="bg-blue-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                {activeFiltersCount}
              </span>
            )}
          </button>
          
          {/* Mobile Sorting Dropdown */}
          <div className="relative" ref={sortingOptionsRef}>
            <button 
              onClick={() => setShowSortOptions(!showSortOptions)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-gray-700 font-medium"
            >
              <FaSort />
              Sort
              {showSortOptions ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
            </button>
            
            {showSortOptions && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg p-2 z-20 w-48 border border-gray-100">
                <div className="flex flex-col">
                  <label className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input 
                      type="radio" 
                      name="sort-mobile" 
                      value="relevance" 
                      checked={sortingMethod === "relevance"}
                      onChange={handleSortChange}
                      disabled={!user.analyzed_cv_content}
                      className="mr-2" 
                    />
                    Most Relevant
                  </label>
                  <label className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input 
                      type="radio" 
                      name="sort-mobile" 
                      value="saved" 
                      checked={sortingMethod === "saved"}
                      onChange={handleSortChange}
                      className="mr-2" 
                    />
                    Saved Jobs
                  </label>
                  <label className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input 
                      type="radio" 
                      name="sort-mobile" 
                      value="newest" 
                      checked={sortingMethod === "newest"}
                      onChange={handleSortChange}
                      className="mr-2" 
                    />
                    Newest First
                  </label>
                  <label className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input 
                      type="radio" 
                      name="sort-mobile" 
                      value="oldest" 
                      checked={sortingMethod === "oldest"}
                      onChange={handleSortChange}
                      className="mr-2" 
                    />
                    Oldest First
                  </label>
                </div>
              </div>
            )}
          </div>
          
          <div className="rounded-lg bg-green-100 text-green-800 text-sm font-semibold py-2 px-3">
            {jobListingsCount} jobs
          </div>
        </div>

        {/* Filters - Left Sidebar */}
        <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden'} lg:block fixed lg:sticky top-0 lg:top-6 left-0 right-0 z-30 lg:z-0 h-screen lg:h-auto overflow-auto lg:overflow-visible bg-white lg:bg-transparent p-4 lg:p-0`}>
          <div className="flex justify-between items-center mb-4 lg:mb-2">
            <h2 className="text-xl font-bold text-gray-800">Filters</h2>
            <button 
              onClick={() => setShowFilters(false)} 
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>
          <SearchFilters
            filters={filters}
            setFilters={handleFilterChange}
            clearFilters={handleClearFilters}
            educationListedOptions={educationListedOptions}
          />
        </div>

        {/* Central Area - Job Listings */}
        <div className="lg:col-span-2 h-full z-10">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="sticky top-0 z-20">
              <MessagingBar
                user={user}
                onlineUsers={onlineUsers}
                renderingConversationData={renderingConversationData}
                renderingConversationKey={renderingConversationKey}
              />

              {/* Desktop Header with sorting */}
              <div className="hidden lg:flex items-center justify-between p-4 bg-white border-b">
                <h1 className="text-xl font-bold text-gray-800">Job Listings</h1>
                
                <div className="flex items-center gap-4">
                  {/* Result count */}
                  <span className="py-1.5 px-3 bg-green-100 text-green-800 text-sm font-semibold rounded-lg">
                    {jobListingsCount} results
                  </span>
                  
                  {/* Sorting dropdown */}
                  <div className="relative" ref={sortingOptionsRef}>
                    <select
                      value={sortingMethod}
                      onChange={handleSortChange}
                      className="appearance-none bg-gray-100 text-gray-700 py-2 pl-4 pr-8 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                    >
                      <option disabled={!user.analyzed_cv_content} value="relevance">
                        Most Relevant First
                      </option>
                      <option value="saved">Saved Jobs</option>
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <FaChevronDown size={12} />
                    </div>
                  </div>
                  
                  {/* CV info button */}
                  {user.analyzed_cv_content && (
                    <div className="relative group">
                      <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">
                        <FaInfoCircle />
                      </button>
                      <div className="absolute right-0 top-full mt-2 hidden group-hover:block bg-white text-gray-700 text-sm rounded-lg shadow-xl p-4 w-72 border border-gray-200 z-30">
                        <p className="text-lg font-bold mb-3 border-b pb-2">Your CV Profile</p>
                        <ul className="list-none space-y-3">
                          {/* Job Roles */}
                          <li>
                            <strong className="block text-blue-600 text-sm">Job Roles:</strong>
                            <span className="text-sm">
                              {Array.isArray(user.analyzed_cv_content.job_role) &&
                              user.analyzed_cv_content.job_role.length > 0
                                ? user.analyzed_cv_content.job_role.join(", ")
                                : "None"}
                            </span>
                          </li>
                          
                          {/* Security Clearance */}
                          <li>
                            <strong className="block text-blue-600 text-sm">Security Clearance:</strong>
                            <span className="text-sm">
                              {user.analyzed_cv_content.security_clearance || "None"}
                            </span>
                          </li>
                          
                          {/* Education */}
                          <li>
                            <strong className="block text-blue-600 text-sm">Education:</strong>
                            {Array.isArray(user.analyzed_cv_content.education) &&
                            user.analyzed_cv_content.education.length > 0 ? (
                              user.analyzed_cv_content.education.map((edu, index) => (
                                <span key={index} className="block text-sm">
                                  {edu.degree} from {edu.institution}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm">None</span>
                            )}
                          </li>
                          
                          {/* Skills */}
                          <li>
                            <strong className="block text-blue-600 text-sm">Skills:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Array.isArray(user.analyzed_cv_content.skills) &&
                              user.analyzed_cv_content.skills.length > 0
                                ? user.analyzed_cv_content.skills.slice(0, 10).map((skill, index) => (
                                    <span key={index} className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                                      {skill}
                                    </span>
                                  ))
                                : <span className="text-sm">None</span>}
                              {user.analyzed_cv_content.skills?.length > 10 && (
                                <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                                  +{user.analyzed_cv_content.skills.length - 10} more
                                </span>
                              )}
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Job listings */}
            <JobListingCardsList
              filters={filters}
              onJobSelect={setSelectedJob}
              user={user}
              setUser={updateUserState}
              setShowModal={setShowModal}
              showNotification={showNotification}
              setJobListingsCount={setJobListingsCount}
              sortingMethod={sortingMethod}
              setEducationListedOptions={setEducationListedOptions}
              setRenderingConversationKey={setRenderingConversationKey}
              setRenderingConversationData={setRenderingConversationData}
            />
          </div>
        </div>

        {/* Right Area - Job Description */}
        <div className="lg:col-span-1 hidden lg:block">
          <div className="sticky top-6 bg-white rounded-xl shadow-sm p-0 overflow-hidden">
            <div ref={descriptionRef} className="max-h-[calc(100vh-8rem)] overflow-auto">
              {selectedJob ? (
                <JobListingDescription jobListing={selectedJob} />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 h-64 text-center">
                  <div className="bg-gray-50 rounded-full p-6 mb-4">
                    <FaInfoCircle className="text-3xl text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">
                    Select a job to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Job Description Modal */}
      {selectedJob && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white rounded-t-xl w-full max-h-[80vh] overflow-auto animate-slide-up">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
              <h3 className="font-bold text-lg">Job Details</h3>
              <button 
                onClick={() => setSelectedJob(null)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-4">
              <JobListingDescription jobListing={selectedJob} />
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <Modal
          title="Upload Your CV"
          message="To enjoy a better experience, please upload your CV."
          onClose={handleModalClose}
          onConfirm={handleCVUpload}
          confirmText="Upload CV"
          showNotification={showNotification}
        />
      )}
    </div>
  );
};

export default SearchJobs;
