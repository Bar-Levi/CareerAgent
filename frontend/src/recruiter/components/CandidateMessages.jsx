// /components/CandidateMessages.jsx
import React, { useState, useEffect } from "react";
import ChatWindow from "../../components/ChatWindow"; // Adjust path if needed
import { FaSpinner } from "react-icons/fa";

const CandidateMessages = ({ user, recruiterId, jobListing, showNotification, selectedConversationId, setSelectedConversationId, onlineUsers}) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Fetch candidate conversations for the given job listing
  useEffect(() => {
    const fetchConversations = async () => {
      if (!jobListing) return;
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/conversations/jobListing/${jobListing._id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const jobListingConversations = data.jobListingConversations;
        // Filter conversations that have at least one message from a candidate
        const candidateConversations = jobListingConversations.filter((convo) => {
          return convo.messages && convo.messages.some(
            (msg) => msg.senderId.toString() !== recruiterId
          );
        });
        setConversations(candidateConversations);
      } catch (error) {
        console.error("Error fetching candidate conversations:", error);
        showNotification("error", "Failed to fetch candidate conversations.");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [jobListing, recruiterId, showNotification]);

  // Helper: Get candidate info from a conversation by scanning its messages
  const getCandidateInfo = (conversation) => {
    if (!conversation.messages || conversation.messages.length === 0) return null;
    // Find the first message where senderId is not the recruiterId
    const candidateMessage = conversation.messages.find(
      (msg) => msg.senderId.toString() !== recruiterId
    );
    if (candidateMessage) {
      return {
        profilePic: candidateMessage.senderProfilePic,
        name: candidateMessage.senderName,
        senderId: candidateMessage.senderId,
      };
    }
    return null;
  };

  // When a candidate is selected, update both the conversation and candidate state
  const handleCandidateSelect = (conversation) => {
    setSelectedConversationId(conversation._id);
    const candidateInfo = getCandidateInfo(conversation);
    setSelectedCandidate(candidateInfo);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Check if a job listing is selected */}
      {!jobListing ? (
        <div className="text-center text-gray-500">
          Please select a job listing to view candidate messages.
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center h-full">
          <FaSpinner className="animate-spin text-2xl text-gray-700" />
        </div>
      ) : (
        <>
          {/* Top Section: Job Title */}
          <div className="bg-gray-200 z-10 flex justify-center items-center shadow-xl p-3">
            <h3 className="text-xl font-bold text-gray-800 text-center">{jobListing.jobRole}</h3>
          </div>

          {/* Main Section: Split into Candidate List and Chat Window */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Pane: Candidate List (30% width) */}
            <div className="w-1/3 border-r border-gray-300 p-4 overflow-y-auto">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">Candidates</h4>
              {conversations.length === 0 ? (
                <p className="text-gray-500">No messages for this job listing.</p>
              ) : (
                <ul>
                    {conversations.map((conversation) => {
                    const candidateInfo = getCandidateInfo(conversation);
                    const isSelected = conversation._id === selectedConversationId;
                    // Check if candidateInfo.email exists and is in the onlineUsers array
                    const isOnline = candidateInfo?.senderId && onlineUsers.includes(candidateInfo.senderId);
                    console.log("candidateInfo:", candidateInfo);
                    
                    return (
                      <li
                        key={conversation._id}
                        onClick={() => handleCandidateSelect(conversation)}
                        className={`py-2 px-2 cursor-pointer rounded mb-2 ${
                          isSelected ? "bg-gray-200" : "hover:bg-gray-100"
                        } ${isOnline ? "border bg-green-500" : ""}`}
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={candidateInfo?.profilePic || "https://via.placeholder.com/40"}
                            alt={candidateInfo?.name || "Candidate"}
                            className="w-10 h-10 rounded-full"
                          />
                          <span className="text-gray-800 font-semibold">
                            {candidateInfo?.name || "Candidate"}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>

              )}
            </div>
            {/* Right Pane: Chat Window (70% width) */}
            <div 
              className="w-2/3 p-4 overflow-y-auto">
              {selectedConversationId ? (
                <ChatWindow
                  key={jobListing}
                  jobId={jobListing._id}
                  user={user} // Passing recruiter info
                  // Pass candidate name as the job.recruiterName for display in ChatWindow's title
                  job={{ recruiterName: selectedCandidate ? selectedCandidate.name : "Candidate Chat" }}
                  currentOpenConversationId={selectedConversationId}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Select a candidate to view chat.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CandidateMessages;
