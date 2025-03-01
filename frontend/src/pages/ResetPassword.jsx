import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';
import Botpress from '../botpress/Botpress';
import CryptoJS from 'crypto-js';

const ResetPassword = () => {
    const [formData, setFormData] = useState({ token: '', newPassword: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const navigate = useNavigate();

    const showNotification = (type, message) => {
        setMessage({ type, message });
        setTimeout(() => setMessage(null), 4000);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === 'newPassword') {
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
        if (passwordStrength < 4 || formData.newPassword.length < 8) {
            showNotification(
                'error',
                <>
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

        setLoading(true);
        setMessage(null);

        try {
            // Encrypt the new password before sending it to the backend
            const encryptedNewPassword = CryptoJS.AES.encrypt(
                formData.newPassword,
                process.env.REACT_APP_SECRET_KEY
            ).toString();

            const payload = { ...formData, newPassword: encryptedNewPassword };

            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 405) {
                    showNotification('error', errorData.message);
                    return;
                }
                throw new Error(errorData.message || 'An error occurred.');
            }

            const data = await response.json();
            showNotification('success', `${data.message} Redirecting to login page...`);

            // Redirect to login page after 2 seconds
            setTimeout(() => {
                navigate('/authentication');
            }, 2000);
        } catch (error) {
            showNotification('error', error.message);
        } finally {
            setLoading(false);
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
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            {message && (
                <Notification
                    type={message.type}
                    message={message.message}
                    onClose={() => setMessage(null)}
                />
            )}
            <Botpress />
            <div className="flex flex-col space-y-6 w-full bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 max-w-md transform hover:scale-105 transition-transform duration-500 animate-slide-in">
                <h2 className="text-3xl font-bold text-gray-800 text-center font-orbitron">
                    Reset Password
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        name="token"
                        placeholder="Reset Token *"
                        value={formData.token}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                        required
                    />
                    <div className="relative">
                        <input
                            type={isPasswordVisible ? 'text' : 'password'}
                            name="newPassword"
                            placeholder="New Password *"
                            value={formData.newPassword}
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
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2 text-white font-bold rounded-lg focus:ring-2 transition-all duration-200 ${
                            loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:scale-105'
                        }`}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
