// NavigationBar.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png";
import NavigationLinks from "./NavigationLinks";
import ProfileMenu from "./ProfileMenu";
import FooterLinks from "./FooterLinks";
import socket from "../../socket";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaComments, FaUser, FaCalendarCheck, FaClipboardCheck } from "react-icons/fa";

const NavigationBar = ({ userType, showOnlyDashboard }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;
  const [notifications, setNotifications] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef(null);

  // Socket & notification logic
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
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
        ) : notificationData.type === "interview" ? (
          <div className="p-4 w-[10%] flex justify-center">
            <FaCalendarCheck className="w-8 h-8 text-red-500 flex-shrink-0" />
          </div>
        ) : notificationData.type === "application_review" ? (
          <div className="p-4 w-[10%] flex justify-center">
            <FaClipboardCheck className="w-8 h-8 text-amber-500 flex-shrink-0" />
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

    socket.on("interviewScheduled", (data) => {
      toast.success(
        <div className="flex items-center space-x-2">
          <div className="p-4 w-[10%] flex justify-center">
            <svg className="w-8 h-8 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 2a1 1 0 011 1v1h6V3a1 1 0 112 0v1h1a2 2 0 012 2v1H3V6a2 2 0 012-2h1V3a1 1 0 011-1zM3 9h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
          </div>
          <span>
            {data.message.length > 30 ? data.message.slice(0, 30) + "..." : data.message}
          </span>
        </div>,
        {
          onClick: () => {
            handleNotificationClick({
              extraData: {
                goToRoute: `/interviews`, // Optional: navigate to interviews page
                stateAddition: { interviewId: data.interview._id },
              },
            });
          },
          autoClose: 6000,
          pauseOnHover: true,
          draggable: true,
          closeButton: false,
          closeOnClick: true,
          pauseOnFocusLoss: true,
          icon: false,
          toastClassName: "cursor-pointer bg-purple-100 text-purple-900 p-4 rounded",
        }
      );
    
      fetchNotifications(); // Optionally update notifications
    });
    
    fetchNotifications();

    return () => {
      socket.off("newNotification");
      socket.disconnect();
    };
  }, [user]);
  
  const handleNotificationClick = (notificationData) => {
    // Create a properly merged state object instead of using localStorage
    const stateAddition = notificationData.extraData?.stateAddition || {};
    
    // Create updated state with all necessary properties
    const updatedState = {
      ...location.state,
      ...stateAddition,
      // Make sure these are passed from notification to state
      highlightApplication: stateAddition.highlightApplication || false,
      applicantId: stateAddition.applicantId,
      jobId: stateAddition.jobId,
      selectedCandidateId: stateAddition.selectedCandidateId,
      refreshToken: (location.state?.refreshToken || 0) + 1,
    };
    
    console.log("Notification clicked, navigating with state:", updatedState);
    navigate(notificationData.extraData?.goToRoute || '/dashboard', { state: updatedState });
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
      
      {/* Footer links in the middle */}
      <div className="ml-4 mr-auto">
        {!showOnlyDashboard ? (
          <FooterLinks user={user} navigate={navigate} location={location} />
        ) : (
          <div className="text-lg font-semibold text-brand-secondary">
            Career Agent Platform
          </div>
        )}
      </div>
      
      {/* Navigation buttons on the right */}
      <div className="flex items-center space-x-4">
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
          showOnlyDashboard={showOnlyDashboard}
        />
        {!showOnlyDashboard && (
          <ProfileMenu
            userType={userType}
            user={user}
            navigate={navigate}
            location={location}
          />
        )}
      </div>
      
      <ToastContainer />
    </div>
  );
};

export default NavigationBar;
