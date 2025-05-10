import React, { useState, useEffect, useMemo, useRef, useCallback, useLayoutEffect } from "react";
import ChatWindow from "../../components/ChatWindow"; // This component is wrapped in React.memo
import { FaSpinner } from "react-icons/fa";
import { getCandidateInfo } from "../../utils/auth";
import { useLocation } from "react-router-dom";

const CandidateMessages = ({
  user,
  recruiterId,
  jobListing,
  selectedConversationId: propSelectedConversationId,
  setSelectedConversationId,
  onlineUsers, // Assume onlineUsers is an array of objects, each with { userId, ... }
  selectedCandidate,
  setSelectedCandidate,
  title,
  setTitle,
  darkMode
}) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  // candidateInfoMap maps conversation._id to candidate info
  const [candidateInfoMap, setCandidateInfoMap] = useState({});
  // Store refs for each conversation list item
  const conversationItemRefs = useRef({});
  // Get access to state to check for forceConversationSelect flag
  const { state } = useLocation();
  
  // Use conversation ID from props or from navigation state
  const selectedConversationId = propSelectedConversationId || state?.selectedConversationId;
  
  // When a candidate is selected, update conversation and candidate state
  const handleCandidateSelect = useCallback(async (conversation) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log("handleCandidateSelect called for conversation:", conversation._id);
    }
    setSelectedConversationId(conversation._id);
    // Use prefetched candidate info if available, otherwise fetch it.
    const candidateInfo =
      candidateInfoMap[conversation._id] || (await getCandidateInfo(conversation));
    
    setSelectedCandidate(candidateInfo);
    setTitle(candidateInfo.name);
  }, [candidateInfoMap, setSelectedCandidate, setSelectedConversationId, setTitle]);
  
  // Add a function to directly fetch a specific conversation when needed
  const fetchSpecificConversation = useCallback(async (conversationId) => {
    if (!conversationId) return null;
    
    if (process.env.NODE_ENV !== 'production') {
      console.log("Directly fetching specific conversation:", conversationId);
    }
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/conversations/${conversationId}`,
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
      if (process.env.NODE_ENV !== 'production') {
        console.log("Directly fetched conversation:", data);
      }
      
      // If we found the conversation but it's for a different job listing
      if (data.conversation && data.conversation.jobListingId !== jobListing?._id) {
        if (process.env.NODE_ENV !== 'production') {
          console.log("Conversation is for a different job listing! Need to update job listing.");
        }
        // We should update the job listing, but that's handled at a higher level
      }
      
      return data.conversation;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("Error fetching specific conversation:", error);
      }
      return null;
    }
  }, [jobListing]);
  
  // Direct sync with parent component when using state.selectedConversationId
  useEffect(() => {
    if (!propSelectedConversationId && state?.selectedConversationId) {
      if (process.env.NODE_ENV !== 'production') {
        console.log("🔵 DIRECT SYNC: Setting parent's selectedConversationId from state:", state.selectedConversationId);
      }
      setSelectedConversationId(state.selectedConversationId);
    }
  }, [state?.selectedConversationId, propSelectedConversationId, setSelectedConversationId]);
  
  // Add emergency direct selection of the first conversation
  useEffect(() => {
    if (selectedConversationId && conversations.length === 1 && !selectedCandidate) {
      if (process.env.NODE_ENV !== 'production') {
        console.log("🚨 EMERGENCY: Auto-selecting the only conversation:", conversations[0]._id);
      }
      handleCandidateSelect(conversations[0]);
    }
  }, [conversations, selectedConversationId, selectedCandidate, handleCandidateSelect]);

  // If we have a conversation ID and a single conversation, directly render the chat window
  const directChatRender = useMemo(() => {
    if (selectedConversationId && conversations.length > 0) {
      if (process.env.NODE_ENV !== 'production') {
        console.log("🔴 DIRECT RENDER: Showing chat window for conversation:", selectedConversationId);
      }
      
      // Find the matching conversation
      const targetConvo = conversations.find(c => 
        c._id === selectedConversationId || 
        c._id.toString() === selectedConversationId.toString()
      ) || conversations[0];
      
      // Make sure we have the right profile pics format that ChatWindow expects
      const profilePics = [
        {
          role: "Recruiter",
          id: user._id,
          profilePic: user.profilePic
        },
        {
          role: "JobSeeker",
          id: selectedCandidate?.senderId || targetConvo?.participants[0]?.userId,
          profilePic: selectedCandidate?.profilePic || targetConvo?.participants[0]?.profilePic
        }
      ];
      
      // Instead of bypassing normal flow, let's force a selection to trigger normal rendering
      if (!selectedCandidate && targetConvo) {
        if (process.env.NODE_ENV !== 'production') {
          console.log("🔴 DIRECT RENDER: Force selecting candidate for normal render flow");
        }
        setTimeout(() => {
          handleCandidateSelect(targetConvo);
        }, 0);
      }
      
      return null; // Return null to use normal render flow after selection
    }
    return null;
  }, [selectedConversationId, conversations, user, selectedCandidate, handleCandidateSelect]);

  // Fetch candidate conversations for the given job listing
  useEffect(() => {
    const fetchConversations = async () => {
      if (!jobListing) {
        if (process.env.NODE_ENV !== 'production') {
          console.log("No jobListing provided, cannot fetch conversations");
        }
        
        // If we have a selected conversation ID but no job listing, we need to fetch it directly
        if (selectedConversationId && !selectedCandidate) {
          if (process.env.NODE_ENV !== 'production') {
            console.log("🟡 No job listing but have conversation ID - fetching directly");
          }
          const conversation = await fetchSpecificConversation(selectedConversationId);
          if (conversation) {
            // Create a singleton array with just this conversation
            if (process.env.NODE_ENV !== 'production') {
              console.log("🟡 Got conversation directly, forcing use of it");
            }
            setConversations([conversation]);
          }
        }
        
        return;
      }
      
      if (process.env.NODE_ENV !== 'production') {
        console.log("Fetching conversations for job listing:", jobListing._id);
      }
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
        
        if (process.env.NODE_ENV !== 'production') {
          console.log("Received conversations:", jobListingConversations.length);
        }

        // Filter conversations that have at least one message from a candidate
        const candidateConversations = jobListingConversations.filter(
          (convo) =>
            convo.messages?.length > 0 ||
            (selectedCandidate && convo.participants[0].userId === selectedCandidate?.senderId)
        );
        
        if (process.env.NODE_ENV !== 'production') {
          console.log("Filtered candidate conversations:", candidateConversations.length);
        }
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
        
        // Auto-select the conversation if we have a selectedConversationId
        if (selectedConversationId) {
          if (process.env.NODE_ENV !== 'production') {
            console.log("Auto-selecting conversation:", selectedConversationId);
          }
          const targetConversation = candidateConversations.find(
            convo => convo._id === selectedConversationId
          );
          
          if (targetConversation) {
            if (process.env.NODE_ENV !== 'production') {
              console.log("Found matching conversation, selecting candidate");
            }
            const candidateInfo = await getCandidateInfo(targetConversation);
            setSelectedCandidate(candidateInfo);
            setTitle(candidateInfo.name);
          } else {
            if (process.env.NODE_ENV !== 'production') {
              console.log("No matching conversation found for:", selectedConversationId);
            }
          }
        }
        
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error("Error fetching candidate conversations:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
    
  }, [jobListing, recruiterId, selectedConversationId]);

  // Update the autoSelectCandidate effect to also trigger a click
  useEffect(() => {
    // Wait for conversations to load, then trigger click on the right candidate
    if (selectedConversationId && conversations.length > 0) {
      if (process.env.NODE_ENV !== 'production') {
        console.log("Found conversations:", conversations.length);
        console.log("Selected conversation ID:", selectedConversationId);
        console.log("Available conversation IDs:", conversations.map(c => c._id));
      }
      
      // Find exact match first
      const exactMatch = conversations.find(c => c._id === selectedConversationId);
      
      if (exactMatch) {
        if (process.env.NODE_ENV !== 'production') {
          console.log("Found exact match for conversation:", exactMatch._id);
        }
        
        // We need a slight delay to ensure refs are properly set up
        setTimeout(() => {
          if (process.env.NODE_ENV !== 'production') {
            console.log("BEFORE CLICK - Available refs:", Object.keys(conversationItemRefs.current));
            console.log("Trying to click ref for:", exactMatch._id);
          }
          
          if (conversationItemRefs.current[exactMatch._id]) {
            if (process.env.NODE_ENV !== 'production') {
              console.log("Found ref, clicking on candidate!");
            }
            conversationItemRefs.current[exactMatch._id].click();
          } else {
            if (process.env.NODE_ENV !== 'production') {
              console.log("ERROR: No ref found for conversation:", exactMatch._id);
              console.log("Manually calling handleCandidateSelect");
            }
            // If no ref found, manually call the handler
            handleCandidateSelect(exactMatch);
          }
        }, 500); // Increased timeout to ensure refs are loaded
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.log("ERROR: No exact match found for conversation ID:", selectedConversationId);
        }
        // Try string comparison as fallback
        const stringMatch = conversations.find(c => c._id.toString() === selectedConversationId.toString());
        
        if (stringMatch) {
          if (process.env.NODE_ENV !== 'production') {
            console.log("Found string match for conversation:", stringMatch._id);
          }
          setTimeout(() => {
            if (conversationItemRefs.current[stringMatch._id]) {
              if (process.env.NODE_ENV !== 'production') {
                console.log("Found ref by string match, clicking!");
              }
              conversationItemRefs.current[stringMatch._id].click();
            } else {
              // Manual handler call
              if (process.env.NODE_ENV !== 'production') {
                console.log("Manually calling handleCandidateSelect");
              }
              handleCandidateSelect(stringMatch);
            }
          }, 500);
        } else {
          // Last resort: just use the first conversation if we have any
          if (conversations.length > 0) {
            if (process.env.NODE_ENV !== 'production') {
              console.log("No match found, using first conversation");
            }
            setTimeout(() => {
              handleCandidateSelect(conversations[0]);
            }, 500);
          } else {
            // Emergency: fetch the specific conversation as last resort
            if (process.env.NODE_ENV !== 'production') {
              console.log("No conversations in list, attempting direct fetch");
            }
            fetchSpecificConversation(selectedConversationId).then(conversation => {
              if (conversation) {
                handleCandidateSelect(conversation);
              }
            });
          }
        }
      }
    } else if (selectedConversationId && conversations.length === 0 && !loading) {
      // If we have a selected conversation but no conversations loaded, try direct fetch
      if (process.env.NODE_ENV !== 'production') {
        console.log("No conversations loaded but have selectedConversationId:", selectedConversationId);
      }
      fetchSpecificConversation(selectedConversationId).then(conversation => {
        if (conversation) {
          handleCandidateSelect(conversation);
        }
      });
    }
  }, [selectedConversationId, conversations, handleCandidateSelect, loading, fetchSpecificConversation]);

  // Keep the existing autoSelectCandidate as a fallback
  useEffect(() => {
    const autoSelectCandidate = async () => {
      // Only proceed if we have a conversation ID but no selected candidate
      if (selectedConversationId && !selectedCandidate && conversations.length > 0) {
        if (process.env.NODE_ENV !== 'production') {
          console.log("Auto-selecting candidate for conversation:", selectedConversationId);
        }
        
        // Find the matching conversation
        const matchingConversation = conversations.find(
          convo => convo._id === selectedConversationId
        );
        
        if (matchingConversation) {
          // Use the same logic as handleCandidateSelect
          const candidateInfo = 
            candidateInfoMap[matchingConversation._id] || 
            (await getCandidateInfo(matchingConversation));
          
          setSelectedCandidate(candidateInfo);
          setTitle(candidateInfo.name);
          if (process.env.NODE_ENV !== 'production') {
            console.log("Auto-selected candidate:", candidateInfo.name);
          }
        }
      }
    };
    
    autoSelectCandidate();
  }, [selectedConversationId, selectedCandidate, conversations, candidateInfoMap, setSelectedCandidate, setTitle]);

  // CRITICAL: Use a layout effect to force the selection BEFORE render
  useLayoutEffect(() => {
    const forceDirectSelection = async () => {
      if (selectedConversationId && conversations.length > 0 && !selectedCandidate) {
        if (process.env.NODE_ENV !== 'production') {
          console.log("🔴 FORCE SELECTING conversation ID:", selectedConversationId);
        }
        
        // Find the conversation
        const targetConvo = conversations.find(c => 
          c._id === selectedConversationId || 
          c._id.toString() === selectedConversationId.toString()
        );
        
        if (targetConvo) {
          if (process.env.NODE_ENV !== 'production') {
            console.log("🔴 Found matching conversation:", targetConvo._id);
          }
          
          try {
            // Direct call without clicking
            const candidateInfo = await getCandidateInfo(targetConvo);
            if (process.env.NODE_ENV !== 'production') {
              console.log("🔴 Got candidate info:", candidateInfo?.name);
            }
            
            // Directly update state without clicking
            setSelectedConversationId(targetConvo._id);
            setSelectedCandidate(candidateInfo);
            setTitle(candidateInfo?.name || "Candidate");
            
            if (process.env.NODE_ENV !== 'production') {
              console.log("🔴 FORCED selection complete");
            }
          } catch (err) {
            if (process.env.NODE_ENV !== 'production') {
              console.error("Error in forced selection:", err);
            }
          }
        } else {
          if (process.env.NODE_ENV !== 'production') {
            console.log("🔴 No matching conversation found in list of", conversations.length);
          }
        }
      }
    };
    
    forceDirectSelection();
  }, [conversations, selectedConversationId, selectedCandidate, setSelectedCandidate, setSelectedConversationId, setTitle]);

  // Last resort useEffect to handle the case when everything else fails
  // This runs on every render to check if we have a conversation that should be selected
  useEffect(() => {
    // Only run if we have everything we need except a selected candidate
    if (selectedConversationId && conversations.length > 0 && !selectedCandidate) {
      if (process.env.NODE_ENV !== 'production') {
        console.log("🟠 Last resort effect - conversation should be selected but isn't");
      }
      
      const matchingConvo = conversations.find(
        c => c._id === selectedConversationId || c._id.toString() === selectedConversationId.toString()
      );
      
      if (matchingConvo) {
        if (process.env.NODE_ENV !== 'production') {
          console.log("🟠 Found matching conversation, forcing select");
        }
        handleCandidateSelect(matchingConvo);
      }
    }
  });

  // Direct force selection effect for when coming from notification
  useEffect(() => {
    if (state?.forceConversationSelect && selectedConversationId && conversations.length > 0) {
      if (process.env.NODE_ENV !== 'production') {
        console.log("🟢 forceConversationSelect flag detected with ID:", selectedConversationId);
      }
      
      // Find the conversation
      const targetConvo = conversations.find(c => 
        c._id === selectedConversationId || 
        c._id.toString() === selectedConversationId.toString()
      );
      
      if (targetConvo) {
        if (process.env.NODE_ENV !== 'production') {
          console.log("🟢 Found conversation to force select:", targetConvo._id);
        }
        
        // Directly call select function
        handleCandidateSelect(targetConvo);
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.log("🟢 Conversation not found in list:", selectedConversationId);
          console.log("🟢 Available conversations:", conversations.map(c => c._id));
        }
      }
    }
  }, [state?.forceConversationSelect, conversations, selectedConversationId, handleCandidateSelect]);

  // Auto-select conversation when list first loads
  useEffect(() => {
    // Only run once when conversations are loaded and we have a selectedConversationId
    if (conversations.length > 0 && selectedConversationId && !selectedCandidate) {
      if (process.env.NODE_ENV !== 'production') {
        console.log("🟢 Conversations loaded. Auto-selecting target conversation:", selectedConversationId);
      }
      
      // Find target conversation
      const targetConvo = conversations.find(c => 
        c._id === selectedConversationId || 
        c._id.toString() === selectedConversationId.toString()
      );
      
      if (targetConvo) {
        if (process.env.NODE_ENV !== 'production') {
          console.log("🟢 Found matching conversation in list. Selecting it.");
        }
        handleCandidateSelect(targetConvo);
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.log("🟢 No matching conversation found. Selecting first in list.");
        }
        handleCandidateSelect(conversations[0]);
      }
    }
  }, [conversations, selectedConversationId, selectedCandidate, handleCandidateSelect]);

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
      <div className={`flex items-center justify-center h-full ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Select a candidate to view chat.
      </div>
    );
  }, [selectedConversationId, jobListing, user, selectedCandidate, darkMode]);

  // Add debugging log on render to find any issues
  if (process.env.NODE_ENV !== 'production') {
    console.log("🔍 RENDER CandidateMessages:", {
      selectedConversationId,
      conversationsCount: conversations.length,
      conversationIds: conversations.map(c => c._id),
      selectedCandidate: selectedCandidate?.name,
      availableRefs: Object.keys(conversationItemRefs.current),
      hasForceFlag: !!state?.forceConversationSelect,
      jobListingId: jobListing?._id
    });
  }

  return (
    <div className="w-full h-full flex flex-col">
      {!jobListing ? (
        <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'} p-8`}>
          Please select a job listing to view candidate messages.
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center h-full">
          <FaSpinner className={`animate-spin text-2xl ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
        </div>
      ) : (
        <>
          {/* Top Section: Job Title */}
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'} z-10 flex justify-center items-center shadow-xl p-3`}>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} text-center`}>
              {jobListing.jobRole}
            </h3>
          </div>
          {/* Main Section: Candidate List and Chat Window */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Pane: Candidate List (30% width) */}
            <div className={`w-1/3 border-r ${darkMode ? 'border-gray-700' : 'border-gray-300'} p-4 overflow-y-auto`}>
              <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 text-center`}>
                Candidates
              </h4>
              {conversations.length === 0 ? (
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No messages for this job listing.</p>
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
                        ref={el => conversationItemRefs.current[conversation._id] = el}
                        className={`py-2 px-2 cursor-pointer rounded mb-2 transition-colors duration-200 ${
                          isSelected 
                            ? darkMode ? 'bg-gray-700' : 'bg-gray-200'
                            : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
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
                          <span className={`${darkMode ? 'text-white' : 'text-gray-800'} font-semibold`}>
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
            <div className="w-2/3 p-4 overflow-y-auto">
              {memoizedChatWindow || (
                <div className={`flex items-center justify-center h-full ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
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
