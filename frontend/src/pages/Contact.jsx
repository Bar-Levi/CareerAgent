import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaEnvelope, FaPaperPlane, FaCheck, FaExclamationCircle, FaUser } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-6 px-8">
            <div className="flex items-center">
              <FaEnvelope className="text-white h-8 w-8" />
              <h1 className="ml-3 text-3xl font-bold text-white">Contact Us</h1>
            </div>
            <p className="mt-2 text-blue-100">
              Have questions or feedback? We'd love to hear from you.
            </p>
          </div>
          
          {/* User Information Banner */}
          {isLoading ? (
            <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <p>Loading your information...</p>
            </div>
          ) : user?.email ? (
            <div className="bg-blue-50 p-4 border-b border-blue-100 flex items-start">
              <div className="bg-blue-100 rounded-full p-2 mr-3">
                <FaUser className="text-blue-600 h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-blue-800">Sending as:</h3>
                <p className="text-gray-700">
                  <strong>{user.fullName}</strong> ({user.email})
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 p-4 border-b border-yellow-100">
              <div className="flex items-center text-yellow-800">
                <FaExclamationCircle className="mr-2" /> 
                <p>Please <button 
                  onClick={() => navigate('/authentication', { state: { returnTo: location.pathname } })}
                  className="font-medium underline hover:text-yellow-900"
                >log in</button> to use the contact form</p>
              </div>
            </div>
          )}
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Get in Touch</h2>
                <p className="text-gray-600 mb-6">
                  Our team is ready to assist you with any questions or concerns. 
                  Fill out the form or reach out to us directly via email.
                </p>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Email Us</h3>
                  <a 
                    href="mailto:careeragentpro@gmail.com" 
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    <FaEnvelope className="mr-2" />
                    careeragentpro@gmail.com
                  </a>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Response Time</h3>
                  <p className="text-gray-600">
                    We typically respond to all inquiries within 24-48 hours during business days.
                  </p>
                </div>
              </div>
              
              {/* Contact Form */}
              <div>
                {isSubmitted ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-green-50 rounded-lg">
                    <div className="rounded-full bg-green-100 p-3 mb-4">
                      <FaCheck className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-800 mb-2">Message Sent!</h3>
                    <p className="text-gray-600">
                      Thank you for reaching out. We'll get back to you shortly.
                    </p>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {submitError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 flex items-center">
                        <FaExclamationCircle className="mr-2" /> {submitError}
                      </div>
                    )}
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                          errors.subject ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="How can we help?"
                      />
                      {errors.subject && (
                        <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows="6"
                        className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                          errors.message ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Your message here..."
                      ></textarea>
                      {errors.message && (
                        <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                      )}
                    </div>
                    
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting || isLoading || !user?.email}
                        className={`w-full px-6 py-3 bg-blue-600 text-white rounded-md font-medium flex items-center justify-center ${
                          isSubmitting || isLoading || !user?.email ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
                        } transition-colors`}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          <>
                            <FaPaperPlane className="mr-2" /> Send Message
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 