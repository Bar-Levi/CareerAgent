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
} from "react-icons/fa";
import logo from "../../assets/logo.png";
import NotificationPanel from "../NotificationPanel";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import socket from "../../socket";
import Swal from "sweetalert2";
import { showChangeProfilePicModal } from "./modals/ChangeProfilePictureModal";
import { showChangePasswordModal } from "./modals/ChangePasswordModal";

const NavigationBar = ({ userType }) => {
  const navigate = useNavigate();
  const location = useLocation();
  // Try to read the user object from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user"));
  // Fallback to location state (if needed)
  const user = storedUser || location.state?.user;
  const [notifications, setNotifications] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Handle notification click event
  const handleNotificationClick = (notificationData) => {
    localStorage.setItem(
      "stateAddition",
      JSON.stringify(notificationData.extraData.stateAddition)
    );
    const updatedState = {
      ...location.state,
      refreshToken: (location.state?.refreshToken || 0) + 1,
    };
    navigate(notificationData.extraData.goToRoute, { state: updatedState });
  };

  // Setup socket connection and notifications
  useEffect(() => {
    if (!socket.connected) socket.connect();
    if (user && user._id) socket.emit("join", user._id);
    socket.on("updateOnlineUsers", (data) => {
      // (Optional) Update online users state here.
    });
    socket.on("newNotification", (notificationData) => {
      toast.info(
        <div className="flex items-center space-x-2">
          {notificationData.type === "chat" ? (
            <div className="p-4 w-[10%] flex justify-center">
              <FaBell className="w-8 h-8 text-blue-500 flex-shrink-0" />
            </div>
          ) : (
            <div className="p-4 w-[10%] flex justify-center">
              <FaBell className="w-8 h-8 text-blue-500 flex-shrink-0" />
            </div>
          )}
          <span>
            {notificationData.message.length > 30
              ? notificationData.message.slice(0, 30) + "..."
              : notificationData.message}
          </span>
        </div>,
        {
          onClick: () => handleNotificationClick(notificationData),
          autoClose: 5000,
          pauseOnHover: true,
          draggable: true,
          closeButton: false,
          closeOnClick: true,
          pauseOnFocusLoss: true,
          icon: false,
          toastClassName:
            "cursor-pointer bg-blue-100 text-blue-900 p-4 rounded",
        }
      );
      fetchNotifications();
    });
    return () => {
      socket.off("updateOnlineUsers");
      socket.off("newNotification");
      socket.disconnect();
    };
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/user-details?email=${encodeURIComponent(
          storedUser.email
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok)
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setNotifications(data.notifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error.message);
    }
  };

  // Close notification panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setPanelOpen(false);
      }
    };
    if (panelOpen) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [panelOpen]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const isActive = (path) =>
    location.pathname === path
      ? "bg-brand-primary text-brand-secondary"
      : "bg-brand-secondary text-brand-primary hover:text-brand-secondary hover:bg-brand-primary";

  useEffect(() => {
    const closeDropdown = (e) => {
      if (!e.target.closest(".dropdown")) setDropdownOpen(false);
    };
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      localStorage.clear();
      navigate("/authentication", { replace: true });
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  // ---------- Modal Handlers ----------
  // Helper: Fetch current profile picture URL (using email from localStorage)
  const getCurrentProfilePic = async () => {
    const token = localStorage.getItem("token");
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/personal/profile-pic?email=${encodeURIComponent(storedUser.email)}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch current profile picture");
      const data = await response.json();
      return data.profilePic;
    } catch (error) {
      console.error("Error fetching current profile picture:", error);
      return "https://res.cloudinary.com/careeragent/image/upload/v1735084555/default_profile_image.png";
    }
  };

  const handleChangeProfilePic = async () => {
    const currentPic = await getCurrentProfilePic();
    const result = await showChangeProfilePicModal(currentPic);
    if (result) {
      const token = localStorage.getItem("token");
      // Open a loading modal that remains visible until the fetch completes
      Swal.fire({
        title: "Uploading...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      if (result.action === "delete") {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}/api/personal/profile-pic?email=${encodeURIComponent(JSON.parse(localStorage.getItem("user")).email)}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const data = await response.json();
          if (!response.ok) throw new Error(data.message);
          Swal.fire("Deleted!", data.message, "success");
        } catch (error) {
          Swal.fire("Error", error.message, "error");
        }
      } else if (result.action === "change") {
        try {
          const formData = new FormData();
          formData.append("file", result.file);
          // Append email so backend can use it
          formData.append("email", JSON.parse(localStorage.getItem("user")).email);
          const response = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}/api/personal/change-profile-pic`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            }
          );
          const data = await response.json();
          if (!response.ok) throw new Error(data.message);
          Swal.fire("Updated!", data.message, "success");
        } catch (error) {
          Swal.fire("Error", error.message, "error");
        }
      }
    }
  };

  const handleChangePassword = async () => {
    const result = await showChangePasswordModal();
    if (result) {
      const token = localStorage.getItem("token");
      Swal.fire({
        title: "Processing...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/personal/change-password`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ ...result, email: storedUser.email }),
          }
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        Swal.fire("Password Changed", data.message, "success");
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    }
  };

  return (
    <div className="w-full bg-brand-primary text-brand-primary px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img src={logo} alt="Logo" className="h-14 rounded" />
        </div>
        <div className="flex items-center">
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
              className={`flex items-center px-4 py-2 rounded font-medium transition duration-300 ${isActive("/messages")}`}
              onClick={() => navigate("/messages", { state: location.state })}
            >
              <FaEnvelope className="mr-2" /> Messages
            </button>
            <button
              className={`flex items-center px-4 py-2 rounded font-medium transition duration-300 ${isActive("/chats")}`}
              onClick={() => navigate("/chats", { state: location.state })}
            >
              <FaRobot className="mr-2" /> Chatbots
            </button>
            <button
              className={`flex items-center px-4 py-2 rounded font-medium transition duration-300 ${isActive("/faq")}`}
              onClick={() => navigate("/faq", { state: location.state })}
            >
              <FaQuestionCircle className="mr-2" /> FAQ
            </button>
            <div className="relative dropdown">
              <button
                className={`flex items-center px-4 py-2 rounded font-medium transition duration-300 ${isActive("/settings")}`}
                onClick={() => setDropdownOpen((prev) => !prev)}
              >
                <FaCogs className="mr-2" /> Settings
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 z-50">
                  <button
                    className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-100"
                    onClick={() => {
                      setDropdownOpen(false);
                      handleChangePassword();
                    }}
                  >
                    Change Password
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-100"
                    onClick={() => {
                      setDropdownOpen(false);
                      handleChangeProfilePic();
                    }}
                  >
                    Change Profile Picture
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded"
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default NavigationBar;
