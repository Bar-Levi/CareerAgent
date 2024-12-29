import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Notification from './Notification';
import OptionalDetailsJobSeekerForm from './OptionalDetailsJobSeekerForm';
import OptionalDetailsRecruiterForm from './OptionalDetailsRecruiterForm';
import Swal from 'sweetalert2';


const RegistrationForm = ({ toggleForm, setUserType }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'jobseeker', // Default role
        companyName: '', // For recruiters
        companySize: '', // For recruiters,
        pin: Math.floor(Math.random() * 900000) + 100000
    });
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [notification, setNotification] = useState(null);
    const [isOptionalFormVisible, setIsOptionalFormVisible] = useState(false);
    const [isTermsAccepted, setIsTermsAccepted] = useState(false);

    const navigate = useNavigate();

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'companySize') {
            const parsedValue = parseInt(value, 10);
            if (!isNaN(parsedValue)) {
                setFormData({ ...formData, companySize: parsedValue });
            } else if (value === '') {
                setFormData({ ...formData, companySize: '' });
            }
            return;
        }

        setFormData({ ...formData, [name]: value });
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
    
        if (formData.password !== formData.confirmPassword) {
            showNotification('error', 'Passwords do not match.');
            return;
        }
        if (passwordStrength < 4 || formData.password.length < 8) {
            showNotification(
                'error',
                'Password must include uppercase, lowercase, a number, a special character, and be at least 8 characters long.'
            );
            return;
        }
        if (formData.role === 'recruiter') {
            if (!formData.companyName || !formData.companySize) {
                showNotification('error', 'Company Name and Company Size are required for recruiters.');
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
            setIsLoading(true);

            const uploadFile = async (file, folder) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('folder', folder);

                const uploadResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cloudinary/upload`, {
                    method: 'POST',
                    body: formData,
                });
                if (!uploadResponse.ok) {
                    throw new Error('Failed to upload file to Cloudinary.');
                }

                const data = await uploadResponse.json();
                return data.url;
            };

            if (optionalData.cv) {
                optionalData.cv = await uploadFile(optionalData.cv, 'cvs');
            }

            if (optionalData.profilePic) {
                optionalData.profilePic = await uploadFile(optionalData.profilePic, 'profile_pictures');
            }

            const apiUrl =
                formData.role === 'jobseeker'
                    ? `${process.env.REACT_APP_BACKEND_URL}/api/auth/registerJobSeeker`
                    : `${process.env.REACT_APP_BACKEND_URL}/api/auth/registerRecruiter`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, ...optionalData }),
            });

            const data = await response.json();
            if (response.ok) {
                showNotification('success', 'Verification email sent!');
                // Show PIN alert with copy functionality
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
                        <p style="margin-top: 10px;">You will need this PIN in the future. This PIN and message will appear only once.</p>
                        <p>If you lose the PIN or accidentally close this window, refer to the <a href="/terms-and-conditions" target="_blank">Terms and Conditions</a> on how to regain your PIN.</p>
                    `,
                    icon: 'info',
                    confirmButtonText: 'Continue to verification',
                    confirmButtonColor: '#3085d6',
                    didRender: () => {
                        // Attach the event listener to the "Copy PIN" button after the modal renders
                        const copyButton = document.getElementById('copy-pin-btn');
                        const pinText = document.getElementById('pin-text').textContent;
                
                        copyButton.addEventListener('click', () => {
                            navigator.clipboard.writeText(pinText).then(() => {
                                Swal.fire('Copied!', 'The PIN has been copied to your clipboard.', 'success');
                            }).catch(err => {
                                console.error('Failed to copy PIN:', err);
                                Swal.fire('Error', 'Unable to copy the PIN. Please try again.', 'error');
                            });
                        });
                    },
                });
                
                localStorage.setItem('countdown', 60);
                navigate('/verify', {
                    state: {
                        email: formData.email,
                        role: formData.role,
                        notificationType: 'success',
                        notificationMessage: 'Registration process was successful! Please verify your email :)',
                        notificationSource: 'Successful Registration',
                    },
                });
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
            <div
                className={`transform-style-preserve transition-transform duration-1000 ${
                    isOptionalFormVisible ? 'rotateY-180' : ''
                }`}
            >
                <div className={`backface-hidden ${isOptionalFormVisible ? 'hidden' : ''}`}>
                    <h2 className="text-3xl font-bold text-gray-800 text-center">
                        Welcome,
                        <p
                            className="text-gray-600"
                            style={{
                                marginTop: formData.role === 'recruiter' ? '-5px' : '0px',
                                paddingBottom: '10px',
                            }}
                        >
                            {formData.role === 'jobseeker' ? 'Land Your Dream Job!' : 'Find Top Talents!'}
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
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                            required
                        />
                        {formData.role === 'recruiter' && (
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
                                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                                    required
                                />
                            </>
                        )}
                        <div className="relative">
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
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 text-xl"
                                onClick={() => setIsPasswordVisible((prev) => !prev)}
                            >
                                <i className={`fa ${isPasswordVisible ? 'fa-eye' : 'fa-eye-slash'}`} />
                            </span>
                        </div>
                        <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">{getStrengthText()}</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded">
                                <div
                                    className={`h-2 rounded transition-all duration-300 ${getStrengthColor()}`}
                                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                />
                            </div>
                        </div>
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
                            <option value="jobseeker">Job Seeker</option>
                            <option value="recruiter">Recruiter</option>
                        </select>
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
                                <a href="/terms-and-conditions" target="_blank" className="text-blue-500 hover:underline">
                                    Terms and Conditions
                                </a>
                                <span className="text-red-500 font-bold"> *</span>
                            </label>
                        </div>
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

                <div className={`backface-hidden rotateY-180 ${isOptionalFormVisible ? '' : 'hidden'}`}>
                    {formData.role === 'jobseeker' ? (
                        <OptionalDetailsJobSeekerForm onSubmit={handleOptionalSubmit} />
                    ) : (
                        <OptionalDetailsRecruiterForm onSubmit={handleOptionalSubmit} />
                    )}
                </div>
            </div>
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
