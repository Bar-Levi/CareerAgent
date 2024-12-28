import React, { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.css';
import { useNavigate } from 'react-router-dom';

const LoginForm = ({ toggleForm, setUserType }) => {
    const [formData, setFormData] = useState({ email: '', password: '', role: 'jobseeker' });
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState(''); // Separate state for forgot password form
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [loading, setLoading] = useState(false); // Login form loading state
    const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false); // Forgot password form loading state
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleForgotPasswordEmailChange = (e) => {
        setForgotPasswordEmail(e.target.value); // Update forgot password email only
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
    
                if (response.status === 403) { // User isn't verified
                    localStorage.setItem('token', errorData.token); // Save the new token
                    navigate('/dashboard', {
                        state: {
                            email: formData.email,
                            role: formData.role,
                        },
                    });
                } else if (response.status === 405) {
                    setMessage({
                        type: 'error',
                        text: errorData.message,
                    });
                } else if (response.status === 401) {
                    setMessage({
                        type: 'error',
                        text: errorData.message || 'Invalid login credentials.',
                    });
                } else {
                    throw new Error(errorData.message || 'An error occurred.');
                }
    
                // Clear the message after 2.5 seconds
                setTimeout(() => setMessage(null), 2500);
                return; // Stop further execution for error cases
            }
    
            // Success case: Get the token and navigate to the dashboard
            const { token } = await response.json();
            localStorage.setItem('token', token);
    
            navigate('/dashboard', {
                state: {
                    email: formData.email,
                    role: formData.role,
                },
            });
        } catch (error) {
            // Handle general errors
            setMessage({
                type: 'error',
                text: error.message,
            });
    
            // Clear the message after 2.5 seconds
            setTimeout(() => setMessage(null), 2500);
        } finally {
            // Stop loading spinner or perform cleanup
            setLoading(false);
        }
    };


    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        setForgotPasswordLoading(true); // Set separate loading state for forgot password form
        setMessage(null);

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/request-password-reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: forgotPasswordEmail }), // Use the separate forgot password email state
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'An error occurred.');
            }

            const data = await response.json();
            setMessage({ type: 'success', text: data.message });
            setTimeout(() => setMessage(null), 2500);
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
            setTimeout(() => setMessage(null), 2500);
        } finally {
            setForgotPasswordLoading(false); // Reset forgot password loading state
            setShowForgotPassword(false);
        }
    };

    return (
        <div className="flex flex-col space-y-6 w-full bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 max-w-md transform hover:scale-105 transition-transform duration-500 animate-slide-in">
            <h2 className="text-3xl font-bold text-gray-800 text-center font-orbitron">
                Welcome Back!
                <p className="text-gray-600 text-lg">Please log in to continue</p>
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 text-2xl"
                        onClick={() => setIsPasswordVisible((prev) => !prev)}
                    >
                        {isPasswordVisible ? (
                            <i className="fa fa-eye"></i>
                        ) : (
                            <i className="fa fa-eye-slash"></i>
                        )}
                    </span>
                </div>
                <select
                    name="role"
                    value={formData.role}
                    onChange={(e) => {
                        handleChange(e);
                        setUserType(e.target.value);
                    }}
                    className="w-full px-4 py-3 cursor-pointer bg-gray-50 text-gray-800 rounded-lg border border-gray-400 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                >
                    <option value="jobseeker">Job Seeker</option>
                    <option value="recruiter">Recruiter</option>
                </select>
                <button
                    type="submit"
                    className="w-full py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-lg hover:scale-105 focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                    disabled={loading}
                >
                    {loading ? 'Logging in...' : 'Log In'}
                </button>
            </form>

            {message && (
                <div
                    className={`mt-4 p-4 rounded-lg text-sm ${
                        message.type === 'success'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                    } flex justify-center items-center text-center`}
                >
                    {message.text}
                </div>
            )}

            <div className="text-center">
                <button
                    onClick={() => setShowForgotPassword(!showForgotPassword)}
                    className="text-gray-600 hover:underline"
                >
                    Forgot Password? Click here
                </button>
            </div>

            {showForgotPassword && (
                <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Password Recovery</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Enter your email, and we will send your password reset instructions.
                    </p>
                    <form onSubmit={handleForgotPasswordSubmit} className="space-y-2">
                        <input
                            type="email"
                            placeholder="Your registered email"
                            value={forgotPasswordEmail} // Bind to forgot password email state
                            onChange={handleForgotPasswordEmailChange} // Use the separate handler
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                            required
                        />
                        <button
                            type="submit"
                            className="w-full py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-lg hover:scale-105 focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                            disabled={forgotPasswordLoading} // Use the forgot password loading state
                        >
                            {forgotPasswordLoading ? 'Sending...' : 'Send Instructions'}
                        </button>
                    </form>
                </div>
            )}

            <button
                onClick={toggleForm}
                className="text-gray-600 hover:underline text-center"
            >
                Don't have an account? Register
            </button>
        </div>
    );
};

export default LoginForm;
