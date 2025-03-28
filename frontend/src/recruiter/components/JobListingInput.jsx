import React, { useState } from "react";
import Notification from "../../components/Notification";
import JobListingModal from "./JobListingModal";
import SpeechToText from "../../components/SpeechToText"; // Adjust path based on your folder structure

const JobListingInput = ({ user, onPostSuccess, jobListings, setJobListings }) => {
    const [input, setInput] = useState(""); // State to hold user input
    const [notification, setNotification] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
    const [jobListing, setJobListing] = useState(null); // State for job listing data
    const [isPosting, setIsPosting] = useState(false); // State for loading interaction

    // Get token from localStorage
    const token = localStorage.getItem("token");

    // Show notification
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

            // Safeguard for JSON extraction in case the expected format is not met
            const jsonRaw = jsonResponse.response;
            const match = jsonRaw.match(/```json\n([\s\S]+?)\n```/);
            if (!match) {
                throw new Error("Invalid JSON format in response.");
            }
            return JSON.parse(match[1]); // Parse the extracted JSON string
        } catch (error) {
            console.error("Error analyzing free text:", error.message);
            throw error;
        }
    };

    const saveJobListing = async (jobListingData) => {
        try {
            const updatedJobListingData = { ...jobListingData, recruiterId: user._id, recruiterName: user.fullName, recruiterProfileImage: user.profilePic, companyLogo: user.companyLogo};

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
                    // Handle missing fields
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
            return true; // Missing fields detected
        }

        return false; // All required fields are present
    };

    const handlePost = async () => {
        setIsPosting(true); // Start loading
        try {
            let analyzedData = await analyzeFreeText(`${input} company: ${user.companyName}, company size: ${user.companySize}, company website: ${user.companyWebsite}`);
            if (!analyzedData) return;

            const hasMissingFields = handleMissingFields(analyzedData);
            if (hasMissingFields) return;

            const saveResult = await saveJobListing(analyzedData);
            
            setInput(""); // Clear the input
            if (onPostSuccess) onPostSuccess();
        } catch (error) {
            showNotification("error", error.message);
        } finally {
            setIsPosting(false); // Stop loading
        }
    };

    const handleModalSubmit = async () => {
        setIsModalOpen(false); // Close modal
        setIsPosting(true); // Start loading
        try {
            const combinedText = input + Object.entries(jobListing).reduce((acc, [key, value]) => {
                if (key !== "missingFields" && value) {
                    return acc + ` ${key}: ${value}`;
                }
                return acc;
            }, "");

            const analyzedData = await analyzeFreeText(combinedText);
            handleMissingFields(analyzedData);
            if (!analyzedData) return;

            const saveResult = await saveJobListing(analyzedData);

            setJobListing(null); // Clear job listing state
            if (onPostSuccess) onPostSuccess();
        } catch (error) {
            showNotification("error", error.message);
        } finally {
            setIsPosting(false); // Stop loading
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setJobListing(null);
        showNotification("info", "Job listing creation forfeited.");
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-2xl border-2 border-brand-primary">
    {notification && (
        <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
        />
    )}
    <h1 className="text-3xl font-semibold text-brand-primary mb-6 text-center">
        Find Your Ideal Candidate
    </h1>
    <p className="text-gray-600 text-center mb-4">
        Describe the profile you're looking for, and we'll help you create the perfect job listing!
    </p>
    <textarea
        className="w-full h-48 border-2 border-brand-secondary rounded-lg p-4 text-gray-700 text-lg focus:outline-none focus:ring-4 focus:ring-indigo-300 resize-none placeholder-gray-400 transition-all"
        placeholder={`Describe your ideal candidate profile here...
e.g: We are looking for a Senior Front-End Engineer with 5+ years of experience in React.js and TypeScript for a full-time position at TechCorp Inc., based in New York City. The role requires expertise in web performance optimization and responsive design. This is a hybrid position. A Level 2 Security Clearance is required for this role.`}
        value={input}
        onChange={(e) => setInput(e.target.value)}
    ></textarea>
    <div className="flex justify-center mt-6 space-x-4">
        <SpeechToText onTextChange={handleSpeechToText} showNotification={showNotification} />
        <button
            onClick={handlePost}
            disabled={isPosting}
            className={`px-6 py-3 font-semibold rounded-lg transition-all duration-200 transform ${
                isPosting
                    ? "bg-gray-400 text-white cursor-not-allowed scale-100"
                    : "bg-pink-500 text-white hover:bg-pink-600 hover:scale-105"
            }`}
        >
            {isPosting ? "Posting..." : "POST"}
        </button>
    </div>
    
    <div className="flex items-center justify-center bg-white p-3">
    <span className="text-xs text-center text-gray-500">
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
