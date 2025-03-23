import React, { useState } from "react";
import Notification from "../../components/Notification";
import JobListingModal from "./JobListingModal";
import SpeechToText from "../../components/SpeechToText";

const JobListingInput = ({ user, onPostSuccess, jobListings, setJobListings }) => {
    const [input, setInput] = useState("");
    const [notification, setNotification] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [jobListing, setJobListing] = useState(null);
    const [isPosting, setIsPosting] = useState(false);

    const token = localStorage.getItem("token");

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleSpeechToText = (text) => {
        setInput((prev) => `${prev} ${text}`.trim());
    };

    const analyzeFreeText = async (freeText) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/ai/analyzeJobListing`, {
                method: "POST",
                body: JSON.stringify({ prompt: freeText }),
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to analyze free text.");
            }

            const jsonResponse = await response.json();
            const jsonRaw = jsonResponse.response;
            const match = jsonRaw.match(/```json\n([\s\S]+?)\n```/);
            if (!match) {
                throw new Error("Invalid JSON format in response.");
            }
            return JSON.parse(match[1]);
        } catch (error) {
            console.error("Error analyzing free text:", error.message);
            throw error;
        }
    };

    const saveJobListing = async (jobListingData) => {
        try {
            const updatedJobListingData = { 
                ...jobListingData, 
                recruiterId: user._id, 
                recruiterName: user.fullName, 
                recruiterProfileImage: user.profilePic, 
                companyLogo: user.companyLogo
            };

            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/joblistings/save`, {
                method: "POST",
                body: JSON.stringify(updatedJobListingData),
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
            const result = await response.json();

            if (!response.ok) {
                if (response.status === 400) {
                    handleMissingFields(result.jsonToFill);
                }
                throw new Error("Failed to save job listing.");
            }

            setJobListings([...jobListings, updatedJobListingData]);
            showNotification("success", "Job listing was posted successfully!");
            return result;
        } catch (error) {
            console.error("Error posting job listing:", error.message);
            throw error;
        }
    };

    const handleMissingFields = (prettyJson) => {
        const requiredFields = [
            "jobRole",
            "location",
            "company",
            "experienceLevel",
            "jobType",
            "remote",
            "description",
        ];

        const missingFields = requiredFields.filter(
            (field) => !prettyJson[field] || (prettyJson[field].length === 0)
        );
        if (missingFields.length > 0) {
            setJobListing({ ...prettyJson, missingFields });
            setIsModalOpen(true);
            return true;
        }

        return false;
    };

    const handlePost = async () => {
        setIsPosting(true);
        try {
            let analyzedData = await analyzeFreeText(
                `${input} company: ${user.companyName}, company size: ${user.companySize}, company website: ${user.companyWebsite}`
            );
            if (!analyzedData) return;

            const hasMissingFields = handleMissingFields(analyzedData);
            if (hasMissingFields) return;

            await saveJobListing(analyzedData);
            
            setInput("");
            if (onPostSuccess) onPostSuccess();
        } catch (error) {
            showNotification("error", error.message);
        } finally {
            setIsPosting(false);
        }
    };

    const handleModalSubmit = async () => {
        setIsModalOpen(false);
        setIsPosting(true);
        try {
            const combinedText = input + Object.entries(jobListing).reduce((acc, [key, value]) => {
                if (key !== "missingFields" && value) {
                    return acc + ` ${key}: ${value}`;
                }
                return acc;
            }, "");

            const analyzedData = await analyzeFreeText(combinedText);
            if (!analyzedData) return;
            
            handleMissingFields(analyzedData);
            await saveJobListing(analyzedData);

            setJobListing(null);
            if (onPostSuccess) onPostSuccess();
        } catch (error) {
            showNotification("error", error.message);
        } finally {
            setIsPosting(false);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setJobListing(null);
        showNotification("info", "Job listing creation forfeited.");
    };

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-8 w-full max-w-2xl shadow-lg">
            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}
            
            <div className="mb-6 flex items-center">
                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Find Your Ideal Candidate
                    </h1>
                    <p className="text-gray-500 text-sm">
                        AI-powered job listing creation
                    </p>
                </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                <textarea
                    className="w-full h-36 border-0 bg-transparent text-gray-700 text-base focus:outline-none resize-none placeholder-gray-400"
                    placeholder="Describe your ideal candidate profile here...
e.g: We are looking for a Senior Front-End Engineer with 5+ years of experience in React.js and TypeScript for a full-time position at TechCorp Inc., based in New York City. The role requires expertise in web performance optimization and responsive design. This is a hybrid position. A Level 2 Security Clearance is required for this role."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                ></textarea>
            </div>
            
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-gray-500">POWERED BY</span>
                    <div className="bg-indigo-100 text-indigo-600 py-1 px-3 rounded-full text-xs font-medium">
                        CareerAgent AI
                    </div>
                </div>
                
                <SpeechToText onTextChange={handleSpeechToText} showNotification={showNotification} />
            </div>
            
            <div className="flex space-x-4">
                <button
                    onClick={handlePost}
                    disabled={isPosting}
                    className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                        isPosting
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg"
                    }`}
                >
                    {isPosting ? (
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Analyzing...
                        </div>
                    ) : "Create Job Listing"}
                </button>
            </div>
            
            <div className="mt-4 text-center">
                <span className="text-xs text-gray-400">
                Your job listing is being analyzed to improve your experience.<br />
                Our bot may occasionally make mistakes, please review and confirm all key details.
                </span>
            </div>

            <JobListingModal
                isOpen={isModalOpen}
                jobListing={jobListing}
                onChange={(field, value) => setJobListing((prev) => ({ ...prev, [field]: value }))}
                onSubmit={handleModalSubmit}
                onClose={handleModalClose}
            />
        </div>
    );
};

export default JobListingInput;