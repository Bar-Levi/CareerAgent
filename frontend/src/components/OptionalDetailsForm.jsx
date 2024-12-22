import React, { useState } from 'react';
import { FaPhoneAlt, FaGithub, FaLinkedin } from 'react-icons/fa';

const OptionalDetailsForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        phone: '',
        cv: null,
        profilePic: null,
        githubUrl: '',
        linkedinUrl: '',
    });

    const [isLoading, setIsLoading] = useState(false); // Loading state for button

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFormData({ ...formData, [name]: files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Set loading to true when the request starts
        try {
            await onSubmit(formData); // Submit form data via the parent handler
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

                {/* CV Upload */}
                <div className="relative">
                    <label className="text-gray-700 font-medium">Upload CV (PDF only)</label>
                    <div className="flex items-center space-x-4">
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
                    </div>
                </div>

                {/* Profile Picture Upload */}
                <div className="relative">
                    <label className="text-gray-700 font-medium">Upload Profile Picture</label>
                    <div className="flex items-center space-x-4">
                        <label
                            htmlFor="profilePic"
                            className="cursor-pointer w-full py-3 text-center bg-gray-100 border border-gray-400 text-gray-800 font-medium rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                        >
                            {formData.profilePic ? formData.profilePic.name : 'Choose File'}
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
                    className={`w-full py-2 text-white font-bold rounded-lg focus:ring-2 focus:ring-gray-500 transition-all duration-200 ${
                        isLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:scale-105'
                    }`}
                    disabled={isLoading}
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

export default OptionalDetailsForm;
