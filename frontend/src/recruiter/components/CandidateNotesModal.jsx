import React, { useState, useEffect } from "react";

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
    <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-lg w-full max-w-md p-6`}>
      <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Candidate Notes</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          className={`w-full border rounded-lg p-2 resize-none h-40 ${
            darkMode 
              ? 'bg-gray-600 border-gray-500 text-white focus:border-indigo-400 focus:ring-indigo-400' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }`}
          placeholder="Enter your notes here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        <div className="mt-4 flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded ${
              darkMode 
                ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded ${
              darkMode 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-500 disabled:opacity-70' 
                : 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-400 disabled:opacity-70'
            }`}
          >
            {loading ? "Saving..." : "Save Notes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CandidateNotesModal;
