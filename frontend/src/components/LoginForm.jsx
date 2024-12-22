import React, { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.css';


const LoginForm = ({ toggleForm, setUserType }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Logging in:', formData); // Replace with API call
    };

    return (
        <div className="flex flex-col space-y-6 w-full bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8  max-w-md transform hover:scale-105 transition-transform duration-500 animate-slide-in">
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
                    className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
                >
                    <option value="jobseeker">Job Seeker</option>
                    <option value="recruiter">Recruiter</option>
                </select>
                <button type="submit" className="w-full py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-lg hover:scale-105 focus:ring-2 focus:ring-gray-500 transition-all duration-200">
                    Log In
                </button>
            </form>
            <button onClick={toggleForm} className="text-gray-600 hover:underline text-center">
                Don't have an account? Register
            </button>
        </div>
    );
};

export default LoginForm;
