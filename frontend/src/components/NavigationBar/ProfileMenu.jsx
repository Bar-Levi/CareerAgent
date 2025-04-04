import React, { useState, useEffect } from "react";
import { FaCogs } from "react-icons/fa";
import showChangePasswordModal from "./modals/ChangePasswordModal";
import showChangePicModal from "./modals/ChangePicModal";
import { showJobSeekerPersonalDetailsModal } from "./modals/PersonalDetailsModal";
import showRecruiterDetailsModal from "./modals/RecruiterDetailsModal";
import showUpdateCVModal from "./modals/UpdateCVModal";
import showEditRelevancePointsModal from "./modals/EditRelevancePointsModal";
import changeMailSubscriptionStatus from "./modals/ChangeMailSubscriptionStatus";
import { useNavigate, useLocation } from "react-router-dom";
import showDeleteAccountModal from './modals/DeleteAccountModal';

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

  /**
   * Single function for changing pictures.
   * @param {string} picType - "profile" or "company"
   */
  const handleChangePic = (picType = "profile") => {
    showChangePicModal(user, navigate, location, picType);
  };

  const handleChangePersonalDetails = () => {
    if (userType === "JobSeeker") {
      showJobSeekerPersonalDetailsModal(user, navigate, location);
    } else if (userType === "Recruiter") {
      showRecruiterDetailsModal(user, navigate, location);
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

  const handleDeleteAccount = async () => {
    setDropdownOpen(false);
    showDeleteAccountModal(async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/auth/delete-user/${user._id}/${userType}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem("token")}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to delete account');
        }

        // Clear local storage and session storage
        localStorage.clear();
        sessionStorage.clear();
        
        // Navigate to auth page
        navigate('/authentication', { replace: true });
      } catch (error) {
        console.error('Error deleting account:', error);
        throw error; // Re-throw to handle in the modal
      }
    });
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
          {/* Change Password */}
          <button
            className="block w-full text-left px-4 py-2 text-brand-primary hover:bg-brand-primary hover:text-brand-secondary"
            onClick={() => {
              setDropdownOpen(false);
              handleChangePassword();
            }}
          >
            Change Password
          </button>

          {/* Change Profile Picture (always shown) */}
          <button
            className="block w-full text-left px-4 py-2 text-brand-primary hover:bg-brand-primary hover:text-brand-secondary"
            onClick={() => {
              setDropdownOpen(false);
              handleChangePic("profile"); // <== pass "profile" as the picType
            }}
          >
            Change Profile Picture
          </button>

          {/* Recruiter-specific: Change Company Logo */}
          {userType === "Recruiter" && (
            <button
              className="block w-full text-left px-4 py-2 text-brand-primary hover:bg-brand-primary hover:text-brand-secondary"
              onClick={() => {
                setDropdownOpen(false);
                handleChangePic("company"); // <== pass "company" as the picType
              }}
            >
              Change Company Logo
            </button>
          )}

          {/* Change Personal Details */}
          <button
            className="block w-full text-left px-4 py-2 text-brand-primary hover:bg-brand-primary hover:text-brand-secondary"
            onClick={() => {
              setDropdownOpen(false);
              handleChangePersonalDetails();
            }}
          >
            Change Personal Details
          </button>

          {/* JobSeeker-specific items */}
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

          {/* Change Mail Subscription */}
          <button
            className="block w-full text-left px-4 py-2 text-brand-primary hover:bg-brand-primary hover:text-brand-secondary"
            onClick={handleChangeMailSubscription}
          >
            Change Mail Subscription
          </button>

          {/* Delete Account Button */}
          <button
            className="block w-full text-left px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded"
            onClick={() => {
              setDropdownOpen(false);
              handleDeleteAccount();
            }}
          >
            Delete Account
          </button>

          {/* Log Out Button */}
          <button
            className="block w-full text-left px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded mt-2"
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
