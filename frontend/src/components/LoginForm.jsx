import React, { useState, useEffect } from 'react';
import '@fortawesome/fontawesome-free/css/all.css';
import { useNavigate } from 'react-router-dom';
import ForgotPasswordForm from './ForgotPasswordForm';
import Swal from 'sweetalert2';
import CryptoJS from 'crypto-js';
import 'animate.css';

// Add custom animations
const customStyles = document.createElement('style');
customStyles.textContent = `
  @keyframes shake {
    0% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    50% { transform: translateX(5px); }
    75% { transform: translateX(-5px); }
    100% { transform: translateX(0); }
  }
  
  @keyframes ping-once {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
  }
  
  .animate-shake {
    animation: shake 0.4s linear;
  }
  
  .animate-ping-once {
    animation: ping-once 0.3s linear;
  }
`;
document.head.appendChild(customStyles);

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
                    // Modern animated account blocked modal for 2025
                    const result = await Swal.fire({
                        title: '<div class="flex items-center gap-3"><i class="fas fa-shield-alt text-red-500 animate-pulse"></i><span>Security Alert</span></div>',
                        html: `
                            <div class="space-y-6">
                                <div class="flex justify-center">
                                    <div class="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                                        <i class="fas fa-lock text-red-500 text-3xl animate-bounce"></i>
                                    </div>
                                </div>
                                
                                <div class="text-left space-y-3 mt-4">
                                    <p class="text-gray-700 font-medium">Your account has been temporarily locked due to multiple failed login attempts.</p>
                                    <p class="text-gray-600 text-sm">To protect your account, we've implemented this security measure.</p>
                                </div>
                                
                                <div class="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-3">
                                    <div class="bg-gradient-to-r from-red-500 to-orange-500 h-full account-unlock-progress"></div>
                                </div>

                                <div class="flex gap-4 mt-6 flex-col">
                                    <p class="text-gray-800 text-sm font-semibold">Enter your 6-digit security PIN to unlock:</p>
                                    <div id="pin-container" class="flex justify-center gap-2"></div>
                                    <div id="pin-error" class="text-red-500 text-xs hidden mt-2"></div>
                                </div>
                                
                                <div class="mt-4 text-xs text-gray-500 bg-blue-50 p-3 rounded-lg flex items-start">
                                    <i class="fas fa-info-circle text-blue-500 mt-0.5 mr-2"></i>
                                    <span>If you've forgotten your PIN, please contact support at <a href="mailto:careeragentpro@gmail.com" class="text-blue-600 hover:underline">support@careeragent.com</a></span>
                                </div>
                            </div>
                        `,
                        showConfirmButton: true,
                        showCancelButton: true,
                        confirmButtonText: 'Unlock Account',
                        cancelButtonText: 'Cancel',
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        allowOutsideClick: false,
                        backdrop: `
                            rgba(0,0,23,0.65)
                            url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M26.8 38.5c0-2.7 2.2-4.8 4.9-4.8h36.4c2.7 0 4.9 2.2 4.9 4.8v25.9c0 2.7-2.2 4.8-4.9 4.8H31.7c-2.7 0-4.9-2.2-4.9-4.8V38.5zm39.6 2.4c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5v6c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5v-6zm-6.5 18l3.2-3.2c.6-.6 1.5-.6 2.1 0 .6.6.6 1.5 0 2.1l-4.2 4.2c-.6.6-1.5.6-2.1 0l-4.2-4.2c-.6-.6-.6-1.5 0-2.1.6-.6 1.5-.6 2.1 0l3.1 3.2z' fill='rgba(255,255,255,.03)'/%3E%3C/svg%3E")
                            center center/60px no-repeat
                        `,
                        didOpen: () => {
                            // Create individual PIN input boxes
                            const pinContainer = document.getElementById('pin-container');
                            let pin = '';
                            const totalDigits = 6;
                            
                            // Clear existing content
                            pinContainer.innerHTML = '';
                            
                            // Create the digit inputs
                            for (let i = 0; i < totalDigits; i++) {
                                const input = document.createElement('div');
                                input.className = 'w-10 h-12 border-2 rounded-lg flex items-center justify-center text-xl font-bold cursor-pointer transition-all duration-300 border-gray-300 bg-white hover:border-blue-500 pin-digit';
                                input.dataset.position = i;
                                pinContainer.appendChild(input);
                            }
                            
                            // Create invisible input for actual typing
                            const hiddenInput = document.createElement('input');
                            hiddenInput.type = 'tel';
                            hiddenInput.className = 'opacity-0 absolute h-1 w-1 -z-10';
                            hiddenInput.maxLength = totalDigits;
                            hiddenInput.pattern = '[0-9]*';
                            hiddenInput.inputMode = 'numeric';
                            pinContainer.appendChild(hiddenInput);
                            
                            // Focus hidden input and make pin boxes clickable
                            hiddenInput.focus();
                            
                            document.querySelectorAll('.pin-digit').forEach(box => {
                                box.addEventListener('click', () => {
                                    hiddenInput.focus();
                                });
                            });
                            
                            // Handle key input
                            hiddenInput.addEventListener('input', (e) => {
                                pin = e.target.value.replace(/[^0-9]/g, '').slice(0, totalDigits);
                                e.target.value = pin;
                                
                                // Update the display
                                document.querySelectorAll('.pin-digit').forEach((box, index) => {
                                    if (index < pin.length) {
                                        box.textContent = '•';
                                        box.classList.add('border-blue-500', 'bg-blue-50', 'scale-110');
                                    } else {
                                        box.textContent = '';
                                        box.classList.remove('border-blue-500', 'bg-blue-50', 'scale-110');
                                    }
                                });
                                
                                // Hide error message when typing
                                document.getElementById('pin-error').classList.add('hidden');
                                
                                // Add typing animation
                                if (pin.length > 0) {
                                    const lastDigitBox = document.querySelector(`.pin-digit[data-position="${pin.length - 1}"]`);
                                    lastDigitBox.classList.add('animate-ping-once');
                                    setTimeout(() => lastDigitBox.classList.remove('animate-ping-once'), 300);
                                }
                            });
                            
                            // Add keydown for backspace and arrow keys
                            hiddenInput.addEventListener('keydown', (e) => {
                                if (e.key === 'Backspace' && pin.length > 0) {
                                    const boxToHighlight = document.querySelector(`.pin-digit[data-position="${pin.length - 1}"]`);
                                    boxToHighlight.classList.add('border-red-300', 'bg-red-50');
                                    setTimeout(() => boxToHighlight.classList.remove('border-red-300', 'bg-red-50'), 200);
                                }
                            });
                            
                            // Add progress bar animation
                            const progressBar = document.querySelector('.account-unlock-progress');
                            progressBar.style.width = '0%';
                            let progress = 0;
                            
                            const animateProgress = () => {
                                progress += 1;
                                progressBar.style.width = `${progress}%`;
                                
                                if (progress < 100) {
                                    requestAnimationFrame(animateProgress);
                                }
                            };
                            
                            requestAnimationFrame(animateProgress);
                            
                            // Keep focus on hidden input
                            document.addEventListener('click', function() {
                                hiddenInput.focus();
                            });
                        },
                        preConfirm: () => {
                            const pin = document.querySelector('#pin-container input').value;
                            const errorElement = document.getElementById('pin-error');
                            
                            if (!pin || pin.length !== 6 || !/^\d+$/.test(pin)) {
                                errorElement.textContent = 'Please enter a valid 6-digit PIN';
                                errorElement.classList.remove('hidden');
                                
                                // Shake animation on error
                                document.querySelectorAll('.pin-digit').forEach(box => {
                                    box.classList.add('animate-shake');
                                    setTimeout(() => box.classList.remove('animate-shake'), 500);
                                });
                                
                                return false;
                            }
                            
                            // Create a loading state while validating
                            Swal.showLoading();
                            document.querySelector('.swal2-confirm').disabled = true;
                            
                            return pin;
                        }
                    });
                
                    if (result.isConfirmed && result.value) {
                        const pin = result.value;
                        
                        // Show validation progress modal
                        Swal.fire({
                            title: 'Validating PIN',
                            html: `
                                <div class="flex flex-col items-center">
                                    <div class="w-16 h-16 relative">
                                        <div class="absolute inset-0 rounded-full border-4 border-blue-100 animate-ping opacity-75"></div>
                                        <div class="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                                    </div>
                                    <p class="mt-4 text-gray-600">Verifying credentials and unlocking your account...</p>
                                </div>
                            `,
                            showConfirmButton: false,
                            allowOutsideClick: false,
                            didOpen: () => {
                                Swal.showLoading();
                            }
                        });
                        
                        try {
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
                                    title: '<div class="flex items-center gap-3"><i class="fas fa-unlock-alt text-green-500"></i><span>Account Unlocked!</span></div>',
                                    html: `
                                        <div class="space-y-4">
                                            <div class="flex justify-center">
                                                <div class="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                                                    <div class="relative">
                                                        <i class="fas fa-shield-alt text-green-500 text-3xl"></i>
                                                        <i class="fas fa-check absolute bottom-0 right-0 text-white bg-green-500 rounded-full p-1 text-xs"></i>
                                                    </div>
                                                </div>
                                            </div>
                                            <p>${resetData.message}</p>
                                            <p class="text-sm text-gray-600 mt-2">You may now attempt to log in again.</p>
                                        </div>
                                    `,
                                    confirmButtonText: '<i class="fas fa-sign-in-alt mr-2"></i>Log In Again',
                                    confirmButtonColor: '#4CAF50',
                                    allowOutsideClick: false,
                                    showClass: {
                                        popup: 'animate__animated animate__fadeInUp animate__faster'
                                    },
                                    hideClass: {
                                        popup: 'animate__animated animate__fadeOutDown animate__faster'
                                    }
                                });
                            } else {
                                await Swal.fire({
                                    icon: 'error',
                                    title: '<div class="flex items-center gap-3"><i class="fas fa-exclamation-triangle text-red-500"></i><span>Verification Failed</span></div>',
                                    html: `
                                        <div class="space-y-4">
                                            <div class="flex justify-center">
                                                <div class="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                                                    <i class="fas fa-times text-red-500 text-3xl"></i>
                                                </div>
                                            </div>
                                            <p>${resetData.message}</p>
                                            <div class="bg-red-50 border-l-4 border-red-500 p-4 mt-4">
                                                <div class="flex items-start">
                                                    <div class="flex-shrink-0">
                                                        <i class="fas fa-info-circle text-red-500"></i>
                                                    </div>
                                                    <div class="ml-3">
                                                        <p class="text-sm text-red-700">
                                                            If you've forgotten your PIN, please reset it through the "Forgot PIN" option in your profile settings or contact support.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    `,
                                    confirmButtonText: 'Try Again',
                                    confirmButtonColor: '#ef4444',
                                    showClass: {
                                        popup: 'animate__animated animate__headShake'
                                    }
                                });
                            }
                        } catch (error) {
                            await Swal.fire({
                                icon: 'error',
                                title: 'Connection Error',
                                text: 'Failed to connect to the server. Please check your internet connection and try again.',
                                confirmButtonColor: '#3085d6'
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
