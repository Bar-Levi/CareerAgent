import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FaCloudUploadAlt, FaSpinner, FaTimes, FaCheckCircle, FaExclamationCircle, FaFileAlt } from "react-icons/fa";
import { extractTextFromPDF } from "../../../utils/pdfUtils";

const CVUploadModal = ({ onClose, onSuccess, userEmail }) => {
  const location = useLocation();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const MAX_FILE_SIZE_MB = 2;

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    // Check file size
    const fileSizeMB = selectedFile.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      setError(`File size must be less than ${MAX_FILE_SIZE_MB}MB`);
      return;
    }
    
    // Check file type
    if (selectedFile.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      return;
    }
    
    setError(null);
    setFile(selectedFile);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file");
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      // Extract text from PDF
      const cvContent = await extractTextFromPDF(file);
      
      // Create form data for upload
      const formData = new FormData();
      formData.append("cv", file);
      formData.append("cvContent", cvContent);
      
      // Send the extracted text to the AI endpoint to process and analyze CV
      const aiResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/ai/generateJsonFromCV`, {
        method: "POST",
        body: JSON.stringify({
          prompt: cvContent,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!aiResponse.ok) {
        throw new Error("Failed to analyze CV content");
      }

      const jsonResponse = await aiResponse.json();
      
      // Extract JSON from the response
      const jsonRaw = jsonResponse.response;
      const match = jsonRaw.match(/```json\n([\s\S]+?)\n```/);
      
      if (!match) {
        throw new Error("Invalid JSON format in response");
      }

      const jsonString = match[1];
      const analyzed_cv_content = JSON.parse(jsonString);
      
      // Get user email from props or from location state
      const email = userEmail || location?.state?.user?.email;
      
      // If email not available, handle the error
      if (!email) {
        throw new Error("User email not found");
      }
      
      // Upload CV to server
      const token = localStorage.getItem("token");
      
      const uploadResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/personal/jobseeker/cv/update?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload CV");
      }

      const uploadData = await uploadResponse.json();
      
      // Ensure cvContent is explicitly included in the success data
      onSuccess({
        cv: uploadData.cv,
        cvContent: cvContent,
        analyzed_cv_content: analyzed_cv_content
      });
      
    } catch (error) {
      console.error("Error processing CV:", error);
      setError(error.message || "Failed to process your CV");
    } finally {
      setIsUploading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Upload Your CV</h2>
            <p className="text-sm text-gray-600 mt-1">Let our AI enhance your professional profile</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 border border-blue-100">
              <FaFileAlt className="w-7 h-7 text-blue-600" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Upload area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative cursor-pointer transition-all border-2 border-dashed rounded-xl p-8 ${
                file
                  ? 'bg-green-50 border-green-300'
                  : dragActive
                  ? 'bg-blue-50 border-blue-300'
                  : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
              }`}
            >
              <input
                type="file"
                id="cv-file"
                onChange={handleFileChange}
                accept=".pdf"
                className="hidden"
              />
              
              <label 
                htmlFor="cv-file"
                className="flex flex-col items-center justify-center text-center cursor-pointer"
              >
                {file ? (
                  <div className="space-y-3">
                    <FaCheckCircle className="w-10 h-10 text-green-500 mx-auto" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <FaCloudUploadAlt className={`w-10 h-10 mx-auto ${
                      dragActive ? 'text-blue-500' : 'text-gray-400'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-700">
                        {dragActive ? 'Drop your file here' : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF file only (max. {MAX_FILE_SIZE_MB}MB)
                      </p>
                    </div>
                  </div>
                )}
              </label>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-lg p-4 border border-red-100">
                <FaExclamationCircle className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isUploading || !file}
              className={`w-full py-3.5 px-4 rounded-lg font-medium transition-colors ${
                isUploading || !file
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm'
              }`}
            >
              {isUploading ? (
                <div className="flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                'Upload and Continue'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CVUploadModal; 