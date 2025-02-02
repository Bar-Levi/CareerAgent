import React, { useState, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import InputBox from "./InputBox";

const ChatWindow = ({ jobId, user, job, currentOpenConversationId }) => {
  const [messages, setMessages] = useState([
    {
      user: { name: "Recruiter", profilePic: "https://via.placeholder.com/40" },
      text: "Hello! How can I help you today?",
      timestamp: new Date().toISOString(),
    },
    {
      user: { name: "You", profilePic: "https://via.placeholder.com/40" },
      text: "Hi! I'm interested in the Software Engineer position.",
      timestamp: new Date().toISOString(),
    },
    {
      user: { name: "Recruiter", profilePic: "https://via.placeholder.com/40" },
      text: "Great! Let's discuss your qualifications.",
      timestamp: new Date().toISOString(),
    },
  ]);  
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/conversations/${jobId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMessages(data.messages);
      } catch (error) {
        console.error("Error fetching chat messages", error);
      }
    };

    fetchMessages();
  }, [jobId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const newMessage = {
      senderId: user._id,
      senderProfilePic: user.profilePic,
      senderName: user.fullName,
      text: text.text,
      timestamp: new Date().toISOString(),
    };
    setMessages([...messages, newMessage]);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/conversations/${currentOpenConversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Important for sending JSON data
        },
        body: JSON.stringify(newMessage), // Convert data to JSON string
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Optionally, you can handle the response from the server after sending
      const data = await response.json(); // If the server sends back any data
      console.log("Message sent successfully:", data);

    } catch (error) {
      console.error("Error sending message", error);
    }
  };

  return (
    <div className="w-full h-full max-w-lg md:max-w-xl lg:max-w-2xl border border-gray-300 rounded-lg bg-white shadow-lg dark:bg-gray-800 flex flex-col">
      <div className="m-2 flex justify-center align-middle bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-t-lg"> {/* Title Bar */}
        <span className="font-semibold text-gray-800 dark:text-gray-300">
          Chat with {job.recruiterName}
        </span>
      </div>    
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => (
          <MessageBubble key={index} message={msg} currentUser={user}/>
        ))}
        <div ref={chatEndRef} />
      </div>
      <InputBox onSend={sendMessage} />
    </div>
  );
};

export default ChatWindow;