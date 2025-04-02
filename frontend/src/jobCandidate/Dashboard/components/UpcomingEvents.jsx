import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaClock, FaLink, FaChevronRight, FaStar, FaCalendarPlus } from "react-icons/fa";
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
          // Instead of throwing error, set empty interviews
          setInterviews([]);
          setLoading(false);
          return;
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
        setLoading(false);

      } catch (err) {
        // Silently handle error and show empty state
        setInterviews([]);
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

  const handleGoogleCalendarClick = (interview, applicant) => {
    const formatToGoogleDate = (date) => {
      return date.toISOString().replace(/[-:]|\.\d{3}/g, "");
    };

    // Create Google Calendar Link
    const startTime = new Date(interview.scheduledTime);
    const endTime = new Date(startTime.getTime() + 60 * 30 * 1000); // 1/2 hour

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Interview with ${applicant.name}&dates=${formatToGoogleDate(startTime)}/${formatToGoogleDate(endTime)}&details=Meeting Link: ${interview.meetingLink || "TBD"}&location=Online`;

    window.open(calendarUrl, "_blank");
  };
  return (
    <div className="m-3 col-span-1 bg-white border border-gray-200 shadow-xl rounded-lg overflow-y-auto max-h-screen">
      {/* Sticky Header with Gradient */}
      <div className="sticky top-0 z-10 px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600">
        <h2 className="text-lg font-bold text-white flex items-center">
          <FaCalendarAlt className="w-5 h-5 mr-2 flex-shrink-0" /> {/* Added flex-shrink-0 */}
          Upcoming Interviews
        </h2>
      </div>

      {loading ? (
        // Improved Loading Skeleton Layout
        <div className="p-6">
          {[...Array(3)].map((_, index) => ( // Show a few skeleton loaders
            <div key={index} className="animate-pulse flex space-x-4 mb-4 p-4 border border-gray-100 rounded-md">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
              <div className="rounded-full bg-gray-200 h-10 w-10"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-6 m-4 bg-red-50 text-red-600 rounded-md border border-red-200">
          <p className="font-medium">Error loading interviews:</p>
          <p className="text-sm mb-3">{error}</p>
          <button
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
            onClick={() => window.location.reload()} // Simple reload action
          >
            Try again
          </button>
        </div>
      ) : interviews.length === 0 ? (
        <div className="p-8 text-center">
          <FaCalendarAlt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-700 font-semibold">No scheduled interviews yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Your upcoming interviews will appear here once scheduled.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {interviews.map((applicant) => {
            // Ensure nested properties are safely accessed
            const interview = applicant.interviewId || {};
            const recruiter = applicant.recruiterId || {};
            const { date, time } = formatDateTime(interview.scheduledTime);
            const jobTitle = applicant.jobTitle || "Interview Event";
            const companyName = recruiter.companyName || "Company";
            const recruiterName = recruiter.fullName || "Recruiter";
            const meetingLink = interview.meetingLink;

            const interviewToday = isToday(interview.scheduledTime);
            // Ensure "Upcoming" doesn't also apply if it's today for badge logic
            const interviewUpcoming = isUpcoming(interview.scheduledTime) && !interviewToday;

            return (
              // Removed outer p-2, transition on the inner div now
              <div key={applicant._id} className="block"> {/* Use block instead of flex for the outer wrapper */}
                 <div
                  className={`flex justify-between items-start p-4 transition-colors duration-150 rounded-md m-2 hover:bg-gray-50 ${ // Apply hover and margin here
                    interviewToday
                      ? "bg-gradient-to-r from-green-50 via-white to-white border border-green-200" // Subtle gradient and border
                      : interviewUpcoming
                      ? "bg-gradient-to-r from-yellow-50 via-white to-white border border-yellow-200" // Subtle gradient and border
                      : "bg-white border border-transparent" // Default white background, transparent border
                  }`}
                >
                  <div className="flex-1 mr-4"> {/* Added margin-right */}
                    <h3 className="font-semibold text-gray-800">{jobTitle}</h3> {/* Slightly darker text */}
                    <p className="text-sm text-gray-600">
                      {recruiterName} &middot; {companyName}
                    </p>

                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <FaClock className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" /> {/* Adjusted margin */}
                      <span className="mr-3">{time}</span>
                      <FaCalendarAlt className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" /> {/* Adjusted margin */}
                      <span>{date}</span>
                    </div>

                    {/* Button Container - Reduced vertical gap */}
                    <div className="mt-4 flex flex-col gap-2">
                      {/* Top row of buttons */}
                      <div className="flex flex-wrap gap-2"> {/* Allow buttons to wrap on small screens */}
                        <button
                          className="flex items-center justify-center px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg"
                          onClick={() => handleInterviewChatClick(applicant.jobId)}
                        >
                          AI Mock Interview
                        </button>

                        {meetingLink && (
                          <a
                            href={meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            // Consistent vertical padding (py-2), slightly less horizontal (px-3)
                            className="flex items-center justify-center px-3 py-2 text-sm font-medium whitespace-nowrap rounded-lg bg-white border border-indigo-500 text-indigo-600 hover:bg-indigo-50 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
                          >
                            <FaLink className="w-3 h-3 mr-1.5" /> {/* Adjusted margin */}
                            Join Meeting
                          </a>
                        )}
                      </div>

                      {/* Bottom row button (Add to Calendar) */}
                      {/* Removed justify-center, button aligns left by default in the flex-col */}
                      <div>
                        <button
                          className="flex items-center justify-center w-auto px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg bg-white border border-gray-400 text-gray-700 hover:bg-gray-50 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md" // Adjusted border/text color for secondary action
                          onClick={() => handleGoogleCalendarClick(interview, applicant)}
                        >
                          <FaCalendarPlus className="w-4 h-4 mr-1.5" /> {/* Adjusted icon size/margin */}
                          Add to Calendar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-col items-end flex-shrink-0"> {/* Added flex-shrink-0 */}
                    {interviewToday && (
                      <span className="inline-flex items-center px-2.5 py-0.5 mb-2 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Today
                      </span>
                    )}
                    {interviewUpcoming && ( // Already excludes today
                      <span className="inline-flex items-center px-2.5 py-0.5 mb-2 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Upcoming
                      </span>
                    )}
                     {!interviewToday && !isUpcoming(interview.scheduledTime) && interview.scheduledTime && (
                       <span className="inline-flex items-center px-2.5 py-0.5 mb-2 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                         Near Future
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