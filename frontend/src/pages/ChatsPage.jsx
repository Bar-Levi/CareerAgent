import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatBot from "../components/ChatBot";
import NavigationBar from "../components/NavigationBar/NavigationBar";
import Notification from "../components/Notification";
import Botpress from "../botpress/Botpress";
import { FiEdit } from "react-icons/fi";

const ChatsPage = () => {
  const [careerChats, setCareerChats] = useState([]);
  const [interviewChats, setInterviewChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatType, setChatType] = useState("careerAdvisor");
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const { state } = useLocation();
  const navigate = useNavigate();
  const email = state?.email || "";
  const token = state?.token || "";
  const [notification, setNotification] = useState(null);

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

  // Fetch chat histories from the backend.
  const fetchHistoryChats = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/bot-conversations/?email=${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch chat histories");
      }
      const data = await response.json();
      const careerChatsData = data.filter((chat) => chat.type === "careerAdvisor");
      const interviewChatsData = data.filter((chat) => chat.type === "interviewer");
      setCareerChats(careerChatsData.reverse());
      setInterviewChats(interviewChatsData.reverse());
    } catch (error) {
      console.error("Error fetching chat histories:", error);
    }
  };

  // Create a new conversation.
  // If jobData is provided (from router state), attach a title and include jobData in the DB.
  const createNewConversation = async (type, jobData = null) => {
    try {
      // Build the payload with jobData if available.
      const payload = { email, type };
      if (jobData && Object.keys(jobData).length > 0) {
        payload.jobData = jobData;
      }

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/bot-conversations/new`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json();
          showNotification("error", errorData.message);
        } else {
          throw new Error(`Request failed with status ${response.status}`);
        }
        return null;
      }
      const newChat = await response.json();
      // If jobData is provided, update the conversation title for display.
      if (jobData && Object.keys(jobData).length > 0) {
        newChat.conversationTitle = jobData.jobRole
          ? `Interview for ${jobData.jobRole}`
          : "Interview Conversation";
        newChat.jobData = jobData;
      }
      if (type === "careerAdvisor") {
        setCareerChats((prev) => [newChat, ...prev].slice(0, 10));
      } else if (type === "interviewer") {
        setInterviewChats((prev) => [newChat, ...prev].slice(0, 10));
      }
      setSelectedChat(newChat);
      setChatType(type);
      return newChat;
    } catch (error) {
      console.error("Error creating a new conversation:", error);
      return null;
    }
  };

  // Remove a conversation.
  // If an interviewer conversation with jobData is removed and exists in sessionStorage, remove its flag.
  const removeConversation = async (chatId, type) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/bot-conversations/${chatId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to remove conversation");
      }
      if (type === "careerAdvisor") {
        setCareerChats((prev) => prev.filter((chat) => chat._id !== chatId));
      } else if (type === "interviewer") {
        // Find the conversation to remove its sessionStorage flag if needed.
        const removedChat = interviewChats.find((chat) => chat._id === chatId);
        setInterviewChats((prev) => prev.filter((chat) => chat._id !== chatId));
        const jobId = removedChat?.jobData?._id;
        if (jobId) {
          sessionStorage.removeItem("autoCreatedConversation_" + jobId);
        }
        // Optionally, clear router state interviewJobData after deletion
        if (state?.interviewJobData) {
          navigate(window.location.pathname, {
            replace: true,
            state: { ...state, interviewJobData: null },
          });
        }
      }
      if (selectedChat && selectedChat._id === chatId) {
        setSelectedChat(null);
      }
    } catch (error) {
      console.error("Error removing conversation:", error);
    }
  };

  // Editing chat title.
  const startEditingTitle = (chatId, currentTitle) => {
    if (currentTitle.length > 0) {
      setEditingChatId(chatId);
      setEditingTitle(currentTitle);
    }
  };

  const handleTitleChange = (e, chatId, type) => {
    const newTitle = e.target.value;
    setEditingTitle(newTitle);
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

  const handleChatSelection = (chat, type) => {
    setSelectedChat(chat);
    setChatType(type);
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
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ conversationTitle: editingTitle }),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to update conversation title");
        }
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
        if (selectedChat && selectedChat._id === chatId) {
          setSelectedChat((prev) => ({ ...prev, conversationTitle: editingTitle }));
        }
        setEditingChatId(null);
        setEditingTitle("");
      } catch (error) {
        console.error("Error updating conversation title:", error);
      }
    }
  };

  useEffect(() => {
    fetchHistoryChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat]);

  // Auto-create an interviewer conversation only if router state includes valid job data,
  // no conversation is currently selected, and the sessionStorage flag is not set.
  useEffect(() => {
    if (
      state &&
      state.chatType === "interviewer" &&
      state.interviewJobData &&
      Object.keys(state.interviewJobData).length > 0 &&
      !selectedChat
    ) {
      const jobId = state.interviewJobData._id;
      if (!sessionStorage.getItem("autoCreatedConversation_" + jobId)) {
        createNewConversation("interviewer", state.interviewJobData);
        sessionStorage.setItem("autoCreatedConversation_" + jobId, "true");
        // Clear the interviewJobData from router state after auto-creation
        navigate(window.location.pathname, {
          replace: true,
          state: { ...state, interviewJobData: null },
        });
      }
    }
  }, [state, selectedChat, navigate]);

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
      <div>
        <NavigationBar
          userType={state?.user?.role}
          notifications={state?.user?.notifications || []}
        />
      </div>
      <div className="flex flex-1 overflow-hidden">
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
                      ? "bg-gray-200 text-gray-900 font-semibold"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {editingChatId === chat._id ? (
                    <input
                      type="text"
                      className="w-full border px-2 py-1 rounded"
                      value={editingTitle}
                      onChange={(e) =>
                        handleTitleChange(e, chat._id, "careerAdvisor")
                      }
                      onBlur={() => saveEditedTitle(chat._id, "careerAdvisor")}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        saveEditedTitle(chat._id, "careerAdvisor")
                      }
                    />
                  ) : (
                    <div
                      className="flex-1"
                      onClick={() => handleChatSelection(chat, "careerAdvisor")}
                    >
                      <p className="font-medium cursor-pointer">
                        {chat.conversationTitle}
                      </p>
                      <p className="text-sm text-gray-500">
                        {prettyDate(chat.createdAt)}
                      </p>
                    </div>
                  )}
                  <FiEdit
                    onClick={() =>
                      startEditingTitle(chat._id, chat.conversationTitle)
                    }
                  />
                  <button
                    onClick={() =>
                      removeConversation(chat._id, "careerAdvisor")
                    }
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
                      ? "bg-gray-200 text-gray-900 font-semibold"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {editingChatId === chat._id ? (
                    <input
                      type="text"
                      className="w-full border px-2 py-1 rounded"
                      value={editingTitle}
                      onChange={(e) =>
                        handleTitleChange(e, chat._id, "interviewer")
                      }
                      onBlur={() => saveEditedTitle(chat._id, "interviewer")}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        saveEditedTitle(chat._id, "interviewer")
                      }
                    />
                  ) : (
                    <div
                      className="flex-1"
                      onClick={() => handleChatSelection(chat, "interviewer")}
                    >
                      <p className="font-medium cursor-pointer">
                        {chat.conversationTitle}
                      </p>
                      <p className="text-sm text-gray-500">
                        {prettyDate(chat.createdAt)}
                      </p>
                    </div>
                  )}
                  <FiEdit
                    onClick={() =>
                      startEditingTitle(chat._id, chat.conversationTitle)
                    }
                  />
                  <button
                    onClick={() =>
                      removeConversation(chat._id, "interviewer")
                    }
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
        <div className="flex-1 flex items-center justify-center p-4">
          {selectedChat ? (
            <ChatBot
              key={selectedChat._id}
              chatId={selectedChat._id}
              conversationId={selectedChat.conversationId}
              conversationTitle={selectedChat.conversationTitle}
              isProfileSynced={selectedChat.isProfileSynced}
              type={chatType}
              initialMessages={selectedChat.messages}
              prettyDate={prettyDate}
              jobData={selectedChat.jobData}
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
