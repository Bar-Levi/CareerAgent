import JobCandidateDashboard from "../jobCandidate/Dashboard/pages/JobCandidateDashboard";
import RecruiterDashboard from "../recruiter/pages/RecruiterDashboard";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import socket from "../socket"; // Adjust the path as needed

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { state } = useLocation();
    console.log("State: ", state);
    const user = state?.user; // User from navigation state
    const email = state?.email; // Email from navigation state
    const role = state?.role;
    const token = localStorage.getItem("token") || ""; // Get token from localStorage

    // Check if the token is blacklisted
    const isTokenBlacklisted = async (token) => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}/api/auth/check-blacklist`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ token }),
                }
            );

            if (response.ok) {
                const result = await response.json();
                return result.isBlacklisted; // Return blacklist status
            }
        } catch (error) {
            console.error("Error checking token blacklist:", error);
        }

        return false;
    };

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

    // Assume you have the logged-in user available (e.g., via context or state)

    useEffect(() => {
        // Connect the socket
        socket.connect();
    
        // Join the room using the user's ID (as a string)
        if (user && user._id) {
        socket.emit("join", user.email.toString());
        console.log("Socket joined room:", user.email);
        }
    
        // Log when connected
        socket.on("connect", () => {
        console.log("Socket connected with ID:", socket.id);
        });
    
        // Listen for new notifications
        socket.on("newNotification", (notificationData) => {
        console.log("Received new notification:", notificationData);
        toast.info(notificationData.message, {
            onClick: () => {
            // For example, navigate or update state here if needed
            console.log("Notification clicked");
            },
            autoClose: 5000,
            pauseOnHover: true,
        });
        });
    
        // Clean up on component unmount
        return () => {
        socket.off("newNotification");
        socket.disconnect();
        };
    }, [user]);
    
    // Verify user and fetch details on mount
    useEffect(() => {
        const handleUserVerification = async () => {
            if (!email) {
                navigate("/authentication");
                return;
            }

            // Check if the token is blacklisted
            const tokenIsBlacklisted = await isTokenBlacklisted(token);
            if (tokenIsBlacklisted) {
                console.log("Token is blacklisted. Navigating to /authentication.");
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
                navigate("/verify", {
                    state: {
                        ...state,
                        notificationType: "error",
                        notificationMessage: "Please verify your email before continuing",
                        notificationSource: "Login Without Verification",
                    },
                });
            }
        };

        if (!state.isVerified) handleUserVerification();
    }, [email, token, navigate]);

    if (error) {
        return (
            <div className="text-red-500 text-center mt-5">
                <p>{error}</p>
            </div>
        );
    }

    return role === "jobseeker" ? (
        <JobCandidateDashboard />
    ) : role === "recruiter" ? (
        <RecruiterDashboard />
    ) : (
        <p>Invalid dashboard type</p>
    );
};

export default Dashboard;
