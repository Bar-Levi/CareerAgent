
import React, { useState } from "react";
import { FaSync, FaBan } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ProfileSyncedToggle = ({ isProfileSynced, chatId, token, email }) => {
  const [isSynched, setIsSynched] = useState(isProfileSynced);
  const [isProcessing, setIsProcessing] = useState(false); // New state to track processing
  const navigate = useNavigate();

  const buildSyncProfilePrompt = (user) => {
    const {
      job_role,
      security_clearance,
      education,
      work_experience,
      skills,
      languages,
    } = user.analyzed_cv_content;
  
    const {
      fullName,
      email,
      phone,
      githubUrl,
      linkedinUrl,
      profilePic,
      dateOfBirth,
    } = user;
  
    const educationDetails = education
      .map(
        (edu) =>
          `- ${edu.degree} from ${edu.institution}${
            edu.graduation_year ? `, graduated in ${edu.graduation_year}` : ""
          }`
      )
      .join("\n");
  
    const workExperienceDetails = work_experience
      .map(
        (exp) =>
          `- ${exp.job_title} at ${
            exp.company ? exp.company : "an unspecified company"
          } (${exp.start_year} - ${exp.end_year ? exp.end_year : "Present"})`
      )
      .join("\n");
  
    const skillsList = skills.map((skill) => `- ${skill}`).join("\n");
  
    const languagesDetails = languages
      .map(
        (lang) => `- ${lang.language}: ${lang.proficiency} proficiency`
      )
      .join("\n");
  
    const securityClearanceInfo = security_clearance
      ? `The user holds a security clearance: ${security_clearance}.`
      : `The user does not currently have a security clearance.`;
  
    return `
  [Syncing User Details with the Chatbot]

  The following information is based on the user's profile:
  
  **Personal Information**:
  - Full Name: ${fullName || "Not provided"}
  - Email: ${email || "Not provided"}
  ${phone ? `- Phone: ${phone}` : ""}
  ${dateOfBirth ? `- Date of Birth: ${new Date(dateOfBirth).toLocaleDateString()}` : ""}
  ${githubUrl ? `- GitHub: ${githubUrl}` : ""}
  ${linkedinUrl ? `- LinkedIn: ${linkedinUrl}` : ""}
  ${profilePic ? `- Profile Picture URL: ${profilePic}` : ""}
  
  **Job Roles**:
  ${job_role.map((role) => `- ${role}`).join("\n")}
  
  **Security Clearance**:
  ${securityClearanceInfo}
  
  **Education**:
  ${educationDetails}
  
  **Work Experience**:
  ${workExperienceDetails}
  
  **Skills**:
  ${skillsList}
  
  **Languages**:
  ${languagesDetails}
  
  Please synchronize this profile information with the chatbot to ensure accurate and tailored responses based on the user's background.
    `;
  };

  const handleToggle = async () => {
    if (isProcessing || isSynched) return; // Prevent multiple clicks

    setIsProcessing(true);

    let userData;

    // Fetch user details
    try {
      const user = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/user-details?email=${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (user.ok) {
        userData = await user.json();
      } else if (user.status === 401) {
        navigate("/authentication"); // Redirect if unauthorized
      }
    } catch (error) {
      console.error("Error fetching user verification:", error);
      setIsProcessing(false); // Reset processing state
      return;
    }

    // Update the conversation history
    try {
      const prompt = buildSyncProfilePrompt(userData);
      const userMessage = {
        sender: "user",
        text: prompt,
        timestamp: new Date(),
      };

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/bot-conversations/${chatId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: userMessage,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save the user message");
      }
    } catch (error) {
      console.error("Error saving conversation:", error);
      setIsProcessing(false); // Reset processing state
      return;
    }

    // Update the conversation's isProfileSynced to true
    try {
      await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/bot-conversations/${chatId}/toggleProfileSynced`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsSynched(true); // Sync successful, update state
    } catch (error) {
      console.error("Error syncing profile:", error);
    } finally {
      setIsProcessing(false); // Reset processing state
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isSynched || isProcessing} // Disable while processing or already synced
      className={`flex items-center px-4 py-2 rounded-full border-2 transition-colors ${
        isSynched ? "bg-brand-primary border-brand-accent" : "bg-green-600 border-green-500"
      }`}
    >
      {isSynched ? (
        <FaSync className="text-white mr-2" />
      ) : (
        <FaSync className="text-white mr-2" />
      )}
      <span className="text-white font-medium">
        {isSynched ? "Profile is Synced" : isProcessing ? "Syncing..." : "Sync Profile"}
      </span>
    </button>
  );
};

export default ProfileSyncedToggle;

