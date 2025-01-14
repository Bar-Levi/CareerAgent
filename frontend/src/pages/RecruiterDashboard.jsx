import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import Botpress from "../botpress/Botpress";
import JobListingInput from "../components/JobListingInput";
import SpeechToText from "../components/SpeechToText"; // Adjust path based on your folder structure

const RecruiterDashboard = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const user = state?.user;

    const handlePostSuccess = () => {
        console.log("Job listing posted successfully!");
        // Additional logic after posting can be added here
    };

    const handleSpeechToText = (text) => {
        setInput((prev) => `${prev} ${text}`.trim());
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
                <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-2xl">
                    <h1 className="text-2xl font-semibold text-gray-800 mb-4">
                        What Candidate are you looking for?
                    </h1>
                    {/* Interactive Text Area */}
                    <textarea
                        className="w-full h-40 border rounded-lg p-4 text-gray-700 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder={`Write your ideal candidate profile here...
e.g: I'm looking for a full-time role of junior full-stack developer with 2 years of experience in React.js and Node.js for my company in Tel Aviv. Hybrid work.`}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    ></textarea>
                    {/* Speech to Text Button */}
                    <div className="flex items-center mt-4 space-x-4">
                        <SpeechToText onTextChange={handleSpeechToText} />
                        <button
                            onClick={handlePost}
                            className="px-6 py-2 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition duration-200"
                        >
                            POST
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruiterDashboard;
