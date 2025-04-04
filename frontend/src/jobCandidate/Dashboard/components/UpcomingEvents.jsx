import React, { useState, useEffect, useRef } from "react";
import { FaCalendarAlt, FaClock, FaLink, FaChevronRight, FaStar, FaCalendarPlus, FaCheckCircle } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

const UpcomingInterviews = ({ user }) => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { state } = useLocation();
  const navigate = useNavigate();
  const [refreshToken, setRefreshToken] = useState(0);

  const [selectedEventId, setSelectedEventId] = useState(null);
  const selectedEventRef = useRef();
  const containerRef = useRef();

  const getStatusStyles = (interviewToday, interviewUpcoming, interviewPassed) => {
    if (interviewPassed) {
      return {
        gradient: "bg-gradient-to-r from-gray-50 to-gray-50/50",
        border: "border-gray-200",
        badge: {
          bg: "from-gray-500 to-gray-600",
          shadow: "shadow-gray-500/20",
          border: "border-gray-400/20"
        }
      };
    }
    if (interviewToday) {
      return {
        gradient: "bg-gradient-to-r from-green-50 to-green-50/50",
        border: "border-green-200",
        badge: {
          bg: "from-green-500 to-green-600",
          shadow: "shadow-green-500/20",
          border: "border-green-400/20"
        }
      };
    }
    if (interviewUpcoming) {
      return {
        gradient: "bg-gradient-to-r from-yellow-50 to-yellow-50/50",
        border: "border-yellow-200",
        badge: {
          bg: "from-yellow-500 to-amber-500",
          shadow: "shadow-yellow-500/20",
          border: "border-yellow-400/20"
        }
      };
    }
    return {
      gradient: "bg-gradient-to-r from-purple-50 to-purple-50/50",
      border: "border-purple-200",
      badge: {
        bg: "from-purple-500 to-indigo-500",
        shadow: "shadow-purple-500/20",
        border: "border-purple-400/20"
      }
    };
  };

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
          setInterviews([]);
          setLoading(false);
          return;
        }
        const data = await res.json();

        const filteredInterviews = data.applicants.filter(
          (applicant) => applicant.interviewId
        );

        filteredInterviews.sort(
          (a, b) =>
            new Date(a.interviewId?.scheduledTime) - new Date(b.interviewId?.scheduledTime)
        );

        setInterviews(filteredInterviews);
        setLoading(false);

      } catch (err) {
        setInterviews([]);
        setLoading(false);
      }
    };

    fetchInterviews();
  }, [user]);

  useEffect(() => {
    console.log("Outside");
    console.log("selectedEventId:", selectedEventId);
    console.log("selectedEventRef:", selectedEventRef.current);
    console.log("interviews:", interviews);
    if (selectedEventId && selectedEventRef.current && interviews) {
      console.log("Here");
      selectedEventRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [interviews, selectedEventId, refreshToken, state]);

  useEffect(() => {
    const stateAddition = localStorage.getItem("stateAddition");
    if (stateAddition) {
      setRefreshToken((prev) => prev+1);
      console.log("refreshToken: ", refreshToken);
      try {
        const parsedAddition = JSON.parse(stateAddition);
        setSelectedEventId(parsedAddition.interviewId);
      } catch (error) {
        console.error("Error parsing stateAddition:", error);
      } finally {
        localStorage.removeItem("stateAddition");
      }
    } else {
      console.log("No state addition found.");
    }
  }, [refreshToken, state]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside any interview item
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setSelectedEventId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const isUpcoming = (dateString) => {
    if (!dateString) return false;

    const today = new Date();
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);

    const interviewDate = new Date(dateString);

    return interviewDate > today && interviewDate <= threeDaysLater;
  };

  const isPassed = (dateString) => {
    if (!dateString) return false;
    const now = new Date();
    const interviewDate = new Date(dateString);
    return interviewDate < now;
  };

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

    const startTime = new Date(interview.scheduledTime);
    const endTime = new Date(startTime.getTime() + 60 * 30 * 1000);

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Interview with ${applicant.name} - ${applicant.jobTitle} at ${applicant.jobId.company}&dates=${formatToGoogleDate(startTime)}/${formatToGoogleDate(endTime)}&details=Meeting Link: ${interview.meetingLink || "TBD"}&location=Online`;

    window.open(calendarUrl, "_blank");
  };

  const pulsingAnimation = `@keyframes subtle-pulsing {
    0%, 100% { transform: scale(1.01); }
    50% { transform: scale(1); }
  }`;

  return (
    <div key={refreshToken} className="bg-white rounded-lg shadow-lg h-full flex flex-col min-h-0">
      <style>{pulsingAnimation}</style>
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 flex-none">
        <h2 className="text-lg font-bold text-white flex items-center">
          <FaCalendarAlt className="w-5 h-5 mr-2 flex-shrink-0" />
          Upcoming Interviews
        </h2>
      </div>

      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="p-4">
            {[...Array(3)].map((_, index) => (
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
          <div className="p-4 m-4 bg-red-50 text-red-600 rounded-md border border-red-200">
            <p className="font-medium">Error loading interviews:</p>
            <p className="text-sm mb-3">{error}</p>
            <button
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
              onClick={() => window.location.reload()}
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
          <div className="overflow-y-auto h-full" ref={containerRef}>
            <div className="p-4">
              <div className="space-y-2">
                {interviews.map((applicant) => {
                  const interview = applicant.interviewId || {};
                  const recruiter = applicant.recruiterId || {};
                  const { date, time } = formatDateTime(interview.scheduledTime);
                  const jobTitle = applicant.jobTitle || "Interview Event";
                  const companyName = recruiter.companyName || "Company";
                  const recruiterName = recruiter.fullName || "Recruiter";
                  const meetingLink = interview.meetingLink;

                  const interviewToday = isToday(interview.scheduledTime);
                  const interviewUpcoming = isUpcoming(interview.scheduledTime) && !interviewToday;
                  const interviewPassed = isPassed(interview.scheduledTime);

                  return (
                    <div
                      key={applicant._id}
                      ref={selectedEventId === applicant.interviewId._id ? selectedEventRef : null}
                      onClick={() => setSelectedEventId(applicant.interviewId?._id)}
                      className={`
                        relative flex justify-between items-start p-4 rounded-md m-2
                        transition-all duration-300 ease-out
                        border ${getStatusStyles(interviewToday, interviewUpcoming, interviewPassed).border}
                        ${getStatusStyles(interviewToday, interviewUpcoming, interviewPassed).gradient}
                        hover:shadow-lg cursor-pointer
                        ${
                          applicant.interviewId?._id === selectedEventId
                            ? `
                              shadow-[0_8px_16px_-4px_rgba(59,130,246,0.15)]
                              animate-[subtle-pulsing_2s_ease-in-out_infinite]
                              scale-[1.01] z-10
                              ring-2 ring-blue-500/50
                              before:absolute before:inset-0 
                              before:rounded-md before:bg-gradient-to-r 
                              before:from-blue-500/10 before:to-transparent
                              before:opacity-50 before:-z-10
                            `
                            : 'shadow-sm hover:shadow-md hover:scale-[1.005]'
                        }
                      `}
                    >
                      <div className="absolute -top-2 -right-2 z-20">
                        {interviewToday && !interviewPassed && (
                          <span className={`
                            inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                            bg-gradient-to-r ${getStatusStyles(interviewToday, interviewUpcoming, interviewPassed).badge.bg}
                            text-white shadow-lg ${getStatusStyles(interviewToday, interviewUpcoming, interviewPassed).badge.shadow}
                            border ${getStatusStyles(interviewToday, interviewUpcoming, interviewPassed).badge.border}
                            backdrop-blur-sm
                            transform transition-all duration-300 hover:scale-105
                          `}>
                            <div className="w-2 h-2 rounded-full bg-white/90 mr-1.5 animate-pulse" />
                            Today
                          </span>
                        )}
                        {interviewUpcoming && (
                          <span className={`
                            inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                            bg-gradient-to-r ${getStatusStyles(interviewToday, interviewUpcoming, interviewPassed).badge.bg}
                            text-white shadow-lg ${getStatusStyles(interviewToday, interviewUpcoming, interviewPassed).badge.shadow}
                            border ${getStatusStyles(interviewToday, interviewUpcoming, interviewPassed).badge.border}
                            backdrop-blur-sm
                            transform transition-all duration-300 hover:scale-105
                          `}>
                            <div className="w-2 h-2 rounded-full bg-white/90 mr-1.5 animate-pulse" />
                            Upcoming
                          </span>
                        )}
                        {interviewPassed && (
                          <span className={`
                            inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                            bg-gradient-to-r ${getStatusStyles(interviewToday, interviewUpcoming, interviewPassed).badge.bg}
                            text-white shadow-lg ${getStatusStyles(interviewToday, interviewUpcoming, interviewPassed).badge.shadow}
                            border ${getStatusStyles(interviewToday, interviewUpcoming, interviewPassed).badge.border}
                            backdrop-blur-sm
                            transform transition-all duration-300 hover:scale-105
                          `}>
                            <FaCheckCircle className="w-3 h-3 mr-1.5" />
                            Passed
                          </span>
                        )}
                        {!interviewToday && !interviewUpcoming && !interviewPassed && (
                          <span className={`
                            inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                            bg-gradient-to-r ${getStatusStyles(interviewToday, interviewUpcoming, interviewPassed).badge.bg}
                            text-white shadow-lg ${getStatusStyles(interviewToday, interviewUpcoming, interviewPassed).badge.shadow}
                            border ${getStatusStyles(interviewToday, interviewUpcoming, interviewPassed).badge.border}
                            backdrop-blur-sm
                            transform transition-all duration-300 hover:scale-105
                          `}>
                            <FaCalendarAlt className="w-3 h-3 mr-1.5" />
                            Future
                          </span>
                        )}
                      </div>

                      {applicant.interviewId?._id === selectedEventId && (
                        <>
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 
                            bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 
                            rounded-l-md animate-pulse" 
                          />
                          <div className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-3 h-3 
                            bg-blue-500 rounded-full shadow-lg shadow-blue-500/50
                            before:absolute before:inset-0 before:rounded-full 
                            before:animate-ping before:bg-blue-500/50" 
                          />
                        </>
                      )}

                      <div className="flex-1 mr-4">
                        <h3 className="font-semibold text-gray-800">{jobTitle}</h3>
                        <p className="text-sm text-gray-600">
                          {recruiterName} &middot; {companyName}
                        </p>

                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <FaClock className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" />
                          <span className="mr-3">{time}</span>
                          <FaCalendarAlt className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" />
                          <span>{date}</span>
                        </div>

                        <div className="mt-4 flex flex-col gap-2">
                          {!interviewPassed && (
                            <div className="flex flex-wrap gap-2">
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
                                  className="flex items-center justify-center px-3 py-2 text-sm font-medium whitespace-nowrap rounded-lg bg-white border border-indigo-500 text-indigo-600 hover:bg-indigo-50 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
                                >
                                  <FaLink className="w-3 h-3 mr-1.5" />
                                  Join Meeting
                                </a>
                              )}
                            </div>
                          )}

                          {!interviewPassed && (
                            <div>
                              <button
                                className="flex items-center justify-center w-auto px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg bg-white border border-gray-400 text-gray-700 hover:bg-gray-50 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
                                onClick={() => handleGoogleCalendarClick(interview, applicant)}
                              >
                                <FaCalendarPlus className="w-4 h-4 mr-1.5" />
                                Add to Calendar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingInterviews;