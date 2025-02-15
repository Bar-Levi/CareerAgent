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
  FaBirthdayCake,
  FaPhone,
  FaGithub,
  FaLinkedin,
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
    // Save notification extraData on localStorage.
    localStorage.setItem('stateAddition', JSON.stringify(notificationData.extraData.stateAddition));
    const updatedState = { ...location.state, refreshToken: location.state.refreshToken + 1 };
    console.log("Updated state:", updatedState);
    navigate(notificationData.extraData.goToRoute, {state: updatedState});
  };

  
  useEffect(() => {
          // Connect the socket
          socket.connect();
          
          // Join the room using the user's ID (as a string)
          if (user && user._id) {
            socket.emit("join", user._id);
            console.log("Socket joined room:", user._id);
          }
        
          // Listen for the updateOnlineUsers event
          socket.on("updateOnlineUsers", (onlineUsersData) => {
            console.log("Updated online users:", onlineUsersData);
            // Here, you can update your state.
            // For simplicity, we store the array of online user IDs.
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

  // -------------------- Logout --------------------
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

  // -------------------- Profile Picture Functions --------------------
  const getCurrentProfilePic = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/personal/profile-pic?email=${encodeURIComponent(
          user.email
        )}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok)
        throw new Error("Failed to fetch current profile picture");
      const data = await response.json();
      return data.profilePic;
    } catch (error) {
      console.error("Error fetching current profile picture:", error);
      return "https://res.cloudinary.com/careeragent/image/upload/v1735084555/default_profile_image.png";
    }
  };

  const handleChangeProfilePic = async () => {
    const currentPic = await getCurrentProfilePic();
    const { value: result } = await Swal.fire({
      title: "Change Profile Picture",
      html: `
        <div class="flex flex-col items-center bg-white p-4 rounded-lg">
          <div class="w-36 h-36 rounded-full overflow-hidden mb-4">
            <img id="profile-preview" src="${currentPic}" alt="Profile Picture" class="object-cover w-full h-full" style="cursor: pointer;">
          </div>
          <input type="file" id="profile-input" accept="image/*" class="hidden">
          <div class="flex space-x-4">
            <button id="change-btn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded focus:outline-none">Change Picture</button>
            <button id="delete-btn" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded focus:outline-none">Delete Picture</button>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "OK",
      preConfirm: async () => {
        Swal.showLoading();
        const token = localStorage.getItem("token");
        const changeBtn = document.getElementById("change-btn");
        const deleteBtn = document.getElementById("delete-btn");
        const fileInput = document.getElementById("profile-input");

        const changeClicked =
          changeBtn && changeBtn.dataset.action === "change";
        const deleteClicked =
          deleteBtn && deleteBtn.dataset.action === "delete";

        if (deleteClicked) {
          const response = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}/api/personal/profile-pic?email=${encodeURIComponent(
              user.email
            )}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const data = await response.json();
          if (!response.ok)
            throw new Error(data.message || "Failed to delete profile picture");
          return { action: "delete", message: data.message };
        }
        if (changeClicked) {
          if (!fileInput || fileInput.files.length === 0) {
            Swal.showValidationMessage("Please select a file.");
          } else {
            const formData = new FormData();
            formData.append("file", fileInput.files[0]);
            formData.append("email", user.email);
            const response = await fetch(
              `${process.env.REACT_APP_BACKEND_URL}/api/personal/change-profile-pic`,
              {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
              }
            );
            const data = await response.json();
            if (!response.ok)
              throw new Error(data.message || "Failed to update profile picture");
            return { action: "change", message: data.message };
          }
        }
        return null;
      },
      didOpen: () => {
        const changeBtn = document.getElementById("change-btn");
        const deleteBtn = document.getElementById("delete-btn");
        const fileInput = document.getElementById("profile-input");
        const previewImg = document.getElementById("profile-preview");

        if (changeBtn) {
          changeBtn.dataset.action = "";
          changeBtn.addEventListener("click", () => {
            if (fileInput) fileInput.click();
          });
        }
        if (deleteBtn) {
          deleteBtn.dataset.action = "";
          deleteBtn.addEventListener("click", () => {
            deleteBtn.dataset.action = "delete";
            if (changeBtn) changeBtn.dataset.action = "";
            if (previewImg)
              previewImg.src =
                "https://res.cloudinary.com/careeragent/image/upload/v1735084555/default_profile_image.png";
          });
        }
        if (fileInput && previewImg) {
          fileInput.addEventListener("change", () => {
            if (fileInput.files && fileInput.files[0]) {
              const reader = new FileReader();
              reader.onload = (e) => {
                previewImg.src = e.target.result;
              };
              reader.readAsDataURL(fileInput.files[0]);
              if (changeBtn) changeBtn.dataset.action = "change";
              if (deleteBtn) deleteBtn.dataset.action = "";
            }
          });
        }
        if (previewImg) {
          previewImg.addEventListener("click", () => {
            const overlay = document.createElement("div");
            overlay.style.position = "fixed";
            overlay.style.top = "0";
            overlay.style.left = "0";
            overlay.style.width = "100%";
            overlay.style.height = "100%";
            overlay.style.backgroundColor = "rgba(0, 0, 0, 0.85)";
            overlay.style.display = "flex";
            overlay.style.alignItems = "center";
            overlay.style.justifyContent = "center";
            overlay.style.zIndex = "9999";

            const fullImg = document.createElement("img");
            fullImg.src = previewImg.src;
            fullImg.style.maxWidth = "90%";
            fullImg.style.maxHeight = "90%";
            fullImg.style.borderRadius = "10px";

            const closeBtn = document.createElement("button");
            closeBtn.textContent = "Close Preview";
            closeBtn.style.position = "absolute";
            closeBtn.style.top = "20px";
            closeBtn.style.right = "20px";
            closeBtn.style.padding = "10px 20px";
            closeBtn.style.backgroundColor = "#fff";
            closeBtn.style.border = "none";
            closeBtn.style.borderRadius = "5px";
            closeBtn.style.cursor = "pointer";

            closeBtn.addEventListener("click", () => {
              document.body.removeChild(overlay);
            });

            overlay.appendChild(fullImg);
            overlay.appendChild(closeBtn);
            document.body.appendChild(overlay);
          });
        }
      },
    });

    if (result) {
      if (result.action === "delete") {
        Swal.fire("Deleted!", result.message, "success");
      } else if (result.action === "change") {
        Swal.fire("Updated!", result.message, "success");
      }
    }
  };

  // -------------------- Change Password --------------------
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
        const oldPassword = document.getElementById("old-password")?.value;
        const newPassword = document.getElementById("new-password")?.value;
        const confirmNewPassword = document.getElementById("confirm-new-password")?.value;
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
          Swal.showValidationMessage("New password must include uppercase, lowercase, a number, and be at least 8 characters long.");
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

        const toggleOld = document.getElementById("toggle-old-password");
        const toggleNew = document.getElementById("toggle-new-password");
        const toggleConfirm = document.getElementById("toggle-confirm-new-password");

        const addToggleListener = (toggleElem, inputElem) => {
          if (toggleElem && inputElem) {
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
          }
        };

        addToggleListener(toggleOld, oldPasswordInput);
        addToggleListener(toggleNew, newPasswordInput);
        addToggleListener(toggleConfirm, confirmNewPasswordInput);

        let oldIndicator = document.getElementById("old-password-indicator");
        if (!oldIndicator && oldPasswordInput) {
          oldIndicator = document.createElement("span");
          oldIndicator.id = "old-password-indicator";
          oldIndicator.style.marginLeft = "8px";
          oldIndicator.style.display = "inline-block";
          oldIndicator.style.width = "20px";
          oldPasswordInput.parentNode.insertBefore(oldIndicator, oldPasswordInput.nextSibling);
        }
        if (oldIndicator) oldIndicator.innerHTML = "&nbsp;";

        let newIndicator = document.getElementById("new-password-indicator");
        if (!newIndicator && newPasswordInput) {
          newIndicator = document.createElement("span");
          newIndicator.id = "new-password-indicator";
          newIndicator.style.marginLeft = "8px";
          newIndicator.style.display = "inline-block";
          newIndicator.style.width = "20px";
          newPasswordInput.parentNode.insertBefore(newIndicator, newPasswordInput.nextSibling);
        }
        let confirmIndicator = document.getElementById("confirm-new-password-indicator");
        if (!confirmIndicator && confirmNewPasswordInput) {
          confirmIndicator = document.createElement("span");
          confirmIndicator.id = "confirm-new-password-indicator";
          confirmIndicator.style.marginLeft = "8px";
          confirmIndicator.style.display = "inline-block";
          confirmIndicator.style.width = "20px";
          confirmNewPasswordInput.parentNode.insertBefore(confirmIndicator, confirmNewPasswordInput.nextSibling);
        }

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
              return "Enter a new password";
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
          const pwd = newPasswordInput ? newPasswordInput.value : "";
          const strength = calculateStrength(pwd);
          const strengthText = getStrengthText(strength);
          const strengthColor = getStrengthColor(strength);
          if (strengthDiv) {
            strengthDiv.innerHTML = `
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium text-gray-700">${strengthText}</span>
              </div>
              <div class="w-full h-2 bg-gray-200 rounded">
                <div class="h-2 rounded transition-all duration-300 ${strengthColor}" style="width: ${(strength/5)*100}%"></div>
              </div>
            `;
          }
        };

        const updateNewAndConfirmIndicators = () => {
          const newPwd = newPasswordInput ? newPasswordInput.value : "";
          const confirmPwd = confirmNewPasswordInput ? confirmNewPasswordInput.value : "";
          if (!newPwd || !confirmPwd) {
            if(newIndicator) newIndicator.innerHTML = "";
            if(confirmIndicator) confirmIndicator.innerHTML = "";
            return;
          }
          if (newPwd === confirmPwd) {
            if(newIndicator) newIndicator.innerHTML = `<i class="fa fa-check" style="color: green;"></i>`;
            if(confirmIndicator) confirmIndicator.innerHTML = `<i class="fa fa-check" style="color: green;"></i>`;
          } else {
            if(newIndicator) newIndicator.innerHTML = `<i class="fa fa-times" style="color: red;"></i>`;
            if(confirmIndicator) confirmIndicator.innerHTML = `<i class="fa fa-times" style="color: red;"></i>`;
          }
        };

        if(newPasswordInput) {
          newPasswordInput.addEventListener("input", () => {
            Swal.resetValidationMessage();
            updateStrengthMeter();
            updateNewAndConfirmIndicators();
          });
        }
        if(confirmNewPasswordInput) {
          confirmNewPasswordInput.addEventListener("input", () => {
            Swal.resetValidationMessage();
            updateNewAndConfirmIndicators();
          });
        }
        if(oldPasswordInput) {
          oldPasswordInput.addEventListener("input", () => {
            Swal.resetValidationMessage();
            updateNewAndConfirmIndicators();
          });
        }
        updateStrengthMeter();
        updateNewAndConfirmIndicators();
      }
    });
    if (formValues) {
      try {
        const token = localStorage.getItem("token");
        formValues.email = user.email;
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

  // -------------------- Personal Details Functions --------------------

  // For jobseeker: Reset a personal detail via POST.
  const handleResetPersonalDetail = async (type, label) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/personal/reset-job-seeker-details`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email: user.email, type }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Failed to reset ${label}`);
      }
      Swal.fire("Reset!", data.message, "success");
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  // For jobseeker: Edit a personal detail with integrated Reset option.
  const handleEditPersonalDetail = async (type, label) => {
    try {
      const getResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/personal/job-seeker-details?email=${encodeURIComponent(
          user.email
        )}&type=${type}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!getResponse.ok) {
        throw new Error("Failed to fetch current detail");
      }
      const getData = await getResponse.json();
      let currentValue = getData[type] || "Not set";
      if (type === "dob" && currentValue !== "Not set") {
        currentValue = new Date(currentValue).toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        });
      }
      const inputField =
        type === "dob"
          ? `<input type="date" id="swal-input-new" class="swal2-input" />`
          : `<input id="swal-input-new" class="swal2-input" placeholder="Enter new ${label}" />`;
      const { isConfirmed, isDenied, value: newValue } = await Swal.fire({
        title: `Change ${label}`,
        html: `
          <div>
            <p>Current ${label}: ${currentValue}</p>
            ${inputField}
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: "Update",
        denyButtonText: "Reset",
        preConfirm: () => {
          const inputValue = document.getElementById("swal-input-new")?.value;
          if (!inputValue) {
            Swal.showValidationMessage(`Please enter a new ${label}`);
          }
          return inputValue;
        },
      });
      if (isConfirmed) {
        const token = localStorage.getItem("token");
        const updateResponse = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/personal/update-job-seeker-details`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              email: user.email,
              type,
              value: newValue,
            }),
          }
        );
        const updateData = await updateResponse.json();
        if (!updateResponse.ok) {
          throw new Error(updateData.message || "Failed to update detail");
        }
        Swal.fire("Updated!", `Your ${label} has been updated.`, "success");
      } else if (isDenied) {
        await handleResetPersonalDetail(type, label);
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", error.message, "error");
    }
  };

  // For recruiter: Edit a personal detail via backend.
  const handleEditRecruiterPersonalDetail = async (type, label) => {
    try {
      const getResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/recruiter-personal/recruiter-details?email=${encodeURIComponent(
          user.email
        )}&type=${type}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!getResponse.ok) {
        throw new Error("Failed to fetch current detail");
      }
      const getData = await getResponse.json();
      let currentValue;
      if (type.toLowerCase() === "dob") {
        if (currentValue !== "Not set") {
          currentValue = getData.dob;
          console.log(currentValue);
          // Use "en-GB" locale for dd/mm/yyyy format
          currentValue = new Date(currentValue).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        }
      } else if (type.toLowerCase() === "companywebsite") {
        currentValue = getData.companyWebsite || "Not set";
      } else {
        currentValue = "Not set";
      }
      const inputField =
        type.toLowerCase() === "dob"
          ? `<input type="date" id="swal-input-new" class="swal2-input" />`
          : `<input id="swal-input-new" class="swal2-input" placeholder="Enter new ${label}" />`;
      const { isConfirmed, isDenied, value: newValue } = await Swal.fire({
        title: `Change ${label}`,
        html: `
          <div>
            <p>Current ${label}: ${currentValue}</p>
            ${inputField}
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: "Update",
        denyButtonText: "Reset",
        preConfirm: () => {
          const inputValue = document.getElementById("swal-input-new")?.value;
          if (!inputValue) {
            Swal.showValidationMessage(`Please enter a new ${label}`);
          }
          return inputValue;
        },
      });
      if (isConfirmed) {
        const token = localStorage.getItem("token");
        const updateResponse = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/recruiter-personal/update-recruiter-details`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              email: user.email,
              type,
              value: newValue,
            }),
          }
        );
        const updateData = await updateResponse.json();
        if (!updateResponse.ok) {
          throw new Error(updateData.message || "Failed to update detail");
        }
        Swal.fire("Updated!", `Your ${label} has been updated.`, "success");
      } else if (isDenied) {
        // Reset: POST update with an empty string.
        const token = localStorage.getItem("token");
        const resetResponse = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/recruiter-personal`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              email: user.email,
              type,
              value: "",
            }),
          }
        );
        const resetData = await resetResponse.json();
        if (!resetResponse.ok) {
          throw new Error(resetData.message || `Failed to reset ${label}`);
        }
        Swal.fire("Reset!", resetData.message, "success");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", error.message, "error");
    }
  };

  // For jobseeker: Show modal to change personal details.
  const handleChangeJobSeekerPersonalDetails = async () => {
    await Swal.fire({
      title: "Change Personal Details",
      html: `
        <div class="flex flex-col space-y-4">
          <button id="change-dob" class="flex items-center justify-center p-4 border border-gray-300 rounded hover:bg-blue-100">
            <i class="fas fa-birthday-cake" style="margin-right: 8px;"></i>Change Date of Birth
          </button>
          <button id="change-phone" class="flex items-center justify-center p-4 border border-gray-300 rounded hover:bg-blue-100">
            <i class="fas fa-phone" style="margin-right: 8px;"></i>Change Phone Number
          </button>
          <button id="change-github" class="flex items-center justify-center p-4 border border-gray-300 rounded hover:bg-blue-100">
            <i class="fab fa-github" style="margin-right: 8px;"></i>Change Github Link
          </button>
          <button id="change-linkedin" class="flex items-center justify-center p-4 border border-gray-300 rounded hover:bg-blue-100">
            <i class="fab fa-linkedin" style="margin-right: 8px;"></i>Change LinkedIn URL
          </button>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Close",
      focusConfirm: false,
      didOpen: () => {
        setTimeout(() => {
          const changeDob = document.getElementById("change-dob");
          if (changeDob) {
            changeDob.addEventListener("click", () => {
              handleEditPersonalDetail("dob", "Date of Birth");
            });
          }
          const changePhone = document.getElementById("change-phone");
          if (changePhone) {
            changePhone.addEventListener("click", () => {
              handleEditPersonalDetail("phone", "Phone Number");
            });
          }
          const changeGithub = document.getElementById("change-github");
          if (changeGithub) {
            changeGithub.addEventListener("click", () => {
              handleEditPersonalDetail("github", "Github URL");
            });
          }
          const changeLinkedin = document.getElementById("change-linkedin");
          if (changeLinkedin) {
            changeLinkedin.addEventListener("click", () => {
              handleEditPersonalDetail("linkedin", "LinkedIn URL");
            });
          }
        }, 100);
      },
    });
  };

  // For recruiter: Show modal to change personal details.
  const handleChangeRecruiterPersonalDetails = async () => {
    await Swal.fire({
      title: "Change Personal Details",
      html: `
        <div class="flex flex-col space-y-4">
          <button id="recruiter-change-dob" class="flex items-center justify-center p-4 border border-gray-300 rounded hover:bg-blue-100">
            <i class="fas fa-birthday-cake" style="margin-right: 8px;"></i>Change Date of Birth
          </button>
          <button id="recruiter-change-company" class="flex items-center justify-center p-4 border border-gray-300 rounded hover:bg-blue-100">
            <i class="fas fa-globe" style="margin-right: 8px;"></i>Change Company Website
          </button>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Close",
      focusConfirm: false,
      didOpen: () => {
        setTimeout(() => {
          const changeDob = document.getElementById("recruiter-change-dob");
          if (changeDob) {
            changeDob.addEventListener("click", () => {
              handleEditRecruiterPersonalDetail("dob", "Date of Birth");
            });
          }
          const changeCompany = document.getElementById("recruiter-change-company");
          if (changeCompany) {
            changeCompany.addEventListener("click", () => {
              handleEditRecruiterPersonalDetail("companywebsite", "Company Website");
            });
          }
        }, 100);
      },
    });
  };

  // -------------------- Render --------------------
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
                onClick={() =>
                  navigate("/searchjobs", { state: location.state })
                }
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
                    className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-100"
                    onClick={() => {
                      setDropdownOpen(false);
                      handleChangeProfilePic();
                    }}
                  >
                    Change Profile Picture
                  </button>
                  {userType === "jobseeker" && (
                    <button
                      className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-100"
                      onClick={() => {
                        setDropdownOpen(false);
                        handleChangeJobSeekerPersonalDetails();
                      }}
                    >
                      Change Personal Details
                    </button>
                  )}
                  {userType === "recruiter" && (
                    <button
                      className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-100"
                      onClick={() => {
                        setDropdownOpen(false);
                        handleChangeRecruiterPersonalDetails();
                      }}
                    >
                      Change Personal Details
                    </button>
                  )}
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
