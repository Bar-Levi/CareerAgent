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
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/joblistings`);
            if (!response.ok) {
                throw new Error(`Failed to fetch job listings: ${response.statusText}`);
            }
            const jobListings = await response.json();
            console.log('WOW');
            console.log("jobListings:", JSON.stringify(jobListings, null, 2));
            setJobListings(jobListings.jobListings);
        } catch (err) {
            console.error("Failed to load job listings:", err.message);
        }
    };

    const fetchRecentApplications = async () => {
        const applications = [
            { id: 1, candidate: "John Doe", position: "Frontend Developer", date: "2025-01-14", status: "Screening" },
            { id: 2, candidate: "Jane Smith", position: "Backend Developer", date: "2025-01-13", status: "Interviewing" },
        ];
        setRecentApplications(applications);
    };

    const fetchMetrics = async () => {
        const dashboardMetrics = {
            activeListings: 2,
            totalApplications: 25,
            avgTimeToHire: 20,
        };
        setMetrics(dashboardMetrics);
    };

    const handlePostSuccess = () => {
        showNotification("success", "Job listing posted successfully!");
        fetchJobListings();
    };

    return (
        <div className="h-screen flex flex-col bg-gray-100">
            <Botpress />
            <NavigationBar />

            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}

            <div className="flex flex-col items-center flex-1 p-6 space-y-8">
                <MetricsOverview metrics={metrics} />
                <MyJobListings recruiterId={user._id} jobListings={jobListings} setJobListings={setJobListings}/>
                <RecentApplications applications={recentApplications} />
                <JobListingInput user={user} onPostSuccess={handlePostSuccess} jobListings={jobListings} setJobListings={setJobListings}/>
            </div>
        </div>
    );
};

export default RecruiterDashboard;
