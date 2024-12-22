import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Notification from './Notification';

const RegistrationForm = ({ toggleForm, setUserType }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'jobseeker',
    });
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const navigate = useNavigate();
    const [notification, setNotification] = useState(null);

    // Show notification
    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === 'password') {
            calculatePasswordStrength(value);
        }
    };

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 1; // Length
        if (/[A-Z]/.test(password)) strength += 1; // Uppercase
        if (/[a-z]/.test(password)) strength += 1; // Lowercase
        if (/[0-9]/.test(password)) strength += 1; // Numbers
        if (/[^A-Za-z0-9]/.test(password)) strength += 1; // Special characters
        setPasswordStrength(strength);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            showNotification('error', 'Passwords do not match.');
            return;
        }
        if (passwordStrength < 4 || formData.password.length < 8) {
            showNotification('error', <>
                Create a strong password by including:
                <br />
                - At least 1 uppercase letter
                <br />
                - At least 1 lowercase letter
                <br />
                - At least 1 number
                <br />
                - At least 1 special character
                <br />
                - A minimum of 8 characters
            </>
            );
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();

            if (response.ok) {
                showNotification('success', 'Your account has been registered successfully!');
                navigate('/verify', { state: { email: formData.email, verificationCodeSentAt: new Date() } });
            } else {
                showNotification('error', data.message);
            }
        } catch (err) {
            showNotification('error', 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const getStrengthColor = () => {
        switch (passwordStrength) {
            case 1:
                return 'bg-red-500';
            case 2:
                return 'bg-orange-500';
            case 3:
                return 'bg-yellow-500';
            case 4:
                return 'bg-green-400';
            case 5:
                return 'bg-green-600';
            default:
                return 'bg-gray-300';
        }
    };

    const getStrengthText = () => {
        switch (passwordStrength) {
            case 1:
                return 'Very Weak';
            case 2:
                return 'Weak';
            case 3:
                return 'Moderate';
            case 4:
                return 'Strong';
            case 5:
                return 'Very Strong';
            default:
                return 'Enter a password';
        }
    };

    return (
        <div className="flex flex-col space-y-6 w-full bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 max-w-md">
            {/* Display notification */}
            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}
            <h2 className="text-3xl font-bold text-gray-800 text-center font-orbitron">
                Welcome,
                <p className="text-gray-600">
                    {formData.role === 'jobseeker' ? 'Land Your Dream Job!' : 'Find Top Talents!'}
                </p>
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name *"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email *"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                    required
                />
                <div className="relative">
                    <input
                        type={isPasswordVisible ? 'text' : 'password'}
                        name="password"
                        placeholder="Password *"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                        required
                    />
                    <span
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 text-xl"
                        onClick={() => setIsPasswordVisible((prev) => !prev)}
                    >
                        <i className={`fa ${isPasswordVisible ? 'fa-eye' : 'fa-eye-slash'}`} />
                    </span>
                </div>
                {/* Password Strength Meter */}
                <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{getStrengthText()}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded">
                        <div
                            className={`h-2 rounded transition-all duration-300 ${getStrengthColor()}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        />
                    </div>
                </div>
                <div className="relative">
                    <input
                        type={isConfirmPasswordVisible ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Confirm Password *"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                        required
                    />
                    <span
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 text-xl"
                        onClick={() => setIsConfirmPasswordVisible((prev) => !prev)}
                    >
                        <i className={`fa ${isConfirmPasswordVisible ? 'fa-eye' : 'fa-eye-slash'}`} />
                    </span>
                </div>
                <select
                    name="role"
                    value={formData.role}
                    onChange={(e) => {
                        handleChange(e);
                        setUserType(e.target.value);
                    }}
                    className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                >
                    <option value="jobseeker">Job Seeker</option>
                    <option value="recruiter">Recruiter</option>
                </select>
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-2 text-white font-bold rounded-lg focus:ring-2 transition-all duration-200 ${
                        isLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:scale-105'
                    }`}
                >
                    {isLoading ? 'Loading...' : 'Register'}
                </button>
            </form>
            <button onClick={toggleForm} className="text-gray-600 hover:underline text-center">
                Already have an account? Log in
            </button>
        </div>
    );
};

export default RegistrationForm;
