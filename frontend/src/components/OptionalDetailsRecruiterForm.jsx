import React, { useState } from 'react';
import { FaCalendarAlt, FaLink } from 'react-icons/fa';

const OptionalDetailsRecruiterForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        dateOfBirth: '',
        companyWebsite: '',
        profilePic: null,
        companyLogo: null,
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [profilePicError, setProfilePicError] = useState(null);
    const [companyLogoError, setCompanyLogoError] = useState(null);
    const MAX_FILE_SIZE_MB = 2; // 2MB file size limit

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'dateOfBirth') {
            const selectedDate = new Date(value);
            const today = new Date();
            const age = today.getFullYear() - selectedDate.getFullYear();
            const isUnder18 =
                age < 18 ||
                (age === 18 && today < new Date(selectedDate.setFullYear(today.getFullYear())));

            if (isUnder18) {
                setError('You must be at least 18 years old to register.');
            } else {
                setError(null);
            }
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        
        try {
            // Check file size
            if (files[0]) {
                const fileSizeMB = files[0].size / (1024 * 1024); // Convert bytes to MB
                if (fileSizeMB > MAX_FILE_SIZE_MB) {
                    const errorMsg = `File size must be less than ${MAX_FILE_SIZE_MB}MB`;
                    if (name === 'profilePic') {
                        setProfilePicError(errorMsg);
                        return;
                    } else if (name === 'companyLogo') {
                        setCompanyLogoError(errorMsg);
                        return;
                    }
                } else {
                    // Clear relevant error
                    if (name === 'profilePic') {
                        setProfilePicError(null);
                    } else if (name === 'companyLogo') {
                        setCompanyLogoError(null);
                    }
                }
            }
            
            setFormData((prev) => ({ ...prev, [name]: files[0] }));
        } catch (error) {
            console.error('Error handling file change:', error.message);
            if (name === 'profilePic') {
                setProfilePicError('Error handling file. Please try again.');
            } else if (name === 'companyLogo') {
                setCompanyLogoError('Error handling file. Please try again.');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (error) return;
        setIsLoading(true);
        try {
            await onSubmit(formData); // Pass formData (including files) to parent
        } finally {
            setIsLoading(false);
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

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Profile Picture Upload */}
                <div className="flex flex-col items-center space-y-4">
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
                                <span className="text-sm text-gray-500 text-center">
                                    Profile Picture
                                </span>
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

                {/* Company Logo Upload */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative flex justify-center items-center">
                        <label
                            htmlFor="companyLogo"
                            className="cursor-pointer flex justify-center items-center w-24 h-24 px-1 rounded-full bg-gray-100 border border-gray-400 text-gray-800 font-medium hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                        >
                            {formData.companyLogo ? (
                                <span className="text-sm text-gray-600 text-center px-2">
                                    {formData.companyLogo.name}
                                </span>
                            ) : (
                                <span className="text-sm text-gray-500 text-center">
                                    Company Logo
                                </span>
                            )}
                        </label>
                        <input
                            id="companyLogo"
                            type="file"
                            name="companyLogo"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                    <p className="text-sm text-gray-500">Maximum file size: {MAX_FILE_SIZE_MB}MB</p>
                    {companyLogoError && (
                        <p className="text-sm text-red-500">{companyLogoError}</p>
                    )}
                </div>

                {/* Date of Birth Field */}
                <div className="relative">
                    <label className="block text-gray-700 font-medium mb-2">
                        Date of Birth
                    </label>
                    <div className="relative">
                        <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            className={`w-full pl-12 pr-4 py-3 bg-gray-50 text-gray-800 rounded-lg border ${
                                error ? 'border-red-500' : 'border-gray-400'
                            } focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300`}
                            style={{
                                appearance: 'none', // Remove default date picker arrow in some browsers
                                WebkitAppearance: 'none', // For Safari
                            }}
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                </div>

                {/* Company Website Field */}
                <div className="relative">
                    <label className="block text-gray-700 font-medium mb-2">
                        Company Website
                    </label>
                    <div className="relative">
                        <FaLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <input
                            type="url"
                            name="companyWebsite"
                            placeholder="https://example.com"
                            value={formData.companyWebsite}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading || error}
                    className={`w-full py-2 text-white font-bold rounded-lg focus:ring-2 transition-all duration-200 ${
                        isLoading || error
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:scale-105'
                    }`}
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
                    ) : (
                        'Submit and Verify Your Email'
                    )}
                </button>
            </form>
        </div>
    );
};

export default OptionalDetailsRecruiterForm;
