import React, { useState, useRef } from "react";
import { FaImage, FaLink, FaSmile } from "react-icons/fa";

const InputBox = ({ onSend }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleSend = () => {
    if (text.trim() || file) {
      onSend({ text, file });
      setText("");
      setFile(null);
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) setFile(selectedFile);
  };

  return (
    <div className="border-t border-gray-300 p-3 bg-white dark:bg-gray-800 flex flex-col">
      {/* Text Input */}
      <div className="flex items-center space-x-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a message..."
          className="flex-1 p-2 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none h-10 max-h-24 overflow-y-auto"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() && !file}
          className={`px-4 py-2 rounded-md font-semibold ${
            text.trim() || file ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Send
        </button>
      </div>

      {/* Attachments & Actions */}
      <div className="flex items-center justify-between mt-2 text-gray-600 dark:text-gray-400">
        <div className="flex space-x-4">
          {/* Image Upload */}
          <button onClick={() => fileInputRef.current.click()} className="hover:text-blue-500">
            <FaImage size={18} />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />

          {/* Link Attachment */}
          <button className="hover:text-blue-500">
            <FaLink size={18} />
          </button>

          {/* Emoji Picker (Placeholder for future emoji integration) */}
          <button className="hover:text-blue-500">
            <FaSmile size={18} />
          </button>
        </div>

        {/* File Preview */}
        {file && (
          <div className="flex items-center space-x-2 text-sm text-blue-500">
            <span>{file.name}</span>
            <button onClick={() => setFile(null)} className="text-red-500 text-xs">
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputBox;
