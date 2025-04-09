import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import Notification from "./Notification";
import HeaderWithToggle from "./HeaderWithToggle";
import { FiSend } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const ChatBot = ({
  chatId,
  prettyDate,
  conversationId,
  conversationTitle,
  isProfileSynced,
  type,
  initialMessages = [],
  jobData,
}) => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingDots, setTypingDots] = useState("");
  const autoPromptSentRef = useRef(false);
  const messagesEndRef = useRef(null);
  const { state } = useLocation();
  const email = state?.email || "";
  const token = state?.token || "";
  const MAX_MESSAGE_COUNT = 100;
  const [notification, setNotification] = useState(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const botConfig = {
    careerAdvisor: {
      title: "Career Advisor",
      apiEndpoint: `${process.env.REACT_APP_BACKEND_URL}/api/ai/sendToBot`,
      avatar: "🤖",
    },
    interviewer: {
      title: "Interviewer",
      apiEndpoint: `${process.env.REACT_APP_BACKEND_URL}/api/ai/sendToBot`,
      avatar: "👨‍💼",
    },
  };

  const botSettings = botConfig[type] || botConfig.careerAdvisor;

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Typing indicator animation
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
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt: userMessage,
          sessionId: `${conversationId}`,
          type,
        }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Error sending message:", error);
      return "Sorry, something went wrong!";
    } finally {
      setIsTyping(false);
    }
  };

  const saveMessage = async (messageObject) => {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/bot-conversations/${chatId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ message: messageObject }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to save message");
    }
    return await response.json();
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const textToSend = input.trim();
    const userMessage = {
      sender: "user",
      text: textToSend,
      timestamp: new Date().toISOString(),
      fullName: state?.user?.fullName || "User",
    };

    if (messages.length < MAX_MESSAGE_COUNT)
      setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      await saveMessage(userMessage);
      const botReply = await sendMessageToAPI(textToSend);
      const botMessage = {
        sender: "bot",
        text: botReply,
        timestamp: new Date().toISOString(),
      };

      await saveMessage(botMessage);
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error handling message:", error);
      showNotification("error", error.message);
    }
  };

  // Auto-send prompt for interviewer chats if conversation is new
  useEffect(() => {
    if (
      type === "interviewer" &&
      jobData &&
      initialMessages.length === 0 &&
      !autoPromptSentRef.current
    ) {
      autoPromptSentRef.current = true;
      const skillsText =
        jobData.skills && jobData.skills.length > 0
          ? jobData.skills.join(", ")
          : "this job requires no specific skills";
      const prompt = `I am applying for the position of ${jobData.jobRole}. The job description is: ${jobData.description}. The job requires these skills: ${skillsText}. The required experience level is ${jobData.experienceLevel || "N/A"}, the job is ${jobData.remote ? "remote" : "on site"}, and the job type is ${jobData.jobType ? jobData.jobType.join(", ") : "N/A"}. Please provide exactly 10 interview questions relevant to this job posting and then evaluate my answers to see if I am correct. Do not ask any additional questions.`;
      (async () => {
        try {
          const userPromptMsg = {
            sender: "user",
            text: prompt,
            timestamp: new Date().toISOString(),
            fullName: state?.user?.fullName || "User",
          };
          await saveMessage(userPromptMsg);
          setMessages((prev) => [...prev, userPromptMsg]);
          const botReply = await sendMessageToAPI(prompt);
          const botMessage = {
            sender: "bot",
            text: botReply,
            timestamp: new Date().toISOString(),
          };
          await saveMessage(botMessage);
          setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
          console.error("Error auto sending message:", error);
        }
      })();
    }
  }, [type, jobData, initialMessages]);

  const displayedTitle =
    conversationTitle && conversationTitle.trim().length > 0
      ? conversationTitle
      : jobData && jobData.jobRole
      ? `Interview for ${jobData.jobRole}`
      : "Chat Conversation";

  const getUserInitial = (fullName) => {
    return fullName ? fullName.charAt(0).toUpperCase() : "U";
  };

  return (
    <div className="relative flex flex-col h-full w-full bg-white rounded-lg shadow-lg overflow-hidden">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      <HeaderWithToggle
        conversationTitle={displayedTitle}
        isProfileSynced={isProfileSynced}
        chatId={chatId}
        token={token}
        email={email}
      />
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        <div className="space-y-4">
          {messages
            .filter((msg) => msg && msg.text)
            .map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} items-end space-x-2`}
              >
                {msg.sender === "bot" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-lg">
                    {botSettings.avatar}
                  </div>
                )}
                <div className={`max-w-[70%] ${msg.sender === "user" ? "order-1" : "order-2"}`}>
                  <div
                    className={`p-3 rounded-2xl ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 rounded-bl-none shadow-sm"
                    }`}
                  >
                    <ReactMarkdown
                      components={{
                        p: ({ node, children }) => (
                          <p className="whitespace-pre-wrap">{children}</p>
                        ),
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 block">
                    {prettyDate(msg.timestamp || new Date())}
                  </span>
                </div>
                {msg.sender === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                    {getUserInitial(msg.fullName)}
                  </div>
                )}
              </motion.div>
            ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-lg">
                {botSettings.avatar}
              </div>
              <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 bg-white border-t border-gray-100 relative z-[999]">
        <div className="flex items-center space-x-2 mb-16">
          <textarea
            placeholder="Type a message..."
            className="flex-1 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm resize-none bg-gray-50 text-gray-900 placeholder-gray-500 transition-all duration-200"
            value={input}
            rows={1}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.shiftKey) {
                e.preventDefault();
                setInput((prevInput) => prevInput + "\n");
              } else if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </div>
        <div className="absolute bottom-2 left-0 right-0 text-center">
          <span className="text-xs text-gray-500">
            Our bot may occasionally make mistakes. Please verify critical information.
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
