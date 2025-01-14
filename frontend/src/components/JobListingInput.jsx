import React, { useState } from "react";
import Notification from "../components/Notification";
import JobListingModal from "./JobListingModal";

const JobListingInput = ({ user, onPostSuccess }) => {
    const [input, setInput] = useState(""); // State to hold user input
    const [notification, setNotification] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
    const [jobListing, setJobListing] = useState(null); // State for job listing data
    const [isPosting, setIsPosting] = useState(false); // State for loading interaction

    // Show notification
    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    const analyzeFreeText = async (freeText) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/ai/analyzeJobListing`, {
                method: "POST",
                body: JSON.stringify({ prompt: freeText }),
                headers: { "Content-Type": "application/json" },
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
            console.log(JSON.parse(match[1]));
            return JSON.parse(match[1]); // Parse the extracted JSON string
        } catch (error) {
            console.error("Error analyzing free text:", error.message);
            throw error;
        }
    };

    const saveJobListing = async (jobListingData) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/job-listing/save`, {
                method: "POST",
                body: JSON.stringify(jobListingData),
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error("Failed to save job listing.");
            }

            const result = await response.json();
            showNotification("success", "Job listing successfully saved in the database!");
            return result;
        } catch (error) {
            console.error("Error saving job listing:", error.message);
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

        const missingFields = requiredFields.filter((field) => !prettyJson[field]);

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
            console.log("Save result:", saveResult);
            setInput(""); // Clear the input
            if (onPostSuccess) onPostSuccess();
        } catch (error) {
            showNotification("error", error.message);
        } finally {
            setIsPosting(false); // Stop loading
        }
    };

    const handleModalSubmit = async () => {
        setIsPosting(true); // Start loading
        try {
            const combinedText = input + Object.entries(jobListing).reduce((acc, [key, value]) => {
                if (key !== "missingFields" && value) {
                    return acc + ` ${key}: ${value}`;
                }
                return acc;
            }, "");

            const analyzedData = await analyzeFreeText(combinedText);
            if (!analyzedData) return;

            const saveResult = await saveJobListing(analyzedData);
            console.log("Save result:", saveResult);

            setIsModalOpen(false); // Close modal
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
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-2xl">
            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">
                What Candidate are you looking for?
            </h1>
            <textarea
                className="w-full h-40 border rounded-lg p-4 text-gray-700 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder={`Describe your ideal candidate profile here...
e.g: We are looking for a Senior Front-End Engineer with 5+ years of experience in React.js and TypeScript for a full-time position at TechCorp Inc., based in New York City. The role requires expertise in web performance optimization and responsive design. This is a hybrid position. A Level 2 Security Clearance is required for this role.`}                    
                value={input}
                onChange={(e) => setInput(e.target.value)}
            ></textarea>
            <div className="flex justify-end mt-4">
                <button
                    onClick={handlePost}
                    disabled={isPosting} // Disable while posting
                    className={`px-6 py-2 font-semibold rounded-lg transition duration-200 ${
                        isPosting
                            ? "bg-gray-500 text-white cursor-not-allowed"
                            : "bg-pink-500 text-white hover:bg-pink-600"
                    }`}
                >
                    {isPosting ? "Posting..." : "POST"} {/* Change text during loading */}
                </button>
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
