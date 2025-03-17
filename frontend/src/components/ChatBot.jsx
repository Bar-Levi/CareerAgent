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

  // This function now sends the message object directly without wrapping it
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

  const handleSend = async () => {
    if (!input.trim()) return;
    // Save the current input text before clearing it
    const textToSend = input.trim();
    const userMessage = {
      sender: "user",
      text: textToSend,
      timestamp: new Date(),
    };

    // Update UI optimistically
    if (messages.length < MAX_MESSAGE_COUNT)
      setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      // Save user message directly (no extra wrapper)
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/bot-conversations/${chatId}/messages`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(userMessage),
      });
      if (!response.ok) {
        if (response.status === 400) {
          const data = await response.json();
          showNotification("error", data.error);
          throw new Error(data.error);
        }
        throw new Error("Failed to save the user message");
      }
      
      // Get bot reply using the original text
      const botReply = await sendMessageToAPI(textToSend);
      const botMessage = {
        sender: "bot",
        text: botReply,
        timestamp: new Date(),
      };

      // Save bot message directly (no extra wrapper)
      const botResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/bot-conversations/${chatId}/messages`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(botMessage),
      });
      if (!botResponse.ok) {
        throw new Error("Failed to save the bot reply");
      }
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error handling message:", error);
    }
  };

  // Auto-send a prompt only if this is an interviewer chat, jobData exists,
  // no initial messages exist, and the auto prompt hasn’t been sent.
  useEffect(() => {
    if (
      type === "interviewer" &&
      jobData &&
      initialMessages.length === 0 &&
      !autoPromptSentRef.current
    ) {
      autoPromptSentRef.current = true;
      const prompt = `I am applying for the position of ${jobData.jobRole}. My skills include ${
        jobData.skills ? jobData.skills.join(", ") : "N/A"
      }. Please ask me 10 interview questions relevant to this job posting.`;
      (async () => {
        try {
          const botReply = await sendMessageToAPI(prompt);
          const botMessage = {
            sender: "bot",
            text: botReply,
            timestamp: new Date(),
          };
          // Update UI with both the user prompt and bot reply
          setMessages((prev) => [
            ...prev,
            { sender: "user", text: prompt, timestamp: new Date() },
            botMessage,
          ]);
          // Optionally, you can also POST these messages to the backend if desired.
        } catch (error) {
          console.error("Error auto sending message:", error);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, jobData, initialMessages]);

  // Use a fallback title if conversationTitle is empty.
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
        {messages.map((msg, index) => (
          !msg.text.includes("[Syncing User Details with the Chatbot]") && (
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
          )
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
