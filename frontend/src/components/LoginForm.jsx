import React, { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.css';
import { useNavigate } from 'react-router-dom';
import ForgotPasswordForm from './ForgotPasswordForm';
import Swal from 'sweetalert2';
import CryptoJS from 'crypto-js';

const LoginForm = ({ toggleForm, setUserType }) => {
    const [formData, setFormData] = useState({ email: '', password: '', role: 'JobSeeker' });
    const [forgotPasswordFormData, setForgotPasswordFormData] = useState({ forgot_password_email: '', forgot_password_PIN: '' });
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleForgotPasswordInputChange = (e) => {
        const { name, value } = e.target;
        setForgotPasswordFormData({ ...forgotPasswordFormData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            // Encrypt the password before sending it
            const encryptedPassword = CryptoJS.AES.encrypt(formData.password, process.env.REACT_APP_SECRET_KEY).toString();
            const payload = { ...formData, password: encryptedPassword };

            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();

                if (response.status === 403) {
                    localStorage.setItem('token', errorData.token);
                    navigate('/dashboard', {
                        state: {
                            email: formData.email,
                            role: formData.role,
                            token: errorData.token,
                            user: errorData.user,
                            refreshToken: 0,
                        },
                    });
                } else if (response.status === 405) {
                    // Show the alert asking for the secret PIN
                    const { value: pin } = await Swal.fire({
                        title: 'Account Blocked',
                        text: `Please enter your secret PIN to reset your login attempts.`,
                        input: 'password',
                        inputPlaceholder: 'Enter your secret PIN',
                        inputAttributes: {
                            maxlength: 6,
                            autocapitalize: 'off',
                            autocorrect: 'off',
                        },
                        showCancelButton: true,
                        confirmButtonText: 'Submit',
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        preConfirm: (pin) => {
                            if (!pin) {
                                Swal.showValidationMessage('Please enter your secret PIN');
                            }
                            return pin;
                        },
                    });
                
                    if (pin) {
                        // Encrypt the PIN before sending it
                        const encryptedPin = CryptoJS.AES.encrypt(pin, process.env.REACT_APP_SECRET_KEY).toString();
                        const resetResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/reset-login-attempts`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ pin: encryptedPin, email: formData.email }),
                        });
                
                        const resetData = await resetResponse.json();
                
                        if (resetResponse.ok) {
                            await Swal.fire({
                                title: 'Success!',
                                text: resetData.message,
                                icon: 'success',
                                confirmButtonColor: '#3085d6',
                            });
                        } else {
                            await Swal.fire({
                                title: 'Error',
                                text: resetData.message,
                                icon: 'error',
                                confirmButtonColor: '#d33',
                            });
                        }
                    }
                }
                else if (response.status === 401) {
                    setMessage({
                        type: 'error',
                        text: errorData.message || 'Invalid login credentials.',
                    });
                } else {
                    throw new Error(errorData.message || 'An error occurred.');
                }

                const timeout = response.status === 405 ? 10000 : 2500;
                setTimeout(() => setMessage(null), timeout);
                return;
            }

            const { token, user } = await response.json();
            localStorage.setItem('token', token);
            
            navigate('/dashboard', {
                state: {
                    email: formData.email,
                    role: formData.role,
                    token,
                    user,
                    refreshToken: 0
                },
            });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.message,
            });
            setTimeout(() => setMessage(null), 2500);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        setForgotPasswordLoading(true);
        setMessage(null);

        try {
            // Encrypt the forgot password PIN before sending it
            const encryptedForgotPasswordPIN = CryptoJS.AES.encrypt(forgotPasswordFormData.forgot_password_PIN, process.env.REACT_APP_SECRET_KEY).toString();
            const payload = { 
                ...forgotPasswordFormData, 
                forgot_password_PIN: encryptedForgotPasswordPIN 
            };

            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/request-password-reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'An error occurred.');
            }

            const data = await response.json();
            setMessage({ type: 'success', text: data.message });
            setTimeout(() => setMessage(null), 10000);
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
            setTimeout(() => setMessage(null), 2500);
        } finally {
            setForgotPasswordLoading(false);
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
                    id="login-email"
                    data-cy="login-email"
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
                        data-cy="login-password"
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
                    data-cy="login-role"
                    value={formData.role}
                    onChange={(e) => {
                        handleChange(e);
                        setUserType(e.target.value);
                    }}
                    className="w-full px-4 py-3 cursor-pointer bg-gray-50 text-gray-800 rounded-lg border border-gray-400 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                >
                    <option value="JobSeeker">Job Candidate</option>
                    <option value="Recruiter">Recruiter</option>
                </select>
                <button
                    data-cy="login-submit"
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
                    data-cy="login-forgot-password-toggle"
                    className="text-gray-600 hover:underline"
                >
                    Forgot Password? Click here
                </button>
            </div>

            {showForgotPassword && <ForgotPasswordForm
                formData={forgotPasswordFormData}
                onSubmit={handleForgotPasswordSubmit}
                onChange={handleForgotPasswordInputChange}
                loading={forgotPasswordLoading}
                />}

            <button
                onClick={toggleForm}
                data-cy="login-toggle-register"
                className="text-gray-600 hover:underline text-center"
            >
                Don't have an account? Register
            </button>
        </div>
    );
};

export default LoginForm;
