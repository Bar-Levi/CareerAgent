import React, { useState } from "react";
import { FaCheckDouble, FaEye, FaRegPaperPlane, FaExternalLinkAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const MessageBubble = ({ message, currentUser, profilePics, onlineUsers }) => {
  const isSender = message.senderId === currentUser._id;
  const [hovered, setHovered] = useState(false);

  // Look up the profile picture for this message sender from the profilePics array.
  const profilePic =
    profilePics?.find((item) => item.id === message.senderId)?.profilePic ||
    'https://res.cloudinary.com/careeragent/image/upload/v1735084555/default_profile_image.png';

  // Check if the message sender is online
  const isOnline = onlineUsers?.some(
    (onlineUser) => onlineUser.userId === message.senderId
  );

  // Format the timestamp
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleQuickView = (url) => {
    window.open(url, "_blank");
  };

  const isUrl = (text) => {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };

  // Helper function to render attachments with a Quick View button.
  const renderAttachments = () => {
    if (!message.attachments || message.attachments.length === 0) return null;
    
    return (
      <div className="mt-3 space-y-3">
        {message.attachments.map((attachment, idx) => (
          <motion.div 
            key={idx} 
            className="flex flex-col space-y-2 rounded-lg overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            {attachment.type.startsWith("image/") ? (
              <div className="relative overflow-hidden rounded-lg shadow-sm">
                <motion.img
                  src={attachment.url}
                  alt={attachment.name}
                  className="max-w-full rounded-lg object-cover shadow-sm"
                  loading="lazy"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                />
                <motion.div 
                  className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                >
                  <button
                    onClick={() => handleQuickView(attachment.url)}
                    className="px-3 py-2 bg-white dark:bg-gray-800 rounded-full shadow-lg text-sm font-medium text-gray-800 dark:text-white"
                  >
                    <FaEye className="inline mr-1.5" /> View
                  </button>
                </motion.div>
              </div>
            ) : (
              <div className="relative rounded-lg overflow-hidden shadow-md">
                <embed
                  src={attachment.url}
                  type={attachment.type}
                  className="w-full h-60 sm:h-72 md:h-80 lg:h-96"
                />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                  <button
                    onClick={() => handleQuickView(attachment.url)}
                    className="flex items-center text-white text-xs hover:text-blue-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 rounded px-2 py-1"
                  >
                    <FaExternalLinkAlt className="mr-1.5" />
                    Open Full Screen
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      className={`flex items-start mb-6 w-full ${
        isSender ? "justify-end" : "justify-start"
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {isSender ? (
        // Sender's message: bubble first, then profile picture on the right
        <>
          <div className="message-container flex flex-col items-end max-w-[75%] xs:max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
            <motion.div 
              className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-800 p-4 rounded-2xl rounded-tr-sm shadow-lg backdrop-blur-sm border border-blue-400/30 dark:border-blue-500/30 text-white"
              whileHover={{ scale: 1.01, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.2), 0 8px 10px -6px rgba(59, 130, 246, 0.1)" }}
              transition={{ duration: 0.2 }}
              layout
            >
              <div className="text-sm font-semibold mb-1 flex items-center space-x-1">
                <motion.span 
                  initial={{ opacity: 0.9 }} 
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                >
                  {message.senderName}
                </motion.span>
              </div>
              {isUrl(message.text) ? (
                <motion.a 
                  className="text-blue-100 hover:text-white underline break-all group flex items-center"
                  href={message.text}
                  target="_blank" 
                  rel="noopener noreferrer"
                  whileHover={{ x: 2 }}
                >
                  {message.text}
                  <motion.span 
                    initial={{ opacity: 0, x: -5 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ duration: 0.2 }}
                    className="opacity-0 group-hover:opacity-100 ml-1"
                  >
                    <FaExternalLinkAlt size={10} />
                  </motion.span>
                </motion.a>
              ) : (
                <p className="text-white break-words">{message.text}</p>
              )}
              
              {renderAttachments()}
              <div className="flex items-center space-x-1.5 mt-2 justify-end">
                <span className="text-xs text-blue-100">
                  {formattedTime}
                </span>
                <motion.div 
                  animate={message.read ? { scale: [1, 1.2, 1], opacity: [0.7, 1, 0.9] } : {}}
                  transition={{ duration: 0.5, times: [0, 0.5, 1] }}
                >
                  <FaCheckDouble
                    size={12}
                    className={message.read ? "text-blue-200" : "text-blue-100 opacity-70"}
                  />
                </motion.div>
              </div>

              <motion.div 
                className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5 opacity-0"
                initial={{ scale: 0 }}
                animate={hovered ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <FaRegPaperPlane className="text-white" size={10} />
              </motion.div>
            </motion.div>
          </div>
          <div className="relative ml-3 mt-1">
            <motion.img
              src={profilePic}
              alt="User"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow-md object-cover"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            />
            {isOnline && (
              <motion.div 
                className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "loop", repeatDelay: 5 }}
              />
            )}
          </div>
        </>
      ) : (
        // Receiver's message: profile picture first, then bubble on the right
        <>
          <div className="relative mr-3 mt-1">
            <motion.img
              src={profilePic}
              alt="User"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow-md object-cover"
              whileHover={{ scale: 1.1, rotate: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            />
            {isOnline && (
              <motion.div 
                className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "loop", repeatDelay: 5 }}
              />
            )}
          </div>
          <div className="message-container flex flex-col items-start max-w-[75%] xs:max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
            <motion.div 
              className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-sm shadow-lg backdrop-blur-sm border border-gray-100 dark:border-gray-700"
              whileHover={{ scale: 1.01, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.05)" }}
              transition={{ duration: 0.2 }}
              layout
            >
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {message.senderName}
              </div>
              {isUrl(message.text) ? (
                <motion.a 
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 break-all group flex items-center"
                  href={message.text}
                  target="_blank" 
                  rel="noopener noreferrer"
                  whileHover={{ x: 2 }}
                >
                  {message.text}
                  <motion.span 
                    initial={{ opacity: 0, x: -5 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ duration: 0.2 }}
                    className="opacity-0 group-hover:opacity-100 ml-1"
                  >
                    <FaExternalLinkAlt size={10} />
                  </motion.span>
                </motion.a>
              ) : (
                <p className="text-gray-700 dark:text-gray-300 break-words">{message.text}</p>
              )}
              {renderAttachments()}
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 inline-block">
                {formattedTime}
              </span>

              <motion.div 
                className="absolute -bottom-1 -left-1 bg-gray-200 dark:bg-gray-700 rounded-full p-0.5 opacity-0"
                initial={{ scale: 0 }}
                animate={hovered ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <FaRegPaperPlane className="text-gray-500 dark:text-gray-400" size={10} />
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default MessageBubble;
