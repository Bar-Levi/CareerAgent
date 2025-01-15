import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import JobCandidateDashboard from "../pages/JobCandidateDashboard";
import RecruiterDashboard from "../recruiterDashboard/pages/RecruiterDashboard";
// import RecruiterDashboard from "../pages/RecruiterDashboard";


const Dashboard = () => {
    const {state} = useLocation(); 
    const role = state?.role;
    // Conditionally render the appropriate dashboard
    const renderDashboard = () => {
        if (role === "jobseeker") {
            return <JobCandidateDashboard />;
        } else if (role === "recruiter") {
            return <RecruiterDashboard />;
        } else {
            return <p>Invalid dashboard type</p>;
        }
    };

    return (
        <div>
            {renderDashboard()}
        </div>
    );
};

export default Dashboard;
