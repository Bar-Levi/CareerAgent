// InputBox.jsx
import React, { useState, useRef, useEffect } from "react";
import { FaImage, FaPaperPlane, FaTimes, FaFile, FaExclamationTriangle, FaUpload } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

const InputBox = ({ onSend, conversationId, senderId, selectedJobListingId }) => {
  // Create a unique key for the draft based on conversationId and senderId.
  const draftKey = `chatDraft-${conversationId}-${senderId}`;
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // State for handling text, files, and UI states
  const [text, setText] = useState(() => {
    const savedDraftData = localStorage.getItem(draftKey);
    if (savedDraftData) {
      try {
        const { draft } = JSON.parse(savedDraftData);
        return draft;
      } catch (error) {
        console.error("Error parsing saved draft", error);
      }
    }
    return "";
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState("");
  const [textareaHeight, setTextareaHeight] = useState("60px"); // Increased default height
  const [uploadStatus, setUploadStatus] = useState({ uploading: false, progress: 0 });

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto first to properly calculate new height
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      // Set a minimum height of 60px to prevent shrinking too small
      const newHeight = Math.max(60, Math.min(scrollHeight, 150));
      setTextareaHeight(`${newHeight}px`);
    }
  }, [text]);

  // Save the draft on every change
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    localStorage.setItem(
      draftKey,
      JSON.stringify({
        draft: newText,
        conversationId,
        senderId,
      })
    );
  };

  const handleSend = async () => {
    if (!selectedJobListingId) {
      alert("Job listing not found / might be removed by the recruiter.");
      return;
    }

    // Allow sending if there's either text OR a file
    if (text.trim() || file) {
      setLoading(true);
      // Only set uploadStatus when there's a file
      if (file) {
        setUploadStatus({ uploading: true, progress: 0 });
      }
      
      try {
        // Set up a progress event handler
        const handleProgress = (progress) => {
          if (file) {
            setUploadStatus(prev => ({ ...prev, progress }));
          }
        };
        
        await onSend({ text: text || " ", file, onProgress: handleProgress });
        
        setText("");
        setFile(null);
        setFileError("");
        // Remove the saved draft once sent
        localStorage.removeItem(draftKey);
      } catch (error) {
        console.error("Error sending message:", error);
      } finally {
        setLoading(false);
        setUploadStatus({ uploading: false, progress: 0 });
      }
    }
  };

  const validateFileSize = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File too large. Maximum size is 2MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return false;
    }
    setFileError("");
    return true;
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;
    
    if (validateFileSize(selectedFile)) {
      setFile(selectedFile);
    } else {
      setFile(null);
    }
  };

  // Retrieve draft when conversation changes
  useEffect(() => {
    const savedDraftData = localStorage.getItem(draftKey);
    if (savedDraftData) {
      try {
        const { draft } = JSON.parse(savedDraftData);
        setText(draft);
      } catch (error) {
        console.error("Error parsing saved draft", error);
        setText("");
      }
    } else {
      setText("");
    }
    // Reset file state and errors when conversation changes
    setFile(null);
    setFileError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  // Determine file icon and file type label
  const getFileInfo = () => {
    if (!file) return { icon: <FaFile />, typeLabel: "" };
    
    const isImage = file.type.startsWith("image/");
    const fileIcon = isImage ? <FaImage /> : <FaFile />;
    const typeLabel = isImage ? "Image" : "File";
    
    return { icon: fileIcon, typeLabel };
  };

  const { icon: fileIcon, typeLabel } = getFileInfo();

  // Keydown handler for send on Enter (unless Shift is pressed)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Get loading status text based on progress
  const getLoadingStatusText = () => {
    if (!uploadStatus.uploading) return "";
    if (uploadStatus.progress <= 0) return "Preparing upload...";
    if (uploadStatus.progress < 100) return `Uploading: ${uploadStatus.progress}%`;
    return "Processing...";
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800 rounded-b-lg backdrop-blur-sm">
      <AnimatePresence>
        {fileError && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-red-500 text-xs mb-2 flex items-center"
          >
            <FaExclamationTriangle className="mr-1" /> {fileError}
          </motion.div>
        )}
        
        {uploadStatus.uploading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-blue-500 text-xs mb-2 flex items-center"
          >
            <FaUpload className="mr-1 animate-pulse" /> {getLoadingStatusText()}
            <div className="ml-2 w-full max-w-[200px] bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                style={{ width: `${uploadStatus.progress}%` }}
              ></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {file && !uploadStatus.uploading && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mb-2"
        >
          <div className="flex items-center text-sm text-blue-500 dark:text-blue-300">
            <span className="mr-2">{fileIcon}</span>
            <span className="mr-1">{typeLabel}:</span>
            <span className="text-gray-600 dark:text-gray-300 truncate max-w-xs">
              {file.name}
            </span>
            <span className="ml-2 text-gray-500 text-xs">
              ({(file.size / 1024).toFixed(1)} KB)
            </span>
          </div>
          <button
            onClick={() => {
              setFile(null);
              setFileError("");
            }}
            className="ml-auto text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            aria-label="Remove file"
            disabled={loading}
          >
            <FaTimes />
          </button>
        </motion.div>
      )}

      <div className="flex items-start space-x-3">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={file ? "Add a message or send file only..." : "Write a message..."}
          style={{ height: textareaHeight }}
          className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 resize-none transition-all min-h-[60px]"
          disabled={loading}
        />
        
        <div className="flex flex-col space-y-2">
          <motion.button
            onClick={() => fileInputRef.current.click()}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`p-2 ${loading ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'} rounded-full transition-colors`}
            disabled={loading}
            title="Attach file (max 2MB)"
          >
            <FaFile size={18} />
          </motion.button>
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept="image/*, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            disabled={loading}
          />
          
          <motion.button
            onClick={handleSend}
            disabled={(!text.trim() && !file) || loading}
            whileHover={(!text.trim() && !file) || loading ? {} : { scale: 1.1 }}
            whileTap={(!text.trim() && !file) || loading ? {} : { scale: 0.95 }}
            className={`p-2 rounded-full ${
              (!text.trim() && !file) || loading
                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white shadow-md"
            } transition-all`}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            ) : (
              <FaPaperPlane size={18} />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default InputBox;
