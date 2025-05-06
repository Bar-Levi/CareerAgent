import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import Botpress from '../botpress/Botpress';
import { 
  FaShieldAlt, 
  FaUserCheck, 
  FaUserLock, 
  FaUsersCog, 
  FaUserShield, 
  FaDatabase, 
  FaEraser, 
  FaBan, 
  FaPencilAlt, 
  FaComments, 
  FaChevronDown,
  FaChevronUp,
  FaMoon,
  FaSun,
  FaTimes,
} from 'react-icons/fa';

// Google Fonts CSS import
const GoogleFonts = () => {
  return (
    <style jsx global>{`
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
    `}</style>
  );
};

const TermsAndConditions = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    // Check for dark mode preference in localStorage
    const savedDarkMode = localStorage.getItem('careeragent_darkmode');
    if (savedDarkMode === 'true') {
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('careeragent_darkmode', newMode.toString());
  };

  const handleClose = () => {
    // Check if we have a history to go back to
    if (window.history.length > 1) {
      navigate(-1); // Go back to previous page if possible
    } else {
      // If we're in a new tab or there's no history, try to close the window
      window.close();
    }
  };

  const toggleSection = (index) => {
    setExpandedSections(prevSections => {
      const newSections = new Set(prevSections);
      if (newSections.has(index)) {
        newSections.delete(index);
      } else {
        newSections.add(index);
      }
      return newSections;
    });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 200, damping: 15 }
    }
  };

  const termsData = [
    {
      id: 1,
      title: "Eligibility",
      icon: <FaUserCheck />,
      content: [
        "You must be at least 18 years old to register as a recruiter or job seeker.",
        "You agree to provide accurate, current, and complete information during registration."
      ]
    },
    {
      id: 2,
      title: "Account Responsibilities",
      icon: <FaUserLock />,
      content: [
        "You are responsible for maintaining the confidentiality of your account credentials and ensuring that no unauthorized person accesses your account.",
        "You agree not to share your login credentials or use another person's account without permission.",
        "CareerAgent will not be held liable for any unauthorized access or use of your account.",
        "Upon registration, a unique 6-digit PIN code will be shown to you. You must save this PIN securely, as it will not be displayed again.",
        "This PIN is required for sensitive operations, such as resetting your password or login attempts.",
        "In case you lose your PIN, you must contact CareerAgent. After a validation process, we will generate a new PIN for you."
      ]
    },
    {
      id: 3,
      title: "User Conduct",
      icon: <FaUsersCog />,
      content: [
        "You agree to use the platform in a lawful and respectful manner.",
        "You must not upload or distribute any harmful, misleading, or illegal content.",
        "You agree not to use the platform to discriminate or harass others based on race, gender, religion, or any other characteristic."
      ]
    },
    {
      id: 4,
      title: "Privacy and Data Usage",
      icon: <FaUserShield />,
      content: [
        "By using CareerAgent, you consent to the collection, processing, and use of your data in accordance with our Privacy Policy.",
        "We implement industry-standard security measures to protect your personal information from unauthorized access or misuse.",
        "Content uploaded to the platform, such as images or documents, may be processed to enable platform functionality. Avoid uploading sensitive personal information."
      ]
    },
    {
      id: 5,
      title: "Content Accessibility",
      icon: <FaDatabase />,
      content: [
        "Uploaded content may be publicly accessible depending on your settings.",
        "You are responsible for ensuring that any content uploaded complies with applicable laws and does not infringe on third-party rights.",
        "CareerAgent reserves the right to remove content deemed harmful, inappropriate, or in violation of these Terms.",
        "CareerAgent is not responsible for the accuracy or completeness of non-English CV content that is extracted.",
        "The platform supports the English language only, and users are encouraged to upload CVs in English to ensure proper functionality."
      ]
    },
    {
      id: 6,
      title: "Data Retention and Deletion",
      icon: <FaEraser />,
      content: [
        "We retain your data only as long as necessary to provide the services or comply with legal obligations.",
        "Upon account termination, your data will be deleted, except where retention is required for compliance with legal or financial obligations.",
        "Aggregated, non-identifiable data may be retained for analytical purposes."
      ]
    },
    {
      id: 7,
      title: "Termination",
      icon: <FaBan />,
      content: [
        "CareerAgent reserves the right to terminate or suspend your account at any time if you violate these Terms or engage in unauthorized activities.",
        "You may request account deactivation at any time by contacting our support team."
      ]
    },
    {
      id: 8,
      title: "Amendments",
      icon: <FaPencilAlt />,
      content: [
        "CareerAgent reserves the right to modify these Terms and Conditions at any time.",
        "Users will be notified of significant changes to the Terms, and continued use of the platform will constitute acceptance of the updated Terms."
      ]
    },
    {
      id: 9,
      title: "Feedback on Missing Job Roles",
      icon: <FaComments />,
      content: [
        "If you notice that a specific job role or other relevant field is missing in the job search, please contact us.",
        "We will review your request promptly and strive to improve the platform to meet user needs."
      ]
    }
  ];

  return (
    <>
      <GoogleFonts />
      <div 
        className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-blue-900' : 'bg-gradient-to-br from-gray-50 to-blue-50'} py-6 px-4 sm:py-8`}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <Botpress />
        
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-7xl mx-auto"
        >
          {/* Header with Dark Mode Toggle */}
          <motion.div
            variants={itemVariants}
            className="flex justify-end mb-6 px-4"
          >
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className={`${darkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-white text-blue-600 hover:bg-gray-100'} p-3 rounded-full shadow-md transition-colors duration-200`}
              aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <FaSun className="h-6 w-6" /> : <FaMoon className="h-6 w-6" />}
            </motion.button>
          </motion.div>
          
          {/* Title Section */}
          <motion.div 
            variants={itemVariants}
            className={`${darkMode ? 'bg-gray-800/50 shadow-blue-900/20' : 'bg-white/80'} backdrop-blur-sm shadow-xl rounded-3xl overflow-hidden mb-8`}
          >
            <div className={`bg-gradient-to-r ${darkMode ? 'from-blue-900 to-indigo-900' : 'from-blue-600 to-indigo-700'} py-8 px-8 sm:px-12 relative overflow-hidden`}>
              <motion.div 
                animate={{ 
                  opacity: [0.5, 0.8, 0.5],
                  scale: [1, 1.2, 1] 
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity,
                  repeatType: "reverse" 
                }}
                className={`absolute inset-0 bg-gradient-to-r ${darkMode ? 'from-blue-900/80 to-indigo-900/80' : 'from-blue-600/80 to-indigo-800/80'}`}
              />
              
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between">
                <div className="flex items-center mb-4 sm:mb-0">
                  <motion.div 
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className={`${darkMode ? 'bg-white/10' : 'bg-white/20'} p-4 rounded-2xl inline-flex`}
                  >
                    <FaShieldAlt className="text-white h-8 w-8 sm:h-10 sm:w-10" />
                  </motion.div>
                  <div className="ml-4">
                    <motion.h1 
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white"
                      style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, letterSpacing: '-0.02em' }}
                    >
                      Terms and Conditions
                    </motion.h1>
                  </div>
                </div>
              </div>
              
              {/* Animated background elements */}
              <motion.div 
                animate={{ 
                  x: [0, 10, 0],
                  y: [0, -10, 0],
                }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity,
                  repeatType: "reverse" 
                }}
                className={`absolute -bottom-6 -right-6 w-32 h-32 ${darkMode ? 'bg-white/5' : 'bg-white/10'} rounded-full blur-xl`}
              />
              <motion.div 
                animate={{ 
                  x: [0, -5, 0],
                  y: [0, 5, 0],
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  repeatType: "reverse" 
                }}
                className={`absolute top-0 left-1/3 w-16 h-16 ${darkMode ? 'bg-indigo-400/10' : 'bg-indigo-400/20'} rounded-full blur-md`}
              />
            </div>
            
            <div className="p-6 sm:p-8">
              <motion.p 
                variants={itemVariants}
                className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}
                style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}
              >
                Welcome to <span className="font-semibold">CareerAgent</span>, and thank you for choosing to join our platform. Please review
                the following Terms and Conditions carefully before registering or using our services. By creating an
                account, you confirm that you have read, understood, and agreed to these Terms.
              </motion.p>
            </div>
          </motion.div>
          
          {/* Terms Sections in Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2 mb-8">
            {termsData.map((section, index) => (
              <motion.div 
                key={section.id}
                variants={sectionVariants}
                whileHover={{ y: -5 }}
                className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} 
                  rounded-2xl overflow-hidden 
                  border shadow-lg ${darkMode ? 'shadow-blue-900/10' : 'shadow-gray-200/50'}`}
              >
                <div 
                  className={`p-5 ${darkMode ? 'bg-gray-800/90' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} cursor-pointer`}
                  onClick={() => toggleSection(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <motion.div 
                        whileHover={{ rotate: 15 }}
                        className={`h-12 w-12 flex items-center justify-center rounded-xl ${darkMode ? 'bg-blue-700' : 'bg-blue-600'} text-white`}
                      >
                        {section.icon}
                      </motion.div>
                      <h2 
                        className={`ml-3 text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}
                        style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600, letterSpacing: '-0.01em' }}
                      >
                        {section.title}
                      </h2>
                    </div>
                    <div className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {expandedSections.has(index) ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                  </div>
                </div>
                
                <motion.div 
                  initial={false}
                  animate={{ 
                    height: expandedSections.has(index) ? 'auto' : '0',
                    opacity: expandedSections.has(index) ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div 
                    className="p-5"
                    style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}
                  >
                    <ul className={`space-y-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {section.content.map((item, idx) => (
                        <li key={idx} className="flex">
                          <span className={`${darkMode ? 'text-blue-400' : 'text-blue-600'} mr-2`}>•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
          
          {/* Contact Section */}
          <motion.div 
            variants={itemVariants}
            className={`
              mx-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} 
              rounded-2xl overflow-hidden border shadow-lg mb-8
              ${darkMode ? 'shadow-blue-900/10' : 'shadow-gray-200/50'}
            `}
          >
            <div className={`p-6 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
              <p 
                className={darkMode ? 'text-gray-300' : 'text-gray-700'}
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
              >
                If you have any questions or concerns about these Terms, please{" "}
                <Link 
                  to="/contact" 
                  className={`${darkMode ? 'text-blue-400' : 'text-blue-600'} font-medium hover:underline inline-flex items-center group`}
                  style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}
                >
                  contact
                  <motion.span 
                    initial={{ x: 0 }}
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="inline-block ml-1"
                  >
                    →
                  </motion.span>
                </Link>
                {" "}us.
              </p>
            </div>
          </motion.div>
          
          {/* Close Button */}
          <motion.div 
            variants={itemVariants}
            className="flex justify-center mb-8"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClose}
              className={`flex items-center ${darkMode ? 'bg-red-700 hover:bg-red-600' : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'} text-white py-3 px-8 rounded-xl font-bold transition-all duration-200 shadow-lg`}
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}
            >
              <FaTimes className="mr-2" /> Close Terms and Conditions
            </motion.button>
          </motion.div>
          
          {/* Copyright footer */}
          <motion.div 
            variants={itemVariants}
            className="text-center text-sm pb-8"
          >
            <p 
              className={darkMode ? 'text-gray-400' : 'text-gray-500'}
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}
            >
              © {new Date().getFullYear()} CareerAgent. All rights reserved.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default TermsAndConditions;
