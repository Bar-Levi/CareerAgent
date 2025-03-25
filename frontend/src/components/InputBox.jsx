// InputBox.jsx
import React, { useState, useRef, useEffect } from "react";
import { FaImage } from "react-icons/fa";

const InputBox = ({ onSend, conversationId, senderId, selectedJobListingId }) => {
  // Create a unique key for the draft based on conversationId and senderId.
  const draftKey = `chatDraft-${conversationId}-${senderId}`;
  const fileInputRef = useRef(null);

  // Load the initial draft from localStorage via useState initializer.
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

  // Save the draft on every change directly inside the onChange handler.
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

  const handleSend = () => {
    if (!selectedJobListingId) {
      alert("Job listing not found / might be removed by the recruiter.");
      return;
    }

    if (text.trim() || file) {
      onSend({ text, file });
      setText("");
      setFile(null);
      // Remove the saved draft once sent.
      localStorage.removeItem(draftKey);
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) setFile(selectedFile);
  };

  // Also update the draft if the conversation changes.
  // (For example, if conversationId changes, reset the text to the new draft.)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  return (
    <div className="border-t border-gray-300 p-3 bg-white dark:bg-gray-800 flex flex-col">
      <div className="flex items-center space-x-3">
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Write a message..."
          className="flex-1 p-2 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none h-10 max-h-24 overflow-y-auto"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() && !file}
          className={`px-4 py-2 rounded-md font-semibold ${
            text.trim() || file
              ? "bg-blue-500 hover:bg-blue-600 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Send
        </button>
      </div>
      <div className="flex items-center justify-between mt-2 text-gray-600 dark:text-gray-400">
        <div className="flex space-x-4">
          <button
            onClick={() => fileInputRef.current.click()}
            className="hover:text-blue-500"
          >
            <FaImage size={18} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        {file && (
          <div className="flex items-center space-x-2 text-sm text-blue-500">
            <span>{file.name}</span>
            <button
              onClick={() => setFile(null)}
              className="text-red-500 text-xs"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputBox;
