import React, { useState, useEffect } from "react";
import JobListingCardsList from "../components/JobListingCardsList";
import SearchFilters from "../components/SearchFilters";
import NavigationBar from "../../../components/NavigationBar";
import Modal from "../components/Modal";
import { useLocation, useNavigate } from "react-router-dom";
import Notification from "../../../components/Notification";
import Botpress from "../../../botpress/Botpress";
import { extractTextFromPDF } from '../../../utils/pdfUtils';



const SearchJobs = () => {
  const { state } = useLocation();
  const [user, setUser] = useState(state.user);
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [jobListingsCount, setJobListingsCount] = useState(0);

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
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!user.cv || user.cv === "") {
      setShowModal(true);
    }
  }, [user.cv]);

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const handleClearFilters = () => {
    console.log("Clear filters");
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
  }

  const handleJobSelect = (job) => {
    setSelectedJob(job);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleCVUpload = async (file) => {

    const processCV = async (cvFile) => {
            try {
                const cvContent = await extractTextFromPDF(cvFile); // Extract text from the PDF
    
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/ai/generateJsonFromCV`, {
                    method: 'POST',
                    body: JSON.stringify({
                        prompt: cvContent,
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
    
                if (!response.ok) {
                    throw new Error('Failed to generate AI CV.');
                }
    
                const jsonResponse = await response.json();
    
                // Extract and clean the JSON from the response string
                const jsonRaw = jsonResponse.response;
    
                // Safeguard for JSON extraction in case the expected format is not met
                const match = jsonRaw.match(/```json\n([\s\S]+?)\n```/);
                if (!match) {
                    throw new Error('Invalid JSON format in response.');
                }
    
                const jsonString = match[1]; // Extract JSON between code block markers
                const prettyJson = JSON.parse(jsonString); // Parse the JSON string
    
          
                console.dir(prettyJson, {depth: null})
                return prettyJson; // Return the processed JSON
            } catch (error) {
                console.error('Error processing CV:', error.message);
                throw error; // Re-throw the error for further handling
            }
        };

    const uploadFile = async (file, folder) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const uploadResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/cloudinary/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to Cloudinary.");
      }

      const data = await uploadResponse.json();
      return data.url;
    };

    try {
      // Upload to cloudinary and save the cloudinary url.
      const filePathOnCloudinary = await uploadFile(file, "cvs");
      const formData = new FormData();
      formData.append("cv", filePathOnCloudinary);

      // Analyze the CV and save the analyzed content.
      let prettyJson = null;
      try {

        prettyJson = await processCV(file); // Process the updated CV file
  
        console.dir(prettyJson, {depth: null})

        // Update the formData with analyzed_cv_content
        formData.append('analyzed_cv_content', JSON.stringify(prettyJson));

      } catch (error) {
          console.error('Error analyzing CV:', error.message);
      }
        

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/upload-cv/${user._id}`,
        {
          method: "PATCH",
          body: formData,
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload CV.");
      }

      state.user.cv = filePathOnCloudinary;
      state.user.analyzed_cv_content = prettyJson;
      showNotification("success", "CV uploaded successfully!");

      navigate('/searchjobs', { state: state })
      

      setShowModal(false); // Close the modal
    } catch (error) {
      console.error("Error uploading CV:", error);
      showNotification("error", "Failed to upload CV. Please try again.");
    }
  };

  return (
    <div className="bg-gray-100 h-screen flex flex-col">
      <NavigationBar userType={state.user.role} />
      <Botpress />
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-4 p-6 max-w-7xl mx-auto overflow-hidden">
        <div className="bg-white rounded shadow lg:col-span-1 h-full overflow-y-auto">
          <SearchFilters
            filters={filters}
            setFilters={handleFilterChange}
            clearFilters={handleClearFilters}
          />
        </div>
        <div className="relative bg-white rounded shadow lg:col-span-2 h-full overflow-y-auto">

          <div className="flex sticky top-0">
            <div className="w-full flex sticky top-0 items-center justify-between p-4 bg-brand-primary text-brand-accent text-2xl font-bold">
              <h1>Search Jobs</h1>
              {/* Clear Filters Button */}
              <span
                className="py-1 px-2 bg-green-500 text-white text-sm font-semibold rounded hover:bg-red-600 transition-all"
              >
                Found {jobListingsCount} results
              </span>
            </div>

         </div>

          <JobListingCardsList
            key={`${user.cv}-${JSON.stringify(filters)}`} // Unique key for dynamic updates
            filters={filters}
            onJobSelect={handleJobSelect}
            user={user}
            setUser={setUser}
            setShowModal={setShowModal}
            showNotification={showNotification}
            setJobListingsCount={setJobListingsCount}
          />
        </div>
        <div className="bg-white p-4 rounded shadow lg:col-span-1 h-full overflow-y-auto hidden lg:block">
          {selectedJob ? (
            <div>
              <h2 className="text-xl font-bold mb-2">{selectedJob.jobRole}</h2>
              <p className="text-sm text-gray-600">
                {selectedJob.company} - {selectedJob.location}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Experience: {selectedJob.experienceLevel}
              </p>
              <p className="text-sm text-gray-500">
                Type: {selectedJob.jobType.join(", ")}
              </p>
              <p className="mt-4">{selectedJob.description}</p>
            </div>
          ) : (
            <p className="text-gray-500">Select a job to view details.</p>
          )}
        </div>
      </div>
      {showModal && (
        <Modal
          title="Upload Your CV"
          message="To enjoy better experience, please upload your CV."
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
