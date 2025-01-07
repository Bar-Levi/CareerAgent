import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const ChatBot = ({ type, initialMessages = [] }) => {
  const [messages, setMessages] = useState(initialMessages); // Load initial messages  
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingDots, setTypingDots] = useState(""); // For animated typing indicator
  const { state } = useLocation();
  const { email } = state?.email || "";

  // Local dictionary for chatbot adjustments
  const botConfig = {
    careerAdvisor: {
      title: "Career Advisor",
      apiEndpoint: `${process.env.REACT_APP_BACKEND_URL}/api/ai/sendToCareerAdvisor`,
      sessionIdSuffix: "-1",
    },
    interviewer: {
      title: "Interviewer",
      apiEndpoint: `${process.env.REACT_APP_BACKEND_URL}/api/ai/sendToInterviewer`,
      sessionIdSuffix: "-2",
    },
  };

  const botSettings = botConfig[type] || botConfig.careerAdvisor; // Default to careerAdvisor

  // Handle animated typing indicator
  useEffect(() => {
    let interval;
    if (isTyping) {
      interval = setInterval(() => {
        setTypingDots((dots) => (dots.length < 3 ? dots + "." : ""));
      }, 250);
    }
    return () => clearInterval(interval);
  }, [isTyping]);

  const sendMessageToAPI = async (userMessage) => {
    setIsTyping(true);

    try {
      const response = await fetch(botSettings.apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMessage,
          sessionId: `${email}${botSettings.sessionIdSuffix}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      return data.response; // Adjust the response field as per your API
    } catch (error) {
      console.error("Error sending message:", error);
      return "Sorry, something went wrong!";
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMessage = { sender: "user", text: input, timestamp };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const botReply = await sendMessageToAPI(input);
    const botMessage = { sender: "bot", text: botReply, timestamp };
    setMessages((prev) => [...prev, botMessage]);
  };

  return (
    <div className="relative flex flex-col h-[500px] w-[400px] border border-gray-300 rounded-lg shadow-md overflow-hidden">
      <div className="bg-green-500 text-white text-center py-3 font-bold">
        {botSettings.title}
      </div>
      <div className="flex-1 bg-gray-100 p-4 overflow-y-auto relative">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col ${
              msg.sender === "user" ? "items-end" : "items-start"
            } mb-4`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                msg.sender === "user"
                  ? "bg-green-500 text-white"
                  : "bg-gray-300 text-gray-900"
              }`}
            >
              {msg.message}
            </div>
            <span className="text-xs text-gray-500 mt-1">{msg.timestamp}</span>
          </div>
        ))}
        {/* Typing tooltip */}
        {isTyping && (
        <div className="absolute bottom-0 left-0 w-full flex justify-center pb-2 animate-slide-up">
            <div className="bg-gray-300 text-gray-700 text-sm px-4 py-2 rounded-md shadow-md w-[100px] text-center">
            Typing{typingDots}
            </div>
        </div>
        )}

      </div>
      <div className="flex p-3 border-t bg-white">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 p-2 border border-gray-300 rounded-lg mr-2 focus:outline-none focus:ring focus:border-blue-300"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 focus:outline-none"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
