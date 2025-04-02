import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import Notification from "./Notification";
import HeaderWithToggle from "./HeaderWithToggle";

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
  const { state } = useLocation();
  const email = state?.email || "";
  const token = state?.token || "";
  const MAX_MESSAGE_COUNT = 100;
  const [notification, setNotification] = useState(null);

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

  // Helper function to save a message wrapped in a "message" key
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
    };

    if (messages.length < MAX_MESSAGE_COUNT)
      setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      // First, save the user message.
      await saveMessage(userMessage);
      // Then get the bot reply.
      const botReply = await sendMessageToAPI(textToSend);
      const botMessage = {
        sender: "bot",
        text: botReply,
        timestamp: new Date().toISOString(),
      };

      // Save the bot message.
      await saveMessage(botMessage);
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error handling message:", error);
      showNotification("error", error.message);
    }
  };

  // Auto-send prompt for interviewer chats if conversation is new.
  useEffect(() => {
    if (
      type === "interviewer" &&
      jobData &&
      initialMessages.length === 0 &&
      !autoPromptSentRef.current
    ) {
      autoPromptSentRef.current = true;
      // Determine the skills text:
      const skillsText =
        jobData.skills && jobData.skills.length > 0
          ? jobData.skills.join(", ")
          : "this job requires no specific skills";
      // Build the full prompt with additional details.
      const prompt = `I am applying for the position of ${jobData.jobRole}. The job description is: ${jobData.description}. The job requires these skills: ${skillsText}. The required experience level is ${jobData.experienceLevel || "N/A"}, the job is ${jobData.remote ? "remote" : "on site"}, and the job type is ${jobData.jobType ? jobData.jobType.join(", ") : "N/A"}. Please provide exactly 10 interview questions relevant to this job posting and then evaluate my answers to see if I am correct. Do not ask any additional questions.`;
      (async () => {
        try {
          // Save the auto-prompt as a user message.
          const userPromptMsg = {
            sender: "user",
            text: prompt,
            timestamp: new Date().toISOString(),
          };
          await saveMessage(userPromptMsg);
          setMessages((prev) => [...prev, userPromptMsg]);
          // Get the bot reply.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, jobData, initialMessages]);

  const displayedTitle =
    conversationTitle && conversationTitle.trim().length > 0
      ? conversationTitle
      : jobData && jobData.jobRole
      ? `Interview for ${jobData.jobRole}`
      : "Chat Conversation";

  return (
    <div className="relative flex flex-col h-full w-full border border-gray-300 rounded-lg shadow-md overflow-hidden">
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
      <div className="flex-1 bg-gray-100 p-4 overflow-y-auto">
        {messages
          .filter((msg) => msg && msg.text)
          .map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                msg.sender === "user" ? "items-end" : "items-start"
              } mb-4`}
            >
              <ReactMarkdown
                className={`max-w-[70%] overflow-x-auto p-3 rounded-lg ${
                  msg.sender === "user"
                    ? "bg-brand-primary text-white"
                    : "bg-gray-300 text-gray-900"
                }`}
                components={{
                  p: ({ node, children }) => (
                    <p className="whitespace-pre-wrap">{children}</p>
                  ),
                }}
              >
                {msg.text}
              </ReactMarkdown>
              <span className="text-xs text-gray-500 mt-1">
                {prettyDate(msg.timestamp || new Date())}
              </span>
            </div>
          ))}
        {isTyping && (
          <div className="flex flex-col items-start mb-4">
            <div className="max-w-[70%] p-3 rounded-lg bg-gray-300 text-gray-900">
              Typing{typingDots}
            </div>
          </div>
        )}
      </div>
      <div className="flex p-3 border-t bg-white">
        <textarea
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded-lg p-3 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm resize-none bg-gray-100 text-gray-900 placeholder-gray-500"
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
          className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-green-600 focus:outline-none"
        >
          Send
        </button>
      </div>
      <div className="flex items-center justify-center bg-gray-50 p-3">
        <span className="text-xs text-center text-gray-500">
          Our bot may occasionally make mistakes.
          <br />Please verify critical information.
        </span>
      </div>
    </div>
  );
};

export default ChatBot;
