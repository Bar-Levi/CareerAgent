import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaEnvelope, FaPaperPlane, FaCheck, FaExclamationCircle, FaUser, FaClock, FaArrowRight } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from "framer-motion";

const Contact = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(location.state?.user || {});
  
  const [formData, setFormData] = useState({
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user info if not available in location.state
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user?.email) {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        if (token) {
          try {
            // Decode token
            const decoded = jwtDecode(token);
            
            if (decoded.id) {
              // Fetch user details from API using the ID from token
              const response = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}/api/auth/user-details?id=${decoded.id}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              
              if (response.ok) {
                const userData = await response.json();
                setUser({
                  fullName: userData.fullName || userData.username,
                  email: userData.email
                });
                setSubmitError("");
              } else {
                setSubmitError("Unable to fetch your profile. Please log in again.");
              }
            } else {
              setSubmitError("Could not retrieve your user ID. Please log in again.");
            }
          } catch (error) {
            console.error("Error decoding token or fetching user details:", error);
            setSubmitError("Error loading your profile. Please refresh or log in again.");
          }
        } else {
          setSubmitError("Please log in to use the contact form");
        }
        setIsLoading(false);
      }
    };
    
    fetchUserInfo();
  }, [user?.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }
    
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }
    
    // Check if user info is available
    if (!user?.fullName || !user?.email) {
      setSubmitError("User information is missing. Please log in to use the contact form.");
      return false;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          fullName: user.fullName,
          email: user.email,
          subject: formData.subject,
          message: formData.message
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      setIsSubmitted(true);
      // Reset form after submission
      setFormData({
        subject: "",
        message: ""
      });
    } catch (error) {
      setSubmitError(error.message || 'Failed to send your message. Please try again later.');
      console.error('Error submitting contact form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm bg-opacity-90"
        >
          <motion.div 
            initial={{ backgroundPosition: "0% 50%" }}
            animate={{ backgroundPosition: "100% 50%" }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 py-8 px-8 bg-size-200"
            style={{ backgroundSize: "200% 200%" }}
          >
            <div className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FaEnvelope className="text-white h-10 w-10" />
              </motion.div>
              <h1 className="ml-4 text-4xl font-bold text-white tracking-tight">Contact Us</h1>
            </div>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-3 text-blue-100 text-lg"
            >
              Have questions or feedback? We'd love to hear from you.
            </motion.p>
          </motion.div>
          
          {/* User Information Banner */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-gray-50 p-6 border-b border-gray-100 flex items-center justify-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                </motion.div>
                <p className="ml-3 text-gray-600">Loading your information...</p>
              </motion.div>
            ) : user?.email ? (
              <motion.div 
                key="user-info"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-blue-100 flex items-start"
              >
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-3 mr-4"
                >
                  <FaUser className="text-white h-6 w-6" />
                </motion.div>
                <div>
                  <h3 className="font-medium text-blue-800 text-lg">Sending as:</h3>
                  <p className="text-gray-700 text-lg">
                    <strong>{user.fullName}</strong> ({user.email})
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="login-prompt"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 border-b border-yellow-100"
              >
                <div className="flex items-center text-yellow-800">
                  <FaExclamationCircle className="mr-3 h-5 w-5" /> 
                  <p className="text-lg">Please 
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/authentication', { state: { returnTo: location.pathname } })}
                      className="font-medium underline hover:text-yellow-900 ml-1"
                    >
                      log in
                    </motion.button> 
                    to use the contact form
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Get in Touch</h2>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                  Our team is ready to assist you with any questions or concerns. 
                  Fill out the form or reach out to us directly via email.
                </p>
                
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl mb-8"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                    <FaEnvelope className="mr-2 text-blue-600" />
                    Email Us
                  </h3>
                  <a 
                    href="mailto:careeragentpro@gmail.com" 
                    className="text-blue-600 hover:text-blue-700 text-lg flex items-center group"
                  >
                    careeragentpro@gmail.com
                    <motion.span
                      initial={{ x: 0 }}
                      whileHover={{ x: 5 }}
                      className="ml-2"
                    >
                      <FaArrowRight className="text-sm" />
                    </motion.span>
                  </a>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                    <FaClock className="mr-2 text-indigo-600" />
                    Response Time
                  </h3>
                  <p className="text-gray-600 text-lg">
                    We typically respond to all inquiries within 24-48 hours during business days.
                  </p>
                </motion.div>
              </motion.div>
              
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                {isSubmitted ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl"
                  >
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                      className="rounded-full bg-gradient-to-br from-green-400 to-emerald-500 p-4 mb-6"
                    >
                      <FaCheck className="h-10 w-10 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">Message Sent!</h3>
                    <p className="text-gray-600 text-lg mb-8">
                      Thank you for reaching out. We'll get back to you shortly.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsSubmitted(false)}
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-lg shadow-lg hover:shadow-xl transition-all"
                    >
                      Send Another Message
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.form 
                    onSubmit={handleSubmit} 
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <AnimatePresence>
                      {submitError && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center"
                        >
                          <FaExclamationCircle className="mr-3 h-5 w-5" /> {submitError}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={`w-full px-5 py-3 text-lg border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                          errors.subject ? "border-red-500" : "border-gray-200 hover:border-blue-300"
                        }`}
                        placeholder="How can we help?"
                      />
                      <AnimatePresence>
                        {errors.subject && (
                          <motion.p 
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="mt-2 text-sm text-red-600"
                          >
                            {errors.subject}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows="6"
                        className={`w-full px-5 py-3 text-lg border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                          errors.message ? "border-red-500" : "border-gray-200 hover:border-blue-300"
                        }`}
                        placeholder="Your message here..."
                      ></textarea>
                      <AnimatePresence>
                        {errors.message && (
                          <motion.p 
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="mt-2 text-sm text-red-600"
                          >
                            {errors.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>
                    
                    <motion.div 
                      className="pt-4"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <button
                        type="submit"
                        disabled={isSubmitting || isLoading || !user?.email}
                        className={`w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center ${
                          isSubmitting || isLoading || !user?.email ? "opacity-70 cursor-not-allowed" : "hover:from-blue-700 hover:to-indigo-700"
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <motion.svg 
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="h-5 w-5 text-white mr-3" 
                              xmlns="http://www.w3.org/2000/svg" 
                              fill="none" 
                              viewBox="0 0 24 24"
                            >
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </motion.svg>
                            Sending...
                          </>
                        ) : (
                          <>
                            <FaPaperPlane className="mr-3" /> Send Message
                          </>
                        )}
                      </button>
                    </motion.div>
                  </motion.form>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Contact; 