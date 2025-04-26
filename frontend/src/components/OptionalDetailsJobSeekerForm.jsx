import React, { useState, useEffect} from 'react';
import { FaPhoneAlt, FaGithub, FaLinkedin, FaCalendarAlt } from 'react-icons/fa';
import { extractTextFromPDF } from '../utils/pdfUtils';

const OptionalDetailsForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        profilePic: null,
        phone: '',
        cv: null,
        analyzed_cv_content: {},
        githubUrl: '',
        linkedinUrl: '',
        dateOfBirth: '', // Add DOB field
    });

    let cvFile = null;
    let profilePicFile = null;
    const [isLoading, setIsLoading] = useState(false); // Loading state for form submission
    const [isProcessingCV, setIsProcessingCV] = useState(false); // Loading state for CV processing
    const [error, setError] = useState(null); // Error state for under-18 logic
    const [cvError, setCvError] = useState(null); // Separate state for CV errors
    const [profilePicError, setProfilePicError] = useState(null); // Separate state for profile pic errors
    const MAX_FILE_SIZE_MB = 2; // 2MB file size limit

    useEffect(() => {
        cvFile = formData.cv || null;
        profilePicFile = formData.profilePic || null;
        
    }, [formData]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'dateOfBirth') {
            // Validate age (prevent under 18 from proceeding)
            const selectedDate = new Date(value);
            const today = new Date();
            const age = today.getFullYear() - selectedDate.getFullYear();
            const isUnder18 = age < 18 || (age === 18 && today < new Date(selectedDate.setFullYear(today.getFullYear())));

            if (isUnder18) {
                setError('You must be at least 18 years old to register.');
            } else {
                setError(null); // Clear error if age is valid
            }
        }
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = async (e) => {
        const { name, files } = e.target;
    
        try {
            // Check file size for CV or profile pic
            if ((name === 'cv' || name === 'profilePic') && files[0]) {
                const fileSizeMB = files[0].size / (1024 * 1024); // Convert bytes to MB
                if (fileSizeMB > MAX_FILE_SIZE_MB) {
                    const errorMsg = `File size must be less than ${MAX_FILE_SIZE_MB}MB`;
                    if (name === 'cv') {
                        setCvError(errorMsg);
                        // Clear the CV file from form data
                        return;
                    } else {
                        setProfilePicError(errorMsg);
                        // Don't add the file to form data
                        return;
                    }
                } else {
                    // Clear relevant error
                    if (name === 'cv') {
                        setCvError(null);
                    } else {
                        setProfilePicError(null);
                    }
                }
            }

            // Update form data state with the file
            setFormData((prevFormData) => ({
                ...prevFormData,
                [name]: files[0],
            }));
            
            // Process CV file immediately to extract content
            if (name === 'cv' && files[0]) {
                await processCVFile(files[0]);
            }
        } catch (error) {
            console.error('Error handling file change:', error.message);
            if (name === 'cv') {
                setCvError('Error handling file. Please try again.');
            } else if (name === 'profilePic') {
                setProfilePicError('Error handling file. Please try again.');
            } else {
                setError('Error handling file. Please try again.');
            }
        }
    };
    
    // New function to process the CV file
    const processCVFile = async (file) => {
        try {
            setIsProcessingCV(true);
            setCvError(null);
            
            // Extract text content from the PDF file
            const cvContent = await extractTextFromPDF(file);
            
            // Send the extracted text to the AI endpoint
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/ai/generateJsonFromCV`, {
                method: 'POST',
                body: JSON.stringify({
                    prompt: cvContent,
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to generate AI CV analysis');
            }

            const jsonResponse = await response.json();
            
            // Extract and clean the JSON from the response string
            const jsonRaw = jsonResponse.response;
            
            // Safeguard for JSON extraction in case the expected format is not met
            const match = jsonRaw.match(/```json\n([\s\S]+?)\n```/);
            if (!match) {
                throw new Error('Invalid JSON format in response');
            }

            const jsonString = match[1]; // Extract JSON between code block markers
            const prettyJson = JSON.parse(jsonString); // Parse the JSON string
            
            console.log("Successfully processed CV and got analyzed content:", prettyJson);
            
            // Update form data with the analyzed content
            setFormData((prevFormData) => ({
                ...prevFormData,
                analyzed_cv_content: prettyJson
            }));
        } catch (error) {
            console.error('Error analyzing CV:', error.message);
            setCvError('Error analyzing CV. Please try again.');
        } finally {
            setIsProcessingCV(false);
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (error) {
            // Prevent submission if there's an error
            return;
        }
    
        setIsLoading(true); // Set loading to true when the request starts
    
        try {
            // No need to process CV here since we do it immediately on file selection
            
            console.log("Submitting form data:", JSON.stringify(formData, (key, value) => {
                if (key === 'cv' || key === 'profilePic') {
                    return value ? value.name : value;
                }
                return value;
            }, 2));
            await onSubmit(formData); // Submit the form data via the parent handler
        } catch (error) {
            console.error('Error submitting form:', error.message);
        } finally {
            setIsLoading(false); // Reset loading to false when the request completes
        }
    };
    

    return (
        <div className="flex flex-col space-y-6 w-full max-w-md">
            <h2 className="text-3xl font-bold text-gray-800 text-center font-orbitron">
                Add Optional Details
                <p className="text-gray-600 text-sm mt-1">
                    Provide additional information to enhance your profile.
                </p>
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Profile Picture Upload */}
                <div className="flex flex-col items-center space-y-4">
                    {/* Upload Button */}
                    <div className="relative flex justify-center items-center">
                        <label
                            htmlFor="profilePic"
                            className="cursor-pointer flex justify-center items-center w-24 h-24 px-1 rounded-full bg-gray-100 border border-gray-400 text-gray-800 font-medium hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                        >
                            {formData.profilePic ? (
                                <span className="text-sm text-gray-600 text-center px-2">
                                    {formData.profilePic.name}
                                </span>
                            ) : (
                                <span className="text-sm text-gray-500 text-center">Profile Picture</span>
                            )}
                        </label>
                        <input
                            id="profilePic"
                            type="file"
                            name="profilePic"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                    <p className="text-sm text-gray-500">Maximum file size: {MAX_FILE_SIZE_MB}MB</p>
                    {profilePicError && (
                        <p className="text-sm text-red-500">{profilePicError}</p>
                    )}
                </div>

                {/* Phone Number */}
                <div className="relative">
                    <FaPhoneAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                    />
                </div>

                {/* Date of Birth */}
                <div className="relative">
                    <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 bg-gray-50 text-gray-800 rounded-lg border ${
                            error ? 'border-red-500' : 'border-gray-400'
                        } focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300`}
                    />
                    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                </div>

                {/* CV Upload */}
                <div className="relative">
                    <label className="text-gray-700 font-medium">Upload CV (PDF only)</label>
                    <div className="flex flex-col space-y-2">
                        <label
                            htmlFor="cv"
                            className="cursor-pointer w-full py-3 text-center bg-gray-100 border border-gray-400 text-gray-800 font-medium rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                        >
                            {formData.cv ? formData.cv.name : 'Choose File'}
                        </label>
                        <input
                            id="cv"
                            type="file"
                            name="cv"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <p className="text-sm text-gray-500">Maximum file size: {MAX_FILE_SIZE_MB}MB</p>
                        {cvError && (
                            <p className="text-sm text-red-500">{cvError}</p>
                        )}
                        {isProcessingCV && (
                            <p className="text-sm text-blue-500">Processing CV with AI...</p>
                        )}
                        {formData.analyzed_cv_content && Object.keys(formData.analyzed_cv_content).length > 0 && !isProcessingCV && !cvError && (
                            <p className="text-sm text-green-500">CV successfully analyzed!</p>
                        )}
                    </div>
                </div>


                {/* GitHub URL */}
                <div className="relative">
                    <FaGithub className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                        type="url"
                        name="githubUrl"
                        placeholder="GitHub URL"
                        value={formData.githubUrl}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                    />
                </div>

                {/* LinkedIn URL */}
                <div className="relative">
                    <FaLinkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                        type="url"
                        name="linkedinUrl"
                        placeholder="LinkedIn URL"
                        value={formData.linkedinUrl}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    data-cy="submit-optional-details-job-seeker"
                    className={`w-full py-2 text-white font-bold rounded-lg focus:ring-2 focus:ring-gray-500 transition-all duration-200 ${
                        isLoading || isProcessingCV || error
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:scale-105'
                    }`}
                    disabled={isLoading || isProcessingCV || !!error}
                >
                    {isLoading ? (
                        <div className="flex justify-center items-center">
                            <svg
                                className="animate-spin h-5 w-5 text-white mr-2"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4l-2 2-2-2V4a8 8 0 010 16v-4l2-2 2 2v4a8 8 0 01-8-8z"
                                ></path>
                            </svg>
                            Submitting...
                        </div>
                    ) : isProcessingCV ? (
                        <div className="flex justify-center items-center">
                            <svg
                                className="animate-spin h-5 w-5 text-white mr-2"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4l-2 2-2-2V4a8 8 0 010 16v-4l2-2 2 2v4a8 8 0 01-8-8z"
                                ></path>
                            </svg>
                            Analyzing CV...
                        </div>
                    ) : (
                        'Submit and Verify Your Email'
                    )}
                </button>
            </form>
        </div>
    );
};

export default OptionalDetailsForm;
