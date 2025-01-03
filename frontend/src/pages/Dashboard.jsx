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



// <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
        //     {userData ? (
        //         <div className="bg-white shadow rounded-lg p-6 w-full max-w-lg">
        //             <img
        //                 className="p-1 w-24 h-24 rounded-full mx-auto border border-black"
        //                 src={userData.profilePic}
        //                 alt={`${userData.fullName}'s Profile`}
        //             />
        //             <h2 className="text-center text-xl font-bold mt-4">{userData.fullName}</h2>
        //             <p className="text-center text-gray-600">{userData.email}</p>
        //             <div className="mt-4 text-center">
        //                 {userData.cv ? (
        //                     <div className="w-full h-[500px] mt-4">
        //                         <embed
        //                             src={userData.cv}
        //                             type="application/pdf"
        //                             width="100%"
        //                             height="100%"
        //                             className="border rounded-lg"
        //                         />
        //                     </div>
        //                 ) : (
        //                     <p className="text-gray-500">No CV uploaded</p>
        //                 )}
        //             </div>
        //         </div>
        //     ) : (
        //         <p>Loading...</p>
        //     )}

        // </div>