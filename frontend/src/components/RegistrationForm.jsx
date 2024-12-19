import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import fadeStaggerSquares from '../assets/fade-stagger-squares.svg'; // Loading animation

const RegistrationForm = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'jobseeker', // Default role
    });
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // For mouse movement effects
    const [mouseX, setMouseX] = useState(0);
    const [mouseY, setMouseY] = useState(0);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMouseX(e.clientX / window.innerWidth);
            setMouseY(e.clientY / window.innerHeight);
        };
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();

            if (response.ok) {
                navigate('/verify', { state: { email: formData.email, verificationCodeSentAt: new Date() } });
            } else {
                console.error('Registration error:', data.message);
            }
        } catch (err) {
            console.error('An error occurred during registration:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const navigateToLogin = () => {
        navigate('/login');
    };

    return (
        <div
            className="max-h-screen flex justify-center items-center relative overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #ffffff, #a0a0a0, #999999, #ffffff, #a0a0a0, #999999)',
            }}
        >
            {/* Animated Lines */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Vertical Lines */}
                <div
                    className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-gray-600/80 to-transparent animate-pulse-fast"
                    style={{ transform: `translateY(${mouseY * 20}px)` }}
                />
                <div
                    className="absolute top-0 left-3/4 w-1 h-full bg-gradient-to-b from-gray-600/80 to-transparent animate-pulse-fast-reverse"
                    style={{ transform: `translateY(-${mouseY * 20}px)` }}
                />

                {/* Horizontal Lines */}
                <div
                    className="absolute top-1/3 left-0 w-full h-1 bg-gradient-to-r from-gray-600/80 to-transparent animate-sweep-fast"
                    style={{ transform: `translateX(${mouseX * 20}px)` }}
                />
                <div
                    className="absolute top-2/3 left-0 w-full h-1 bg-gradient-to-r from-gray-600/80 to-transparent animate-sweep-fast-reverse"
                    style={{ transform: `translateX(-${mouseX * 20}px)` }}
                />
            </div>

            {/* Registration Form */}
            <main
                className="w-full max-w-lg bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 backdrop-blur-xl rounded-lg shadow-lg p-8 relative z-10 animate-slide-up-fast"
                style={{
                    height: 'fit-content',
                    transform: `translate(-${mouseX * 10}px, -${mouseY * 10}px)`,
                    transition: 'transform 0.1s ease',
                }}
            >
                <h2 className="text-3xl font-bold text-gray-800 mb-6 tracking-wide text-center font-orbitron">
                    Welcome,
                    <p className="text-gray-600">{formData.role === 'jobseeker' ? 'Land Your Dream Job!' : 'Find Top Talents!'}</p>
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 tracking-wide mb-2">
                            Full Name <span className="text-gray-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 tracking-wide mb-2">
                            Email <span className="text-gray-500">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="example@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 tracking-wide mb-2">
                            Password <span className="text-gray-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={isPasswordVisible ? 'text' : 'password'}
                                name="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                                required
                            />
                            <span
                                className="absolute right-3 top-2.5 cursor-pointer text-gray-500 text-3xl"
                                onClick={() => setIsPasswordVisible((prev) => !prev)}
                                >
                                {isPasswordVisible ? '🙉' : '🙈'}
                            </span>

                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 tracking-wide mb-2">
                            Confirm Password <span className="text-gray-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={isConfirmPasswordVisible ? 'text' : 'password'}
                                name="confirmPassword"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                                required
                            />
                            <span
                                className="absolute right-3 top-3 cursor-pointer text-gray-500 text-3xl"
                                onClick={() => setIsConfirmPasswordVisible((prev) => !prev)}
                            >
                                {isConfirmPasswordVisible ? '🙉' : '🙈'}
                            </span>
                        </div>
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 tracking-wide mb-2">
                            Role <span className="text-gray-500">*</span>
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                        >
                            <option value="jobseeker">Job Seeker</option>
                            <option value="recruiter">Recruiter</option>
                        </select>
                    </div>

                    {/* Register Button */}
                    <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-lg shadow-lg hover:scale-105 focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <img src={fadeStaggerSquares} alt="Loading..." className="w-5 h-5 animate-spin" />
                        ) : (
                            'Register'
                        )}
                    </button>

                    {/* Already have an account */}
                    <div className="text-center mt-4">
                        <button
                            type="button"
                            onClick={navigateToLogin}
                            className="py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:text-gray-900 hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                        >
                            Already have an account? Log in
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default RegistrationForm;
