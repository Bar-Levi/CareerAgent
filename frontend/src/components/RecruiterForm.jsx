import React from 'react';

const RecruiterForm = () => (
    <div className="max-w-md mx-auto bg-white shadow-md p-6 rounded">
        <h2 className="text-2xl font-bold mb-4">Recruiter Registration</h2>
        <form>
            <input type="text" placeholder="Full Name" className="w-full p-2 border rounded mb-4" />
            <input type="email" placeholder="Email" className="w-full p-2 border rounded mb-4" />
            <input
                type="password"
                placeholder="Password"
                className="w-full p-2 border rounded mb-4"
            />
            <input
                type="text"
                placeholder="Company Name"
                className="w-full p-2 border rounded mb-4"
            />
            <button className="w-full bg-blue-500 text-white py-2 rounded">
                Register
            </button>
        </form>
    </div>
);

export default RecruiterForm;
