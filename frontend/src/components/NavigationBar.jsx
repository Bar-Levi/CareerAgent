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
  FaUser,
} from "react-icons/fa";
import logo from "../assets/logo.png";
import NotificationPanel from "./NotificationPanel";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import socket from "../socket";
import Swal from "sweetalert2";

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
    localStorage.setItem(
      "stateAddition",
      JSON.stringify(notificationData.extraData.stateAddition)
    );
    const updatedState = {
      ...location.state,
      refreshToken: location.state.refreshToken + 1,
    };
    console.log("Updated state:", updatedState);
    navigate(notificationData.extraData.goToRoute, { state: updatedState });
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
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      localStorage.clear();
      navigate("/authentication", { replace: true });
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  const handleChangePassword = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Change Password",
      html: `
        <div style="position: relative;">
          <i id="toggle-old-password" class="fa fa-eye-slash" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); cursor: pointer;"></i>
          <input type="password" id="old-password" class="swal2-input" placeholder="Old Password" style="padding-left: 2.5rem;">
        </div>
        <div style="position: relative;">
          <i id="toggle-new-password" class="fa fa-eye-slash" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); cursor: pointer;"></i>
          <input type="password" id="new-password" class="swal2-input" placeholder="New Password" style="padding-left: 2.5rem;">
        </div>
        <div style="position: relative;">
          <i id="toggle-confirm-new-password" class="fa fa-eye-slash" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); cursor: pointer;"></i>
          <input type="password" id="confirm-new-password" class="swal2-input" placeholder="Confirm New Password" style="padding-left: 2.5rem;">
        </div>
        <div id="password-strength" style="margin-top:10px; text-align:left; font-size:0.9rem;"></div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const oldPassword = document.getElementById("old-password").value;
        const newPassword = document.getElementById("new-password").value;
        const confirmNewPassword = document.getElementById("confirm-new-password").value;
        if (!oldPassword || !newPassword || !confirmNewPassword) {
          Swal.showValidationMessage("Please enter old password, new password, and confirm new password");
          return;
        }
        if (oldPassword === newPassword) {
          Swal.showValidationMessage("New password cannot be the same as the old password");
          return;
        }
        if (newPassword !== confirmNewPassword) {
          Swal.showValidationMessage("New password and confirm new password do not match");
          return;
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
          Swal.showValidationMessage(
            "New password must include uppercase, lowercase, a number, and be at least 8 characters long."
          );
          return;
        }
        Swal.resetValidationMessage();
        return { oldPassword, newPassword };
      },
      didOpen: () => {
        const oldPasswordInput = document.getElementById("old-password");
        const newPasswordInput = document.getElementById("new-password");
        const confirmNewPasswordInput = document.getElementById("confirm-new-password");
        const strengthDiv = document.getElementById("password-strength");

        // Add eye toggle functionality for each field (icon positioned on the left)
        const toggleOld = document.getElementById("toggle-old-password");
        const toggleNew = document.getElementById("toggle-new-password");
        const toggleConfirm = document.getElementById("toggle-confirm-new-password");

        const addToggleListener = (toggleElem, inputElem) => {
          toggleElem.addEventListener("click", () => {
            if (inputElem.type === "password") {
              inputElem.type = "text";
              toggleElem.classList.remove("fa-eye-slash");
              toggleElem.classList.add("fa-eye");
            } else {
              inputElem.type = "password";
              toggleElem.classList.remove("fa-eye");
              toggleElem.classList.add("fa-eye-slash");
            }
          });
        };

        addToggleListener(toggleOld, oldPasswordInput);
        addToggleListener(toggleNew, newPasswordInput);
        addToggleListener(toggleConfirm, confirmNewPasswordInput);

        // Create fixed-width indicator elements for each field so that all fields align
        let oldIndicator = document.getElementById("old-password-indicator");
        if (!oldIndicator) {
          oldIndicator = document.createElement("span");
          oldIndicator.id = "old-password-indicator";
          oldIndicator.style.marginLeft = "8px";
          oldIndicator.style.display = "inline-block";
          oldIndicator.style.width = "20px";
          oldPasswordInput.parentNode.insertBefore(oldIndicator, oldPasswordInput.nextSibling);
        }
        // Reserve space for the old password field by always inserting a non-breaking space.
        oldIndicator.innerHTML = "&nbsp;";

        let newIndicator = document.getElementById("new-password-indicator");
        if (!newIndicator) {
          newIndicator = document.createElement("span");
          newIndicator.id = "new-password-indicator";
          newIndicator.style.marginLeft = "8px";
          newIndicator.style.display = "inline-block";
          newIndicator.style.width = "20px";
          newPasswordInput.parentNode.insertBefore(newIndicator, newPasswordInput.nextSibling);
        }
        let confirmIndicator = document.getElementById("confirm-new-password-indicator");
        if (!confirmIndicator) {
          confirmIndicator = document.createElement("span");
          confirmIndicator.id = "confirm-new-password-indicator";
          confirmIndicator.style.marginLeft = "8px";
          confirmIndicator.style.display = "inline-block";
          confirmIndicator.style.width = "20px";
          confirmNewPasswordInput.parentNode.insertBefore(confirmIndicator, confirmNewPasswordInput.nextSibling);
        }

        // Strength meter for new password (same design as ResetPassword)
        const calculateStrength = (pwd) => {
          let strength = 0;
          if (pwd.length >= 8) strength++;
          if (/[A-Z]/.test(pwd)) strength++;
          if (/[a-z]/.test(pwd)) strength++;
          if (/[0-9]/.test(pwd)) strength++;
          if (/[^A-Za-z0-9]/.test(pwd)) strength++;
          return strength;
        };

        const getStrengthText = (strength) => {
          switch (strength) {
            case 0:
              return "Enter a password";
            case 1:
              return "Very Weak";
            case 2:
              return "Weak";
            case 3:
              return "Moderate";
            case 4:
              return "Strong";
            case 5:
              return "Very Strong";
            default:
              return "";
          }
        };

        const getStrengthColor = (strength) => {
          switch (strength) {
            case 0:
              return "bg-gray-300";
            case 1:
              return "bg-red-500";
            case 2:
              return "bg-orange-500";
            case 3:
              return "bg-yellow-500";
            case 4:
              return "bg-green-400";
            case 5:
              return "bg-green-600";
            default:
              return "bg-gray-300";
          }
        };

        const updateStrengthMeter = () => {
          const pwd = newPasswordInput.value;
          const strength = calculateStrength(pwd);
          const strengthText = getStrengthText(strength);
          const strengthColor = getStrengthColor(strength);
          strengthDiv.innerHTML = `
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium text-gray-700">${strengthText}</span>
            </div>
            <div class="w-full h-2 bg-gray-200 rounded">
              <div class="h-2 rounded transition-all duration-300 ${strengthColor}" style="width: ${(strength/5)*100}%"></div>
            </div>
          `;
        };

        // Update new and confirm password indicators together:
        const updateNewAndConfirmIndicators = () => {
          const newPwd = newPasswordInput.value;
          const confirmPwd = confirmNewPasswordInput.value;
          if (!newPwd || !confirmPwd) {
            newIndicator.innerHTML = "";
            confirmIndicator.innerHTML = "";
            return;
          }
          if (newPwd === confirmPwd) {
            newIndicator.innerHTML = `<i class="fa fa-check" style="color: green;"></i>`;
            confirmIndicator.innerHTML = `<i class="fa fa-check" style="color: green;"></i>`;
          } else {
            newIndicator.innerHTML = `<i class="fa fa-times" style="color: red;"></i>`;
            confirmIndicator.innerHTML = `<i class="fa fa-times" style="color: red;"></i>`;
          }
        };

        newPasswordInput.addEventListener("input", () => {
          Swal.resetValidationMessage();
          updateStrengthMeter();
          updateNewAndConfirmIndicators();
        });
        confirmNewPasswordInput.addEventListener("input", () => {
          Swal.resetValidationMessage();
          updateNewAndConfirmIndicators();
        });
        oldPasswordInput.addEventListener("input", () => {
          Swal.resetValidationMessage();
          updateNewAndConfirmIndicators();
        });

        // Initialize indicators on modal open
        updateStrengthMeter();
        updateNewAndConfirmIndicators();
      },
    });

    if (formValues) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/personal/change-password`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formValues),
          }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to change password");
        }
        Swal.fire({
          icon: "success",
          title: "Password Changed",
          text: data.message,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message,
        });
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