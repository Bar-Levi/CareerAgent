import React, { useEffect, useState } from "react";

const Modal = ({ title, message, onClose, onConfirm, showNotification, confirmText = "Confirm" }) => {
  const [isVisible, setIsVisible] = useState(false); // For scale-in animation
  const [isClosing, setIsClosing] = useState(false); // For scale-out animation
  const [file, setFile] = useState(null); // State to store the selected file

  useEffect(() => {
    // Trigger the animation by setting visibility to true after mounting
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true); // Trigger the closing animation
    setTimeout(() => {
      onClose(); // Close the modal after the animation ends
    }, 300); // Match the closing animation duration
  };

  const handleConfirm = () => {
    if (!file) {
      showNotification("error", "Please select a file before uploading.");
      return;
    }
    onConfirm(file); // Pass the selected file to the parent component
    setIsClosing(true);
    setTimeout(() => {
      onClose(); // Close the modal after confirmation
    }, 300);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Set the selected file
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        className={`bg-white rounded-lg shadow-lg p-6 max-w-md w-full transform transition-transform duration-300 ${
          isVisible && !isClosing ? "scale-100" : "scale-75"
        }`}
      >
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="mb-4">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
