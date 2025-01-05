import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CandidateList from "../components/CandidateList";

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email; // Access email from passed state
    const role = location.state?.role;
    const token = localStorage.getItem("token") || "";

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
                const data = await response.json();
                return data.isVerified; // Return the verification status
            } else if (response.status === 401) {
                navigate("/authentication");
            }
        } catch (error) {
            console.error("Error fetching user verification:", error);
        }

        return false;
    };

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

    useEffect(() => {
        const handleUserVerification = async () => {
            if (!email) {
                navigate("/authentication");
                return;
            }

            const userIsVerified = await isUserVerified(email, token);
            if (userIsVerified) {
                const userDetails = await fetchUserDetails(email, token);
                setUserData(userDetails);
            }
        };

        handleUserVerification();
    }, [email, token, navigate]);

    if (error) {
        return (
            <div className="text-red-500 text-center mt-5">
                <p>{error}</p>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="text-gray-500 text-center mt-5">
                <p>Loading...</p>
            </div>
        );
    }

    return <CandidateList candidates={[userData]} />;
};

export default Dashboard;