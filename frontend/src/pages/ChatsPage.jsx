import React, { useState, useEffect } from "react";
import ChatBot from "../components/ChatBot";
import { useLocation } from "react-router-dom";

const ChatsPage = () => {
  const [careerChats, setCareerChats] = useState([]); // History for Career Advisor
  const [interviewChats, setInterviewChats] = useState([]); // History for Interviewer
  const [selectedChat, setSelectedChat] = useState(null); // Selected chat details
  const [chatType, setChatType] = useState("careerAdvisor"); // Chat type (default: careerAdvisor)
  const [editingChatId, setEditingChatId] = useState(null); // Currently editing chat ID
  const [editingTitle, setEditingTitle] = useState(""); // Title being edited
  const { state } = useLocation();
  const { email } = state?.email || "";

  const prettyDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fetch user's history chats
  const fetchHistoryChats = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/conversations/?email=${encodeURIComponent(email)}`,
        { method: "GET" }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch chat histories");
      }

      const data = await response.json();

      // Categorize conversations into Career Advisor and Interviewer
      const careerChats = data.filter((chat) => chat.type === "careerAdvisor");
      const interviewChats = data.filter((chat) => chat.type === "interviewer");

      setCareerChats(careerChats);
      setInterviewChats(interviewChats);
    } catch (error) {
      console.error("Error fetching chat histories:", error);
    }
  };

  // Create a new conversation
  const createNewConversation = async (type) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/conversations/new`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            type,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create a new conversation");
      }

      const newChat = await response.json();

      // Add the new conversation to the relevant chat list
      if (type === "careerAdvisor") {
        setCareerChats((prev) => [newChat, ...prev].slice(0, 10)); // Keep max 10
      } else if (type === "interviewer") {
        setInterviewChats((prev) => [newChat, ...prev].slice(0, 10)); // Keep max 10
      }

      // Automatically select the new conversation
      setSelectedChat(newChat);
      setChatType(type);
    } catch (error) {
      console.error("Error creating a new conversation:", error);
    }
  };

  // Remove a conversation
  const removeConversation = async (chatId, type) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/conversations/${chatId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Failed to remove conversation");
      }

      // Remove the chat from the relevant list
      if (type === "careerAdvisor") {
        setCareerChats((prev) => prev.filter((chat) => chat._id !== chatId));
      } else if (type === "interviewer") {
        setInterviewChats((prev) => prev.filter((chat) => chat._id !== chatId));
      }

      // If the removed chat is the selected one, clear the right pane
      if (selectedChat && selectedChat._id === chatId) {
        setSelectedChat(null);
      }
    } catch (error) {
      console.error("Error removing conversation:", error);
    }
  };

  // Handle editing a chat title
  const startEditingTitle = (chatId, currentTitle) => {
    setEditingChatId(chatId);
    setEditingTitle(currentTitle);
  };
  // Handle selecting a chat
  const handleChatSelection = (chat, type) => {
    setSelectedChat(chat);
    setChatType(type);
    console.log("Selected chat");
    };
      
  const saveEditedTitle = async (chatId, type) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/conversations/${chatId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: editingTitle, // Update the title
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update conversation title");
      }

      // Update the title in the relevant chat list
      if (type === "careerAdvisor") {
        setCareerChats((prev) =>
          prev.map((chat) =>
            chat._id === chatId ? { ...chat, conversationId: editingTitle } : chat
          )
        );
      } else if (type === "interviewer") {
        setInterviewChats((prev) =>
          prev.map((chat) =>
            chat._id === chatId ? { ...chat, conversationId: editingTitle } : chat
          )
        );
      }

      // Stop editing
      setEditingChatId(null);
      setEditingTitle("");
    } catch (error) {
      console.error("Error updating conversation title:", error);
    }
  };

  // Fetch chat histories when component mounts
  useEffect(() => {
    fetchHistoryChats();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Pane */}
      <div className="w-1/3 p-4 border-r border-gray-300 bg-white">
        {/* Career Advisor Chats */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg">Career Advisor Chats</h3>
            <button
              onClick={() => createNewConversation("careerAdvisor")}
              className="text-green-500 hover:text-green-700 text-xl font-bold"
              title="Start a new Career Advisor chat"
            >
              +
            </button>
          </div>
          <div className="h-48 overflow-y-auto border border-gray-300 rounded-lg">
            {careerChats.slice(0, 10).map((chat) => (
              <div
                key={chat._id}
                className="p-3 border-b flex justify-between items-center hover:bg-gray-200"
              >
                {editingChatId === chat._id ? (
                  <input
                    type="text"
                    className="w-full border px-2 py-1 rounded"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={() => saveEditedTitle(chat._id, "careerAdvisor")}
                    onKeyDown={(e) => e.key === "Enter" && saveEditedTitle(chat._id, "careerAdvisor")}
                  />
                ) : (
                  <div className="flex-1">
                    <p
                      className="font-medium cursor-pointer"
                      onClick={() => handleChatSelection(chat, "careerAdvisor")}
                      onDoubleClick={() => startEditingTitle(chat._id, chat.conversationId)}
                    >
                      {chat.conversationId || "Untitled Chat"}
                    </p>
                    <p className="text-sm text-gray-500">{prettyDate(chat.createdAt)}</p>
                  </div>
                )}
                <button
                  onClick={() => removeConversation(chat._id, "careerAdvisor")}
                  className="text-red-500 hover:text-red-700 ml-2"
                  title="Remove chat"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Interviewer Chats */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg">Interviewer Chats</h3>
            <button
              onClick={() => createNewConversation("interviewer")}
              className="text-green-500 hover:text-green-700 text-xl font-bold"
              title="Start a new Interviewer chat"
            >
              +
            </button>
          </div>
          <div className="h-48 overflow-y-auto border border-gray-300 rounded-lg">
            {interviewChats.slice(0, 10).map((chat) => (
              <div
                key={chat._id}
                className="p-3 border-b flex justify-between items-center hover:bg-gray-200"
              >
                {editingChatId === chat._id ? (
                  <input
                    type="text"
                    className="w-full border px-2 py-1 rounded"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={() => saveEditedTitle(chat._id, "interviewer")}
                    onKeyDown={(e) => e.key === "Enter" && saveEditedTitle(chat._id, "interviewer")}
                  />
                ) : (
                  <div className="flex-1">
                    <p
                      className="font-medium cursor-pointer"
                      onClick={() => handleChatSelection(chat, "interviewer")}
                      onDoubleClick={() => startEditingTitle(chat._id, chat.conversationId)}
                    >
                      {chat.conversationId || "Untitled Chat"}
                    </p>
                    <p className="text-sm text-gray-500">{prettyDate(chat.createdAt)}</p>
                  </div>
                )}
                <button
                  onClick={() => removeConversation(chat._id, "interviewer")}
                  className="text-red-500 hover:text-red-700 ml-2"
                  title="Remove chat"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Pane */}
      <div className="flex-1 p-4">
        {/* Chat Header */}
        <div className="bg-gray-200 p-3 rounded-lg mb-4">
          <h2 className="text-xl font-bold text-center">
            {selectedChat?.conversationId || "Select a Chat to Begin"}
          </h2>
        </div>

        {/* Chat GPT-like Interface */}
        {selectedChat ? (
          <ChatBot
            key={selectedChat._id} // Force re-render
            chatId={selectedChat._id}
            type={chatType}
            initialMessages={selectedChat.messages} // Pass messages to ChatBot
            prettyDate={prettyDate} // Pass prettyDate to format message timestamps
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Select a chat from the left to view the conversation</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatsPage;


