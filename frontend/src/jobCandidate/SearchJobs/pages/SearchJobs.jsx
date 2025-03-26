import React, { useState, useEffect } from "react";
import JobListingCardsList from "../components/JobListingCardsList";
import SearchFilters from "../components/SearchFilters";
import NavigationBar from "../../../components/NavigationBar/NavigationBar";
import Modal from "../components/Modal";
import { useLocation, useNavigate } from "react-router-dom";
import Notification from "../../../components/Notification";
import Botpress from "../../../botpress/Botpress";
import { extractTextFromPDF } from "../../../utils/pdfUtils";
import ChatWindow from "../../../components/ChatWindow";
import convertMongoObject from "../../../utils/convertMongoObject";
import JobListingDescription from "../components/JobListingDescription";
import MessagingBar from "../components/MessagingBar";

const SearchJobs = ({onlineUsers}) => {
  // Get state from location and initialize our user state
  const { state } = useLocation();
  const [user, setUser] = useState(state.user);
  const navigate = useNavigate();
  const locationObj = useLocation(); // renamed to avoid conflicts
  const [notification, setNotification] = useState(null);
  const [jobListingsCount, setJobListingsCount] = useState(0);
  const [educationListedOptions, setEducationListedOptions] = useState([]);

  // Initialize conversation and job listing states from notification (if any)
  const [selectedJob, setSelectedJob] = useState(null);

  const [renderingConversationKey, setRenderingConversationKey] = useState(0);
  const [renderingConversationData, setRenderingConversationData] = useState({
    convId: null,
    secondParticipantProfilePic: null,
    participantName: null,
    jobListingRole: null,
  });


  useEffect(() => {
    const stateAddition = localStorage.getItem("stateAddition");
    if (stateAddition) {
      try {
        const parsedAddition = JSON.parse(stateAddition);
        setRenderingConversationData({
          convId: parsedAddition.conversationId,
          secondParticipantProfilePic: parsedAddition.secondParticipantProfilePic,
          participantName: parsedAddition.title,
          jobListingRole: parsedAddition.jobListing.jobRole,
        });
        setRenderingConversationKey((prev) => prev + 1);

        setSelectedJob(convertMongoObject(parsedAddition.jobListing));
      } catch (error) {
        console.error("Error parsing stateAddition:", error);
      } finally {
        localStorage.removeItem("stateAddition");
      }
    } else {
      console.log("No state addition found.");
    }
  }, [state.refreshToken]);

  // Update user state when location state changes
  useEffect(() => {
    if (state && state.user) {
      setUser(state.user);
    }
  }, [state]);

  // Function to show notifications
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const [filters, setFilters] = useState({
    jobRole: "",
    company: "",
    location: "",
    experienceLevel: "",
    companySize: "",
    jobType: "",
    remote: "",
    skills: "",
    languages: "",
    securityClearance: "",
    education: "",
    workExperience: "",
  });

  const [sortingMethod, setSortingMethod] = useState("newest");
  const [showModal, setShowModal] = useState(false);

  // Open the modal if no CV is uploaded
  useEffect(() => {
    if (!user.cv || user.cv === "") {
      setShowModal(true);   
      setSortingMethod("newest");  
    }
  }, [user.cv]);

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      jobRole: "",
      company: "",
      location: "",
      experienceLevel: "",
      companySize: "",
      jobType: "",
      remote: "",
      skills: "",
      languages: "",
      securityClearance: "",
      education: "",
      workExperience: "",
    });
  };

  const handleSelectJob = (job) => {
    console.log("handleSelectJob");
    setSelectedJob(job);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleSortChange = (e) => {
    setSortingMethod(e.target.value);
  };

  // This function is used to handle CV upload.
  // The email is passed via query string.
  // After success, it updates the user state with new cv and analyzed_cv_content.
  const handleCVUpload = async (file) => {
    try {
      // Get token from state or localStorage
      const token = state.token || localStorage.getItem("token");

      // Process the CV file: extract text and send it to our AI endpoint
      const processCV = async (cvFile) => {
        try {
          const cvContent = await extractTextFromPDF(cvFile);
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/ai/generateJsonFromCV`, {
            method: "POST",
            body: JSON.stringify({ prompt: cvContent }),
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
          });
          if (!response.ok) {
            throw new Error("Failed to generate AI CV.");
          }
          const jsonResponse = await response.json();
          const jsonRaw = jsonResponse.response;
          const match = jsonRaw.match(/```json\n([\s\S]+?)\n```/);
          if (!match) {
            throw new Error("Invalid JSON format in response.");
          }
          const jsonString = match[1];
          const prettyJson = JSON.parse(jsonString);
          return prettyJson;
        } catch (error) {
          console.error("Error processing CV:", error.message);
          throw error;
        }
      };

      // Process file to get analyzed content
      const analyzedContent = await processCV(file);

      // Build form data for upload
      const formData = new FormData();
      formData.append("cv", file);
      formData.append("analyzed_cv_content", JSON.stringify(analyzedContent));

      // Call our update endpoint
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/personal/jobseeker/cv/update?email=${encodeURIComponent(user.email)}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error("Failed to upload CV.");
      }
      const data = await response.json();

      // Build our updated user object with new cv and analyzed_cv_content
      const updatedUser = {
        ...user,
        cv: data.cv,
        analyzed_cv_content: analyzedContent
      };
      // Build new state including the full user object
      const newState = {
        user: updatedUser,
        isVerified: user.isVerified,
        refreshToken: 0
      };
      // Update our local user state and navigate to the same page with new state
      setUser(updatedUser);
      navigate(locationObj.pathname, { state: newState });
      showNotification("success", "CV uploaded successfully!");
      setShowModal(false);
    } catch (error) {
      console.error("Error uploading CV:", error);
      showNotification("error", "Failed to upload CV. Please try again.");
    }
  };

  return (
    <div key={state.refreshToken} className="bg-gray-100 h-screen flex flex-col">
      <NavigationBar userType={state?.user?.role}/>
      <Botpress />
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-4 p-6 max-w-7xl mx-auto overflow-hidden">
        {/* Left Area */}
        <div className="bg-white rounded shadow lg:col-span-1 h-full overflow-y-auto">
          <SearchFilters
            filters={filters}
            setFilters={handleFilterChange}
            clearFilters={handleClearFilters}
            educationListedOptions={educationListedOptions}
          />
        </div>

        {/* Central Area */}
        <div className="relative bg-white rounded shadow lg:col-span-2 h-full overflow-y-auto">
          <MessagingBar
            user={user}
            onlineUsers={onlineUsers}
            renderingConversationData={renderingConversationData}
            renderingConversationKey={renderingConversationKey}
            />
          <div className="flex sticky top-0 z-10">
            <div className="w-full flex sticky top-0 items-center justify-between p-4 bg-brand-primary text-brand-accent text-2xl font-bold">
              <h1>Search Results</h1>
              <div className="relative flex">
                {/* Sorting Dropdown */}
                <select
                  value={sortingMethod}
                  onChange={handleSortChange}
                  className="text-sm px-2 py-1 w-fit border rounded text-gray-700 bg-white shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option disabled={!user.analyzed_cv_content} value="relevance">
                    Most Relevant First
                  </option>
                  <option value="saved">Saved</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>

                <div className="relative group cursor-help">
                  {/* Custom Tooltip */}
                  <span className="text-white text-lg">
                    <i className="ml-1 fa fa-info-circle" />
                  </span>
                  {user.analyzed_cv_content ? (
                    <div className="absolute right-0 top-full mt-2 hidden group-hover:block bg-white text-gray-700 text-sm rounded-lg shadow-lg p-4 w-64 border border-gray-300">
                      <p className="text-lg font-bold mb-3 border-b pb-2">
                        Analyzed CV Content
                      </p>
                      <ul className="list-none pl-0 space-y-1">
                        {/* Job Roles */}
                        <li>
                          <strong className="block text-blue-600">Job Roles:</strong>
                          <span>
                            {Array.isArray(user.analyzed_cv_content.job_role) &&
                            user.analyzed_cv_content.job_role.length > 0
                              ? user.analyzed_cv_content.job_role.join(", ")
                              : "None"}
                          </span>
                        </li>
                        {/* Security Clearance */}
                        <li>
                          <strong className="block text-blue-600">
                            Security Clearance:
                          </strong>
                          <span>
                            {user.analyzed_cv_content.security_clearance ||
                              "None"}
                          </span>
                        </li>
                        {/* Education */}
                        <li>
                          <strong className="block text-blue-600">Education:</strong>
                          {Array.isArray(user.analyzed_cv_content.education) &&
                          user.analyzed_cv_content.education.length > 0 ? (
                            user.analyzed_cv_content.education.map((edu, index) => (
                              <span key={index} className="block">
                                {edu.degree} from{" "}
                                <span className="font-medium">
                                  {edu.institution}
                                </span>
                              </span>
                            ))
                          ) : (
                            <span>None</span>
                          )}
                        </li>
                        {/* Work Experience */}
                        <li>
                          <strong className="block text-blue-600">
                            Work Experience:
                          </strong>
                          {Array.isArray(user.analyzed_cv_content.work_experience) &&
                          user.analyzed_cv_content.work_experience.length > 0 ? (
                            user.analyzed_cv_content.work_experience.map(
                              (exp, index) => {
                                const yearsOfExperience =
                                  (exp.end_year || new Date().getFullYear()) -
                                  exp.start_year;
                                return (
                                  <span key={index} className="block">
                                    {exp.job_title}{" "}
                                    <span className="font-medium">
                                      at {exp.company} ({exp.start_year} -{" "}
                                      {exp.end_year || "Present"}) -{" "}
                                      {yearsOfExperience} year(s)
                                    </span>
                                  </span>
                                );
                              }
                            )
                          ) : (
                            <span>None</span>
                          )}
                        </li>
                        {/* Skills */}
                        <li>
                          <strong className="block text-blue-600">Skills:</strong>
                          <span>
                            {Array.isArray(user.analyzed_cv_content.skills) &&
                            user.analyzed_cv_content.skills.length > 0
                              ? user.analyzed_cv_content.skills.length > 5
                                ? user.analyzed_cv_content.skills
                                    .slice(0, -1)
                                    .join(", ") + ", " + user.analyzed_cv_content.skills[user.analyzed_cv_content.skills.length - 1]
                                : user.analyzed_cv_content.skills.join(", ")
                              : "None"}
                          </span>
                        </li>
                      </ul>
                    </div>
                  ) : (
                    <div className="absolute right-0 top-full mt-2 hidden group-hover:block bg-white text-gray-700 text-sm rounded-lg shadow-lg p-4 w-64 border border-gray-300">
                      <p className="text-sm text-gray-500">
                        No analyzed CV content found.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <span className="py-1 px-2 bg-green-500 text-white text-sm font-semibold rounded transition-all">
                Found {jobListingsCount} results
              </span>
            </div>
          </div>
          <JobListingCardsList
            key={`${user.cv}-${JSON.stringify(filters)}`}
            filters={filters}
            onJobSelect={setSelectedJob}
            user={user}
            setUser={setUser}
            setShowModal={setShowModal}
            showNotification={showNotification}
            setJobListingsCount={setJobListingsCount}
            sortingMethod={sortingMethod}
            setEducationListedOptions={setEducationListedOptions}
            setRenderingConversationKey={setRenderingConversationKey}
            setRenderingConversationData={setRenderingConversationData}
            />
        </div>

        {/* Right Area */}
        <div className="bg-white p-4 rounded shadow lg:col-span-1 h-full overflow-y-auto hidden lg:block">
          { selectedJob &&
              <JobListingDescription jobListing={selectedJob} />
          }
        </div>

      </div>

      {showModal && (
        <Modal
          title="Upload Your CV"
          message="To enjoy a better experience, please upload your CV."
          onClose={handleModalClose}
          onConfirm={handleCVUpload}
          confirmText="Upload CV"
          showNotification={showNotification}
        />
      )}
    </div>
  );
};

export default SearchJobs;
