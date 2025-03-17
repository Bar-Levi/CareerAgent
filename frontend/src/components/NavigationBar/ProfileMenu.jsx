import React, { useState, useEffect } from "react";
import { FaCogs } from "react-icons/fa";
import showChangePasswordModal from "./modals/ChangePasswordModal";
import showChangeProfilePicModal from "./modals/ChangeProfilePicModal";
import { showJobSeekerPersonalDetailsModal } from "./modals/PersonalDetailsModal";
import showRecruiterDetailsModal from "./modals/RecruiterDetailsModal";
import showUpdateCVModal from "./modals/UpdateCVModal";
import showEditRelevancePointsModal from "./modals/EditRelevancePointsModal";
import changeMailSubscriptionStatus from "./modals/ChangeMailSubscriptionStatus";
import { useNavigate, useLocation } from "react-router-dom";

const ProfileMenu = ({ userType, user }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const closeDropdown = (e) => {
      if (!e.target.closest(".dropdown")) setDropdownOpen(false);
    };
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, []);

  const handleChangePassword = () => {
    showChangePasswordModal(user);
  };

  const handleChangeProfilePic = () => {
    showChangeProfilePicModal(user);
  };

  const handleChangePersonalDetails = () => {
    if (userType === "JobSeeker") {
      showJobSeekerPersonalDetailsModal(user, navigate, location);
    } else if (userType === "Recruiter") {
      showRecruiterDetailsModal(user);
    }
  };

  const handleUpdateCV = () => {
    showUpdateCVModal(user, navigate, location);
  };

  const handleEditRelevancePoints = () => {
    showEditRelevancePointsModal(user, navigate, location);
  };

  const handleChangeMailSubscription = () => {
    setDropdownOpen(false);
    changeMailSubscriptionStatus(user, navigate, location);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      localStorage.clear();
      sessionStorage.clear();
      navigate("/authentication", { replace: true });
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  return (
    <div className="relative dropdown">
      <button
        className="flex items-center px-4 py-2 rounded font-medium transition duration-300 bg-brand-secondary text-brand-primary hover:bg-brand-primary hover:text-brand-secondary"
        onClick={() => setDropdownOpen((prev) => !prev)}
      >
        <FaCogs className="mr-2" /> Settings
      </button>
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-brand-secondary shadow-lg rounded-md py-2 z-50">
          <button
            className="block w-full text-left px-4 py-2 text-brand-primary hover:bg-brand-primary hover:text-brand-secondary"
            onClick={() => {
              setDropdownOpen(false);
              handleChangePassword();
            }}
          >
            Change Password
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-brand-primary hover:bg-brand-primary hover:text-brand-secondary"
            onClick={() => {
              setDropdownOpen(false);
              handleChangeProfilePic();
            }}
          >
            Change Profile Picture
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-brand-primary hover:bg-brand-primary hover:text-brand-secondary"
            onClick={() => {
              setDropdownOpen(false);
              handleChangePersonalDetails();
            }}
          >
            Change Personal Details
          </button>
          {userType === "JobSeeker" && (
            <>
              <button
                className="block w-full text-left px-4 py-2 text-brand-primary hover:bg-brand-primary hover:text-brand-secondary"
                onClick={() => {
                  setDropdownOpen(false);
                  handleUpdateCV();
                }}
              >
                Update CV
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-brand-primary hover:bg-brand-primary hover:text-brand-secondary"
                onClick={() => {
                  setDropdownOpen(false);
                  handleEditRelevancePoints();
                }}
              >
                Edit Relevance Points
              </button>
            </>
          )}
          <button
            className="block w-full text-left px-4 py-2 text-brand-primary hover:bg-brand-primary hover:text-brand-secondary"
            onClick={handleChangeMailSubscription}
          >
            Change Mail Subscription
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
  );
};

export default ProfileMenu;
