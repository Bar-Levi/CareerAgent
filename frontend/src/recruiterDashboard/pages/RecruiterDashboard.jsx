import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavigationBar from "../../components/NavigationBar";
import Botpress from "../../botpress/Botpress";
import Notification from "../../components/Notification";
import MetricsOverview from "../components/MetricsOverview";
import MyJobListings from "../components/MyJobListings";
import RecentApplications from "../components/RecentApplications";
import JobListingInput from "../components/JobListingInput";

const RecruiterDashboard = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const user = state?.user;

    const [jobListings, setJobListings] = useState([]);
    const [recentApplications, setRecentApplications] = useState([]);
    const [metrics, setMetrics] = useState({});
    const [notification, setNotification] = useState(null);

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    useEffect(() => {
        fetchJobListings();
        fetchRecentApplications();
        fetchMetrics();
    }, []);

     // Fetch job listings from the API
     const fetchJobListings = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/joblistings/recruiter/${user._id}`);
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 404) {
                    console.error(data.message); // Use 'statusText' to show the server-provided message
                    return; // Exit early to avoid unnecessary API calls
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
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/applicants/getRecruiterApplicants/${user._id}`);
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 404) {
                    console.error(data.message); // Use 'statusText' to show the server-provided message
                    return; // Exit early to avoid unnecessary API calls
                }
                throw new Error("Failed to fetch recruiter's job listings.");
            }
            const applications = data.applications;
            setRecentApplications(applications);
        } catch (error) {
            console.error("Error fetching job listings:", error.message);
        }
    };

    const fetchMetrics = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/joblistings/metrics/${user._id}`);
    
            if (!response.ok) {
                const errorMessage = `Error ${response.status}: ${response.statusText}`;
                console.error(errorMessage);
                throw new Error(errorMessage);
            }
    
            const data = await response.json();
            const dashboardMetrics = data.metrics;
    
            console.log("dashboardMetrics:", dashboardMetrics);
            setMetrics(dashboardMetrics);
        } catch (error) {
            console.error("Failed to fetch metrics:", error.message);
            showNotification("error", "Failed to fetch metrics. Please try again later.");
        }
    };
    

    const handlePostSuccess = () => {
        showNotification("success", "Job listing posted successfully!");
        fetchJobListings();
    };

    return (
        <div className="h-screen flex flex-col bg-gray-100 animate-fade-in">
            <Botpress />
            <NavigationBar userType={state?.user?.role || state?.role}/>

            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}

            <div className="flex flex-col items-center flex-1 p-6 space-y-8">
                <MetricsOverview metrics={metrics} />
                <MyJobListings showNotification={showNotification} jobListings={jobListings} setJobListings={setJobListings}/>
                <RecentApplications applications={recentApplications} />
                <JobListingInput user={user} onPostSuccess={handlePostSuccess} jobListings={jobListings} setJobListings={setJobListings}/>
            </div>
        </div>
    );
};

export default RecruiterDashboard;
