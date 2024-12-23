import React, { useState } from 'react';

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
            if (age < 18) {
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
        await onSubmit(formData); // Pass formData to the parent
        setIsLoading(false);
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
                        className={`w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border ${
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
                        className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading || error}
                    className={`w-full py-2 text-white font-bold rounded-lg focus:ring-2 transition-all duration-200 ${
                        isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:scale-105'
                    }`}
                >
                    {isLoading ? 'Submitting...' : 'Submit and Verify Your Email'}
                </button>
            </form>
        </div>
    );
};

export default OptionalDetailsRecruiterForm;
