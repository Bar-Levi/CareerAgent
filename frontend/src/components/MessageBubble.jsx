import React from "react";
import { FaCheckDouble } from "react-icons/fa";

const MessageBubble = ({ message, currentUser }) => {
  const isSender = message.senderId === currentUser._id;

  // Format the timestamp (customize as needed)
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex items-start mb-4 ${isSender ? "justify-end" : "justify-start"}`}>
      {isSender ? (
        // Sender's message: bubble first then profile picture on the right
        <>
          <div className="max-w-xs bg-gray-200 dark:bg-gray-700 p-3 rounded-lg shadow-md">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">
              {message.senderName}
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {message.text}
            </p>
            {/* Render attachments if present */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment, idx) => {
                  if (attachment.type.startsWith("image/")) {
                    return (
                      <img
                        key={idx}
                        src={attachment.url}
                        alt={attachment.name}
                        className="max-w-full rounded"
                      />
                    );
                  } else {
                    return (
                      <embed
                        key={idx}
                        src={attachment.url}
                        type={attachment.type}
                        className="w-full h-64"
                      />
                    );
                  }
                })}
              </div>
            )}
            {/* Timestamp with double tick icon */}
            <div className="flex items-center space-x-1 mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formattedTime}
              </span>
              <FaCheckDouble
                size={12}
                className={message.read ? "text-blue-500" : "text-gray-500"}
              />
            </div>
          </div>
          <img
            src={message.senderProfilePic}
            alt="User"
            className="w-10 h-10 rounded-full ml-2"
          />
        </>
      ) : (
        // Receiver's message: profile picture first, then bubble on the right
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
            {/* Render attachments if present */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment, idx) => {
                  if (attachment.type.startsWith("image/")) {
                    return (
                      <img
                        key={idx}
                        src={attachment.url}
                        alt={attachment.name}
                        className="max-w-full rounded"
                      />
                    );
                  } else {
                    return (
                      <embed
                        key={idx}
                        src={attachment.url}
                        type={attachment.type}
                        className="w-full h-64"
                      />
                    );
                  }
                })}
              </div>
            )}
            {/* For receiver's messages, you might show only the timestamp */}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formattedTime}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default MessageBubble;
