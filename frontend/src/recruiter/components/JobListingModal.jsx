import React from "react";

const JobListingModal = ({ isOpen, jobListing, onChange, onSubmit, onClose }) => {
    if (!isOpen) return null;

    // Example placeholders for each field
    const placeholders = {
        jobRole: "e.g., Full Stack Developer",
        location: "e.g., Tel Aviv, Israel",
        company: "e.g., TechCorp Inc.",
        experienceLevel: "e.g., Mid Senior",
        jobType: "e.g., Full Time",
        remote: "e.g., Hybrid",
        description: "e.g., Seeking a React.js and Node.js expert with 3 years experience.",
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        onSubmit(); // Call the provided submit function
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg p-6 w-96">
                <h2 className="text-xl font-bold mb-4">Fill Missing Fields</h2>
                <form onSubmit={handleSubmit}>
                    {jobListing?.missingFields?.map((field) => (
                        <div key={field} className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">{field}</label>
                            <input
                                type="text"
                                className="w-full border rounded-lg p-2"
                                value={jobListing[field] || ""}
                                placeholder={placeholders[field] || "Enter value"} // Provide the placeholder
                                onChange={(e) => onChange(field, e.target.value)}
                                required
                            />
                        </div>
                    ))}
                    <div className="flex justify-end">
                        <button
                            type="submit" // Specify type="submit" for form submission
                            className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 mr-2"
                        >
                            Submit
                        </button>
                        <button
                            type="button" // Prevent triggering form submission
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600"
                        >
                            Close
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JobListingModal;
