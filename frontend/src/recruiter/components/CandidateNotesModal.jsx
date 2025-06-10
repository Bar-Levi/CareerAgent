import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const CandidateNotesModal = ({ isOpen, onClose, applicant, onNotesUpdated, darkMode = false, onSuccess }) => {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Initialize notes when the modal opens or the applicant changes.
  useEffect(() => {
    if (applicant) {
      setNotes(applicant.notes || "");
    }
  }, [applicant]);

  // Handle the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/applicants/${applicant._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        // Send only the notes field in the request body.
        body: JSON.stringify({ notes }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update applicant");
      }
      // Optionally, call a callback to update the applicant in parent state.
      if (onNotesUpdated) {
        onNotesUpdated(data.applicant);
      }
      if (onSuccess) {
        onSuccess(data.applicant);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Don't render the modal if it's not open.
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl w-full max-w-md p-0 overflow-hidden backdrop-blur-sm`}
      style={{ 
        boxShadow: darkMode 
          ? '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)' 
          : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Header */}
      <div className={`px-6 py-5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Candidate Notes
        </h2>
        <button 
          onClick={onClose} 
          className={`rounded-full p-1.5 transition-colors ${
            darkMode 
              ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
              : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Candidate Info */}
      {applicant && (
        <div className={`px-6 py-3 ${darkMode ? 'bg-gray-750' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img 
                src={applicant.profilePic || "https://res.cloudinary.com/careeragent/image/upload/v1735084555/default_profile_image.png"} 
                alt={applicant.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{applicant.name}</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{applicant.jobTitle || 'Candidate'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="mb-4">
          <label 
            htmlFor="notes" 
            className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
          >
            Add notes about this candidate
          </label>
          <div className={`relative rounded-lg overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-white'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} focus-within:ring-2 ${darkMode ? 'focus-within:ring-indigo-500/60 focus-within:border-indigo-500/80' : 'focus-within:ring-blue-500/30 focus-within:border-blue-500'} transition-all duration-200`}>
            <textarea
              id="notes"
              className={`w-full p-3 resize-none h-36 focus:outline-none ${
                darkMode 
                  ? 'bg-gray-700 text-white placeholder-gray-400' 
                  : 'bg-white text-gray-900 placeholder-gray-400'
              }`}
              placeholder="Enter your observations, interview feedback, or any other relevant information about the candidate..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className={`absolute bottom-2 right-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {notes.length} characters
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/50">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              darkMode 
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            Cancel
          </button>
          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className={`px-4 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center min-w-[90px] transition-colors ${
              darkMode 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-500 disabled:opacity-70 shadow-md shadow-indigo-900/20' 
                : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:opacity-70 shadow-md shadow-blue-500/20'
            }`}
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : "Save Notes"}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default CandidateNotesModal;
