import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    console.log('location.state = ');
    console.dir(location.state, { depth: null});
    // useEffect is user is not verified, navigate him to /verification.
    useEffect(() => {
        if (!email) {
            console.log(' !email = true')
            navigate('/authentication');
        }
        else if (!isUserVerified(location.email))
            console.log('User is NOT verified - navigating to /verification');
            navigate('/verification');
    }, []);

    // Fetch user details when email is provided.
    // If user is not authorized, navigate him to /login.
    // If user is not found, display an error message.
    // If any error occurs, display an error message.
    useEffect(() => {
        if (email) {
            fetchUserDetails(email);
        }
    }, [email]);

    const isUserVerified = async (email) => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}/api/auth/user-details?email=${encodeURIComponent(email)}`,
                {
                    method: 'GET',
                }
            );

            if (response.ok) {
                const data = await response.json();
                console.log("Checking verification to user:")
                console.dir(data, { depth: null });
                return data.isVerified;
            } else if (response.status === 401) {
                setError('Unauthorized access. Please log in again.');
                navigate('/login');
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

    const fetchUserDetails = async (email) => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}/api/auth/user-details?email=${encodeURIComponent(email)}`,
                {
                    method: 'GET',
                }
            );

            if (response.ok) {
                const data = await response.json();
                setUserData(data);
            } else if (response.status === 401) {
                setError('Unauthorized access. Please log in again.');
                navigate('/login');
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
