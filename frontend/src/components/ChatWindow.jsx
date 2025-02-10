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

const ChatWindow = ({ jobId, user, job, currentOpenConversationId }) => {
  // How many messages to load per request.
  const MESSAGE_BATCH_SIZE = 20;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  // Dummy spacer height to force scrollability when needed.
  const [dummySpacerHeight, setDummySpacerHeight] = useState(0);

  // Refs for scrolling.
  const chatEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  // Ref to auto-scroll on initial load.
  const initialLoadRef = useRef(true);

  // Scroll to the bottom of the chat.
  const scrollToBottom = () => {
    // if (chatEndRef.current) {
    //   chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    // }
  };

  // Load the initial (latest) messages.
  // Assumes the API returns messages in descending order (newest first),
  // so we reverse them for chronological display.
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
      const conversation = await response.json();
      const initialMessages = conversation.messages;
      setMessages(initialMessages.reverse());
      // If we got fewer than the batch size, assume no more older messages.
      setHasMore(initialMessages.length >= MESSAGE_BATCH_SIZE);
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
      const conversation = await response.json();
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

  // When a new notification arrives (e.g. a new message),
  // fetch the latest message and append it.
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
    socket.connect();
    if (user && user._id) {
      socket.emit("join", user._id);
    }
    socket.on("newNotification", fetchLatestMessage);
    return () => {
      socket.off("newNotification");
    };
  }, [user]);

  // Load the initial batch when the chat opens or conversation changes.
  useEffect(() => {
    loadInitialMessages();
  }, [jobId, currentOpenConversationId]);

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
      // If content doesn't exceed container height, add a fixed 50px spacer.
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
          { method: "POST", body: formData }
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
      const data = await response.json();
      console.log("Message sent successfully:", data);
    } catch (error) {
      console.error("Error sending message", error);
      // Optionally revert the optimistic update here.
    }
  };

  return (
    <div className="w-full h-full max-w-lg md:max-w-xl lg:max-w-2xl border border-gray-300 rounded-lg bg-white shadow-lg dark:bg-gray-800 flex flex-col">
      <div className="m-2 flex justify-center bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-t-lg">
        <span className="font-semibold text-gray-800 dark:text-gray-300">
          Chat with {job.recruiterName}
        </span>
      </div>
      {/* Fixed height container with overflow-y-scroll */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-scroll p-4 space-y-3 h-64"
      >
        {/* Dummy spacer to force scrollability */}
        {dummySpacerHeight > 0 && <div style={{ height: dummySpacerHeight }} />}
        {loading
          ? [...Array(5)].map((_, index) => (
              <MessageSkeleton key={index} isSender={index % 2 === 0} />
            ))
          : messages.map((msg, index) => (
              <MessageBubble key={index} message={msg} currentUser={user} />
            ))}
        <div ref={chatEndRef} />
      </div>
      <InputBox onSend={sendMessage} />
    </div>
  );
};

export default React.memo(ChatWindow);
