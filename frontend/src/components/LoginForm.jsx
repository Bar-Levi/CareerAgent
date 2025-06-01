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
                    // Modern 2025 Swal for blocked accounts
                    
                    // Inject required CSS for the modern design before showing the dialog
                    const styleId = 'swal-modern-styles';
                    if (document.getElementById(styleId)) {
                        document.getElementById(styleId).remove();
                    }
                    
                    const styleSheet = document.createElement('style');
                    styleSheet.id = styleId;
                    styleSheet.innerHTML = `
                        .swal-modern-container {
                            /* Remove perspective property */
                        }
                        .swal-modern-popup {
                            border-radius: 20px;
                            padding: 0;
                            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                            overflow: hidden;
                            transition: all 0.3s ease;
                        }
                        .swal-modern-show {
                            transform: scale(1);
                        }
                        .swal-modern-hide {
                            transform: scale(0.95);
                        }
                        .swal-modern-title {
                            padding: 1.75rem 1.75rem 0;
                            font-weight: 800;
                        }
                        .text-gradient {
                            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                            -webkit-background-clip: text;
                            background-clip: text;
                            -webkit-text-fill-color: transparent;
                            font-weight: 800;
                        }
                        .text-gradient-error {
                            background: linear-gradient(135deg, #ef4444, #b91c1c);
                            -webkit-background-clip: text;
                            background-clip: text;
                            -webkit-text-fill-color: transparent;
                            font-weight: 800;
                        }
                        .swal-blocked-container {
                            padding: 1rem 1.75rem 1.75rem;
                        }
                        .swal-icon-container {
                            margin: 2rem auto;
                            width: 90px;
                            height: 90px;
                            background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(139, 92, 246, 0.08));
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            position: relative;
                        }
                        .swal-icon-container:before {
                            content: '';
                            position: absolute;
                            inset: 0;
                            border-radius: 50%;
                            padding: 3px;
                            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                            -webkit-mask-composite: xor;
                            mask-composite: exclude;
                        }
                        .swal-icon-container i {
                            font-size: 2.75rem;
                            color: #6366f1;
                            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                            -webkit-background-clip: text;
                            background-clip: text;
                            -webkit-text-fill-color: transparent;
                            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                        }
                        .complete {
                            animation: vibrate 0.3s cubic-bezier(0.36, 0.07, 0.19, 0.97);
                            transform: scale(1.2);
                        }
                        @keyframes vibrate {
                            0%, 100% { transform: scale(1.2) rotate(0); }
                            20% { transform: scale(1.3) rotate(-3deg); }
                            40% { transform: scale(1.3) rotate(3deg); }
                            60% { transform: scale(1.3) rotate(-2deg); }
                            80% { transform: scale(1.3) rotate(2deg); }
                        }
                        .swal-message {
                            color: #64748b;
                            font-size: 1.05rem;
                            text-align: center;
                            margin-bottom: 2rem;
                            line-height: 1.5;
                        }
                        .swal-pin-input-container {
                            margin-top: 1.25rem;
                        }
                        .swal-pin-input-container label {
                            display: block;
                            font-size: 0.95rem;
                            color: #64748b;
                            margin-bottom: 0.75rem;
                            font-weight: 500;
                        }
                        .pin-input-wrapper {
                            position: relative;
                        }
                        .pin-input {
                            width: 100%;
                            padding: 1rem 1.25rem;
                            border-radius: 16px;
                            border: 2px solid #e2e8f0;
                            background-color: #f8fafc;
                            font-size: 1.2rem;
                            letter-spacing: 4px;
                            text-align: center;
                            transition: all 0.2s;
                            caret-color: #6366f1;
                        }
                        .pin-input:focus {
                            border-color: #818cf8;
                            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
                            outline: none;
                        }
                        #toggle-pin-visibility {
                            position: absolute;
                            right: 16px;
                            top: 50%;
                            transform: translateY(-50%);
                            background: transparent;
                            border: none;
                            color: #94a3b8;
                            cursor: pointer;
                            transition: color 0.2s;
                            width: 40px;
                            height: 40px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            border-radius: 50%;
                        }
                        #toggle-pin-visibility:hover {
                            color: #64748b;
                            background-color: rgba(100, 116, 139, 0.1);
                        }
                        .pin-digit-display {
                            display: flex;
                            justify-content: space-between;
                            margin-top: 1rem;
                            gap: 8px;
                        }
                        .pin-digit-display span {
                            height: 12px;
                            width: 12px;
                            border-radius: 50%;
                            background-color: #e2e8f0;
                            position: relative;
                            flex: 1;
                            transition: background-color 0.3s;
                            overflow: hidden;
                        }
                        .pin-digit-display span:before {
                            content: '';
                            position: absolute;
                            inset: 0;
                            border-radius: 50%;
                            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                            transform: scale(0);
                            transition: transform 0.15s ease;
                        }
                        .pin-digit-display span.filled:before {
                            transform: scale(1);
                        }
                        .swal-modern-html-container {
                            margin: 0;
                            padding: 0;
                        }
                        .swal-modern-confirm-btn {
                            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                            border-radius: 14px;
                            font-weight: 600;
                            padding: 14px 28px;
                            border: none;
                            display: inline-flex;
                            align-items: center;
                            justify-content: center;
                            gap: 8px;
                            position: relative;
                            overflow: hidden;
                            transition: transform 0.3s, box-shadow 0.3s;
                        }
                        .swal-modern-confirm-btn:hover {
                            background: linear-gradient(135deg, #2563eb, #7c3aed);
                            transform: translateY(-2px);
                            box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);
                        }
                        .swal-modern-confirm-btn:after {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background: linear-gradient(rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0));
                            opacity: 0;
                            transition: opacity 0.3s;
                        }
                        .swal-modern-confirm-btn:hover:after {
                            opacity: 1;
                        }
                        .swal-modern-confirm-btn:focus {
                            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);
                        }
                        .swal-modern-cancel-btn {
                            background: #f1f5f9;
                            color: #475569;
                            border-radius: 14px;
                            font-weight: 600;
                            padding: 14px 28px;
                            border: none;
                            display: inline-flex;
                            align-items: center;
                            justify-content: center;
                            gap: 8px;
                            transition: background-color 0.3s, transform 0.3s;
                        }
                        .swal-modern-cancel-btn:hover {
                            background: #e2e8f0;
                            transform: translateY(-2px);
                        }
                        .swal-validation-message {
                            background-color: rgba(239, 68, 68, 0.05) !important;
                            color: #ef4444;
                            border-radius: 12px;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            padding: 12px 16px !important;
                            margin: 1.25rem 0 !important;
                            border-left: 4px solid #ef4444;
                        }
                    `;
                    document.head.appendChild(styleSheet);
                    
                    const { value: pin } = await Swal.fire({
                        title: '<span class="text-gradient">Account Locked</span>',
                        html: `
                            <div class="swal-blocked-container">
                                <div class="swal-icon-container">
                                    <i class="fas fa-shield-halved"></i>
                                </div>
                                <p class="swal-message">Your account has been temporarily locked due to multiple failed login attempts.</p>
                                <div class="swal-pin-input-container">
                                    <label for="pin-input">Enter your 6-digit security PIN</label>
                                    <div class="pin-input-wrapper">
                                        <input id="pin-input" type="password" class="pin-input" placeholder="• • • • • •" maxlength="6">
                                        <button id="toggle-pin-visibility" type="button">
                                            <i class="fas fa-eye-slash"></i>
                                        </button>
                                    </div>
                                    <div class="pin-digit-display">
                                        <span></span><span></span><span></span>
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            </div>
                        `,
                        showCancelButton: true,
                        confirmButtonText: '<i class="fas fa-unlock-alt"></i> Unlock Account',
                        cancelButtonText: '<i class="fas fa-times"></i> Cancel',
                        customClass: {
                            container: 'swal-modern-container',
                            popup: 'swal-modern-popup',
                            title: 'swal-modern-title',
                            htmlContainer: 'swal-modern-html-container',
                            confirmButton: 'swal-modern-confirm-btn',
                            cancelButton: 'swal-modern-cancel-btn'
                        },
                        backdrop: `
                            rgba(15, 23, 42, 0.85)
                            url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z' fill='%239C92AC' fill-opacity='0.1'/%3E%3C/svg%3E")
                            no-repeat
                        `,
                        showClass: {
                            popup: 'swal-modern-show'
                        },
                        hideClass: {
                            popup: 'swal-modern-hide'
                        },
                        didOpen: () => {
                            // Add modern interactive elements
                            const pinInput = document.getElementById('pin-input');
                            const toggleBtn = document.getElementById('toggle-pin-visibility');
                            const digitDisplay = document.querySelector('.pin-digit-display');
                            const digits = digitDisplay.querySelectorAll('span');
                            
                            toggleBtn.addEventListener('click', () => {
                                const type = pinInput.getAttribute('type') === 'password' ? 'text' : 'password';
                                pinInput.setAttribute('type', type);
                                toggleBtn.innerHTML = type === 'text' ? 
                                    '<i class="fas fa-eye"></i>' : 
                                    '<i class="fas fa-eye-slash"></i>';
                            });
                            
                            pinInput.addEventListener('input', (e) => {
                                const value = e.target.value;
                                const length = value.length;
                                
                                // Update digit display with immediate fill
                                Array.from(digits).forEach((digit, index) => {
                                    if (index < length) {
                                        digit.classList.add('filled');
                                        digit.style.setProperty('--fill-delay', '0s'); // Remove delay
                                    } else {
                                        digit.classList.remove('filled');
                                    }
                                });
                                
                                // Add vibration effect to icon on complete
                                const iconElement = document.querySelector('.swal-icon-container i');
                                if (length === 6) {
                                    iconElement.classList.add('complete');
                                    // Add haptic feedback simulation
                                    if (window.navigator && window.navigator.vibrate) {
                                        window.navigator.vibrate(100);
                                    }
                                } else {
                                    iconElement.classList.remove('complete');
                                }
                            });
                        },
                        preConfirm: () => {
                            const pin = document.getElementById('pin-input').value;
                            if (!pin || pin.length !== 6) {
                                Swal.showValidationMessage(`
                                    <i class="fas fa-exclamation-circle"></i>
                                    Please enter your complete 6-digit PIN
                                `);
                                return false;
                            }
                            return pin;
                        }
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
                                icon: 'success',
                                title: '<span class="text-gradient">Account Unlocked</span>',
                                html: '<p class="swal-message">Your account has been successfully unlocked. You may now login.</p>',
                                confirmButtonText: '<i class="fas fa-check-circle"></i> Continue',
                                customClass: {
                                    popup: 'swal-modern-popup',
                                    title: 'swal-modern-title',
                                    htmlContainer: 'swal-modern-html-container',
                                    confirmButton: 'swal-modern-confirm-btn'
                                },
                                showClass: {
                                    popup: 'swal-modern-show'
                                },
                                hideClass: {
                                    popup: 'swal-modern-hide'
                                }
                            });
                        } else {
                            await Swal.fire({
                                icon: 'error',
                                title: '<span class="text-gradient-error">Verification Failed</span>',
                                html: `<p class="swal-message">${resetData.message}</p>`,
                                confirmButtonText: '<i class="fas fa-redo"></i> Try Again',
                                customClass: {
                                    popup: 'swal-modern-popup',
                                    title: 'swal-modern-title',
                                    htmlContainer: 'swal-modern-html-container',
                                    confirmButton: 'swal-modern-confirm-btn'
                                },
                                showClass: {
                                    popup: 'swal-modern-show'
                                },
                                hideClass: {
                                    popup: 'swal-modern-hide'
                                }
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