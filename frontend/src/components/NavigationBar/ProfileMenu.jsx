import React, { useState, useEffect } from "react";
import { 
  FaCogs, 
  FaKey, 
  FaUserCircle,
  FaUserEdit,
  FaBuilding, 
  FaFileAlt, 
  FaStar, 
  FaEnvelope, 
  FaTrash, 
  FaSignOutAlt 
} from "react-icons/fa";
import showChangePasswordModal from "./modals/ChangePasswordModal";
import showChangePicModal from "./modals/ChangePicModal";
import { showJobSeekerPersonalDetailsModal } from "./modals/PersonalDetailsModal";
import showRecruiterDetailsModal from "./modals/RecruiterDetailsModal";
import showUpdateCVModal from "./modals/UpdateCVModal";
import showEditRelevancePointsModal from "./modals/EditRelevancePointsModal";
import changeMailSubscriptionStatus from "./modals/ChangeMailSubscriptionStatus";
import { useNavigate, useLocation } from "react-router-dom";
import showDeleteAccountModal from './modals/DeleteAccountModal';
import Notification from '../Notification';

const ProfileMenu = ({ userType, user }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notification, setNotification] = useState(null);
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
      navigate("/authentication", { 
        replace: true,
        state: { fromLogout: true }
      });
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
        
        // Show success notification and navigate
        setNotification({
          type: 'success',
          message: 'Account deleted successfully'
        });
        
        // Navigate to auth page after a short delay
        setTimeout(() => {
          navigate('/authentication', { replace: true });
        }, 2000);
      } catch (error) {
        console.error('Error deleting account:', error);
        throw error;
      }
    });
  };

  return (
    <>
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="relative dropdown">
        <button
          className="flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-300 bg-brand-secondary text-brand-primary hover:bg-brand-primary hover:text-brand-secondary shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          onClick={() => setDropdownOpen((prev) => !prev)}
        >
          <FaCogs className="mr-2 text-lg" /> Settings
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-lg py-2 z-50 border border-gray-100">
            {/* Change Password */}
            <button
              className="flex items-center justify-start w-full px-4 py-3 text-gray-700 hover:bg-brand-secondary/40 hover:text-brand-primary hover:border-l-4 hover:border-brand-primary transition-all duration-100"
              onClick={() => {
                setDropdownOpen(false);
                handleChangePassword();
              }}
            >
              <FaKey className="mr-3 text-lg min-w-[24px]" />
              <span className="text-left">Change Password</span>
            </button>

            {/* Change Profile Picture */}
            <button
              className="flex items-center justify-start w-full px-4 py-3 text-gray-700 hover:bg-brand-secondary/40 hover:text-brand-primary hover:border-l-4 hover:border-brand-primary transition-all duration-100"
              onClick={() => {
                setDropdownOpen(false);
                handleChangePic("profile");
              }}
            >
              <FaUserCircle className="mr-3 text-lg min-w-[24px]" />
              <span className="text-left">Change Profile Picture</span>
            </button>

            {/* Recruiter-specific: Change Company Logo */}
            {userType === "Recruiter" && (
              <button
                className="flex items-center justify-start w-full px-4 py-3 text-gray-700 hover:bg-brand-secondary/40 hover:text-brand-primary hover:border-l-4 hover:border-brand-primary transition-all duration-100"
                onClick={() => {
                  setDropdownOpen(false);
                  handleChangePic("company");
                }}
              >
                <FaBuilding className="mr-3 text-lg min-w-[24px]" />
                <span className="text-left">Change Company Logo</span>
              </button>
            )}

            {/* Change Personal Details */}
            <button
              className="flex items-center justify-start w-full px-4 py-3 text-gray-700 hover:bg-brand-secondary/40 hover:text-brand-primary hover:border-l-4 hover:border-brand-primary transition-all duration-100"
              onClick={() => {
                setDropdownOpen(false);
                handleChangePersonalDetails();
              }}
            >
              <FaUserEdit className="mr-3 text-lg min-w-[24px]" />
              <span className="text-left">Change Personal Details</span>
            </button>

            {/* JobSeeker-specific items */}
            {userType === "JobSeeker" && (
              <>
                <button
                  className="flex items-center justify-start w-full px-4 py-3 text-gray-700 hover:bg-brand-secondary/40 hover:text-brand-primary hover:border-l-4 hover:border-brand-primary transition-all duration-100"
                  onClick={() => {
                    setDropdownOpen(false);
                    handleUpdateCV();
                  }}
                >
                  <FaFileAlt className="mr-3 text-lg min-w-[24px]" />
                  <span className="text-left">Update CV</span>
                </button>

                <button
                  className="flex items-center justify-start w-full px-4 py-3 text-gray-700 hover:bg-brand-secondary/40 hover:text-brand-primary hover:border-l-4 hover:border-brand-primary transition-all duration-100"
                  onClick={() => {
                    setDropdownOpen(false);
                    handleEditRelevancePoints();
                  }}
                >
                  <FaStar className="mr-3 text-lg min-w-[24px]" />
                  <span className="text-left">Edit Relevance Points</span>
                </button>
              </>
            )}

            {/* Change Mail Subscription */}
            <button
              className="flex items-center justify-start w-full px-4 py-3 text-gray-700 hover:bg-brand-secondary/40 hover:text-brand-primary hover:border-l-4 hover:border-brand-primary transition-all duration-100"
              onClick={handleChangeMailSubscription}
            >
              <FaEnvelope className="mr-3 text-lg min-w-[24px]" />
              <span className="text-left">Change Mail Subscription</span>
            </button>

            <div className="border-t border-gray-100 my-2"></div>

            {/* Delete Account Button */}
            <button
              className="flex items-center justify-start w-full px-4 py-3 text-red-600 hover:bg-red-200 hover:text-red-700 hover:border-l-4 hover:border-red-600 transition-all duration-100"
              onClick={() => {
                setDropdownOpen(false);
                handleDeleteAccount();
              }}
            >
              <FaTrash className="mr-3 text-lg min-w-[24px]" />
              <span className="text-left">Delete Account</span>
            </button>

            {/* Log Out Button */}
            <button
              className="flex items-center justify-start w-full px-4 py-3 text-red-600 hover:bg-red-200 hover:text-red-700 hover:border-l-4 hover:border-red-600 transition-all duration-100"
              onClick={() => {
                setDropdownOpen(false);
                handleLogout();
              }}
            >
              <FaSignOutAlt className="mr-3 text-lg min-w-[24px]" />
              <span className="text-left">Log Out</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileMenu;
