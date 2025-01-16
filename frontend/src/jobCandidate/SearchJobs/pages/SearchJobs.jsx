import React, { useState, useEffect } from "react";
import JobListingCardsList from "../components/JobListingCardsList";
import SearchFilters from "../components/SearchFilters";
import NavigationBar from "../../../components/NavigationBar";
import Modal from "../components/Modal";
import { useLocation } from "react-router-dom";

const SearchJobs = () => {
  const { state } = useLocation();
  const [filters, setFilters] = useState({
    jobRole: "",
    location: "",
    experienceLevel: "",
    jobType: "",
  });
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const handleJobSelect = (job) => {
    setSelectedJob(job);
  };

  useEffect(() => {
    if (!state.user.cv || state.user.cv == "") {
      setShowModal(true); // Show modal if CV is missing
    }
  }, [state]);

  const handleModalClose = () => {
    setShowModal(false);
  };

  

  const handleCVUpload = async (file) => {

    const uploadFile = async (file, folder) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const uploadResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cloudinary/upload`, {
            method: 'POST',
            body: formData,
        });
        if (!uploadResponse.ok) {
            throw new Error('Failed to upload file to Cloudinary.');
        }

        const data = await uploadResponse.json();
        return data.url;
    };

    try {
      const formData = new FormData();
      const filePathOnCloudinary = await uploadFile(file, 'cvs');
      formData.append("cv", filePathOnCloudinary);

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/upload-cv/${state.user._id}`,
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

      alert("CV uploaded successfully!");
      state.user.cv = filePathOnCloudinary; // Update the user's CV in the state
      setShowModal(false); // Close the modal
    } catch (error) {
      console.error("Error uploading CV:", error);
      alert("Failed to upload CV. Please try again.");
    }
  };

  return (
    <div className="bg-gray-100 h-screen flex flex-col">
      <NavigationBar userType={state.user.role} />
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-4 p-6 max-w-7xl mx-auto overflow-hidden">
        <div className="bg-white rounded shadow lg:col-span-1 h-full overflow-y-auto">
          <SearchFilters filters={filters} setFilters={handleFilterChange} />
        </div>
        <div className="relative bg-white rounded shadow lg:col-span-2 h-full overflow-y-auto">
          <h1 className="p-4 sticky top-0 bg-brand-primary text-brand-accent text-2xl font-bold">
            Search Jobs
          </h1>
          <JobListingCardsList 
            filters={filters}
            onJobSelect={handleJobSelect}
            user={state.user}
            setShowModal={setShowModal}
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
          message="To enjoy better functionality, please upload your CV."
          onClose={handleModalClose}
          onConfirm={handleCVUpload}
          confirmText="Upload CV"
        />
      )}
    </div>
  );
};

export default SearchJobs;
