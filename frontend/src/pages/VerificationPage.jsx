import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';

const VerificationPage = () => {
    const { state } = useLocation();
    const [code, setCode] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [isResendDisabled, setIsResendDisabled] = useState(false);
    const [notification, setNotification] = useState(null);
    const navigate = useNavigate();


    const email = state?.email || '';

    // Timer logic for enabling the resend button
    useEffect(() => {
        if (countdown > 0) {
            const timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else {
            setIsResendDisabled(false);
        }
    }, [countdown]);

    // Show notification
    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });
            const data = await response.json();

            if (response.ok) {
                showNotification('success', 'Your account has been verified successfully!');
                navigate('/dashboard');
            } else {
                showNotification('error', data.message);
            }
        } catch (err) {
            showNotification('error', 'An error occurred. Please try again.');
        }
    };

    const handleResend = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/resend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();

            if (response.ok) {
                showNotification('success', 'A new verification code has been sent to your email.');
                setIsResendDisabled(true);
                setCountdown(60); // Start 1-minute countdown
            } else {
                showNotification('error', data.message);
            }
        } catch (err) {
            showNotification('error', 'Unable to resend the code. Please try again.');
        }
    };

    return (
        <div
            className="min-h-screen flex justify-center items-center relative overflow-hidden transition-transform duration-500 animate-slide-in"
            style={{
                background: 'linear-gradient(135deg, #ffffff, #a0a0a0, #999999, #ffffff, #a0a0a0, #999999)',
                backgroundSize: 'cover', // Ensures the gradient covers the entire viewport
            }}
            >    {/* Floating Decorative Elements */}
            <div className="absolute top-10 left-1/4 w-40 h-40 bg-gradient-to-r from-gray-300 via-gray-100 to-gray-200 blur-3xl opacity-20 animate-pulse" />
            <div className="absolute bottom-20 right-1/4 w-48 h-48 bg-gradient-to-t from-gray-400 via-gray-200 to-gray-100 blur-3xl opacity-20 animate-float" />
            {/* Display notification */}
            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}

            {/* Form Card */}
            <form
                onSubmit={handleSubmit}
                className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 w-full max-w-md transform hover:scale-105 transition-transform duration-500 animate-slide-in"
            >
                <h2 className="text-4xl font-extrabold text-center mb-6 text-gray-700 tracking-widest animate-slide-down">
                    Verify Your Account
                </h2>

                {/* Verification Code Field */}
                <div className="mb-6">
                    <label className="block text-gray-600 font-medium mb-2 animate-fade-in">
                        Verification Code <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Enter verification code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-gray-400/60 transition-all duration-300 hover:bg-gray-50 hover:shadow-md"
                        required
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full py-3 bg-gray-800 text-white rounded-lg font-semibold tracking-wide hover:bg-gray-700 active:scale-95 transition-all duration-300 animate-fade-in"
                >
                    Verify
                </button>

                {/* Resend Code */}
                <div className="mt-8 text-center animate-fade-in-fast">
                    <p className="text-gray-600">
                        Didn't receive the code?{' '}
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={isResendDisabled}
                            className={`text-gray-700 font-semibold ${
                                isResendDisabled
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:underline hover:text-gray-900 transition-all duration-300'
                            }`}
                        >
                            Resend
                        </button>
                    </p>

                    {countdown != 0 && (
                        <p className="text-gray-500 text-sm mt-3 animate-pulse">
                            Please wait {countdown} seconds
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
};

export default VerificationPage;
