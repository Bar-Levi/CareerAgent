import React, { useState, useEffect } from "react";

const CandidateNotesModal = ({ isOpen, onClose, applicant, onNotesUpdated }) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">Candidate Notes</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-2 resize-none h-40"
            placeholder="Enter your notes here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          <div className="mt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Notes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CandidateNotesModal;
