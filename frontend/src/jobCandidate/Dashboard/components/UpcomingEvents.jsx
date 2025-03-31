import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaClock, FaLink, FaChevronRight, FaStar } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
const UpcomingInterviews = ({ user }) => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInterviews = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/applicants/getJobSeekerApplications/${user._id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!res.ok) {
          throw new Error("Failed to fetch upcoming interviews");
        }
        const data = await res.json();

        // Filter applicants who have an interviewId set
        const filteredInterviews = data.applicants.filter(
          (applicant) => applicant.interviewId
        );

        // Sort by scheduled interview time (upcoming first)
        filteredInterviews.sort(
          (a, b) =>
            new Date(a.interviewId?.scheduledTime) - new Date(b.interviewId?.scheduledTime)
        );

        setInterviews(filteredInterviews);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, [user]);

  // Helper function to format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return { date: "Date not set", time: "Time not set" };
    
    const date = new Date(dateString);
    
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short", 
      day: "numeric"
    });
    
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
    
    return { date: formattedDate, time: formattedTime };
  };

  // Helper function to check if interview is today
  const isToday = (dateString) => {
    if (!dateString) return false;
    
    const today = new Date();
    const interviewDate = new Date(dateString);
    
    return (
      today.getDate() === interviewDate.getDate() &&
      today.getMonth() === interviewDate.getMonth() &&
      today.getFullYear() === interviewDate.getFullYear()
    );
  };

  // Helper function to check if interview is upcoming (within next 3 days)
  const isUpcoming = (dateString) => {
    if (!dateString) return false;
    
    const today = new Date();
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);
    
    const interviewDate = new Date(dateString);
    
    return interviewDate > today && interviewDate <= threeDaysLater;
  };

  // When the user clicks "Talk with Chatbot", navigate to /chats with job data in state.
  const handleInterviewChatClick = (jobListing) => {
    console.log("JobListing: ", jobListing);
    console.log("state: ", state);
    navigate("/chats", { 
      state: { 
        ...state, 
        interviewJobData: jobListing, 
        chatType: "interviewer" 
      } 
    });
  };

  return (
    <div className="m-3 col-span-1 bg-white border border-gray-200 shadow-xl rounded-lg overflow-y-auto max-h-screen">
      {/* Sticky Header with Gradient */}
      <div className="sticky top-0 z-10 px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600">
        <h2 className="text-lg font-bold text-white flex items-center">
          <FaCalendarAlt className="w-5 h-5 mr-2" />
          Upcoming Interviews
        </h2>
      </div>

      {loading ? (
        <div className="p-6 flex justify-center items-center h-40">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 text-red-500 rounded-md">
          <p>Error: {error}</p>
          <button 
            className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      ) : interviews.length === 0 ? (
        <div className="p-6 text-center">
          <div className="text-gray-400 mb-2">
            <FaCalendarAlt className="w-10 h-10 mx-auto mb-2" />
          </div>
          <p className="text-gray-600">No upcoming interviews scheduled.</p>
          <p className="text-sm text-gray-500 mt-1">
            When you secure interviews, they'll appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {interviews.map((applicant) => {
            const interview = applicant.interviewId;
            const { date, time } = formatDateTime(interview?.scheduledTime);
            const jobTitle = applicant.jobTitle || "Interview Event";
            // Assuming recruiterId is populated with companyName and fullName
            const companyName = applicant.recruiterId?.companyName || "Company";
            const recruiterName = applicant.recruiterId?.fullName || "Recruiter";
            const meetingLink = interview?.meetingLink;
            
            // Determine status for visual cues
            const interviewToday = isToday(interview?.scheduledTime);
            const interviewUpcoming = isUpcoming(interview?.scheduledTime);
            
            return (
              <div 
                key={applicant._id}
                className="p-2 transition-colors duration-150"
              >
                <div
                  className={`flex justify-between items-start p-4 rounded-md hover:bg-gray-200 ${
                    interviewToday
                      ? "bg-gradient-to-r from-green-100 to-white"
                      : interviewUpcoming
                      ? "bg-gradient-to-r from-yellow-100 to-white"
                      : "bg-gray-100"
                  }`}
                >                 
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{jobTitle}</h3>
                    <p className="text-sm text-gray-600">
                      {recruiterName} &middot; {companyName}
                    </p>
                    
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <FaClock className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="mr-3">{time}</span>
                      <FaCalendarAlt className="w-4 h-4 mr-1 text-gray-400" />
                      <span>{date}</span>
                    </div>
                    
                    <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                      <button
                        className="w-full sm:w-auto px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg flex items-center justify-center"
                        onClick={() => handleInterviewChatClick(applicant.jobId)}
                      >
                      AI Mock Interview
                      </button>
                      
                      {meetingLink && (
                        <a 
                          href={meetingLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto px-2 py-1 text-sm font-medium whitespace-nowrap rounded-lg bg-white border border-indigo-500 text-indigo-600 hover:bg-indigo-50 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md flex items-center justify-center"
                        >
                          <FaLink className="w-3 h-3 mr-1 inline-block align-middle" />
                          <span className="inline-block align-middle">Join Meeting</span>
                        </a>
                      )}
                    </div>

                  </div>
                  
                  <div className="flex flex-col items-end ml-4">
                    {interviewToday && (
                      <span className="inline-flex items-center px-2.5 py-0.5 mb-2 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Today
                      </span>
                    )}
                    {interviewUpcoming && !interviewToday && (
                      <span className="inline-flex items-center px-2.5 py-0.5 mb-2 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Upcoming
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UpcomingInterviews;