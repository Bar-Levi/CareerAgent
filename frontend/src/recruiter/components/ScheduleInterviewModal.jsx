import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ScheduleInterviewModal = ({
  isOpen,
  onClose,
  applicant,
  setApplicants,
  jobListingId,
  recruiter,
  refetchApplicants,
  darkMode = false,
  onSuccess
}) => {
  const [scheduledTime, setScheduledTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [calendarUrl, setCalendarUrl] = useState("");
  const [showCalendarBtn, setShowCalendarBtn] = useState(false);
  const [accentColor, setAccentColor] = useState("#4f46e5");
  
  
  useEffect(() => {
    const colorOptions = [
      { primary: "#4f46e5", secondary: "#818cf8" }, // Indigo
      { primary: "#0ea5e9", secondary: "#38bdf8" }, // Sky
      { primary: "#10b981", secondary: "#34d399" }, // Emerald
      { primary: "#8b5cf6", secondary: "#a78bfa" }, // Violet
      { primary: "#ec4899", secondary: "#f472b6" }, // Pink
    ];
    
    // Select a color based on some property of the recruiter or applicant
    const nameSum = (recruiter?.fullName || "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorIndex = nameSum % colorOptions.length;
    setAccentColor(colorOptions[colorIndex].primary);
  }, [recruiter]);

  if (!isOpen) return null;

  const formatToGoogleDate = (date) => {
    return date.toISOString().replace(/[-:]|\.\d{3}/g, "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Ensure we have the complete job data for emails
    const jobInfo = {
      jobRole: applicant.jobTitle || "Position",
      company: applicant.jobId?.company || recruiter?.companyName || "Company",
      location: applicant.jobId?.location || "Remote"
    };

    const interviewData = {
      applicantId: applicant._id,
      participants: [
        {
          userId: applicant.jobSeekerId,
          name: applicant.name,
          profilePic: applicant.profilePic,
          role: "JobSeeker",
        },
        {
          userId: recruiter._id,
          name: recruiter.fullName,
          profilePic: recruiter.profilePic,
          role: recruiter.role,
        },
      ],
      jobListing: jobListingId,
      scheduledTime,
      meetingLink,
      status: "Scheduled",
      // Include job details for email templates
      jobDetails: jobInfo
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/interviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(interviewData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to schedule the interview."
        );
      }
      
      // Create Google Calendar Link
      const startTime = new Date(scheduledTime);
      const endTime = new Date(startTime.getTime() + 60 * 30 * 1000); // 1/2 hour

      const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Interview with ${applicant.name} - ${jobInfo.jobRole} at ${jobInfo.company}`)}&dates=${formatToGoogleDate(startTime)}/${formatToGoogleDate(endTime)}&details=${encodeURIComponent(`Meeting Link: ${meetingLink || "TBD"}`)}&location=Online`;
      setCalendarUrl(googleUrl);
      setShowCalendarBtn(true);
      
      if (setApplicants) {
        setApplicants((applicants) => {
          const updatedApplicant = applicants.find(
            (app) => app._id === applicant._id
          );
          if (updatedApplicant) {
            updatedApplicant.status = "Interview Scheduled";
          }
          return [...applicants];
        });
      }
      
      // Refetch applicants to update the list
      if (refetchApplicants) {
        await refetchApplicants();
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCalendar = (e) => {
    e.preventDefault(); // Prevent any form submission
    e.stopPropagation(); // Stop event propagation
    if (calendarUrl) {
      window.open(calendarUrl, "_blank");
    }
  };
  
  // Date formatter for showing human-readable date preview
  const formatDatePreview = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay with backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Modal container - centered on all devices */}
          <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ 
                duration: 0.3, 
                ease: [0.22, 1, 0.36, 1],
                staggerChildren: 0.05
              }}
              className={`w-full max-w-lg bg-opacity-95 rounded-3xl overflow-hidden ${
                darkMode 
                  ? 'bg-gray-800 text-white border border-gray-700' 
                  : 'bg-white border border-gray-200'
              }`}
              style={{
                boxShadow: darkMode 
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 0, 0, 0.3)' 
                  : '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 30px rgba(0, 0, 0, 0.1)',
                backgroundImage: darkMode
                  ? `radial-gradient(circle at top right, rgba(${parseInt(accentColor.slice(1, 3), 16)}, ${parseInt(accentColor.slice(3, 5), 16)}, ${parseInt(accentColor.slice(5, 7), 16)}, 0.1), transparent 40%)`
                  : `radial-gradient(circle at top right, rgba(${parseInt(accentColor.slice(1, 3), 16)}, ${parseInt(accentColor.slice(3, 5), 16)}, ${parseInt(accentColor.slice(5, 7), 16)}, 0.05), transparent 40%)`
              }}
            >
              {/* 3D element overlay (decorative) */}
              <div className="absolute right-0 top-0 h-32 w-32 overflow-hidden">
                <div 
                  className="absolute right-0 top-0 h-64 w-64 rounded-full opacity-20 -mt-32 -mr-32 transform rotate-45"
                  style={{ 
                    background: `linear-gradient(45deg, transparent, ${accentColor}80)`,
                    filter: darkMode ? 'brightness(0.8)' : 'brightness(1)'
                  }}
                />
              </div>
              
              {/* Content wrapper */}
              <div className="relative p-6 md:p-8">
                {/* Header section */}
                <div className="flex justify-between items-start mb-6">
                  <motion.h2 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}
                    style={{ color: darkMode ? '#fff' : '#121212' }}
                  >
                    Schedule Interview
                  </motion.h2>
                  
                  <motion.button
                    whileHover={{ rotate: 90, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className={`p-2 rounded-full ${
                      darkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    } transition-all`}
                    aria-label="Close modal"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </motion.button>
                </div>
                
                {/* Candidate info card with glassmorphism */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-8 p-5 rounded-2xl backdrop-blur-sm ${
                    darkMode 
                      ? 'bg-gray-700/50 border border-gray-600' 
                      : 'bg-gray-50/80 border border-gray-100'
                  }`}
                >
                  <div className="flex flex-wrap sm:flex-nowrap items-start gap-4">
                    {/* Avatar placeholder or actual image */}
                    <div 
                      className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center text-xl font-bold"
                      style={{ 
                        backgroundColor: `${accentColor}20`,
                        color: accentColor 
                      }}
                    >
                      {applicant.name ? applicant.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {applicant.name || "Candidate"}
                      </h3>
                      <div className="mt-1 space-y-1 text-sm">
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <span className="inline-block w-20">Position:</span> 
                          <span className="font-medium">{applicant.jobTitle || "N/A"}</span>
                        </p>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <span className="inline-block w-20">Company:</span> 
                          <span className="font-medium">{applicant.jobId?.company || recruiter?.companyName || "N/A"}</span>
                        </p>
                        {applicant.email && (
                          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} truncate`}>
                            <span className="inline-block w-20">Email:</span> 
                            <span className="font-medium">{applicant.email}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm"
                    >
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Form section */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Scheduled Time input */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Scheduled Time*
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      required
                      className={`block w-full border rounded-xl p-3.5 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-opacity-60' 
                          : 'bg-white border-gray-300 focus:border-opacity-60'
                      } transition-all focus:outline-none focus:ring-2 focus:ring-opacity-30`}
                      style={{ 
                        focusBorderColor: accentColor,
                        focusRingColor: accentColor 
                      }}
                    />
                    
                    {/* Preview of selected time in human-readable format */}
                    {scheduledTime && (
                      <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatDatePreview(scheduledTime)}
                      </p>
                    )}
                  </motion.div>
                  
                  {/* Meeting Link input */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                  >
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Meeting Link*
                    </label>
                    <div className="relative">
                      <input
                        required
                        type="url"
                        value={meetingLink}
                        onChange={(e) => setMeetingLink(e.target.value)}
                        placeholder="https://meet.example.com/..."
                        className={`block w-full border rounded-xl p-3.5 pl-10 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-opacity-60' 
                            : 'bg-white border-gray-300 placeholder-gray-400 focus:border-opacity-60'
                        } transition-all focus:outline-none focus:ring-2 focus:ring-opacity-30`}
                        style={{ 
                          focusBorderColor: accentColor,
                          focusRingColor: accentColor 
                        }}
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Meeting platform suggestions */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {["Google Meet", "Zoom", "Microsoft Teams"].map(platform => (
                        <button 
                          key={platform}
                          type="button"
                          onClick={() => {
                            if (platform === "Google Meet") setMeetingLink("https://meet.google.com/");
                            else if (platform === "Zoom") setMeetingLink("https://zoom.us/j/");
                            else if (platform === "Microsoft Teams") setMeetingLink("https://teams.microsoft.com/l/meetup-join/");
                          }}
                          className={`text-xs px-2.5 py-1 rounded-full ${
                            darkMode 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {platform}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                  
                  {/* Action buttons */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="pt-2"
                  >
                    {showCalendarBtn ? (
                      <motion.button
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleOpenCalendar}
                        type="button"
                        className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-medium transition-all"
                        style={{ 
                          background: `linear-gradient(to right, #10b981, #059669)`,
                          color: 'white',
                          boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.25)'
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        Add to Google Calendar
                      </motion.button>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          type="button"
                          onClick={onClose}
                          className={`py-3.5 px-5 rounded-xl font-medium transition-all ${
                            darkMode 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Cancel
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          type="submit"
                          disabled={loading}
                          className="flex-1 flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-medium transition-all"
                          style={{ 
                            background: loading 
                              ? (darkMode ? '#4B5563' : '#D1D5DB') 
                              : `linear-gradient(to right, ${accentColor}, ${accentColor}DD)`,
                            color: 'white',
                            boxShadow: loading 
                              ? 'none' 
                              : `0 10px 15px -3px ${accentColor}40`
                          }}
                        >
                          {loading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Scheduling...
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                              </svg>
                              Schedule Interview
                            </>
                          )}
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ScheduleInterviewModal;
