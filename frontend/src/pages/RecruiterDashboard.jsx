import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import Botpress from "../botpress/Botpress";
import JobListingInput from "../components/JobListingInput";
import JobListingCardsList from "../components/JobListingCardsList";

const RecruiterDashboard = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const user = state?.user;

    const handlePostSuccess = () => {
        console.log("Job listing posted successfully!");
        // Additional logic after posting can be added here
    };

    return (
        <div className="h-screen flex flex-col bg-gray-100">
            {/* Chatbot */}
            <Botpress />

            {/* Navigation Bar */}
            <NavigationBar />

            {/* Main Content */}
            <div className="flex justify-center items-center flex-1">
                <JobListingInput user={user} onPostSuccess={handlePostSuccess} />
            </div>
            <JobListingCardsList />

        </div>
    );
};

export default RecruiterDashboard;