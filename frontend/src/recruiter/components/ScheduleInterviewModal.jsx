import React, { useState } from "react";

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

  const handleOpenCalendar = () => {
    if (calendarUrl) {
      window.open(calendarUrl, "_blank");
    }
  };

  return (
    <div className={`${darkMode ? 'bg-gray-700 text-white' : 'bg-white'} rounded-lg shadow-lg w-full max-w-md p-6 relative`}>
      <button
        onClick={onClose}
        className={`absolute top-4 right-4 ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
        aria-label="Close modal"
      >
        ✕
      </button>
      <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Schedule Interview</h2>
      <div className="mb-4">
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>
          Candidate: <span className="font-semibold">{applicant.name}</span>
        </p>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>
          Position: <span className="font-semibold">{applicant.jobTitle || "N/A"}</span>
        </p>
      </div>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            Scheduled Time *
          </label>
          <input
            type="datetime-local"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            required
            className={`mt-1 block w-full border rounded-md p-2 ${
              darkMode 
                ? 'bg-gray-600 border-gray-500 text-white focus:border-indigo-400 focus:ring-indigo-400' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            Meeting Link *
          </label>
          <input
            required
            type="url"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            placeholder="https://"
            className={`mt-1 block w-full border rounded-md p-2 ${
              darkMode 
                ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:border-indigo-400 focus:ring-indigo-400' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
          />
        </div>

        { showCalendarBtn ? (
        <button
          onClick={handleOpenCalendar}
          className={`mt-4 w-full px-4 py-2 rounded-md transition ${
            darkMode 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          Add to Google Calendar
        </button>
        ):
          <button
          type="submit"
          disabled={loading}
          className={`w-full px-4 py-2 rounded-md transition ${
            darkMode 
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-indigo-500 disabled:opacity-70' 
              : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400 disabled:opacity-70'
          }`}
        >
          {loading ? "Scheduling..." : "Schedule Interview"}
        </button>
        }
      </form>
    </div>
  );
};

export default ScheduleInterviewModal;
