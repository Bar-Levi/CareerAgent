// ChatWindow.jsx
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import MessageBubble from "./MessageBubble";
import InputBox from "./InputBox";
import socket from "../socket";

const MessageSkeleton = ({ isSender }) => {
  return (
    <div
      className={`flex text-sm items-start space-x-3 mb-4 opacity-50 ${
        isSender ? "justify-end" : ""
      }`}
    >
      {!isSender && (
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
      )}
      <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg shadow-md max-w-xs">
        <div className="h-4 bg-gray-400 dark:bg-gray-500 rounded w-24 mb-2"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
        </div>
        <div className="h-2 bg-gray-400 dark:bg-gray-500 rounded w-16 mt-2"></div>
      </div>
    </div>
  );
};

const ChatWindow = ({ user, titleName, currentOpenConversationId }) => {
  // How many messages to load per request.
  const MESSAGE_BATCH_SIZE = 20;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  // Dummy spacer height to force scrollability when needed.
  const [dummySpacerHeight, setDummySpacerHeight] = useState(0);
  const chatEndRef = useRef(null);
  const [profilePics, setProfilePics] = useState(null);

  // Refs for scrolling.
  const messagesContainerRef = useRef(null);
  // Ref to auto-scroll on initial load.
  const initialLoadRef = useRef(true);

  // Scroll to the bottom of the chat container.
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  // Load the initial (latest) messages.
  const loadInitialMessages = async () => {
    if (!currentOpenConversationId) return;
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/conversations/${currentOpenConversationId}?limit=${MESSAGE_BATCH_SIZE}&skip=0`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { conversation, pics } = await response.json();
      const initialMessages = conversation.messages;
      // Reverse the messages so that the oldest is first and the newest is last.
      setMessages(initialMessages.reverse());
      // If we received fewer than the batch size, assume no more older messages.
      setHasMore(initialMessages.length >= MESSAGE_BATCH_SIZE);

      setProfilePics(pics);
    } catch (error) {
      console.error("Error fetching chat messages", error);
    } finally {
      setLoading(false);
    }
  };

  // Load older messages when the user scrolls near the top.
  const loadMoreMessages = async () => {
    if (!currentOpenConversationId) return;
    try {
      setIsLoadingMore(true);
      const skipCount = messages.length;
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/conversations/${currentOpenConversationId}?limit=${MESSAGE_BATCH_SIZE}&skip=${skipCount}`
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

  // When a new notification arrives (e.g. a new message), fetch and append it.
  const fetchLatestMessage = async () => {
    if (!currentOpenConversationId) return;
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/conversations/${currentOpenConversationId}?limit=1&skip=0`
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
        setMessages((prev) => [...prev, notificationData.messageObject]);
        if (notificationData.conversationId === currentOpenConversationId) {
          socket.emit("messagesRead", {
            conversationId: currentOpenConversationId,
            readerId: user._id,
          });
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

  // Attach a scroll event listener to trigger lazy loading when scrolling near the top.
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      if (container.scrollTop < 50 && hasMore && !isLoadingMore && !loading) {
        loadMoreMessages();
      }
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMore, isLoadingMore, loading, messages, currentOpenConversationId]);

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
  }, [loading, messages.length]);

  // Send a new message.
  const sendMessage = async ({ text, file }) => {
    let attachmentData = null;
    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", currentOpenConversationId);
        const uploadResponse = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/cloudinary/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
        if (!uploadResponse.ok) {
          throw new Error(`File upload failed: ${uploadResponse.statusText}`);
        }
        const uploadData = await uploadResponse.json();
        attachmentData = {
          url: uploadData.url,
          type: file.type,
          name: file.name,
        };
      } catch (error) {
        console.error("Error uploading file", error);
        return;
      }
    }

    const newMessage = {
      senderId: user._id,
      senderRole: user.role,
      senderProfilePic: user.profilePic,
      senderName: user.fullName,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      attachments: attachmentData ? [attachmentData] : [],
    };
    // Optimistically update the UI.
    setMessages((prev) => [...prev, newMessage]);
    scrollToBottom();

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/conversations/${currentOpenConversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newMessage),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await response.json();
    } catch (error) {
      console.error("Error sending message", error);
    }
  };

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
              Authorization: `Bearer ${localStorage.getItem("token")}`,
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
  }, [currentOpenConversationId, user._id]);

  return (
    <div className="w-full h-full max-w-lg md:max-w-xl lg:max-w-2xl border border-gray-300 rounded-lg bg-white shadow-lg dark:bg-gray-800 flex flex-col">
      <div className="m-2 flex justify-center bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-t-lg">
        <span className="font-semibold text-gray-800 dark:text-gray-300">
          Chat with {titleName}
        </span>
      </div>
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
      
        {isLoadingMore && (
          <div className="flex justify-center items-center mb-4">
            <svg
              className="animate-spin h-5 w-5 text-gray-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
          </div>
        )}

        {loading
          ? [...Array(5)].map((_, index) => (
              <MessageSkeleton key={index} isSender={index % 2 === 0} />
            ))
          : ( messages.length > 0 ?
            messages.map((msg, index) => (
              <MessageBubble
                key={index}
                message={msg}
                currentUser={user}
                profilePics={profilePics}
              />
            )) 
          :
            <div className="flex justify-center items-center text-gray-600 dark:text-gray-400">
              Start a conversation by sending a message.
            </div>)}
      </div>
      {/* Pass currentOpenConversationId and user._id to InputBox for draft saving */}
      <InputBox
        onSend={sendMessage}
        conversationId={currentOpenConversationId}
        senderId={user._id}
      />
    </div>
  );
};

export default React.memo(ChatWindow);
