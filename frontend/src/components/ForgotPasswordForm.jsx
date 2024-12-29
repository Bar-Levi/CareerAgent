import React from 'react';

const ForgotPasswordForm = ({ onSubmit, onChange, formData, loading }) => (
    <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Password Recovery</h3>
        <p className="text-sm text-gray-600 mb-4">
            Enter your email, and we will send your password reset instructions.
        </p>
        <form onSubmit={onSubmit} className="space-y-2">
            <input
                name="forgot_password_email"
                type="email"
                placeholder="Your registered email"
                value={formData.forgot_password_email}
                onChange={onChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                required
            />
            <input
                name="forgot_password_PIN"
                type="password"
                placeholder="Enter your secret PIN"
                value={formData.forgot_password_PIN}
                onChange={onChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                required
            />
            <button
                type="submit"
                data-cy="forgot-password-submit"
                className="w-full py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-lg hover:scale-105 focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                disabled={loading}
            >
                {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
        </form>
    </div>
);

export default ForgotPasswordForm;
