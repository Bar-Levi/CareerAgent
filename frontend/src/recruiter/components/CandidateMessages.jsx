import React, { useState, useEffect, useMemo } from "react";
import ChatWindow from "../../components/ChatWindow"; // This component is wrapped in React.memo
import { FaSpinner } from "react-icons/fa";
import { getCandidateInfo } from "../../utils/auth";

const CandidateMessages = ({
  user,
  recruiterId,
  jobListing,
  selectedConversationId,
  setSelectedConversationId,
  onlineUsers, // Assume onlineUsers is an array of objects, each with { userId, ... }
  selectedCandidate,
  setSelectedCandidate,
  title,
  setTitle
}) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  // candidateInfoMap maps conversation._id to candidate info
  const [candidateInfoMap, setCandidateInfoMap] = useState({});


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
        const candidateConversations = jobListingConversations.filter(
          (convo) =>
            convo.messages ||
            convo.participants[1].userId === selectedCandidate?.senderId
        );
        
        
        setConversations(candidateConversations);

        // Prefetch candidate info for each conversation and build a map
        const candidateInfoResults = await Promise.all(
          candidateConversations.map(async (convo) => {
            const info = await getCandidateInfo(convo);
            return { id: convo._id, info };
          })
        );
        const infoMap = candidateInfoResults.reduce((acc, { id, info }) => {
          acc[id] = info;
          return acc;
        }, {});
        setCandidateInfoMap(infoMap);
      } catch (error) {
        console.error("Error fetching candidate conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
    
    
  }, [jobListing, recruiterId, selectedCandidate]);

  // When a candidate is selected, update conversation and candidate state
  const handleCandidateSelect = async (conversation) => {
    setSelectedConversationId(conversation._id);
    // Use prefetched candidate info if available, otherwise fetch it.
    const candidateInfo =
      candidateInfoMap[conversation._id] || (await getCandidateInfo(conversation));
    
    setSelectedCandidate(candidateInfo);
    setTitle(candidateInfo.name);
  };

  // Memoize the ChatWindow so that it only re-renders when its own props change.
  const memoizedChatWindow = useMemo(() => {
    
    const profilePics = [
      {
        role: "Recruiter",
        id: user._id,
        profilePic: user.profilePic
      },
      {
        role: "JobSeeker",
        id: selectedCandidate?.senderId,
        profilePic: selectedCandidate?.profilePic
      }
    ] || [];
    return selectedConversationId ? (
      <ChatWindow
        key={jobListing ? jobListing._id : "none"}
        jobId={jobListing ? jobListing._id : null}
        user={user} // Passing recruiter info
        profilePics={profilePics}
        title={title ? title : "Chat with Candidate"}
        currentOpenConversationId={selectedConversationId}
      />
    ) : (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select a candidate to view chat.
      </div>
    );
  }, [selectedConversationId, jobListing, user, selectedCandidate]);

  return (
    <div className="w-full h-full flex flex-col">
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
            <h3 className="text-xl font-bold text-gray-800 text-center">
              {jobListing.jobRole}
            </h3>
          </div>
          {/* Main Section: Candidate List and Chat Window */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Pane: Candidate List (30% width) */}
            <div className="w-1/3 border-r border-gray-300 p-4 overflow-y-auto">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Candidates
              </h4>
              {conversations.length === 0 ? (
                <p className="text-gray-500">No messages for this job listing.</p>
              ) : (
                <ul>
                  {conversations.map((conversation) => {
                    // Use prefetched candidate info from our map
                    const candidateInfo = candidateInfoMap[conversation._id];
                    
                    const isSelected = conversation._id === selectedConversationId;
                    // Check if candidate is online based on senderId
                    const isOnline =
                      candidateInfo?.senderId &&
                      onlineUsers
                        .map((userObj) => userObj.userId)
                        .includes(candidateInfo.senderId);
                    return (
                      <li
                        key={conversation._id}
                        onClick={() => handleCandidateSelect(conversation)}
                        className={`py-2 px-2 cursor-pointer rounded mb-2 transition-colors duration-200 ${
                          isSelected ? "bg-gray-200" : "hover:bg-gray-100"
                        } ${isOnline ? "border border-green-500 shadow-lg" : "border border-transparent"}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <img
                              src={
                                candidateInfo?.profilePic ||
                                'https://res.cloudinary.com/careeragent/image/upload/v1735084555/default_profile_image.png'
                              }
                              alt={candidateInfo?.name || "Candidate"}
                              className="w-10 h-10 rounded-full"
                            />
                            {isOnline && (
                              <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                            )}
                          </div>
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
            <div className="w-2/3 p-4 overflow-y-auto">{memoizedChatWindow}</div>
          </div>
        </>
      )}
    </div>
  );
};

export default CandidateMessages;
