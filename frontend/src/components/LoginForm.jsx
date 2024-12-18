import React from 'react';

const LoginForm = () => (
    <div className="max-w-md mx-auto bg-white shadow-md p-6 rounded">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <form>
            <input
                type="email"
                placeholder="Email"
                className="w-full p-2 border rounded mb-4"
            />
            <input
                type="password"
                placeholder="Password"
                className="w-full p-2 border rounded mb-4"
            />
            <button className="w-full bg-blue-500 text-white py-2 rounded">
                Login
            </button>
        </form>
    </div>
);

export default LoginForm;
