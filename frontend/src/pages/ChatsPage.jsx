import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatBot from "../components/ChatBot";
import NavigationBar from "../components/NavigationBar/NavigationBar";
import Notification from "../components/Notification";
import Tooltip from "../components/Tooltip";
import Botpress from "../botpress/Botpress";
import { 
  FiEdit, 
  FiPlus, 
  FiTrash2, 
  FiMessageSquare, 
  FiBriefcase, 
  FiSearch,
  FiChevronDown,
  FiChevronRight,
  FiClock
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "react-responsive";

// Skeleton Loading Component
const ChatItemSkeleton = () => (
  <div className="p-3 rounded-lg border border-gray-200 animate-pulse">
    <div className="flex items-center space-x-3">
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="flex items-center">
          <div className="h-3 w-3 bg-gray-200 rounded-full mr-1"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
      <div className="flex items-center space-x-1">
        <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
        <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  </div>
);

const ChatsPage = () => {
  const [careerChats, setCareerChats] = useState([]);
  const [interviewChats, setInterviewChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatType, setChatType] = useState("careerAdvisor");
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCareerSectionCollapsed, setIsCareerSectionCollapsed] = useState(false);
  const [isInterviewSectionCollapsed, setIsInterviewSectionCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
    setIsLoading(true);
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
      showNotification("error", "Failed to load conversations");
    } finally {
      setIsLoading(false);
      // Simulate minimum loading time for better UX
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
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
  }, []);

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
              initial={{ x: isMobile ? -300 : 0, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isMobile ? -300 : 0, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className={`${
                isMobile
                  ? "fixed inset-y-0 left-0 z-40 w-80"
                  : "w-96"
              } bg-white/90 backdrop-blur-md border-r border-gray-200 shadow-lg flex flex-col h-full`}
            >
              {/* Search Bar */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col">
                {/* Career Advisor Section */}
                <div className="p-4 flex flex-col min-h-0 flex-1">
                  <motion.div
                    initial={false}
                    animate={{ height: isCareerSectionCollapsed ? "40px" : "100%" }}
                    className="flex flex-col h-full"
                  >
                    <div 
                      className="flex items-center justify-between mb-4 cursor-pointer shrink-0"
                      onClick={() => setIsCareerSectionCollapsed(!isCareerSectionCollapsed)}
                    >
                      <div className="flex items-center space-x-2">
                        <FiBriefcase className="text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-800">Career Advisor</h3>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                          {careerChats.length}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            createNewConversation("careerAdvisor");
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-all transform hover:scale-110"
                          title="Start a new Career Advisor chat"
                        >
                          <FiPlus className="w-5 h-5" />
                        </button>
                        {isCareerSectionCollapsed ? (
                          <FiChevronRight className="text-gray-400" />
                        ) : (
                          <FiChevronDown className="text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {!isCareerSectionCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 overflow-y-auto custom-scrollbar flex-1 min-h-0"
                          style={{
                            maxHeight: "calc(50vh - 80px)", // Adjust this value as needed
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#CBD5E0 #F3F4F6'
                          }}
                        >
                          {isLoading ? (
                            // Show 3 skeleton items while loading
                            <>
                              <ChatItemSkeleton />
                              <ChatItemSkeleton />
                              <ChatItemSkeleton />
                            </>
                          ) : (
                            <>
                              {careerChats
                                .filter(chat => 
                                  chat.conversationTitle.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .map((chat) => (
                                <motion.div
                                  key={chat._id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={`group p-3 rounded-lg cursor-pointer transition-all ${
                                    selectedChat?._id === chat._id
                                      ? "bg-blue-50 border-2 border-blue-200 shadow-sm"
                                      : "hover:bg-gray-50 border border-transparent hover:border-gray-200"
                                  }`}
                                >
                                  {editingChatId === chat._id ? (
                                    <input
                                      type="text"
                                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      value={editingTitle}
                                      onChange={(e) => handleTitleChange(e, chat._id, "careerAdvisor")}
                                      onBlur={() => saveEditedTitle(chat._id, "careerAdvisor")}
                                      onKeyDown={(e) =>
                                        e.key === "Enter" && saveEditedTitle(chat._id, "careerAdvisor")
                                      }
                                      autoFocus
                                    />
                                  ) : (
                                    <div className="flex items-center space-x-3">
                                      <div className="flex-1 min-w-0" onClick={() => handleChatSelection(chat, "careerAdvisor")}>
                                        <Tooltip content={chat.conversationTitle}>
                                          <p className="font-medium text-gray-800 truncate">
                                            {chat.conversationTitle}
                                          </p>
                                        </Tooltip>
                                        <div className="flex items-center text-sm text-gray-500 mt-1">
                                          <FiClock className="w-3 h-3 mr-1" />
                                          {prettyDate(chat.createdAt)}
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                                        <button
                                          onClick={() => startEditingTitle(chat._id, chat.conversationTitle)}
                                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                                        >
                                          <FiEdit className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => removeConversation(chat._id, "careerAdvisor")}
                                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                                        >
                                          <FiTrash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </motion.div>
                              ))}
                              {careerChats.length === 0 && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="text-center py-8"
                                >
                                  <FiMessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                  <p className="text-gray-500">No career chats yet</p>
                                  <button
                                    onClick={() => createNewConversation("careerAdvisor")}
                                    className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                  >
                                    Start your first career advisement
                                  </button>
                                </motion.div>
                              )}
                            </>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                {/* Interviewer Section */}
                <div className="p-4 flex flex-col min-h-0 flex-1 border-t border-gray-100">
                  <motion.div
                    initial={false}
                    animate={{ height: isInterviewSectionCollapsed ? "40px" : "100%" }}
                    className="flex flex-col h-full"
                  >
                    <div 
                      className="flex items-center justify-between mb-4 cursor-pointer shrink-0"
                      onClick={() => setIsInterviewSectionCollapsed(!isInterviewSectionCollapsed)}
                    >
                      <div className="flex items-center space-x-2">
                        <FiMessageSquare className="text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-800">Interviewer</h3>
                        <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs font-medium rounded-full">
                          {interviewChats.length}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            createNewConversation("interviewer");
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-all transform hover:scale-110"
                          title="Start a new Interview chat"
                        >
                          <FiPlus className="w-5 h-5" />
                        </button>
                        {isInterviewSectionCollapsed ? (
                          <FiChevronRight className="text-gray-400" />
                        ) : (
                          <FiChevronDown className="text-gray-400" />
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {!isInterviewSectionCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 overflow-y-auto custom-scrollbar flex-1 min-h-0"
                          style={{
                            maxHeight: "calc(50vh - 80px)", // Adjust this value as needed
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#CBD5E0 #F3F4F6'
                          }}
                        >
                          {isLoading ? (
                            // Show 3 skeleton items while loading
                            <>
                              <ChatItemSkeleton />
                              <ChatItemSkeleton />
                              <ChatItemSkeleton />
                            </>
                          ) : (
                            <>
                              {interviewChats
                                .filter(chat => 
                                  chat.conversationTitle.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .map((chat) => (
                                <motion.div
                                  key={chat._id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={`group p-3 rounded-lg cursor-pointer transition-all ${
                                    selectedChat?._id === chat._id
                                      ? "bg-green-50 border-2 border-green-200 shadow-sm"
                                      : "hover:bg-gray-50 border border-transparent hover:border-gray-200"
                                  }`}
                                >
                                  {editingChatId === chat._id ? (
                                    <input
                                      type="text"
                                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                      value={editingTitle}
                                      onChange={(e) => handleTitleChange(e, chat._id, "interviewer")}
                                      onBlur={() => saveEditedTitle(chat._id, "interviewer")}
                                      onKeyDown={(e) =>
                                        e.key === "Enter" && saveEditedTitle(chat._id, "interviewer")
                                      }
                                      autoFocus
                                    />
                                  ) : (
                                    <div className="flex items-center space-x-3">
                                      <div className="flex-1 min-w-0" onClick={() => handleChatSelection(chat, "interviewer")}>
                                        <Tooltip content={chat.conversationTitle}>
                                          <p className="font-medium text-gray-800 truncate">
                                            {chat.conversationTitle}
                                          </p>
                                        </Tooltip>
                                        <div className="flex items-center text-sm text-gray-500 mt-1">
                                          <FiClock className="w-3 h-3 mr-1" />
                                          {prettyDate(chat.createdAt)}
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                                        <button
                                          onClick={() => startEditingTitle(chat._id, chat.conversationTitle)}
                                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                                        >
                                          <FiEdit className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => removeConversation(chat._id, "interviewer")}
                                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                                        >
                                          <FiTrash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </motion.div>
                              ))}
                              {interviewChats.length === 0 && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="text-center py-8"
                                >
                                  <FiMessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                  <p className="text-gray-500">No interview chats yet</p>
                                  <button
                                    onClick={() => createNewConversation("interviewer")}
                                    className="mt-4 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                  >
                                    Start your first interview preparation
                                  </button>
                                </motion.div>
                              )}
                            </>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </div>

              {/* Add custom scrollbar styles */}
              <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                  width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: #F3F4F6;
                  border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background-color: #CBD5E0;
                  border-radius: 3px;
                  border: 2px solid #F3F4F6;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background-color: #A0AEC0;
                }
              `}</style>
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
