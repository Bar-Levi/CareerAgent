import React, { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";

const Modal = ({ title, message, onClose, onConfirm, showNotification, confirmText = "Confirm" }) => {
  const [isVisible, setIsVisible] = useState(false); // For scale-in animation
  const [isClosing, setIsClosing] = useState(false); // For scale-out animation
  const [file, setFile] = useState(null); // State to store the selected file
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState(null); // State to store file validation errors
  const MAX_FILE_SIZE_MB = 2; // 2MB file size limit

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

  const handleConfirm = async () => {
  if (!file) {
    showNotification("error", "Please select a file before uploading.");
    return;
  }

  // Check file size before uploading
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > MAX_FILE_SIZE_MB) {
    setFileError(`File size must be less than ${MAX_FILE_SIZE_MB}MB`);
    showNotification("error", `File size must be less than ${MAX_FILE_SIZE_MB}MB`);
    return;
  }

  setLoading(true); // Show the loading spinner

  try {
    await onConfirm(file); // Pass the selected file to the parent component
    showNotification("success", "File uploaded successfully!"); // Optional success notification
    setLoading(false); // Hide the loading spinner
    setIsClosing(true); // Trigger modal closing animation
    setTimeout(() => {
      onClose(); // Close the modal after the animation ends
    }, 300); // Match the closing animation duration
  } catch (error) {
    setLoading(false); // Hide the loading spinner
    showNotification("error", "Something went wrong during confirmation.");
  }
};


  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size
      const fileSizeMB = selectedFile.size / (1024 * 1024);
      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        setFileError(`File size must be less than ${MAX_FILE_SIZE_MB}MB`);
        e.target.value = null; // Clear the file input
        return;
      }
      setFileError(null); // Clear any previous errors
      setFile(selectedFile); // Set the selected file
    }
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
        {loading ? (
          <div className="z-10 flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Analyzing Your CV...</h2>
            <p className="text-gray-600 mb-6">This may take a few seconds. Please wait.</p>
            <FaSpinner className="animate-spin text-5xl text-blue-500" aria-label="Loading spinner" />
          </div>
        ) : (
          <>
            <div className="mb-4">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            <p className="text-gray-700 mb-6">{message}</p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border rounded"
              />
              <p className="text-sm text-gray-500 mt-1">Maximum file size: {MAX_FILE_SIZE_MB}MB</p>
              {fileError && <p className="text-sm text-red-500 mt-1">{fileError}</p>}
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
          </>
        )}
      </div>
    </div>
  );
  
};

export default Modal;
