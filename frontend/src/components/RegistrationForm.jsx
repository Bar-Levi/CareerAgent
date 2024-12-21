import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegistrationForm = ({ toggleForm }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'jobseeker',
    });
    
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

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
                alert(`Error: ${data.message}`);
            }
        } catch (err) {
            alert('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col space-y-6 w-full bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 max-w-md transform hover:scale-105 transition-transform duration-500 animate-slide-in">
            <h2 className="text-3xl font-bold text-gray-800 text-center font-orbitron">
                Welcome,
                <p className="text-gray-600">
                    {formData.role === 'jobseeker' ? 'Land Your Dream Job!' : 'Find Top Talents!'}
                </p>
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                    required
                />
                <div className="relative">
                    <input
                        type={isPasswordVisible ? 'text' : 'password'}
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                        required
                    />
                    <span
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 text-2xl"
                        onClick={() => setIsPasswordVisible((prev) => !prev)}
                    >
                        {isPasswordVisible ? '🙉' : '🙈'}
                    </span>
                </div>
                <div className="relative">
                    <input
                        type={isConfirmPasswordVisible ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                        required
                    />
                    <span
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 text-2xl"
                        onClick={() => setIsConfirmPasswordVisible((prev) => !prev)}
                    >
                        {isConfirmPasswordVisible ? '🙉' : '🙈'}
                    </span>
                </div>
                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                >
                    <option value="jobseeker">Job Seeker</option>
                    <option value="recruiter">Recruiter</option>
                </select>
                <button
                    type="submit"
                    className="w-full py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-lg hover:scale-105 focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                >
                    {isLoading ? 'Loading...' : 'Register'}
                </button>
            </form>
            <button onClick={toggleForm} className="text-gray-600 hover:underline text-center">
                Already have an account? Log in
            </button>
        </div>
    );
};

export default RegistrationForm;
