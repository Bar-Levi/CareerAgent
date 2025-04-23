// /pages/RecruiterDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiPlusCircle, 
  FiMessageCircle, 
  FiUsers, 
  FiMoon, 
  FiSun, 
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiGlobe
} from "react-icons/fi";
import NavigationBar from "../../components/NavigationBar/NavigationBar";
import Botpress from "../../botpress/Botpress";
import Notification from "../../components/Notification";
import MetricsOverview from "../components/MetricsOverview";
import MyJobListings from "../components/MyJobListings";
import Applications from "../components/Applications";
import JobListingInput from "../components/JobListingInput";
import CandidateMessages from "../components/CandidateMessages";
import convertMongoObject from "../../utils/convertMongoObject";

const RecruiterDashboard = ({onlineUsers}) => {
  const location = useLocation();
  const state = location.state;
  const user = state?.user;

  // Core state
  const [jobListings, setJobListings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [totalHired, setTotalHired] = useState(state?.user?.totalHired || 0); // Separate state for totalHired
  const [metrics, setMetrics] = useState({
    activeListings: 0,
    totalApplications: 0,
  });
  const [notification, setNotification] = useState(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("messages"); // "messages" | "applications"
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("recruiterdashboard_darkmode") === "true" || false
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    localStorage.getItem("recruiterdashboard_sidebarCollapsed") === "true" || false
  );

  // Conversation states
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [selectedJobListing, setSelectedJobListing] = useState(convertMongoObject(null));
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [title, setTitle] = useState(null);
  
  // Mobile responsive state
  const [mobileView, setMobileView] = useState("listings"); // "listings" | "detail"

  // Add state for image preview modal
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImageSrc, setPreviewImageSrc] = useState("");
  const [previewImageAlt, setPreviewImageAlt] = useState("");

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("recruiterdashboard_darkmode", newMode.toString());
  };

  // Handle sidebar collapse toggle
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem("recruiterdashboard_sidebarCollapsed", newState.toString());
  };

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setMobileView("listings");
      }
    };
    
    window.addEventListener("resize", handleResize);
    handleResize();
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Apply theme class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
  }, [darkMode]);

  useEffect(() => {
    const stateAddition = localStorage.getItem("stateAddition");
    if (stateAddition) {
      try {
        const parsedAddition = JSON.parse(stateAddition);
        console.log("Parsed addition: ", parsedAddition);
        setViewMode("messages");
        setSelectedConversationId(parsedAddition.conversationId);
        setSelectedCandidate(parsedAddition.candidate);
        fetchApplications(); // Fetch applications again to ensure the latest data
        setSelectedJobListing(convertMongoObject(parsedAddition.jobListing));
        setTitle(parsedAddition.title);
        setViewMode(parsedAddition.viewMode);
        
        // On mobile, switch to detail view when data is loaded
        if (window.innerWidth < 768) {
          setMobileView("detail");
        }
      } catch (error) {
        console.error("Error parsing stateAddition:", error);
      } finally {
        localStorage.removeItem("stateAddition");
      }
    }
  }, [state.refreshToken]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Function to update totalHired count
  const updateTotalHired = () => {
    // Update user.totalHired in location.state
    if (state && state.user) {
      // Initialize totalHired if it doesn't exist
      if (state.user.totalHired === undefined) {
        state.user.totalHired = 0;
      }
      
      // Increment totalHired
      state.user.totalHired += 1;
      
      // Update totalHired state
      setTotalHired(state.user.totalHired);
    }
  };

  // Update metrics when jobListings change
  useEffect(() => {
    // Update activeListings count based on current job listings
    setMetrics(prevMetrics => ({
      ...prevMetrics,
      activeListings: jobListings.filter(job => job.status === "Active").length || 0,
    }));
  }, [jobListings]);

  // Update metrics when applications change
  useEffect(() => {
    // Update totalApplications count based on current applications
    setMetrics(prevMetrics => ({
      ...prevMetrics,
      totalApplications: applications.length || 0,
    }));
  }, [applications]);

  // Fetch functions
  const fetchJobListings = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/joblistings/recruiter/${user._id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 404) {
          console.error(data.message);
          return;
        }
        throw new Error("Failed to fetch recruiter's job listings.");
      }
      const fetchedListings = data.jobListings;
      setJobListings(fetchedListings);
      
      // Update active listings count in metrics
      const activeCount = fetchedListings.filter(job => job.status === "Active").length || 0;
      setMetrics(prevMetrics => ({
        ...prevMetrics,
        activeListings: activeCount,
      }));
    } catch (error) {
      console.error("Error fetching job listings:", error.message);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/applicants/getRecruiterApplicants/${user._id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 404) {
          console.error(data.message);
          return;
        }
        throw new Error("Failed to fetch recruiter's job listings.");
      }
      
      const fetchedApplications = data.applications;
      setApplications(fetchedApplications);
      
      // Update totalApplications count in metrics
      setMetrics(prevMetrics => ({
        ...prevMetrics,
        totalApplications: fetchedApplications.length || 0,
      }));
    } catch (error) {
      console.error("Error fetching recent applications:", error.message);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/joblistings/metrics/${user._id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        const errorMessage = `Error ${response.status}: ${response.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
      const data = await response.json();
      const dashboardMetrics = data.metrics;
      
      // Update metrics but don't change totalHired
      setMetrics(dashboardMetrics);
      
      // Separately update totalHired from the user object in state
      if (state?.user?.totalHired !== undefined) {
        setTotalHired(state.user.totalHired);
      }
    } catch (error) {
      console.error("Failed to fetch metrics:", error.message);
      showNotification("error", "Failed to fetch metrics. Please try again later.");
    }
  };

  useEffect(() => {
    fetchJobListings();
    fetchApplications();
    fetchMetrics();
  }, []);

  const handlePostSuccess = () => {
    showNotification("success", "Job listing posted successfully!");
    
    // No need to manually update metrics here as it will be updated via the useEffect
    // that watches jobListings array
    
    fetchJobListings();
  };

  // Handle job or candidate selection on mobile
  const handleMobileSelection = () => {
    if (window.innerWidth < 768) {
      setMobileView("detail");
    }
  };
  
  // Handle back button on mobile
  const handleMobileBack = () => {
    setMobileView("listings");
  };

  // Handle job listing selection - automatically switch to applications view
  const handleJobListingSelect = (listing) => {
    setSelectedJobListing(listing);
    // Auto-switch to applications view when a job listing is selected
    setViewMode("applications");
    // On mobile, also switch to detail view
    if (window.innerWidth < 768) {
      setMobileView("detail");
    }
  };

  // Function to open image preview
  const openImagePreview = (src, alt) => {
    setPreviewImageSrc(src);
    setPreviewImageAlt(alt);
    setShowImagePreview(true);
  };

  // Memorized content for right panel based on view mode
  const rightPanelContent = useMemo(() => {
    if (viewMode === "messages") {
      return (
        <CandidateMessages
          key={selectedJobListing?._id ?? "none"}
          user={user}
          recruiterId={user._id}
          jobListing={selectedJobListing}
          selectedConversationId={selectedConversationId}
          setSelectedConversationId={setSelectedConversationId}
          selectedCandidate={selectedCandidate}
          title={title}
          setTitle={setTitle}
          setSelectedCandidate={setSelectedCandidate}
          onlineUsers={onlineUsers}
          darkMode={darkMode}
        />
      );
    } else {
      return (
        <Applications
          applications={applications.filter(app => app.jobId._id === selectedJobListing?._id)}
          setSelectedConversationId={setSelectedConversationId}
          setSelectedJobListing={setSelectedJobListing}
          setSelectedCandidate={setSelectedCandidate}
          setTitle={setTitle}
          setViewMode={setViewMode}
          selectedCandidateId={selectedCandidate?.senderId}
          user={user}
          updateTotalHired={updateTotalHired}
          darkMode={darkMode}
        />
      );
    }
  }, [viewMode, selectedJobListing, selectedConversationId, selectedCandidate, applications, onlineUsers, title, user, darkMode]);

  return (
    <div 
      key={state.refreshToken} 
      className={`h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} animate-fade-in overflow-hidden`}
    >
      <Botpress />
      <NavigationBar userType={state?.user?.role || state?.role}/>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Notification
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with Metrics and Controls */}
      <motion.div 
        className={`flex flex-col md:flex-row items-center justify-between p-4 md:p-6 space-y-4 md:space-y-0 md:space-x-6 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } rounded-lg mx-4 mt-4 shadow-lg backdrop-blur-md bg-opacity-80`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsJobModalOpen(true)}
            className={`px-4 py-2 ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-500 hover:bg-indigo-600'} 
              text-white rounded-full shadow-lg flex items-center space-x-2 transition-all duration-300 hover:scale-105`}
          >
            <FiPlusCircle className="text-lg" />
            <span>Post New Job</span>
          </button>
          
          <div className="hidden md:flex space-x-2">
            <button
              onClick={() => setViewMode("messages")}
              className={`px-3 py-2 rounded-full flex items-center space-x-1 transition-all duration-200 ${
                viewMode === "messages" 
                  ? (darkMode ? 'bg-indigo-700 text-white' : 'bg-indigo-100 text-indigo-700') 
                  : (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100')
              }`}
            >
              <FiMessageCircle />
              <span>Messages</span>
            </button>
            
            <button
              onClick={() => setViewMode("applications")}
              className={`px-3 py-2 rounded-full flex items-center space-x-1 transition-all duration-200 ${
                viewMode === "applications" 
                  ? (darkMode ? 'bg-indigo-700 text-white' : 'bg-indigo-100 text-indigo-700') 
                  : (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100')
              }`}
            >
              <FiUsers />
              <span>Applications</span>
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full transition-all duration-300 ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            }`}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <FiSun className="text-yellow-400" /> : <FiMoon className="text-gray-700" />}
          </button>
          
          <button
            onClick={toggleSidebar}
            className={`hidden md:block p-2 rounded-full transition-all duration-300 ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        </div>
      </motion.div>

      {/* Mobile Tabs (visible only on small screens) */}
      <div className="md:hidden flex justify-center mt-2 px-4">
        <div className={`flex justify-between w-full p-1 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <button
            onClick={() => setViewMode("messages")}
            className={`flex-1 py-2 rounded-full flex items-center justify-center space-x-1 ${
              viewMode === "messages" 
                ? (darkMode ? 'bg-indigo-700 text-white' : 'bg-indigo-100 text-indigo-700') 
                : ''
            }`}
          >
            <FiMessageCircle />
            <span>Messages</span>
          </button>
          
          <button
            onClick={() => setViewMode("applications")}
            className={`flex-1 py-2 rounded-full flex items-center justify-center space-x-1 ${
              viewMode === "applications" 
                ? (darkMode ? 'bg-indigo-700 text-white' : 'bg-indigo-100 text-indigo-700') 
                : ''
            }`}
          >
            <FiUsers />
            <span>Applications</span>
          </button>
        </div>
      </div>

      {/* Profile Information */}
      {(state?.user?.profilePic || state?.user?.companyLogo || state?.user?.companyName || state?.user?.companyWebsite) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-4 mt-4"
        >
          <div className={`${darkMode ? 'bg-gray-800/80' : 'bg-white/90'} rounded-xl shadow-lg p-4 backdrop-blur-md`}>
            {/* Mobile (stacked) view */}
            <div className="flex flex-col lg:hidden space-y-4">
              {/* Profile Information */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Profile Section */}
                {state?.user?.profilePic && (
                  <div className="flex items-center gap-2 border-r pr-6 mr-2 border-gray-200 dark:border-gray-700 h-8">
                    <div 
                      className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-indigo-500/50 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 cursor-pointer hover:ring-indigo-500 transition-all"
                      onClick={() => openImagePreview(state.user.profilePic, "Profile")}
                    >
                      <img 
                        src={state.user.profilePic} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                      {state?.user?.fullName || "Profile"}
                    </span>
                  </div>
                )}

                {/* Company Logo */}
                {state?.user?.companyLogo && (
                  <div className="flex items-center gap-2 border-r pr-6 mr-2 border-gray-200 dark:border-gray-700 h-8">
                    <div 
                      className="w-8 h-8 rounded-full overflow-hidden bg-white p-1 shadow-sm cursor-pointer hover:shadow-md transition-all"
                      onClick={() => openImagePreview(state.user.companyLogo, "Company Logo")}
                    >
                      <img 
                        src={state.user.companyLogo} 
                        alt="Company" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Company Name */}
                {state?.user?.companyName && (
                  <div className="flex items-center gap-2 border-r pr-6 mr-2 border-gray-200 dark:border-gray-700 h-8">
                    <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {state.user.companyName}
                    </div>
                  </div>
                )}
                
                {/* Company Website */}
                {state?.user?.companyWebsite && (
                  <div className="flex items-center gap-2 h-8">
                    <a 
                      href={state.user.companyWebsite.startsWith('http') ? state.user.companyWebsite : `https://${state.user.companyWebsite}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={`text-sm flex items-center gap-1 ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'} transition-colors`}
                    >
                      <FiGlobe size={14} />
                      <span className="truncate">Visit Website</span>
                    </a>
                  </div>
                )}
              </div>
              
              {/* Mobile metrics - full width */}
              <div className="w-full overflow-x-auto pb-2">
                <div className="min-w-[400px]">
                  <MetricsOverview metrics={metrics} totalHired={totalHired} darkMode={darkMode} />
                </div>
              </div>
            </div>

            {/* Desktop (side-by-side) view */}
            <div className="hidden lg:flex lg:flex-row items-center justify-between gap-4">
              {/* Profile Information */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Profile Section */}
                {state?.user?.profilePic && (
                  <div className="flex items-center gap-2 border-r pr-6 mr-2 border-gray-200 dark:border-gray-700 h-8">
                    <div 
                      className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-indigo-500/50 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 cursor-pointer hover:ring-indigo-500 transition-all"
                      onClick={() => openImagePreview(state.user.profilePic, "Profile")}
                    >
                      <img 
                        src={state.user.profilePic} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                      {state?.user?.fullName || "Profile"}
                    </span>
                  </div>
                )}

                {/* Company Logo */}
                {state?.user?.companyLogo && (
                  <div className="flex items-center gap-2 border-r pr-6 mr-2 border-gray-200 dark:border-gray-700 h-8">
                    <div 
                      className="w-8 h-8 rounded-full overflow-hidden bg-white p-1 shadow-sm cursor-pointer hover:shadow-md transition-all"
                      onClick={() => openImagePreview(state.user.companyLogo, "Company Logo")}
                    >
                      <img 
                        src={state.user.companyLogo} 
                        alt="Company" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Company Name */}
                {state?.user?.companyName && (
                  <div className="flex items-center gap-2 border-r pr-6 mr-2 border-gray-200 dark:border-gray-700 h-8">
                    <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {state.user.companyName}
                    </div>
                  </div>
                )}
                
                {/* Company Website */}
                {state?.user?.companyWebsite && (
                  <div className="flex items-center gap-2 h-8">
                    <a 
                      href={state.user.companyWebsite.startsWith('http') ? state.user.companyWebsite : `https://${state.user.companyWebsite}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={`text-sm flex items-center gap-1 ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'} transition-colors`}
                    >
                      <FiGlobe size={14} />
                      <span className="truncate">Visit Website</span>
                    </a>
                  </div>
                )}
              </div>
              
              {/* Desktop metrics - shifted to the left */}
              <div className="w-auto">
                <MetricsOverview metrics={metrics} totalHired={totalHired} darkMode={darkMode} />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Image Preview Modal */}
      <AnimatePresence>
        {showImagePreview && (
          <motion.div 
            className="fixed inset-0 flex items-center justify-center bg-black/70 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowImagePreview(false)}
          >
            <motion.div 
              className="relative max-w-2xl max-h-[80vh] rounded-lg overflow-hidden"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <img 
                src={previewImageSrc} 
                alt={previewImageAlt} 
                className="max-w-full max-h-[80vh] object-contain bg-white/10 backdrop-blur-sm"
              />
              <button
                className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                onClick={() => setShowImagePreview(false)}
              >
                <FiX size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Dashboard – Two-Pane Layout */}
      <div className="flex flex-1 p-4 space-x-0 md:space-x-4 overflow-hidden">
        {/* Mobile View Controller */}
        {window.innerWidth < 768 && (
          <AnimatePresence mode="wait">
            {mobileView === "listings" ? (
              <motion.div
                key="listings"
                className="w-full"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div 
                  className={`h-full ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}
                >
                  <MyJobListings
                    showNotification={showNotification}
                    jobListings={jobListings}
                    setJobListings={setJobListings}
                    selectedJobListing={selectedJobListing}
                    setSelectedJobListing={handleJobListingSelect}
                    setMetrics={setMetrics}
                    setSelectedConversationId={setSelectedConversationId}
                    setSelectedCandidate={setSelectedCandidate}
                    setViewMode={setViewMode}
                    darkMode={darkMode}
                    applications={applications}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="detail"
                className="w-full"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div 
                  className={`h-full ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}
                >
                  {rightPanelContent}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Desktop View Controller */}
        {window.innerWidth >= 768 && (
          <>
            {/* Left Pane: My Job Listings */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={`${sidebarCollapsed ? 'w-64' : 'md:w-2/5'} hidden md:block ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-lg rounded-lg overflow-hidden transition-all duration-300`}
            >
              <MyJobListings
                showNotification={showNotification}
                jobListings={jobListings}
                setJobListings={setJobListings}
                selectedJobListing={selectedJobListing}
                setSelectedJobListing={handleJobListingSelect}
                setMetrics={setMetrics}
                setSelectedConversationId={setSelectedConversationId}
                setSelectedCandidate={setSelectedCandidate}
                setViewMode={setViewMode}
                darkMode={darkMode}
                applications={applications}
                collapsed={sidebarCollapsed}
              />
            </motion.div>

            {/* Right Pane: Candidate Messages/Applications */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className={`${sidebarCollapsed ? 'flex-1' : 'md:w-3/5'} hidden md:block ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-lg rounded-lg overflow-hidden transition-all duration-300`}
            >
              {rightPanelContent}
            </motion.div>
          </>
        )}
      </div>

      {/* Job Listing Modal */}
      <AnimatePresence>
        {isJobModalOpen && (
          <motion.div 
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl relative max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto`}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <button
                onClick={() => setIsJobModalOpen(false)}
                className={`absolute top-4 right-4 p-2 rounded-full ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                } z-10 transition-colors`}
                aria-label="Close modal"
              >
                <FiX className={darkMode ? 'text-white' : 'text-gray-800'} />
              </button>
              
              <JobListingInput
                user={user}
                onPostSuccess={() => {
                  handlePostSuccess();
                  setIsJobModalOpen(false);
                }}
                jobListings={jobListings}
                setJobListings={setJobListings}
                darkMode={darkMode}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecruiterDashboard;