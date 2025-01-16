import React from "react";
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
const NavigationBar = ({userType}) => {
  const navigate = useNavigate();
  const location = useLocation(); // Get the current route

  // Function to determine active styling
  const isActive = (path) =>
    location.pathname === path
      ? "bg-brand-primary text-brand-secondary" // Active styling
      : "bg-brand-secondary text-brand-primary hover:text-brand-secondary hover:bg-brand-primary"; // Default styling

  return (
    <div className="bg-brand-primary text-brand-primary flex items-center justify-between px-6 py-4">
      <div className="text-lg font-bold flex items-center">
        <img
          src={logo}
          alt="Logo"
          className="h-14 mr-3 rounded"
        />
      </div>
      <nav className="flex space-x-4">
        <button
          className={`flex items-center px-4 py-2 rounded font-medium transition duration-300 ${isActive(
            "/dashboard"
          )}`}
          onClick={() => navigate("/dashboard", { state: location.state})}
        >
          <FaTachometerAlt className="mr-2" /> Dashboard
        </button>

          { userType === 'jobseeker' &&
        <button
          className={`flex items-center px-4 py-2 rounded font-medium transition duration-300 ${isActive(
            "/searchjobs"
          )}`}
          onClick={() => navigate("/searchjobs", { state: location.state})}
        >
          <FaBriefcase className="mr-2" /> Search Jobs
        </button>
          }

        <button
          className={`flex items-center px-4 py-2 rounded font-medium transition duration-300 ${isActive(
            "/notifications"
          )}`}
          onClick={() => navigate("/notifications", { state: location.state})}
        >
          <FaBell className="mr-2" /> Notifications
        </button>
        <button
          className={`flex items-center px-4 py-2 rounded font-medium transition duration-300 ${isActive(
            "/messages"
          )}`}
          onClick={() => navigate("/messages", { state: location.state})}
        >
          <FaEnvelope className="mr-2" /> Messages
        </button>
        <button
          className={`flex items-center px-4 py-2 rounded font-medium transition duration-300 ${isActive(
            "/chats"
          )}`}
          onClick={() => navigate("/chats", { state: location.state})}
        >
          <FaRobot className="mr-2" /> Chatbots
        </button>
        <button
          className={`flex items-center px-4 py-2 rounded font-medium transition duration-300 ${isActive(
            "/faq"
          )}`}
          onClick={() => navigate("/faq", { state: location.state})}
        >
          <FaQuestionCircle className="mr-2" /> FAQ
        </button>
        <button
          className={`flex items-center px-4 py-2 rounded font-medium transition duration-300 ${isActive(
            "/settings"
          )}`}
          onClick={() => navigate("/settings", { state: location.state})}
        >
          <FaCogs className="mr-2" /> Settings
        </button>
      </nav>
    </div>
  );
};

export default NavigationBar;
