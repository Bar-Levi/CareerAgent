import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const ResetLoginAttempts = () => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [countdown, setCountdown] = useState(7);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const resetAttempts = async () => {
            const token = searchParams.get('token');
            if (!token) {
                setMessage('Invalid or missing token.');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/reset-login-attempts`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'An error occurred.');
                }

                const data = await response.json();
                setMessage(data.message || 'Login attempts reset successfully.');
            } catch (error) {
                setMessage(error.message || 'An error occurred while resetting login attempts.');
            } finally {
                setLoading(false);
            }
        };

        resetAttempts();
    }, [searchParams]);

    useEffect(() => {
        if (!loading && countdown > 0) {
            const timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [loading, countdown]);

    useEffect(() => {
        if (countdown === 0) {
            window.close();
        }
    }, [countdown]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl max-w-md transform hover:scale-105 transition-transform duration-500 animate-fade-in">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                    Reset Login Attempts
                </h1>
                <p className="text-center text-gray-600 mb-4">
                    {loading
                        ? 'Processing your request...'
                        : message.includes('success')
                        ? <span className="text-green-500 font-bold">Your login attempts have been reset successfully!</span>
                        : <span className="text-red-500 font-bold">{message}</span>}
                </p>
                {loading ? (
                    <div className="flex items-center justify-center">
                        <div className="h-8 w-8 border-4 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 text-sm">
                        Closing this page in <span className="font-bold text-gray-700">{countdown}</span> seconds...
                    </p>
                )}
            </div>
        </div>
    );
};

export default ResetLoginAttempts;
