// ChatWindow.jsx
import React, { useState, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import InputBox from "./InputBox";

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
  const [messages, setMessages] = useState([]);  
  const [loading, setLoading] = useState(true);  
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentOpenConversationId) return;
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/conversations/${currentOpenConversationId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const conversation = await response.json();
        console.log("Fetched conversation:", conversation);
        setMessages(conversation.messages);
      } catch (error) {
        console.error("Error fetching chat messages", error);
      } finally {
        setLoading(false);
      }
    };    

    fetchMessages();
  }, [jobId, currentOpenConversationId]);

  const sendMessage = async ({ text, file }) => {
    let attachmentData = null;

    // If a file is attached, upload it to Cloudinary
    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        // Pass the conversation id as folder so the file is stored there
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
        return; // Optionally, show an error to the user here
      }
    }

    // Create the new message object including attachments if any
    const newMessage = {
      senderId: user._id,
      senderRole: user.role,
      senderProfilePic: user.profilePic,
      senderName: user.fullName,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      attachments: attachmentData ? [attachmentData] : [],
    };

    // Optimistically update the UI
    setMessages((prev) => [...prev, newMessage]);

    // Send the message to your backend
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/conversations/${currentOpenConversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
      // Optionally revert the optimistic UI update here
    }
  };

  return (
    <div className="w-full h-full max-w-lg md:max-w-xl lg:max-w-2xl border border-gray-300 rounded-lg bg-white shadow-lg dark:bg-gray-800 flex flex-col">
      <div className="m-2 flex justify-center bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-t-lg">
        <span className="font-semibold text-gray-800 dark:text-gray-300">
          Chat with {job.recruiterName}
        </span>
      </div>    
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
