import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Notification from './Notification';
import OptionalDetailsJobSeekerForm from './OptionalDetailsJobSeekerForm';
import OptionalDetailsRecruiterForm from './OptionalDetailsRecruiterForm';
import Swal from 'sweetalert2';
import { debounce } from 'lodash';
import { isValidEmail } from '../utils/validateEmail';
import CryptoJS from 'crypto-js';

const RegistrationForm = ({ toggleForm, setUserType }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'JobSeeker', // Default role
        companyName: '',   // For recruiters
        companySize: '',   // For recruiters
        pin: Math.floor(Math.random() * 899999) + 100000
    });

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [notification, setNotification] = useState(null);
    const [isOptionalFormVisible, setIsOptionalFormVisible] = useState(false);
    const [isTermsAccepted, setIsTermsAccepted] = useState(false);

    const passwordRules =
        'Password must include uppercase, lowercase, a number, a special character, and be at least 8 characters long.';
    const navigate = useNavigate();

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    const checkEmailExists = useCallback(
    debounce(async (email) => {
        try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/check-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        if (data.exists) {
            showNotification('error', 'Email is already registered.');
        }
        } catch (err) {
        console.error('Error checking email:', err);
        }
    }, 500),
    [] // empty deps to memoize once
    );

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
        checkEmailExists.cancel(); // prevents calling on unmounted component
        };
    }, [checkEmailExists]);

      

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'companySize') {
            // Only allow positive integers - strip any non-digit characters
            const cleanValue = value.replace(/[^0-9]/g, '');
            
            if (cleanValue !== value) {
                // If we had to clean the value, update the input directly
                e.target.value = cleanValue;
            }
            
            const parsedValue = parseInt(cleanValue, 10);
            if (!isNaN(parsedValue)) {
                setFormData({ ...formData, companySize: parsedValue });
            } else if (cleanValue === '') {
                setFormData({ ...formData, companySize: '' });
            }
            return;
        }

        setFormData({ ...formData, [name]: value });

        // Calculate password strength immediately if user is typing a new password
        if (name === 'password') {
            calculatePasswordStrength(value);
        }
    };

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        setPasswordStrength(strength);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validations
        if (formData.password !== formData.confirmPassword) {
            showNotification('error', 'Passwords do not match.');
            return;
        }

        if (passwordStrength < 4 || formData.password.length < 8) {
            showNotification('error', passwordRules);
            return;
        }

        if (formData.role === 'Recruiter') {
            if (!formData.companyName || !formData.companySize) {
                showNotification(
                    'error',
                    'Company Name and Company Size are required for recruiters.'
                );
                return;
            }
            if (!Number.isInteger(formData.companySize) || formData.companySize <= 0) {
                showNotification('error', 'Company Size must be a positive integer.');
                return;
            }
        }

        setIsLoading(true);

        try {
            showNotification('success', 'Please continue the registration process.');
            setIsOptionalFormVisible(true);
        } catch (err) {
            showNotification('error', 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOptionalSubmit = async (optionalData) => {
        try {
            console.dir(optionalData, { depth: null });
            setIsLoading(true);

            // Reusable file upload function
            const uploadFile = async (file, folder) => {
                const fileData = new FormData();
                fileData.append('file', file);
                fileData.append('folder', folder);

                const uploadResponse = await fetch(
                    `${process.env.REACT_APP_BACKEND_URL}/api/cloudinary/upload`,
                    {
                        method: 'POST',
                        body: fileData,
                    }
                );
                if (!uploadResponse.ok) {
                    throw new Error('Failed to upload file to Cloudinary.');
                }
                const data = await uploadResponse.json();
                return data.url;
            };

            // Upload CV if present (JobSeeker use-case)
            if (optionalData.cv) {
                optionalData.cv = await uploadFile(optionalData.cv, 'cvs');
            }

            // Upload profile pic if present
            if (optionalData.profilePic) {
                optionalData.profilePic = await uploadFile(optionalData.profilePic, 'profile_pictures');
            }

            // Default profile pic if not uploaded
            if (!optionalData.profilePic) {
                optionalData.profilePic =
                    'https://res.cloudinary.com/careeragent/image/upload/v1735084555/default_profile_image.png';
            }

            // Upload company logo if present (Recruiter use-case)
            if (optionalData.companyLogo) {
                optionalData.companyLogo = await uploadFile(optionalData.companyLogo, 'companyLogos');
            }

            // Merge all form data
            const finalFormData = { ...formData };
            delete finalFormData.confirmPassword;

            // Encrypt password & PIN before sending
            finalFormData.password = CryptoJS.AES.encrypt(
                finalFormData.password,
                process.env.REACT_APP_SECRET_KEY
            ).toString();
            finalFormData.pin = CryptoJS.AES.encrypt(
                finalFormData.pin.toString(),
                process.env.REACT_APP_SECRET_KEY
            ).toString();

            // Determine the correct endpoint
            const apiUrl =
                formData.role === 'JobSeeker'
                    ? `${process.env.REACT_APP_BACKEND_URL}/api/auth/registerJobSeeker`
                    : `${process.env.REACT_APP_BACKEND_URL}/api/auth/registerRecruiter`;

            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...finalFormData, ...optionalData }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('countdown', 60);
                navigate('/verify', {
                    state: {
                        email: formData.email,
                        role: formData.role,
                        notificationType: 'success',
                        notificationMessage:
                            'Registration process was successful! Please verify your email :)',
                        notificationSource: 'Successful Registration',
                    },
                });
                showNotification('success', 'Verification email sent!');

                // Alert with copy-PIN functionality
                await Swal.fire({
                    title: 'Important: Save Your PIN',
                    html: `
                        <p>Your personal 6-digit PIN is:</p>
                        <h2 style="display: inline-block; font-size: 2rem; font-weight: bold;" id="pin-text">${formData.pin}</h2>
                        <button
                            id="copy-pin-btn"
                            style="margin-left: 10px; padding: 5px 10px; font-size: 0.9rem; border: none; background-color: #3085d6; color: white; border-radius: 5px; cursor: pointer;"
                        >
                            Copy PIN
                        </button>
                        <p style="margin-top: 10px;">
                            You will need this PIN in the future. This PIN and message will appear only once.
                        </p>
                        <p>
                            For your convenience, we have saved your PIN in a file named <b>pin.txt</b> for you to download.
                        </p>
                        <p>
                            If you lose the PIN or accidentally close this window, refer to the
                            <a href="/terms-and-conditions" target="_blank">Terms and Conditions</a> on how to regain your PIN.
                        </p>
                    `,
                    icon: 'info',
                    confirmButtonText: 'I Understand',
                    confirmButtonColor: '#3085d6',
                    didRender: () => {
                        const copyButton = document.getElementById('copy-pin-btn');
                        const pinText = document.getElementById('pin-text').textContent;
                        copyButton.addEventListener('click', () => {
                            navigator.clipboard.writeText(pinText).then(() => {
                                Swal.fire(
                                    'Copied!',
                                    'The PIN has been copied to your clipboard.',
                                    'success'
                                );
                            }).catch((err) => {
                                console.error('Failed to copy PIN:', err);
                                Swal.fire(
                                    'Error',
                                    'Unable to copy the PIN. Please try again.',
                                    'error'
                                );
                            });
                        });
                    },
                });

                // Download PIN code to a text file
                const downloadLink = document.createElement('a');
                downloadLink.href = `data:text/plain;charset=utf-8,${encodeURIComponent(
                    formData.pin
                )}`;
                downloadLink.download = 'pin.txt';
                downloadLink.click();
            } else {
                showNotification('error', data.message);
                setIsOptionalFormVisible(false);
            }
        } catch (error) {
            showNotification('error', 'An error occurred while submitting optional details.');
            setIsOptionalFormVisible(false);
        } finally {
            setIsLoading(false);
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
        <div className="relative flex flex-col space-y-6 w-full bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 max-w-md">
            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}

            {/* Flip-card style container: Front (main form) and Back (optional form) */}
            <div
                className={`transform-style-preserve transition-transform duration-1000 ${
                    isOptionalFormVisible ? 'rotateY-180' : ''
                }`}
            >
                {/* Main Registration Form (Front) */}
                <div className={`backface-hidden ${isOptionalFormVisible ? 'hidden' : ''}`}>
                    <h2 className="text-3xl font-bold text-gray-800 text-center">
                        Welcome,
                        <p
                            className="text-gray-600"
                            style={{
                                marginTop: formData.role === 'Recruiter' ? '-5px' : '0px',
                                paddingBottom: '10px',
                            }}
                        >
                            {formData.role === 'JobSeeker'
                                ? 'Land Your Dream Job!'
                                : 'Find Top Talents!'}
                        </p>
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            name="fullName"
                            data-cy="registration-fullName"
                            placeholder="Full Name *"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                            required
                        />
                        <input
                        data-cy="registration-email"
                        type="email"
                        name="email"
                        placeholder="Email *"
                        value={formData.email}
                        onChange={(e) => {
                            handleChange(e);
                            if (isValidEmail(e.target.value)) {
                                checkEmailExists(e.target.value);
                            }
                        }}
                        className="w-full px-4 py-2.5 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                        required
                        />
                        {formData.role === 'Recruiter' && (
                            <>
                                <input
                                    type="text"
                                    name="companyName"
                                    data-cy="registration-companyName"
                                    placeholder="Company Name *"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                                    required
                                />
                                <input
                                    type="number"
                                    name="companySize"
                                    data-cy="registration-companySize"
                                    placeholder="Company Size *"
                                    value={formData.companySize}
                                    onChange={handleChange}
                                    min="1"
                                    step="1"
                                    pattern="\d+"
                                    onKeyDown={(e) => {
                                        // Prevent entering negative sign
                                        if (e.key === '-' || e.key === 'e' || e.key === '.') {
                                            e.preventDefault();
                                        }
                                    }}
                                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                                    required
                                />
                            </>
                        )}

                        {/* Password Field */}
                        <div className="relative group">
                            <input
                                type={isPasswordVisible ? 'text' : 'password'}
                                name="password"
                                data-cy="registration-password"
                                placeholder="Password *"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                                required
                            />
                            <span
                                className="absolute right-10 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 text-xl"
                                onClick={() => setIsPasswordVisible((prev) => !prev)}
                            >
                                <i className={`fa ${isPasswordVisible ? 'fa-eye' : 'fa-eye-slash'}`} />
                            </span>
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 text-lg group-hover:text-gray-700">
                                <i className="fa fa-info-circle" />
                            </span>

                            {/* Hover tooltip with password requirements */}
                            <div className="z-10 absolute right-0 top-full mt-2 hidden group-hover:block bg-white text-gray-700 text-sm rounded-lg shadow-lg p-3 w-64">
                                <p>
                                    Password must:
                                    <ul className="list-disc pl-4">
                                        <li>Be at least 8 characters long</li>
                                        <li>Contain an uppercase letter</li>
                                        <li>Include a number</li>
                                        <li>Have a special character</li>
                                    </ul>
                                </p>
                            </div>
                        </div>

                        {/* Password Strength Bar */}
                        <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">
                                    {getStrengthText()}
                                </span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded">
                                <div
                                    className={`h-2 rounded transition-all duration-300 ${getStrengthColor()}`}
                                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div className="relative">
                            <input
                                type={isConfirmPasswordVisible ? 'text' : 'password'}
                                name="confirmPassword"
                                data-cy="registration-confirmPassword"
                                placeholder="Confirm Password *"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                                required
                            />
                            <span
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 text-xl"
                                onClick={() => setIsConfirmPasswordVisible((prev) => !prev)}
                            >
                                <i className={`fa ${isConfirmPasswordVisible ? 'fa-eye' : 'fa-eye-slash'}`} />
                            </span>
                        </div>

                        {/* Role Selector */}
                        <select
                            name="role"
                            data-cy="registration-role"
                            value={formData.role}
                            onChange={(e) => {
                                handleChange(e);
                                setUserType(e.target.value);
                            }}
                            className="w-full px-4 py-2.5 cursor-pointer bg-gray-50 text-gray-800 rounded-lg border border-gray-400 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                        >
                            <option value="JobSeeker">Job Candidate</option>
                            <option value="Recruiter">Recruiter</option>
                        </select>

                        {/* Terms & Conditions */}
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="terms"
                                data-cy="registration-terms"
                                checked={isTermsAccepted}
                                onChange={(e) => setIsTermsAccepted(e.target.checked)}
                                className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-400 rounded"
                            />
                            <label htmlFor="terms" className="text-sm text-gray-700">
                                I agree to the{' '}
                                <a
                                    href="/terms-and-conditions"
                                    target="_blank"
                                    className="text-blue-500 hover:underline"
                                >
                                    Terms and Conditions
                                </a>
                                <span className="text-red-500 font-bold"> *</span>
                            </label>
                        </div>

                        {/* Continue Button */}
                        <button
                            type="submit"
                            data-cy="registration-submit"
                            disabled={isLoading || !isTermsAccepted}
                            className={`w-full py-2 text-white font-bold rounded-lg focus:ring-2 transition-all duration-200 ${
                                isLoading || !isTermsAccepted
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:scale-105'
                            }`}
                        >
                            {isLoading ? 'Loading...' : 'Continue Registration'}
                        </button>
                    </form>
                </div>

                {/* Optional Details Form (Back) */}
                <div className={`backface-hidden rotateY-180 ${isOptionalFormVisible ? '' : 'hidden'}`}>
                    {formData.role === 'JobSeeker' ? (
                        <OptionalDetailsJobSeekerForm onSubmit={handleOptionalSubmit} />
                    ) : (
                        <OptionalDetailsRecruiterForm onSubmit={handleOptionalSubmit} />
                    )}
                </div>
            </div>

            {/* Toggle to Login */}
            <button
                onClick={toggleForm}
                data-cy="registration-toggle-login"
                className="text-gray-600 hover:underline text-center"
            >
                Already have an account? Log in
            </button>
        </div>
    );
};

export default RegistrationForm;
