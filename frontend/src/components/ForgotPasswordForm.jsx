import React from 'react';

const ForgotPasswordForm = () => (
    <div className="max-w-md mx-auto bg-white shadow-md p-6 rounded">
        <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
        <form>
            <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-2 border rounded mb-4"
            />
            <button className="w-full bg-blue-500 text-white py-2 rounded">
                Send Reset Link
            </button>
        </form>
    </div>
);

export default ForgotPasswordForm;
