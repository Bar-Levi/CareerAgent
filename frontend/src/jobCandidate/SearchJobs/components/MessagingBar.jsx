import React, { useState, useEffect } from "react";
import ChatWindow from "../../../components/ChatWindow";

const MessagingBar = ({ user, setTitle, onlineUsers }) => {
  // Collapsible conversation panel open/closed
  const [isOpen, setIsOpen] = useState(false);

  // All possible conversation previews for this user
  const [conversations, setConversations] = useState([]);

  // Array of open chats, each: { id, title, minimized: boolean }
  const [openChats, setOpenChats] = useState([]);

  // Toggle the conversation list open/closed
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
        setConversations(data.conversations || []);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };
    fetchConversations();
  }, [user?._id]);

  useEffect(() => {
    console.log("Online Users: ", onlineUsers);
  }, [onlineUsers]);
  /**
   * handleSelectConversation:
   * 1) If conversation is already open, reorder it to the end (the "front").
   *    - Also un-minimize it if it was minimized.
   * 2) If it's brand new, push it at the end as minimized=false.
   * 3) If >2 are un-minimized, minimize the oldest other one.
   * 4) If the array length >3, remove the oldest from the entire array.
   */
  const handleSelectConversation = (conversationId, conversationTitle, conversationRole) => {
    setOpenChats((prev) => {
      let updated = [...prev];

      // 1) Check if it already exists
      const existingIndex = updated.findIndex((c) => c.id === conversationId);
      if (existingIndex !== -1) {
        // Move existing chat to the end
        const [existingChat] = updated.splice(existingIndex, 1);
        existingChat.minimized = false; // un-minimize if it was minimized
        updated.push(existingChat);
      } else {
        // 2) Otherwise, open a new chat
        const newChat = {
          id: conversationId,
          title: conversationTitle,
          role: conversationRole,
          minimized: false,
        };
        updated.push(newChat);
      }

      // 3) If more than 2 un-minimized, minimize the oldest other one
      const unMinimized = updated.filter((c) => !c.minimized);
      if (unMinimized.length > 2) {
        // We'll minimize the first un-minimized from the left (except the newly opened last item)
        for (let i = 0; i < updated.length; i++) {
          // skip the last item (the newly opened) if it's un-minimized
          if (i === updated.length - 1) break;
          if (!updated[i].minimized) {
            updated[i].minimized = true;
            break;
          }
        }
      }

      // 4) If we now have more than 3 total in the array, remove the oldest entirely
      if (updated.length > 3) {
        // Remove the leftmost item
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
  // (No special logic here besides flipping minimized.)
  const handleMinimizeChat = (conversationId) => {
    setOpenChats((prev) =>
      prev.map((chat) =>
        chat.id === conversationId
          ? { ...chat, minimized: !chat.minimized }
          : chat
      )
    );
  };

  return (
    /**
     * PARENT CONTAINER:
     *  - fixed at bottom-right
     *  - display: flex
     *  - align-items: flex-end ensures all children align at the bottom edge
     *  - gap for spacing
     */
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
      {/**
       * Child container with `flex-row-reverse` so the newest chat is on the right.
       * Use `items-end` to anchor them at the bottom.
       */}
      <div className="flex flex-row-reverse items-end gap-2">
        {/* 1) Conversation List */}
        <div
          className={`
            border border-gray-300 shadow-md bg-white
            ${isOpen ? "rounded-t-lg" : "rounded-lg"}
            cursor-pointer
          `}
          style={{ width: "300px" }}
        >
          {/* Header that toggles open/close */}
          <div
            className={`flex items-center p-2 ${
              isOpen ? "rounded-b-none" : "rounded-b-lg"
            }`}
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
              className={`fa fa-chevron-${isOpen ? "down" : "up"} text-gray-600`}
            />
          </div>

          {/* If open, show conversation list */}
          {isOpen && (
            <div className="h-64 overflow-y-auto flex flex-col border-t border-gray-300">
              {/* Optional search bar */}
              <div className="p-2 border-b flex justify-between items-center">
                <input
                  className="flex-1 border px-2 py-1 rounded text-sm"
                  placeholder="Search messages"
                />
              </div>

              {/* Conversation List */}
              <ul className="flex-1 overflow-y-auto divide-y divide-gray-200">
                {conversations.map((conv) => {
                  const secondParticipant = conv?.participants?.[1];
                  const { lastMessage } = conv || {};
                  const formattedTime = lastMessage?.timestamp
                    ? new Date(lastMessage.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "";
                  const participantName = secondParticipant?.name || "Conversation";

                  return (
                    <li
                    key={conv._id}
                    onClick={() => {
                      handleSelectConversation(conv._id, participantName, conv.jobListingRole);
                      setTitle?.(participantName);
                    }}
                    className="
                      group
                      flex items-start gap-3
                      px-4 py-3
                      border-b last:border-b-0 border-gray-100
                      hover:bg-gray-50
                      cursor-pointer
                      transition-colors duration-200
                    "
                  >
                    {/* Profile Picture + Online Indicator */}
                    <div className="relative">
                      <img
                        src={secondParticipant?.profilePic || 'fallback.jpg'}
                        alt="profilePic"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {/* Online Dot */}
                      {onlineUsers?.some(
                        (onlineObj) => onlineObj.userId === secondParticipant?.userId
                      ) && (
                        <span
                          className="
                            absolute
                            bottom-0 right-0
                            w-3 h-3
                            bg-green-500
                            border-2 border-white
                            dark:border-gray-800
                            rounded-full
                          "
                        />
                      )}
                    </div>
                  
                    {/* Conversation Info */}
                    <div className="flex flex-col flex-1">
                      {/* Participant Name & Role Badge */}
                      <span className="font-semibold text-gray-800 group-hover:text-gray-900 leading-5">
                        {participantName}
                      </span>
                      {conv.jobListingRole && (
                        <span className="
                          inline-block
                          mt-1
                          w-fit
                          text-xs
                          text-gray-600
                          bg-gray-200
                          px-2
                          py-0.5
                          rounded-full
                        ">
                          {conv.jobListingRole}
                        </span>
                      )}
                  
                      {/* Last Message (if any) */}
                      {lastMessage && (
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500 truncate max-w-[150px]">
                            {lastMessage.senderName}: {lastMessage.text}
                          </span>
                          <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                            {formattedTime}
                          </span>
                        </div>
                      )}
                    </div>
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
              transition-all duration-500
              ${chat.minimized ? "w-64 h-12" : "w-[20rem]"}
            `}
          >
            {chat.minimized ? (
              // Minimized bar
              <div
                className="bg-gray-200 p-2 flex items-center justify-between cursor-pointer h-full"
                onClick={() => handleMinimizeChat(chat.id)}
              >
                <span className="font-semibold text-gray-700 text-sm">
                  {chat.title}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseChat(chat.id);
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <i className="fa fa-times" />
                </button>
              </div>
            ) : (
              // Not minimized
              <div className="flex flex-col min-h-0 h-[32rem]">
                {/* Chat Header */}
                <div className="bg-gray-200 p-2 flex items-center justify-between">
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
                <div className="flex-1 flex flex-col min-h-0">
                  <ChatWindow
                    title={"Recruiting for " + chat.role}
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
