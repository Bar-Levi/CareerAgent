import React, { useState, useEffect } from "react";
import ChatBot from "../components/ChatBot";
import { useLocation } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import Notification from "../components/Notification";
import Botpress from "../botpress/Botpress";
import { FiEdit } from "react-icons/fi";

const ChatsPage = () => {
  const [careerChats, setCareerChats] = useState([]); // History for Career Advisor
  const [interviewChats, setInterviewChats] = useState([]); // History for Interviewer
  const [selectedChat, setSelectedChat] = useState(null); // Selected chat details
  const [chatType, setChatType] = useState("careerAdvisor"); // Chat type (default: careerAdvisor)
  const [editingChatId, setEditingChatId] = useState(null); // Currently editing chat ID
  const [editingTitle, setEditingTitle] = useState(""); // Title being edited
  const { state } = useLocation();
  const email = state?.email || "";
  const token = state?.token || "";
  const [notification, setNotification] = useState(null);
  

  // Show notification
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
};

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
        `${process.env.REACT_APP_BACKEND_URL}/api/bot-conversations/?email=${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      

      if (!response.ok) {
        throw new Error("Failed to fetch chat histories");
      }

      const data = await response.json();

      // Categorize conversations into Career Advisor and Interviewer
      const careerChats = data.filter((chat) => chat.type === "careerAdvisor");
      const interviewChats = data.filter((chat) => chat.type === "interviewer");

      setCareerChats(careerChats.reverse());
      setInterviewChats(interviewChats.reverse());

    } catch (error) {
      console.error("Error fetching chat histories:", error);
    }
  };

  // Create a new conversation
  const createNewConversation = async (type) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/bot-conversations/new`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            email,
            type,
          }),
        }
      );

      if (!response.ok) {
        // Check if the response status is 400 and display the error message
        if (response.status === 400) {
          const errorData = await response.json();
          showNotification('error', errorData.message);
        } else {
          throw new Error(`Request failed with status ${response.status}`);
        }
        return; // Exit the function after handling the error
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
        `${process.env.REACT_APP_BACKEND_URL}/api/bot-conversations/${chatId}`,
        { method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
         }
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
    if (currentTitle.length > 0) {
      setEditingChatId(chatId);
      setEditingTitle(currentTitle);
    }
  };

  // Handle real-time title editing
  const handleTitleChange = (e, chatId, type) => {
    const newTitle = e.target.value;
    setEditingTitle(newTitle);

    // Update the chat title in the corresponding list
    if (type === "careerAdvisor") {
      setCareerChats((prev) =>
        prev.map((chat) =>
          chat._id === chatId ? { ...chat, conversationTitle: newTitle } : chat
        )
      );
    } else if (type === "interviewer") {
      setInterviewChats((prev) =>
        prev.map((chat) =>
          chat._id === chatId ? { ...chat, conversationTitle: newTitle } : chat
        )
      );
    }
  };


  // Handle selecting a chat
  const handleChatSelection = (chat, type) => {
    setSelectedChat(chat);
    setChatType(type);
    console.log("Selected chat");
    };
      
  const saveEditedTitle = async (chatId, type) => {
    if (editingTitle === "") {
      showNotification("error", "Title cannot be empty");
    } else {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/bot-conversations/${chatId}`,
        {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
          body: JSON.stringify({
            conversationTitle: editingTitle, // Update the title
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
            chat._id === chatId ? { ...chat, conversationTitle: editingTitle } : chat
          )
        );
      } else if (type === "interviewer") {
        setInterviewChats((prev) =>
          prev.map((chat) =>
            chat._id === chatId ? { ...chat, conversationTitle: editingTitle } : chat
          )
        );
      }

      // If the updated chat is selected, update the title in the ChatBot
      if (selectedChat && selectedChat._id === chatId) {
        setSelectedChat((prev) => ({ ...prev, conversationTitle: editingTitle }));
      }

      // Stop editing
      setEditingChatId(null);
      setEditingTitle("");
    } catch (error) {
      console.error("Error updating conversation title:", error);
    }
  }
  };

  // Fetch chat histories when component mounts
  useEffect(() => {
    fetchHistoryChats();
  }, [selectedChat]);

  return (
    <div className="flex flex-col h-screen">
      {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
      )}
      <Botpress />
      {/* Navigation Bar */}
      <div>
      <NavigationBar userType={state?.user?.role} notifications={state?.user?.notifications || []}/>
      </div>
  
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Pane */}
        <div className="w-1/3 p-4 border-r border-gray-300 bg-white overflow-y-auto">
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
            <div className="h-60 overflow-y-auto border border-gray-300 rounded-lg">
              {careerChats.map((chat) => (
                <div
                  key={chat._id}
                  className={`p-3 border-b flex justify-between items-center cursor-pointer rounded-lg ${
                    selectedChat && selectedChat._id === chat._id
                      ? "bg-gray-200 text-gray-900 font-semibold" // Active chat styling
                      : "hover:bg-gray-100 text-gray-700" // Inactive chat styling
                  }`}
                >
                  {editingChatId === chat._id ? (
                    <input
                      type="text"
                      className="w-full border px-2 py-1 rounded"
                      value={editingTitle}
                      onChange={(e) => handleTitleChange(e, chat._id, 'careerAdvisor')}
                      onBlur={() => saveEditedTitle(chat._id, "careerAdvisor")}
                      onKeyDown={(e) =>
                        e.key === "Enter" && saveEditedTitle(chat._id, "careerAdvisor")
                      }
                    />
                  ) : (
                    <div 
                      className="flex-1"
                      onClick={() => handleChatSelection(chat, "careerAdvisor")}
                      >
                      <p
                        className="font-medium cursor-pointer"
                      >
                        {chat.conversationTitle}
                      </p>
                      <p className="text-sm text-gray-500">{prettyDate(chat.createdAt)}</p>
                    </div>
                  )}
                  <FiEdit
                    onClick={() =>
                    startEditingTitle(chat._id, chat.conversationTitle)
                  }
                  />
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
            <div className="h-60 overflow-y-auto border border-gray-300 rounded-lg">
              {interviewChats.map((chat) => (
                <div
                  key={chat._id}
                  className={`p-3 border-b flex justify-between items-center cursor-pointer rounded-lg ${
                    selectedChat && selectedChat._id === chat._id
                      ? "bg-gray-200 text-gray-900 font-semibold" // Active chat styling
                      : "hover:bg-gray-100 text-gray-700" // Inactive chat styling
                  }`}
                >
                  {editingChatId === chat._id ? (
                    <input
                      type="text"
                      className="w-full border px-2 py-1 rounded"
                      value={editingTitle}
                      onChange={(e) => handleTitleChange(e, chat._id, 'interviewer')}
                      onBlur={() => saveEditedTitle(chat._id, "interviewer")}
                      onKeyDown={(e) =>
                        e.key === "Enter" && saveEditedTitle(chat._id, "interviewer")
                      }
                    />
                  ) : (
                    <div
                      className="flex-1"
                      onClick={() => handleChatSelection(chat, "interviewer")}
                    >
                      <p
                        className="font-medium cursor-pointer"
                      >
                        {chat.conversationTitle}
                      </p>
                      <p className="text-sm text-gray-500">{prettyDate(chat.createdAt)}</p>
                    </div>
                  )}
                  <FiEdit
                    onClick={() =>
                      startEditingTitle(chat._id, chat.conversationTitle)
                  }
                  />
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
        <div className="flex-1 flex items-center justify-center p-4">
          {selectedChat ? (
            <ChatBot
              key={selectedChat._id} // Force re-render
              chatId={selectedChat._id}
              conversationId={selectedChat.conversationId}
              conversationTitle={selectedChat.conversationTitle}
              isProfileSynced={selectedChat.isProfileSynced}
              type={chatType}
              initialMessages={selectedChat.messages} // Pass messages to ChatBot
              prettyDate={prettyDate} // Pass prettyDate to format message timestamps
            />
          ) : (
            <div className="text-gray-500">
              <p>Select a chat from the left to view the conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
  
};

export default ChatsPage;


