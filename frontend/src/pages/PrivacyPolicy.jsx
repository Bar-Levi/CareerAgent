import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FaShieldAlt, 
  FaUserShield, 
  FaDatabase, 
  FaCookieBite, 
  FaGlobeAmericas, 
  FaUserLock, 
  FaChevronDown,
  FaChevronUp,
  FaMoon,
  FaSun,
  FaArrowLeft
} from "react-icons/fa";

// Google Fonts CSS import
const GoogleFonts = () => {
  return (
    <style jsx global>{`
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
    `}</style>
  );
};

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener
    window.addEventListener('resize', checkScreenSize);
    
    // Check for dark mode preference in localStorage
    const savedDarkMode = localStorage.getItem('careeragent_darkmode');
    if (savedDarkMode === 'true') {
      setDarkMode(true);
    }
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    // Update localStorage when dark mode changes
    localStorage.setItem('careeragent_darkmode', darkMode.toString());
  }, [darkMode]);

  const toggleSection = (index) => {
    if (activeSection === index) {
      setActiveSection(null);
    } else {
      setActiveSection(index);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
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

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  // Content sections data
  const sections = [
    {
      icon: <FaUserShield />,
      title: "Information We Collect",
      content: (
        <>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
            We collect information that you provide directly to us when you:
          </p>
          <ul className={`list-disc pl-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'} space-y-2`}>
            <li>Create an account or update your profile</li>
            <li>Upload your resume or CV</li>
            <li>Apply for jobs through our platform</li>
            <li>Communicate with our chatbots or other users</li>
            <li>Submit feedback or contact our support team</li>
          </ul>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-3`}>
            This information may include your name, email address, phone number, employment history, education, and other information relevant to job applications.
          </p>
        </>
      )
    },
    {
      icon: <FaDatabase />,
      title: "How We Use Your Information",
      content: (
        <>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>We use the information we collect to:</p>
          <ul className={`list-disc pl-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'} space-y-2`}>
            <li>Provide, maintain, and improve our services</li>
            <li>Process job applications and connect job seekers with recruiters</li>
            <li>Personalize your experience and content</li>
            <li>Communicate with you about our services, updates, and job opportunities</li>
            <li>Analyze usage patterns to enhance user experience</li>
            <li>Protect against fraudulent or unauthorized activity</li>
          </ul>
        </>
      )
    },
    {
      icon: <FaCookieBite />,
      title: "Cookies and Tracking Technologies",
      content: (
        <>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
            We use cookies and similar tracking technologies to track activity on our service and hold certain information.
            Cookies are files with a small amount of data which may include an anonymous unique identifier.
          </p>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            However, if you do not accept cookies, you may not be able to use some portions of our service.
          </p>
        </>
      )
    },
    {
      icon: <FaGlobeAmericas />,
      title: "Sharing Your Information",
      content: (
        <>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>We may share your personal information with:</p>
          <ul className={`list-disc pl-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'} space-y-2`}>
            <li>Recruiters and employers when you apply for jobs</li>
            <li>Service providers who perform services on our behalf</li>
            <li>Professional advisors such as lawyers, auditors, and insurers</li>
            <li>Government authorities when required by law</li>
          </ul>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-3`}>
            We do not sell your personal information to third parties.
          </p>
        </>
      )
    },
    {
      icon: <FaUserLock />,
      title: "Your Privacy Rights",
      content: (
        <>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>Depending on your location, you may have the right to:</p>
          <ul className={`list-disc pl-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'} space-y-2`}>
            <li>Access the personal information we hold about you</li>
            <li>Request correction of your personal information</li>
            <li>Request deletion of your personal information</li>
            <li>Object to processing of your personal information</li>
            <li>Request restriction of processing your personal information</li>
            <li>Request transfer of your personal information</li>
            <li>Withdraw consent where we rely on consent to process your information</li>
          </ul>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-3`}>
            To exercise any of these rights, please contact us through our contact page.
          </p>
        </>
      )
    }
  ];

  return (
    <>
      <GoogleFonts />
      <div 
        className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-blue-900' : 'bg-gradient-to-br from-gray-50 to-blue-50'} py-6 px-4 sm:py-8`}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-7xl mx-auto"
        >
          {/* Header Navigation */}
          <motion.div 
            variants={itemVariants} 
            className="flex justify-between items-center mb-6 px-4"
          >
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/authentication')}
              className={`flex items-center ${darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-800 hover:bg-gray-100'} py-2 px-4 rounded-lg shadow-md transition-colors duration-200`}
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}
            >
              <FaArrowLeft className="mr-2" /> Return
            </motion.button>
            
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
              
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center">
                <motion.div 
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className={`${darkMode ? 'bg-white/10' : 'bg-white/20'} p-4 rounded-2xl mb-4 sm:mb-0 inline-flex`}
                >
                  <FaShieldAlt className="text-white h-8 w-8 sm:h-10 sm:w-10" />
                </motion.div>
                <div className="sm:ml-4">
                  <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white"
                    style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, letterSpacing: '-0.02em' }}
                  >
                    Privacy Policy
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="mt-2 text-blue-100 relative z-10"
                    style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}
                  >
                    Last Updated: May 5th, 2025
                  </motion.p>
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
              <motion.div 
                variants={fadeIn}
                className={`${darkMode ? 'bg-gray-900 border-blue-900' : 'bg-blue-50 border-blue-100'} rounded-2xl p-6 border`}
              >
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                  At CareerAgent, we value your privacy and are committed to protecting your personal data.
                  This Privacy Policy explains how we collect, use, and safeguard your information when you use our service.
                </p>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Content Sections in Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
            {sections.map((section, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} 
                  rounded-2xl overflow-hidden transition-all duration-300 
                  border shadow-lg ${darkMode ? 'shadow-blue-900/10' : 'shadow-gray-200/50'}
                  ${index === sections.length - 1 && sections.length % 2 !== 0 ? 'md:col-span-2 lg:col-span-1' : ''}
                `}
              >
                <motion.div
                  className={`p-5 ${darkMode ? 'bg-gray-800/90' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}
                >
                  <div className="flex items-center">
                    <motion.div 
                      whileHover={{ rotate: 15 }}
                      className={`h-12 w-12 flex items-center justify-center rounded-xl ${darkMode ? 'bg-blue-700' : 'bg-blue-600'} text-white`}
                    >
                      {section.icon}
                    </motion.div>
                    <h2 
                      className={`ml-3 text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}
                      style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600, letterSpacing: '-0.01em' }}
                    >
                      {section.title}
                    </h2>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="p-5"
                  style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}
                >
                  {section.content}
                </motion.div>
              </motion.div>
            ))}
          </div>
          
          {/* Contact Section */}
          <motion.div 
            variants={itemVariants}
            className={`
              mt-8 mx-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} 
              rounded-2xl overflow-hidden transition-all duration-300 border shadow-lg 
              ${darkMode ? 'shadow-blue-900/10' : 'shadow-gray-200/50'}
            `}
          >
            <div className={`p-6 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
              <p 
                className={darkMode ? 'text-gray-300' : 'text-gray-700'}
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
              >
                If you have any questions about this Privacy Policy, please{" "}
                <motion.span whileHover={{ scale: 1.05 }} className="inline-block">
                  <Link 
                    to="/contact" 
                    className={`${darkMode ? 'text-blue-400' : 'text-blue-600'} font-medium hover:underline inline-flex items-center group`}
                    style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}
                  >
                    Contact
                    <motion.span 
                      initial={{ x: 0 }}
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="inline-block ml-1"
                    >
                      →
                    </motion.span>
                  </Link>
                </motion.span>
                {" "}us.
              </p>
            </div>
          </motion.div>
          
          {/* Copyright footer */}
          <motion.div 
            variants={itemVariants}
            className="mt-8 text-center text-sm pb-8"
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

export default PrivacyPolicy; 