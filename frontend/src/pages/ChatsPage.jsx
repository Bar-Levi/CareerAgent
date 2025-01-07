import React, { useState, useEffect } from "react";
import ChatBot from "../components/ChatBot";

const ChatsPage = () => {
  const [careerChats, setCareerChats] = useState([]); // History for Career Advisor
  const [interviewChats, setInterviewChats] = useState([]); // History for Interviewer
  const [selectedChat, setSelectedChat] = useState(null); // Selected chat details
  const [chatType, setChatType] = useState("careerAdvisor"); // Chat type (default: careerAdvisor)

  const email = 'bar314levi@gmail.com' // Email

  // Fetch user's history chats
  const fetchHistoryChats = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/conversations/?email=${encodeURIComponent(email)}`, {
            method: "GET",
          });

      if (!response.ok) {
        throw new Error("Failed to fetch chat histories");
      }

      const data = await response.json();

      // Categorize conversations into Career Advisor and Interviewer
      const careerChats = data.filter((chat) =>
        chat.type === "careerAdvisor"
      );
      const interviewChats = data.filter((chat) =>
        chat.type === "interviewer"
      );

      setCareerChats(careerChats);
      setInterviewChats(interviewChats);
    } catch (error) {
      console.error("Error fetching chat histories:", error);
    }
  };

  // Fetch chat histories when component mounts
  useEffect(() => {
    fetchHistoryChats();
  }, []);

  // Handle selecting a chat
  const handleChatSelection = (chat, type) => {
    setSelectedChat(chat);
    setChatType(type);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Pane */}
      <div className="w-1/3 p-4 border-r border-gray-300 bg-white">
        {/* Career Advisor Chats */}
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-2">Career Advisor Chats</h3>
          <div className="h-48 overflow-y-auto border border-gray-300 rounded-lg">
            {careerChats.map((chat) => (
              <div
                key={chat._id}
                className="p-3 border-b cursor-pointer hover:bg-gray-200"
                onClick={() => handleChatSelection(chat, "careerAdvisor")}
              >
                <p className="font-medium">{chat.conversationId || "Untitled Chat"}</p>
                <p className="text-sm text-gray-500">
                  {new Date(chat.messages[0]?.timestamp).toLocaleDateString() || "Unknown Date"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Interviewer Chats */}
        <div>
          <h3 className="font-bold text-lg mb-2">Interviewer Chats</h3>
          <div className="h-48 overflow-y-auto border border-gray-300 rounded-lg">
            {interviewChats.map((chat) => (
              <div
                key={chat._id}
                className="p-3 border-b cursor-pointer hover:bg-gray-200"
                onClick={() => handleChatSelection(chat, "interviewer")}
              >
                <p className="font-medium">{chat.conversationId || "Untitled Chat"}</p>
                <p className="text-sm text-gray-500">
                  {new Date(chat.messages[0]?.timestamp).toLocaleDateString() || "Unknown Date"}
                </p>
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
            type={chatType}
            initialMessages={selectedChat.messages} // Pass messages to ChatBot
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
