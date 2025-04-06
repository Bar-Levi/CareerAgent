import React, { useState, useEffect } from "react";
import ChatWindow from "../../../components/ChatWindow";

const MessagingBar = ({
  user,
  onlineUsers,
  renderingConversationKey,
  renderingConversationData,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [openChats, setOpenChats] = useState([]);

  // **New**: state to track search input
  const [searchTerm, setSearchTerm] = useState("");

  // Toggle conversation list
  const toggleOpen = () => setIsOpen((prev) => !prev);

  // Fetch conversation list
  useEffect(() => {
    if (!user?._id) return;
    const fetchConversations = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/conversations/getJobCandidateConversations/${user._id}`
        );
        if (!response.ok) throw new Error("Failed to fetch conversations");
        const data = await response.json();
        // Filter out conversations with zero messages
        setConversations(data.conversations.filter((c) => c.messages.length && c.participants[0].isVisible) || []);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };
    fetchConversations();
  }, [user?._id, renderingConversationKey]);

  // If renderingConversationData has a convId, select that conversation
  useEffect(() => {
    if (renderingConversationData.convId) {
      handleSelectConversation(
        renderingConversationData.convId,
        renderingConversationData.secondParticipantProfilePic,
        renderingConversationData.participantName,
        renderingConversationData.jobListingRole
      );
    }
  }, [renderingConversationKey]); // triggers whenever renderingConversationKey changes

  /**
   * handleSelectConversation:
   * 1) If conversation is already open, reorder it to the end (the "front").
   *    - Also un-minimize it if it was minimized.
   * 2) If it's brand new, push it at the end as minimized=false.
   * 3) If >2 are un-minimized, minimize the oldest other one.
   * 4) If the array length >3, remove the oldest from the entire array.
   */
  const handleSelectConversation = (conversationId, secondParticipantProfilePic, conversationTitle, conversationRole) => {
    setOpenChats((prev) => {
      let updated = [...prev];

      // 1) Check if it already exists
      const existingIndex = updated.findIndex((c) => c.id === conversationId);
      if (existingIndex !== -1) {
        // Move existing chat to the end
        const [existingChat] = updated.splice(existingIndex, 1);
        existingChat.minimized = false; // un-minimize if minimized
        updated.push(existingChat);
      } else {
        // 2) Otherwise, open a new chat
        const newChat = {
          id: conversationId,
          secondParticipantProfilePic,
          title: conversationTitle,
          role: conversationRole,
          minimized: false,
        };
        updated.push(newChat);
      }

      // 3) If more than 2 un-minimized, minimize the oldest other one
      const unMinimized = updated.filter((c) => !c.minimized);
      if (unMinimized.length > 2) {
        for (let i = 0; i < updated.length; i++) {
          if (i === updated.length - 1) break; // skip newly opened last item
          if (!updated[i].minimized) {
            updated[i].minimized = true;
            break;
          }
        }
      }

      // 4) If we have more than 3 total, remove the oldest entirely
      if (updated.length > 3) {
        updated.shift();
      }

      return updated;
    });
  };

  // Close a chat entirely
  const handleCloseChat = (conversationId) => {
    setOpenChats((prev) => prev.filter((c) => c.id !== conversationId));
  };

  // Minimize or restore a chat
  const handleMinimizeChat = (conversationId) => {
    setOpenChats((prev) =>
      prev.map((chat) =>
        chat.id === conversationId
          ? { ...chat, minimized: !chat.minimized }
          : chat
      )
    );
  };

  // Helper to find the last un-minimized chat -> active
  const getActiveChatId = () => {
    const unMinimized = openChats.filter((c) => !c.minimized);
    if (unMinimized.length) {
      return unMinimized[unMinimized.length - 1].id;
    }
    return null;
  };
  const activeChatId = getActiveChatId();

  // **Filter** conversations by searchTerm
  const filteredConversations = conversations.filter((conv) => {
    const secondParticipant = conv?.participants?.[1];
    const participantName = secondParticipant?.name?.toLowerCase() || "";
    const role = conv.jobListingRole?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();

    // Show if participantName OR role includes the search term
    return participantName.includes(term) || role.includes(term);
  });

  const handleRemoveConversation = async (conversationId) => {
    // Capture the removed conversation so we can restore it if the API call fails
    const removed = conversations.find(c => c._id === conversationId);
  
    // Optimistically remove from UI
    setConversations(prev => prev.filter(c => c._id !== conversationId));
  
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/conversations/${conversationId}/hide`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to hide conversation");
      }
    } catch (error) {
      console.error(error);
      // Revert UI change on failure
      setConversations(prev => [removed, ...prev]);
      alert("Could not hide conversation — please try again.");
    }
  };
  


  return (
    <div
      className="
        fixed bottom-0 right-20
        z-50
        flex
        items-end
        gap-2
        p-4
      "
    >
      <div className="flex flex-row-reverse items-end gap-2">
        {/* 1) Conversation List */}
        <div
          className={`
            border border-gray-300 shadow-md bg-white
            ${isOpen ? "rounded-t-lg" : "rounded-lg"}
            cursor-pointer
            transition-all duration-300
          `}
          style={{ width: "300px" }}
        >
          {/* Header that toggles open/close */}
          <div
            className={`flex items-center p-2 ${
              isOpen ? "rounded-b-none" : "rounded-b-lg"
            } transition-all duration-300 ease-in-out hover:bg-gray-50`}
            onClick={toggleOpen}
          >
            <img
              src={user?.profilePic || "fallback.jpg"}
              alt="Profile"
              className="w-8 h-8 rounded-full mr-2"
            />
            <span className="font-semibold text-gray-700 flex-1">
              {isOpen ? "Hide" : "View"} Conversations
            </span>
            <i
              className={`fa fa-chevron-${
                isOpen ? "down" : "up"
              } text-gray-600 transition-transform duration-300`}
            />
          </div>

          {/* If open, show conversation list */}
          {isOpen && (
            <div className="h-[32rem] overflow-y-auto flex flex-col border-t border-gray-300 transition-all duration-300 ease-in-out">
              {/* Search bar */}
              <div className="p-2 border-b flex justify-between items-center">
                <input
                  className="flex-1 border px-2 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="Search by name or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Conversation List */}
              <ul className="flex-1 overflow-y-auto divide-y divide-gray-200">
                {filteredConversations.map((conv) => {
                  const secondParticipant = conv?.participants?.[1];
                  const { lastMessage } = conv || {};
                  const formattedTime = lastMessage?.timestamp
                    ? new Date(lastMessage.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "";
                  const participantName = secondParticipant?.name || "Conversation";

                  // Is participant online?
                  const isOnline = onlineUsers?.some(
                    (onlineObj) => onlineObj.userId === secondParticipant?.userId
                  );
                  // Is this conv the "active" one?
                  const isActive = conv._id === activeChatId;

                  return (
                    <li
                      key={conv._id}
                      onClick={() => handleSelectConversation(conv._id, secondParticipant?.profilePic, participantName, conv.jobListingRole)}
                      className={`
                        group relative flex items-start gap-3 px-4 py-3 border-b last:border-b-0 border-gray-200 cursor-pointer transform-gpu transition-all duration-300 ease-out
                        ${isActive
                          ? "bg-gradient-to-r from-blue-200 to-white border-l-4 border-blue-400 scale-100 shadow-sm"
                          : "hover:scale-[1.02] hover:bg-gray-50 hover:shadow-md"}
                      `}
                    >
                      {/* Profile Picture + Online Indicator */}
                      <div className="relative">
                        <img src={secondParticipant?.profilePic || "fallback.jpg"} alt="profilePic" className="w-10 h-10 rounded-full object-cover" />
                        {isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />}
                      </div>

                      {/* Conversation Info */}
                      <div className="flex flex-col flex-1">
                        <span className="font-semibold text-gray-800 group-hover:text-gray-900 leading-5">{participantName}</span>
                        {conv.jobListingRole && (
                          <span className="inline-block mt-1 w-fit text-xs text-gray-600 bg-gray-200 px-2 py-0.5 rounded-full">
                            {conv.jobListingRole}
                          </span>
                        )}
                        {lastMessage && (
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500 truncate max-w-[150px]">
                              <b>{lastMessage.senderName}:</b> {lastMessage.text}
                            </span>
                            <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{formattedTime}</span>
                          </div>
                        )}
                      </div>

                      {/* Remove Conversation Button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveConversation(conv._id); }}
                        className="flex-shrink-0 p-1 hover:bg-gray-200 rounded-full transition"
                        aria-label="Remove conversation"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>

                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* 2) Chat Windows */}
        {openChats.map((chat) => (
          <div
            key={chat.id}
            className={`
              border rounded-md shadow-lg bg-white
              transition-all duration-500 ease-in-out
              ${
                chat.minimized
                  ? "w-64 h-12"
                  : "w-[20rem] hover:shadow-xl"
              }
            `}
          >
            {chat.minimized ? (
              // Minimized bar
              <div
                className="
                  bg-gray-50
                  shadow-inner
                  p-2
                  flex
                  items-center
                  justify-between
                  cursor-pointer
                  h-full
                  transition-all
                  duration-300
                "
                onClick={() => handleMinimizeChat(chat.id)}
              >
                <img
                  src={chat?.secondParticipantProfilePic || "fallback.jpg"}
                  alt="Profile"
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span className="font-semibold text-gray-700 text-sm">
                  {chat.title} ({chat.role})
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseChat(chat.id);
                  }}
                  className="text-red-600 hover:text-red-800 transition-colors duration-200"
                >
                  <i className="fa fa-times" />
                </button>
              </div>
            ) : (
              // Not minimized
              <div className="flex flex-col min-h-0 h-[32rem]">
                {/* Chat Header */}
                <div className="bg-gray-200 p-2 flex items-center justify-between transition-all duration-300 hover:bg-gray-300">
                  <img
                    src={chat?.secondParticipantProfilePic || "fallback.jpg"}
                    alt="Profile"
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <span className="font-semibold text-gray-700">
                    {chat.title}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => handleMinimizeChat(chat.id)}>
                      <i className="fa fa-minus" />
                    </button>
                    <button onClick={() => handleCloseChat(chat.id)}>
                      <i className="fa fa-times text-red-600 hover:text-red-800" />
                    </button>
                  </div>
                </div>

                {/* The actual chat layout */}
                <div className="flex-1 flex flex-col min-h-0 transition-all duration-300">
                  <ChatWindow
                    title={"Recruiting a " + chat.role}
                    currentOpenConversationId={chat.id}
                    user={user}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessagingBar;
