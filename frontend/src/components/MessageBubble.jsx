import React from "react";

const MessageBubble = ({ message, currentUser }) => {
  const isSender = message.senderId === currentUser._id;

  return (
    <div className={`flex items-start mb-4 ${isSender ? "justify-end" : "justify-start"}`}>
      {isSender ? (
        // For sender: Message bubble first, then profile picture on the right
        <>
          <div className="max-w-xs bg-gray-200ec dark:bg-gray-700 p-3 rounded-lg shadow-md">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">
              {message.senderName}
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {message.text}
            </p>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <img
            src={message.senderProfilePic}
            alt="User"
            className="w-10 h-10 rounded-full ml-2"
          />
        </>
      ) : (
        // For receiver: Profile picture first, then message bubble on the right
        <>
          <img
            src={message.senderProfilePic}
            alt="User"
            className="w-10 h-10 rounded-full mr-2"
          />
          <div className="max-w-xs bg-gray-100 dark:bg-gray-700 p-3 rounded-lg shadow-md">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">
              {message.senderName}
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {message.text}
            </p>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default MessageBubble;
