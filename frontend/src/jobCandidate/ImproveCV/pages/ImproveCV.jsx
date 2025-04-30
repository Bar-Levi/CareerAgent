import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavigationBar from "../../../components/NavigationBar/NavigationBar";
import CVUploadModal from "../components/CVUploadModal";
import SimpleMarkdown from "./SimpleMarkdown";
import { ThreeDots } from "react-loader-spinner";
import confetti from "canvas-confetti";
import { useMediaQuery } from "react-responsive";
import { Tilt } from "react-tilt";

// Icons for UI elements
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
  </svg>
);

const MagicWandIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const ImproveCV = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [improvements, setImprovements] = useState(null);
  const [currentUser, setCurrentUser] = useState(user);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const responseModalRef = useRef(null);
  const confettiRef = useRef(null);
  
  // Responsive design breakpoints
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1024px)' });
  const isMobile = useMediaQuery({ query: '(max-width: 640px)' });
  
  // Check if the user has CV content
  useEffect(() => {
    if (currentUser?.cv && !currentUser?.cvContent) {
      fetchCVContent();
    } else if (!currentUser?.cv) {
      setShowUploadModal(true);
    }
  }, [currentUser]);

  // Lock/unlock body scroll based on modal state
  useEffect(() => {
    if (improvements || showUploadModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [improvements, showUploadModal]);

  // Animation for loading progress
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          // Make it realistic by slowing down as it approaches 100%
          const increment = Math.max(1, Math.floor((100 - prev) / 10));
          const newValue = Math.min(95, prev + increment); // Cap at 95% until actual completion
          return newValue;
        });
      }, 600);
      
      return () => clearInterval(interval);
    } else if (loadingProgress > 0) {
      // When loading completes, fill to 100%
      setLoadingProgress(100);
      
      // Reset after animation completes
      const timer = setTimeout(() => {
        setLoadingProgress(0);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, loadingProgress]);

  // Function to fetch CV content if needed
  const fetchCVContent = async () => {
    try {
      const token = localStorage.getItem("token");
      const email = currentUser?.email;
      
      if (!email) {
        console.error("No email found for user");
        setShowUploadModal(true);
        return;
      }
      
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/personal/jobseeker/cv-content?email=${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch CV content");
      }
      
      const data = await response.json();
      
      if (data.cvContent) {
        const updatedUser = {
          ...currentUser,
          cvContent: data.cvContent
        };
        
        setCurrentUser(updatedUser);
        
        navigate(location.pathname, {
          state: {
            ...location.state,
            user: updatedUser
          },
          replace: true
        });
      } else {
        setShowUploadModal(true);
      }
    } catch (error) {
      console.error("Error fetching CV content:", error);
      setShowUploadModal(true);
    }
  };

  const handleCVUploadSuccess = (cvData) => {
    const updatedUser = {
      ...currentUser,
      ...cvData
    };
    
    setCurrentUser(updatedUser);
    
    navigate(location.pathname, {
      state: {
        ...location.state,
        user: updatedUser
      },
      replace: true
    });
    
    setShowUploadModal(false);
    
    // Show success animation
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      // Trigger confetti effect
      if (confettiRef.current) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }, 2000);
    
    toast.success("CV uploaded successfully!");
  };

  const handleImproveCVClick = async () => {
    if (!currentUser?.cvContent) {
      toast.error("Please upload your CV first");
      setShowUploadModal(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/ai/improveCV`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          cvContent: currentUser.cvContent
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate improvements");
      }
      
      const data = await response.json();
      setImprovements(data.response);
      
      // Trigger confetti effect on successful improvement
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 500);
    } catch (error) {
      console.error("Error improving CV:", error);
      toast.error(error.message || "Failed to generate improvements");
    } finally {
      setIsLoading(false);
    }
  };

  const closeResponseModal = () => {
    setImprovements(null);
  };
  
  // Function to download suggestions as text file
  const downloadSuggestions = () => {
    if (!improvements) return;
    
    setIsDownloading(true);
    
    try {
      // Clean up markdown to plain text
      const cleanText = improvements.replace(/#+\s(.*)/g, '$1\n') // Replace headers with text and newline
                                  .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers
                                  .replace(/\*(.*?)\*/g, '$1')     // Remove italic markers
                                  .replace(/`(.*?)`/g, '$1');      // Remove code markers
      
      // Create a blob with the text content
      const blob = new Blob([
        "CV IMPROVEMENT SUGGESTIONS\n\n",
        cleanText
      ], { type: "text/plain;charset=utf-8" });
      
      // Create a temporary download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "CV_Improvement_Suggestions.txt";
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsDownloading(false);
        toast.success("Suggestions downloaded successfully!");
      }, 100);
      
    } catch (error) {
      console.error("Error downloading suggestions:", error);
      toast.error("Failed to download suggestions");
      setIsDownloading(false);
    }
  };

  // Add global no-scroll style when component mounts
  useEffect(() => {
    // Add style to prevent scrolling on body
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    return () => {
      // Cleanup when component unmounts
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 text-gray-900 overflow-hidden">
      <NavigationBar userType={currentUser?.role || "JobSeeker"} />
      
      <div ref={confettiRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-6 relative overflow-y-auto h-[calc(100vh-64px)]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {/* Hide scrollbar for Chrome, Safari and Opera */}
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {/* Success animation */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div className="p-8 rounded-full bg-green-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto pt-2 md:pt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block py-1.5 px-4 rounded-full bg-blue-50 text-blue-700 text-sm font-medium tracking-wide mb-4">
              AI-POWERED CV IMPROVEMENT
            </span>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900">
              Enhance Your <span className="text-blue-600 relative">
                <span className="relative z-10">Professional Profile</span>
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-blue-200 z-0" viewBox="0 0 200 9">
                  <path d="M0,7 C50,12 80,4 200,8 L200,9 L0,9 Z" fill="currentColor"></path>
                </svg>
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              Our AI analyzes your CV and provides targeted improvements to help you stand out to employers and ATS systems.
            </p>
          </motion.div>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            {currentUser?.cvContent ? (
              <>
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleImproveCVClick}
                    disabled={isLoading}
                    className={`px-8 py-4 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-base flex items-center justify-center shadow-lg
                      ${isLoading 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl'}`}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-3 justify-center">
                        <ThreeDots
                          visible={true}
                          height="20"
                          width="30"
                          color="#a1a1aa"
                          radius="9"
                        />
                        <span>Analyzing CV...</span>
                      </div>
                    ) : (
                      <>
                        <MagicWandIcon />
                        Improve My CV
                      </>
                    )}
                  </motion.button>
                  
                  {/* Improved progress bar position - directly under the button */}
                  <AnimatePresence>
                    {isLoading && loadingProgress > 0 && (
                      <motion.div 
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: `${loadingProgress}%`, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-0 left-0 h-1 bg-blue-400 rounded-b-xl transition-all"
                        style={{ 
                          boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)',
                          filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.3))'
                        }}
                      />
                    )}
                  </AnimatePresence>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowUploadModal(true)}
                  className="px-6 py-3 bg-white text-blue-600 border border-blue-600 font-medium rounded-xl shadow-sm hover:shadow-md hover:bg-blue-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm flex items-center justify-center"
                >
                  <UploadIcon />
                  Update CV
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowUploadModal(true)}
                className="px-8 py-4 bg-blue-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-base flex items-center justify-center"
              >
                <UploadIcon />
                Upload Your CV
              </motion.button>
            )}
          </div>
          
          {/* Feature cards */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20"
          >
            {[
              {
                title: "AI Analysis",
                description: "Advanced machine learning algorithms analyze your CV to identify areas for improvement",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )
              },
              {
                title: "Tailored Advice",
                description: "Get personalized suggestions specific to your industry and career goals",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                )
              },
              {
                title: "ATS Optimization",
                description: "Optimize your CV to pass through Applicant Tracking Systems with higher success",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )
              },
            ].map((feature, index) => (
              <Tilt
                key={index}
                options={{ max: 15, scale: 1.02, speed: 300 }}
                className="p-6 rounded-2xl bg-white shadow-xl shadow-blue-100/50 flex flex-col items-center text-center transition-all duration-300"
              >
                <div className="mb-4 text-blue-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Tilt>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden m-4"
            >
              <CVUploadModal
                userEmail={currentUser?.email}
                onClose={() => {
                  if (currentUser?.cvContent) {
                    setShowUploadModal(false);
                  } else {
                    navigate("/dashboard", { state: location.state });
                  }
                }}
                onSuccess={handleCVUploadSuccess}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Response Modal */}
      <AnimatePresence>
        {improvements && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              ref={responseModalRef}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col m-4"
            >
              {/* Modal Header */}
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">CV Improvement Analysis</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    AI-generated recommendations to enhance your professional profile
                  </p>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeResponseModal}
                  className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <CloseIcon />
                </motion.button>
              </div>
              
              {/* Modal Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="prose max-w-none">
                  <SimpleMarkdown text={improvements} />
                </div>
              </div>
              
              {/* Modal Footer with Download button */}
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 sticky bottom-0 z-10">
                <div className="flex flex-wrap gap-3 justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={closeResponseModal}
                    className="px-5 py-2.5 bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm"
                  >
                    Dismiss
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={downloadSuggestions}
                    disabled={isDownloading}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm flex items-center"
                  >
                    {isDownloading ? (
                      <div className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Downloading...</span>
                      </div>
                    ) : (
                      <>
                        <DownloadIcon />
                        Download Suggestions
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <ToastContainer 
        position="top-right"
        theme="light"
      />
    </div>
  );
};

export default ImproveCV; 