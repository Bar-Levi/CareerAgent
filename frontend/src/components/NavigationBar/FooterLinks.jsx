import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaShieldAlt, FaFileContract, FaEnvelope } from "react-icons/fa";

const FooterLinks = ({ user, navigate: propNavigate, location }) => {
  // Always call useNavigate unconditionally
  const navigationHook = useNavigate();
  // Then decide which to use
  const navigate = propNavigate || navigationHook;
  
  const [isOpen, setIsOpen] = useState(false);
  
  // For small screens, toggle dropdown
  const toggleDropdown = () => setIsOpen(!isOpen);

  // Function to handle navigation with user state
  const handleNavigate = (path) => {
    // When navigating to contact, include user data
    if (path === "/contact") {
      navigate(path, { 
        state: { 
          ...location?.state,
          user: user 
        } 
      });
    } else {
      navigate(path, { state: location?.state });
    }
    
    // Close dropdown if open
    if (isOpen) {
      setIsOpen(false);
    }
  };
  
  return (
    <div className="relative">
      {/* Desktop view */}
      <div className="hidden md:flex items-center space-x-3 text-brand-secondary text-sm">
        <button
          onClick={() => handleNavigate("/privacy-policy")}
          className="flex items-center hover:text-white transition-colors duration-200"
        >
          <FaShieldAlt className="mr-1" /> Privacy
        </button>
        <span className="text-gray-400">|</span>
        <button
          onClick={() => handleNavigate("/terms-and-conditions")}
          className="flex items-center hover:text-white transition-colors duration-200"
        >
          <FaFileContract className="mr-1" /> Terms
        </button>
        <span className="text-gray-400">|</span>
        <button
          onClick={() => handleNavigate("/contact")}
          className="flex items-center hover:text-white transition-colors duration-200"
        >
          <FaEnvelope className="mr-1" /> Contact
        </button>
      </div>
      
      {/* Mobile view - dropdown */}
      <div className="md:hidden">
        <button 
          onClick={toggleDropdown}
          className="flex items-center text-brand-secondary hover:text-white"
        >
          <span className="text-xs">Legal</span>
          <svg className={`ml-1 h-4 w-4 transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute left-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1" role="menu">
              <button
                onClick={() => handleNavigate("/privacy-policy")}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <FaShieldAlt className="inline mr-2" /> Privacy Policy
              </button>
              <button
                onClick={() => handleNavigate("/terms-and-conditions")}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <FaFileContract className="inline mr-2" /> Terms & Conditions
              </button>
              <button
                onClick={() => handleNavigate("/contact")}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <FaEnvelope className="inline mr-2" /> Contact Us
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FooterLinks; 