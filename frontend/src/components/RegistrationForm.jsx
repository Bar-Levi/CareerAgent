import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Notification from './Notification';
import fadeStaggerSquares from '../assets/fade-stagger-squares.svg'; // Import Loading SVG
import logo from '../assets/logo.png';


const RegistrationForm = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'jobseeker',
    });
    const [notification, setNotification] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleSubmit = async (e) => {
        setIsLoading(true);
        e.preventDefault();
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok) {
                showNotification('success', 'Successfully Registered! Verification code sent to your email.');
                setTimeout(() => {
                    setIsLoading(false);
                    navigate('/verify', { state: { email: formData.email } });
                }, 1000);
            } else {
                setIsLoading(false);
                showNotification('error', data.message);
            }
        } catch (err) {
            setIsLoading(false);
            showNotification('error', 'An error occurred. Please try again.');
        }
    };

    return (
        <div
            className="min-h-screen flex justify-center items-center bg-cover bg-center"
        style={
            {
                backgroundColor: '#dde2e8', // Set background color
                backgroundImage: `url(${logo})`, // Logo as the background
                backgroundSize: 'contain', // Scale the logo proportionally without cropping
                backgroundRepeat: 'no-repeat', // Prevent repeating
                backgroundPosition: 'center', // Center the logo
            }
        } // Background image placeholder
        >
            {/* Notification */}
            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}

            {/* Form Container */}
            <form
                onSubmit={handleSubmit}
                className="bg-white/20 backdrop-blur-md shadow-2xl rounded-3xl p-8 w-1/2 h-4/5 flex flex-col justify-center transform scale-95 hover:scale-100 transition-all duration-500"
            >
                <h2 className="text-4xl font-bold text-center mb-8 text-gray-800 tracking-wider drop-shadow-lg">
                    Create an Account
                </h2>

                <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="fullName"
                        placeholder="Enter your full name"
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-4 focus:ring-gray-500/50 transition-all duration-300 hover:bg-gray-50 hover:shadow-md"
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-4 focus:ring-gray-500/50 transition-all duration-300 hover:bg-gray-50 hover:shadow-md"
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">
                        Password <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        name="password"
                        placeholder="Create a password"
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-4 focus:ring-gray-500/50 transition-all duration-300 hover:bg-gray-50 hover:shadow-md"
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-8">
                    <label className="block text-gray-700 font-medium mb-2">
                        Role <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="role"
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-4 focus:ring-gray-500/50 transition-all duration-300 hover:bg-gray-50 hover:shadow-md"
                        onChange={handleChange}
                    >
                        <option value="jobseeker">Job Seeker</option>
                        <option value="recruiter">Recruiter</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="w-full py-3 bg-gray-800 text-white rounded-lg font-semibold tracking-wide hover:bg-gray-700 active:scale-95 transition-all duration-300 flex justify-center items-center"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <img
                            src={fadeStaggerSquares}
                            alt="Loading..."
                            className="w-6 h-6 animate-spin"
                        />
                    ) : (
                        'Register'
                    )}
                </button>
            </form>
        </div>
    );
};

export default RegistrationForm;
