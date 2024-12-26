import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email; // Access email from passed state
    const role = location.state?.role;
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '');
    const [resendInitiated, setResendInitiated] = useState(false); // Track resend state

    console.log('location.state = ');
    console.dir(location.state, { depth: null });

    useEffect(() => {
        const handleUserVerification = async () => {
            console.log('email = ' + email);
            console.log('role =' + role);

            try {
                if (!email) { // User typed manually /dashboard instead of coming from /authentication
                    console.log('Email not provided - redirecting to /authentication');
                    navigate('/authentication');
                    return;
                }

                // Check if the user is verified
                const userIsVerified = await isUserVerified(email, token);
                if (!userIsVerified) {
                    console.log('User is not verified - resending verification code.');
                    if (!resendInitiated) {
                        setResendInitiated(true); // Prevent subsequent calls
                        await resendVerificationCode();
                    }
                } else {
                    console.log('User is verified - fetching user details.');
                    setUserData(await fetchUserDetails(email, token)); // Fetch details if verified
                }
            } catch (error) {
                console.error('Error in verification flow:', error);
            }
        };

        handleUserVerification(); // Call the async function

    }, [email, token, navigate, resendInitiated]);

    const isUserVerified = async (email, token) => {
        console.log("Checking if user is verified...");
        console.log('Email:', email);

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
                console.log("User data received:", data);
                return data.isVerified; // Return the verification status
            } else if (response.status === 401) {
                console.error('Unauthorized - Redirecting to login');
                navigate('/authentication');
            } else if (response.status === 404) {
                console.error('User not found.');
            } else {
                console.error('Failed to fetch user details.');
            }
        } catch (error) {
            console.error('Error fetching user verification:', error);
        }

        return false; // Default to not verified in case of error
    };

    const resendVerificationCode = async () => {
        console.log("Resending verification code...");
        try {
            const response = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}/api/auth/resend`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`, // Include the token in the request
                    },
                    body: JSON.stringify({ email, role }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'An error occurred.');
            }

            console.log('Verification code resent. Navigating to /verify.');

            localStorage.setItem('countdown', 60);
            navigate('/verify', {
                state: {
                    email,
                    role,
                    notificationType: 'error',
                    notificationMessage: 'Please verify your email address before logging in',
                    notificationSource: 'Unverified Login'
                },
            });
        } catch (error) {
            console.error('Error resending verification code:', error);
        }
    };

    const fetchUserDetails = async (email, token) => {
        console.log("Fetching user details...");
        try {
            const response = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}/api/auth/user-details?email=${encodeURIComponent(email)}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                console.log('User data fetched:', data);
                return data;
            } else if (response.status === 401) {
                console.error('Unauthorized - Redirecting to login');
                setError('Unauthorized access. Please log in again.');
                navigate('/authentication');
            } else if (response.status === 404) {
                console.error('User not found.');
                setError('User not found.');
            } else {
                console.error('Failed to fetch user details.');
                setError('Failed to fetch user details.');
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
            setError('An error occurred while fetching user details.');
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
