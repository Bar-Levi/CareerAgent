// /components/CandidateMessages.jsx
import React, { useState, useEffect } from "react";
import ChatWindow from "../../jobCandidate/SearchJobs/components/ChatWindow"; // Adjust path if needed
import { FaSpinner } from "react-icons/fa";

const CandidateMessages = ({ user, recruiterId, jobListingId, showNotification }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [candidate, setCandidate] = useState(null);

  // Fetch candidate conversations for the given job listing
  useEffect(() => {
    const fetchConversations = async () => {
      if (!jobListingId) return;
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/conversations/jobListing/${jobListingId}`,
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
        // Filter conversations to keep those that have at least one message from a candidate
        const candidateConversations = jobListingConversations.filter((convo) => {
          return convo.messages && convo.messages.some(
            (msg) => msg.senderId.toString() !== recruiterId
          );
        });
        console.log("Candidate conversations:", candidateConversations);
        setConversations(candidateConversations);
      } catch (error) {
        console.error("Error fetching candidate conversations:", error);
        showNotification("error", "Failed to fetch candidate conversations.");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [jobListingId, recruiterId, showNotification]);

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

  // When a candidate is selected, update both selected conversation and candidate state
  const handleCandidateSelect = (conversation) => {
    setSelectedConversationId(conversation._id);
    const candidateInfo = getCandidateInfo(conversation);
    setCandidate(candidateInfo);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {!jobListingId ? (
        <div className="text-center text-gray-500">
          Please select a job listing to view candidate messages.
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center h-full">
          <FaSpinner className="animate-spin text-2xl text-gray-700" />
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Candidate List */}
          <div className="border-b border-gray-300 p-4">
            <h3 className="text-lg font-semibold text-gray-800">Candidate Messages</h3>
            {conversations.length === 0 ? (
              <p className="text-gray-500 mt-2">No messages for this job listing.</p>
            ) : (
              <ul className="mt-2">
                {conversations.map((conversation) => {
                  const candidateInfo = getCandidateInfo(conversation);
                  return (
                    <li
                      key={conversation._id}
                      className="py-2 cursor-pointer hover:bg-gray-100 px-2 rounded"
                      onClick={() => handleCandidateSelect(conversation)}
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
          {/* Chat Window */}
          <div className="flex-1">
            {selectedConversationId ? (
              <ChatWindow
                jobId={jobListingId}
                user={user} // Passing recruiter info
                // Using candidate.name as recruiterName parameter for chat title
                job={{ recruiterName: candidate ? candidate.name : "Candidate Chat" }}
                currentOpenConversationId={selectedConversationId}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a candidate to view chat.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateMessages;
