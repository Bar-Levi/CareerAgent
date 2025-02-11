import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBriefcase,
  FaBell,
  FaEnvelope,
  FaCogs,
  FaRobot,
  FaQuestionCircle,
  FaComments,
  FaUser
} from "react-icons/fa";
import logo from "../assets/logo.png"; // Import the logo
import NotificationPanel from './NotificationPanel';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import socket from "../socket"; // Adjust the path as needed


const NavigationBar = ({ userType }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;
  const [notifications, setNotifications] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState(new Map());



  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleNotificationClick = (notificationData) => {
    // Save notification extraData on localStorage.
    localStorage.setItem('stateAddition', JSON.stringify(notificationData.extraData.stateAddition));
    const updatedState = { ...location.state, refreshToken: location.state.refreshToken + 1 };
    console.log("Updated state:", updatedState);
    navigate(notificationData.extraData.goToRoute, {state: updatedState});
  };

  
  useEffect(() => {
      // If the socket isn't already connected, connect it.
      if (!socket.connected) {
        socket.connect();
      }
        
      // Join the room using the user's ID (as a string)
      if (user && user._id) {
        socket.emit("join", user._id);
        console.log("Joined with ID ", user._id);
        console.log("Socket joined room:", user._id);
      }
    
      // Listen for the updateOnlineUsers event
      socket.on("updateOnlineUsers", (onlineUsersData) => {
        setOnlineUsers(onlineUsersData);
      });

      socket.on("user-online", (data) => {
        console.log("User online:", data);
      });

      socket.on("user-offline", (data) => {
        console.log("User offline:", data);
      });

      // Log when connected
      socket.on("connect", () => {
        console.log("Socket connected with ID:", socket.id);
      });
  
      // Listen for new notifications
      socket.on("newNotification", (notificationData) => {
        toast.info(
        <div className="flex items-center space-x-2">
        {notificationData.type === "chat" ? (
          <div className="p-4 w-[10%] flex justify-center">
            <FaComments className="w-8 h-8 text-blue-500 flex-shrink-0" />
          </div>
        ) : notificationData.type === "apply" ? (
          <div className="p-4 w-[10%] flex justify-center">
            <FaUser className="w-8 h-8 text-green-500 flex-shrink-0" />
          </div>
        ) : null}
          <span>
            {notificationData.message.length > 30
              ? notificationData.message.slice(0, 30) + "..."
              : notificationData.message}
          </span>
          </div>,
        {
          onClick: () => {
            handleNotificationClick(notificationData);
          },
          autoClose: 5000,
          pauseOnHover: true,
          draggable: true,
          closeButton: false,
          closeOnClick: true,
          pauseOnFocusLoss: true,
          icon: false,
          toastClassName: "cursor-pointer bg-blue-100 text-blue-900 p-4 rounded",
        }
      );

      fetchNotifications();
      });
      // Clean up on component unmount
      return () => {
      socket.off("updateOnlineUsers");
      socket.off("newNotification");
      socket.disconnect();
      };
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/user-details?email=${encodeURIComponent(user.email)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        const errorMessage = `Error ${response.status}: ${response.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
      const data = await response.json();
      setNotifications(data.notifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error.message);
    }
  };
    
  // Close the panel if a click occurs outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setPanelOpen(false);
      }
    };

    if (panelOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [panelOpen]);

  useEffect(() => {;
    fetchNotifications();
  }, []);

  // Function to determine active styling
  const isActive = (path) =>
    location.pathname === path
      ? "bg-brand-primary text-brand-secondary"
      : "bg-brand-secondary text-brand-primary hover:text-brand-secondary hover:bg-brand-primary";

  // Close dropdown on outside click
  useEffect(() => {
    const closeDropdown = (e) => {
      if (!e.target.closest(".dropdown")) setDropdownOpen(false);
    };
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, []);

  // Logout Function
  const handleLogout = async () => {
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
      localStorage.clear();
      navigate('/authentication', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
      alert('Failed to log out. Please try again.');
    }
  };
  

  return (
    <div className="bg-brand-primary text-brand-primary flex items-center justify-between px-6 py-4">
      <div className="text-lg font-bold flex items-center">
        <img src={logo} alt="Logo" className="h-14 mr-3 rounded" />
      </div>
      <nav className="flex space-x-4">
        <button
          className={`flex items-center px-4 py-2 rounded font-medium transition duration-300 ${isActive(
            "/dashboard"
          )}`}
          onClick={() => navigate("/dashboard", { state: location.state })}
        >
          <FaTachometerAlt className="mr-2" /> Dashboard
        </button>

        {userType === "jobseeker" && (
          <button
            className={`flex items-center px-4 py-2 rounded font-medium transition duration-300 ${isActive(
              "/searchjobs"
            )}`}
            onClick={() => navigate("/searchjobs", { state: location.state })}
          >
            <FaBriefcase className="mr-2" /> Search Jobs
          </button>
        )}

        
<div className="relative">
      <button 
        className="flex items-center px-4 py-2 rounded font-medium transition duration-300 text-brand-secondary"
        onClick={() => setPanelOpen(!panelOpen)}
      >
        <FaBell className="text-xl" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>
      {panelOpen && (
        <div ref={panelRef}>
          <NotificationPanel 
            notifications={notifications}
            setNotifications={setNotifications}
            onClose={() => setPanelOpen(false)}
            handleNotificationClick={handleNotificationClick}
          />
        </div>
      )}
    </div>

        <button
          className={`flex items-center px-4 py-2 rounded font-medium transition duration-300 ${isActive(
            "/messages"
          )}`}
          onClick={() => navigate("/messages", { state: location.state })}
        >
          <FaEnvelope className="mr-2" /> Messages
        </button>
        <button
          className={`flex items-center px-4 py-2 rounded font-medium transition duration-300 ${isActive(
            "/chats"
          )}`}
          onClick={() => navigate("/chats", { state: location.state })}
        >
          <FaRobot className="mr-2" /> Chatbots
        </button>
        <button
          className={`flex items-center px-4 py-2 rounded font-medium transition duration-300 ${isActive(
            "/faq"
          )}`}
          onClick={() => navigate("/faq", { state: location.state })}
        >
          <FaQuestionCircle className="mr-2" /> FAQ
        </button>

        <div className="relative dropdown">
          <button
            className={`flex items-center px-4 py-2 rounded font-medium transition duration-300 ${isActive(
              "/settings"
            )}`}
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            <FaCogs className="mr-2" /> Settings
          </button>

          {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 z-50 flex justify-center">
                <button
                  className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                  onClick={() => {
                    setDropdownOpen(false); // Close the dropdown
                    handleLogout(); // Call the logout function
                  }}
                >
                  Log Out
                </button>
              </div>
            )}
        </div>
      </nav>
    </div>
  );
};
export default NavigationBar;
