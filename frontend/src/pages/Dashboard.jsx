import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email; // Access email from passed state

    useEffect(() => {
        // Check if token is available
        const token = localStorage.getItem('token');
        console.log(token);
        if (!email) {
            navigate('/');
        } else {
            fetchUserDetails(email, token); // Pass the token for secure API call
        }
    }, [email, navigate]);

    const fetchUserDetails = async (email, token) => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}/api/auth/user-details?email=${encodeURIComponent(email)}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the request
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setUserData(data);
            } else if (response.status === 401) {
                setError('Unauthorized access. Please log in again.');
                navigate('/'); // Redirect if token is invalid or expired
            } else if (response.status === 404) {
                setError('User not found.');
            } else {
                setError('Failed to fetch user details.');
            }
        } catch (error) {
            setError('An error occurred while fetching user details.');
            console.error('Error fetching user details:', error);
        }
    };

    if (error) {
        return (
            <div className="text-red-500 text-center mt-5">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
            {userData ? (
                <div className="bg-white shadow rounded-lg p-6 w-full max-w-lg">
                    <img
                        className="w-24 h-24 rounded-full mx-auto"
                        src={userData.profilePic}
                        alt={`${userData.fullName}'s Profile`}
                    />
                    <h2 className="text-center text-xl font-bold mt-4">{userData.fullName}</h2>
                    <p className="text-center text-gray-600">{userData.email}</p>
                    <div className="mt-4 text-center">
                        {userData.cv ? (
                            <div className="w-full h-[500px] mt-4">
                                <embed
                                    src={userData.cv}
                                    type="application/pdf"
                                    width="100%"
                                    height="100%"
                                    className="border rounded-lg"
                                />
                            </div>
                        ) : (
                            <p className="text-gray-500">No CV uploaded</p>
                        )}
                    </div>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default Dashboard;
