// NavigationBar.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png";
import NavigationLinks from "./NavigationLinks";
import ProfileMenu from "./ProfileMenu";
import NotificationBell from "./NotificationBell";
import socket from "../../socket";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaComments, FaUser } from "react-icons/fa";

const NavigationBar = ({ userType }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;
  const [notifications, setNotifications] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef(null);

  // Socket & notification logic
  useEffect(() => {
    socket.connect();
    if (user && user._id) {
      socket.emit("join", user._id);
      console.log("Socket joined room:", user._id);
    }

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

    fetchNotifications();

    return () => {
      socket.off("newNotification");
      socket.disconnect();
    };
  }, [user]);

  const handleNotificationClick = (notificationData) => {
    // Save extra data in localStorage and navigate accordingly.
    localStorage.setItem(
      "stateAddition",
      JSON.stringify(notificationData.extraData.stateAddition)
    );
    const updatedState = {
      ...location.state,
      refreshToken: (location.state.refreshToken || 0) + 1,
    };
    console.log("Updated state:", updatedState);
    navigate(notificationData.extraData.goToRoute, { state: updatedState });
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/user-details?email=${encodeURIComponent(
          user.email
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setNotifications(data.notifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error.message);
    }
  };

  // Close the notification panel if clicking outside
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

  return (
    <div className="w-full bg-brand-primary text-brand-primary px-6 py-4 flex items-center">
      {/* Logo on the left */}
      <div className="flex items-center">
        <img src={logo} alt="Logo" className="h-14 rounded" />
      </div>
      
      {/* Navigation buttons on the right */}
      <div className="ml-auto flex items-center space-x-4">
        <NavigationLinks
          userType={userType}
          location={location}
          navigate={navigate}
          notifications={notifications}
          panelOpen={panelOpen}
          setPanelOpen={setPanelOpen}
          panelRef={panelRef}
          handleNotificationClick={handleNotificationClick}
          setNotifications={setNotifications}
        />
        <ProfileMenu
          userType={userType}
          user={user}
          navigate={navigate}
          location={location}
        />
      </div>
      
      <ToastContainer />
    </div>
  );
};

export default NavigationBar;
