export const isAuthenticated = (token) => {
    
    if (!token) return false;

    try {
        const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
        return payload.exp * 1000 > Date.now(); // Ensure token is not expired
    } catch {
        return false; // Invalid token format
    }
    
};

// Async helper: Get candidate info from a conversation by scanning its messages
export const getCandidateInfo = async (conversation) => {
    // if (!conversation.messages || conversation.messages.length === 0) return null;

    const jobSeekerId = conversation.participants[1];

    // // Find the first message where senderId is not the recruiterId.
    // const candidateMessage = conversation.messages.find(
    //   (msg) => msg.senderId.toString() !== recruiterId
    // );



      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/personal/name-and-profile-pic?id=${encodeURIComponent(
            jobSeekerId
          )}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch candidate profile picture");
        }
        const data = await response.json();
        
        return {
          profilePic: data.profilePic,
          name: data.name,
          senderId: jobSeekerId,
        };
      } catch (error) {
        console.error("Error fetching profile picture:", error);
        // Fallback to a default value or rethrow the error as needed.
        return {
          profilePic: "",
          name: "",
          senderId: ""
        };
      }
    
    return null;
  };

// export const isAuthenticated = () => {
    
//     const token = localStorage.getItem('token');
//     if (!token) return false;

//     try {
//         const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
//         return payload.exp * 1000 > Date.now(); // Ensure token is not expired
//     } catch {
//         return false; // Invalid token format
//     }
    
// };
