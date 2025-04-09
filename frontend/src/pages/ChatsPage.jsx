import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatBot from "../components/ChatBot";
import NavigationBar from "../components/NavigationBar/NavigationBar";
import Notification from "../components/Notification";
import Botpress from "../botpress/Botpress";
import { FiEdit, FiPlus, FiTrash2, FiMessageSquare, FiBriefcase } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "react-responsive";

const ChatsPage = () => {
  const [careerChats, setCareerChats] = useState([]);
  const [interviewChats, setInterviewChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatType, setChatType] = useState("careerAdvisor");
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const { state } = useLocation();
  const navigate = useNavigate();
  const email = state?.email || state?.user?.email || "";
  const token = localStorage.getItem("token") || "";
  const [notification, setNotification] = useState(null);

  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

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
          ? `Interview for ${jobData.jobRole}. Recruiter: ${jobData.recruiterName}`
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
    <div className="flex flex-col h-screen bg-gray-50">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      <Botpress />
      <NavigationBar
        userType={state?.user?.role}
        notifications={state?.user?.notifications || []}
      />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Toggle */}
        {isMobile && (
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          >
            {isSidebarOpen ? (
              <FiMessageSquare className="w-6 h-6" />
            ) : (
              <FiBriefcase className="w-6 h-6" />
            )}
          </button>
        )}

        {/* Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ x: isMobile ? -300 : 0 }}
              animate={{ x: 0 }}
              exit={{ x: isMobile ? -300 : 0 }}
              transition={{ type: "spring", damping: 25 }}
              className={`${
                isMobile
                  ? "fixed inset-y-0 left-0 z-40 w-72"
                  : "w-80"
              } bg-white border-r border-gray-200 shadow-lg`}
            >
              <div className="h-full flex flex-col">
                {/* Career Advisor Section */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Career Advisor</h3>
                    <button
                      onClick={() => createNewConversation("careerAdvisor")}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="Start a new Career Advisor chat"
                    >
                      <FiPlus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                    {careerChats.map((chat) => (
                      <motion.div
                        key={chat._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedChat?._id === chat._id
                            ? "bg-blue-50 border border-blue-200"
                            : "hover:bg-gray-50 border border-transparent"
                        }`}
                      >
                        {editingChatId === chat._id ? (
                          <input
                            type="text"
                            className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editingTitle}
                            onChange={(e) => handleTitleChange(e, chat._id, "careerAdvisor")}
                            onBlur={() => saveEditedTitle(chat._id, "careerAdvisor")}
                            onKeyDown={(e) =>
                              e.key === "Enter" && saveEditedTitle(chat._id, "careerAdvisor")
                            }
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center justify-between">
                            <div
                              className="flex-1"
                              onClick={() => handleChatSelection(chat, "careerAdvisor")}
                            >
                              <p className="font-medium text-gray-800 truncate">
                                {chat.conversationTitle}
                              </p>
                              <p className="text-sm text-gray-500">
                                {prettyDate(chat.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => startEditingTitle(chat._id, chat.conversationTitle)}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <FiEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removeConversation(chat._id, "careerAdvisor")}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Interviewer Section */}
                <div className="p-4 flex-1">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Interviewer</h3>
                    <button
                      onClick={() => createNewConversation("interviewer")}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="Start a new Interviewer chat"
                    >
                      <FiPlus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                    {interviewChats.map((chat) => (
                      <motion.div
                        key={chat._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedChat?._id === chat._id
                            ? "bg-blue-50 border border-blue-200"
                            : "hover:bg-gray-50 border border-transparent"
                        }`}
                      >
                        {editingChatId === chat._id ? (
                          <input
                            type="text"
                            className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editingTitle}
                            onChange={(e) => handleTitleChange(e, chat._id, "interviewer")}
                            onBlur={() => saveEditedTitle(chat._id, "interviewer")}
                            onKeyDown={(e) =>
                              e.key === "Enter" && saveEditedTitle(chat._id, "interviewer")
                            }
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center justify-between">
                            <div
                              className="flex-1"
                              onClick={() => handleChatSelection(chat, "interviewer")}
                            >
                              <p className="font-medium text-gray-800 truncate">
                                {chat.conversationTitle}
                              </p>
                              <p className="text-sm text-gray-500">
                                {prettyDate(chat.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => startEditingTitle(chat._id, chat.conversationTitle)}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <FiEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removeConversation(chat._id, "interviewer")}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4 bg-gray-50">
          {selectedChat ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full h-full"
            >
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
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-500"
            >
              <div className="mb-4">
                <FiMessageSquare className="w-12 h-12 mx-auto text-gray-300" />
              </div>
              <p className="text-lg font-medium">Select a chat to start</p>
              <p className="text-sm mt-2">Choose from your existing conversations or start a new one</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatsPage;
