import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import Botpress from "../botpress/Botpress";

const JobCandidateDashboard = () => {
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const {state} = useLocation();
    const email = state?.email; // Email from navigation state
    const token = localStorage.getItem("token") || ""; // Get token from localStorage

    // Fetch user verification status
    const isUserVerified = async (email, token) => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}/api/auth/user-details?email=${encodeURIComponent(email)}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const user = await response.json();
                return user.isVerified; // Return the verification status
            } else if (response.status === 401) {
                navigate("/authentication"); // Redirect if unauthorized
            }
        } catch (error) {
            console.error("Error fetching user verification:", error);
        }

        return false;
    };

    // Fetch user details
    const fetchUserDetails = async (email, token) => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}/api/auth/user-details?email=${encodeURIComponent(email)}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                return data;
            }
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    }; 
    
    // Verify user and fetch details on mount
    useEffect(() => {
        const handleUserVerification = async () => {
            if (!email) {
                navigate("/authentication");
                return;
            }
            if (state.isVerified) {
                const userDetails = await fetchUserDetails(email, token);
                setUserData(userDetails);
            }

            const userIsVerified = await isUserVerified(email, token);
            if (userIsVerified) {
                const userDetails = await fetchUserDetails(email, token);
                setUserData(userDetails);
                state.isVerified = true;
            } else {
                console.log("Navigate to /verify");
                navigate('/verify',{
                    state: {...state,
                        notificationType: 'error',
                        notificationMessage: 'Please verify your email before continuing',
                        notificationSource: 'Login Without Verification',
                    }
                });
            }
        };

        console.log("State: " + JSON.stringify(state));
        if (!state.isVerified)
            handleUserVerification();
    }, [email, token, navigate]);

    if (error) {
        return (
            <div className="text-red-500 text-center mt-5">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-100">
        
            <Botpress />
            {/* Navigation Bar */}
            <NavigationBar userType={state.user.role}/>

            {/* JobCandidateDashboard Content */}
            <div className="flex justify-center items-center flex-1">
            <h1 className="text-gray-800 text-2xl font-bold">
                JobCandidateDashboard
            </h1>
            </div>
        </div>
      );
};

export default JobCandidateDashboard;
