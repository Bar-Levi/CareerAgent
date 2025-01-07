import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CandidateList from "../components/CandidateList";

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email; // Email from navigation state
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
                const data = await response.json();
                return data.isVerified; // Return the verification status
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

    // Fetch saved conversations for the user
    const fetchConversations = async () => {
        console.log("fetchConversations()");
        try {
            const response = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}/api/conversations/${email}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.ok) {
                const data = await response.json();
                setConversations(data);
                console.log("Conversation:\n");
                console.dir(conversations, { depth: null});
            } else {
                console.error("Failed to fetch conversations");
            }
        } catch (error) {
            console.error("Error fetching conversations:", error);
        }
    };

    const initializeBotpress = async (convId) => {
        const conversation = conversations.find((conv) => conv.conversationId === convId);
    
        const scriptId = "botpress-webchat-script";
        let script = document.getElementById(scriptId);
    
        if (!script) {
            script = document.createElement("script");
            script.src = "https://cdn.botpress.cloud/webchat/v2.2/inject.js";
            script.id = scriptId;
            script.async = true;
    
            script.onload = async () => {
                console.log("Botpress Webchat script loaded.");
    
                const configUrl = "https://files.bpcontent.cloud/2025/01/05/10/20250105103025-0M5A3B9M.json";
                try {
                    const response = await fetch(configUrl);
                    if (!response.ok) throw new Error("Failed to fetch bot configuration.");
    
                    const botConfig = await response.json();
    
                    if (window.botpressWebChat) {
                        console.log("Initializing Botpress Webchat...");
                        window.botpressWebChat.init({
                            botId: botConfig.botId,
                            clientId: botConfig.clientId,
                            theme: {
                                color: botConfig.configuration.color || "#2563EB",
                                variant: botConfig.configuration.variant || "solid",
                                mode: botConfig.configuration.themeMode || "light",
                                font: botConfig.configuration.fontFamily || "inter",
                                radius: botConfig.configuration.radius || 1,
                            },
                            messaging: {
                                onInit: () => {
                                    console.log("Webchat initialized successfully.");
                                    if (conversation && conversation.messages) {
                                        conversation.messages.forEach((msg) => {
                                            window.botpressWebChat.sendEvent({
                                                type: "message",
                                                payload: {
                                                    type: "text",
                                                    text: msg.message,
                                                    sender: msg.sender === "user" ? "user" : "bot",
                                                },
                                            });
                                        });
                                    }
                                },
                            },
                        });
                    } else {
                        console.error("Botpress Webchat is not defined.");
                    }
                } catch (error) {
                    console.error("Error during Botpress Webchat initialization:", error);
                }
            };
    
            script.onerror = () => {
                console.error("Failed to load Botpress Webchat script.");
            };
    
            document.body.appendChild(script);
        } else if (window.botpressWebChat) {
            console.log("Botpress Webchat script already loaded, initializing...");
            // Ensure Botpress is initialized again if needed
            if (conversation && conversation.messages) {
                conversation.messages.forEach((msg) => {
                    window.botpressWebChat.sendEvent({
                        type: "message",
                        payload: {
                            type: "text",
                            text: msg.message,
                            sender: msg.sender === "user" ? "user" : "bot",
                        },
                    });
                });
            }
        } else {
            console.error("Botpress Webchat script found but Webchat object not defined.");
        }
    };
    
    
    
    
    // Verify user and fetch details on mount
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
                await fetchConversations(); // Fetch conversations after verification
            }
        };

        handleUserVerification();
    }, [email, token, navigate]);

    // Initialize Botpress when a conversation is selected
    useEffect(() => {
        if (selectedConversation) {
            initializeBotpress(selectedConversation);
        }
    }, [selectedConversation]);

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

    return (
        <div>
            <CandidateList candidates={[userData]} />

            <div className="conversations">
                <h2>Saved Conversations</h2>
                {conversations.map((conv) => (
                    <button
                        key={conv.conversationId}
                        onClick={() => {
                            setSelectedConversation(conv);
                        }
                    }
                        className="conversation-button"
                    >
                        {conv.conversationId}
                    </button>
                ))}
            </div>

            <div id="webchat-container"></div>
        </div>
    );
};

export default Dashboard;
