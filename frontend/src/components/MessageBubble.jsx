import React from "react";
import ReactionBar from "./ReactionBar";

const MessageBubble = ({ message, currentUser }) => {
  return (
    <div className={`flex text-sm items-start space-x-3 mb-4 ${message.senderId === currentUser._id ? "justify-end" : ""}`}>
      <img src={message.senderProfilePic} alt="User" className="w-10 h-10 rounded-full" />
      <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg shadow-md max-w-xs">
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">{message.senderName}</div>
        <p className="text-gray-700 dark:text-gray-300">{message.text}</p>
        <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(message.timestamp).toLocaleTimeString()}</span>
        <ReactionBar />
      </div>
    </div>
  );
};

export default MessageBubble;
