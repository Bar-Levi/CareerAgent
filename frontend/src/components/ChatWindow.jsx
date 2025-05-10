// ChatWindow.jsx
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import MessageBubble from "./MessageBubble";
import InputBox from "./InputBox";
import socket from "../socket";
import { motion, AnimatePresence } from "framer-motion";

const MessageSkeleton = ({ isSender }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex text-sm items-start space-x-3 mb-4 ${
        isSender ? "justify-end" : ""
      }`}
    >
      {!isSender && (
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
      )}
      <div className={`p-3 rounded-2xl shadow-sm ${isSender ? "rounded-tr-sm bg-blue-400/40 dark:bg-blue-900/40" : "rounded-tl-sm bg-gray-200/70 dark:bg-gray-700/70"} backdrop-blur-sm max-w-xs`}>
        <div className="h-4 bg-gray-400/60 dark:bg-gray-500/60 rounded w-24 mb-2 animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-300/60 dark:bg-gray-600/60 rounded w-32 animate-pulse"></div>
          <div className="h-3 bg-gray-300/60 dark:bg-gray-600/60 rounded w-20 animate-pulse"></div>
        </div>
        <div className="h-2 bg-gray-400/60 dark:bg-gray-500/60 rounded w-16 mt-2 animate-pulse"></div>
      </div>
      {isSender && (
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
      )}
    </motion.div>
  );
};

const ChatWindow = ({ user, title, currentOpenConversationId, onlineUsers }) => {
  // How many messages to load per request.
  const MESSAGE_BATCH_SIZE = 20;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  // Dummy spacer height to force scrollability when needed.
  const [dummySpacerHeight, setDummySpacerHeight] = useState(0);
  const chatEndRef = useRef(null);
  const [profilePics, setProfilePics] = useState(null);
  const token = localStorage.getItem("token");
  const [selectedJobListingId, setSelectedJobListingId] = useState(null);

  // Refs for scrolling.
  const messagesContainerRef = useRef(null);
  // Ref to auto-scroll on initial load.
  const initialLoadRef = useRef(true);

  // Scroll to the bottom of the chat container.
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // Get jobListingId using the currentOpenConversationId
    const getJobListingId = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/conversations/jobListingId/${currentOpenConversationId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        
        const data = await response.json();
        
        if (response.status === 404) {
          return;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        setSelectedJobListingId(data.jobListingId);
      } catch (error) {
        console.error("Error fetching job listing ID:", error);
      }
    };
    
    if (currentOpenConversationId) {
      getJobListingId();
    }
  }, [currentOpenConversationId, token]);

  const loadInitialMessages = async () => {
    if (!currentOpenConversationId) return;
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/conversations/${currentOpenConversationId}?limit=${MESSAGE_BATCH_SIZE}&skip=0`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle response: update the state with the messages received
      setMessages(
        (data.conversation.messages || []).sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        )
      );
      setProfilePics(data.pics);
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Load older messages when the user scrolls near the top.
  const loadMoreMessages = async () => {
    if (!currentOpenConversationId || !hasMore) return;
    
    try {
      setIsLoadingMore(true);
      const skipCount = messages.length;
      
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/conversations/${currentOpenConversationId}?limit=${MESSAGE_BATCH_SIZE}&skip=${skipCount}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const { conversation } = await response.json();
      const olderMessages = conversation.messages;
      
      if (olderMessages.length < MESSAGE_BATCH_SIZE) {
        setHasMore(false);
      }
      
      const reversedOlderMessages = olderMessages.reverse();
      // Prepend the older messages to the current list.
      setMessages((prev) => [...reversedOlderMessages, ...prev]);

      // Adjust scroll position so the view doesn't jump.
      if (messagesContainerRef.current) {
        const container = messagesContainerRef.current;
        const previousScrollHeight = container.scrollHeight;
        setTimeout(() => {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - previousScrollHeight;
        }, 0);
      }
    } catch (error) {
      console.error("Error loading more messages", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Handle scroll events to load more messages when near top
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    
    // Load more messages when near the top
    if (scrollTop < 50 && hasMore && !isLoadingMore && !loading) {
      loadMoreMessages();
    }
  };

  // Set up the scroll event listener
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMore, isLoadingMore, loading, messages]);

  // When a new notification arrives (e.g. a new message), fetch and append it.
  const fetchLatestMessage = async () => {
    if (!currentOpenConversationId) return;
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/conversations/${currentOpenConversationId}?limit=1&skip=0`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const conversation = await response.json();
      if (conversation.messages && conversation.messages.length > 0) {
        const latestMessageFromAPI = conversation.messages[0];
        if (
          messages.length === 0 ||
          new Date(latestMessageFromAPI.timestamp) >
            new Date(messages[messages.length - 1].timestamp)
        ) {
          setMessages((prev) => [...prev, latestMessageFromAPI]);
          scrollToBottom();
        }
      }
    } catch (error) {
      console.error("Error fetching latest message", error);
    }
  };

  // Set up the socket connection and listen for new notifications.
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    
    if (user && user._id) {
      socket.emit("join", user._id);
    }
  
    const handleNewNotification = (notificationData) => {
      if (notificationData.type === "chat") {
        if (notificationData.conversationId === currentOpenConversationId) {
          setMessages((prev) => [...prev, notificationData.messageObject]);
          socket.emit("messagesRead", {
            conversationId: currentOpenConversationId,
            readerId: user._id,
          });
          
          // Scroll to bottom when new message arrives if we're already near the bottom
          if (messagesContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
            if (scrollHeight - scrollTop - clientHeight < 200) {
              scrollToBottom();
            }
          }
        }
      }
    };

    const handleUpdateReadMessages = (readConversationId) => {
      if (currentOpenConversationId === readConversationId) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.senderId === user._id ? { ...msg, read: true } : msg
          )
        );
      }
    };
  
    socket.on("newNotification", handleNewNotification);
    socket.on("updateReadMessages", handleUpdateReadMessages);
    
    return () => {
      socket.off("newNotification", handleNewNotification);
      socket.off("updateReadMessages", handleUpdateReadMessages);
    };
  }, [user?._id, currentOpenConversationId]);

  // Fetch messages when conversation ID changes.
  useEffect(() => {
    initialLoadRef.current = true;
    loadInitialMessages();
  }, [currentOpenConversationId]);

  // Compute a dummy spacer height to force scrollability when content is too short.
  useLayoutEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const visibleHeight = container.clientHeight;
      const contentHeight = container.scrollHeight;
      
      if (contentHeight <= visibleHeight) {
        setDummySpacerHeight(50);
      } else {
        setDummySpacerHeight(0);
      }
    }
  }, [messages, hasMore, loading]);

  // Auto-scroll to the bottom on initial load.
  useLayoutEffect(() => {
    if (initialLoadRef.current && !loading && messages.length > 0) {
      scrollToBottom();
      initialLoadRef.current = false;
    }
  }, [loading, messages?.length]);

  // Send a new message with improved file handling.
  const sendMessage = async ({ text, file, onProgress }) => {
    try {
      setSendingMessage(true);
      
      // Check if the jobListing is still available on the database.
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/conversations/jobListingId/${currentOpenConversationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 404) {
          alert(data.message);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        setSelectedJobListingId(data.jobListingId);
      }
    
      let attachmentData = null;
      if (file) {
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("folder", currentOpenConversationId);
          
          // Add a timestamp to help prevent caching issues
          formData.append("timestamp", Date.now().toString());
          
          console.log("Uploading file:", file.name, "Size:", (file.size / 1024).toFixed(2), "KB", "Type:", file.type);
          
          // Use XMLHttpRequest for better control over the upload
          const uploadFile = () => {
            return new Promise((resolve, reject) => {
              const xhr = new XMLHttpRequest();
              
              // Setup progress tracking
              xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                  const percentComplete = Math.round((event.loaded / event.total) * 100);
                  console.log(`Upload progress: ${percentComplete}%`);
                  
                  // Call the onProgress callback if provided
                  if (onProgress && typeof onProgress === 'function') {
                    onProgress(percentComplete);
                  }
                }
              };
              
              xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                  try {
                    const response = JSON.parse(xhr.responseText);
                    // Ensure 100% progress on successful completion
                    if (onProgress) onProgress(100);
                    resolve(response);
                  } catch (e) {
                    console.error("Failed to parse response:", xhr.responseText);
                    reject(new Error("Invalid response from server"));
                  }
                } else {
                  try {
                    const errorResponse = JSON.parse(xhr.responseText);
                    reject(new Error(errorResponse.message || errorResponse.error || `Upload failed with status ${xhr.status}`));
                  } catch (e) {
                    reject(new Error(`Upload failed with status ${xhr.status}`));
                  }
                }
              };
              
              xhr.onerror = () => {
                reject(new Error("Network error during upload"));
              };
              
              xhr.ontimeout = () => {
                reject(new Error("Upload timed out"));
              };
              
              // Set a generous timeout
              xhr.timeout = 60000; // 60 seconds
              
              xhr.open("POST", `${process.env.REACT_APP_BACKEND_URL}/api/cloudinary/upload`, true);
              xhr.send(formData);
            });
          };
          
          // Execute the upload
          const uploadData = await uploadFile();
          console.log("Upload successful:", uploadData);
          
          attachmentData = {
            url: uploadData.url,
            type: file.type,
            name: file.name,
            size: file.size,
          };
        } catch (error) {
          console.error("Error uploading file:", error);
          alert(error.message || "Failed to upload the file. Please try again.");
          return;
        }
      }

      // If it's a file-only message with no text, use a space instead of empty string
      const messageText = text.trim() || (file ? " " : "");
      
      // Don't send empty messages
      if (!messageText && !attachmentData) {
        throw new Error("Cannot send empty message");
      }

      const newMessage = {
        senderId: user._id,
        senderRole: user.role,
        senderProfilePic: user.profilePic,
        senderName: user.fullName,
        text: messageText,
        timestamp: new Date().toISOString(),
        attachments: attachmentData ? [attachmentData] : [],
      };
      
      // Optimistically update the UI.
      setMessages((prev) => [...prev, newMessage]);
      scrollToBottom();

      const sendResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/conversations/${currentOpenConversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(newMessage),
        }
      );
      
      if (!sendResponse.ok) {
        throw new Error(`Failed to send message: ${sendResponse.statusText}`);
      }
      
      await sendResponse.json();
    } catch (error) {
      console.error("Error sending message:", error);
      alert(error.message || "Failed to send message. Please try again.");
    } finally {
      setSendingMessage(false);
    }
  };

  // Mark messages as read when the conversation opens
  useEffect(() => {
    if (!currentOpenConversationId) return;
    
    const markMessagesAsRead = async () => {
      try {
        await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/conversations/${currentOpenConversationId}/markAsRead`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ readerId: user._id }),
          }
        );
        
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.senderId !== user._id ? { ...msg, read: true } : msg
          )
        );
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    };
    
    markMessagesAsRead();
  }, [currentOpenConversationId, user._id, token]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full max-w-lg md:max-w-xl lg:max-w-2xl border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-lg flex flex-col overflow-hidden backdrop-blur-sm"
    >
      <div className="p-3 flex justify-center items-center bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <span className="font-semibold text-gray-800 dark:text-gray-200 text-lg">
          {title}
        </span>
      </div>
      
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
      >
        {dummySpacerHeight > 0 && (
          <div style={{ height: dummySpacerHeight }}></div>
        )}
      
        {isLoadingMore && (
          <div className="flex justify-center items-center mb-4">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"
            ></motion.div>
          </div>
        )}

        {error && (
          <motion.div 
            className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg text-center my-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {error}
            <button 
              onClick={loadInitialMessages} 
              className="ml-2 underline hover:text-red-800 dark:hover:text-red-200"
            >
              Try again
            </button>
          </motion.div>
        )}

        <AnimatePresence>
          {loading ? (
            // Show skeletons while loading
            [...Array(5)].map((_, index) => (
              <MessageSkeleton key={index} isSender={index % 2 === 0} />
            ))
          ) : messages.length > 0 ? (
            // Show messages
            messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 > 1 ? 0 : index * 0.05 }}
              >
                <MessageBubble
                  message={msg}
                  currentUser={user}
                  profilePics={profilePics}
                  onlineUsers={onlineUsers}
                />
              </motion.div>
            ))
          ) : (
            // Empty state
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-10 text-gray-500 dark:text-gray-400"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-16 w-16 mb-4 text-gray-300 dark:text-gray-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p className="text-center">Start a conversation by sending a message.</p>
              <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-1">
                Messages and files up to 2MB are supported.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pass currentOpenConversationId and user._id to InputBox for draft saving */}
      <InputBox
        onSend={sendMessage}
        conversationId={currentOpenConversationId}
        senderId={user._id}
        selectedJobListingId={selectedJobListingId}
      />
    </motion.div>
  );
};

export default React.memo(ChatWindow);
