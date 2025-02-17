// NavigationLinks.jsx
import React from "react";
import {
  FaTachometerAlt,
  FaBriefcase,
  FaEnvelope,
  FaRobot,
  FaQuestionCircle,
} from "react-icons/fa";
import NotificationBell from "./NotificationBell";

const NavigationLinks = ({
  userType,
  location,
  navigate,
  notifications,
  panelOpen,
  setPanelOpen,
  panelRef,
  handleNotificationClick,
  setNotifications,
}) => {
  const isActive = (path) =>
    location.pathname === path
      ? "bg-brand-primary text-brand-secondary"
      : "bg-brand-secondary text-brand-primary hover:text-brand-secondary hover:bg-brand-primary";

  const handleNavClick = (path) => {
    navigate(path, { state: location.state });
  };

  return (
    <nav className="flex space-x-4 items-center">
      <NotificationBell
        panelOpen={panelOpen}
        setPanelOpen={setPanelOpen}
        notifications={notifications}
        setNotifications={setNotifications}
        panelRef={panelRef}
        handleNotificationClick={handleNotificationClick}
      />
      <button
        className={`flex items-center px-4 py-2 rounded font-medium transition duration-300 ${isActive(
          "/dashboard"
        )}`}
        onClick={() => handleNavClick("/dashboard")}
      >
        <FaTachometerAlt className="mr-2" /> Dashboard
      </button>
      {userType === "jobseeker" && (
        <button
          className={`flex items-center px-4 py-2 rounded font-medium transition duration-300 ${isActive(
            "/searchjobs"
          )}`}
          onClick={() => handleNavClick("/searchjobs")}
        >
          <FaBriefcase className="mr-2" /> Search Jobs
        </button>
      )}
      <button
        className={`flex items-center px-4 py-2 rounded font-medium transition duration-300 ${isActive(
          "/messages"
        )}`}
        onClick={() => handleNavClick("/messages")}
      >
        <FaEnvelope className="mr-2" /> Messages
      </button>
      <button
        className={`flex items-center px-4 py-2 rounded font-medium transition duration-300 ${isActive(
          "/chats"
        )}`}
        onClick={() => handleNavClick("/chats")}
      >
        <FaRobot className="mr-2" /> Chatbots
      </button>
      <button
        className={`flex items-center px-4 py-2 rounded font-medium transition duration-300 ${isActive(
          "/faq"
        )}`}
        onClick={() => handleNavClick("/faq")}
      >
        <FaQuestionCircle className="mr-2" /> FAQ
      </button>
    </nav>
  );
};

export default NavigationLinks;
