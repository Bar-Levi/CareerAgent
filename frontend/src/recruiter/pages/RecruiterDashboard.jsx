// /pages/RecruiterDashboard.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import NavigationBar from "../../components/NavigationBar/NavigationBar";
import Botpress from "../../botpress/Botpress";
import Notification from "../../components/Notification";
import MetricsOverview from "../components/MetricsOverview";
import MyJobListings from "../components/MyJobListings";
import RecentApplications from "../components/RecentApplications";
import JobListingInput from "../components/JobListingInput";
import CandidateMessages from "../components/CandidateMessages"; // Component for candidate messages & chat
import convertMongoObject from "../../utils/convertMongoObject";

const RecruiterDashboard = ({onlineUsers}) => {
  const location = useLocation();
  const state = location.state;
  const user = state?.user;

  const [jobListings, setJobListings] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [notification, setNotification] = useState(null);
  const [newConversationCandidate, setNewConversationCandidate] = useState(null);

  

  // Initialize conversation and job listing states (if comes from a notification)
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [selectedJobListing, setSelectedJobListing] = useState(convertMongoObject(null));
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [title, setTitle] = useState(null);
  

  useEffect(() => {
  }, [selectedJobListing]);

  // This function is called when a notification is clicked.
  useEffect(() => {
    const stateAddition = localStorage.getItem("stateAddition");
    if (stateAddition) {
      try {
        const parsedAddition = JSON.parse(stateAddition);
        console.log("Parsed addition: ", parsedAddition);
        setSelectedConversationId(parsedAddition.conversationId);
        setSelectedJobListing(convertMongoObject(parsedAddition.jobListing));
        setTitle(parsedAddition.title);

        // Only remove after you are sure the state is updated (or use a flag)
      } catch (error) {
        console.error("Error parsing stateAddition:", error);
      } finally {
        localStorage.removeItem("stateAddition");

      }
    }
  }, [state.refreshToken]); // Run once on mount

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

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
      setJobListings(data.jobListings);
    } catch (error) {
      console.error("Error fetching job listings:", error.message);
    }
  };

  const fetchRecentApplications = async () => {
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
      setRecentApplications(data.applications);
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
      setMetrics(dashboardMetrics);
    } catch (error) {
      console.error("Failed to fetch metrics:", error.message);
      showNotification("error", "Failed to fetch metrics. Please try again later.");
    }
  };

  

  useEffect(() => {
    fetchJobListings();
    fetchRecentApplications();
    fetchMetrics();
  }, []);

  const handlePostSuccess = () => {
    showNotification("success", "Job listing posted successfully!");
    // Update metrics locally and increment metric.activeListings by 1
    setMetrics((prevMetrics) => ({
      ...prevMetrics,
      activeListings: prevMetrics.activeListings + 1,
    }));
    fetchJobListings();
  };
  

  return (
    <div key={state.refreshToken} className="h-screen flex flex-col bg-gray-100 animate-fade-in">
      <Botpress />
      <NavigationBar userType={state?.user?.role || state?.role}/>

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Metrics Overview */}
      <div className="flex flex-col items-center p-6 space-y-8">
        <MetricsOverview metrics={metrics} />
      </div>
      
      {/* Main Dashboard – Two-Pane Layout */}
      <div className="flex flex-col md:flex-row flex-1 p-6 space-y-8 md:space-y-0 md:space-x-4">
        {/* Left Pane: My Job Listings (40% width, scrollable) */}
        <div
          className="md:w-2/5 w-full bg-gray-50 shadow rounded-lg overflow-y-auto border-gray-200 border-2 border-t-0"
          style={{ height: "calc(65vh)" }}
        >
          <MyJobListings
            showNotification={showNotification}
            jobListings={jobListings}
            setJobListings={setJobListings}
            selectedJobListing={selectedJobListing}
            setSelectedJobListing={setSelectedJobListing}
            setMetrics={setMetrics}
            setSelectedConversationId={setSelectedConversationId}
            setSelectedCandidate={setSelectedCandidate}
          />
        </div>
        {/* Right Pane: Candidate Messages & Chat (55% width) */}
        <div
          className="md:w-3/5 w-full bg-white shadow rounded-lg overflow-y-auto border-gray-200 border-2 border-t-0"
          style={{ height: "calc(65vh)" }}
        >
          <CandidateMessages
            key={selectedJobListing ? selectedJobListing._id : "none"}
            user={user}
            recruiterId={user._id}
            jobListing={selectedJobListing}
            selectedConversationId={selectedConversationId}
            setSelectedConversationId={setSelectedConversationId}
            selectedCandidate={selectedCandidate}
            title={title}
            setSelectedCandidate={setSelectedCandidate}
            onlineUsers={onlineUsers}
          />
        </div>
      </div>

      {/* Other Sections */}
      <div className="flex flex-col items-center p-6 space-y-8">
        <RecentApplications
          applications={recentApplications}
          setSelectedConversationId={setSelectedConversationId}
          setSelectedJobListing={setSelectedJobListing}
          setSelectedCandidate={setSelectedCandidate}
        />
        <JobListingInput
          user={user}
          onPostSuccess={handlePostSuccess}
          jobListings={jobListings}
          setJobListings={setJobListings}
        />
      </div>
    </div>
  );
};

export default RecruiterDashboard;
