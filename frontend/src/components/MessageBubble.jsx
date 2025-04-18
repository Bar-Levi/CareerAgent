import React from "react";
import { FaCheckDouble, FaEye } from "react-icons/fa";

const MessageBubble = ({ message, currentUser, profilePics }) => {
  const isSender = message.senderId === currentUser._id;

  // Look up the profile picture for this message sender from the profilePics array.
  const profilePic =
    profilePics?.find((item) => item.id === message.senderId)?.profilePic ||
    'https://res.cloudinary.com/careeragent/image/upload/v1735084555/default_profile_image.png';

  // Format the timestamp
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleQuickView = (url) => {
    window.open(url, "_blank");
  };

  // Helper function to render attachments with a Quick View button.
  const renderAttachments = () => {
    if (!message.attachments || message.attachments.length === 0) return null;
    return (
      <div className="mt-2 space-y-2">
        {message.attachments.map((attachment, idx) => (
          <div key={idx} className="flex flex-col space-y-1">
            {attachment.type.startsWith("image/") ? (
              <img
                src={attachment.url}
                alt={attachment.name}
                className="max-w-full rounded"
              />
            ) : (
              <embed
                src={attachment.url}
                type={attachment.type}
                className="w-full h-64"
              />
            )}
            <div className="flex space-x-2">
              <button
                onClick={() => handleQuickView(attachment.url)}
                className="flex items-center text-blue-500 text-xs hover:underline focus:outline-none"
              >
                <FaEye className="mr-1" />
                View Full Screen
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`flex items-start mb-4 w-full ${
        isSender ? "justify-end" : "justify-start"
      }`}
    >
      {isSender ? (
        // Sender's message: bubble first, then profile picture on the right
        <>
          <div className="max-w-xs bg-blue-100 dark:bg-gray-700 p-3 rounded-lg shadow-md">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">
              {message.senderName}
            </div>
            {
              message.text.startsWith("http") ? 
              <a 
                className="text-blue-700 dark:text-blue-300"
                href={message.text}
                target="_blank" 
                >
                  {message.text}
              </a>
              :
              <p className="text-gray-700 dark:text-gray-300">{message.text}</p>

              
            }
            
            {renderAttachments()}
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
            src={profilePic}
            alt="User"
            className="w-10 h-10 rounded-full ml-2"
          />
        </>
      ) : (
        // Receiver's message: profile picture first, then bubble on the right
        <>
          <img
            src={profilePic}
            alt="User"
            className="w-10 h-10 rounded-full mr-2"
          />
          <div className="max-w-xs bg-gray-100 dark:bg-gray-700 p-3 rounded-lg shadow-md">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">
              {message.senderName}
            </div>
            <p className="text-gray-700 dark:text-gray-300">{message.text}</p>
            {renderAttachments()}
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
