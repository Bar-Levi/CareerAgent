import React, { useState } from 'react';
import { FaCalendarAlt, FaLink } from 'react-icons/fa';

const OptionalDetailsRecruiterForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        dateOfBirth: '',
        companyWebsite: '',
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'dateOfBirth') {
            const selectedDate = new Date(value);
            const today = new Date();
            const age = today.getFullYear() - selectedDate.getFullYear();
            const isUnder18 = age < 18 || (age === 18 && today < new Date(selectedDate.setFullYear(today.getFullYear())));

            if (isUnder18) {
                setError('You must be at least 18 years old to register.');
            } else {
                setError(null);
            }
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (error) return;
        setIsLoading(true);
        try {
            await onSubmit(formData); // Pass formData to the parent
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col space-y-6 w-full max-w-md">
            <h2 className="text-3xl font-bold text-gray-800 text-center font-orbitron">
                Add Optional Details
                <p className="text-gray-600 text-sm mt-1">Provide additional information to enhance your profile.</p>
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Date of Birth Field */}
                <div className="relative">
                    <label className="block text-gray-700 font-medium mb-2">Date of Birth</label>
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

                {/* Company Website Field */}
                <div className="relative">
                    <label className="block text-gray-700 font-medium mb-2">Company Website</label>
                    <input
                        type="url"
                        name="companyWebsite"
                        placeholder="https://example.com"
                        value={formData.companyWebsite}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                    />
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
