import React, { useState, useEffect } from "react";
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
import logo from "../assets/logo.png"; // Import the logo

const NavigationBar = ({ userType }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);

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

        <button
          className={`flex items-center px-4 py-2 rounded font-medium transition duration-300 ${isActive(
            "/notifications"
          )}`}
          onClick={() => navigate("/notifications", { state: location.state })}
        >
          <FaBell className="mr-2" /> Notifications
        </button>
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
