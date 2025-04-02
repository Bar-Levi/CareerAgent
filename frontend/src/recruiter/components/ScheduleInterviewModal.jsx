import React, { useState } from "react";

const ScheduleInterviewModal = ({
  isOpen,
  onClose,
  applicant,
  setApplicants,
  jobListingId,
  recruiter,
  refetchApplicants
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

      const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Interview with ${applicant.name}&dates=${formatToGoogleDate(startTime)}/${formatToGoogleDate(endTime)}&details=Meeting Link: ${meetingLink || "TBD"}&location=Online`;
      console.log(googleUrl);
      setCalendarUrl(googleUrl);
      setShowCalendarBtn(true);
      setApplicants((applicants) => {
        const updatedApplicant = applicants.find(
          (app) => app._id === applicant._id
        );
        updatedApplicant.status = "Interview Scheduled";
        return [...applicants];
      });
      // Refetch applicants to update the list
      refetchApplicants?.();
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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          aria-label="Close modal"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold mb-4">Schedule Interview</h2>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Scheduled Time *
            </label>
            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Meeting Link *
            </label>
            <input
              required
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          { showCalendarBtn ? (
          <button
            onClick={handleOpenCalendar}
            className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            Add to Google Calendar
          </button>
          ):
            <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            {loading ? "Scheduling..." : "Schedule Interview"}
          </button>
          }
        </form>

        
      </div>
    </div>
  );
};

export default ScheduleInterviewModal;
