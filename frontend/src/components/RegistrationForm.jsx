import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Notification from './Notification';
import OptionalDetailsJobSeekerForm from './OptionalDetailsJobSeekerForm';
import OptionalDetailsRecruiterForm from './OptionalDetailsRecruiterForm';

const RegistrationForm = ({ toggleForm, setUserType }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'jobseeker', // Default role
        companyName: '', // For recruiters
        companySize: '', // For recruiters
    });
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [notification, setNotification] = useState(null);
    const [isOptionalFormVisible, setIsOptionalFormVisible] = useState(false);
    const [isTermsAccepted, setIsTermsAccepted] = useState(false); // Terms and conditions state

    const navigate = useNavigate();

    // Show notification
    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Ensure Company Size accepts only integers
        if (name === 'companySize') {
            const parsedValue = parseInt(value, 10);
            if (!isNaN(parsedValue)) {
                setFormData({ ...formData, companySize: parsedValue });
            } else if (value === '') {
                setFormData({ ...formData, companySize: '' }); // Allow empty values for resetting
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
        if (password.length >= 8) strength += 1; // Length
        if (/[A-Z]/.test(password)) strength += 1; // Uppercase
        if (/[a-z]/.test(password)) strength += 1; // Lowercase
        if (/[0-9]/.test(password)) strength += 1; // Numbers
        if (/[^A-Za-z0-9]/.test(password)) strength += 1; // Special characters
        setPasswordStrength(strength);
    };

    const checkEmailExists = async (email) => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}/api/auth/check-email`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                }
            );

            if (response.status === 409) {
                const data = await response.json();
                showNotification('error', data.message || 'Email is already registered.');
                return true; // Email exists
            }

            if (response.status === 200) {
                return false; // Email does not exist
            }

            showNotification('error', 'Unexpected response. Please try again.');
            return true; // Default to assuming email exists
        } catch (error) {
            showNotification('error', 'Error checking email. Please try again.');
            return true; // Default to assuming email exists
        }
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

        // Check if email already exists
        const emailExists = await checkEmailExists(formData.email);
        if (emailExists) {
            setIsLoading(false);
            return; // Stop registration if email exists
        }

        try {
            showNotification('success', 'Please continue the registration process.');
            setIsOptionalFormVisible(true); // Flip to the optional form
        } catch (err) {
            showNotification('error', 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOptionalSubmit = async (optionalData) => {
        try {
            setIsLoading(true);
            const apiUrl =
                formData.role === 'jobseeker'
                    ? `${process.env.REACT_APP_BACKEND_URL}/api/auth/registerJobSeeker`
                    : `${process.env.REACT_APP_BACKEND_URL}/api/auth/registerRecruiter`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, ...optionalData }), // Merge registration and optional fields
            });

            const data = await response.json();
            if (response.ok) {
                showNotification('success', 'Verification email sent!');
                navigate('/verify', { state: { email: formData.email, role: formData.role } }); // Pass role here
            } else {
                showNotification('error', data.message);
            }
        } catch (error) {
            showNotification('error', 'An error occurred while submitting optional details.');
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
                {/* Registration Form */}
                <div className={`backface-hidden ${isOptionalFormVisible ? 'hidden' : ''}`}>
                    <h2 className="text-3xl font-bold text-gray-800 text-center">
                        Welcome,
                        <p
                            className="text-gray-600"
                            style={{
                                marginTop: formData.role === 'recruiter' ? '-5px' : '0px', // Adjust recruiter subtitle position
                            }}
                        >
                            {formData.role === 'jobseeker' ? 'Land Your Dream Job!' : 'Find Top Talents!'}
                        </p>
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            name="fullName"
                            placeholder="Full Name *"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email *"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                            required
                        />
                        {formData.role === 'recruiter' && (
                            <>
                                <input
                                    type="text"
                                    name="companyName"
                                    placeholder="Company Name *"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                                    required
                                />
                                <input
                                    type="number"
                                    name="companySize"
                                    placeholder="Company Size *"
                                    value={formData.companySize}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                                    required
                                />
                            </>
                        )}
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
                                placeholder="Confirm Password *"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
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
                            value={formData.role}
                            onChange={(e) => {
                                handleChange(e);
                                setUserType(e.target.value);
                            }}
                            className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                        >
                            <option value="jobseeker">Job Seeker</option>
                            <option value="recruiter">Recruiter</option>
                        </select>
                        {/* Terms and Conditions Checkbox */}
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="terms"
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
                            disabled={isLoading || !isTermsAccepted} // Disable if terms not accepted
                            className={`w-full py-2 text-white font-bold rounded-lg focus:ring-2 transition-all duration-200 ${
                                isLoading || !isTermsAccepted
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:scale-105'
                            }`}
                        >
                            {isLoading ? 'Loading...' : 'Register'}
                        </button>
                    </form>
                </div>

                {/* Optional Details Form */}
                <div className={`backface-hidden rotateY-180 ${isOptionalFormVisible ? '' : 'hidden'}`}>
                    {formData.role === 'jobseeker' ? (
                        <OptionalDetailsJobSeekerForm onSubmit={handleOptionalSubmit} />
                    ) : (
                        <OptionalDetailsRecruiterForm onSubmit={handleOptionalSubmit} />
                    )}
                </div>
            </div>
            <button onClick={toggleForm} className="text-gray-600 hover:underline text-center">
                Already have an account? Log in
            </button>
        </div>
    );
};

export default RegistrationForm;
