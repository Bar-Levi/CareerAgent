import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const ResetLoginAttempts = () => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const resetAttempts = async () => {
            const token = searchParams.get('token'); // Get token from URL
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

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded shadow-md">
                {loading ? (
                    <p className="text-gray-700">Processing your request...</p>
                ) : (
                    <p className={`text-lg ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ResetLoginAttempts;
