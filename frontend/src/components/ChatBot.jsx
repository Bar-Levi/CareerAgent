import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";

const ChatBot = ({ chatId, prettyDate, conversationId, conversationTitle, type, initialMessages = [] }) => {
  console.log("Initial messages: " + initialMessages);
  const [messages, setMessages] = useState(initialMessages); // Load initial messages  
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingDots, setTypingDots] = useState(""); // For animated typing indicator
  const [errorMessage, setErrorMessage] = useState(""); // Error message for tooltip
  const { state } = useLocation();
  const email = state?.email || "";
  const MAX_MESSAGE_COUNT = 100;

  // Local dictionary for chatbot adjustments
  const botConfig = {
    careerAdvisor: {
      title: "Career Advisor",
      apiEndpoint: `${process.env.REACT_APP_BACKEND_URL}/api/ai/sendToBot`,
    },
    interviewer: {
      title: "Interviewer",
      apiEndpoint: `${process.env.REACT_APP_BACKEND_URL}/api/ai/sendToBot`,
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
    console.log("email: " + email);
    console.log("type: " + type);
    try {
      const response = await fetch(botSettings.apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMessage,
          sessionId: `${conversationId}`,
          type
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

    // Construct the user message object
    const userMessage = {
      sender: "user",
      text: input,
      timestamp: new Date(), // Save the full Date object for consistency
    };

    // Optimistically update the UI
    if (messages.length < MAX_MESSAGE_COUNT)
      setMessages((prev) => [...prev, userMessage]);    
    setInput("");


    try {
      // Save the message in the backend
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/conversations/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const data = await response.json();
          console.log(data.error);
          setErrorMessage(data.error); // Set error message
          setTimeout(() => setErrorMessage(""), 5000); // Hide error tooltip after 5 seconds
          throw new Error(data.error);
        }
        throw new Error("Failed to save the user message");
      }
      const botReply = await sendMessageToAPI(input); // Get bot's response
      const botMessage = {
        sender: "bot",
        text: botReply,
        timestamp: new Date(), // Save the full Date object for consistency
      };

      // Save the bot's reply to the backend
      const botResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/conversations/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: botMessage,
        }),
      });

      if (!botResponse.ok) {
        throw new Error("Failed to save the bot reply");
      }

      // Update the UI with the bot's message
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error handling message:", error);
    }
    
  };

  return (
    <div className="relative flex flex-col h-full w-full border border-gray-300 rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-brand-primary text-white text-center py-3 font-bold">
        {conversationTitle}
      </div>
  
      {/* Message Area */}
      <div className="flex-1 bg-gray-100 p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div
          key={index}
          className={`flex flex-col ${
            msg.sender === "user" ? "items-end" : "items-start"
          } mb-4`}
        >
          <ReactMarkdown
            className={`max-w-[70%] p-3 rounded-lg ${
              msg.sender === "user"
                ? "bg-brand-primary text-white"
                : "bg-gray-300 text-gray-900"
            }`}
            // Enable newlines rendering
            components={{
              p: ({ node, children }) => <p className="whitespace-pre-wrap">{children}</p>,
            }}
          >
            {msg.text}
          </ReactMarkdown>
          <span className="text-xs text-gray-500 mt-1">
            {prettyDate(msg.timestamp || new Date())}
          </span>
        </div>
        
        ))}
      </div>
  
      {/* Input Section */}
      <div className="flex p-3 border-t bg-white">
        <textarea
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded-lg p-3 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm resize-none bg-gray-100 text-gray-900 placeholder-gray-500"
          value={input}
          rows={1} // Default rows for multiline display
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.shiftKey) {
              e.preventDefault(); // Prevent the default behavior
              setInput((prevInput) => prevInput + "\n"); // Append a newline
            } else if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault(); // Prevent the default behavior
              handleSend(); // Call the send function
            }
          }}
        />
        <button
          onClick={handleSend}
          className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-green-600 focus:outline-none"
        >
          Send
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center bg-gray-50 p-3">
        <span className="text-xs text-center text-gray-500">
          Our bot may occasionally make mistakes.<br />Please verify critical information.
        </span>
      </div>
    </div>
  );
  
};

export default ChatBot;
